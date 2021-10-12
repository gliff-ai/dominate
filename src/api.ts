import axios, { AxiosRequestConfig, AxiosResponse, Method } from "axios";
import { API_URL } from "@/store";

function apiRequest<T>(
  path: string,
  method: Method,
  body: Record<string, unknown> = {},
  customApiUrl: string | null = null,
  config?: AxiosRequestConfig
): Promise<T> {
  return axios
    .request({
      method,
      headers: {
        "Content-Type": "application/json",
      },
      url: `${customApiUrl || API_URL}${path}`,
      data: body,
      ...config,
    })
    .then((response: AxiosResponse<T>) => response.data);
}

export { apiRequest };
