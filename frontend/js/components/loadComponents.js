// frontend/js/components/loadComponents.js
import NavigationComponent from './NavigationComponent.js';
import QuickAccessComponent from './QuickAccessComponent.js';
import UserHeaderComponent from './UserHeaderComponent.js';
import CacheBuster from '../utils/cache-buster.js';

/**
 * Initializes and loads all components for the page
 */
function initComponents() {
    // Initialize user header
    const userHeader = new UserHeaderComponent();
    userHeader.mount('header-placeholder');
    
    // Initialize navigation
    const navigation = new NavigationComponent();
    navigation.mount('nav-placeholder');

    // Initialize quick access with cache busting
    const quickAccess = new QuickAccessComponent();
    quickAccess.init();
}

// Override fetch to add version parameter to URLs
const originalFetch = window.fetch;
window.fetch = function(url, options) {
    // Only apply to local HTML/CSS/JS files
    if (typeof url === 'string' && 
        (url.endsWith('.html') || url.endsWith('.css') || url.endsWith('.js')) &&
        !url.startsWith('http')) {
        url = CacheBuster.addVersion(url);
    }
    return originalFetch.call(this, url, options);
};

// Initialize components when DOM is loaded
document.addEventListener('DOMContentLoaded', initComponents);