"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaGithub } from "react-icons/fa";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const router = useRouter();

  // 🔹 Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        window.dispatchEvent(new Event("storage")); // Ensure header updates
        router.push("/");
        router.refresh();
      } else {
        throw new Error("No access token received");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  // 🔹 Handle Register
  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");

      // ✅ Automatically log in user after registration
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        window.dispatchEvent(new Event("storage")); // Force header update
        router.push("/");
        router.refresh();
      } else {
        throw new Error("No access token received after registration");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleOAuthLogin = (provider) => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/${provider}`;
  };

  // 🔹 Handle Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to send reset email");

      setSuccess("Password reset email sent. Check your inbox.");
      setIsForgotPassword(false);
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left Pane - Illustration */}
      <div className="hidden lg:flex flex-1 relative">
        <img
          src="/bg.jpg"
          alt="Illustration"
          className="w-full h-full object-cover"
        />
        <a
          href="/"
          className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold bg-black/40  transition-all duration-300 rounded-md p-2"
        >
          Go to home page
        </a>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center">
        <div className="max-w-md w-full p-6">
          <h1 className="text-3xl font-semibold mb-6 text-black text-center">
            {isRegistering
              ? "Sign Up"
              : isForgotPassword
              ? "Forgot Password"
              : "Login"}
          </h1>
          <p className="text-sm font-semibold mb-6 text-gray-500 text-center">
            {isRegistering
              ? "Join to Our Community with all-time access and free"
              : "Sign in to continue"}
          </p>

          {/* OAuth Buttons */}
          {!isForgotPassword && (
            <div className="mt-4 flex flex-col lg:flex-row items-center justify-between">
              <button
                className="w-full lg:w-1/2 mb-2 lg:mb-0 flex justify-center items-center gap-2 bg-white text-sm text-gray-600 p-2 rounded-md hover:bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors duration-300"
                onClick={() => handleOAuthLogin("Google")}
              >
                <FaGoogle />
                Sign in with Google
              </button>
              <button
                className="w-full lg:w-1/2 ml-0 lg:ml-2 flex justify-center items-center gap-2 bg-white text-sm text-gray-600 p-2 rounded-md hover:bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors duration-300"
                onClick={() => handleOAuthLogin("Github")}
              >
                <FaGithub />
                Sign in with GitHub
              </button>
            </div>
          )}

          <div className="mt-4 text-sm text-gray-600 text-center">
            {!isForgotPassword && <p>or with email</p>}
          </div>

          {error && <p className="text-red-500 text-center">{error}</p>}
          {success && <p className="text-green-500 text-center">{success}</p>}

          {/* Forms */}
          <form
            onSubmit={
              isRegistering
                ? handleRegister
                : isForgotPassword
                ? handleForgotPassword
                : handleLogin
            }
            className="space-y-4"
          >
            {/* Email Input */}
            <div>
              <input
                type="email"
                placeholder="Email"
                className="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors duration-300"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Input */}
            {!isForgotPassword && (
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  className="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors duration-300"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Confirm Password (Register only) */}
            {isRegistering && (
              <div>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="mt-1 p-2 w-full border rounded-md focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 transition-colors duration-300"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-black text-white p-2 rounded-md hover:bg-gray-800 transition-colors duration-300"
            >
              {isRegistering
                ? "Sign Up"
                : isForgotPassword
                ? "Send Reset Email"
                : "Login"}
            </button>

            {isForgotPassword && (
              <button
                type="button"
                className="w-full bg-gray-200 text-black p-2 rounded-md hover:bg-gray-300 transition-colors duration-300"
                onClick={() => setIsForgotPassword(false)}
              >
                Back to Login
              </button>
            )}
          </form>

          {/* Links */}
          <div className="mt-4 text-center text-sm text-gray-600">
            {!isForgotPassword && (
              <>
                <p
                  className="cursor-pointer hover:text-blue-500 transition"
                  onClick={() => setIsForgotPassword(true)}
                >
                  Forgot Password?
                </p>

                <p className="mt-2">
                  {isRegistering ? (
                    <>
                      Already have an account?{" "}
                      <span
                        className="cursor-pointer text-blue-500 hover:underline"
                        onClick={() => setIsRegistering(false)}
                      >
                        Login
                      </span>
                    </>
                  ) : (
                    <>
                      Don't have an account?{" "}
                      <span
                        className="cursor-pointer text-blue-500 hover:underline"
                        onClick={() => setIsRegistering(true)}
                      >
                        Register
                      </span>
                    </>
                  )}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
