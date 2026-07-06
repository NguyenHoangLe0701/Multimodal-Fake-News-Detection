"""
Translation Service — Dich tu dong Tieng Viet sang Tieng Anh cho AI pipeline.
Su dung deep-translator (Google Translate mien phi).
"""
import re

_translator = None

def _get_translator():
    """Lazy init translator de khong lam cham startup"""
    global _translator
    if _translator is None:
        try:
            from deep_translator import GoogleTranslator
            # Fix 3: Dung auto-detect thay vi hard-code 'vi' de ho tro da ngon ngu
            _translator = GoogleTranslator(source='auto', target='en')
        except Exception as e:
            print(f"[translation] Khong the khoi tao translator: {e}")
    return _translator

def is_vietnamese(text: str) -> bool:
    """Phat hien Tieng Viet bang regex Unicode dac trung"""
    vi_pattern = re.compile(
        r'[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]',
        re.IGNORECASE
    )
    # Neu co >= 3 ky tu dac trung Tieng Viet -> la Tieng Viet
    matches = vi_pattern.findall(text)
    return len(matches) >= 3

def translate_to_english(text: str) -> str:
    """Dich text sang Tieng Anh. Neu that bai -> tra ve text goc."""
    if not text or not text.strip():
        return text
    
    # Voi source='auto', Google Translate se tu phat hien ngon ngu
    # Neu text da la Tieng Anh, no se tra ve nguyen van
    translator = _get_translator()
    if not translator:
        return text
    
    try:
        # deep-translator co gioi han 5000 ky tu, cat bot neu can
        chunks = [text[i:i+4500] for i in range(0, len(text), 4500)]
        translated_parts = []
        for chunk in chunks:
            result = translator.translate(chunk)
            translated_parts.append(result)
        return " ".join(translated_parts)
    except Exception as e:
        print(f"[translation] Loi dich: {e}")
        return text

def translate_reason_to_vietnamese(reason_en: str) -> str:
    """Dich ly do AI (Tieng Anh) sang Tieng Viet cho user doc."""
    # Map cac reason co dinh sang Tieng Viet
    reason_map = {
        "Van ban va hinh anh nhat quan, khong phat hien dau hieu cat ghep.":
            "Van ban va hinh anh nhat quan, khong phat hien dau hieu cat ghep.",
        "Phat hien su bat thuong trong ngu canh van ban hoac dau hieu chinh sua hinh anh.":
            "Phat hien su bat thuong trong ngu canh van ban hoac dau hieu chinh sua hinh anh.",
    }
    
    if reason_en in reason_map:
        return reason_map[reason_en]
    
    # Dich dong neu khong co trong map
    try:
        from deep_translator import GoogleTranslator
        translator = GoogleTranslator(source='en', target='vi')
        return translator.translate(reason_en)
    except Exception:
        return reason_en
