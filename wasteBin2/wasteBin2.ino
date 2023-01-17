#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Servo.h> 

//Wifi and mqtt_broker
const char* ssid = "IoT-LAB";
const char* password = "Vtnet@1812";
const char* mqtt_server = "171.244.173.204";

WiFiClient espClient; 
PubSubClient client(espClient);
unsigned long lastMsg = 0;
#define MSG_BUFFER_SIZE (100)

// servo
#define TURN_TIME 410
Servo myservo; 
const int servoPin = D4;

// waste2
char waste2[MSG_BUFFER_SIZE];
int capacity2;
int cap2;
float long2 = 105.8478;
float lat2= 21.02926;
char state2[6];
char stateChange[6] = "open";
char open[5]= "open";
char close[6]= "close";

// wasteBin
const int trigPin = D1;
const int echoPin = D2;
long duration;
float distance;
int capacity;
float deepOfWaste = 18;
//////////

void setup_wifi() {

  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  randomSeed(micros());

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived in topic: ");
  Serial.println(topic);
  Serial.print("Message:");

  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);  
  }
    StaticJsonBuffer<200> jsonBuffer;
    JsonObject& root = jsonBuffer.parseObject(payload);
    const bool state = root["state"];
    Serial.println();
    Serial.println(state);
    if(state == false){

      // close the pin
      myservo.write(0); // Start turning clockwise
      delay(TURN_TIME); // Go on turning for the right duration
      myservo.write(90);// Stop turning

      for(int i=0; i <6; i++){
          stateChange[i] = close[i]; 
      }      
      Serial.println("close");
    }else{
      // open the pin
      myservo.write(180); // Start turning anti-clockwise
      delay(TURN_TIME); // Go on turning for the right duration
      myservo.write(90);// Stop turning
        for(int i=0; i <6; i++){
          stateChange[i] = open[i];
        }
        Serial.println("open");
    }  
  Serial.println();
  Serial.println("-----------------------");
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Create a random client ID
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    Serial.println(clientId);
    // Attempt to connect
    if (client.connect(clientId.c_str())) {
      Serial.println("connected");
      // Once connected, publish an announcement...
      // client.publish("wasteManagement", "hello world");
      // ... and resubscribe
      client.subscribe("wasteManagement/waste2/control");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}

void publish() {
    stateAssign(state2);
    snprintf (waste2, MSG_BUFFER_SIZE," { \"latitude\": \"%f\",\"longtitude\": \"%f\",  \"capacity\": \"%d\", \"state\": \"%s\"} " ,lat2,long2,capacity2, state2);
    client.publish("wasteManagement/waste2/status", waste2, true);

}
void wasteBinData(){
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  // Sets the trigPin on HIGH state for 10 micro seconds
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  // Reads the echoPin, returns the sound wave travel time in microseconds
  duration = pulseIn(echoPin, HIGH);

  // Calculating the distance
  distance= duration*0.034/2;
  // Serial.println(distance);
  if (distance >= 560){
    distance = 0;
  }
  else if (distance > deepOfWaste && distance < 560){
    distance = deepOfWaste;
  }
  capacity2 = 100 - (distance/deepOfWaste)*100;
  delay(500);

  // if waste is full, close the bin.
  if (capacity2 == 100){
    if (!strcmp(state2, open)){ // equal to (strcmp(state1, open) == 0)

      // close the pin
      myservo.write(0); // Start turning clockwise
      delay(TURN_TIME); // Go on turning for the right duration
      myservo.write(90);// Stop turning
      
      for(int i=0; i <6; i++){
          stateChange[i] = close[i];
        }
        Serial.println("close");
    }
  }
  // fake cap2
  unsigned long now = millis();
  if (now - lastMsg > 3000) {
    lastMsg = now;
    cap2 +=5;
    if(cap2 > 100){
      cap2 = 0;
    }
  }
}
void stateAssign(char *state){
  for(int i=0; i <7; i++){
    state[i] = stateChange[i];
  }
}
void setup() {
  pinMode(BUILTIN_LED, OUTPUT);     // Initialize the BUILTIN_LED pin as an output
  Serial.begin(115200);
  setup_wifi();

  //servo
  myservo.attach(servoPin);
  myservo.write(90);


  // MQTT
  client.setServer(mqtt_server, 1884);
  client.setCallback(callback);
  
    // wasteBin
  pinMode(trigPin, OUTPUT); // Sets the trigPin as an Output
  pinMode(echoPin, INPUT); // Sets the echoPin as an Input
  //////////////

}
void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  wasteBinData();
  publish();
  delay (2000);
}



