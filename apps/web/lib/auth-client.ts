"use client";

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
 * AuthClient Service
 * 
 * Centralizes the authentication redirection and API logic for the Axonix ecosystem.
 */
class AuthClient {
  private readonly BASE_URL: string;

  public signIn = {
    /**
     * Redirect to social OAuth provider
     */
    social: async (options: { provider: "google" | "github"; callbackURL?: string }) => {
      const { provider } = options;
      window.location.href = `${this.BASE_URL}/${provider}`;
    },

    /**
     * Authenticate via Email
     */
    email: async (options: EmailSignInOptions, callbacks?: AuthOptions) => {
      callbacks?.onRequest?.();
      try {
        const response = await fetch(`${this.BASE_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(options),
        });

        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Email authentication failed");
        }

        callbacks?.onSuccess?.(data);
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
        const response = await fetch(`${this.BASE_URL}/register`, {
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

  constructor() {
    this.BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1/auth";
  }
}

export const authClient = new AuthClient();
