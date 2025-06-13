export const endpoints = {
  auth: {
    serverTime: () => "/api/v1/user/auth/server-time",
    login: () => "/api/v1/user/auth/login",
    sessions: () => "/api/v1/user/auth/sessions",
    logout: () => "/api/v1/user/auth/logout",
    refreshToken: () => "/api/v1/user/auth/refresh-token",
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
    tip: () => "/api/v1/user/setting/tip",
    tax: () => "/api/v1/user/setting/tax",
    initialBasis: () => "/api/v1/user/setting/initial-basis",
    color: () => "/api/v1/user/setting/color",
    invoiceInformation: () => "/api/v1/user/setting/invoice-information",
    paymentMethods: {
      post: () => "/api/v1/user/setting/payment-methods",
      put: (id: string) => `/api/v1/user/setting/payment-methods/${id}`,
      delete: (id: string) => `/api/v1/user/setting/payment-methods/${id}`,
    },
  },
  collaborator: {
    post: () => "/api/v1/user/collaborator",
    put: (id: string) => `/api/v1/user/collaborator/${id}`,
    delete: (id: string) => `/api/v1/user/collaborator/${id}`,
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
  recipeGroup: {
    post: () => "/api/v1/user/recipe-group",
    put: (id: string) => `/api/v1/user/recipe-group/${id}`,
    delete: (id: string) => `/api/v1/user/recipe-group/${id}`,
  },
  recipe: {
    post: () => "/api/v1/user/recipe",
    put: (id: string) => `/api/v1/user/recipe/${id}`,
    delete: (id: string) => `/api/v1/user/recipe/${id}`,
  },
  stockGroup: {
    post: () => "/api/v1/user/stock-group",
    put: (id: string) => `/api/v1/user/stock-group/${id}`,
    delete: (id: string) => `/api/v1/user/stock-group/${id}`,
  },
  stock: {
    post: () => "/api/v1/user/stock",
    put: (id: string) => `/api/v1/user/stock/${id}`,
    delete: (id: string) => `/api/v1/user/stock/${id}`,
  },
  portionGroup: {
    post: () => "/api/v1/user/portion-group",
    put: (id: string) => `/api/v1/user/portion-group/${id}`,
    delete: (id: string) => `/api/v1/user/portion-group/${id}`,
  },
  portion: {
    postActivity: () => "/api/v1/user/portion/activity",
    post: () => "/api/v1/user/portion",
    put: (id: string) => `/api/v1/user/portion/${id}`,
    delete: (id: string) => `/api/v1/user/portion/${id}`,
  },
  movement: {
    post: () => "/api/v1/user/movement",
    put: (id: string) => `/api/v1/user/movement/${id}`,
    delete: (id: string) => `/api/v1/user/movement/${id}`,
    deleteMultiple: (stockID: string) => `/api/v1/user/movement/multiple/${stockID}`,
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
  economicGroup: {
    post: () => "/api/v1/user/economic-group",
    put: (id: string) => `/api/v1/user/economic-group/${id}`,
    delete: (id: string) => `/api/v1/user/economic-group/${id}`,
  },
};

export default endpoints;
