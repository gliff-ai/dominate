import axios, { AxiosRequestConfig, AxiosResponse, Method } from "axios";
import { API_URL } from "@/etebase";

function apiRequest<T>(
  path: string,
  method: Method,
  body?: Record<string, unknown>,
  config?: AxiosRequestConfig,
  customApiUrl?: string
): Promise<T> {
  return axios
    .request({
      method,
      headers: {
        "Content-Type": "application/json",
      },
      url: `${customApiUrl || API_URL}${path}`,
      data: body || {},
      ...config,
    })
    .then((response: AxiosResponse<T>) => response.data);
}

export { apiRequest };
