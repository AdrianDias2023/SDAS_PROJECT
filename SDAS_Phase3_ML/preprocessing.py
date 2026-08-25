import pandas as pd
from sklearn.preprocessing import MinMaxScaler

def load_and_prepare(file):
    df = pd.read_csv(file)

    df['timestamp'] = pd.to_datetime(df['timestamp'])

    df = df.dropna()

    features = [
        'water_level',
        'temperature',
        'humidity',
        'rainfall'
    ]

    scaler = MinMaxScaler()

    scaled = scaler.fit_transform(df[features])

    return scaled, scaler


if __name__ == '__main__':
    print('SDAS preprocessing ready')