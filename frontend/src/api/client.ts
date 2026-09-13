const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export class ApiError extends Error {
  status: number;
  data?: unknown;
  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    let errorData: unknown;
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

    if (contentType.includes("application/json")) {
      try {
        errorData = await response.json();
        if (errorData && typeof errorData === "object" && "message" in errorData) {
          errorMessage = String((errorData as any).message);
        }
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
    } else {
      try {
        const text = await response.text();
        if (text) errorMessage = text;
      } catch {
        // ignore
      }
    }

    throw new ApiError(response.status, errorMessage, errorData);
  }

  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  if (contentType.includes("application/octet-stream") || contentType.includes("text/csv") || contentType.includes("spreadsheet") || contentType.includes("excel") || contentType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") || contentType.includes("text/plain")) {
    return response.blob() as Promise<T>;
  }

  return response.text() as Promise<T>;
}

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  return handleResponse<T>(response);
}