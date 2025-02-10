import NavigationComponent from './NavigationComponent.js';
import QuickAccessComponent from './QuickAccessComponent.js';

/**
 * Initializes and loads all components for the page
 */
function initComponents() {
    // Initialize navigation
    const navigation = new NavigationComponent();
    navigation.mount('nav-placeholder');

    // Initialize quick access
    const quickAccess = new QuickAccessComponent();
    quickAccess.init();
}

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', initComponents);