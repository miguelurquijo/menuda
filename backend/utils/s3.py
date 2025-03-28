# backend/utils/s3.py
"""
Amazon S3 utilities for Menuda Finance API
"""
import os
import uuid
import boto3
from botocore.exceptions import ClientError

class S3Manager:
    """
    Manages interactions with Amazon S3 for file uploads
    """
    def __init__(self):
        """
        Initialize S3 client with credentials from environment variables
        """
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION', 'us-east-1')
        )
        self.bucket_name = os.getenv('S3_BUCKET_NAME')
        
    def upload_file(self, file_path, user_id, content_type=None):
        """
        Upload a file to S3
        
        Args:
            file_path (str): Path to the local file
            user_id (str): User ID for organizing files in S3
            content_type (str, optional): MIME type of the file
            
        Returns:
            str: URL of the uploaded file
        
        Raises:
            Exception: If upload fails
        """
        try:
            # Generate a unique file name
            file_name = f"{uuid.uuid4().hex}{os.path.splitext(file_path)[1]}"
            
            # Set the S3 key (path) - organize by user_id
            s3_key = f"uploads/{user_id}/{file_name}"
            
            # Set extra args for upload if content_type is provided
            extra_args = {}
            if content_type:
                extra_args['ContentType'] = content_type
            
            # Upload the file
            self.s3_client.upload_file(
                file_path, 
                self.bucket_name, 
                s3_key,
                ExtraArgs=extra_args
            )
            
            # Generate the URL
            url = f"https://{self.bucket_name}.s3.amazonaws.com/{s3_key}"
            
            return url
            
        except ClientError as e:
            print(f"Error uploading to S3: {e}")
            raise Exception(f"Failed to upload file to S3: {str(e)}")
    
    def upload_fileobj(self, file_obj, user_id, file_ext, content_type=None):
        """
        Upload a file-like object to S3
        
        Args:
            file_obj (file-like): File-like object to upload
            user_id (str): User ID for organizing files in S3
            file_ext (str): File extension including dot (e.g., ".jpg")
            content_type (str, optional): MIME type of the file
            
        Returns:
            str: URL of the uploaded file
        
        Raises:
            Exception: If upload fails
        """
        try:
            # Generate a unique file name
            file_name = f"{uuid.uuid4().hex}{file_ext}"
            
            # Set the S3 key (path) - organize by user_id
            s3_key = f"uploads/{user_id}/{file_name}"
            
            # Set extra args for upload if content_type is provided
            extra_args = {}
            if content_type:
                extra_args['ContentType'] = content_type
            
            # Upload the file object
            self.s3_client.upload_fileobj(
                file_obj, 
                self.bucket_name, 
                s3_key,
                ExtraArgs=extra_args
            )
            
            # Generate the URL
            url = f"https://{self.bucket_name}.s3.amazonaws.com/{s3_key}"
            
            return url
            
        except ClientError as e:
            print(f"Error uploading to S3: {e}")
            raise Exception(f"Failed to upload file to S3: {str(e)}")