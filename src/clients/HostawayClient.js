// hostaway-client.js
const axios = require('axios');
const GoogleCalendarClient = require('./GoogleCalendarClient.js');
const fs = require('fs');
const csv = require('csv-parse/sync');
const Reservation = require('./Reservation.js');

class HostawayClient {
  constructor({ clientId, clientSecret }) {
    console.log("Initializing HostawayClient");
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.baseUrl = 'https://api.hostaway.com/v1';
    this.token = null;
    this.tokenExpiration = null;
    this.calendarMappings = new Map();
    
    // Initialize Google Calendar client with OAuth2 credentials
    this.googleCalendar = new GoogleCalendarClient({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN
    });

    
    
   this.checkAllReservations();
  }


  async checkAllReservations() {
   let reservation = new Reservation(1,1,1,"test","2025-05-17","2025-05-18","test");
   Reservation.loadCalendarMappings();
   for(const calendarMapping of Reservation.calendarMappings.entries()) {
    console.log("Calendar mapping:", calendarMapping);
    this.googleCalendar.clearCalendar(calendarMapping[1]);
   }
    const listings = await this.getListings();
    for (const listing of listings) {
      console.log("Listing found:", listing.name);
      console.log("Checking reservations...");
     await this.checkReservationsAndPushToCalendar(listing.id);
     console.log("Reservations checked and pushed to calendar.");
     console.log("--------------------------------");
    }
  }
  
  async checkReservationsAndPushToCalendar(listingId) {
    const reservations = await this.getListingReservationsFromHostaway(listingId);
   
    for (const hostAwayReservation of reservations) {
   
      if(hostAwayReservation.reservationUnit?.length > 0) {
        for (const unit of hostAwayReservation.reservationUnit) {      
          const reservationObj = Reservation.fromHostawayResponse(hostAwayReservation, listingId);
          console.log("creating Event for reservation:", reservationObj.reservationId, reservationObj.guestName);    
           await this.createCalendarReservation(listingId, unit.listingUnitId, reservationObj);
         
        }
      }
    }
  }
  

  async createCalendarReservation(listingId, unitId, reservation) {
    const calendarId = reservation.getCalendarId();
    //let's check if the reservation already exists in the calendar and has the same dates than our reservation object
    const calenderReservation = await this.findCalendarReservationFromReservation(reservation);
    if(calenderReservation) {
      console.log("Reservation already exists in the calendar:", reservation.reservationId);
      return;
    }
    return this.googleCalendar.createCalendarReservation(calendarId, reservation);
  }

  async getListingReservationsFromHostaway(listingId) {
    await this.ensureAuthenticated();

    const response = await axios.get(`${this.baseUrl}/reservations`, {
      headers: { Authorization: `Bearer ${this.token}` },
      params: {
        listingId,
        includeResources: 1,
        limit: 10,
        isArchived: false,
        sortOrder:'arrivalDate'

      }
    });
    return response.data.result;
  }




  async deleteReservation(calendarId, reservationId) {
    const eventId = await this.googleCalendar.findCalendarReservation(calendarId, reservationId);
    console.log("Event ID:", eventId);
    if (eventId) {
      await this.googleCalendar.deleteEvent(calendarId, eventId);
    }
  }

  async deleteCalendarReservation(listingId, unitId, reservationId) {
    const calendarId = this.getGoogleCalendarId(listingId, unitId);
    if (!calendarId) {
      throw new Error(`No calendar mapping found for listingId: ${listingId}, unitId: ${unitId}`);
    }

    return this.googleCalendar.deleteCalendarReservation(calendarId, reservationId);
  }

  async findCalendarReservationFromReservation(reservation) {
    const calendarId =reservation.getCalendarId();
    return this.googleCalendar.findCalendarReservation(calendarId, reservation, false);
  }

  async authenticate() {  
    try {
      const body = new URLSearchParams();
      body.append('grant_type', 'client_credentials');
      body.append('client_id', this.clientId);
      body.append('client_secret', this.clientSecret);
      body.append('scope', 'general');
      const response = await axios.post(`${this.baseUrl}/accessTokens`, body.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      this.token = response.data.access_token;
      console.log('Token obtained successfully');
    } catch (error) {
      console.error('Authentication error:', error.response?.data || error.message);
      throw new Error('We could not authenticate with Hostaway');
    }
  }

  async ensureAuthenticated() {
    if (!this.token || !this.tokenExpiration || Date.now() >= this.tokenExpiration) {
      await this.authenticate();
    }
  }

  async getListings({ limit = 20, offset = 0, sortOrder = 'asc', city = '', country = '' } = {}) {
    try {
      await this.ensureAuthenticated();

      const response = await axios.get(`${this.baseUrl}/listings`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Cache-Control': 'no-cache'
        },
        params: {
          limit,
          offset,
          sortOrder,
          city,
          country
        }
      });

      if (!response.data || !response.data.result) {
        throw new Error('Invalid response from Hostaway API');
      }
      return response.data.result;
    } catch (error) {
      console.error('Error fetching listings:', error.response?.data || error.message);
      throw new Error('Failed to fetch listings from Hostaway API');
    }
  }

  
}

module.exports = HostawayClient;
