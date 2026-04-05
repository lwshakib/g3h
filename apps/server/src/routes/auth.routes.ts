import { Router } from "express";
import { passportService } from "../services/passport.services.js";

const router: Router = Router();

// --- Google Authentication Routes ---
router.get(
  "/google",
  passportService.passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false, // We'll use JWTs or similar later, no sessions for now
  })
);

router.get(
  "/google/callback",
  passportService.passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    // Initial implementation: Just return the user profile
    res.json({
      success: true,
      message: "Google authentication successful",
      user: req.user,
    });
  }
);

// --- GitHub Authentication Routes ---
router.get(
  "/github",
  passportService.passport.authenticate("github", {
    scope: ["user:email"],
    session: false,
  })
);

router.get(
  "/github/callback",
  passportService.passport.authenticate("github", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    res.json({
      success: true,
      message: "GitHub authentication successful",
      user: req.user,
    });
  }
);

// --- Email Authentication Routes (Mock) ---
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt: ${email} with password: ${password}`);
  res.json({
    success: true,
    message: "Login successful",
    user: { email, name: "Axonix User" },
  });
});

router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  console.log(`Register attempt: ${name} (${email})`);
  res.json({
    success: true,
    message: "Registration successful",
    user: { name, email },
  });
});

export default router;
