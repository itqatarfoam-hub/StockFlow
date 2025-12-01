// ============================================
// STOCKFLOW - SETTINGS MODULE
// Author: itqatarfoam-hub
// Date: 2025-11-23 04:25:48 UTC
// ============================================

const settingsModule = {
  // Load login settings (includes company info)
  async loadLoginSettings() {
    try {
      const [settingsResponse, companyResponse] = await Promise.all([
        fetch('/api/login-settings'),
        fetch('/api/company-info')
      ]);

      const settingsData = await settingsResponse.json();
      const companyData = await companyResponse.json();

      const settings = settingsData.settings || {};
      const companyInfo = companyData.info || {};

      return {
        logo: settings.logo || '📊',
        title: settings.title || 'StockFlow',
        subtitle: settings.subtitle || 'Inventory & Sales Management',
        demo_label: settings.demo_label || 'Demo Credentials',
        company_name: companyInfo.company_name || '',
        contact_email: companyInfo.contact_email || '',
        phone_number: companyInfo.phone_number || '',
        logo_path: companyInfo.logo_path || ''
      };
    } catch (error) {
      console.error('Failed to load login settings:', error);
      return {
        logo: '📊',
        title: 'StockFlow',
        subtitle: 'Inventory & Sales Management',
        demo_label: 'Demo Credentials',
        company_name: '',
        contact_email: '',
        phone_number: '',
        logo_path: ''
      };
    }
  },

  // Save login settings
  async saveLoginSettings(settings) {
    try {
      const response = await fetch('/api/login-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify(settings)
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to save settings'
        };
      }
    } catch (error) {
      console.error('Save settings error:', error);
      return {
        success: false,
        error: 'Network error'
      };
    }
  }
};

window.settingsModule = settingsModule;