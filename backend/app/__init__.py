from flask import Flask, jsonify
from flask_cors import CORS
import os

from app.routes.predict import predict_bp
from app.routes.history import history_bp
from app.utils.helpers import error_response
from config import Config

def create_app():
    app = Flask(__name__)
    
    # Configure CORS - allow all origins for development
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Apply configurations
    app.config['MAX_CONTENT_LENGTH'] = Config.MAX_FILE_SIZE
    
    from app.routes.predict import predict_bp
    from app.routes.history import history_bp
    from app.routes.admin import admin_bp
    from app.routes.auth import auth_bp
    
    # Register Blueprints
    app.register_blueprint(predict_bp, url_prefix='/api/predict')
    app.register_blueprint(history_bp, url_prefix='/api/history')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    
    # Health check
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            "status": "success", 
            "message": "API is running!",
            "supabase_configured": bool(Config.SUPABASE_URL and Config.SUPABASE_KEY)
        }), 200
        
    # Global Error Handlers
    @app.errorhandler(413)
    def request_entity_too_large(error):
        return error_response("File too large. Maximum size is 10MB.", 413)
        
    @app.errorhandler(404)
    def not_found(error):
        return error_response("Endpoint not found.", 404)
        
    @app.errorhandler(500)
    def internal_error(error):
        return error_response("Internal server error.", 500)
        
    return app
