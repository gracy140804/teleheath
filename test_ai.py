import sys
sys.path.append("backend")
from app.services.ai_service import ClinicalAnalyzer

analyzer = ClinicalAnalyzer()

test_cases = [
    "palpitation",
    "papilataion",       # user's exact typo
    "I have nausea",
    "headache for 3 days",
    "fever and cough",
    "chest pain and shortness of breath",
    "dizziness",
    "skin rash and itchy",
    "anxiety and stress",
    "knee pain",
    "I feel tired and weak",
    "blurry vision",
    "sore throat",
]

print("=" * 60)
print("SYMPTOM ANALYSIS TEST RESULTS")
print("=" * 60)
for text in test_cases:
    result = analyzer.extract_symptoms(text)
    print(f"\nInput:    '{text}'")
    print(f"Symptoms: {result['symptoms']}")
    print(f"Spec:     {result['recommended_spec']}")
    print(f"Summary:  {result['summary']}")
