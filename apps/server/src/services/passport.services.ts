import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import {
  GITHUB_CALLBACK_URL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
} from "../envs.js";

/**
 * Passport service that initializes OAuth strategies for Google and GitHub.
 * Strict environment variables are used with no default fallbacks.
 */
export class PassportService {
  public passport = passport;

  constructor() {
    this.initializeStrategies();
  }

  initializeStrategies() {
    // Basic session serialization/deserialization for testing
    this.passport.serializeUser((user: any, next) => {
      next(null, user);
    });

    this.passport.deserializeUser((user: any, next) => {
      next(null, user);
    });

    // Google Strategy
    this.passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: GOOGLE_CALLBACK_URL,
        },
        async (_accessToken, _refreshToken, profile, next) => {
          try {
            // Passthrough for now, no database saving as requested
            return next(null, profile);
          } catch (error) {
            next(error);
          }
        }
      )
    );

    // GitHub Strategy
    this.passport.use(
      new GitHubStrategy(
        {
          clientID: GITHUB_CLIENT_ID,
          clientSecret: GITHUB_CLIENT_SECRET,
          callbackURL: GITHUB_CALLBACK_URL,
        },
        async (_accessToken: string, _refreshToken: string, profile: any, next: any) => {
          try {
            // Passthrough for now, no database saving as requested
            return next(null, profile);
          } catch (error) {
            next(error);
          }
        }
      )
    );
  }
}

export const passportService = new PassportService();
