import { handleError } from "../utils/errorHandler.js";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  setPassword,
  logoutUser,
  refreshToken as refreshTokenService,
  handleOAuthLogin,
} from "../services/userService.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../services/tokenService.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body.email, req.body.password);
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    res.status(201).json({ user, accessToken });
  } catch (error) {
    handleError(res, error.message);
  }
};

export const login = async (req, res) => {
  try {
    const { user, accessToken, refreshToken } = await loginUser(
      req.body.email,
      req.body.password
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });
    res.status(200).json({ user, accessToken });
  } catch (error) {
    handleError(res, error.message);
  }
};

export const forgotPasswordController = async (req, res) => {
  try {
    await forgotPassword(req.body.email);
    res.status(200).json({ message: "Password reset email sent." });
  } catch (error) {
    handleError(res, error.message);
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    await resetPassword(req.body.token, req.body.newPassword);
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    handleError(res, error.message);
  }
};

export const setPasswordController = async (req, res) => {
  try {
    await setPassword(req.user.id, req.body.password);
    res.status(200).json({ message: "Password set successfully" });
  } catch (error) {
    handleError(res, error.message);
  }
};

export const logout = async (req, res) => {
  await logoutUser();
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });
  res.status(200).json({ message: "Logged out successfully" });
};

export const refreshToken = async (req, res) => {
  try {
    const newAccessToken = await refreshTokenService(req.cookies.refreshToken);
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    if (error.message === "Invalid or expired refresh token.") {
      return res.status(403).json({ message: error.message });
    }
    handleError(res, error.message);
  }
};

export const oauthCallback = async (req, res) => {
  try {
    console.log("OAuth Callback User:", req.user);

    if (!req.user || !req.user.email) {
      console.error("OAuth Error: User or email is undefined", req.user);
      return res.status(400).json({ message: "Authentication failed" });
    }

    const authProvider =
      req.user.authProvider?.length > 0 ? req.user.authProvider[0] : "GITHUB";

    const { user, accessToken, refreshToken } = await handleOAuthLogin(
      req.user.email,
      authProvider
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    return res.status(200).json({
      message: "OAuth login successful",
      user,
      accessToken,
      refreshToken,
    });

    // res.redirect(
    //   `${process.env.FRONTEND_URL}/auth-success?token=${accessToken}`
    // );
  } catch (error) {
    console.error("OAuth Callback Error:", error);
    res.status(500).json({ message: error.message });
  }
};
