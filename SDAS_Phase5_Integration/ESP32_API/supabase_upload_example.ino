// SDAS ESP32 Supabase REST Upload Example

#include <HTTPClient.h>
#include <WiFi.h>

String supabaseURL="YOUR_URL/rest/v1/sensor_readings";
String apiKey="YOUR_KEY";

void uploadSensor(float water,float temp,float humidity){

 HTTPClient http;

 http.begin(supabaseURL);

 http.addHeader("apikey",apiKey);
 http.addHeader("Authorization","Bearer "+apiKey);
 http.addHeader("Content-Type","application/json");

 String json =
 "{\"device_id\":\"ESP32_01\","+
 "\"water_level\":"+String(water)+","+
 "\"temperature\":"+String(temp)+","+
 "\"humidity\":"+String(humidity)+"}";

 http.POST(json);

 http.end();

}