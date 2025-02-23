/**
 * Transactions page functionality
 */
(function() {
    // DOM Elements
    const tableBody = document.getElementById('transactionsTableBody');
    const loader = document.getElementById('transactionsLoader');
    const errorDisplay = document.getElementById('transactionsError');

    /**
     * Format date to local string
     * @param {string} dateString - ISO 8601 date string
     * @returns {string} Formatted date string
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    /**
     * Format amount with currency symbol
     * @param {number} amount - Transaction amount
     * @returns {string} Formatted amount string
     */
    const formatAmount = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    /**
     * Create a table row for a transaction
     * @param {Object} transaction - Transaction data
     * @returns {HTMLTableRowElement} Table row element
     */
    const createTransactionRow = (transaction) => {
        const row = document.createElement('tr');
        row.setAttribute('data-lh-id', `transaction-${transaction.transaction_id}`);
        
        row.innerHTML = `
            <td>${transaction.title}</td>
            <td class="${transaction.amount >= 0 ? 'amount-positive' : 'amount-negative'}">
                ${formatAmount(transaction.amount)}
            </td>
            <td>${transaction.category_name}</td>
            <td>${transaction.vendor_name}</td>
            <td>${formatDate(transaction.transaction_date)}</td>
        `;
        
        return row;
    };

    /**
     * Fetch and display transactions
     */
    const loadTransactions = async () => {
        // Show loader
        loader.style.display = 'block';
        errorDisplay.style.display = 'none';
        
        try {
            // Debug local storage
            console.log('All localStorage items:', { ...localStorage });
            const userId = localStorage.getItem('userId');
            console.log('Retrieved userId:', userId);
            
            if (!userId) {
                throw new Error('User not authenticated');
            }
            
            console.log('Making API request with userId:', userId);
            
            const apiUrl = `http://localhost:5000/api/transactions?user_id=${userId}`;
            console.log('API URL:', apiUrl);
            
            const response = await fetch(apiUrl);
            console.log('API Response:', response);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch transactions: ${response.status}`);
            }

            const data = await response.json();
            console.log('API Data:', data);

            if (data.status === 'success') {
                // Clear existing rows
                tableBody.innerHTML = '';
                
                // Add new rows
                data.data.forEach(transaction => {
                    tableBody.appendChild(createTransactionRow(transaction));
                });
            } else {
                throw new Error(data.message || 'Failed to load transactions');
            }
        } catch (error) {
            console.error('Error loading transactions:', error);
            errorDisplay.textContent = error.message;
            errorDisplay.style.display = 'block';
        } finally {
            loader.style.display = 'none';
        }
    };

    // Initialize page
    document.addEventListener('DOMContentLoaded', () => {
        loadTransactions();
    });
})();