# hapi-seaweedfs

# Install

```javascript
npm install hapi-seaweedfs
``` 

# Configuration

You can adjust this plugin to your needs with the following options
```javascript
host: "localhost", //your ip or domain
port: 9333, // the port of one master server
status: {
  //enable fetching of the systemStatus and 
  //emitting an event on the seaweedfs intercom channel
  enable: true/false, 
  fetchInterval: 15000 //fetch interval in milliseconds
}
```

# Usage

hapi-seaweedfs uses and requires [hapi-intercom](https://github.com/atroo/hapi-intercom) as a peer dependency. It operates on the "seaweedfs" channel, which can be retrieved via

```javascript
var channel = server.methods.intercom.getChannel("seaweedfs")
```

You can retrieve the connection itself to directly call methods on it. It will always return a Promise. 
```javascript
channel.request("connection").then(function(connection) {
  //do something
});
```
For the supported API operations have a look at [node-seaweedfs](https://github.com/atroo/node-weedfs). There are also the following convenient functions for easy access:
 ```javascript
//convenient method to request a file by id
channel.request("file", fileId).then(function(buffer) {
  //do something with the buffer
});

//get the information about the seaweed topology
channel.request("systemStatus", fileId).then(function(status) {
  //system status
});

//get information about the master cluster
channel.request("masterStatus", fileId).then(function(status) {
  //master status
});
 ```
