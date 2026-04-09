import { NextFunction, Request, Response } from "express";
import { WEB_URL } from "../envs.js";
import { SendMailEnum } from "../constants.js";
import { sendEmail } from "../services/email.services.js";
import logger from "../logger/winston.logger.js";
import { auth, passportService } from "../services/auth.services.js";
import { postgresService } from "../services/postgres.services.js";

export const googleAuth = (req: Request, res: Response, next: NextFunction) => {
  const { callbackURL } = req.query;
  const state = callbackURL ? Buffer.from(callbackURL as string).toString("base64") : undefined;

  passportService.passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
    state,
  })(req, res, next);
};

export const googleCallback = async (req: any, res: Response) => {
  try {
    const user: any = req.user;
    const { state } = req.query;
    const session = await postgresService.createSession(user.id, req.headers["user-agent"], req.ip);
    const isNewSocialAccount = Boolean(user?.isNewSocialAccount);

    let callbackURL = `${WEB_URL}/workflows`;
    if (state) {
      try {
        callbackURL = Buffer.from(state as string, "base64").toString("utf-8");
      } catch (e) {
        logger.error("Error decoding callbackURL from state:", e);
      }
    }

    const redirectUrl = new URL(callbackURL);
    redirectUrl.searchParams.set("token", session.token);

    // Social login email notifications:
    // - always send sign-in alert
    // - send welcome email only when social account is newly created
    try {
      if (isNewSocialAccount) {
        await sendEmail(SendMailEnum.WELCOME_EMAIL, {
          to: user.email,
          user: {
            name: user.name || "there",
            email: user.email,
          },
          url: `${WEB_URL}/home/workflows`,
        });
      }

      await sendEmail(SendMailEnum.SIGN_IN_ALERT, {
        to: user.email,
        user: {
          name: user.name || "there",
          email: user.email,
        },
      });
    } catch (emailError) {
      logger.error("Failed to send social login email notifications:", emailError);
    }

    res.redirect(redirectUrl.toString());
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const githubAuth = (req: Request, res: Response, next: NextFunction) => {
  const { callbackURL } = req.query;
  const state = callbackURL ? Buffer.from(callbackURL as string).toString("base64") : undefined;

  passportService.passport.authenticate("github", {
    scope: ["user:email"],
    session: false,
    state,
  })(req, res, next);
};

export const githubCallback = async (req: any, res: Response) => {
  try {
    const user: any = req.user;
    const { state } = req.query;
    const session = await postgresService.createSession(user.id, req.headers["user-agent"], req.ip);
    const isNewSocialAccount = Boolean(user?.isNewSocialAccount);

    let callbackURL = `${WEB_URL}/workflows`;
    if (state) {
      try {
        callbackURL = Buffer.from(state as string, "base64").toString("utf-8");
      } catch (e) {
        logger.error("Error decoding callbackURL from state:", e);
      }
    }

    const redirectUrl = new URL(callbackURL);
    redirectUrl.searchParams.set("token", session.token);

    // Social login email notifications:
    // - always send sign-in alert
    // - send welcome email only when social account is newly created
    try {
      if (isNewSocialAccount) {
        await sendEmail(SendMailEnum.WELCOME_EMAIL, {
          to: user.email,
          user: {
            name: user.name || "there",
            email: user.email,
          },
          url: `${WEB_URL}/home/workflows`,
        });
      }

      await sendEmail(SendMailEnum.SIGN_IN_ALERT, {
        to: user.email,
        user: {
          name: user.name || "there",
          email: user.email,
        },
      });
    } catch (emailError) {
      logger.error("Failed to send social login email notifications:", emailError);
    }

    res.redirect(redirectUrl.toString());
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await postgresService.findUserByEmail(email);
    const existingAccount = await postgresService.findAccount("credentials", email);

    let user = existingUser;
    if (!user) {
      user = await postgresService.createUser({ name, email });
    }

    if (existingAccount) {
      return res.status(400).json({ success: false, message: "Security Breach: Identity already registered." });
    }

    await postgresService.createAccount({
      userId: user.id,
      providerId: "credentials",
      accountId: email,
      password,
    });

    const verification = await postgresService.createVerification(email);
    const verificationUrl = `${WEB_URL}/verify?token=${verification.value}`;

    await auth.emailVerification.sendVerificationEmail({
      user: { name, email },
      url: verificationUrl,
      token: verification.value,
    });

    // Best-effort welcome email; does not block account creation response.
    try {
      await sendEmail(SendMailEnum.WELCOME_EMAIL, {
        to: email,
        user: { name, email },
        url: `${WEB_URL}/home/workflows`,
      });
    } catch (emailError) {
      logger.error("Failed to send welcome email:", emailError);
    }

    res.json({
      success: true,
      message: "Init_Identity_Success | Verification Broadcasted",
      user: { name, email },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  passportService.passport.authenticate("local", async (err: any, user: any, info: any) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ success: false, message: info.message });

    try {
      if (auth.emailAndPassword.requireEmailVerification && !user.emailVerified) {
        return res.status(403).json({ success: false, message: "Security Access Denied: Protocol verification required." });
      }

      const session = await postgresService.createSession(user.id, req.headers["user-agent"], req.ip);

      res.json({
        success: true,
        message: "Init_Sequence_Success",
        user,
        sessionToken: session.token,
      });

      // Best-effort sign-in alert email; do not fail login if this errors.
      try {
        await sendEmail(SendMailEnum.SIGN_IN_ALERT, {
          to: user.email,
          user: {
            name: user.name || "there",
            email: user.email,
          },
        });
      } catch (emailError) {
        logger.error("Failed to send sign-in alert email:", emailError);
      }
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  })(req, res, next);
};

export const verifyEmail = async (req: Request, res: Response) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ success: false, message: "Invalid payload: Token mismatch." });

  try {
    const verification = await postgresService.findVerificationByToken(token as string);
    if (!verification) return res.status(400).json({ success: false, message: "Security Protocol Mismatch: Invalid or expired token." });

    const user = await postgresService.findUserByEmail(verification.identifier);
    if (user) {
      await postgresService.verifyUserEmail(user.id);
      await postgresService.deleteVerification(verification.id);
      res.redirect(`${WEB_URL}/sign-in?verified=true`);
    } else {
      res.status(404).json({ success: false, message: "Node Identity not found." });
    }
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const session = async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized: Missing session protocol." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const { rows } = await postgresService.pool.query(
      'SELECT s.*, u.email, u.name, u.image, u."emailVerified" FROM session s JOIN "user" u ON s."userId" = u.id WHERE s.token = $1 AND s."expiresAt" > CURRENT_TIMESTAMP',
      [token]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired session." });
    }

    const sessionData = rows[0];
    res.json({
      success: true,
      session: {
        id: sessionData.id,
        expiresAt: sessionData.expiresAt,
        token: sessionData.token,
        user: {
          id: sessionData.userId,
          email: sessionData.email,
          name: sessionData.name,
          image: sessionData.image,
          emailVerified: sessionData.emailVerified,
          role: sessionData.role,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  try {
    const user = await postgresService.findUserByEmail(email);
    if (user) {
      const verification = await postgresService.createVerification(email);
      const resetUrl = `${WEB_URL}/reset-password?token=${verification.value}`;

      await auth.emailAndPassword.sendResetPassword({
        user: { name: user.name, email },
        url: resetUrl,
        token: verification.value,
      });
    }

    res.json({
      success: true,
      message: "If the identity exists, reset instructions have been broadcasted.",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ success: false, message: "Invalid payload: Missing token or password." });
  }

  try {
    const verification = await postgresService.findVerificationByToken(token);
    if (!verification) {
      return res.status(400).json({ success: false, message: "Security Protocol Mismatch: Invalid or expired token." });
    }

    await postgresService.updateAccountPassword(verification.identifier, newPassword);
    await postgresService.deleteVerification(verification.id);

    const user = await postgresService.findUserByEmail(verification.identifier);
    if (user && auth.emailAndPassword.onPasswordReset) {
      await auth.emailAndPassword.onPasswordReset({ user });
    }

    res.json({
      success: true,
      message: "Identity Protocol Validated: Password Reset Successful.",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
