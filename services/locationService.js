const { v4: uuidv4 } = require('uuid');
const { db } = require('../config/database');

const locationService = {
    async getAllLocations() {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM locations ORDER BY name ASC', [], (err, rows) => {
                if (err) {
                    return reject(err);
                }
                resolve(rows);
            });
        });
    },

    async getLocationById(id) {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM locations WHERE id = ?', [id], (err, row) => {
                if (err) {
                    return reject(err);
                }
                resolve(row);
            });
        });
    },

    async createLocation(locationData) {
        return new Promise((resolve, reject) => {
            const { name, description } = locationData;

            // Check if location name already exists
            db.get('SELECT * FROM locations WHERE name = ?', [name], (err, existingLocation) => {
                if (err) {
                    return reject(err);
                }

                if (existingLocation) {
                    return resolve({ success: false, error: 'Location name already exists' });
                }

                const id = uuidv4();

                db.run(
                    'INSERT INTO locations (id, name, description) VALUES (?, ?, ?)',
                    [id, name, description],
                    function (err) {
                        if (err) {
                            return reject(err);
                        }

                        resolve({ success: true, id });
                    }
                );
            });
        });
    },

    async updateLocation(id, locationData) {
        return new Promise((resolve, reject) => {
            const { name, description } = locationData;

            db.run(
                'UPDATE locations SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
                [name, description, id],
                function (err) {
                    if (err) {
                        return reject(err);
                    }

                    if (this.changes === 0) {
                        return resolve({ success: false, error: 'Location not found' });
                    }

                    resolve({ success: true });
                }
            );
        });
    },

    async deleteLocation(id) {
        return new Promise((resolve, reject) => {
            // Check if location has products
            db.get('SELECT COUNT(*) as count FROM products WHERE location_id = ?', [id], (err, result) => {
                if (err) {
                    return reject(err);
                }

                if (result.count > 0) {
                    return resolve({ success: false, error: 'Cannot delete location with existing products' });
                }

                db.run('DELETE FROM locations WHERE id = ?', [id], function (err) {
                    if (err) {
                        return reject(err);
                    }

                    if (this.changes === 0) {
                        return resolve({ success: false, error: 'Location not found' });
                    }

                    resolve({ success: true });
                });
            });
        });
    }
};

module.exports = locationService;
