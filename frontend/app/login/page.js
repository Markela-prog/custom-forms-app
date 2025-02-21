"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { AiOutlineLoading3Quarters } from "react-icons/ai"; // Loading spinner icon

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

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
        window.dispatchEvent(new Event("storage"));
        router.push("/");
        router.refresh();
      } else {
        throw new Error("No access token received");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
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

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        window.dispatchEvent(new Event("storage"));
        router.push("/");
        router.refresh();
      } else {
        throw new Error("No access token received after registration");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

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
      if (!response.ok) throw new Error(data.message || "Failed to send reset email");

      setSuccess("Password reset email sent. Check your inbox.");
      setIsForgotPassword(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = (provider) => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/${provider}`;
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
          className="absolute inset-0 flex items-center justify-center text-white text-lg font-bold bg-black/40 rounded-md p-2"
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
              ? "Join our community with all-time access for free"
              : "Sign in to continue"}
          </p>

          {/* OAuth Buttons */}
          {!isForgotPassword && (
            <div className="mt-4 flex flex-col lg:flex-row items-center justify-between">
              <button
                className="w-full lg:w-1/2 flex justify-center items-center gap-2 bg-white text-sm text-gray-600 p-2 rounded-md hover:bg-gray-50 border border-gray-200"
                onClick={() => handleOAuthLogin("Google")}
              >
                <FaGoogle />
                Sign in with Google
              </button>
              <button
                className="w-full lg:w-1/2 ml-0 lg:ml-2 flex justify-center items-center gap-2 bg-white text-sm text-gray-600 p-2 rounded-md hover:bg-gray-50 border border-gray-200"
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
            <input
              type="email"
              placeholder="Email"
              className="p-2 w-full border rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {!isForgotPassword && (
              <input
                type="password"
                placeholder="Password"
                className="p-2 w-full border rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            )}

            {isRegistering && (
              <input
                type="password"
                placeholder="Confirm Password"
                className="p-2 w-full border rounded-md"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            )}

            <button
              type="submit"
              className="w-full flex justify-center items-center bg-black text-white p-2 rounded-md hover:bg-gray-800"
              disabled={isLoading}
            >
              {isLoading ? (
                <AiOutlineLoading3Quarters className="animate-spin" />
              ) : isRegistering ? (
                "Sign Up"
              ) : isForgotPassword ? (
                "Send Reset Email"
              ) : (
                "Login"
              )}
            </button>

            {isForgotPassword && (
              <button
                type="button"
                className="w-full bg-gray-200 text-black p-2 rounded-md hover:bg-gray-300"
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
                  onClick={() => {
                    setIsForgotPassword(true);
                    setIsRegistering(false);
                  }}
                >
                  Forgot Password?
                </p>

                <p className="mt-2">
                  {isRegistering ? (
                    <>
                      Already have an account?{" "}
                      <span className="cursor-pointer text-blue-500 hover:underline" onClick={() => setIsRegistering(false)}>
                        Login
                      </span>
                    </>
                  ) : (
                    <>
                      Don't have an account?{" "}
                      <span className="cursor-pointer text-blue-500 hover:underline" onClick={() => setIsRegistering(true)}>
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
