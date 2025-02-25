"""
User-related routes for Menuda Finance API
"""
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify
from utils.db import get_db_connection, close_connection

# Create blueprint without url_prefix (will be set in main.py)
users_bp = Blueprint('users', __name__)

@users_bp.route('/users/check', methods=['POST'])
def check_user():
    """
    Check if user exists in database and return UUID
    If user doesn't exist, create new user with UUID
    Returns:
        JSON: User ID and status
    """
    connection = None
    cursor = None
    
    try:
        # Get request data
        data = request.json
        
        if not data or 'email' not in data or 'name' not in data:
            return jsonify({
                'status': 'error',
                'message': 'Missing required user data'
            }), 400
        
        # Extract user data
        email = data['email']
        name = data['name']
        picture = data.get('picture', '')  # Optional
        
        # Connect to database
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Check if user exists
        cursor.execute(
            "SELECT user_id FROM users WHERE email = %s",
            (email,)
        )
        user = cursor.fetchone()
        
        # Get current timestamp
        current_time = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        if user:
            # User exists, return the UUID
            user_id = user['user_id']
            
            # Update user information (in case anything changed)
            cursor.execute(
                "UPDATE users SET name = %s, picture = %s, updated_at = %s WHERE user_id = %s",
                (name, picture, current_time, user_id)
            )
        else:
            # User doesn't exist, create new user with UUID
            user_id = str(uuid.uuid4())
            
            cursor.execute(
                "INSERT INTO users (user_id, name, email, picture, created_at, updated_at) VALUES (%s, %s, %s, %s, %s, %s)",
                (user_id, name, email, picture, current_time, current_time)
            )
        
        # Commit changes
        connection.commit()
        
        # Return success with user_id
        return jsonify({
            'status': 'success',
            'user_id': user_id
        })
        
    except Exception as e:
        print(f"Error in check_user: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Server error occurred'
        }), 500
    
    finally:
        # Clean up resources
        close_connection(connection, cursor)

@users_bp.route('/users/<user_id>', methods=['GET'])
def get_user(user_id):
    """
    Get user profile by user_id
    Args:
        user_id: UUID of the user
    Returns:
        JSON: User profile data
    """
    connection = None
    cursor = None
    
    try:
        # Connect to database
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Get user data
        cursor.execute(
            "SELECT user_id, name, email, picture, created_at, updated_at FROM users WHERE user_id = %s",
            (user_id,)
        )
        user = cursor.fetchone()
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'User not found'
            }), 404
        
        return jsonify({
            'status': 'success',
            'data': user
        })
        
    except Exception as e:
        print(f"Error in get_user: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Server error occurred'
        }), 500
    
    finally:
        # Clean up resources
        close_connection(connection, cursor)