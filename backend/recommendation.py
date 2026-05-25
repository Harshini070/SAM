def generate_recommendation(category):

    if category == "Healthy":

        return {
            "recommendation": "Child is healthy. Continue balanced nutrition and regular monitoring.",
            "confidence": "98.5%",
            "zscore": "> -2 SD"
        }

    elif category == "Moderate Malnutrition":

        return {
            "recommendation": "Provide supplementary nutrition and monitor growth regularly.",
            "confidence": "94.2%",
            "zscore": "-2 SD to -3 SD"
        }

    else:

        return {
            "recommendation": "Immediate medical intervention required. Begin therapeutic feeding and clinical assessment.",
            "confidence": "99.1%",
            "zscore": "< -3 SD"
        }