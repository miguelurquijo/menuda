// frontend/js/components/UserHeaderComponent.js
/**
 * User Header Component
 * Displays user greeting with name and profile picture from localStorage
 * Positioned on the left side of the page as per design
 */
class UserHeaderComponent {
    constructor() {
        this.template = '';
    }

    async mount(elementId) {
        try {
            // Fetch the template
            const response = await fetch('./components/user-header.html');
            if (!response.ok) {
                throw new Error(`Failed to load user header template: ${response.status}`);
            }
            this.template = await response.text();

            // Insert the user header into the specified element
            const container = document.getElementById(elementId);
            if (!container) {
                throw new Error(`Element with id '${elementId}' not found`);
            }
            container.innerHTML = this.template;
            
            // Initialize the user data
            this.initializeUserData();
        } catch (error) {
            console.error('Error loading user header:', error);
        }
    }

    initializeUserData() {
        try {
            // Get user profile from localStorage
            const userProfileString = localStorage.getItem('userProfile');
            if (!userProfileString) {
                console.warn('No user profile found in localStorage');
                return;
            }

            const userProfile = JSON.parse(userProfileString);
            
            // Update user name (just the first name)
            const userNameElement = document.getElementById('user-name');
            if (userNameElement && userProfile.name) {
                // Extract first name (first word before any space)
                const firstName = userProfile.name.split(' ')[0];
                userNameElement.textContent = firstName;
            }
            
            // Update profile picture if available
            if (userProfile.picture) {
                const userPictureElement = document.getElementById('user-picture');
                const defaultAvatarElement = document.getElementById('default-avatar');
                
                if (userPictureElement && defaultAvatarElement) {
                    userPictureElement.src = userProfile.picture;
                    userPictureElement.classList.remove('hidden');
                    defaultAvatarElement.classList.add('hidden');
                    
                    // Add error handler in case image fails to load
                    userPictureElement.onerror = () => {
                        userPictureElement.classList.add('hidden');
                        defaultAvatarElement.classList.remove('hidden');
                    };
                }
            }
            
            // Also set the full name in the welcome card if it exists
            const fullNameElement = document.getElementById('full-name');
            if (fullNameElement && userProfile.name) {
                fullNameElement.textContent = userProfile.name;
            }
        } catch (error) {
            console.error('Error initializing user data:', error);
        }
    }
}

export default UserHeaderComponent;