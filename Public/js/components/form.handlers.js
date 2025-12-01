// ====================================================
// STOCKFLOW - FORM HANDLERS
// Form creation, validation, and submission
// ====================================================

const FormHandlers = {

    /**
     * Create form field
     */
    createField(config) {
        const {
            type = 'text',
            id,
            name,
            label,
            value = '',
            placeholder = '',
            required = false,
            options = [],
            rows = 3,
            disabled = false
        } = config;

        let field = '';

        switch (type) {
            case 'text':
            case 'email':
            case 'tel':
            case 'number':
            case 'date':
            case 'password':
                field = `
                    <input type="${type}" 
                           id="${id}" 
                           name="${name}" 
                           value="${value}" 
                           placeholder="${placeholder}"
                           ${required ? 'required' : ''}
                           ${disabled ? 'disabled' : ''}
                           style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px;">
                `;
                break;

            case 'textarea':
                field = `
                    <textarea id="${id}" 
                              name="${name}" 
                              rows="${rows}" 
                              placeholder="${placeholder}"
                              ${required ? 'required' : ''}
                              ${disabled ? 'disabled' : ''}
                              style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; resize: vertical;">${value}</textarea>
                `;
                break;

            case 'select':
                field = `
                    <select id="${id}" 
                            name="${name}"
                            ${required ? 'required' : ''}
                            ${disabled ? 'disabled' : ''}
                            style="width: 100%; padding: 12px 16px; border: 2px solid #e5e7eb; border-radius: 8px; font-size: 14px; cursor: pointer;">
                        <option value="">Select ${label}</option>
                        ${options.map(opt => `
                            <option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>
                                ${opt.label}
                            </option>
                        `).join('')}
                    </select>
                `;
                break;

            case 'checkbox':
                field = `
                    <label style="display: flex; align-items: center; cursor: pointer;">
                        <input type="checkbox" 
                               id="${id}" 
                               name="${name}" 
                               ${value ? 'checked' : ''}
                               ${disabled ? 'disabled' : ''}
                               style="margin-right: 8px;">
                        <span>${label}</span>
                    </label>
                `;
                break;

            case 'radio':
                field = options.map(opt => `
                    <label style="display: flex; align-items: center; cursor: pointer; margin-bottom: 8px;">
                        <input type="radio" 
                               name="${name}"
                               value="${opt.value}"
                               ${opt.value === value ? 'checked' : ''}
                               ${disabled ? 'disabled' : ''}
                               style="margin-right: 8px;">
                        <span>${opt.label}</span>
                    </label>
                `).join('');
                break;
        }

        return `
            <div class="form-group" style="margin-bottom: 20px;">
                ${type !== 'checkbox' ? `<label style="display: block; margin-bottom: 8px; font-weight: 600; color: #374151;">${label}${required ? ' <span style="color: #ef4444;">*</span>' : ''}</label>` : ''}
                ${field}
                <div class="field-error" id="${id}-error" style="display: none; color: #ef4444; font-size: 12px; margin-top: 4px;"></div>
            </div>
        `;
    },

    /**
     * Create full form
     */
    createForm(config) {
        const { id, fields, submitText = 'Submit', onSubmit } = config;

        return `
            <form id="${id}" onsubmit="${onSubmit}; return false;">
                ${fields.map(field => this.createField(field)).join('')}
                
                <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                    <button type="button" 
                            onclick="this.closest('[id$=Modal]').remove()"
                            style="padding: 12px 24px; background: #f3f4f6; color: #374151; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        Cancel
                    </button>
                    <button type="submit" 
                            style="padding: 12px 32px; background: #667eea; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                        ${submitText}
                    </button>
                </div>
            </form>
        `;
    },

    /**
     * Get form data
     */
    getFormData(formId) {
        const form = document.getElementById(formId);
        if (!form) return null;

        const formData = new FormData(form);
        const data = {};

        for (const [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Handle checkboxes
        form.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            data[checkbox.name] = checkbox.checked;
        });

        return data;
    },

    /**
     * Set form data
     */
    setFormData(formId, data) {
        const form = document.getElementById(formId);
        if (!form) return;

        Object.keys(data).forEach(key => {
            const field = form.elements[key];
            if (!field) return;

            if (field.type === 'checkbox') {
                field.checked = data[key];
            } else if (field.type === 'radio') {
                form.querySelectorAll(`input[name="${key}"]`).forEach(radio => {
                    radio.checked = radio.value === data[key];
                });
            } else {
                field.value = data[key] || '';
            }
        });
    },

    /**
     * Clear form
     */
    clearForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        form.reset();

        // Clear any error messages
        form.querySelectorAll('.field-error').forEach(error => {
            error.style.display = 'none';
            error.textContent = '';
        });
    },

    /**
     * Show field error
     */
    showFieldError(fieldId, message) {
        const errorDiv = document.getElementById(`${fieldId}-error`);
        const field = document.getElementById(fieldId);

        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }

        if (field) {
            field.style.borderColor = '#ef4444';
            field.focus();
        }
    },

    /**
     * Clear field error
     */
    clearFieldError(fieldId) {
        const errorDiv = document.getElementById(`${fieldId}-error`);
        const field = document.getElementById(fieldId);

        if (errorDiv) {
            errorDiv.style.display = 'none';
            errorDiv.textContent = '';
        }

        if (field) {
            field.style.borderColor = '#e5e7eb';
        }
    },

    /**
     * Validate form and show errors
     */
    validateAndShowErrors(formId, rules) {
        const formData = this.getFormData(formId);
        const validation = DataOperations.validateForm(formData, rules);

        // Clear all previous errors
        Object.keys(rules).forEach(field => {
            this.clearFieldError(field);
        });

        // Show new errors
        if (!validation.isValid) {
            Object.keys(validation.errors).forEach(field => {
                this.showFieldError(field, validation.errors[field]);
            });
        }

        return validation.isValid;
    },

    /**
     * Handle form submission
     */
    async handleSubmit(formId, endpoint, rules = {}, onSuccess = null) {
        // Validate if rules provided
        if (Object.keys(rules).length > 0) {
            if (!this.validateAndShowErrors(formId, rules)) {
                return { success: false, error: 'Validation failed' };
            }
        }

        // Get form data
        const formData = this.getFormData(formId);

        // Determine if create or update
        const isUpdate = formData.id && formData.id !== '';

        // Submit
        const result = isUpdate
            ? await DataOperations.update(endpoint, formData.id, formData)
            : await DataOperations.create(endpoint, formData);

        // Call success callback
        if (result.success && onSuccess) {
            onSuccess(result.data);
        }

        return result;
    }
};

// Export for global use
window.FormHandlers = FormHandlers;
