// ---------------- Google Sheets Integration ----------------
// 1. Create a new Google Sheet (or use an existing one).
// 2. Make sure the first sheet has at least two columns:
//    Column A = Timestamp
//    Column B = Door Status (OPEN / CLOSED)
// 3. Go to Extensions → Apps Script and paste this code.
// 4. Deploy as Web App (Publish → Deploy as web app).
//    - Execute the app as: "Me"
//    - Who has access: "Anyone"
// 5. Copy the Web App URL and paste it in your Arduino code (webAppUrl).
// 6. The script will automatically log door status changes and can send email alerts.

function doGet(e) {
  var mode = e.parameter.mode;
  
  if (mode === "write") {
    return writeData(e);
  } else if (mode === "read") {
    return readStatus();
  }
  
  return ContentService.createTextOutput("Invalid mode");
}

function readStatus() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var lastRow = sheet.getLastRow();

  if (lastRow === 0) {
    return ContentService.createTextOutput("UNKNOWN");
  }

  var status = sheet.getRange(lastRow, 2).getValue(); // Column B = OPEN/CLOSED
  return ContentService.createTextOutput(status);
}

function writeData(e) {
  var value = e.parameter.distance; // "0" or "1"
  if (value === undefined) {
    return ContentService.createTextOutput("No value received");
  }

  var props = PropertiesService.getScriptProperties();
  var lastState = props.getProperty("lastDoorState");

  // 🚫 Ignore repeated same state
  if (lastState === value) {
    return ContentService.createTextOutput("No state change");
  }

  // ✅ Save new state
  props.setProperty("lastDoorState", value);

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var timestamp = new Date();
  var statusText = (value == "1") ? "OPEN" : "CLOSED";

  // 📝 Log ONLY on change
  sheet.appendRow([timestamp, statusText]);

  // 📧 Send email immediately when door opens
  if (value == "1") {
    sendAlertEmail();
  }

  return ContentService.createTextOutput("State updated");
}

function sendAlertEmail() {
  var email = "##################";
  var subject = "🚨 Door Open Alert";
  var body =
    "⚠️ ALERT!\n\n" +
    "The door has been OPENED.\n\n" +
    "Time: " + new Date().toLocaleString() + "\n\n" +
    "This message was sent automatically by ESP8266.";

  MailApp.sendEmail(email, subject, body);
}
