import io from "socket.io-client";

const production = false;

const API = production ? "https://vbelapp.com" : "http://192.168.230.48:5031";

export const socket = io(API, { transports: ["websocket"] });
