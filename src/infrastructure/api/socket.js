import io from "socket.io-client";

const API = process.env.EXPO_PUBLIC_API_URL;

export const socket = io(API, { transports: ["websocket"] });
