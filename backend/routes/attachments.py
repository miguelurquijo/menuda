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

# Create blueprint
attachments_bp = Blueprint('attachments', __name__)

@attachments_bp.route('/attachments/upload', methods=['POST'])
def upload_attachment():
    """
    Handle file upload and store in file system
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
        # Create upload directory if it doesn't exist
        upload_dir = os.path.join(os.getcwd(), 'uploads', user_id)
        os.makedirs(upload_dir, exist_ok=True)
        
        # Generate unique filename
        file_ext = os.path.splitext(file.filename)[1].lower()
        safe_filename = f"{uuid.uuid4().hex}{file_ext}"
        file_path = os.path.join(upload_dir, safe_filename)
        
        # Save file
        file.save(file_path)
        
        # Determine attachment type
        attachment_type = 'file'
        if file.content_type.startswith('image/'):
            attachment_type = 'image'
        elif file.content_type == 'application/pdf':
            attachment_type = 'pdf'
        
        # Generate URL (in production, this would be a CDN or storage service URL)
        file_url = f"/uploads/{user_id}/{safe_filename}"
        
        return jsonify({
            'status': 'success',
            'message': 'File uploaded successfully',
            'data': {
                'url': file_url,
                'type': attachment_type,
                'filename': safe_filename
            }
        })
        
    except Exception as e:
        print(f"Error uploading file: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error uploading file: {str(e)}'
        }), 500