// ============================================
// REPORTS MODULE
// Handle report generation and printing
// ============================================

const reportsModule = {
    // Generate date-wise report
    async generateDateReport(dateType, startDate, endDate) {
        try {
            const params = new URLSearchParams({
                type: 'date',
                dateType: dateType,
                startDate: startDate || '',
                endDate: endDate || ''
            });

            const res = await fetch(`/api/reports/date?${params}`, {
                credentials: 'same-origin'
            });

            const data = await res.json();
            return { success: res.ok, data: data.data || [], error: data.error };
        } catch (error) {
            console.error('Error generating date report:', error);
            return { success: false, error: error.message };
        }
    },

    // Generate category-wise report
    async generateCategoryReport(categoryId) {
        try {
            const params = new URLSearchParams({
                type: 'category',
                categoryId: categoryId || 'all'
            });

            const res = await fetch(`/api/reports/category?${params}`, {
                credentials: 'same-origin'
            });

            const data = await res.json();
            return { success: res.ok, data: data.data || [], summary: data.summary, error: data.error };
        } catch (error) {
            console.error('Error generating category report:', error);
            return { success: false, error: error.message };
        }
    },

    // Generate product-wise report
    async generateProductReport(productId) {
        try {
            const params = new URLSearchParams({
                type: 'product',
                productId: productId || 'all'
            });

            const res = await fetch(`/api/reports/product?${params}`, {
                credentials: 'same-origin'
            });

            const data = await res.json();
            return { success: res.ok, data: data.data || [], summary: data.summary, error: data.error };
        } catch (error) {
            console.error('Error generating product report:', error);
            return { success: false, error: error.message };
        }
    },

    // Generate stock movement report
    async generateStockMovementReport(startDate, endDate) {
        try {
            const params = new URLSearchParams({
                startDate: startDate || '',
                endDate: endDate || ''
            });

            const res = await fetch(`/api/reports/stock-movements?${params}`, {
                credentials: 'same-origin'
            });

            const data = await res.json();
            return { success: res.ok, data: data.data || [], error: data.error };
        } catch (error) {
            console.error('Error generating stock movement report:', error);
            return { success: false, error: error.message };
        }
    }
};

window.reportsModule = reportsModule;
