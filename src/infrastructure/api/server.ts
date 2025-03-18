import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosRequestConfig } from "axios";
// import { Queue, readQueueOperation, saveQueueOperation } from "../offline/operation.queue";
// import { thousandsSystem } from "shared/utils";

enum Status {
  Success = "success",
  Pending = "pending",
  Denied = "denied",
  Completed = "completed",
  Error = "error",
  Cancelled = "cancelled",
  InProgress = "in_progress",
}

interface ApiResponse<T> {
  status: Status;
  message: string;
  code: number;
  data: T;
}

export const baseURL = process.env.EXPO_PUBLIC_API_URL;

// const addQueue = async (config: AxiosRequestConfig) => {
//   const queueItem: Queue = {
//     id: `req_${Date.now()}`,
//     endpoint: config.url!,
//     method: config.method as "POST" | "PUT" | "DELETE",
//     data: config.data,
//   };

//   await saveQueueOperation(queueItem);
// };

const apiClient = async <T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  const token = await AsyncStorage.getItem("access_token");

  // const currentQueue = await readQueueOperation();
  // if (currentQueue.length > 0) {
  //   const message = `Queued request due to pending transactions: ${thousandsSystem(currentQueue.length)}`;
  //   console.warn(message);
  //   await addQueue(config);
  //   throw new Error(message);
  // }

  try {
    const response = await axios({
      ...config,
      baseURL,
      headers: { ...(token && { Authorization: `Bearer ${token}` }) },
    });
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    // await addQueue(config);
    throw error;
  }
};

export const endpoints = {
  auth: {
    serverTime: () => "/api/v1/user/auth/server-time",
    login: () => "/api/v1/user/auth/login",
    logout: () => "/api/v1/user/auth/logout",
  },
  verify: {
    email: () => "/api/v1/user/verify/email",
    phone: () => "/api/v1/user/verify/phone",
  },
  check: {
    email: () => "/api/v1/user/check/email",
    phone: () => "/api/v1/user/check/phone",
  },
  user: {
    get: () => "/api/v1/user",
    delete: () => "/api/v1/user",
  },
  setting: {
    darkMode: () => "/api/v1/user/setting/dark-mode",
    coin: () => "/api/v1/user/setting/coin",
    color: () => "/api/v1/user/setting/color",
    invoiceInformation: () => "/api/v1/user/setting/invoice-information",
    paymentMethods: {
      post: () => "/api/v1/user/setting/payment-methods",
      put: (id: string) => `/api/v1/user/setting/payment-methods/${id}`,
      delete: (id: string) => `/api/v1/user/setting/payment-methods/${id}`,
    },
    economicGroup: {
      post: () => "/api/v1/user/setting/economic-group",
      put: (id: string) => `/api/v1/user/setting/economic-group/${id}`,
      delete: (id: string) => `/api/v1/user/setting/economic-group/${id}`,
    },
  },
  kitchen: {
    post: () => "/api/v1/user/kitchen",
    put: (id: string) => `/api/v1/user/kitchen/${id}`,
    delete: (id: string) => `/api/v1/user/kitchen/${id}`,
  },
  inventory: {
    post: () => "/api/v1/user/inventory",
    put: (id: string) => `/api/v1/user/inventory/${id}`,
    delete: (id: string) => `/api/v1/user/inventory/${id}`,
  },
  recipe: {
    post: () => "/api/v1/user/recipe",
    put: (id: string) => `/api/v1/user/recipe/${id}`,
    delete: (id: string) => `/api/v1/user/recipe/${id}`,
  },
  stock: {
    post: () => "/api/v1/user/stock",
    put: (id: string) => `/api/v1/user/stock/${id}`,
    delete: (id: string) => `/api/v1/user/stock/${id}`,
    postMovement: () => "/api/v1/user/stock/movement",
    putMovement: () => `/api/v1/user/stock/movement`,
    deleteMovement: (id: string) => `/api/v1/user/stock/movement/${id}`,
  },
  menuGroup: {
    post: () => "/api/v1/user/menu-group",
    put: (id: string) => `/api/v1/user/menu-group/${id}`,
    delete: (id: string) => `/api/v1/user/menu-group/${id}`,
  },
  menu: {
    post: () => "/api/v1/user/menu",
    put: (id: string) => `/api/v1/user/menu/${id}`,
    delete: (id: string) => `/api/v1/user/menu/${id}`,
  },
  order: {
    post: () => "/api/v1/user/order",
    put: (id: string) => `/api/v1/user/order/${id}`,
    delete: (id: string) => `/api/v1/user/order/${id}`,
  },
  restaurant: {
    post: () => "/api/v1/user/restaurant",
    put: (id: string) => `/api/v1/user/restaurant/${id}`,
    delete: (id: string) => `/api/v1/user/restaurant/${id}`,
  },
  table: {
    post: () => "/api/v1/user/table",
    postMultiple: () => "/api/v1/user/table/multiple",
    put: (id: string) => `/api/v1/user/table/${id}`,
    delete: (id: string) => `/api/v1/user/table/${id}`,
  },
  productGroup: {
    post: () => "/api/v1/user/product-group",
    put: (id: string) => `/api/v1/user/product-group/${id}`,
    delete: (id: string) => `/api/v1/user/product-group/${id}`,
  },
  product: {
    post: () => "/api/v1/user/product",
    put: (id: string) => `/api/v1/user/product/${id}`,
    delete: (id: string) => `/api/v1/user/product/${id}`,
  },
  store: {
    post: () => "/api/v1/user/store",
    put: (id: string) => `/api/v1/user/store/${id}`,
    delete: (id: string) => `/api/v1/user/store/${id}`,
  },
  sale: {
    post: () => "/api/v1/user/sale",
    put: (id: string) => `/api/v1/user/sale/${id}`,
    delete: (id: string) => `/api/v1/user/sale/${id}`,
  },
  handler: {
    post: () => "/api/v1/user/handler",
    put: (id: string) => `/api/v1/user/handler/${id}`,
    delete: (id: string) => `/api/v1/user/handler/${id}`,
  },
  supplier: {
    post: () => "/api/v1/user/supplier",
    put: (id: string) => `/api/v1/user/supplier/${id}`,
    delete: (id: string) => `/api/v1/user/supplier/${id}`,
  },
  economy: {
    post: () => "/api/v1/user/economy",
    put: (id: string) => `/api/v1/user/economy/${id}`,
    delete: (id: string) => `/api/v1/user/economy/${id}`,
  },
};

export default apiClient;
