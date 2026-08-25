import tensorflow as tf

def build_autoencoder():

    model=tf.keras.Sequential([
        tf.keras.layers.Dense(
            16,
            activation='relu',
            input_shape=(4,)
        ),
        tf.keras.layers.Dense(
            4,
            activation='linear'
        )
    ])

    model.compile(
        optimizer='adam',
        loss='mse'
    )

    return model


model=build_autoencoder()

print('Autoencoder created')