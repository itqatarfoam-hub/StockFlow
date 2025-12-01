// ============================================
// LOCATIONS MODULE - API Interactions
// Author: itqatarfoam-hub
// ============================================

const locationsModule = {
    async loadLocations() {
        try {
            const res = await fetch('/api/locations', {
                credentials: 'same-origin'
            });

            const data = await res.json();

            if (!res.ok) {
                console.error('❌ Failed to load locations:', data.error);
                return [];
            }

            return data.locations || [];
        } catch (error) {
            console.error('❌ Error loading locations:', error);
            return [];
        }
    },

    async createLocation(locationData) {
        try {
            const res = await fetch('/api/locations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify(locationData)
            });

            const result = await res.json();

            return {
                success: res.ok,
                error: result.error,
                id: result.id
            };
        } catch (error) {
            console.error('❌ Error creating location:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    async updateLocation(id, locationData) {
        try {
            const res = await fetch(`/api/locations/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'same-origin',
                body: JSON.stringify(locationData)
            });

            const result = await res.json();

            return {
                success: res.ok,
                error: result.error
            };
        } catch (error) {
            console.error('❌ Error updating location:', error);
            return {
                success: false,
                error: error.message
            };
        }
    },

    async deleteLocation(id) {
        try {
            const res = await fetch(`/api/locations/${id}`, {
                method: 'DELETE',
                credentials: 'same-origin'
            });

            const result = await res.json();

            return {
                success: res.ok,
                error: result.error
            };
        } catch (error) {
            console.error('❌ Error deleting location:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
};
