/**
 * Transaction Detail Page
 * Handles creating, viewing, and editing transaction records
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check URL parameters for prefill data
    const urlParams = new URLSearchParams(window.location.search);
    const isPrefill = urlParams.get('prefill') === 'true';
    
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

/**
 * Initialize page elements and event listeners
 */
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
    }
    
    // Load categories and vendors
    loadCategories();
    loadVendors();
    
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
    
    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            // Show loading state
            showToast('Saving transaction...');
            
            // Get form data
            const formData = new FormData(form);
            
            // Get user profile
            const userProfile = getUserProfile();
            if (!userProfile || !userProfile.user_id) {
                throw new Error('User profile not found');
            }
            
            // Get original selected values from the form elements
            const categorySelectValue = categorySelect.value;
            const vendorSelectValue = vendorSelect.value;
            
            // Create transaction data with basic info
            let transactionData = {
                user_id: userProfile.user_id,
                title: formData.get('title'),
                amount: parseFloat(formData.get('amount')),
                transaction_date: formData.get('transaction_date')
            };
            
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
                // Use the current category ID for the new vendor
                const newVendor = await createVendor(userProfile.user_id, newVendorName, categoryId);
                vendorId = newVendor.vendor_id;
            }
            
            // Assign vendor to transaction data
            transactionData.vendor_id = vendorId;
            
            // Save transaction with proper IDs
            await saveTransaction(transactionData);
            
            // Show success message and redirect
            showToast('Transaction saved successfully');
            setTimeout(() => {
                window.location.href = 'transactions.html';
            }, 1000);
        } catch (error) {
            console.error('Error saving transaction:', error);
            showToast('Error: ' + error.message);
        }
    });
    
    // Handle delete transaction
    if (deleteButton) {
        deleteButton.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this transaction?')) {
                try {
                    await deleteTransaction(transactionId);
                    showToast('Transaction deleted successfully');
                    
                    // Redirect to transactions list after a short delay
                    setTimeout(() => {
                        window.location.href = 'transactions.html';
                    }, 1000);
                } catch (error) {
                    console.error('Error deleting transaction:', error);
                    showToast('Error deleting transaction: ' + error.message);
                }
            }
        });
    }
    
    // Handle attachment preview
    fileInput.addEventListener('change', (e) => {
        handleFileSelection(e.target.files[0]);
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

/**
 * Get user profile from localStorage
 * @returns {Object|null} User profile or null if not found
 */
function getUserProfile() {
    const userProfileString = localStorage.getItem('userProfile');
    return userProfileString ? JSON.parse(userProfileString) : null;
}

/**
 * Create a new category
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
        
        const response = await fetch('http://localhost:5000/api/categories', {
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
        
        const response = await fetch('http://localhost:5000/api/vendors', {
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

/**
 * Load categories from API
 */
function loadCategories() {
    try {
        // Get user profile from localStorage
        const userProfile = getUserProfile();
        if (!userProfile || !userProfile.user_id) {
            console.warn('User ID not found in profile');
            return;
        }
        
        const userId = userProfile.user_id;
        
        // Now make the API call with the correct userId
        fetch(`http://localhost:5000/api/categories?user_id=${userId}`)
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
                showToast('Error loading categories');
            });
    } catch (error) {
        console.error('Error in loadCategories function:', error);
    }
}

/**
 * Load vendors from API
 */
function loadVendors() {
    try {
        // Get user profile from localStorage
        const userProfile = getUserProfile();
        if (!userProfile || !userProfile.user_id) {
            console.warn('User ID not found in profile');
            return;
        }
        
        const userId = userProfile.user_id;
        
        // Now make the API call with the correct userId
        fetch(`http://localhost:5000/api/vendors?user_id=${userId}`)
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
                showToast('Error loading vendors');
            });
    } catch (error) {
        console.error('Error in loadVendors function:', error);
    }
}

/**
 * Load transaction details for editing
 * @param {string} transactionId - The ID of the transaction to load
 */
async function loadTransaction(transactionId) {
    try {
        const userProfile = getUserProfile();
        if (!userProfile || !userProfile.user_id) {
            throw new Error('User profile not found');
        }
        
        const userId = userProfile.user_id;
        const response = await fetch(`http://localhost:5000/api/transactions?user_id=${userId}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load transactions (${response.status})`);
        }
        
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to load transactions');
        }
        
        // Find the transaction by ID
        const transaction = data.data.find(t => t.transaction_id === transactionId);
        
        if (!transaction) {
            throw new Error('Transaction not found');
        }
        
        // Fill form fields
        document.getElementById('title').value = transaction.title;
        document.getElementById('amount').value = transaction.amount;
        
        // Format date properly
        const date = new Date(transaction.transaction_date);
        const formattedDate = date.toISOString().split('T')[0];
        document.getElementById('transaction-date').value = formattedDate;
        
        // Set category and vendor (after a delay to ensure they're loaded)
        setTimeout(() => {
            document.getElementById('category').value = transaction.category_id;
            document.getElementById('vendor').value = transaction.vendor_id;
        }, 500);
        
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
    } catch (error) {
        console.error('Error loading transaction:', error);
        showToast('Error loading transaction details: ' + error.message);
    }
}

/**
 * Save transaction to the backend
 * @param {Object} transactionData - The transaction data to save
 */
async function saveTransaction(transactionData) {
    try {
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
            ? `http://localhost:5000/api/transactions/${transactionData.transaction_id}` 
            : 'http://localhost:5000/api/transactions';
        const method = isUpdate ? 'PUT' : 'POST';
        
        // Format transaction date if needed
        if (transactionData.transaction_date) {
            // Ensure date is in the format expected by the server (YYYY-MM-DD)
            const dateObj = new Date(transactionData.transaction_date);
            if (!isNaN(dateObj.getTime())) {
                transactionData.transaction_date = dateObj.toISOString().split('T')[0];
            }
        }
        
        // Create final payload with default values for nullable fields
        const payload = {
            user_id: transactionData.user_id,
            title: transactionData.title,
            amount: transactionData.amount,
            transaction_date: transactionData.transaction_date,
            category_id: transactionData.category_id,
            vendor_id: transactionData.vendor_id,
            attachment_url: transactionData.attachment_url || '', // Empty string instead of null
            attachment_type: transactionData.attachment_type || 'none' // 'none' instead of null
        };
        
        if (transactionData.transaction_id) {
            payload.transaction_id = transactionData.transaction_id;
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status !== 'success') {
            throw new Error(result.message || 'Failed to save transaction');
        }
        
        return result;
    } catch (error) {
        console.error('Error saving transaction:', error);
        throw error;
    }
}

/**
 * Delete a transaction
 * @param {string} transactionId - The ID of the transaction to delete
 */
async function deleteTransaction(transactionId) {
    try {
        const userProfile = getUserProfile();
        if (!userProfile || !userProfile.user_id) {
            throw new Error('User profile not found');
        }
        
        const userId = userProfile.user_id;
        const response = await fetch(`http://localhost:5000/api/transactions/${transactionId}?user_id=${userId}`, {
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

/**
 * Handle file upload for attachments
 * @param {File} file - The file to upload
 * @param {Object} transactionData - The transaction data to update with attachment info
 */
async function handleFileUpload(file, transactionData) {
    // In a real implementation, you would upload the file to a server
    // and get back a URL. For this prototype, we'll simulate it.
    
    // Determine attachment type
    let attachmentType = 'file';
    if (file.type.startsWith('image/')) {
        attachmentType = 'image';
    } else if (file.type === 'application/pdf') {
        attachmentType = 'pdf';
    } else if (file.type.startsWith('audio/')) {
        attachmentType = 'audio';
    }
    
    // In a real implementation, this would be the URL returned from the server
    // For this prototype, we're simulating it
    const mockUploadUrl = `https://storage.menuda.com/attachments/${Date.now()}_${file.name}`;
    
    // Update transaction data with attachment info
    transactionData.attachment_url = mockUploadUrl;
    transactionData.attachment_type = attachmentType;
    
    return true;
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 */
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.remove('hidden');
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}