import io from "socket.io-client";

const production = false;

const API = production ? "https://vbelapp.com" : "http://192.168.230.48:5031";

export const socket = io(API, {
  pingInterval: 10000, // Enviar un mensaje de latido cada 10 segundos
  pingTimeout: 5000, // Esperar 5 segundos para recibir una respuesta del servidor
});
