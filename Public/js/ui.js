// ============================================
// UI MODULE
// User interface helper functions
// ============================================

const ui = {
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }
  },

  showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = message;
      element.style.display = 'block';
    }
  },

  hideError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.textContent = '';
      element.style.display = 'none';
    }
  },

  showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = '<div class="loading-spinner"></div>';
      element.disabled = true;
    }
  },

  hideLoading(elementId, originalText) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = originalText;
      element.disabled = false;
    }
  }
};

window.ui = ui;