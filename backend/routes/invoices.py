"""
Invoice processing routes for Menuda Finance API
"""
import os
import uuid
from flask import Blueprint, request, jsonify
import requests
from utils.db import get_db_connection, close_connection

# Create blueprint
invoices_bp = Blueprint('invoices', __name__)

@invoices_bp.route('/invoices/process', methods=['POST'])
def process_invoice():
    """
    Process an invoice image using OpenAI
    Returns:
        JSON: Extracted invoice data
    """
    # Check if file was uploaded
    if 'invoice' not in request.files:
        return jsonify({
            'status': 'error',
            'message': 'No invoice file provided'
        }), 400
    
    invoice_file = request.files['invoice']
    
    # Check if the file is empty
    if invoice_file.filename == '':
        return jsonify({
            'status': 'error',
            'message': 'No invoice file selected'
        }), 400
    
    # Get user ID
    user_id = request.form.get('user_id')
    if not user_id:
        return jsonify({
            'status': 'error',
            'message': 'User ID is required'
        }), 400
    
    try:
        # Save the file temporarily with a unique filename
        file_ext = invoice_file.filename.rsplit('.', 1)[1].lower() if '.' in invoice_file.filename else 'jpg'
        temp_filename = f"invoice_{uuid.uuid4().hex}.{file_ext}"
        temp_filepath = os.path.join('/tmp', temp_filename)
        invoice_file.save(temp_filepath)
        
        # Process with OpenAI API
        extracted_data = process_with_openai(temp_filepath, user_id)
        
        # Clean up the temporary file
        if os.path.exists(temp_filepath):
            os.remove(temp_filepath)
        
        return jsonify({
            'status': 'success',
            'message': 'Invoice processed successfully',
            'data': extracted_data
        })
        
    except Exception as e:
        print(f"Error processing invoice: {e}")
        return jsonify({
            'status': 'error',
            'message': f'Error processing invoice: {str(e)}'
        }), 500

def process_with_openai(image_path, user_id):
    """
    Process the image with OpenAI API to extract invoice details
    Args:
        image_path: Path to the image file
        user_id: User ID for the request
    Returns:
        dict: Extracted invoice data
    """
    try:
        # Read image file
        with open(image_path, 'rb') as image_file:
            image_data = image_file.read()
        
        # Get OpenAI API key from environment
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OpenAI API key not found in environment")
        
        # Import base64 for encoding image data
        import base64
        # Encode image data to base64
        base64_image = base64.b64encode(image_data).decode('utf-8')
        
        # Setup the request to OpenAI GPT-4o Vision API
        headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': 'gpt-4o',
            'messages': [
                {
                    'role': 'system',
                    'content': (
                        'You are an expert at extracting information from invoices and receipts. '
                        'Extract the following fields from the provided invoice image: '
                        'title (description of purchase), amount (total paid), date (transaction date), '
                        'vendor (store or company name), and category (e.g., Food, Transportation, etc.). '
                        'Return the data in a structured JSON format only.'
                    )
                },
                {
                    'role': 'user',
                    'content': [
                        {
                            'type': 'text',
                            'text': 'Extract the invoice information from this image and provide ONLY a JSON response with title, amount (as a number), date (in YYYY-MM-DD format), vendor, and category fields. Make your best guess for categorization.'
                        },
                        {
                            'type': 'image_url',
                            'image_url': {
                                'url': f'data:image/jpeg;base64,{base64_image}'
                            }
                        }
                    ]
                }
            ]
        }
        
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers=headers,
            json=payload
        )
        
        if response.status_code != 200:
            raise Exception(f"OpenAI API error: {response.text}")
        
        # Extract and parse the JSON response
        result = response.json()
        extracted_text = result['choices'][0]['message']['content']
        
        # Find the JSON part in the response (in case there's extra text)
        import json
        import re
        
        # Try to parse directly first
        try:
            extracted_data = json.loads(extracted_text)
        except json.JSONDecodeError:
            # If direct parsing fails, try to find JSON block in markdown
            json_match = re.search(r'```(?:json)?\n(.*?)\n```', extracted_text, re.DOTALL)
            if json_match:
                try:
                    extracted_data = json.loads(json_match.group(1))
                except json.JSONDecodeError:
                    # If still fails, make a best effort to clean up the response
                    extracted_text = extracted_text.strip()
                    if extracted_text.startswith('{') and extracted_text.endswith('}'):
                        extracted_data = json.loads(extracted_text)
                    else:
                        raise Exception("Unable to parse JSON from response")
            else:
                raise Exception("No JSON found in response")
        
        # Make sure all required fields are present
        required_fields = ['title', 'amount', 'date', 'vendor', 'category']
        for field in required_fields:
            if field not in extracted_data:
                extracted_data[field] = ""
        
        print("OpenAI API raw response:", result)
        print("Extracted text:", extracted_text)
        return extracted_data
    
        
    except Exception as e:
        print(f"Error processing with OpenAI: {e}")
        raise