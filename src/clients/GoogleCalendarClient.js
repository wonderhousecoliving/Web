const { google } = require('googleapis');

class GoogleCalendarClient {
    constructor(credentials) {
        this.calendar = google.calendar({ version: 'v3' });
        this.auth = new google.auth.OAuth2(
            credentials.clientId,
            credentials.clientSecret,
            credentials.redirectUri
        );
        this.auth.setCredentials({
            refresh_token: credentials.refreshToken
        });
    }

    async deleteEvent(calendarId, eventId) {
        try {
            console.log('Attempting to delete event:', {
                calendarId,
                eventId
            });
            if (eventId == null) {
                console.log('No event ID found');
                return null;
            }
            const response = await this.calendar.events.delete({
                auth: this.auth,
                calendarId,
                eventId
            });

            console.log('Event deleted successfully');
            return response.data;
        } catch (error) {
            console.error('Error deleting event:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            throw new Error(`Failed to delete calendar event: ${error.message}`);
        }
    }

    async createEvent(calendarId, eventDetails) {
        try {
            console.log('Attempting to create event with auth:', {
                clientId: this.auth._clientId,
                refreshToken: this.auth.credentials.refresh_token ? 'exists' : 'missing'
            });

            const event = {
                summary: eventDetails.summary,
                description: eventDetails.description,
                start: eventDetails.start,
                end: eventDetails.end,
                attendees: eventDetails.attendees || [],
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 24 * 60 },
                        { method: 'popup', minutes: 30 },
                    ],
                },
            };

            console.log('Creating event with details:', {
                calendarId,
                eventSummary: event.summary,
                startTime: event.start,
                endTime: event.end
            });

            const response = await this.calendar.events.insert({
                auth: this.auth,
                calendarId,
                resource: event,
            });

            console.log('Event created successfully:', response.data.htmlLink);
            return response.data;
        } catch (error) {
            console.error('Detailed error creating event:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                stack: error.stack
            });
            throw new Error(`Failed to create calendar event: ${error.message}`);
        }
    }

    async createCalendarReservation(calendarId, reservation) {
        const eventDetails =reservation.toCalendarEvent();
        return this.createEvent(calendarId, eventDetails);
    }

    async deleteCalendarReservation(calendarId, reservationId) {
        try {
            console.log('Searching for event with reservation ID:', reservationId);

            // Buscar eventos que coincidan con el ID de reserva
            const response = await this.calendar.events.list({
                auth: this.auth,
                calendarId,
                q: reservationId, // Busca en el título y descripción
                timeMin: new Date().toISOString(),
                maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime'
            });

            const events = response.data.items;
            console.log(`Found ${events.length} potential matching events`);

            // Buscar el evento que tenga el ID de reserva en la descripción
            const matchingEvent = events.find(event => 
                event.description && event.description.includes(`Reservation ID: ${reservationId}`)
            );

            if (matchingEvent) {
                console.log('Found matching event, deleting...');
                return await this.deleteEvent(calendarId, matchingEvent.id);
            } else {
                console.log('No matching event found');
                return null;
            }
        } catch (error) {
            console.error('Error finding/deleting event:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            throw new Error(`Failed to find/delete calendar event: ${error.message}`);
        }
    }

    async findCalendarReservation(calendarId, reservation, checkDates = false) {
        try {
         //   console.log('Searching for event with reservation ID:', reservation.reservationId);

            const response = await this.calendar.events.list({
                auth: this.auth,
                calendarId,
                q: `Reservation ID: ${reservation.reservationId}`, // Busca específicamente este patrón
                timeMin: new Date().toISOString(),
                maxResults: 10,
                singleEvents: true,
                orderBy: 'startTime'
            });

            const events = response.data.items;
           // console.log(`Found ${events.length} potential matching events`);

            // Buscar el evento que tenga exactamente el patrón de ID de reserva
            const matchingEvent = events.find(event => {
                const hasMatchingId = event.description && 
                    event.description.includes(`Reservation ID: ${reservation.reservationId}`);
                
                if (!hasMatchingId) return false;
                
                if (checkDates) {
                    const eventStart = new Date(event.start.dateTime).getTime();
                    const eventEnd = new Date(event.end.dateTime).getTime();
                    const reservationStart = new Date(reservation.start).getTime();
                    const reservationEnd = new Date(reservation.end).getTime();
                    
                    console.log('Comparing dates:', {
                        event: { start: event.start.dateTime, end: event.end.dateTime },
                        reservation: { start: reservation.start, end: reservation.end }
                    });
                    
                    return eventStart === reservationStart && eventEnd === reservationEnd;
                }
                
                return true;
            });

            if (matchingEvent) {
                // console.log('Found matching event:', {
                //     eventId: matchingEvent.id,
                //     summary: matchingEvent.summary,
                //     start: matchingEvent.start.dateTime,
                //     end: matchingEvent.end.dateTime
                // });
                return matchingEvent.id;
            } else {
                // console.log('No matching event found for reservation ID:', reservation.reservationId);
                return null;
            }
        } catch (error) {
            console.error('Error finding event by reservation ID:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            throw new Error(`Failed to find event by reservation ID: ${error.message}`);
        }
    }

    async clearCalendar(calendarId) {
        try {
            console.log('Attempting to clear calendar:', calendarId);

            // Obtener todos los eventos del calendario
            const response = await this.calendar.events.list({
                auth: this.auth,
                calendarId,
                timeMin: new Date().toISOString(),
                singleEvents: true,
                orderBy: 'startTime'
            });

            const events = response.data.items;
            console.log(`Found ${events.length} events to delete`);

            // Eliminar cada evento
            const deletePromises = events.map(event => 
                this.deleteEvent(calendarId, event.id)
            );

            await Promise.all(deletePromises);
            console.log(`Successfully deleted ${events.length} events from calendar ${calendarId}`);
            
            return {
                success: true,
                deletedCount: events.length
            };
        } catch (error) {
            console.error('Error clearing calendar:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
            throw new Error(`Failed to clear calendar: ${error.message}`);
        }
    }
} 

module.exports = GoogleCalendarClient; 