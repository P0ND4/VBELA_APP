export interface Sync {
  lastConnection: null | Date;
  connected: boolean;
  ping: null | number;
  rooms: string[];
}
