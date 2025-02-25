"""
Database connection utilities for Menuda Finance API
"""
import os
import mysql.connector
from mysql.connector import Error

def get_db_connection():
    """
    Create and return a database connection
    Returns:
        Connection: MySQL database connection
    Raises:
        Exception: Database connection error
    """
    try:
        connection = mysql.connector.connect(
            host=os.getenv('DB_HOST'),
            user=os.getenv('DB_USER'),
            password=os.getenv('DB_PASSWORD'),
            database=os.getenv('DB_NAME', 'menuda_finance')
        )
        return connection
    except Error as err:
        print(f"Database connection error: {err}")
        raise Exception(f"Database connection failed: {err}")

def close_connection(connection, cursor=None):
    """
    Safely close database connection and cursor
    Args:
        connection: MySQL connection object
        cursor: MySQL cursor object (optional)
    """
    if cursor:
        cursor.close()
    if connection and connection.is_connected():
        connection.close()