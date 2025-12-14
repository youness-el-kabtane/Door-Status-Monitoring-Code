#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecure.h>

// WiFi
const char* ssid = "######################";
const char* password = "######################";

// Paste your Web App URL here (without params)
String webAppUrl = "########################################################################################";

// HC-SR04 pins (change if you wired differently)
const int trigPin = D5; // GPIO14
const int echoPin = D6; // GPIO12

void setup() {
  Serial.begin(115200);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
    Serial.print(".");
  }
  Serial.println("\nConnected!");
}

float readDistanceCM() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);

  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH, 30000);
  if (duration == 0) return -1;

  float distanceCm = (duration / 2.0) / 29.1;
  return distanceCm;
}

void loop() {
  float distance = readDistanceCM();

  if (distance < 0) {
    Serial.println("No echo");
  } else {
    Serial.print("Distance: ");
    Serial.println(distance);

    // --------------------------------------------------
    // HERE IS THE IMPORTANT PART:
    // Send 0 if distance < 5 cm, otherwise send 1
    // --------------------------------------------------
    int statusValue;

    if (distance < 5) {
      statusValue = 0;
    } else {
      statusValue = 1;
    }

    Serial.print("Sending value: ");
    Serial.println(statusValue);

    // Build URL: only send 0 or 1
    String url = webAppUrl + "?mode=write&distance=" + String(statusValue);

    WiFiClientSecure *client = new WiFiClientSecure;
    client->setInsecure();

    HTTPClient https;
    if (https.begin(*client, url)) {
      int httpCode = https.GET();
      if (httpCode > 0) {
        Serial.print("HTTP code: ");
        Serial.println(httpCode);
        Serial.print("Response: ");
        Serial.println(https.getString());
      } else {
        Serial.print("HTTP error: ");
        Serial.println(httpCode);
      }
      https.end();
    } else {
      Serial.println("Unable to connect");
    }

    delete client;
  }

  delay(2000); // send every 2 seconds
}
