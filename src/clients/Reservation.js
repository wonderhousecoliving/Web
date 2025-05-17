const fs = require('fs');
const csv = require('csv-parse/sync');

class Reservation {
    static calendarMappings = new Map();
    static mappingsLoaded = false;

    static async loadCalendarMappings() {
        if (this.mappingsLoaded) return;

        try {
            const fileContent = fs.readFileSync('./src/RoomCalendars.csv', 'utf-8');
            const records = csv.parse(fileContent, {
                columns: true,
                skip_empty_lines: true
            });

            // Limpiar el mapa actual
            this.calendarMappings.clear();

            

            // Cargar los nuevos mapeos
            records.forEach(record => {
                const key = `${record.ListingId}_${record.UnitId}`;
                this.calendarMappings.set(key, record.CalendarId);
            });

            console.log(`Loaded ${this.calendarMappings.size} calendar mappings`);
            this.mappingsLoaded = true;
        } catch (error) {
            console.error('Error loading calendar mappings:', error);
            throw new Error(`Failed to load calendar mappings: ${error.message}`);
        }
    }

    static getGoogleCalendarId(listingId, unitId) {
        if (!this.mappingsLoaded) {
            this.loadCalendarMappings();
        }

        const key = `${listingId}_${unitId}`;
        const calendarId = this.calendarMappings.get(key);
        
        if (!calendarId) {
            console.warn(`No calendar mapping found for listingId: ${listingId}, unitId: ${unitId}`);
            return null;
        }
        
        return calendarId;
    }

    constructor({
        listingId,
        unitId,
        reservationId,
        guestName,
        start,
        end,
        status,
        reservationUnit = []
    }) {
        this.listingId = listingId;
        this.unitId = unitId;
        this.reservationId = reservationId;
        this.guestName = guestName;
        this.start = start;
        this.end = end;
        this.status = status;
        this.reservationUnit = reservationUnit;
    }

    static fromHostawayResponse(reservation, listingId) {
        return new Reservation({
            listingId: listingId,
            unitId: reservation.reservationUnit?.[0]?.listingUnitId,
            reservationId: reservation.id,
            guestName: reservation.guestName,
            start: reservation.arrivalDate,
            end: reservation.departureDate,
            status: reservation.status,
            reservationUnit: reservation.reservationUnit || []
        });
    }

    toCalendarEvent() {
        // Asegurarnos de que las fechas tengan el formato correcto con hora
        const startDate = new Date(this.start);
        const endDate = new Date(this.end);
        
        // Establecer la hora de check-in a las 3 PM y check-out a las 11 AM
        startDate.setHours(15, 0, 0, 0); // 3:00 PM
        endDate.setHours(11, 0, 0, 0);   // 11:00 AM

        return {
            summary: `Reservation ${this.reservationId}: ${this.guestName}`,
            description: `Reservation ID: ${this.reservationId}\nStatus: ${this.status}`,
            start: {
                dateTime: startDate.toISOString(),
                timeZone: 'Europe/Madrid'
            },
            end: {
                dateTime: endDate.toISOString(),
                timeZone: 'Europe/Madrid'
            },
            attendees: [
                { 
                    displayName: this.guestName,
                    email: 'hello@wonderhousecoliving.com', // Email requerido por Google Calendar
                    responseStatus: 'accepted'
                }
            ]
        };
    }

    getCalendarId() {
        return Reservation.getGoogleCalendarId(this.listingId, this.unitId);
    }

   
}

module.exports = Reservation; 