"""
Menuda Finance API - Main Application Entry Point
"""
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
from routes.users import users_bp
from routes.transactions import transactions_bp
from routes.vendors import vendors_bp
from routes.categories import categories_bp
from routes.invoices import invoices_bp
from routes.attachments import attachments_bp
from flask import send_from_directory


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
            "origins": ["http://127.0.0.1:8080", "http://localhost:8080", "http://192.168.1.10:8080", "http://localhost:5500"],
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "allow_headers": ["Content-Type"]
        }
    })
    
    # Register blueprints
    app.register_blueprint(users_bp, url_prefix='/api')
    app.register_blueprint(transactions_bp, url_prefix='/api')
    app.register_blueprint(vendors_bp, url_prefix='/api')  # Make sure this line is present
    app.register_blueprint(categories_bp, url_prefix='/api')
    app.register_blueprint(invoices_bp, url_prefix='/api')
    app.register_blueprint(attachments_bp, url_prefix='/api')


    
    @app.route('/api/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        return {'status': 'healthy', 'service': 'Menuda Finance API'}
    

    @app.route('/uploads/<user_id>/<filename>')
    def uploaded_file(user_id, filename):
        """
        Serve uploaded files
        """
        return send_from_directory(os.path.join(os.getcwd(), 'uploads', user_id), filename)
    
    return app



# Create the application instance
app = create_app()

if __name__ == '__main__':
    # Run the application
    app.run(debug=True, port=5000)