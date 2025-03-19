/**
 * Transaction Detail Page
 * Handles creating, viewing, and editing transaction records
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // Initialize components
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
        
        // Set default date to today
        const today = new Date();
        const formattedDate = today.toISOString().split('T')[0];
        document.getElementById('transaction-date').value = formattedDate;
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
            // Validate form
            if (!validateForm()) {
                return;
            }
            
            // Get form data
            const formData = new FormData(form);
            
            // Prepare transaction data
            const transactionData = {
                user_id: JSON.parse(localStorage.getItem('userProfile')).uuid,
                transaction_id: formData.get('transaction_id') || null,
                title: formData.get('title'),
                amount: parseFloat(formData.get('amount')),
                transaction_date: formData.get('transaction_date'),
                category_id: formData.get('category_id'),
                vendor_id: formData.get('vendor_id'),
                new_category: formData.get('new_category'),
                new_vendor: formData.get('new_vendor'),
                attachment_url: formData.get('attachment_url') || null,
                attachment_type: formData.get('attachment_type') || null
            };
            
            // Handle file upload if present
            const file = fileInput.files[0];
            if (file) {
                await handleFileUpload(file, transactionData);
            }
            
            // Save transaction
            await saveTransaction(transactionData);
            
            // Show success message
            showToast('Transaction saved successfully');
            
            // Redirect to transactions list after a short delay
            setTimeout(() => {
                window.location.href = 'transactions.html';
            }, 1000);
            
        } catch (error) {
            console.error('Error saving transaction:', error);
            showToast('Error saving transaction. Please try again.');
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
                    showToast('Error deleting transaction. Please try again.');
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
 * Load categories from API
 */
function loadCategories() {
    try {
        // Get user profile from localStorage
        const userProfileString = localStorage.getItem('userProfile');
        let userId;
        
        if (userProfileString) {
            const userProfile = JSON.parse(userProfileString);
            // Look for user_id instead of uuid
            userId = userProfile.user_id;
            console.log('Using user_id from profile:', userId);
        }
        
        if (!userId) {
            console.warn('User ID not found in profile');
            // Use a default for testing or handle this case appropriately
            return;
        }
        
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
                }
            })
            .catch(error => {
                console.error('Error loading categories:', error);
            });
    } catch (error) {
        console.error('Error in loadCategories function:', error);
    }
}

/**
 * Load vendors from API
 */
async function loadVendors() {
    try {
        // Get user profile from localStorage
        const userProfileString = localStorage.getItem('userProfile');
        let userId;
        
        if (userProfileString) {
            const userProfile = JSON.parse(userProfileString);
            // Look for user_id instead of uuid
            userId = userProfile.user_id;
            console.log('Using user_id from profile:', userId);
        }
        
        if (!userId) {
            console.warn('User ID not found in profile');
            // Use a default for testing or handle this case appropriately
            return;
        }
        
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
                    
                    // Add categories
                    data.data.forEach(vendor => {
                        const option = document.createElement('option');
                        option.value = vendor.vendor_id;
                        option.textContent = vendor.vendor_name;
                        vendorSelect.appendChild(option);
                    });
                    
                    // Add "Create New" option
                    const newOption = document.createElement('option');
                    newOption.value = 'new';
                    newOption.textContent = '+ Create New Vendor';
                    vendorSelect.appendChild(newOption);
                }
            })
            .catch(error => {
                console.error('Error loading categories:', error);
            });
    } catch (error) {
        console.error('Error in loadCategories function:', error);
    }
}

/**
 * Load transaction details for editing
 * @param {string} transactionId - The ID of the transaction to load
 */
async function loadTransaction(transactionId) {
    try {
        const userId = JSON.parse(localStorage.getItem('userProfile')).uuid;
        const response = await fetch(`/api/transactions/${transactionId}?user_id=${userId}`);
        
        if (!response.ok) {
            throw new Error('Failed to load transaction');
        }
        
        const data = await response.json();
        
        if (data.status === 'success') {
            const transaction = data.data;
            
            // Fill form fields
            document.getElementById('title').value = transaction.title;
            document.getElementById('amount').value = transaction.amount;
            document.getElementById('transaction-date').value = new Date(transaction.transaction_date).toISOString().split('T')[0];
            
            // Wait for categories and vendors to load before setting values
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
        }
    } catch (error) {
        console.error('Error loading transaction:', error);
        showToast('Error loading transaction details');
    }
}

/**
 * Save transaction to the backend
 * @param {Object} transactionData - The transaction data to save
 */
async function saveTransaction(transactionData) {
    const isUpdate = !!transactionData.transaction_id;
    const url = isUpdate ? `/api/transactions/${transactionData.transaction_id}` : '/api/transactions';
    const method = isUpdate ? 'PUT' : 'POST';
    
    const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(transactionData)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save transaction');
    }
    
    return await response.json();
}

/**
 * Delete a transaction
 * @param {string} transactionId - The ID of the transaction to delete
 */
async function deleteTransaction(transactionId) {
    const userId = JSON.parse(localStorage.getItem('userProfile')).uuid;
    const response = await fetch(`/api/transactions/${transactionId}?user_id=${userId}`, {
        method: 'DELETE'
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete transaction');
    }
    
    return await response.json();
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
 * Validate form data before submission
 * @returns {boolean} True if form is valid
 */
function validateForm() {
    const categorySelect = document.getElementById('category');
    const vendorSelect = document.getElementById('vendor');
    const newCategoryInput = document.getElementById('new-category');
    const newVendorInput = document.getElementById('new-vendor');
    
    // Validate category
    if (categorySelect.value === 'new' && !newCategoryInput.value.trim()) {
        showToast('Please enter a category name');
        newCategoryInput.focus();
        return false;
    }
    
    // Validate vendor
    if (vendorSelect.value === 'new' && !newVendorInput.value.trim()) {
        showToast('Please enter a vendor name');
        newVendorInput.focus();
        return false;
    }
    
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