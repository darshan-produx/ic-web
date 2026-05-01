import axios, { AxiosRequestConfig } from "axios";
import { mockRouter } from "../mock/api/router";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";

export async function apiRequest(
  config: AxiosRequestConfig,
  options: {
    skipAuthHeader?: boolean;
    targetRegion?: string;
    dontShowLoader?: boolean;
    dontShowToaster?: boolean;
    ignoreErrorCodes?: string[];
  } = {}
) {
  if (USE_MOCK) {
    return mockRouter(
      String(config.url ?? ""),
      String(config.method ?? "GET"),
      config.data,
      config.params
    );
  }

  if (!options.skipAuthHeader) {
    const token = localStorage.getItem("access_token");
    if (!config.headers) {
      config.headers = {
        // "Accept-Language": localStorage?.getItem("i18nextLng") ?? "en",
      };
    }
    config.headers.Authorization = `Bearer ${token}`;
    if (!config.params) {
      config.params = {};
    }
    config.params.org_id = localStorage.getItem('org_id')
  }
  return axios.request(config);
}
