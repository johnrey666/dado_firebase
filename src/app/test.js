let socket = new WebSocket("ws://localhost:8080");

socket.onopen = function(e) {
  console.log("Connection established");
};

socket.onerror = function(error) {
  console.log("Error connecting to server");
};