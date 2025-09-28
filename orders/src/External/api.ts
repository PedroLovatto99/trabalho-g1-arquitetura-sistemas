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
  baseURL: process.env.PRODUCTS_API_URL || "http://localhost:3004/api/products",
});

export const paymentsApi = axios.create({
  ...commonConfig,
  baseURL: process.env.PAYMENTS_API_URL || "http://localhost:3006/api/payments",
});