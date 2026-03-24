import os
import sys

# Ensure backend path is in sys.path
sys.path.append(os.getcwd())

from app.services import ai_service

def verify_all_departments():
    test_cases = [
        {"input": "I have a high fever and chills.", "expected": "General Physician"},
        {"input": "I have been experiencing chest pain and palpitations.", "expected": "Cardiologist"},
        {"input": "I have a skin rash and it's very itchy.", "expected": "Dermatologist"},
        {"input": "My knee joint is hurting a lot after a fall.", "expected": "Orthopedic"},
        {"input": "I have a chronic migraine and feel numb.", "expected": "Neurologist"},
        {"input": "I have severe stomach pain and acidity.", "expected": "Gastroenterologist"},
        {"input": "I feel very anxious and stressed lately.", "expected": "Psychiatrist"},
        {"input": "My ear hurts and I have a sore throat.", "expected": "ENT Specialist"},
        {"input": "I am having trouble with my vision.", "expected": "Ophthalmologist"},
        {"input": "My blood sugar levels are high.", "expected": "Endocrinologist"}
    ]

    print(f"{'Input':<50} | {'Detected Spec':<20} | {'Status'}")
    print("-" * 80)

    all_passed = True
    for case in test_cases:
        result = ai_service.analyzer.extract_symptoms(case["input"])
        detected = result["recommended_spec"]
        status = "PASS" if detected == case["expected"] else f"FAIL (Expected {case[ 'expected' ]})"
        print(f"{case[ 'input' ]:<50} | {detected:<20} | {status}")
        if status != "PASS":
            all_passed = False

    if all_passed:
        print("\n✅ ALL DEPARTMENTS VERIFIED SUCCESSFULLY!")
    else:
        print("\n❌ SOME VERIFICATIONS FAILED.")

if __name__ == "__main__":
    verify_all_departments()
