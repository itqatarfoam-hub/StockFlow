class AutoLogoutManager {
    constructor(timeoutMinutes = 30) {
        this.timeoutMinutes = timeoutMinutes;
        this.warningMinutes = 2;
        this.timer = null;
        this.warningTimer = null;
        this.init();
    }

    init() {
        this.resetTimer();

        // Track user activity
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
            document.addEventListener(event, () => this.resetTimer(), true);
        });
    }

    resetTimer() {
        clearTimeout(this.timer);
        clearTimeout(this.warningTimer);

        const timeoutMs = this.timeoutMinutes * 60 * 1000;
        const warningMs = (this.timeoutMinutes - this.warningMinutes) * 60 * 1000;

        // Show warning 2 minutes before logout
        this.warningTimer = setTimeout(() => this.showWarning(), warningMs);

        // Auto logout
        this.timer = setTimeout(() => this.logout(), timeoutMs);
    }

    showWarning() {
        const stay = confirm(
            `⚠️ Inactivity Warning\n\nYou will be logged out in ${this.warningMinutes} minutes due to inactivity.\n\nClick OK to stay logged in.`
        );

        if (stay) {
            this.resetTimer();
        }
    }

    logout() {
        alert('🔒 You have been logged out due to inactivity.');
        window.location.href = '/api/auth/logout';
    }

    updateTimeout(newTimeoutMinutes) {
        this.timeoutMinutes = newTimeoutMinutes;
        this.resetTimer();
    }
}

// Initialize on page load (after login)
if (sessionStorage.getItem('loggedIn') === 'true') {
    // Fetch timeout from settings
    fetch('/api/settings/auto-logout')
        .then(res => res.json())
        .then(data => {
            const timeout = data.auto_logout_minutes || 30;
            window.autoLogoutManager = new AutoLogoutManager(timeout);
            console.log(`✅ Auto-logout enabled (${timeout} minutes)`);
        })
        .catch(err => {
            console.error('Failed to load auto-logout settings:', err);
            // Use default 30 minutes
            window.autoLogoutManager = new AutoLogoutManager(30);
        });
}