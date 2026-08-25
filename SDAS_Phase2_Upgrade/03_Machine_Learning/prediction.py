def predict_water_level(model,input_data):
    prediction=model.predict(input_data)
    return prediction