// ====================================================
// STOCKFLOW - MODALS RENDERS
// Shared modal components and dialogs
// ====================================================

const ModalsRenders = {

    /**
     * Generic confirmation modal
     */
    renderConfirmModal(title, message, confirmText = 'Confirm', cancelText = 'Cancel') {
        return `
      <div class="modal-overlay" id="confirmModal" onclick="if(event.target === this) this.remove()">
        <div class="modal-content" style="max-width: 500px; background: white; border-radius: 12px; padding: 32px; position: relative;" onclick="event.stopPropagation()">
          <button class="modal-close" onclick="document.getElementById('confirmModal').remove()" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 24px; cursor: pointer; color: #9ca3af;">×</button>
          
          <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
            <h2 style="margin: 0 0 12px 0; color: #1f2937;">${title}</h2>
            <p style="margin: 0; color: #6b7280;">${message}</p>
          </div>
          
          <div style="display: flex; gap: 12px; justify-content: center;">
            <button onclick="document.getElementById('confirmModal').remove()" 
                    style="padding: 12px 32px; background: #e5e7eb; color: #374151; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
              ${cancelText}
            </button>
            <button id="confirmButton"
                    style="padding: 12px 32px; background: #ef4444; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
              ${confirmText}
            </button>
          </div>
        </div>
      </div>
    `;
    },

    /**
     * Success message modal
     */
    renderSuccessModal(title, message) {
        return `
      <div class="modal-overlay" id="successModal" onclick="this.remove()">
        <div class="modal-content" style="max-width: 450px; background: white; border-radius: 12px; padding: 32px; text-align: center;" onclick="event.stopPropagation()">
          <div style="font-size: 64px; margin-bottom: 16px;">✅</div>
          <h2 style="margin: 0 0 12px 0; color: #10b981;">${title}</h2>
          <p style="margin: 0 0 24px 0; color: #6b7280;">${message}</p>
          <button onclick="document.getElementById('successModal').remove()" 
                  style="padding: 12px 32px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
            OK
          </button>
        </div>
      </div>
    `;
    },

    /**
     * Error message modal
     */
    renderErrorModal(title, message) {
        return `
      <div class="modal-overlay" id="errorModal" onclick="this.remove()">
        <div class="modal-content" style="max-width: 450px; background: white; border-radius: 12px; padding: 32px; text-align: center;" onclick="event.stopPropagation()">
          <div style="font-size: 64px; margin-bottom: 16px;">❌</div>
          <h2 style="margin: 0 0 12px 0; color: #ef4444;">${title}</h2>
          <p style="margin: 0 0 24px 0; color: #6b7280;">${message}</p>
          <button onclick="document.getElementById('errorModal').remove()" 
                  style="padding: 12px 32px; background: #ef4444; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
            Close
          </button>
        </div>
      </div>
    `;
    },

    /**
     * Loading spinner modal
     */
    renderLoadingModal(message = 'Loading...') {
        return `
      <div class="modal-overlay" id="loadingModal" style="background: rgba(0,0,0,0.7);">
        <div class="modal-content" style="max-width: 300px; background: white; border-radius: 12px; padding: 32px; text-align: center;" onclick="event.stopPropagation()">
          <div class="spinner" style="width: 48px; height: 48px; border: 4px solid #f3f4f6; border-top: 4px solid #667eea; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 16px;"></div>
          <p style="margin: 0; color: #6b7280; font-weight: 600;">${message}</p>
        </div>
      </div>
      <style>
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      </style>
    `;
    },

    /**
     * Generic form modal
     */
    renderFormModal(title, formContent, formId = 'genericForm') {
        return `
      <div class="modal-overlay" id="formModal" onclick="if(event.target === this) this.remove()">
        <div class="modal-content" style="max-width: 600px; background: white; border-radius: 12px; padding : 32px; position: relative; max-height: 90vh; overflow-y: auto;" onclick="event.stopPropagation()">
          <button class="modal-close" onclick="document.getElementById('formModal').remove()" style="position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 24px; cursor: pointer; color: #9ca3af;">×</button>
          
          <h2 style="margin: 0 0 24px 0; color: #1f2937;">${title}</h2>
          
          <form id="${formId}">
            ${formContent}
          </form>
        </div>
      </div>
    `;
    },

    /**
     * Info/Alert modal
     */
    renderInfoModal(title, message, icon = 'ℹ️') {
        return `
      <div class="modal-overlay" id="infoModal" onclick="this.remove()">
        <div class="modal-content" style="max-width: 500px; background: white; border-radius: 12px; padding: 32px; text-align: center;" onclick="event.stopPropagation()">
          <div style="font-size: 64px; margin-bottom: 16px;">${icon}</div>
          <h2 style="margin: 0 0 12px 0; color: #1f2937;">${title}</h2>
          <p style="margin: 0 0 24px 0; color: #6b7280; white-space: pre-wrap;">${message}</p>
          <button onclick="document.getElementById('infoModal').remove()" 
                  style="padding: 12px 32px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
            Got it
          </button>
        </div>
      </div>
    `;
    },

    /**
     * Modal overlay base styles
     */
    getModalStyles() {
        return `
      <style>
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.2s ease-out;
        }
        
        .modal-content {
          animation: slideUp 0.3s ease-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      </style>
    `;
    }
};

// Export for global use
window.ModalsRenders = ModalsRenders;
