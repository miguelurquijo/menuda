"""
Updated transaction-related routes for Menuda Finance API with NULL handling
"""
from flask import Blueprint, request, jsonify
from utils.db import get_db_connection, close_connection

# Create blueprint without url_prefix (will be set in main.py)
transactions_bp = Blueprint('transactions', __name__)

@transactions_bp.route('/transactions', methods=['GET'])
def get_transactions():
    """
    Get user transactions
    Query Parameters:
        user_id: UUID of the user
    Returns:
        JSON: Array of transactions with their details
    """
    connection = None
    cursor = None
    
    try:
        # Get query parameters
        user_id = request.args.get('user_id')
        
        if not user_id:
            return jsonify({
                'status': 'error',
                'message': 'Missing required parameter: user_id'
            }), 400
        
        # Connect to database
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Get transactions with category and vendor details
        query = """
        SELECT 
            t.transaction_id,
            t.title,
            t.amount,
            t.transaction_date,
            t.attachment_url,
            t.attachment_type,
            t.created_at,
            t.updated_at,
            c.category_id,
            c.category_name,
            v.vendor_id,
            v.vendor_name
        FROM 
            transactions t
            JOIN categories c ON t.category_id = c.category_id
            JOIN vendors v ON t.vendor_id = v.vendor_id
        WHERE 
            t.user_id = %s
            AND t.is_deleted = FALSE
        ORDER BY 
            t.transaction_date DESC
        """
        
        cursor.execute(query, (user_id,))
        transactions = cursor.fetchall()
        
        # Format dates for JSON serialization
        for transaction in transactions:
            if 'transaction_date' in transaction and transaction['transaction_date']:
                transaction['transaction_date'] = transaction['transaction_date'].isoformat()
            if 'created_at' in transaction and transaction['created_at']:
                transaction['created_at'] = transaction['created_at'].isoformat()
            if 'updated_at' in transaction and transaction['updated_at']:
                transaction['updated_at'] = transaction['updated_at'].isoformat()
        
        return jsonify({
            'status': 'success',
            'data': transactions,
            'count': len(transactions)
        })
        
    except Exception as e:
        print(f"Error in get_transactions: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Server error occurred'
        }), 500
    
    finally:
        # Clean up resources
        close_connection(connection, cursor)

@transactions_bp.route('/transactions/<transaction_id>', methods=['GET'])
def get_transaction(transaction_id):
    """
    Get a single transaction by ID
    Query Parameters:
        user_id: UUID of the user (for security verification)
    Returns:
        JSON: Transaction details
    """
    connection = None
    cursor = None
    
    try:
        # Get query parameters
        user_id = request.args.get('user_id')
        
        if not user_id:
            return jsonify({
                'status': 'error',
                'message': 'Missing required parameter: user_id'
            }), 400
        
        # Connect to database
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Get transaction with category and vendor details
        query = """
        SELECT 
            t.transaction_id,
            t.title,
            t.amount,
            t.transaction_date,
            t.attachment_url,
            t.attachment_type,
            t.created_at,
            t.updated_at,
            c.category_id,
            c.category_name,
            v.vendor_id,
            v.vendor_name
        FROM 
            transactions t
            JOIN categories c ON t.category_id = c.category_id
            JOIN vendors v ON t.vendor_id = v.vendor_id
        WHERE 
            t.transaction_id = %s
            AND t.user_id = %s
            AND t.is_deleted = FALSE
        """
        
        cursor.execute(query, (transaction_id, user_id))
        transaction = cursor.fetchone()
        
        if not transaction:
            return jsonify({
                'status': 'error',
                'message': 'Transaction not found or not owned by this user'
            }), 404
        
        # Format dates for JSON serialization
        if 'transaction_date' in transaction and transaction['transaction_date']:
            transaction['transaction_date'] = transaction['transaction_date'].isoformat()
        if 'created_at' in transaction and transaction['created_at']:
            transaction['created_at'] = transaction['created_at'].isoformat()
        if 'updated_at' in transaction and transaction['updated_at']:
            transaction['updated_at'] = transaction['updated_at'].isoformat()
        
        return jsonify({
            'status': 'success',
            'data': transaction
        })
        
    except Exception as e:
        print(f"Error in get_transaction: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Server error occurred: {str(e)}'
        }), 500
    
    finally:
        # Clean up resources
        close_connection(connection, cursor)
    

@transactions_bp.route('/transactions/<transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    """
    Delete a transaction by ID
    Query Parameters:
        user_id: UUID of the user (for security verification)
    Returns:
        JSON: Success message
    """
    connection = None
    cursor = None
    
    try:
        # Get query parameters
        user_id = request.args.get('user_id')
        
        if not user_id:
            return jsonify({
                'status': 'error',
                'message': 'Missing required parameter: user_id'
            }), 400
        
        # Connect to database
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Use soft delete by setting is_deleted flag to TRUE
        query = """
        UPDATE transactions 
        SET is_deleted = TRUE, updated_at = NOW()
        WHERE transaction_id = %s AND user_id = %s
        """
        
        cursor.execute(query, (transaction_id, user_id))
        
        # Check if any rows were affected
        if cursor.rowcount == 0:
            return jsonify({
                'status': 'error',
                'message': 'Transaction not found or not owned by this user'
            }), 404
        
        # Commit the change
        connection.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Transaction deleted successfully'
        })
        
    except Exception as e:
        print(f"Error in delete_transaction: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Server error occurred'
        }), 500
    
    finally:
        # Clean up resources
        close_connection(connection, cursor)