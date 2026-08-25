/*
 SDAS Smart Dam Alert System
 ESP32 Firmware Prototype

 Hardware:
 - ESP32
 - JSN-SR04T Waterproof Ultrasonic Sensor
 - DHT22 Temperature/Humidity Sensor
 - SIM800L GSM Module
 - MG996 Servo Gate Control

 Upload interval:
 Every 60 seconds
*/

#include <WiFi.h>
#include <HTTPClient.h>
#include <Servo.h>
#include <DHT.h>

#define DHTPIN 4
#define DHTTYPE DHT22

#define TRIG_PIN 5
#define ECHO_PIN 18

#define SERVO_PIN 13

DHT dht(DHTPIN, DHTTYPE);
Servo gateServo;

unsigned long lastUpload = 0;

float readWaterLevel(){

  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);

  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);

  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN,HIGH);

  float distance = duration * 0.034 / 2;

  return distance;
}


void setup(){

 Serial.begin(115200);

 dht.begin();

 pinMode(TRIG_PIN,OUTPUT);
 pinMode(ECHO_PIN,INPUT);

 gateServo.attach(SERVO_PIN);

 gateServo.write(0);

}


void loop(){

 if(millis()-lastUpload >= 60000){

    float waterLevel = readWaterLevel();

    float temperature=dht.readTemperature();

    float humidity=dht.readHumidity();


    Serial.println("SDAS Sensor Data");

    Serial.print("Water Level:");
    Serial.println(waterLevel);

    Serial.print("Temperature:");
    Serial.println(temperature);

    Serial.print("Humidity:");
    Serial.println(humidity);


    /*
      Send data to Supabase REST API here

      JSON:
      {
       device_id:"ESP32_01",
       water_level:value,
       temperature:value,
       humidity:value
      }
    */


    lastUpload=millis();
 }

}