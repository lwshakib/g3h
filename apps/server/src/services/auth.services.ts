import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import {
  GITHUB_CALLBACK_URL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  WEB_URL,
} from "../envs.js";
import { SendMailEnum } from "../constants.js";
import { sendEmail } from "./email.services.js";
import { postgresService } from "./postgres.services.js";

/**
 * Interface and structure for the centralized Auth service.
 * Handles the logic for registration, email verification, and password resets.
 */
export const auth = {
  // --- Social Provider Configuration ---
  socialProviders: {
    google: {
      enabled: true,
      clientId: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    github: {
      enabled: true,
      clientId: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: GITHUB_CALLBACK_URL,
    },
  },

  // --- Email Verification Configuration ---
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }: { user: any; url: string; token: string }) => {
      console.log(`[AuthService] Initiating VERIFY_EMAIL for ${user.email}`);
      await sendEmail(SendMailEnum.VERIFY_EMAIL, {
        to: user.email,
        url,
        token,
        user,
      });
    },
  },

  // --- Email and Password Configuration ---
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url, token }: { user: any; url: string; token: string }) => {
      console.log(`[AuthService] Initiating RESET_PASSWORD for ${user.email}`);
      await sendEmail(SendMailEnum.RESET_PASSWORD, {
        to: user.email,
        url,
        token,
        user,
      });
    },
    onPasswordReset: async ({ user }: { user: any }) => {
      console.log(`[AuthService] Password for user ${user.email} has been successfully reset.`);
    },
  },
};

/**
 * Passport Implementation linked to PostgreSQL via DbService.
 */
class PassportService {
  public passport = passport;

  constructor() {
    this.initializeStrategies();
  }

  private initializeStrategies() {
    this.passport.serializeUser((user: any, next) => next(null, user.id));
    this.passport.deserializeUser(async (id: string, next) => {
      try {
        const user = await postgresService.findUserById(id);
        next(null, user);
      } catch (err) {
        next(err);
      }
    });

    // Google Strategy
    if (auth.socialProviders.google.enabled) {
      this.passport.use(
        new GoogleStrategy(
          {
            clientID: auth.socialProviders.google.clientId,
            clientSecret: auth.socialProviders.google.clientSecret,
            callbackURL: auth.socialProviders.google.callbackURL,
          },
          async (_accessToken, _refreshToken, profile, next) => {
            try {
              const email = profile.emails?.[0]?.value;
              if (!email) throw new Error("Google profile missing email");

              let account = await postgresService.findAccount("google", profile.id);
              let user = null;
              let isNewSocialAccount = false;

              if (account) {
                user = await postgresService.findUserById(account.userId);
              } else {
                user = await postgresService.findUserByEmail(email);
                if (!user) {
                  user = await postgresService.createUser({
                    name: profile.displayName,
                    email,
                    image: profile.photos?.[0]?.value || null,
                  });
                }
                
                // Ensure email is verified for social accounts
                if (!user.emailVerified) {
                  await postgresService.verifyUserEmail(user.id);
                  user.emailVerified = true;
                }

                await postgresService.createAccount({
                  userId: user.id,
                  providerId: "google",
                  accountId: profile.id,
                  accessToken: _accessToken,
                  refreshToken: _refreshToken,
                });
                isNewSocialAccount = true;
              }

              return next(null, {
                ...user,
                isNewSocialAccount,
              });
            } catch (error) {
              next(error);
            }
          }
        )
      );
    }

    // GitHub Strategy
    if (auth.socialProviders.github.enabled) {
      this.passport.use(
        new GitHubStrategy(
          {
            clientID: auth.socialProviders.github.clientId,
            clientSecret: auth.socialProviders.github.clientSecret,
            callbackURL: auth.socialProviders.github.callbackURL,
          },
          async (_accessToken: string, _refreshToken: string, profile: any, next: any) => {
            try {
              const email = profile.emails?.[0]?.value;
              if (!email) throw new Error("GitHub profile missing email");

              let account = await postgresService.findAccount("github", profile.id);
              let user = null;
              let isNewSocialAccount = false;

              if (account) {
                user = await postgresService.findUserById(account.userId);
              } else {
                user = await postgresService.findUserByEmail(email);
                if (!user) {
                  user = await postgresService.createUser({
                    name: profile.displayName || profile.username,
                    email,
                    image: profile.photos?.[0]?.value || null,
                  });
                }

                // Ensure email is verified for social accounts
                if (!user.emailVerified) {
                  await postgresService.verifyUserEmail(user.id);
                  user.emailVerified = true;
                }

                await postgresService.createAccount({
                  userId: user.id,
                  providerId: "github",
                  accountId: profile.id,
                  accessToken: _accessToken,
                  refreshToken: _refreshToken,
                });
                isNewSocialAccount = true;
              }

              return next(null, {
                ...user,
                isNewSocialAccount,
              });
            } catch (error) {
              next(error);
            }
          }
        )
      );
    }

    // Local Strategy for Email/Password
    this.passport.use(
      new LocalStrategy(
        { usernameField: "email" },
        async (email: string, password, next: any) => {
          try {
            const user = await postgresService.findUserByEmail(email);
            if (!user) return next(null, false, { message: "Security Breach: Identity not found." });

            const account = await postgresService.findAccount("credentials", email);
            if (!account || !account.password) return next(null, false, { message: "Security Breach: Missing protocol credentials." });

            const isValid = await postgresService.validatePassword(password, account.password);
            if (!isValid) return next(null, false, { message: "Security Breach: Invalid secure protocol." });

            return next(null, user);
          } catch (error) {
            next(error);
          }
        }
      )
    );
  }
}

export const passportService = new PassportService();
export const authHandler = passportService.passport;
