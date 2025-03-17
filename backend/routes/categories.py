"""
Category-related routes for Menuda Finance API
"""
from flask import Blueprint, request, jsonify
from utils.db import get_db_connection, close_connection
import uuid

# Create blueprint without url_prefix (will be set in main.py)
categories_bp = Blueprint('categories', __name__)

@categories_bp.route('/categories', methods=['GET'])
def get_categories():
    """
    Get user categories
    Query Parameters:
        user_id: UUID of the user
    Returns:
        JSON: Array of categories with their details
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
        
        # Get categories
        query = """
        SELECT 
            category_id,
            category_name,
            created_at,
            updated_at
        FROM 
            categories
        WHERE 
            user_id = %s
            AND is_active = TRUE
        ORDER BY 
            category_name
        """
        
        cursor.execute(query, (user_id,))
        categories = cursor.fetchall()
        
        # Format dates for JSON serialization
        for category in categories:
            if 'created_at' in category and category['created_at']:
                category['created_at'] = category['created_at'].isoformat()
            if 'updated_at' in category and category['updated_at']:
                category['updated_at'] = category['updated_at'].isoformat()
        
        return jsonify({
            'status': 'success',
            'data': categories,
            'count': len(categories)
        })
        
    except Exception as e:
        print(f"Error in get_categories: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Server error occurred'
        }), 500
    
    finally:
        # Clean up resources
        close_connection(connection, cursor)

@categories_bp.route('/categories', methods=['POST'])
def create_category():
    """
    Create a new category
    Request Body:
        JSON containing category details
    Returns:
        JSON: Created category details
    """
    connection = None
    cursor = None
    
    try:
        # Get request data
        data = request.json
        
        # Validate required fields
        required_fields = ['user_id', 'category_name']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Connect to database
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Check if category already exists
        check_query = """
        SELECT category_id FROM categories 
        WHERE user_id = %s AND category_name = %s AND is_active = TRUE
        """
        
        cursor.execute(check_query, (data['user_id'], data['category_name']))
        existing_category = cursor.fetchone()
        
        if existing_category:
            # Return the existing category
            get_query = """
            SELECT 
                category_id,
                category_name,
                created_at,
                updated_at
            FROM 
                categories
            WHERE 
                category_id = %s
            """
            
            cursor.execute(get_query, (existing_category['category_id'],))
            category = cursor.fetchone()
            
            # Format dates
            if 'created_at' in category and category['created_at']:
                category['created_at'] = category['created_at'].isoformat()
            if 'updated_at' in category and category['updated_at']:
                category['updated_at'] = category['updated_at'].isoformat()
            
            return jsonify({
                'status': 'success',
                'message': 'Category already exists',
                'data': category
            })
        
        # Create new category
        category_id = str(uuid.uuid4())
        
        query = """
        INSERT INTO categories (
            category_id, user_id, category_name, created_at, updated_at, is_active
        ) VALUES (
            %s, %s, %s, NOW(), NOW(), TRUE
        )
        """
        
        cursor.execute(query, (
            category_id,
            data['user_id'],
            data['category_name']
        ))
        
        connection.commit()
        
        # Get the newly created category
        get_query = """
        SELECT 
            category_id,
            category_name,
            created_at,
            updated_at
        FROM 
            categories
        WHERE 
            category_id = %s
        """
        
        cursor.execute(get_query, (category_id,))
        new_category = cursor.fetchone()
        
        # Format dates
        if 'created_at' in new_category and new_category['created_at']:
            new_category['created_at'] = new_category['created_at'].isoformat()
        if 'updated_at' in new_category and new_category['updated_at']:
            new_category['updated_at'] = new_category['updated_at'].isoformat()
        
        return jsonify({
            'status': 'success',
            'message': 'Category created successfully',
            'data': new_category
        })
        
    except Exception as e:
        print(f"Error in create_category: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Server error occurred'
        }), 500
    
    finally:
        # Clean up resources
        close_connection(connection, cursor)