document.addEventListener('keydown', (e) => {
    // Use Ctrl+Shift+R (or Cmd+Shift+R on Mac) as a shortcut to force refresh
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'r') {
        e.preventDefault();
        // Clear localStorage cache marker and reload
        localStorage.removeItem('cacheVersion');
        window.location.reload(true);
    }
});

// Check if we need to refresh cache
const currentVersion = localStorage.getItem('cacheVersion');
const pageVersion = Date.now().toString();

// If no version stored or version is old (more than 1 hour), update and reload
if (!currentVersion || (parseInt(pageVersion) - parseInt(currentVersion) > 3600000)) {
    localStorage.setItem('cacheVersion', pageVersion);
    // Only reload if this isn't the first load
    if (currentVersion) {
        window.location.reload(true);
    }
}


if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}