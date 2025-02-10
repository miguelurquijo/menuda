/**
 * Navigation Menu Component
 * Creates and manages the bottom navigation bar
 */
class NavigationComponent {
    constructor() {
        this.template = '';
    }

    async mount(elementId) {
        try {
            // Fetch the template
            const response = await fetch('./components/navigation-menu.html');
            if (!response.ok) {
                throw new Error(`Failed to load navigation template: ${response.status}`);
            }
            this.template = await response.text();

            // Insert the navigation menu into the specified element
            const container = document.getElementById(elementId);
            if (!container) {
                throw new Error(`Element with id '${elementId}' not found`);
            }
            container.innerHTML = this.template;
            
            // Initialize the navigation after mounting
            this.initializeNavigation();
        } catch (error) {
            console.error('Error loading navigation:', error);
        }
    }

    initializeNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const currentPath = window.location.pathname;

        // Set initial active state based on current path
        this.updateActiveState(currentPath);

        // Add click event listeners
        navLinks.forEach(link => {
            link.addEventListener('click', this.handleNavClick.bind(this));
        });
    }

    updateActiveState(currentPath) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            // Get the href and compare it to the current path
            const href = link.getAttribute('href');
            const hrefPath = href.startsWith('./') ? href.slice(2) : href; // Remove './' if present
            const currentPagePath = currentPath.split('/').pop() || 'home.html';
            
            if (hrefPath === currentPagePath) {
                link.classList.add('active');
            } else if (currentPagePath === '' && hrefPath === 'home.html') {
                // Handle root path case
                link.classList.add('active');
            }
        });
    }

    handleNavClick(e) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => link.classList.remove('active'));
        e.currentTarget.classList.add('active');
    }
}

export default NavigationComponent;