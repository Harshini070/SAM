from datetime import datetime
import pandas as pd
from typing import Optional, Dict
import sys
sys.path.insert(0, '/'.join(__file__.split('/')[:-3]))

# SAM Classification: BMI < 14
# MAM Classification: BMI 14-18.5
# Healthy: BMI > 18.5

def calculate_bmi(weight_kg: float, height_cm: float) -> float:
    """Calculate BMI from weight and height"""
    height_m = height_cm / 100
    bmi = weight_kg / (height_m ** 2)
    return round(bmi, 2)

def predict_health_status(weight_kg: float, height_cm: float, age_months: int) -> Dict:
    """
    Predict health status based on anthropometric measurements
    Uses WHO standards and MUAC measurements
    """
    from app.models.child import HealthStatus
    
    bmi = calculate_bmi(weight_kg, height_cm)
    
    # Age-based classification
    if age_months < 60:  # Under 5 years
        if bmi < 14.0:
            status = HealthStatus.SAM
            risk_level = "CRITICAL"
            recommendation = "Immediate NRC referral required"
        elif bmi < 16.5:
            status = HealthStatus.MAM
            risk_level = "HIGH"
            recommendation = "Nutrition intervention and PHC followup"
        else:
            status = HealthStatus.HEALTHY
            risk_level = "LOW"
            recommendation = "Regular screening in 30 days"
    else:
        # Over 5 years
        if bmi < 15.0:
            status = HealthStatus.SAM
            risk_level = "CRITICAL"
            recommendation = "Immediate NRC referral required"
        elif bmi < 17.0:
            status = HealthStatus.MAM
            risk_level = "HIGH"
            recommendation = "Nutrition intervention and PHC followup"
        else:
            status = HealthStatus.HEALTHY
            risk_level = "LOW"
            recommendation = "Regular screening in 30 days"
    
    return {
        "bmi": bmi,
        "status": status,
        "risk_level": risk_level,
        "recommendation": recommendation,
        "predicted_at": datetime.utcnow()
    }



