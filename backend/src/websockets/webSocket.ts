// websocket-handlers.js
export const open = (ws) => {
  console.log("Un socket ha sido abierto");
};

export const message = (ws, message) => {
  console.log("Mensaje recibido:", message);
  ws.send("He recibido tu mensaje");
};

export const close = (ws, code, message) => {
  console.log(`Socket cerrado con código ${code} y mensaje: ${message}`);
};

export const drain = (ws) => {
  console.log("El socket está listo para recibir más datos");
};
