import axios from "axios";

const commonConfig = {
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
};

export const productsApi = axios.create({
  ...commonConfig,
  baseURL: process.env.PRODUCTS_API_URL || "http://localhost:3000/api/products",
});

export const ordersApi = axios.create({
  ...commonConfig,
  baseURL: process.env.ORDER_API_URL ||  "http://localhost:3003/api/orders",
});

export const notificationAPI = axios.create({
  ...commonConfig,
  baseURL: process.env.NOTIFICATION_API_URL ||  "http://localhost:3007/api/notification",
});

export const usersApi = axios.create({
  ...commonConfig,
  baseURL: process.env.NOTIFICATION_API_URL ||  "http://localhost:3007/api/clients",
});