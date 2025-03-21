"""
Updated transaction-related routes for Menuda Finance API with NULL handling
"""
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from utils.db import get_db_connection, close_connection

# Create blueprint without url_prefix (will be set in main.py)
transactions_bp = Blueprint('transactions', __name__)

# Add this to the existing transactions_bp in backend/routes/transactions.py
@transactions_bp.route('/transactions', methods=['POST'])
def create_transaction():
    """
    Create a new transaction with improved attachment handling
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
        print(f"Received transaction data: {data}")
        
        # Validate required fields
        required_fields = ['user_id', 'title', 'amount', 'transaction_date', 'category_id', 'vendor_id']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Connect to database
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Generate transaction ID
        transaction_id = str(uuid.uuid4())
        
        # Check if attachment fields exist
        has_attachment_url = 'attachment_url' in data and data['attachment_url']
        has_attachment_type = 'attachment_type' in data and data['attachment_type']
        
        # Decide what query to use based on attachment presence
        if has_attachment_url and has_attachment_type:
            # Query with attachments
            query = """
            INSERT INTO transactions (
                transaction_id, user_id, title, amount, transaction_date, 
                category_id, vendor_id, attachment_url, attachment_type,
                created_at, updated_at, is_deleted
            ) VALUES (
                %s, %s, %s, %s, %s, 
                %s, %s, %s, %s,
                NOW(), NOW(), FALSE
            )
            """
            
            cursor.execute(query, (
                transaction_id,
                data['user_id'],
                data['title'],
                data['amount'],
                data['transaction_date'],
                data['category_id'],
                data['vendor_id'],
                data['attachment_url'],
                data['attachment_type']
            ))
        else:
            # Query without attachments (let DB use default NULL values)
            query = """
            INSERT INTO transactions (
                transaction_id, user_id, title, amount, transaction_date, 
                category_id, vendor_id, created_at, updated_at, is_deleted
            ) VALUES (
                %s, %s, %s, %s, %s, 
                %s, %s, NOW(), NOW(), FALSE
            )
            """
            
            cursor.execute(query, (
                transaction_id,
                data['user_id'],
                data['title'],
                data['amount'],
                data['transaction_date'],
                data['category_id'],
                data['vendor_id']
            ))
        
        connection.commit()
        
        # Get the newly created transaction
        get_query = """
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
        """
        
        cursor.execute(get_query, (transaction_id,))
        new_transaction = cursor.fetchone()
        
        # Format dates for JSON serialization
        if 'transaction_date' in new_transaction and new_transaction['transaction_date']:
            new_transaction['transaction_date'] = new_transaction['transaction_date'].isoformat()
        if 'created_at' in new_transaction and new_transaction['created_at']:
            new_transaction['created_at'] = new_transaction['created_at'].isoformat()
        if 'updated_at' in new_transaction and new_transaction['updated_at']:
            new_transaction['updated_at'] = new_transaction['updated_at'].isoformat()
        
        return jsonify({
            'status': 'success',
            'message': 'Transaction created successfully',
            'data': new_transaction
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

# Add this PUT endpoint for updating transactions
@transactions_bp.route('/transactions/<transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    """
    Update an existing transaction
    Request Body:
        JSON containing transaction details
    Returns:
        JSON: Updated transaction details
    """
    connection = None
    cursor = None
    
    try:
        # Get request data
        data = request.json
        
        # Validate required fields
        required_fields = ['user_id', 'title', 'amount', 'transaction_date', 'category_id', 'vendor_id']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Connect to database
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Check if transaction exists and belongs to user
        check_query = """
        SELECT transaction_id FROM transactions 
        WHERE transaction_id = %s AND user_id = %s AND is_deleted = FALSE
        """
        
        cursor.execute(check_query, (transaction_id, data['user_id']))
        existing_transaction = cursor.fetchone()
        
        if not existing_transaction:
            return jsonify({
                'status': 'error',
                'message': 'Transaction not found or not owned by this user'
            }), 404
        
        # Prepare attachment fields with proper NULL handling
        attachment_url = data.get('attachment_url')
        attachment_type = data.get('attachment_type')
        
        # Ensure both attachment fields are either both present or both NULL
        if attachment_url and not attachment_type:
            # Auto-detect attachment type based on URL if missing
            if attachment_url.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
                attachment_type = 'image'
            elif attachment_url.lower().endswith('.pdf'):
                attachment_type = 'pdf'
            elif attachment_url.lower().endswith(('.mp3', '.wav', '.ogg')):
                attachment_type = 'audio'
            else:
                attachment_type = 'file'
        elif not attachment_url:
            attachment_type = None
        
        # Update transaction
        update_query = """
        UPDATE transactions SET
            title = %s,
            amount = %s,
            transaction_date = %s,
            category_id = %s,
            vendor_id = %s,
            attachment_url = %s,
            attachment_type = %s,
            updated_at = NOW()
        WHERE transaction_id = %s
        """
        
        cursor.execute(update_query, (
            data['title'],
            data['amount'],
            data['transaction_date'],
            data['category_id'],
            data['vendor_id'],
            attachment_url,
            attachment_type,
            transaction_id
        ))
        
        connection.commit()
        
        # Get the updated transaction
        get_query = """
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
        """
        
        cursor.execute(get_query, (transaction_id,))
        updated_transaction = cursor.fetchone()
        
        # Format dates for JSON serialization
        if 'transaction_date' in updated_transaction and updated_transaction['transaction_date']:
            updated_transaction['transaction_date'] = updated_transaction['transaction_date'].isoformat()
        if 'created_at' in updated_transaction and updated_transaction['created_at']:
            updated_transaction['created_at'] = updated_transaction['created_at'].isoformat()
        if 'updated_at' in updated_transaction and updated_transaction['updated_at']:
            updated_transaction['updated_at'] = updated_transaction['updated_at'].isoformat()
        
        return jsonify({
            'status': 'success',
            'message': 'Transaction updated successfully',
            'data': updated_transaction
        })
        
    except Exception as e:
        print(f"Error in update_transaction: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Server error occurred: {str(e)}'
        }), 500
    
    finally:
        # Clean up resources
        close_connection(connection, cursor)

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

