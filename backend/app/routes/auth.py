from flask import Blueprint, request
from app.utils.helpers import success_response, error_response
from app.services import supabase_service

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    if not data or 'email' not in data or 'password' not in data:
        return error_response("Email and password are required.", 400)
    
    result = supabase_service.register_user(data['email'], data['password'])
    if "error" in result:
        return error_response(result["error"], 400)
    return success_response(result)

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    if not data or 'email' not in data or 'password' not in data:
        return error_response("Email and password are required.", 400)
        
    result = supabase_service.login_user(data['email'], data['password'])
    if "error" in result:
        return error_response("Invalid login credentials.", 401)
    return success_response(result)
