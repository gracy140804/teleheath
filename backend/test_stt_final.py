import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.services.ai_service import process_symptoms

def test_multilingual_stt_full_flow():
    test_cases = [
        {
            "text": "எனக்கு இரண்டு நாட்களாக fever இருக்கு", # Mixed (Tanglish)
            "hint": "Auto Detect",
            "expected_lang": "Mixed (Tamil-English)",
            "expected_symptoms": ["fever"]
        },
        {
            "text": "I have severe chest pain since yesterday", # English
            "hint": "Auto Detect",
            "expected_lang": "English",
            "expected_symptoms": ["chest pain"]
        }
    ]

    for i, case in enumerate(test_cases):
        print(f"\n--- Test Case {i+1}: {case['text']} ---")
        result = process_symptoms(case["text"], case["hint"])
        
        print(f"Detected Language: {result['detected_language']}")
        print(f"Translated Text: {result['translated_text']}")
        print(f"Extracted Symptoms: {result['symptoms']}")
        print(f"Duration: {result['duration']}")
        
        if result["detected_language"] != case["expected_lang"]:
            print(f"FAIL: Expected lang {case['expected_lang']}, got {result['detected_language']}")
            
        if "expected_symptoms" in case:
            if not all(s in result["symptoms"] for s in case["expected_symptoms"]):
                 print(f"FAIL: Expected symptoms {case['expected_symptoms']}, got {result['symptoms']}")
        
        print("Done")

if __name__ == "__main__":
    test_multilingual_stt_full_flow()
