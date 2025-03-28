"""
Attachment handling routes for Menuda Finance API

This module provides endpoints for handling file attachments:

- POST /attachments/upload: Handles file uploads with the following features:
    - Stores files in user-specific directories
    - Generates unique filenames using UUID
    - Supports multiple file types (images, PDFs, other files)
    - Returns file URL and detected attachment type
    - Includes basic error handling and validation

File storage is currently local (in 'uploads' directory), with potential for CDN/storage service integration in production.
"""
import os
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify, current_app
from utils.s3 import S3Manager


# Create blueprint
attachments_bp = Blueprint('attachments', __name__)

@attachments_bp.route('/attachments/upload', methods=['POST'])
def upload_attachment():
    """
    Handle file upload and store in Amazon S3
    Returns:
        JSON: Data with URL and attachment type
    """
    # Check if file is in request
    if 'file' not in request.files:
        return jsonify({
            'status': 'error',
            'message': 'No file provided'
        }), 400
    
    # Get file from request
    file = request.files['file']
    
    # Check if the file is empty
    if file.filename == '':
        return jsonify({
            'status': 'error',
            'message': 'No file selected'
        }), 400
    
    # Get user ID
    user_id = request.form.get('user_id')
    if not user_id:
        return jsonify({
            'status': 'error',
            'message': 'User ID is required'
        }), 400
    
    try:
        # Create S3 manager
        s3_manager = S3Manager()
        
        # Get file extension
        file_ext = os.path.splitext(file.filename)[1].lower()
        
        # Save file temporarily
        temp_path = os.path.join('/tmp', f"{uuid.uuid4().hex}{file_ext}")
        file.save(temp_path)
        
        # Upload to S3
        file_url = s3_manager.upload_file(
            temp_path, 
            user_id, 
            content_type=file.content_type
        )
        
        # Remove temporary file
        os.remove(temp_path)
        
        # Determine attachment type
        attachment_type = 'file'
        if file.content_type.startswith('image/'):
            attachment_type = 'image'
        elif file.content_type == 'application/pdf':
            attachment_type = 'pdf'
        
        return jsonify({
            'status': 'success',
            'message': 'File uploaded successfully',
            'data': {
                'url': file_url,
                'type': attachment_type,
                'filename': os.path.basename(file_url)
            }
        })
        
    except Exception as e:
        print(f"Error uploading file: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error uploading file: {str(e)}'
        }), 500