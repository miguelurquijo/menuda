/**
 * Menuda Finance - Transactions Management
 * Handles fetching and displaying user transactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (!checkUserLoggedIn()) {
        window.location.href = '../index.html';
        return;
    }

    // Initialize the transactions page
    initTransactionsPage();
});

/**
 * Check if user is logged in without causing infinite recursion
 * @return {boolean} True if user is logged in
 */
function checkUserLoggedIn() {
    const userProfile = localStorage.getItem('userProfile');
    return !!userProfile && !!JSON.parse(userProfile).user_id;
}

/**
 * Initialize the transactions page
 */
async function initTransactionsPage() {
    try {
        // Show loading state
        const transactionsContainer = document.getElementById('transactions-container');
        if (transactionsContainer) {
            transactionsContainer.innerHTML = '<p class="loading">Loading transactions...</p>';
        }

        // Get current user ID from localStorage directly
        const userProfile = localStorage.getItem('userProfile');
        if (!userProfile) {
            throw new Error('User profile not found');
        }
        
        const userId = JSON.parse(userProfile).user_id;
        if (!userId) {
            throw new Error('User ID not found');
        }

        // Display user info if the element exists
        const userProfileElement = document.getElementById('user-profile');
        if (userProfileElement) {
            const user = JSON.parse(userProfile);
            userProfileElement.innerHTML = `
                <div class="user-info">
                    <img src="${user.picture}" alt="${user.name}" class="profile-pic">
                    <span>${user.name}</span>
                </div>
            `;
        }

        // Fetch transactions from API
        const transactions = await fetchUserTransactions(userId);
        
        // Display transactions
        displayTransactions(transactions);
        
    } catch (error) {
        console.error('Error initializing transactions page:', error);
        const transactionsContainer = document.getElementById('transactions-container');
        if (transactionsContainer) {
            transactionsContainer.innerHTML = `<p class="error">Error loading transactions: ${error.message}</p>`;
        }
    }
}

/**
 * Fetch user transactions from the API
 * @param {string} userId - The user ID to fetch transactions for
 * @return {Promise<Array>} Promise resolving to array of transactions
 */
async function fetchUserTransactions(userId) {
    try {
        const response = await fetch(`http://localhost:5000/api/transactions?user_id=${userId}`);
        
        if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status !== 'success') {
            throw new Error(data.message || 'Failed to fetch transactions');
        }
        
        return data.data;
    } catch (error) {
        console.error('Error fetching transactions:', error);
        throw error;
    }
}

/**
 * Display transactions in the transactions container
 * @param {Array} transactions - Array of transaction objects
 */
function displayTransactions(transactions) {
    const transactionsContainer = document.getElementById('transactions-container');
    
    if (!transactionsContainer) {
        console.error('Transactions container not found');
        return;
    }
    
    if (!transactions || transactions.length === 0) {
        transactionsContainer.innerHTML = '<p class="empty">No transactions found</p>';
        return;
    }
    
    // Create transactions table
    let tableHtml = `
        <table class="transactions-table" data-lh-id="transactions-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Vendor</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    // Add transaction rows
    transactions.forEach(transaction => {
        // Format date
        const date = new Date(transaction.transaction_date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        // Format amount (positive for income, negative for expense)
        const amount = parseFloat(transaction.amount);
        const formattedAmount = new Intl.NumberFormat('en-US', { 
            style: 'currency', 
            currency: 'USD' 
        }).format(amount);
        
        const amountClass = amount >= 0 ? 'positive' : 'negative';
        
        tableHtml += `
            <tr data-lh-id="transaction-row">
                <td>${formattedDate}</td>
                <td>${transaction.title}</td>
                <td>${transaction.category_name}</td>
                <td>${transaction.vendor_name}</td>
                <td class="${amountClass}">${formattedAmount}</td>
            </tr>
        `;
    });
    
    tableHtml += `
            </tbody>
        </table>
    `;
    
    transactionsContainer.innerHTML = tableHtml;
}