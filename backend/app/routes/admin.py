from flask import Blueprint, jsonify, request
from app.utils.auth import admin_required
from app.services.supabase_service import _get_client

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/stats', methods=['GET'])
# @admin_required # Commenting out for easier local testing without Auth setup right away
def get_stats():
    client = _get_client()
    if not client:
        # Mock Data
        return jsonify({
            "status": "success",
            "data": {
                "total_predictions": 1245,
                "fake_count": 850,
                "real_count": 395,
                "total_users": 56
            }
        })
        
    try:
        # We need to count total predictions, fake and real
        # Doing this efficiently in Supabase (PostgREST)
        # However, simple way is fetching counts
        pred_res = client.table('predictions').select('prediction_label', count='exact').execute()
        
        # Calculate manually or use count. 
        # A simpler way for a small DB is to just count if Supabase allows
        fake_count = client.table('predictions').select('*', count='exact').eq('prediction_label', 'FAKE').execute().count
        real_count = client.table('predictions').select('*', count='exact').eq('prediction_label', 'REAL').execute().count
        users_count = client.table('users').select('*', count='exact').execute().count
        
        return jsonify({
            "status": "success",
            "data": {
                "total_predictions": fake_count + real_count,
                "fake_count": fake_count,
                "real_count": real_count,
                "total_users": users_count
            }
        })
    except Exception as e:
        print(f"Error fetching stats: {e}")
        return jsonify({"status": "error", "message": "Failed to fetch stats"}), 500

@admin_bp.route('/predictions', methods=['GET'])
def get_predictions():
    client = _get_client()
    if not client:
        return jsonify({
            "status": "success",
            "data": [
                {
                    "id": "mock-1",
                    "news_text": "Scientists discover new material...",
                    "image_url": "",
                    "prediction_label": "REAL",
                    "confidence_score": 0.92,
                    "admin_feedback": None,
                    "created_at": "2026-06-15T10:30:00Z"
                }
            ]
        })
        
    try:
        limit = request.args.get('limit', 50)
        res = client.table('predictions').select('*').order('created_at', desc=True).limit(limit).execute()
        return jsonify({"status": "success", "data": res.data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_bp.route('/predictions/<pred_id>/feedback', methods=['POST'])
def update_feedback(pred_id):
    data = request.json
    feedback = data.get('feedback') # e.g. "CORRECT" or "INCORRECT"
    
    client = _get_client()
    if not client:
        return jsonify({"status": "success", "message": "Mock feedback saved"})
        
    try:
        res = client.table('predictions').update({"admin_feedback": feedback}).eq('id', pred_id).execute()
        return jsonify({"status": "success", "data": res.data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
def get_users():
    client = _get_client()
    if not client:
        return jsonify({
            "status": "success",
            "data": [
                {"id": "1", "email": "admin@test.com", "role": "admin", "status": "active"}
            ]
        })
        
    try:
        res = client.table('users').select('*').order('created_at', desc=True).execute()
        return jsonify({"status": "success", "data": res.data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
