"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

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
      console.log("Login Response Data:", data); // Debugging

      if (!response.ok) throw new Error(data.message || "Login failed");

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        console.log("Stored Token:", localStorage.getItem("accessToken"));

        // Delay redirect to ensure token is stored
        setTimeout(() => {
          router.push("/profile");
        }, 100);
      } else {
        throw new Error("No access token received");
      }
    } catch (error) {
      console.error("Login Error:", error.message);
      setError(error.message);
    }
  };

  // 🔹 Handle OAuth Login Redirects
  const handleOAuthLogin = (provider) => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/${provider}`;
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold text-center mb-4">Login</h2>
      {error && <p className="text-red-500 text-center">{error}</p>}

      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          className="p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Login
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">Or login with:</p>
        <div className="flex justify-center gap-4 mt-2">
          <button
            onClick={() => handleOAuthLogin("google")}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Login with Google
          </button>
          <button
            onClick={() => handleOAuthLogin("github")}
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
          >
            Login with GitHub
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
