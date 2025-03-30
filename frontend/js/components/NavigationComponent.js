/**
 * Navigation Menu Component - SVG Compatible Version
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
            
            // Set the inner HTML
            container.innerHTML = this.template;
            
            // Initialize active state
            this.initializeNavigation();
            
            console.log('Navigation menu loaded successfully');
        } catch (error) {
            console.error('Error loading navigation:', error);
        }
    }

    initializeNavigation() {
        const navBtns = document.querySelectorAll('.nav-btn');
        const currentPath = window.location.pathname;

        // Set initial active state based on current path
        this.updateActiveState(currentPath);

        // Add click event listeners
        navBtns.forEach(btn => {
            btn.addEventListener('click', this.handleNavClick.bind(this));
        });
    }

    updateActiveState(currentPath) {
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => {
            btn.classList.remove('active');
            
            // Get the href and compare it to the current path
            const href = btn.getAttribute('href');
            const hrefPath = href.startsWith('./') ? href.slice(2) : href;
            const currentPagePath = currentPath.split('/').pop() || 'home.html';
            
            if (hrefPath === currentPagePath) {
                btn.classList.add('active');
            } else if (currentPagePath === '' && hrefPath === 'home.html') {
                // Handle root path case
                btn.classList.add('active');
            }
        });
    }

    handleNavClick(e) {
        const navBtns = document.querySelectorAll('.nav-btn');
        navBtns.forEach(btn => btn.classList.remove('active'));
        e.currentTarget.classList.add('active');
    }
}

export default NavigationComponent;