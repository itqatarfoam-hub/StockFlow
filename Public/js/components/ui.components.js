// ====================================================
// STOCKFLOW - UI COMPONENTS
// Common UI elements and helpers
// ====================================================

const UIComponents = {

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const colors = {
            success: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
            error: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
            warning: { bg: '#fef3c7', text: '#854d0e', border: '#fcd34d' },
            info: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' }
        };

        const color = colors[type] || colors.info;
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };

        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${color.bg};
            color: ${color.text};
            padding: 16px 24px;
            border-radius: 8px;
            border: 2px solid ${color.border};
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 600;
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
        `;
        toast.innerHTML = `${icons[type]} ${message}`;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    /**
     * Show loading spinner
     */
    showLoading(containerId = 'app') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; min-height: 400px; flex-direction: column;">
                <div class="spinner" style="width: 48px; height: 48px; border: 4px solid #f3f4f6; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                <p style="margin-top: 16px; color: #6b7280;">Loading...</p>
            </div>
            <style>
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            </style>
        `;
    },

    /**
     * Show error message
     */
    showError(message, containerId = 'app') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 64px; margin-bottom: 16px;">❌</div>
                <h2 style="margin: 0 0 12px 0; color: #ef4444;">Error</h2>
                <p style="color: #6b7280;">${message}</p>
                <button onclick="window.location.reload()" 
                        style="margin-top: 20px; padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    Reload Page
                </button>
            </div>
        `;
    },

    /**
     * Show empty state
     */
    showEmptyState(icon, title, message, buttonText = null, buttonAction = null) {
        let button = '';
        if (buttonText && buttonAction) {
            button = `
                <button onclick="${buttonAction}" 
                        style="margin-top: 20px; padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                    ${buttonText}
                </button>
            `;
        }

        return `
            <div style="text-align: center; padding: 60px 20px;">
                <div style="font-size: 64px; margin-bottom: 16px; opacity: 0.5;">${icon}</div>
                <h3 style="margin: 0 0 12px 0; color: #374151;">${title}</h3>
                <p style="color: #6b7280;">${message}</p>
                ${button}
            </div>
        `;
    },

    /**
     * Create badge
     */
    createBadge(text, type = 'default') {
        const colors = {
            success: { bg: '#dcfce7', text: '#166534', border: '#86efac' },
            error: { bg: '#fee2e2', text: '#991b1b', border: '#fca5a5' },
            warning: { bg: '#fef3c7', text: '#854d0e', border: '#fcd34d' },
            info: { bg: '#dbeafe', text: '#1e40af', border: '#93c5fd' },
            default: { bg: '#f3f4f6', text: '#374151', border: '#d1d5db' }
        };

        const color = colors[type] || colors.default;

        return `
            <span style="display: inline-block; padding: 4px 12px; background: ${color.bg}; color: ${color.text}; border: 1px solid ${color.border}; border-radius: 12px; font-size: 12px; font-weight: 600;">
                ${text}
            </span>
        `;
    },

    /**
     * Create button
     */
    createButton(text, onClick, type = 'primary', icon = '') {
        const styles = {
            primary: 'background: #667eea; color: white;',
            secondary: 'background: #f3f4f6; color: #374151;',
            success: 'background: #10b981; color: white;',
            danger: 'background: #ef4444; color: white;',
            warning: 'background: #f59e0b; color: white;'
        };

        return `
            <button onclick="${onClick}" 
                    style="${styles[type] || styles.primary} padding: 12px 24px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                ${icon} ${text}
            </button>
        `;
    },

    /**
     * Create card
     */
    createCard(title, content, actions = '') {
        return `
            <div class="card" style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); margin-bottom: 20px;">
                ${title ? `<h3 style="margin: 0 0 16px 0;">${title}</h3>` : ''}
                <div>${content}</div>
                ${actions ? `<div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #e5e7eb;">${actions}</div>` : ''}
            </div>
        `;
    },

    /**
     * Format date
     */
    formatDate(date) {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    },

    /**
     * Format currency
     */
    formatCurrency(amount, currency = 'QAR') {
        if (amount === null || amount === undefined) return 'N/A';
        return `${currency} ${parseFloat(amount).toFixed(2)}`;
    },

    /**
     * Get initials from name
     */
    getInitials(name) {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    },

    /**
     * Create avatar
     */
    createAvatar(name, size = 48) {
        const initials = this.getInitials(name);
        return `
            <div style="width: ${size}px; height: ${size}px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: ${size / 2.5}px; font-weight: 700;">
                ${initials}
            </div>
        `;
    },

    /**
     * Create search input
     */
    createSearchInput(id, placeholder, onSearch) {
        return `
            <div style="position: relative;">
                <input type="text" id="${id}" placeholder="${placeholder}" 
                       onkeyup="${onSearch}"
                       style="width: 100%; padding: 12px 16px 12px 40px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; transition: all 0.3s;"
                       onfocus="this.style.borderColor='#667eea'"
                       onblur="this.style.borderColor='#e5e7eb'">
                <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); font-size: 18px; color: #9ca3af;">🔍</span>
            </div>
        `;
    },

    /**
     * Create table
     */
    createTable(headers, rows) {
        const headerHTML = headers.map(h => `<th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #374151;">${h}</th>`).join('');
        const rowsHTML = rows.map(row =>
            `<tr style="border-bottom: 1px solid #f3f4f6;">${row.map(cell =>
                `<td style="padding: 12px;">${cell}</td>`
            ).join('')}</tr>`
        ).join('');

        return `
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr>${headerHTML}</tr>
                    </thead>
                    <tbody>${rowsHTML}</tbody>
                </table>
            </div>
        `;
    }
};

// Export for global use
window.UIComponents = UIComponents;
