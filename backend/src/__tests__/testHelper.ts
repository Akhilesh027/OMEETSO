import http from "http";
import { app } from "../app";
import { AddressInfo } from "net";

export interface TestResponse<T = any> {
  status: number;
  headers: Headers;
  body: T;
}

export class TestClient {
  private server: http.Server | null = null;
  private baseUrl: string = "";

  async start(): Promise<string> {
    return new Promise((resolve) => {
      this.server = http.createServer(app);
      this.server.listen(0, "127.0.0.1", () => {
        const address = this.server!.address() as AddressInfo;
        this.baseUrl = `http://127.0.0.1:${address.port}`;
        resolve(this.baseUrl);
      });
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => resolve());
      } else {
        resolve();
      }
    });
  }

  async request<T = any>(
    path: string,
    options: {
      method?: string;
      headers?: Record<string, string>;
      body?: any;
    } = {}
  ): Promise<TestResponse<T>> {
    const url = `${this.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    const res = await fetch(url, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    let body: any = null;
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = await res.json();
    } else {
      body = await res.text();
    }

    return {
      status: res.status,
      headers: res.headers,
      body
    };
  }

  async get<T = any>(
    path: string,
    headersOrOptions?: Record<string, string> | { headers?: Record<string, string> }
  ) {
    const headers =
      headersOrOptions && "headers" in headersOrOptions
        ? headersOrOptions.headers
        : (headersOrOptions as Record<string, string>);
    return this.request<T>(path, { method: "GET", headers });
  }

  async post<T = any>(
    path: string,
    body?: any,
    headersOrOptions?: Record<string, string> | { headers?: Record<string, string> }
  ) {
    const headers =
      headersOrOptions && "headers" in headersOrOptions
        ? headersOrOptions.headers
        : (headersOrOptions as Record<string, string>);
    return this.request<T>(path, { method: "POST", body, headers });
  }
}

