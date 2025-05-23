/**
 * Transaction Detail Page
 * Handles creating, viewing, and editing transaction records
 * 
 * This file centralizes all transaction-related logic including:
 * - Creating transactions
 * - Editing transactions
 * - Processing invoice images
 * - Attachment handling
 * - Category and vendor management
 */

// Define global utility functions first, before DOM loading
// IMPORTANT: These functions are defined globally to be accessible from QuickAccessComponent
// These must be at the top of the file and outside any event handlers

// Process an invoice image and extract data
/**
 * Process an invoice image and extract data
 * @param {File} file - The invoice image file
 * @returns {Promise<Object>} - Object with the processed data and redirect URL
 */
window.processInvoiceImage = async function(file) {
    try {
        // Get user profile
        const userProfile = getUserProfile();
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
        
        return {
            success: true,
            redirectUrl: `transaction-detail.html?${params.toString()}`
        };
        
    } catch (error) {
        console.error('Error processing invoice:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Get user profile from localStorage
/**
 * Get user profile from localStorage
 * @returns {Object|null} User profile or null if not found
 */
window.getUserProfile = function() {
    const userProfileString = localStorage.getItem('userProfile');
    return userProfileString ? JSON.parse(userProfileString) : null;
};

// Show a toast notification
/**
 * Show a toast notification
 * @param {string} message - The message to display
 */
window.showToast = function(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.remove('hidden');
        
        // Hide toast after 3 seconds
        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    } else {
        // Fallback if toast element doesn't exist
        console.log('Toast message:', message);
    }
};

// Verify global functions are available
console.log('Global functions initialized:', {
    processInvoiceImage: typeof window.processInvoiceImage === 'function',
    getUserProfile: typeof window.getUserProfile === 'function',
    showToast: typeof window.showToast === 'function'
});

// Now continue with the rest of the script
document.addEventListener('DOMContentLoaded', function() {
    // Check URL parameters for prefill data
    const urlParams = new URLSearchParams(window.location.search);
    const isPrefill = urlParams.get('prefill') === 'true';

    // Check for attachment URL and type in URL parameters
    const attachmentUrl = urlParams.get('attachment_url');
    const attachmentType = urlParams.get('attachment_type');

    if (attachmentUrl && attachmentType) {
        // Set the hidden fields
        document.getElementById('attachment-url').value = attachmentUrl;
        document.getElementById('attachment-type').value = attachmentType;
        
        // Show attachment in preview
        const currentAttachment = document.getElementById('current-attachment');
        currentAttachment.classList.remove('hidden');
        
        // Set attachment name (just the filename from the URL)
        const filename = attachmentUrl.split('/').pop();
        document.getElementById('attachment-name').textContent = filename;
        
        // If it's an image, show the preview
        if (attachmentType === 'image') {
            const attachmentImage = document.getElementById('attachment-image');
            attachmentImage.src = attachmentUrl;
            attachmentImage.classList.remove('hidden');
        }
    }
    
    if (isPrefill) {
        // Try to get invoice data from URL params
        const title = urlParams.get('title');
        const amount = urlParams.get('amount');
        const date = urlParams.get('date');
        const category = urlParams.get('category');
        const vendor = urlParams.get('vendor');
        
        // Apply data to form fields
        const titleField = document.getElementById('title');
        const amountField = document.getElementById('amount');
        const dateField = document.getElementById('transaction-date');
        
        // Set form fields if they exist
        if (titleField && title) titleField.value = title;
        if (amountField && amount) amountField.value = amount;
        if (dateField && date) dateField.value = date;
        
        // Store category and vendor for dropdown population
        window.extractedCategory = category || '';
        window.extractedVendor = vendor || '';
    }
    
    // Initialize the page
    initPage();
});

// Add event listener to the attachment preview when element exists
document.addEventListener('DOMContentLoaded', function() {
    const attachmentImage = document.getElementById('attachment-image');
    if (attachmentImage) {
        attachmentImage.addEventListener('click', function() {
            const url = this.src;
            if (url) {
                window.open(url, '_blank');
            }
        });
    }
});


 // Initialize page elements and event listeners
function initPage() {
    const backButton = document.getElementById('back-button');
    const form = document.getElementById('transaction-form');
    const deleteButton = document.getElementById('delete-transaction');
    const newCategoryInput = document.getElementById('new-category');
    const newVendorInput = document.getElementById('new-vendor');
    const categorySelect = document.getElementById('category');
    const vendorSelect = document.getElementById('vendor');
    const fileInput = document.getElementById('attachment');
    const removeAttachmentBtn = document.getElementById('remove-attachment');
    const newCategoryGroup = document.getElementById('new-category-group');
    const newVendorGroup = document.getElementById('new-vendor-group');
    
    // Get transaction ID from URL if editing
    const urlParams = new URLSearchParams(window.location.search);
    const transactionId = urlParams.get('id');
    
    // Set page mode (create or edit)
    if (transactionId) {
        document.getElementById('page-title').textContent = 'Edit Transaction';
        document.getElementById('transaction-id').value = transactionId;
        deleteButton.classList.remove('hidden');
        
        // Load transaction data
        loadTransaction(transactionId);
    } else {
        document.getElementById('page-title').textContent = 'New Transaction';
        
        // Set default date to today if not already set
        if (!document.getElementById('transaction-date').value) {
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            document.getElementById('transaction-date').value = formattedDate;
        }
        // Load categories and vendors in parallel for new transactions
        Promise.all([
            loadCategories(), 
            loadVendors()
        ]).catch(error => {
            console.error('Error initializing form data:', error);
        });
    }
    
    // Back button event
    backButton.addEventListener('click', () => {
        window.history.back();
    });
    
    // Toggle category input visibility
    categorySelect.addEventListener('change', () => {
        if (categorySelect.value === 'new') {
            newCategoryGroup.classList.remove('hidden');
            newCategoryInput.focus();
            newCategoryInput.setAttribute('required', true);
        } else {
            newCategoryGroup.classList.add('hidden');
            newCategoryInput.removeAttribute('required');
            // Clear the input when hiding
            newCategoryInput.value = '';
        }
    });
    
    // Toggle vendor input visibility
    vendorSelect.addEventListener('change', () => {
        if (vendorSelect.value === 'new') {
            newVendorGroup.classList.remove('hidden');
            newVendorInput.focus();
            newVendorInput.setAttribute('required', true);
        } else {
            newVendorGroup.classList.add('hidden');
            newVendorInput.removeAttribute('required');
            // Clear the input when hiding
            newVendorInput.value = '';
        }
    });
    
    // Handle form submission with file upload
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            console.log('Form submission started');
            // Show loading state
            window.showToast('Saving transaction...');
            
            // Get form data
            const formData = new FormData(form);
            
            // Get user profile
            const userProfile = window.getUserProfile();
            if (!userProfile || !userProfile.user_id) {
                throw new Error('User profile not found');
            }
            
            // Get original selected values from the form elements
            const categorySelectValue = categorySelect.value;
            const vendorSelectValue = vendorSelect.value;
            
            // Create a simple transaction data object with only required fields
            let transactionData = {
                user_id: userProfile.user_id,
                title: formData.get('title'),
                amount: parseFloat(formData.get('amount')),
                transaction_date: formData.get('transaction_date')
            };
            
            // Get the transaction ID if we're editing
            const transactionId = document.getElementById('transaction-id').value;
            if (transactionId) {
                transactionData.transaction_id = transactionId;
            }

           // Handle file upload if a file is selected
            const fileInput = document.getElementById('attachment');
            if (fileInput.files && fileInput.files[0]) {
                try {
                    const file = fileInput.files[0];
                    // (Optional) Show a loading indicator or toast if desired
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
                    
                    // Update transaction data with the uploaded file details
                    transactionData.attachment_url = uploadData.data.url;
                    transactionData.attachment_type = uploadData.data.type;
                    console.log('File uploaded successfully:', uploadData);
                } catch (uploadError) {
                    console.error('Error uploading file:', uploadError);
                    // Continue with transaction without attachment
                }
            } else {
                // If no new file is selected, use the hidden field values (if available)
                const existingAttachmentUrl = document.getElementById('attachment-url').value;
                const existingAttachmentType = document.getElementById('attachment-type').value;
                
                if (existingAttachmentUrl && existingAttachmentType) {
                    transactionData.attachment_url = existingAttachmentUrl;
                    transactionData.attachment_type = existingAttachmentType;
                }
            }
        
            // Handle new category if selected
            let categoryId = categorySelectValue;
            if (categorySelectValue === 'new') {
                const newCategoryName = newCategoryInput.value.trim();
                if (!newCategoryName) {
                    throw new Error('New category name is required');
                }
                
                // Create new category and get the ID
                const newCategory = await createCategory(userProfile.user_id, newCategoryName);
                categoryId = newCategory.category_id;
            }
            
            // Assign category to transaction data
            transactionData.category_id = categoryId;
        
        // Handle new vendor if selected
        let vendorId = vendorSelectValue;
        if (vendorSelectValue === 'new') {
            const newVendorName = newVendorInput.value.trim();
            if (!newVendorName) {
                throw new Error('New vendor name is required');
            }
            
            // Create new vendor and get the ID
            const newVendor = await createVendor(userProfile.user_id, newVendorName, categoryId);
            vendorId = newVendor.vendor_id;
        }
        
        // Assign vendor to transaction data
        transactionData.vendor_id = vendorId;
        
        console.log('Saving transaction with data:', transactionData);
        
        // Now save the transaction with a streamlined approach
        saveTransaction(transactionData)
        
        
    } catch (error) {
        console.error('Error saving transaction:', error);
        window.showToast('Error: ' + error.message);
    }
    });
    
    // Handle delete transaction
    deleteButton.addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete this transaction?')) {
            try {
                await deleteTransaction(transactionId);
                window.showToast('Transaction deleted successfully');
                
                // Use replace instead of href
                setTimeout(() => {
                    window.location.replace('transactions.html');
                }, 1000);
            } catch (error) {
                console.error('Error deleting transaction:', error);
                window.showToast('Error deleting transaction: ' + error.message);
            }
        }
    });
    
   // Handle attachment preview
    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelection(e.target.files[0]);
        }
    });
    
    // Handle remove attachment
    removeAttachmentBtn.addEventListener('click', () => {
        document.getElementById('current-attachment').classList.add('hidden');
        document.getElementById('attachment-image').src = '';
        document.getElementById('attachment-image').classList.add('hidden');
        document.getElementById('attachment-name').textContent = '';
        document.getElementById('attachment-url').value = '';
        document.getElementById('attachment-type').value = '';
        fileInput.value = '';
    });
}
// Create a new category
/**
 * @param {string} userId - The user ID
 * @param {string} categoryName - The name of the new category
 * @returns {Promise<Object>} Promise resolving to new category object
 */
async function createCategory(userId, categoryName) {
    try {
        const payload = {
            user_id: userId,
            category_name: categoryName
        };
        
        const response = await fetch('http://127.0.0.1:5000/api/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`Failed to create category (${response.status})`);
        }
        
        const result = await response.json();
        
        if (result.status !== 'success') {
            throw new Error(result.message || 'Failed to create category');
        }
        
        return result.data;
    } catch (error) {
        console.error('Error creating category:', error);
        throw error;
    }
}

// Create a new vendor
/**
 * Create a new vendor
 * @param {string} userId - The user ID
 * @param {string} vendorName - The name of the new vendor
 * @param {string} categoryId - The category ID for the vendor
 * @returns {Promise<Object>} Promise resolving to new vendor object
 */
async function createVendor(userId, vendorName, categoryId) {
    try {
        const payload = {
            user_id: userId,
            vendor_name: vendorName,
            category_id: categoryId
        };
        
        const response = await fetch('http://127.0.0.1:5000/api/vendors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`Failed to create vendor (${response.status})`);
        }
        
        const result = await response.json();
        
        if (result.status !== 'success') {
            throw new Error(result.message || 'Failed to create vendor');
        }
        
        return result.data;
    } catch (error) {
        console.error('Error creating vendor:', error);
        throw error;
    }
}

// Load categories from API
/**
 * Load categories from API
 */
function loadCategories() {
    try {
        // Get user profile from localStorage
        const userProfile = window.getUserProfile();
        if (!userProfile || !userProfile.user_id) {
            console.warn('User ID not found in profile');
            return;
        }
        
        const userId = userProfile.user_id;
        
        // Now make the API call with the correct userId
        fetch(`http://127.0.0.1:5000/api/categories?user_id=${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load categories: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    const categorySelect = document.getElementById('category');
                    
                    // Clear existing options except the first one
                    while (categorySelect.options.length > 1) {
                        categorySelect.remove(1);
                    }
                    
                    // Add categories
                    data.data.forEach(category => {
                        const option = document.createElement('option');
                        option.value = category.category_id;
                        option.textContent = category.category_name;
                        categorySelect.appendChild(option);
                    });
                    
                    // Add "Create New" option
                    const newOption = document.createElement('option');
                    newOption.value = 'new';
                    newOption.textContent = '+ Create New Category';
                    categorySelect.appendChild(newOption);
                    
                    // Set category from extracted data if available
                    setTimeout(() => {
                        if (window.extractedCategory) {
                            let matchFound = false;
                            
                            // Try to find an exact match first
                            for (let i = 0; i < categorySelect.options.length; i++) {
                                const option = categorySelect.options[i];
                                if (option.textContent.toLowerCase() === window.extractedCategory.toLowerCase()) {
                                    categorySelect.value = option.value;
                                    matchFound = true;
                                    break;
                                }
                            }
                            
                            if (!matchFound) {
                                // Select "Create New" and fill in the name
                                categorySelect.value = 'new';
                                const newCategoryGroup = document.getElementById('new-category-group');
                                newCategoryGroup.classList.remove('hidden');
                                document.getElementById('new-category').value = window.extractedCategory;
                                document.getElementById('new-category').setAttribute('required', true);
                            }
                        }
                    }, 200);
                }
            })
            .catch(error => {
                console.error('Error loading categories:', error);
                window.showToast('Error loading categories');
            });
    } catch (error) {
        console.error('Error in loadCategories function:', error);
    }
}

// Load vendors from API
/**
 * Load vendors from API
 */
function loadVendors() {
    try {
        // Get user profile from localStorage
        const userProfile = window.getUserProfile();
        if (!userProfile || !userProfile.user_id) {
            console.warn('User ID not found in profile');
            return;
        }
        
        const userId = userProfile.user_id;
        
        // Now make the API call with the correct userId
        fetch(`http://127.0.0.1:5000/api/vendors?user_id=${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load vendors: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                if (data.status === 'success') {
                    const vendorSelect = document.getElementById('vendor');
                    
                    // Clear existing options except the first one
                    while (vendorSelect.options.length > 1) {
                        vendorSelect.remove(1);
                    }
                    
                    // Add vendors
                    data.data.forEach(vendor => {
                        const option = document.createElement('option');
                        option.value = vendor.vendor_id;
                        option.textContent = vendor.vendor_name;
                        option.dataset.categoryId = vendor.category_id;
                        vendorSelect.appendChild(option);
                    });
                    
                    // Add "Create New" option
                    const newOption = document.createElement('option');
                    newOption.value = 'new';
                    newOption.textContent = '+ Create New Vendor';
                    vendorSelect.appendChild(newOption);
                    
                    // Set vendor from extracted data if available
                    setTimeout(() => {
                        if (window.extractedVendor) {
                            let matchFound = false;
                            
                            // Try to find an exact match first
                            for (let i = 0; i < vendorSelect.options.length; i++) {
                                const option = vendorSelect.options[i];
                                if (option.textContent.toLowerCase() === window.extractedVendor.toLowerCase()) {
                                    vendorSelect.value = option.value;
                                    matchFound = true;
                                    break;
                                }
                            }
                            
                            if (!matchFound) {
                                // Select "Create New" and fill in the name
                                vendorSelect.value = 'new';
                                const newVendorGroup = document.getElementById('new-vendor-group');
                                newVendorGroup.classList.remove('hidden');
                                document.getElementById('new-vendor').value = window.extractedVendor;
                                document.getElementById('new-vendor').setAttribute('required', true);
                            }
                        }
                    }, 300);
                }
            })
            .catch(error => {
                console.error('Error loading vendors:', error);
                window.showToast('Error loading vendors');
            });
    } catch (error) {
        console.error('Error in loadVendors function:', error);
    }
}

// Load transaction details for editing
/**
 * Fixed loadTransaction function to properly handle timeout
 * @param {string} transactionId - The ID of the transaction to load
 */
async function loadTransaction(transactionId) {
    // Show loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    const transactionForm = document.getElementById('transaction-form');
    loadingOverlay.style.display = 'flex';
    loadingOverlay.classList.remove('hidden');
    transactionForm.classList.add('hidden');
    
    // For tracking timeouts
    let timeoutId = null;
    
    try {
        const userProfile = window.getUserProfile();
        if (!userProfile || !userProfile.user_id) {
            throw new Error('User profile not found');
        }
        
        const userId = userProfile.user_id;

        // Create a controller for aborting requests if needed
        const controller = new AbortController();
        const signal = controller.signal;

        // Create a timeout that will abort the requests if they take too long
        timeoutId = setTimeout(() => {
            controller.abort();
            console.log('Request timed out, aborting...');
        }, 8000); // 8 second timeout
        
        try {
            // Load all data in parallel with proper error handling and timeout
            const [categories, vendors, transactionResponse] = await Promise.all([
                // Get categories with retry, passing the abort signal
                fetchWithRetry(`http://127.0.0.1:5000/api/categories?user_id=${userId}`, { signal }),
                // Get vendors with retry, passing the abort signal
                fetchWithRetry(`http://127.0.0.1:5000/api/vendors?user_id=${userId}`, { signal }),
                // Get transaction with retry, passing the abort signal
                fetchWithRetry(`http://127.0.0.1:5000/api/transactions/${transactionId}?user_id=${userId}`, { signal })
            ]);
            
            // Clear the timeout since requests completed successfully
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }

            // Process categories
            if (categories.status === 'success') {
                populateCategories(categories.data);
            } else {
                console.warn('Failed to load categories:', categories.message);
            }
            
            // Process vendors
            if (vendors.status === 'success') {
                populateVendors(vendors.data);
            } else {
                console.warn('Failed to load vendors:', vendors.message);
            }
            
            // Process transaction
            if (transactionResponse.status === 'success') {
                populateTransactionForm(transactionResponse.data);
            } else {
                throw new Error(transactionResponse.message || 'Failed to load transaction');
            }
        } catch (error) {
            // Make sure to clear the timeout on error
            if (timeoutId) {
                clearTimeout(timeoutId);
                timeoutId = null;
            }
            
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please check your connection and try again.');
            }
            throw error;
        }
        
        // Hide loading overlay when finished
        loadingOverlay.style.display = 'none';
        transactionForm.classList.remove('hidden');
    } catch (error) {
        // Ensure timeout is cleared if still active
        if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
        }
        
        console.error('Error loading transaction:', error);
        window.showToast('Error loading transaction details: ' + error.message);
        
        // Hide loading overlay on error, but with a slight delay to ensure user sees something happened
        setTimeout(() => {
            loadingOverlay.style.display = 'none';
            transactionForm.classList.remove('hidden');
        }, 300);
    }
}

/**
 * Fetch with retry functionality
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @param {number} retries - Number of retries (default: 3)
 * @param {number} delay - Delay between retries in ms (default: 1000)
 * @returns {Promise<Object>} - Promise resolving to JSON response
 */
async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        if (retries <= 0) {
            throw error;
        }
        
        console.log(`Retrying fetch for ${url}. Retries left: ${retries-1}`);
        
        // Wait for the specified delay
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry with one fewer retry remaining
        return fetchWithRetry(url, options, retries - 1, delay);
    }
}

/**
 * Populate categories dropdown
 * @param {Array} categories - Array of category objects
 */
function populateCategories(categories) {
    const categorySelect = document.getElementById('category');
    
    // Clear existing options except the first one
    while (categorySelect.options.length > 1) {
        categorySelect.remove(1);
    }
    
    // Add categories
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.category_id;
        option.textContent = category.category_name;
        categorySelect.appendChild(option);
    });
    
    // Add "Create New" option
    const newOption = document.createElement('option');
    newOption.value = 'new';
    newOption.textContent = '+ Create New Category';
    categorySelect.appendChild(newOption);
}

/**
 * Populate vendors dropdown
 * @param {Array} vendors - Array of vendor objects
 */
function populateVendors(vendors) {
    const vendorSelect = document.getElementById('vendor');
    
    // Clear existing options except the first one
    while (vendorSelect.options.length > 1) {
        vendorSelect.remove(1);
    }
    
    // Add vendors
    vendors.forEach(vendor => {
        const option = document.createElement('option');
        option.value = vendor.vendor_id;
        option.textContent = vendor.vendor_name;
        option.dataset.categoryId = vendor.category_id;
        vendorSelect.appendChild(option);
    });
    
    // Add "Create New" option
    const newOption = document.createElement('option');
    newOption.value = 'new';
    newOption.textContent = '+ Create New Vendor';
    vendorSelect.appendChild(newOption);
}

/**
 * Populate the transaction form with transaction data
 * @param {Object} transaction - Transaction data object
 */
function populateTransactionForm(transaction) {
    // Fill form fields
    document.getElementById('title').value = transaction.title;
    document.getElementById('amount').value = transaction.amount;
    
    // Format date properly
    const date = new Date(transaction.transaction_date);
    const formattedDate = date.toISOString().split('T')[0];
    document.getElementById('transaction-date').value = formattedDate;
    
    // Set category and vendor with a small delay to ensure dropdowns are populated
    setTimeout(() => {
        const categorySelect = document.getElementById('category');
        const vendorSelect = document.getElementById('vendor');
        
        // Set category
        if (categorySelect && transaction.category_id) {
            categorySelect.value = transaction.category_id;
            // If setting failed, try to find by name as fallback
            if (categorySelect.value !== transaction.category_id) {
                for (let i = 0; i < categorySelect.options.length; i++) {
                    if (categorySelect.options[i].textContent === transaction.category_name) {
                        categorySelect.selectedIndex = i;
                        break;
                    }
                }
            }
        }
        
        // Set vendor
        if (vendorSelect && transaction.vendor_id) {
            vendorSelect.value = transaction.vendor_id;
            // If setting failed, try to find by name as fallback
            if (vendorSelect.value !== transaction.vendor_id) {
                for (let i = 0; i < vendorSelect.options.length; i++) {
                    if (vendorSelect.options[i].textContent === transaction.vendor_name) {
                        vendorSelect.selectedIndex = i;
                        break;
                    }
                }
            }
        }
    }, 100); // Reduced from 500ms to 100ms
    
    // Handle attachment if present
    if (transaction.attachment_url) {
        document.getElementById('attachment-url').value = transaction.attachment_url;
        document.getElementById('attachment-type').value = transaction.attachment_type;
        document.getElementById('attachment-name').textContent = transaction.attachment_url.split('/').pop();
        
        // Show attachment preview
        const currentAttachment = document.getElementById('current-attachment');
        currentAttachment.classList.remove('hidden');
        
        // If it's an image, show the preview
        if (transaction.attachment_type === 'image') {
            const attachmentImage = document.getElementById('attachment-image');
            attachmentImage.src = transaction.attachment_url;
            attachmentImage.classList.remove('hidden');
        }
    }
}

// Load categories asynchronously and return a promise
/**
 * Load categories from API with improved error handling and retry logic
 */
async function loadCategories() {
    try {
        // Get user profile from localStorage
        const userProfile = window.getUserProfile();
        if (!userProfile || !userProfile.user_id) {
            console.warn('User ID not found in profile');
            return;
        }
        
        const userId = userProfile.user_id;
        
        // Try to fetch categories with retry
        const categoriesData = await fetchWithRetry(`http://127.0.0.1:5000/api/categories?user_id=${userId}`);
        
        if (categoriesData.status === 'success') {
            const categorySelect = document.getElementById('category');
            
            // Clear existing options except the first one
            while (categorySelect.options.length > 1) {
                categorySelect.remove(1);
            }
            
            // Add categories
            categoriesData.data.forEach(category => {
                const option = document.createElement('option');
                option.value = category.category_id;
                option.textContent = category.category_name;
                categorySelect.appendChild(option);
            });
            
            // Add "Create New" option
            const newOption = document.createElement('option');
            newOption.value = 'new';
            newOption.textContent = '+ Create New Category';
            categorySelect.appendChild(newOption);
            
            // Set category from extracted data if available
            setTimeout(() => {
                if (window.extractedCategory) {
                    let matchFound = false;
                    
                    // Try to find an exact match first
                    for (let i = 0; i < categorySelect.options.length; i++) {
                        const option = categorySelect.options[i];
                        if (option.textContent.toLowerCase() === window.extractedCategory.toLowerCase()) {
                            categorySelect.value = option.value;
                            matchFound = true;
                            break;
                        }
                    }
                    
                    if (!matchFound) {
                        // Select "Create New" and fill in the name
                        categorySelect.value = 'new';
                        const newCategoryGroup = document.getElementById('new-category-group');
                        newCategoryGroup.classList.remove('hidden');
                        document.getElementById('new-category').value = window.extractedCategory;
                        document.getElementById('new-category').setAttribute('required', true);
                    }
                }
            }, 100); // Reduced from 200ms to 100ms for quicker response
        } else {
            throw new Error(categoriesData.message || 'Failed to load categories');
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        // Show toast but don't interrupt the flow
        window.showToast('Error loading categories. Try refreshing the page.');
    }
}

// Load vendors asynchronously and return a promise
/**
 * Load vendors from API with improved error handling and retry logic
 */
async function loadVendors() {
    try {
        // Get user profile from localStorage
        const userProfile = window.getUserProfile();
        if (!userProfile || !userProfile.user_id) {
            console.warn('User ID not found in profile');
            return;
        }
        
        const userId = userProfile.user_id;
        
        // Try to fetch vendors with retry
        const vendorsData = await fetchWithRetry(`http://127.0.0.1:5000/api/vendors?user_id=${userId}`);
        
        if (vendorsData.status === 'success') {
            const vendorSelect = document.getElementById('vendor');
            
            // Clear existing options except the first one
            while (vendorSelect.options.length > 1) {
                vendorSelect.remove(1);
            }
            
            // Add vendors
            vendorsData.data.forEach(vendor => {
                const option = document.createElement('option');
                option.value = vendor.vendor_id;
                option.textContent = vendor.vendor_name;
                option.dataset.categoryId = vendor.category_id;
                vendorSelect.appendChild(option);
            });
            
            // Add "Create New" option
            const newOption = document.createElement('option');
            newOption.value = 'new';
            newOption.textContent = '+ Create New Vendor';
            vendorSelect.appendChild(newOption);
            
            // Set vendor from extracted data if available
            setTimeout(() => {
                if (window.extractedVendor) {
                    let matchFound = false;
                    
                    // Try to find an exact match first
                    for (let i = 0; i < vendorSelect.options.length; i++) {
                        const option = vendorSelect.options[i];
                        if (option.textContent.toLowerCase() === window.extractedVendor.toLowerCase()) {
                            vendorSelect.value = option.value;
                            matchFound = true;
                            break;
                        }
                    }
                    
                    if (!matchFound) {
                        // Select "Create New" and fill in the name
                        vendorSelect.value = 'new';
                        const newVendorGroup = document.getElementById('new-vendor-group');
                        newVendorGroup.classList.remove('hidden');
                        document.getElementById('new-vendor').value = window.extractedVendor;
                        document.getElementById('new-vendor').setAttribute('required', true);
                    }
                }
            }, 100); // Reduced from 300ms to 100ms for better performance
        } else {
            throw new Error(vendorsData.message || 'Failed to load vendors');
        }
    } catch (error) {
        console.error('Error loading vendors:', error);
        // Show toast but don't interrupt the flow
        window.showToast('Error loading vendors. Try refreshing the page.');
    }
}

// Save transaction to the backend
/**
 * Save transaction to the backend
 * @param {Object} transactionData - The transaction data to save
 */
async function saveTransaction(transactionData) {
    try {
        console.log('saveTransaction called with:', transactionData);
        
        // Make sure vendor_id is included
        if (!transactionData.vendor_id) {
            // Get it directly from the select element as a last resort
            const vendorSelect = document.getElementById('vendor');
            if (vendorSelect && vendorSelect.value) {
                transactionData.vendor_id = vendorSelect.value;
            } else {
                throw new Error('Vendor ID is required but could not be determined');
            }
        }
        
        // Double-check all required fields
        const requiredFields = ['user_id', 'title', 'amount', 'transaction_date', 'category_id', 'vendor_id'];
        for (const field of requiredFields) {
            if (!transactionData[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }
        
        const isUpdate = !!transactionData.transaction_id;
        const url = isUpdate 
            ? `http://127.0.0.1:5000/api/transactions/${transactionData.transaction_id}` 
            : 'http://127.0.0.1:5000/api/transactions';
        const method = isUpdate ? 'PUT' : 'POST';
        
        console.log(`Sending ${method} request to ${url}`);
        
        // Format transaction date if needed
        if (transactionData.transaction_date) {
            // Ensure date is in the format expected by the server (YYYY-MM-DD)
            const dateObj = new Date(transactionData.transaction_date);
            if (!isNaN(dateObj.getTime())) {
                transactionData.transaction_date = dateObj.toISOString().split('T')[0];
            }
        }
        
        // Create final payload with proper handling for nullable fields
        const payload = {
            user_id: transactionData.user_id,
            title: transactionData.title,
            amount: transactionData.amount,
            transaction_date: transactionData.transaction_date,
            category_id: transactionData.category_id,
            vendor_id: transactionData.vendor_id
        };
        
        // Only add attachment fields if they have values
        if (transactionData.attachment_url) {
            payload.attachment_url = transactionData.attachment_url;
            
            // Always ensure attachment_type is provided when attachment_url exists
            if (!transactionData.attachment_type) {
                // Auto-detect type from URL
                if (payload.attachment_url.match(/\.(jpeg|jpg|png|gif)$/i)) {
                    payload.attachment_type = 'image';
                } else if (payload.attachment_url.match(/\.(pdf)$/i)) {
                    payload.attachment_type = 'pdf';
                } else if (payload.attachment_url.match(/\.(mp3|wav|ogg)$/i)) {
                    payload.attachment_type = 'audio';
                } else {
                    payload.attachment_type = 'file';
                }
            } else {
                payload.attachment_type = transactionData.attachment_type;
            }
        }
        // Do not set attachment fields at all if no URL is provided
        
        if (transactionData.transaction_id) {
            payload.transaction_id = transactionData.transaction_id;
        }
        
        console.log('Final payload:', payload);
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error response:', errorText);
            throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Response data:', result);
        
        if (result.status !== 'success') {
            throw new Error(result.message || 'Failed to save transaction');
        }

        // Show success message and immediately redirect
        window.showToast('Transaction saved successfully');

        // Use window.location.replace instead of window.location.href to prevent adding to browser history
        setTimeout(() => {
            window.location.replace('transactions.html');
        }, 500);
        
        return result;
    } catch (error) {
        console.error('Error in saveTransaction:', error);
        throw error;
    }
}

// Delete a transaction
/**
 * Delete a transaction
 * @param {string} transactionId - The ID of the transaction to delete
 */
async function deleteTransaction(transactionId) {
    try {
        const userProfile = window.getUserProfile();
        if (!userProfile || !userProfile.user_id) {
            throw new Error('User profile not found');
        }
        
        const userId = userProfile.user_id;
        const response = await fetch(`http://127.0.0.1:5000/api/transactions/${transactionId}?user_id=${userId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to delete transaction (${response.status})`);
        }
        
        const result = await response.json();
        
        if (result.status !== 'success') {
            throw new Error(result.message || 'Failed to delete transaction');
        }
        
        return result;
    } catch (error) {
        console.error('Error deleting transaction:', error);
        throw error;
    }
}

// Handle file selection for attachment
/**
 * Handle file selection for attachment
 * @param {File} file - The selected file
 */
function handleFileSelection(file) {
    if (!file) return;
    
    const currentAttachment = document.getElementById('current-attachment');
    const attachmentImage = document.getElementById('attachment-image');
    const attachmentName = document.getElementById('attachment-name');
    
    // Show file name
    attachmentName.textContent = file.name;
    
    // Clear previous image
    attachmentImage.src = '';
    attachmentImage.classList.add('hidden');
    
    // Show attachment section
    currentAttachment.classList.remove('hidden');
    
    // If it's an image, show preview
    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            attachmentImage.src = e.target.result;
            attachmentImage.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

// Fetch with retry functionality
/**
 * Updated fetchWithRetry to handle AbortController signals
 */
async function fetchWithRetry(url, options = {}, retries = 3, delay = 1000) {
    try {
        const response = await fetch(url, options);
        
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        // If this is an abort error, don't retry
        if (error.name === 'AbortError') {
            throw error;
        }
        
        if (retries <= 0) {
            throw error;
        }
        
        console.log(`Retrying fetch for ${url}. Retries left: ${retries-1}`);
        
        // Wait for the specified delay
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Retry with one fewer retry remaining, and preserve the signal if present
        return fetchWithRetry(url, options, retries - 1, delay);
    }
}