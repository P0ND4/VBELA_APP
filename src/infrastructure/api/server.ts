import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosRequestConfig } from "axios";

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

const baseURL = process.env.EXPO_PUBLIC_API_URL;

const apiClient = async <T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  const token = await AsyncStorage.getItem("access_token");
  const headers = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  try {
    const response = await axios({ baseURL, ...config, ...headers });
    return response.data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

export const endpoints = {
  auth: {
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
      put: () => "/api/v1/user/setting/payment-methods",
      delete: (id: string) => `/api/v1/user/setting/payment-methods/${id}`,
    },
  },
  kitchen: {
    post: () => "/api/v1/user/kitchen",
    put: () => "/api/v1/user/kitchen",
    delete: (id: string) => `/api/v1/user/kitchen/${id}`,
  },
  inventory: {
    post: () => "/api/v1/user/inventory",
    put: () => "/api/v1/user/inventory",
    delete: (id: string) => `/api/v1/user/inventory/${id}`,
  },
  recipe: {
    post: () => "/api/v1/user/recipe",
    put: () => "/api/v1/user/recipe",
    delete: (id: string) => `/api/v1/user/recipe/${id}`,
  },
  stock: {
    post: () => "/api/v1/user/stock",
    put: () => "/api/v1/user/stock",
    delete: (id: string) => `/api/v1/user/stock/${id}`,
    postMovement: () => "/api/v1/user/stock/movement",
    putMovement: () => "/api/v1/user/stock/movement",
    deleteMovement: (id: string) => `/api/v1/user/stock/movement/${id}`,
  },
  menu: {
    post: () => "/api/v1/user/menu",
    put: () => "/api/v1/user/menu",
    delete: (id: string) => `/api/v1/user/menu/${id}`,
  },
  order: {
    post: () => "/api/v1/user/order",
    put: () => "/api/v1/user/order",
    delete: (id: string) => `/api/v1/user/order/${id}`,
  },
  restaurant: {
    post: () => "/api/v1/user/restaurant",
    put: () => "/api/v1/user/restaurant",
    delete: (id: string) => `/api/v1/user/restaurant/${id}`,
  },
  table: {
    post: () => "/api/v1/user/table",
    postMultiple: () => "/api/v1/user/table/multiple",
    put: () => "/api/v1/user/table",
    delete: (id: string) => `/api/v1/user/table/${id}`,
  },
  product: {
    post: () => "/api/v1/user/product",
    put: () => "/api/v1/user/product",
    delete: (id: string) => `/api/v1/user/product/${id}`,
  },
  store: {
    post: () => "/api/v1/user/store",
    put: () => "/api/v1/user/store",
    delete: (id: string) => `/api/v1/user/store/${id}`,
  },
  sale: {
    post: () => "/api/v1/user/sale",
    put: () => "/api/v1/user/sale",
    delete: (id: string) => `/api/v1/user/sale/${id}`,
  },
  handler: {
    post: () => "/api/v1/user/handler",
    put: () => "/api/v1/user/handler",
    delete: (id: string) => `/api/v1/user/handler/${id}`,
  },
};

export default apiClient;
