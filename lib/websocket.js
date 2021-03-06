'use strict';

// Websocket binding for Impress Application Server

const { websocket } = api;
const WebsocketServer = websocket.server;

// Upgrade HTTP server to support websocket

websocket.upgradeServer = server => {

  server.webSocketServer = new WebsocketServer({
    httpServer: server,
    autoAcceptConnections: false
  });

  server.webSocketServer.on('request', request => {
    const req = request.httpRequest;
    const res = request.socket;
    res.websocket = {};
    res.websocket.request = request;

    const client = impress.dispatcher(req, res);
    const application = client.application;
    application.emit('connect', client);
  });

};

websocket.initialize = client => {
  let ws;
  if (client.res.websocket) {
    ws = client.res.websocket;
    client.websocket = ws;
  } else {
    ws = { fake: true };
    client.websocket = ws;
    client.error(400);
  }

  ws.accept = cookies => {
    ws.isAccepted = true;
    client.res.statusCode = 101;
    client.application.accessLog(client);
    if (ws.fake) return;
    const connection = ws.request.accept('', ws.request.origin, cookies);
    return connection;
  };
};

websocket.finalize = client => {
  const ws = client.res.websocket;
  if (ws && !ws.isAccepted) {
    ws.request.reject();
  }
};
