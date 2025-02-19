"use client";
import { useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../context/authContext";

const AuthSuccess = () => {
  const router = useRouter();
  const { login } = useContext(AuthContext); // ✅ Use global login function

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      login(token); // ✅ Updates auth state immediately
      console.log("✅ OAuth Login Successful, Token Stored:", token);
      router.push("/");
    } else {
      console.error("❌ OAuth Login Failed: No Token Found");
      router.push("/login");
    }
  }, [router, login]);

  return <p className="text-center text-gray-700">Processing login...</p>;
};

export default AuthSuccess;
