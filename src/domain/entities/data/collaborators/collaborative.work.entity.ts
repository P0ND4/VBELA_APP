type Logs = null | Date;

export interface CollaborativeWorkStatus {
  working: boolean;
  connection: Logs;
  disconnection: Logs;
}
