#file will handle data cleaning + normalization
def normalize_height(height_cm):

    return round(height_cm / 200, 2)


def normalize_weight(weight):

    return round(weight / 100, 2)
