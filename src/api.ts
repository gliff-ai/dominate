import axios, { AxiosRequestConfig, AxiosResponse, Method } from "axios";
import { API_URL } from "@/etebase";

function apiRequest<T>(
  path: string,
  method: Method,
  body?: Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<T> {
  return axios
    .request({
      method,
      headers: {
        "Content-Type": "application/json",
      },
      url: `${API_URL}${path}`,
      data: body || {},
      ...config,
    })
    .then((response: AxiosResponse<T>) => response.data);
}

export { apiRequest };
