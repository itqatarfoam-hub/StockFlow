// ====================================================
// STOCKFLOW - DATA OPERATIONS
// CRUD operations and data management
// ====================================================

const DataOperations = {

    /**
     * Fetch data from API
     */
    async fetchData(endpoint, options = {}) {
        try {
            const response = await fetch(endpoint, {
                credentials: 'include',
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            return { success: false, error: error.message };
        }
    },

    /**
     * Create record
     */
    async create(endpoint, data) {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                UIComponents.showToast(result.message || 'Created successfully', 'success');
                return { success: true, data: result };
            } else {
                UIComponents.showToast(result.message || 'Failed to create', 'error');
                return { success: false, error: result.message };
            }
        } catch (error) {
            console.error('Create error:', error);
            UIComponents.showToast('Network error', 'error');
            return { success: false, error: error.message };
        }
    },

    /**
     * Update record
     */
    async update(endpoint, id, data) {
        try {
            const response = await fetch(`${endpoint}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                UIComponents.showToast(result.message || 'Updated successfully', 'success');
                return { success: true, data: result };
            } else {
                UIComponents.showToast(result.message || 'Failed to update', 'error');
                return { success: false, error: result.message };
            }
        } catch (error) {
            console.error('Update error:', error);
            UIComponents.showToast('Network error', 'error');
            return { success: false, error: error.message };
        }
    },

    /**
     * Delete record
     */
    async delete(endpoint, id, confirmMessage = 'Are you sure you want to delete this item?') {
        if (!confirm(confirmMessage)) {
            return { success: false, cancelled: true };
        }

        try {
            const response = await fetch(`${endpoint}/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            const result = await response.json();

            if (result.success) {
                UIComponents.showToast(result.message || 'Deleted successfully', 'success');
                return { success: true, data: result };
            } else {
                UIComponents.showToast(result.message || 'Failed to delete', 'error');
                return { success: false, error: result.message };
            }
        } catch (error) {
            console.error('Delete error:', error);
            UIComponents.showToast('Network error', 'error');
            return { success: false, error: error.message };
        }
    },

    /**
     * Load list with cache
     */
    async loadList(endpoint, cacheKey, refreshCache = false) {
        // Check cache first
        if (!refreshCache && this.cache && this.cache[cacheKey]) {
            const cached = this.cache[cacheKey];
            const age = Date.now() - cached.timestamp;

            // Cache valid for 5 minutes
            if (age < 5 * 60 * 1000) {
                return { success: true, data: cached.data, fromCache: true };
            }
        }

        // Fetch fresh data
        const result = await this.fetchData(endpoint);

        if (result.success) {
            // Update cache
            if (!this.cache) this.cache = {};
            this.cache[cacheKey] = {
                data: result.data,
                timestamp: Date.now()
            };
        }

        return result;
    },

    /**
     * Clear cache
     */
    clearCache(cacheKey = null) {
        if (cacheKey) {
            if (this.cache) delete this.cache[cacheKey];
        } else {
            this.cache = {};
        }
    },

    /**
     * Search in array
     */
    searchArray(array, searchTerm, fields) {
        if (!searchTerm) return array;

        const term = searchTerm.toLowerCase();
        return array.filter(item => {
            return fields.some(field => {
                const value = this.getNestedValue(item, field);
                return value && value.toString().toLowerCase().includes(term);
            });
        });
    },

    /**
     * Filter array
     */
    filterArray(array, filters) {
        return array.filter(item => {
            return Object.keys(filters).every(key => {
                const filterValue = filters[key];
                if (!filterValue || filterValue === '') return true;

                const itemValue = this.getNestedValue(item, key);
                return itemValue === filterValue;
            });
        });
    },

    /**
     * Sort array
     */
    sortArray(array, field, direction = 'asc') {
        return [...array].sort((a, b) => {
            const aVal = this.getNestedValue(a, field);
            const bVal = this.getNestedValue(b, field);

            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    },

    /**
     * Get nested value from object
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => current?.[key], obj);
    },

    /**
     * Paginate array
     */
    paginate(array, page = 1, perPage = 10) {
        const start = (page - 1) * perPage;
        const end = start + perPage;

        return {
            data: array.slice(start, end),
            totalPages: Math.ceil(array.length / perPage),
            currentPage: page,
            totalItems: array.length,
            perPage
        };
    },

    /**
     * Validate form data
     */
    validateForm(formData, rules) {
        const errors = {};

        Object.keys(rules).forEach(field => {
            const value = formData[field];
            const fieldRules = rules[field];

            // Required check
            if (fieldRules.required && (!value || value.trim() === '')) {
                errors[field] = `${fieldRules.label || field} is required`;
                return;
            }

            // Min length
            if (fieldRules.minLength && value && value.length < fieldRules.minLength) {
                errors[field] = `${fieldRules.label || field} must be at least ${fieldRules.minLength} characters`;
                return;
            }

            // Max length
            if (fieldRules.maxLength && value && value.length > fieldRules.maxLength) {
                errors[field] = `${fieldRules.label || field} must be no more than ${fieldRules.maxLength} characters`;
                return;
            }

            // Email validation
            if (fieldRules.email && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    errors[field] = `${fieldRules.label || field} must be a valid email`;
                    return;
                }
            }

            // Number validation
            if (fieldRules.number && value) {
                if (isNaN(value)) {
                    errors[field] = `${fieldRules.label || field} must be a number`;
                    return;
                }
            }

            // Custom validation
            if (fieldRules.custom && value) {
                const customError = fieldRules.custom(value);
                if (customError) {
                    errors[field] = customError;
                    return;
                }
            }
        });

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    },

    /**
     * Export to CSV
     */
    exportToCSV(data, filename = 'export.csv') {
        if (data.length === 0) {
            UIComponents.showToast('No data to export', 'warning');
            return;
        }

        const headers = Object.keys(data[0]);
        const csv = [
            headers.join(','),
            ...data.map(row => headers.map(field => {
                const value = row[field] || '';
                return `"${value.toString().replace(/"/g, '""')}"`;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.URL.revokeObjectURL(url);

        UIComponents.showToast('Exported successfully', 'success');
    }
};

// Export for global use
window.DataOperations = DataOperations;
