import { Router } from "express";
import { passportService } from "../services/auth.services.js";
import {
  forgotPassword,
  githubAuth,
  githubCallback,
  googleAuth,
  googleCallback,
  login,
  register,
  resetPassword,
  session,
  verifyEmail,
} from "../controllers/auth.controllers.js";

const router: Router = Router();

// --- Google Authentication Routes ---
router.get(
  "/google",
  googleAuth
);

router.get(
  "/google/callback",
  passportService.passport.authenticate("google", {
    failureRedirect: "/sign-in",
    session: false,
  }),
  googleCallback
);

// --- GitHub Authentication Routes ---
router.get(
  "/github",
  githubAuth
);

router.get(
  "/github/callback",
  passportService.passport.authenticate("github", {
    failureRedirect: "/sign-in",
    session: false,
  }),
  githubCallback
);

// --- Email Authentication Routes ---

/**
 * Handle Credentials-based Registration.
 * No session is created; user must verify email.
 */
router.post("/register", register);

/**
 * Handle Credentials-based Sign-In.
 * Creates a unique session in the DB.
 */
router.post("/login", login);

/**
 * Handle Email Verification Protocol Callback.
 */
router.get("/verify-email", verifyEmail);

/**
 * Recover the current session.
 * Accepts Authorization: Bearer <token> header.
 */
router.get("/session", session);

/**
 * Handle Forgot Password Request.
 * Generates a verification token and sends an email.
 */
router.post("/forgot-password", forgotPassword);

/**
 * Handle Reset Password Execution.
 * Validates token and updates the DB.
 */
router.post("/reset-password", resetPassword);

export default router;
