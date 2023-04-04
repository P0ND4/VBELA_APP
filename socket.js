import io from 'socket.io-client';

const API = "http://192.168.230.48:5031";

export const socket = io(API);
