"""
SDAS — LSTM Water Level Forecasting Model
Trains a 2-layer LSTM to predict water level 1 hour ahead.
Target: MAPE < 5%

Usage:
  python train_lstm.py

Outputs:
  models/lstm_model.h5
  models/lstm_model.tflite   (for edge deployment)
"""

import numpy as np
import pandas as pd
import joblib
import os
import json
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.metrics import mean_absolute_percentage_error

# ── Config ─────────────────────────────────────────────────────
EPOCHS      = 20
BATCH_SIZE  = 64
PATIENCE    = 8      # Early stopping patience
LOOKBACK    = 24
N_FEATURES  = 4      # water_level_pct, temperature, humidity, rainfall_mm

os.makedirs('models', exist_ok=True)


def build_lstm_model(lookback: int, n_features: int) -> keras.Model:
    """
    2-layer stacked LSTM with dropout regularisation.
    Architecture from proposal: 64-unit LSTM, MAPE < 5% target.
    """
    model = keras.Sequential([
        layers.Input(shape=(lookback, n_features)),

        # Layer 1: LSTM with return sequences
        layers.LSTM(64, return_sequences=True,
                    kernel_regularizer=tf.keras.regularizers.l2(1e-4)),
        layers.Dropout(0.2),

        # Layer 2: LSTM
        layers.LSTM(32, return_sequences=False),
        layers.Dropout(0.2),

        # Output: single value (1-hour ahead water level, normalised)
        layers.Dense(16, activation='relu'),
        layers.Dense(1),
    ], name='SDAS_LSTM')

    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-3),
        loss='mse',
        metrics=['mae'],
    )
    return model


def inverse_transform_target(scaler, y: np.ndarray) -> np.ndarray:
    """Inverse-transform the target column only (water_level_pct = col 0)."""
    dummy = np.zeros((len(y), scaler.n_features_in_))
    dummy[:, 0] = y
    return scaler.inverse_transform(dummy)[:, 0]


def evaluate_mape(y_true_raw: np.ndarray, y_pred_raw: np.ndarray) -> float:
    # Avoid division by zero
    mask = y_true_raw > 1.0
    return mean_absolute_percentage_error(y_true_raw[mask], y_pred_raw[mask]) * 100


def main():
    # ── Load preprocessed data ──────────────────────────────────
    print("Loading preprocessed data...")
    X_train = np.load('dataset/X_train.npy')
    X_val   = np.load('dataset/X_val.npy')
    X_test  = np.load('dataset/X_test.npy')
    y_train = np.load('dataset/y_train.npy')
    y_val   = np.load('dataset/y_val.npy')
    y_test  = np.load('dataset/y_test.npy')
    scaler  = joblib.load('dataset/scaler.pkl')

    print(f"Train: {X_train.shape}  Val: {X_val.shape}  Test: {X_test.shape}")

    # ── Build model ─────────────────────────────────────────────
    model = build_lstm_model(LOOKBACK, N_FEATURES)
    model.summary()

    # ── Callbacks ───────────────────────────────────────────────
    callbacks = [
        keras.callbacks.EarlyStopping(
            monitor='val_loss', patience=PATIENCE,
            restore_best_weights=True, verbose=1,
        ),
        keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss', factor=0.5, patience=4,
            min_lr=1e-6, verbose=1,
        ),
        keras.callbacks.ModelCheckpoint(
            'models/lstm_best.h5', monitor='val_loss',
            save_best_only=True, verbose=0,
        ),
    ]

    # ── Train ───────────────────────────────────────────────────
    print("\nTraining LSTM model...")
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=EPOCHS,
        batch_size=BATCH_SIZE,
        callbacks=callbacks,
        verbose=1,
    )

    # ── Evaluate ────────────────────────────────────────────────
    print("\nEvaluating on test set...")
    y_pred_norm = model.predict(X_test).flatten()

    y_true_raw = inverse_transform_target(scaler, y_test)
    y_pred_raw = inverse_transform_target(scaler, y_pred_norm)

    mape = evaluate_mape(y_true_raw, y_pred_raw)
    mae  = np.mean(np.abs(y_true_raw - y_pred_raw))
    rmse = np.sqrt(np.mean((y_true_raw - y_pred_raw) ** 2))

    print(f"\n{'='*40}")
    print(f"  LSTM Evaluation Results")
    print(f"  MAPE: {mape:.2f}%  (target: < 5%)")
    print(f"  MAE:  {mae:.3f}%")
    print(f"  RMSE: {rmse:.3f}%")
    print(f"  {'✅ PASS' if mape < 5 else '⚠️ FAIL — retrain needed'}")
    print(f"{'='*40}\n")

    # ── Save model ──────────────────────────────────────────────
    model.save('models/lstm_model.h5')
    print("Saved: models/lstm_model.h5")

    # ── Export to TFLite (for edge inference) ───────────────────
    try:
        converter = tf.lite.TFLiteConverter.from_keras_model(model)
        converter.target_spec.supported_ops = [
            tf.lite.OpsSet.TFLITE_BUILTINS,
            tf.lite.OpsSet.SELECT_TF_OPS
        ]
        converter._experimental_lower_tensor_list_ops = False
        tflite_model = converter.convert()
        with open('models/lstm_model.tflite', 'wb') as f:
            f.write(tflite_model)
        print("Saved: models/lstm_model.tflite")
    except Exception as e:
        print(f"Note on TFLite export: {e}")

    # ── Save metrics ────────────────────────────────────────────
    metrics = {
        'mape': round(float(mape), 4),
        'mae':  round(float(mae),  4),
        'rmse': round(float(rmse), 4),
        'epochs_trained': len(history.history['loss']),
        'pass_target': bool(mape < 5),
    }
    with open('models/lstm_metrics.json', 'w') as f:
        json.dump(metrics, f, indent=2)
    print("Saved: models/lstm_metrics.json")
    print("\n✅ LSTM training complete")


if __name__ == '__main__':
    main()