from functools import wraps
from flask import request, jsonify
from app.services.supabase_service import _get_client

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'status': 'error', 'message': 'Missing or invalid Authorization header'}), 401

        token = auth_header.split(' ')[1]
        
        client = _get_client()
        if not client:
            # For development without Supabase, we can allow a mock 'admin-token'
            if token == 'mock-admin-token':
                return f(*args, **kwargs)
            return jsonify({'status': 'error', 'message': 'Invalid token.'}), 401
            
        try:
            # Verify user from Supabase Auth
            user_response = client.auth.get_user(token)
            if not user_response or not user_response.user:
                return jsonify({'status': 'error', 'message': 'Invalid or expired token.'}), 401
                
            user = user_response.user
            
            # Check role in public.users table (assuming we sync Auth to public.users)
            # OR checking app_metadata for 'admin' role if set via Supabase claims
            # Let's check public.users table for `role == 'admin'`
            user_id = user.id
            profile = client.table('users').select('role').eq('id', user_id).execute()
            
            if not profile.data or len(profile.data) == 0:
                return jsonify({'status': 'error', 'message': 'User profile not found.'}), 404
                
            if profile.data[0].get('role') != 'admin':
                return jsonify({'status': 'error', 'message': 'Admin privileges required.'}), 403
                
        except Exception as e:
            print(f"[auth] Auth error: {e}")
            return jsonify({'status': 'error', 'message': 'Authentication failed.'}), 401

        return f(*args, **kwargs)
    return decorated_function
