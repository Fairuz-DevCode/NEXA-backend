import { Router, Request, Response, NextFunction } from "express";
import { generateSecret, generateURI, verifySync } from "otplib";
import QRCode from "qrcode";
import { OAuth2Client } from "google-auth-library";
import pool from "../../config/db.js";
import { verifyAccessToken } from "../../middleware/authMiddleware.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/token.js";
import { AppError } from "../../utils/appError.js";

const router = Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * 1. Setup 2FA: Menghasilkan Secret TOTP dan QR Code untuk Google Authenticator
 */
router.post("/2fa/setup", verifyAccessToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const userResult = await pool.query("SELECT email FROM users WHERE id = $1 LIMIT 1;", [userId]);
    if (userResult.rows.length === 0) {
      throw new AppError("User not found", 404);
    }

    const email = userResult.rows[0].email;
    const secret = generateSecret();
    const otpAuthUrl = generateURI({
      issuer: "Streetwear Store",
      label: email,
      secret,
    });
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);

    // Simpan secret sementara di database
    await pool.query("UPDATE users SET two_factor_secret = $1 WHERE id = $2;", [secret, userId]);

    return res.status(200).json({
      status: "success",
      message: "Scan this QR code with Google Authenticator or enter the manual key.",
      payload: {
        manualKey: secret,
        qrCode: qrCodeDataUrl,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 2. Verify & Enable 2FA: Memvalidasi token OTP pertama kali untuk mengaktifkan 2FA
 */
router.post("/2fa/verify", verifyAccessToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { token } = req.body;

    if (!token) {
      throw new AppError("2FA token is required", 400);
    }

    const userResult = await pool.query("SELECT two_factor_secret FROM users WHERE id = $1 LIMIT 1;", [userId]);
    const secret = userResult.rows[0]?.two_factor_secret;

    if (!secret) {
      throw new AppError("Please run /2fa/setup first", 400);
    }

    const result = verifySync({ token: String(token), secret });
    if (!result.valid) {
      throw new AppError("Invalid 2FA code. Please try again.", 400);
    }

    await pool.query("UPDATE users SET is_two_factor_enabled = true WHERE id = $1;", [userId]);

    return res.status(200).json({
      status: "success",
      message: "Two-factor authentication (2FA) has been successfully activated on your account.",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 3. Disable 2FA
 */
router.post("/2fa/disable", verifyAccessToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { token } = req.body;

    const userResult = await pool.query(
      "SELECT two_factor_secret, is_two_factor_enabled FROM users WHERE id = $1 LIMIT 1;",
      [userId]
    );
    const user = userResult.rows[0];

    if (!user || !user.is_two_factor_enabled) {
      throw new AppError("2FA is not enabled on this account", 400);
    }

    const result = verifySync({ token: String(token), secret: user.two_factor_secret });
    if (!result.valid) {
      throw new AppError("Invalid 2FA code", 400);
    }

    await pool.query(
      "UPDATE users SET is_two_factor_enabled = false, two_factor_secret = NULL WHERE id = $1;",
      [userId]
    );

    return res.status(200).json({
      status: "success",
      message: "2FA has been disabled.",
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 4. Google OAuth2 Single Sign-On (SSO):
 * Menerima Google ID Token dari Google Sign-In SDK di frontend, memverifikasi ke Google,
 * dan otomatis mendaftarkan / meloginkan user ke sistem Streetwear.
 */
router.post("/google", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken, accessToken: googleAccessToken } = req.body;
    if (!idToken && !googleAccessToken) {
      throw new AppError("Google token is required", 400);
    }

    let email: string = "";
    let googleId: string = "";
    let name: string = "Google User";

    if (idToken) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken,
          audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (payload && payload.email) {
          email = payload.email.toLowerCase();
          googleId = payload.sub;
          name = payload.name || "Google User";
        }
      } catch {
        // Fallback jika bukan idToken murni
      }
    }

    // Jika yang dikirim oleh useGoogleLogin adalah OAuth2 Access Token
    if (!email && (googleAccessToken || idToken)) {
      const tokenToFetch = googleAccessToken || idToken;
      try {
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenToFetch}` },
        });
        if (userInfoRes.ok) {
          const info = (await userInfoRes.json()) as any;
          email = info.email?.toLowerCase();
          googleId = info.sub;
          name = info.name || "Google User";
        }
      } catch (err: any) {
        console.warn("Failed to fetch Google userinfo:", err.message);
      }
    }

    if (!email) {
      throw new AppError("Could not retrieve profile from Google", 400);
    }

    // Cari user berdasarkan google_id atau email
    let userQuery = await pool.query("SELECT * FROM users WHERE google_id = $1 OR email = $2 LIMIT 1;", [
      googleId,
      email,
    ]);

    let user = userQuery.rows[0];

    if (!user) {
      // User baru: Daftarkan otomatis
      const insertResult = await pool.query(
        `INSERT INTO users (name, email, password, google_id, role, created_at)
         VALUES ($1, $2, $3, $4, 'user', NOW())
         RETURNING id, name, email, role, is_two_factor_enabled;`,
        [name, email, `google_auth_${Date.now()}`, googleId]
      );
      user = insertResult.rows[0];
    } else if (!user.google_id) {
      // Tautkan akun lama yang emailnya sama dengan google_id
      await pool.query("UPDATE users SET google_id = $1 WHERE id = $2;", [googleId, user.id]);
    }

    const accessToken = generateAccessToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, role: user.role });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      status: "success",
      message: "Successfully authenticated with Google",
      payload: {
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
