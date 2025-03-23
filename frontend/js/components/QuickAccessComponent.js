/**
 * QuickAccessComponent class for managing the quick access floating button and menu
 */
class QuickAccessComponent {
    constructor() {
        this.container = null;
        this.button = null;
        this.menu = null;
        this.isOpen = false;
    }

    /**
     * Initializes the quick access component
     */
    async init() {
        try {
            const response = await fetch('./components/quick-access.html');
            if (!response.ok) {
                throw new Error(`Failed to load quick access template: ${response.status}`);
            }
            
            const html = await response.text();
            
            // Create temporary container
            const temp = document.createElement('div');
            temp.innerHTML = html;
            
            // Get template content
            const template = temp.querySelector('#quick-access-template');
            
            if (!template) {
                throw new Error('Quick access template not found in loaded HTML');
            }
            
            // Mount component
            this.mount(template);
        } catch (error) {
            console.error('Error initializing quick access component:', error);
        }
    }

    /**
     * Mounts the component to the DOM
     * @param {HTMLElement} template - The template element
     */
    mount(template) {
        // Clone template content
        this.container = template.firstElementChild.cloneNode(true);
        this.button = this.container.querySelector('.quick-access-button');
        this.menu = this.container.querySelector('.quick-access-menu');

        // Append to body
        document.body.appendChild(this.container);

        // Attach event listeners
        this.attachEventListeners();
    }

    /**
     * Attaches event listeners to component elements
     */
    attachEventListeners() {
        this.button.addEventListener('click', () => this.toggleMenu());

        const options = this.menu.querySelectorAll('.quick-access-option');
        
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                const action = e.target.getAttribute('data-lh-id').replace('quick-access-', '');
                this.handleOptionClick(action);
            });
        });
    }

    /**
     * Toggles the quick access menu open/closed
     */
    toggleMenu() {
        this.isOpen = !this.isOpen;
        this.button.classList.toggle('active', this.isOpen);
        this.menu.classList.toggle('visible', this.isOpen);
    }

    /**
     * Handles click events on menu options
     * @param {string} action - The action to perform
     */
    handleOptionClick(action) {
        switch (action) {
            case 'formulario':
                // Navigate to transaction form
                window.location.href = 'transaction-detail.html';
                break;
                
            case 'factura':
                // Handle invoice upload
                this.handleInvoiceUpload();
                break;
                
            default:
                console.log('Unknown action:', action);
        }
        this.toggleMenu();
    }

    /**
     * Handles invoice upload action
     */
    handleInvoiceUpload() {
        // Create a file input element
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.capture = 'environment'; // Enable camera on mobile devices
        
        // Handle file selection
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                // Process the selected image
                this.processInvoiceImage(file);
            }
        });
        
        // Trigger file selection
        fileInput.click();
    }

    /**
     * Process the invoice image and extract data
     * @param {File} file - The selected image file
     */
    async processInvoiceImage(file) {
        try {
            // Show loading message
            this.showLoadingToast('Procesando factura...');
            
            // Get user profile
            const userProfile = this.getUserProfile();
            if (!userProfile || !userProfile.user_id) {
                throw new Error('User profile not found');
            }
            
            // Create FormData object to send the file for processing
            const formData = new FormData();
            formData.append('invoice', file);  // Backend expects 'invoice' field name
            formData.append('user_id', userProfile.user_id);
            
            // Send the file directly to the invoice processing endpoint
            const response = await fetch('http://127.0.0.1:5000/api/invoices/process', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error(`Error processing invoice: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.status !== 'success') {
                throw new Error(data.message || 'Failed to process invoice');
            }
            
            // Get the extracted data
            const invoiceData = data.data;
            
            // Now upload the same file to get a permanent URL
            const uploadFormData = new FormData();
            uploadFormData.append('file', file);
            uploadFormData.append('user_id', userProfile.user_id);
            
            const uploadResponse = await fetch('http://127.0.0.1:5000/api/attachments/upload', {
                method: 'POST',
                body: uploadFormData
            });
            
            if (!uploadResponse.ok) {
                throw new Error(`Error uploading image: ${uploadResponse.status}`);
            }
            
            const uploadData = await uploadResponse.json();
            
            if (uploadData.status !== 'success') {
                throw new Error(uploadData.message || 'Failed to upload image');
            }
            
            // Create URL parameters with all data including attachment
            const params = new URLSearchParams();
            params.append('prefill', 'true');
            params.append('title', invoiceData.title || '');
            params.append('amount', invoiceData.amount || '');
            params.append('date', invoiceData.date || '');
            params.append('category', invoiceData.category || '');
            params.append('vendor', invoiceData.vendor || '');
            params.append('attachment_url', uploadData.data.url);
            params.append('attachment_type', uploadData.data.type);
            
            // Navigate to transaction form with data in URL
            window.location.href = `transaction-detail.html?${params.toString()}`;
            
        } catch (error) {
            console.error('Error processing invoice:', error);
            // Hide loading toast and show error
            this.hideLoadingToast();
            this.showErrorToast('Error al procesar la factura: ' + error.message);
        }
    }

    /**
     * Get user profile from localStorage
     * @returns {Object|null} User profile or null if not found
     */
    getUserProfile() {
        const userProfileString = localStorage.getItem('userProfile');
        return userProfileString ? JSON.parse(userProfileString) : null;
    }

    /**
     * Show a loading toast notification
     * @param {string} message - The message to display
     */
    showLoadingToast(message) {
        // Create toast element if it doesn't exist
        let toast = document.getElementById('loading-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'loading-toast';
            toast.className = 'toast loading-toast';
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.classList.add('visible');
    }

    /**
     * Hide the loading toast notification
     */
    hideLoadingToast() {
        const toast = document.getElementById('loading-toast');
        if (toast) {
            toast.classList.remove('visible');
        }
    }

    /**
     * Show an error toast notification
     * @param {string} message - The message to display
     */
    showErrorToast(message) {
        // Create toast element if it doesn't exist
        let toast = document.getElementById('error-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'error-toast';
            toast.className = 'toast error-toast';
            document.body.appendChild(toast);
        }
        
        toast.textContent = message;
        toast.classList.add('visible');
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.remove('visible');
        }, 3000);
    }
}

export default QuickAccessComponent;