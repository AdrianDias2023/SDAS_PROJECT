# SDAS ESP32 Communication

ESP32 responsibilities:

1. Read JSN-SR04T water level sensor
2. Read DHT22 temperature/humidity
3. Send readings every 60 seconds
4. Receive gate commands
5. Control MG996 servo

Data destination:

Supabase table:
sensor_readings

Required fields:

device_id
water_level
temperature
humidity
rainfall
sensor_health


Gate commands:

OPEN
CLOSE
AUTO