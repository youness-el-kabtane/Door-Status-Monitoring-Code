# Door Status Monitoring System

## Project Overview

> This project is a **real-time door status monitoring system** using an **ESP8266 (Wemos D1 mini)** and an **ultrasonic sensor**. The system detects whether a door is **OPEN** or **CLOSED** and logs the status to **Google Sheets**. The data can be accessed via a web interface or a mobile app for remote monitoring.

## Schematic and Components

### Components:

- ESP8266 or Wemos D1 min or similar

- Ultrasonic sensor (HC-SR04)

- Jumper wires

- Breadboard

- Power supply

![enter image description here](https://github.com/youness-el-kabtane/Door-Status-Monitoring---Code/blob/45ceb65dc3e33433829de566beb1a4d2ce544b79/Screenshot.png)

## Principle of Operation

The **Door Status Monitoring System** works by detecting the position of a door using an **ultrasonic sensor (HC-SR04)** connected to an **ESP8266** microcontroller. The sensor continuously measures the distance to the door.

- If the measured distance is below a set threshold (e.g., 5 cm), the door is considered **CLOSED**.

- If the distance exceeds the threshold, the door is considered **OPEN**.

Whenever the door state changes, the ESP8266 sends the status (0 = CLOSED, 1 = OPEN) to a **Google Apps Script web service**, which logs it in a **Google Sheet**.

Additionally, the system can automatically send an **email alert** when the door opens, providing real-time notifications.

This setup allows **remote monitoring** of door status through the sheet or any connected web/mobile interface.

## Microcontroller Code - Key Parts

1. **WiFi Setup**

```c
WiFi.begin(ssid, password);
```

- Connects the ESP8266 to your WiFi network.
2. **Ultrasonic Sensor**

```c
float readDistanceCM()
```

- Triggers the sensor and measures the echo pulse.

- Converts the duration into **distance in cm**.
3. **Determine Door Status**

```c
if (distance < 5) statusValue = 0; else statusValue = 1;
```

- If the measured distance is **less than 5 cm**, the door is considered **closed (0)**.

- Otherwise, the door is **open (1)**.
4. **Send Data to Google Apps Script**

```c
String url = webAppUrl + "?mode=write&distance=" + String(statusValue);
```

- Sends the door status to your Google Sheet via HTTPS using `HTTPClient` and `WiFiClientSecure`.
5. **Loop**
- Reads distance and sends status **every 2 seconds**.

- Prints debug info to Serial Monitor.

## Google Apps Script - Key Parts

1. **Entry Point – `doGet(e)`**

```js
var mode = e.parameter.mode; if (mode === "write") return writeData(e); else if (mode === "read") return readStatus();
```

- Determines if the request is **writing data** (ESP8266 sending status) or **reading data** (someone querying the last door state).
2. **Read Last Door Status – `readStatus()`**

```js
var lastRow = sheet.getLastRow(); var status = sheet.getRange(lastRow, 2).getValue();
```

- Returns the last logged status (`OPEN`/`CLOSED`) from **column B**.

- If no data exists, returns `"UNKNOWN"`.
3. **Write New Status – `writeData(e)`**

```js
var value = e.parameter.distance; // "0" or "1"
```

- Receives `0` (CLOSED) or `1` (OPEN) from ESP8266.

- Ignores repeated states using **Script Properties** to avoid duplicate entries.

- Converts numeric value to **text** (`OPEN`/`CLOSED`).

- Logs only when the state changes.
4. **Email Alert – `sendAlertEmail()`**

```js
if (value == "1") sendAlertEmail();
```

- Sends an **automatic email** if the door opens (`value == 1`), including the **timestamp**.

---

**Author:** Youness El Kabtane

**Website:** [Youness El Kabtane](https://youness-el-kabtane.github.io/site/)

**Version:** 1.0.0

**Made with 💗**






