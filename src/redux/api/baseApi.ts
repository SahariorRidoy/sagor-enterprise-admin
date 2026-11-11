import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "../store";

const baseURL = process.env.NEXT_PUBLIC_BASE_API;

const rawBaseQuery = fetchBaseQuery({
  baseUrl: baseURL,
  credentials: "include",
  timeout: 20000,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

function friendlyMessage(error: FetchBaseQueryError): string {
  if (error.status === "FETCH_ERROR")
    return "Unable to reach the server. Check your connection or try again later.";
  if (error.status === "TIMEOUT_ERROR")
    return "The server took too long to respond. Please try again.";
  if (error.status === "PARSING_ERROR") {
    // Server replied with non-JSON (usually an HTML error page)
    const code = error.originalStatus;
    if (code >= 500)
      return `Server error (${code}). The server may be down or restarting, please try again shortly.`;
    if (code === 404) return "Requested resource was not found (404).";
    return `The server returned an unexpected response (status ${code}).`;
  }
  if (error.status === "CUSTOM_ERROR") return error.error;

  const status = error.status as number;
  const backendMsg = (error.data as { message?: string } | undefined)?.message;
  if (backendMsg) return backendMsg;
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You don't have permission to do this.";
  if (status === 404) return "Requested resource was not found.";
  if (status === 429) return "Too many requests. Please slow down and try again.";
  if (status >= 500) return `Server error (${status}). Please try again later.`;
  return `Request failed (status ${status}).`;
}

// Normalizes every error so `err.data.message` is always a readable message.
const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> =
  async (args, api, extraOptions) => {
    const result = await rawBaseQuery(args, api, extraOptions);
    if (result.error) {
      const message = friendlyMessage(result.error);
      const data =
        result.error.data && typeof result.error.data === "object"
          ? { ...(result.error.data as object), message }
          : { message };
      result.error = { ...result.error, data } as FetchBaseQueryError;
    }
    return result;
  };

export const baseApi = createApi({
  reducerPath: "baseApi",
  baseQuery,
  endpoints: () => ({}),
  tagTypes: [],
});
