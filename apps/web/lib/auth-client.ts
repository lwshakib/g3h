"use client";

import { useEffect, useState } from "react";

interface AuthOptions {
  onRequest?: () => void;
  onSuccess?: (ctx: any) => void;
  onError?: (ctx: { error: { message: string } }) => void;
}

interface EmailSignInOptions {
  email: string;
  password?: string;
  callbackURL?: string;
}

interface EmailSignUpOptions extends EmailSignInOptions {
  name: string;
}

/**
 * Utility functions for Cookie Persistence
 */
const CookieStorage = {
  get: (name: string) => {
    if (typeof document === "undefined") return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(";").shift();
    return null;
  },
  set: (name: string, value: string, days = 30) => {
    if (typeof document === "undefined") return;
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `; expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value || ""}${expires}; path=/; SameSite=Lax`;
  },
  remove: (name: string) => {
    if (typeof document === "undefined") return;
    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
  }
};

/**
 * AuthClient Service
 * 
 * Centralizes the authentication redirection and API logic for the Axonix ecosystem.
 */
class AuthClient {
  private readonly API_URL: string;
  private readonly AUTH_URL: string;
  private readonly NEXT_PUBLIC_BASE_URL: string;

  public signIn = {
    /**
     * Redirect to social OAuth provider with callbackURL state.
     * Defaults to /home/workflows if no callbackURL is provided.
     */
    social: async (options: { provider: "google" | "github"; callbackURL?: string }) => {
      const { provider } = options;
      const callbackURL = options.callbackURL || `${this.NEXT_PUBLIC_BASE_URL}/home/workflows`;
      
      const url = new URL(`${this.AUTH_URL}/${provider}`);
      url.searchParams.set("callbackURL", callbackURL);
      
      window.location.href = url.toString();
    },

    /**
     * Authenticate via Email.
     * Redirects to the callbackURL or /home/workflows after success.
     */
    email: async (options: EmailSignInOptions, callbacks?: AuthOptions) => {
      callbacks?.onRequest?.();
      try {
        const response = await fetch(`${this.AUTH_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(options),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Email authentication failed");
        }

        // Persist session token in cookie if provided
        if (data.sessionToken) {
          CookieStorage.set("axonix_session_token", data.sessionToken);
        }

        callbacks?.onSuccess?.(data);

        // Dynamic Redirection (Defaults to /home/workflows)
        const redirectPath = options.callbackURL || `${this.NEXT_PUBLIC_BASE_URL}/home/workflows`;
        window.location.href = redirectPath;
      } catch (error: any) {
        callbacks?.onError?.({ error: { message: error.message } });
      }
    }
  };

  public signUp = {
    /**
     * Register via Email
     */
    email: async (options: EmailSignUpOptions, callbacks?: AuthOptions) => {
      callbacks?.onRequest?.();
      try {
        const response = await fetch(`${this.AUTH_URL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(options),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Registration failed");
        }

        callbacks?.onSuccess?.(data);
      } catch (error: any) {
        callbacks?.onError?.({ error: { message: error.message } });
      }
    }
  };

  /**
   * Custom React Hook to retrieve the current session.
   */
  public useSession() {
    const [data, setData] = useState<any>(null);
    const [isPending, setIsPending] = useState(true);

    useEffect(() => {
      const fetchSession = async () => {
        const token = CookieStorage.get("axonix_session_token");
        if (!token) {
          setData(null);
          setIsPending(false);
          return;
        }

        try {
          const response = await fetch(`${this.AUTH_URL}/session`, {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const data = await response.json();
            setData(data.session);
          } else {
            setData(null);
            CookieStorage.remove("axonix_session_token");
          }
        } catch (error) {
          console.error("[AuthClient] useSession synchronization failed:", error);
          setData(null);
        } finally {
          setIsPending(false);
        }
      };

      fetchSession();
    }, []);

    return { data, isPending };
  }

  /**
   * Request a password reset email.
   */
  public async forgetPassword(options: { email: string; callbackURL?: string }, callbacks?: AuthOptions) {
    callbacks?.onRequest?.();
    try {
      const response = await fetch(`${this.AUTH_URL}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Password reset request failed");
      }

      callbacks?.onSuccess?.(data);
    } catch (error: any) {
      callbacks?.onError?.({ error: { message: error.message } });
    }
  }

  /**
   * Reset the password using a verification token.
   */
  public async resetPassword(options: { newPassword: string; token: string }, callbacks?: AuthOptions) {
    callbacks?.onRequest?.();
    try {
      const response = await fetch(`${this.AUTH_URL}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(options),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Password reset failed");
      }

      callbacks?.onSuccess?.(data);
    } catch (error: any) {
      callbacks?.onError?.({ error: { message: error.message } });
    }
  }

  /**
   * Sign out and clear session cookie.
   */
  public async signOut() {
    CookieStorage.remove("axonix_session_token");
    window.location.href = "/sign-in";
  }

  constructor() {
    const apiURL = process.env.NEXT_PUBLIC_API_URL;
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL;

    if (!apiURL || !baseURL) {
      throw new Error(
        "[AuthClient] Critical system configuration missing: NEXT_PUBLIC_API_URL or NEXT_PUBLIC_BASE_URL. Please check your .env file."
      );
    }

    const normalizedApiUrl = apiURL.replace(/\/+$/, "");
    const normalizedAuthUrl = normalizedApiUrl.endsWith("/auth")
      ? normalizedApiUrl
      : `${normalizedApiUrl}/auth`;

    this.API_URL = normalizedApiUrl;
    this.AUTH_URL = normalizedAuthUrl;
    this.NEXT_PUBLIC_BASE_URL = baseURL;
  }
}

export const authClient = new AuthClient();
