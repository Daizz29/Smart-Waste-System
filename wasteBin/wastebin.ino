#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Servo.h>     

//Wifi and mqtt_broker
const char* ssid = "QL iphone";
const char* password = "Lam123123";
const char* mqtt_server = "171.244.173.204";

WiFiClient espClient;
PubSubClient client(espClient);
unsigned long lastMsg = 0;
#define MSG_BUFFER_SIZE (100)

// servo
Servo myservo; 
int pos = 0;


// waste1
char waste1[MSG_BUFFER_SIZE];
String state1;
int cap1 = 0;
float long1 = 105.8492;
float lat1 = 21.02664;

// waste2
char waste2[MSG_BUFFER_SIZE];
int cap2 = 15;
bool state2;
float long2 = 105.8478;
float lat2= 21.02926;

// waste3
char waste3[MSG_BUFFER_SIZE];
int cap3 = 25;
int state3;
float long3 = 105.84998;
float lat3 = 21.028;

// waste4
char waste4[MSG_BUFFER_SIZE];
int cap4 = 60;
bool state4;
float long4 = 105.85;
float lat4 = 21.02985;

// waste5
char waste5[MSG_BUFFER_SIZE];
int cap5 = 75;
bool state5;
float long5 = 105.851;
float lat5 = 21.0308;

// waste6
char waste6[MSG_BUFFER_SIZE];
int cap6 = 99;
bool state6;
float long6 = 105.8489;
float lat6 = 21.03051;

// wasteBin
const int trigPin = D1;
const int echoPin = D2;
long duration;
float distance;
int capacity;
float deepOfWaste = 18 ;
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
    
    if (state == true){
        for(pos = 0; pos < 180; pos += 1){ 
        myservo.write(pos);
        }
        Serial.println("open"); 
        delay(150);

    }
    else{
        for(pos = 180; pos>=1; pos-=1) {                           
        myservo.write(pos);
        }
        Serial.println("close");
        delay(150);
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
      client.publish("outTopic", "hello world");
      // ... and resubscribe
      client.subscribe("inTopic");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}


void setup() {
  pinMode(BUILTIN_LED, OUTPUT);     // Initialize the BUILTIN_LED pin as an output
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, 1884);

  client.setCallback(callback);

    // wasteBin
  pinMode(trigPin, OUTPUT); // Sets the trigPin as an Output
  pinMode(echoPin, INPUT); // Sets the echoPin as an Input
  //////////////
  // servo
  myservo.attach(D5);

}

void loop() {

  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  // wasteBin
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

if (distance >= 560){
  distance = 0;
}
else if (distance > deepOfWaste && distance < 560){
  distance = deepOfWaste;
}
capacity = 100 - (distance/deepOfWaste)*100;

  unsigned long now = millis();

  if (now - lastMsg > 3000) {
    lastMsg = now;
    cap1++;
    cap2++;
    cap3++;
    cap4+=3;
    cap5+=5;
    cap6+=10;

    state1 = "open"; // stirng
    state2 = true; // bool
    state3 = 0;
    

    if(cap1 > 100){
      cap1 = 0;
    }
    if(cap2 > 100){
      cap2 = 0;
    }
    if(cap3 > 100){
      cap3 = 0;
    }
    if(cap4 > 100){
      cap4 = 0;
    }
    if(cap5 > 100){
      cap5 = 0;
    }
    if(cap6 > 100){
      cap6 = 0;
    }
    
  
    snprintf (waste1, MSG_BUFFER_SIZE," { \"latitude\": \"%f\",\"longtitude\": \"%f\",  \"capacity\": \"%d\", \"state\" :\"%s\"} " ,lat1,long1,capacity,"open");
    client.publish("wasteManagement/waste1", waste1, true);  
    
    snprintf (waste2, MSG_BUFFER_SIZE," { \"latitude\": \"%f\",\"longtitude\": \"%f\",  \"capacity\": \"%d\", \"state\" :\"%s\"} " ,lat2,long2,cap2,"open");
    client.publish("wasteManagement/waste2", waste2, true);

    snprintf (waste3, MSG_BUFFER_SIZE," { \"latitude\": \"%f\",\"longtitude\": \"%f\",  \"capacity\": \"%d\", \"state\" :\"%s\"} " ,lat3,long3,cap3,"open");
    client.publish("wasteManagement/waste3", waste3, true);

    snprintf (waste4, MSG_BUFFER_SIZE," { \"latitude\": \"%f\",\"longtitude\": \"%f\",  \"capacity\": \"%d\", \"state\" :\"%s\"} " ,lat4,long4,cap4,"open");
    client.publish("wasteManagement/waste4", waste4, true);

    snprintf (waste5, MSG_BUFFER_SIZE," { \"latitude\": \"%f\",\"longtitude\": \"%f\",  \"capacity\": \"%d\", \"state\" :\"%s\"} " ,lat5,long5,cap5,"open");
    client.publish("wasteManagement/waste5", waste5, true);

    snprintf (waste6, MSG_BUFFER_SIZE," { \"latitude\": \"%f\",\"longtitude\": \"%f\",  \"capacity\": \"%d\", \"state\" :\"%s\"} " ,lat6,long6,cap6,"open");
    client.publish("wasteManagement/waste6", waste6, true);    

    client.subscribe("wasteManagement/waste1/control");

    
  }
}
