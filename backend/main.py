"""
Menuda Finance API - Main Application Entry Point
"""
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from routes.users import users_bp
from routes.transactions import transactions_bp

# Load environment variables
load_dotenv()

def create_app():
    """
    Create and configure Flask application
    Returns:
        Flask: Configured Flask application
    """
    app = Flask(__name__)
    
    # Enable CORS for all routes
    CORS(app, resources={
        "/api/*": {
            "origins": ["http://127.0.0.1:8080", "http://localhost:8080"],
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "allow_headers": ["Content-Type"]
        }
    })
    
    # Register blueprints
    app.register_blueprint(users_bp, url_prefix='/api')
    app.register_blueprint(transactions_bp, url_prefix='/api')
    
    @app.route('/api/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        return {'status': 'healthy', 'service': 'Menuda Finance API'}
    
    return app

# Create the application instance
app = create_app()

if __name__ == '__main__':
    # Run the application
    app.run(debug=True, port=5000)