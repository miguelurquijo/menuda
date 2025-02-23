from flask import Flask, jsonify, request
import mysql.connector
from mysql.connector import Error
from datetime import datetime
import os
from typing import Dict, List, Optional
import logging
from dotenv import load_dotenv
from flask_cors import CORS 

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://127.0.0.1:8080", "http://localhost:8080"],
        "methods": ["GET", "POST", "PUT", "DELETE"],
        "allow_headers": ["Content-Type"]
    }
})

def get_db_connection():
    """
    Creates and returns a connection to the MySQL RDS database.
    """
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            database=os.getenv('DB_NAME'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            port=3306,
            connection_timeout=5
        )
        if connection.is_connected():
            return connection
    except Error as e:
        logger.error(f"Error connecting to MySQL database: {str(e)}")
        raise

@app.route('/api/transactions', methods=['GET'])
def get_transactions() -> Dict:
    """
    Retrieves transactions for a specific user with their associated vendor and category details.
    
    Query Parameters:
        user_id (required): The ID of the user whose transactions to retrieve
    
    Returns:
        Dict: JSON response containing:
            - status: str - 'success' or 'error'
            - data: List[Dict] - list of transactions (if successful)
            - count: int - number of transactions returned
            - message: str - error message (if failed)
    """
    # Get and validate user_id parameter
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({
            'status': 'error',
            'message': 'Missing required parameter: user_id'
        }), 400

    connection = None
    cursor = None
    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
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
                t.is_deleted = FALSE
                AND t.user_id = %s
            ORDER BY 
                t.transaction_date DESC
        """
        
        cursor.execute(query, (user_id,))
        transactions = cursor.fetchall()
        
        # Convert datetime objects to ISO format strings
        for transaction in transactions:
            for key, value in transaction.items():
                if isinstance(value, datetime):
                    transaction[key] = value.isoformat()
        
        logger.info(f"Retrieved {len(transactions)} transactions for user_id: {user_id}")
        return jsonify({
            'status': 'success',
            'data': transactions,
            'count': len(transactions)
        })
        
    except Error as e:
        logger.error(f"Database error for user_id {user_id}: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f"Database error: {str(e)}"
        }), 500
        
    except Exception as e:
        logger.error(f"Unexpected error for user_id {user_id}: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': "An unexpected error occurred"
        }), 500
        
    finally:
        if cursor:
            cursor.close()
        if connection and connection.is_connected():
            connection.close()
            logger.info(f"Database connection closed for user_id: {user_id}")

if __name__ == '__main__':
    app.run(debug=True)