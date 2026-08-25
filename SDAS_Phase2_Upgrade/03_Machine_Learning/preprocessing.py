import pandas as pd

def prepare_dataset(path):
    df=pd.read_csv(path)
    df=df.dropna()
    return df

print('Dataset preprocessing module ready')