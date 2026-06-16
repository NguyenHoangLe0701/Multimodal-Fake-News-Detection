from flask import Blueprint, request
from app.utils.helpers import success_response, error_response
from app.services import supabase_service

history_bp = Blueprint('history', __name__)

@history_bp.route('/', methods=['GET'])
def get_history():
    """
    Endpoint to retrieve prediction history.
    """
    try:
        # Get limit from query params, default to 20
        limit_str = request.args.get('limit', '20')
        limit = int(limit_str) if limit_str.isdigit() else 20
        
        # Max limit to prevent large queries
        if limit > 100:
            limit = 100
            
        records = supabase_service.get_predictions(limit=limit)
        return success_response(records)
        
    except Exception as e:
        print(f"[history_route] Error: {e}")
        return error_response("Failed to retrieve history.", 500)
