// frontend/js/utils/cache-buster.js
/**
 * Utility to help with cache busting
 */
const CacheBuster = {
    /**
     * Current version timestamp
     */
    version: Date.now(),
    
    /**
     * Adds a version parameter to a URL to bust cache
     * @param {string} url - The URL to modify
     * @returns {string} The URL with version parameter
     */
    addVersion: function(url) {
      // Don't add version to data URLs or absolute URLs
        if (url.startsWith('data:') || url.startsWith('http')) {
        return url;
        }
    
      // Add cache-busting parameter
    const separator = url.includes('?') ? '&' : '?';
        return `${url}${separator}v=${this.version}`;
    },
    
    /**
     * Creates a versioned URL
     * @param {string} path - The path to create URL for
     * @returns {string} The URL with version parameter
     */
    url: function(path) {
        return this.addVersion(path);
    }
};

export default CacheBuster;