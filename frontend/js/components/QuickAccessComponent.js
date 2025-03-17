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
            const response = await fetch('/frontend/components/quick-access.html');
            const html = await response.text();
            
            // Create temporary container
            const temp = document.createElement('div');
            temp.innerHTML = html;
            
            // Get template content
            const template = temp.querySelector('#quick-access-template');
            
            if (!template) {
                throw new Error('Quick access template not found');
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
                const action = e.target.textContent.toLowerCase();
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
            case 'audio':
                // Handle audio recording
                console.log('Audio recording action');
                // Future implementation: Open audio recording interface
                break;
                
            case 'photo':
                // Handle photo capture
                console.log('Photo capture action');
                // Future implementation: Open camera interface
                break;
                
            case 'formulario':
                // Navigate to transaction form
                window.location.href = 'transaction-detail.html';
                break;
                
            default:
                console.log('Unknown action:', action);
        }
        this.toggleMenu();
    }
}

export default QuickAccessComponent;