/**
 * Handles Google One Tap authentication and user management
 * Stores user profile with UUID in localStorage
 */

/**
 * Handles the response from Google One Tap authentication
 * Adds user to database if new, retrieves UUID if existing
 * @param {Object} response - The credential response from Google
 */
function handleCredentialResponse(response) {
    // Decode the JWT token
    const responsePayload = decodeJwtResponse(response.credential);
    
    // Get user info
    const userData = {
        name: responsePayload.name,
        email: responsePayload.email,
        picture: responsePayload.picture
    };
    
    // Check if user exists and get or create UUID
    checkUserAndGetUUID(userData)
        .then(userWithId => {
            // Store complete user profile including UUID in localStorage
            localStorage.setItem('userProfile', JSON.stringify(userWithId));
            
            // Redirect to home page
            window.location.href = 'frontend/home.html';
        })
        .catch(error => {
            console.error('Authentication error:', error);
            // Show error to user
            alert('There was an error with authentication. Please try again.');
        });
}

/**
 * Decodes a JWT token to extract the payload
 * @param {string} token - The JWT token to decode
 * @return {Object} The decoded token payload
 */
function decodeJwtResponse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

/**
 * Checks if user exists in database and gets UUID or creates new user
 * @param {Object} userData - User data object with name, email, and picture
 * @return {Promise<Object>} Promise resolving to user data with UUID
 */
async function checkUserAndGetUUID(userData) {
    try {
        // API endpoint for user checking/creation
        const endpoint = 'http://localhost:5000/api/users/check';
        
        // Make request to backend
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Unknown error occurred');
        }
        
        // Return user data with UUID
        return {
            ...userData,
            user_id: data.user_id
        };
    } catch (error) {
        console.error('Error checking/creating user:', error);
        throw error;
    }
}

/**
 * Gets the current user's profile from localStorage
 * @return {Object|null} User profile or null if not logged in
 */
function getCurrentUser() {
    const userProfile = localStorage.getItem('userProfile');
    return userProfile ? JSON.parse(userProfile) : null;
}

/**
 * Logs out the current user by clearing localStorage
 */
function logout() {
    localStorage.removeItem('userProfile');
    window.location.href = '/index.html';
}