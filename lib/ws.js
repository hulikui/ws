/**
  这是一个简单的WebSocket服务
  只提供一个广播的功能，足够微信墙用了
 */

var WS_PORT = require('./config').wsPort;

var WebSocketServer = require('ws').Server//监听微信服务器
  , wss = new WebSocketServer({ port: WS_PORT });//监听客户端

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received微信收到，准备转发:%s', message);
  });

  console.log('new client connected.');
});
//对每个用户进行广播
wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(JSON.stringify(data));
  });
};

module.exports = {
  wss: wss
};

console.log("Socket server runing at port: " + WS_PORT + ".");
