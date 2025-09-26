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
  baseURL: "http://localhost:3001/api/products",
});

export const paymentsApi = axios.create({
  ...commonConfig,
  baseURL: "http://localhost:3000/api/payments",
});
