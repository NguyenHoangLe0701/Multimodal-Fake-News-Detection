import os
from flask import Blueprint, request
from werkzeug.utils import secure_filename
from config import Config
from app.utils.helpers import allowed_file, generate_filename, success_response, error_response, ensure_upload_folder
from app.services import ai_service, supabase_service

predict_bp = Blueprint('predict', __name__)

@predict_bp.route('/', methods=['POST'])
def predict_fake_news():
    """
    Endpoint for predicting fake news from text and/or image.
    Expects multipart/form-data.
    """
    # 1. Get data from request
    text = request.form.get('text', '').strip()
    image_file = request.files.get('image')

    # 2. Basic validation
    if not text and not image_file:
        return error_response("Please provide news text or an image for analysis.")

    # We enforce a small minimum text length if text is provided without an image
    if text and len(text) < 10 and not image_file:
        return error_response("Text must be at least 10 characters long if no image is provided.")

    image_path = None
    image_url = ""

    # 3. Handle image upload if present
    if image_file and image_file.filename != '':
        if not allowed_file(image_file.filename):
            return error_response(f"Invalid file type. Allowed types: {', '.join(Config.ALLOWED_EXTENSIONS)}")
            
        ensure_upload_folder()
        
        # Save file temporarily
        safe_name = secure_filename(image_file.filename)
        unique_name = generate_filename(safe_name)
        image_path = os.path.join(Config.UPLOAD_FOLDER, unique_name)
        image_file.save(image_path)
        
        # Check file size (optional fallback if proxy doesn't catch it)
        if os.path.getsize(image_path) > Config.MAX_FILE_SIZE:
            os.remove(image_path)
            return error_response("File size exceeds the 10MB limit.")

        # Upload to Supabase Storage
        upload_result = supabase_service.upload_image(image_path, unique_name)
        if upload_result:
            image_url = upload_result
        else:
            print("[predict_route] Warning: Failed to upload image to Supabase. Using local path for inference only.")

    # 4. Run AI Inference
    try:
        ai_result = ai_service.predict(text=text, image_path=image_path)
    except Exception as e:
        print(f"[predict_route] AI Inference Error: {e}")
        # Clean up local file before returning error
        if image_path and os.path.exists(image_path):
            os.remove(image_path)
        return error_response("An error occurred during AI analysis. Please try again later.", 500)

    # Clean up the local temporary file after inference and upload are done
    if image_path and os.path.exists(image_path):
        try:
            os.remove(image_path)
        except Exception as e:
            print(f"[predict_route] Warning: Could not delete temp file {image_path}: {e}")

    # 5. Save record to Database
    db_record = supabase_service.save_prediction(
        news_text=text,
        image_url=image_url,
        label=ai_result['label'],
        confidence=ai_result['confidence'],
        text_score=ai_result['text_score'],
        image_score=ai_result['image_score']
    )

    # 6. Return response
    return success_response({
        "id": db_record.get('id') if db_record else None,
        "label": ai_result['label'],
        "confidence": ai_result['confidence'],
        "text_score": ai_result['text_score'],
        "image_score": ai_result['image_score'],
        "reason": ai_result.get('reason'),
        "details": ai_result.get('details'),
        "image_url": image_url,
        "created_at": db_record.get('created_at') if db_record else None
    })
