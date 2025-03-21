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

@transactions_bp.route('/transactions', methods=['POST'])
def create_transaction():
    """
    Create a new transaction
    Request Body:
        JSON containing transaction details
    Returns:
        JSON: Created transaction details
    """
    connection = None
    cursor = None
    
    try:
        # Get request data
        data = request.json
        
        # Validate required fields
        required_fields = ['user_id', 'title', 'amount', 'category_id', 'vendor_id', 'transaction_date']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Connect to database
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Generate UUID for the transaction
        import uuid
        transaction_id = str(uuid.uuid4())
        
        # Prepare query - now allowing NULL for attachment fields
        query = """
        INSERT INTO transactions (
            transaction_id, user_id, title, amount, category_id, vendor_id, 
            transaction_date, attachment_url, attachment_type, created_at, updated_at, is_deleted
        ) VALUES (
            %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW(), FALSE
        )
        """
        
        # Get optional fields with None as default
        attachment_url = data.get('attachment_url')
        attachment_type = data.get('attachment_type')
        
        # Execute query
        cursor.execute(query, (
            transaction_id,
            data['user_id'],
            data['title'],
            data['amount'],
            data['category_id'],
            data['vendor_id'],
            data['transaction_date'],
            attachment_url,  # Can be None
            attachment_type  # Can be None
        ))
        
        # Commit changes
        connection.commit()
        
        return jsonify({
            'status': 'success',
            'message': 'Transaction created successfully',
            'transaction_id': transaction_id
        })
        
    except Exception as e:
        print(f"Error in create_transaction: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Server error occurred: {str(e)}'
        }), 500
    
    finally:
        # Clean up resources
        close_connection(connection, cursor)

@transactions_bp.route('/transactions/<transaction_id>', methods=['GET'])
def get_transaction(transaction_id):
    """
    Get a single transaction by ID
    Query Parameters:
        user_id: UUID of the user
    Returns:
        JSON: Transaction with its details
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
            t.user_id = %s
            AND t.transaction_id = %s
            AND t.is_deleted = FALSE
        """
        
        cursor.execute(query, (user_id, transaction_id))
        transaction = cursor.fetchone()
        
        if not transaction:
            return jsonify({
                'status': 'error',
                'message': 'Transaction not found'
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
            'message': 'Server error occurred'
        }), 500
    
    finally:
        # Clean up resources
        close_connection(connection, cursor)