import sys
file_path = r'e:\final\backend\app\api\patient.py'
with open(file_path, 'r') as f:
    content = f.read()

target = "    # Process text with AI Engine (English Only)\n    processed_data = ai_service.process_symptoms(symptoms.raw_text, db=db)"
replacement = "    # Process text with AI Engine (English Only)\n    print(f'DEBUG: Start symptom processing...')\n    try:\n        processed_data = ai_service.process_symptoms(symptoms.raw_text, db=db)\n    except Exception as e:\n        print(f'DEBUG: AI FAILED: {str(e)}')\n        raise HTTPException(status_code=500, detail=str(e))\n    print(f'DEBUG: AI Finish.')"

if target in content:
    print("Found exact match!")
    new_content = content.replace(target, replacement)
    with open(file_path, 'w') as f:
        f.write(new_content)
else:
    print("Exact match NOT FOUND. Searching for line 98 only.")
    lines = content.splitlines()
    # Find matching line by text
    found = False
    for i in range(len(lines)):
        if "ai_service.process_symptoms" in lines[i]:
            print(f"Found at line {i+1}: {lines[i]}")
            lines[i] = "    try:\n        print(f'DEBUG: Start...')\n        processed_data = ai_service.process_symptoms(symptoms.raw_text, db=db)\n        print(f'DEBUG: End.')\n    except Exception as e:\n        print(f'CRASH: {str(e)}')\n        raise HTTPException(status_code=500, detail=f'CRASH: {str(e)}')"
            found = True
            break
    if found:
        with open(file_path, 'w') as f:
            f.write("\n".join(lines))
        print("Success!")
    else:
        print("Final search FAILED.")
