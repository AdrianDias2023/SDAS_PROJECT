import tensorflow as tf

def build_lstm():

    model = tf.keras.Sequential([
        tf.keras.layers.LSTM(
            64,
            input_shape=(24,4)
        ),
        tf.keras.layers.Dense(1)
    ])

    model.compile(
        optimizer='adam',
        loss='mse',
        metrics=['mae']
    )

    return model


model = build_lstm()

print(model.summary())
print('LSTM model created')