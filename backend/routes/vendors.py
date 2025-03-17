"""
Vendor-related routes for Menuda Finance API
"""
from flask import Blueprint, request, jsonify
from utils.db import get_db_connection, close_connection
import uuid

# Create blueprint without url_prefix (will be set in main.py)
vendors_bp = Blueprint('vendors', __name__)

@vendors_bp.route('/vendors', methods=['GET'])
def get_vendors():
    """
    Get user vendors
    Query Parameters:
        user_id: UUID of the user
    Returns:
        JSON: Array of vendors with their details
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
        
        # Get vendors with category details
        query = """
        SELECT 
            v.vendor_id,
            v.vendor_name,
            v.category_id,
            c.category_name,
            v.created_at,
            v.updated_at
        FROM 
            vendors v
            JOIN categories c ON v.category_id = c.category_id
        WHERE 
            v.user_id = %s
            AND v.is_active = TRUE
        ORDER BY 
            v.vendor_name
        """
        
        cursor.execute(query, (user_id,))
        vendors = cursor.fetchall()
        
        # Format dates for JSON serialization
        for vendor in vendors:
            if 'created_at' in vendor and vendor['created_at']:
                vendor['created_at'] = vendor['created_at'].isoformat()
            if 'updated_at' in vendor and vendor['updated_at']:
                vendor['updated_at'] = vendor['updated_at'].isoformat()
        
        return jsonify({
            'status': 'success',
            'data': vendors,
            'count': len(vendors)
        })
        
    except Exception as e:
        print(f"Error in get_vendors: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Server error occurred'
        }), 500
    
    finally:
        # Clean up resources
        close_connection(connection, cursor)

@vendors_bp.route('/vendors', methods=['POST'])
def create_vendor():
    """
    Create a new vendor
    Request Body:
        JSON containing vendor details
    Returns:
        JSON: Created vendor details
    """
    connection = None
    cursor = None
    
    try:
        # Get request data
        data = request.json
        
        # Validate required fields
        required_fields = ['user_id', 'vendor_name', 'category_id']
        for field in required_fields:
            if field not in data:
                return jsonify({
                    'status': 'error',
                    'message': f'Missing required field: {field}'
                }), 400
        
        # Connect to database
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)
        
        # Check if vendor already exists
        check_query = """
        SELECT vendor_id FROM vendors 
        WHERE user_id = %s AND vendor_name = %s AND is_active = TRUE
        """
        
        cursor.execute(check_query, (data['user_id'], data['vendor_name']))
        existing_vendor = cursor.fetchone()
        
        if existing_vendor:
            # If vendor exists with different category, update it
            update_query = """
            UPDATE vendors 
            SET category_id = %s, updated_at = NOW() 
            WHERE vendor_id = %s
            """
            
            cursor.execute(update_query, (data['category_id'], existing_vendor['vendor_id']))
            connection.commit()
            
            # Return the updated vendor
            get_query = """
            SELECT 
                v.vendor_id,
                v.vendor_name,
                v.category_id,
                c.category_name,
                v.created_at,
                v.updated_at
            FROM 
                vendors v
                JOIN categories c ON v.category_id = c.category_id
            WHERE 
                v.vendor_id = %s
            """
            
            cursor.execute(get_query, (existing_vendor['vendor_id'],))
            vendor = cursor.fetchone()
            
            # Format dates
            if 'created_at' in vendor and vendor['created_at']:
                vendor['created_at'] = vendor['created_at'].isoformat()
            if 'updated_at' in vendor and vendor['updated_at']:
                vendor['updated_at'] = vendor['updated_at'].isoformat()
            
            return jsonify({
                'status': 'success',
                'message': 'Vendor already exists, updated category',
                'data': vendor
            })
        
        # Create new vendor
        vendor_id = str(uuid.uuid4())
        
        query = """
        INSERT INTO vendors (
            vendor_id, user_id, vendor_name, category_id, created_at, updated_at, is_active
        ) VALUES (
            %s, %s, %s, %s, NOW(), NOW(), TRUE
        )
        """
        
        cursor.execute(query, (
            vendor_id,
            data['user_id'],
            data['vendor_name'],
            data['category_id']
        ))
        
        connection.commit()
        
        # Get the newly created vendor
        get_query = """
        SELECT 
            v.vendor_id,
            v.vendor_name,
            v.category_id,
            c.category_name,
            v.created_at,
            v.updated_at
        FROM 
            vendors v
            JOIN categories c ON v.category_id = c.category_id
        WHERE 
            v.vendor_id = %s
        """
        
        cursor.execute(get_query, (vendor_id,))
        new_vendor = cursor.fetchone()
        
        # Format dates
        if 'created_at' in new_vendor and new_vendor['created_at']:
            new_vendor['created_at'] = new_vendor['created_at'].isoformat()
        if 'updated_at' in new_vendor and new_vendor['updated_at']:
            new_vendor['updated_at'] = new_vendor['updated_at'].isoformat()
        
        return jsonify({
            'status': 'success',
            'message': 'Vendor created successfully',
            'data': new_vendor
        })
        
    except Exception as e:
        print(f"Error in create_vendor: {e}")
        return jsonify({
            'status': 'error',
            'message': 'Server error occurred'
        }), 500
    
    finally:
        # Clean up resources
        close_connection(connection, cursor)