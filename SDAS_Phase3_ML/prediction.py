import numpy as np

def predict_level(model, sequence):

    sequence=np.array(sequence)

    prediction=model.predict(sequence)

    return float(prediction[0][0])


def detect_anomaly(error, threshold):

    if error > threshold:
        return True

    return False