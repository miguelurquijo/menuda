/**
 * Menuda Finance - Transactions Management
 * Mobile-optimized version
 */

document.addEventListener('DOMContentLoaded', () => {
    // Check user login and load transactions
    const userProfile = localStorage.getItem('userProfile');
    if (!userProfile) {
        window.location.href = '../index.html';
        return;
    }
    
    const userData = JSON.parse(userProfile);
    loadTransactions(userData.user_id);
});

/**
 * Load transactions from the API
 */
async function loadTransactions(userId) {
    try {
        const container = document.getElementById('transactions-container');
        container.innerHTML = '<p class="loading">Loading transactions...</p>';
        
        const response = await fetch(`http://127.0.0.1:5000/api/transactions?user_id=${userId}`);
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.status !== 'success') {
            throw new Error(result.message || 'Failed to load transactions');
        }
        
        displayTransactions(result.data);
    } catch (error) {
        console.error('Error loading transactions:', error);
        const container = document.getElementById('transactions-container');
        container.innerHTML = `<p class="error">Error loading transactions</p>`;
    }
}

/**
 * Display transactions in the UI
 */
function displayTransactions(transactions) {
    const container = document.getElementById('transactions-container');
    
    if (!transactions || transactions.length === 0) {
        container.innerHTML = '<p class="empty">No transactions found</p>';
        return;
    }
    
    // Group by date
    const groups = groupByDate(transactions);
    let html = '';
    
    // Generate HTML for each date group
    Object.keys(groups).forEach(date => {
        html += `<h2 class="date-header">${date}</h2>`;
        
        groups[date].forEach(transaction => {
            // Format amount
            const amount = formatAmount(transaction.amount);
            
            // Add attachment icon if needed
            const attachmentIcon = transaction.attachment_url ? 
                '<span class="attachment-icon">📎</span>' : '';
            
            html += `
            <div class="transaction-item" onclick="viewTransactionDetail('${transaction.transaction_id}')">
                <div class="transaction-icon">
                    <div class="circle-icon"></div>
                </div>
                <div class="transaction-details">
                    <div class="transaction-title">${transaction.title} ${attachmentIcon}</div>
                    <div class="transaction-category">${transaction.category_name}</div>
                </div>
                <div class="transaction-amount">${amount}</div>
            </div>`;
        });
    });
    
    container.innerHTML = html;
}

/**
 * Group transactions by date with Spanish date format
 */
function groupByDate(transactions) {
    const groups = {};
    
    transactions.forEach(transaction => {
        const date = new Date(transaction.transaction_date);
        
        // Format the date for display
        let dateLabel;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        const transDate = new Date(date);
        transDate.setHours(0, 0, 0, 0);
        
        if (transDate.getTime() === today.getTime()) {
            dateLabel = 'Hoy';
        } else if (transDate.getTime() === yesterday.getTime()) {
            dateLabel = 'Ayer';
        } else {
            // Spanish format: day + month name
            const day = date.getDate();
            
            // Get month name in Spanish
            const monthNames = [
                'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
            ];
            const month = monthNames[date.getMonth()];
            
            dateLabel = `${day} ${month}`;
        }
        
        if (!groups[dateLabel]) {
            groups[dateLabel] = [];
        }
        
        groups[dateLabel].push(transaction);
    });
    
    return groups;
}

/**
 * Format amount for display without decimals and without currency symbol
 */
function formatAmount(amount) {
    // Format number with thousand separators but no currency symbol
    const formattedNumber = new Intl.NumberFormat('es-ES', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
    
    // Add the dollar sign manually
    return '$' + formattedNumber;
}



/**
 * Navigate to transaction detail page
 */
function viewTransactionDetail(transactionId) {
    window.location.href = `transaction-detail.html?id=${transactionId}`;
}

// Make function available globally
window.viewTransactionDetail = viewTransactionDetail;