enum Status {
  Success = "success",
  Pending = "pending",
  Denied = "denied",
  Completed = "completed",
  Error = "error",
  Cancelled = "cancelled",
  InProgress = "in_progress",
}

export interface ApiResponse<T> {
  status: Status;
  message: string;
  code: number;
  data: T;
}
