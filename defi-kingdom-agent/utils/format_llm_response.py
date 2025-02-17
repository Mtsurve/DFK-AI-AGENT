# utils/json_utils.py
import json

def extract_json(text):
    """Extracts JSON from a response text."""
    try:
        start = text.find("{")
        end = text.rfind("}") + 1
        return json.loads(text[start:end]) if start != -1 and end != -1 else None
    except json.JSONDecodeError:
        return None
