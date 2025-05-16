import fetch from 'node-fetch';

class HostawayAPI {
    constructor() {
        this.baseUrl = 'https://api.hostaway.com/v1';
        this.clientId = process.env.HOSTAWAY_CLIENT_ID;
        this.clientSecret = process.env.HOSTAWAY_CLIENT_SECRET;
        this.accessToken = null;
    }

    async getAccessToken() {
        try {
            const params = new URLSearchParams({
                grant_type: 'client_credentials',
                client_id: this.clientId,
                client_secret: this.clientSecret,
                scope: 'general'
            });

            const response = await fetch(`${this.baseUrl}/accessTokens`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params
            });

            if (!response.ok) {
                throw new Error('Error al obtener el token de acceso');
            }

            const data = await response.json();
            this.accessToken = data.access_token;
            return this.accessToken;
        } catch (error) {
            console.error('Error en getAccessToken:', error);
            throw error;
        }
    }

    async getListings() {
        try {
            if (!this.accessToken) {
                await this.getAccessToken();
            }

            const response = await fetch(`${this.baseUrl}/listings`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener los listings');
            }

            const data = await response.json();
            return data.result;
        } catch (error) {
            console.error('Error en getListings:', error);
            throw error;
        }
    }

    async getListingById(listingId) {
        try {
            if (!this.accessToken) {
                await this.getAccessToken();
            }

            const response = await fetch(`${this.baseUrl}/listings/${listingId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`Error al obtener el listing ${listingId}`);
            }

            const data = await response.json();
            return data.result;
        } catch (error) {
            console.error('Error en getListingById:', error);
            throw error;
        }
    }

    async getListingAvailability(listingId, startDate, endDate) {
        try {
            if (!this.accessToken) {
                await this.getAccessToken();
            }

            const response = await fetch(`${this.baseUrl}/listings/${listingId}/availability`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    startDate,
                    endDate
                })
            });

            if (!response.ok) {
                throw new Error(`Error al obtener la disponibilidad del listing ${listingId}`);
            }

            const data = await response.json();
            return data.result;
        } catch (error) {
            console.error('Error en getListingAvailability:', error);
            throw error;
        }
    }
}

export default HostawayAPI; 