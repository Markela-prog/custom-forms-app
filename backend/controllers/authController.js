import { handleError } from "../utils/errorHandler.js";
import {
  registerUser,
  loginUser,
  generateAccessToken,
  generateRefreshToken,
  forgotPassword,
  resetPassword,
  setPassword,
  logoutUser,
  refreshToken,
} from "../services/authService.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body.email, req.body.password);
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "Strict" });
    res.status(201).json({ user, accessToken });
  } catch (error) {
    handleError(res, error.message);
  }
};

export const login = async (req, res) => {
  try {
    const user = await loginUser(req.body.email, req.body.password);
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true, sameSite: "Strict" });
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

export const logout = (req, res) => {
  res.clearCookie("refreshToken", { httpOnly: true, secure: true, sameSite: "Strict" });
  res.status(200).json(logoutUser());
};

export const refreshAccessToken = async (req, res) => {
  try {
    const accessToken = await refreshToken(req.cookies.refreshToken);
    res.status(200).json({ accessToken });
  } catch (error) {
    handleError(res, error.message);
  }
};
