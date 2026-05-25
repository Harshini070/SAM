from preprocessing import normalize_height, normalize_weight

def calculate_bmi(weight, height_cm):
    height_m = height_cm / 100
    bmi = weight / (height_m ** 2)
    return round(bmi, 2)


def classify_bmi(bmi):

    if bmi < 14:
        return "Severe Acute Malnutrition"

    elif bmi < 18:
        return "Moderate Malnutrition"

    else:
        return "Healthy"


def predict_sam(weight, height_cm, age):

    normalized_height = normalize_height(height_cm)
    normalized_weight = normalize_weight(weight)

    bmi = calculate_bmi(weight, height_cm)

    category = classify_bmi(bmi)

    risk = ""

    if age < 5 and bmi < 14:
        risk = "High Risk"

    elif bmi < 18:
        risk = "Moderate Risk"

    else:
        risk = "Low Risk"

    return {

        "Age": age,

        "Normalized Height": normalized_height,

        "Normalized Weight": normalized_weight,

        "BMI": bmi,

        "Category": category,

        "Risk": risk
    }