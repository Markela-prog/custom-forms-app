"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const AuthSuccess = () => {
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      localStorage.setItem("accessToken", token);
      console.log("✅ OAuth Login Successful, Token Stored:", token);
      router.push("/profile");
    } else {
      console.error("❌ OAuth Login Failed: No Token Found");
      router.push("/login");
    }
  }, [router]);

  return <p className="text-center text-gray-700">Processing login...</p>;
};

export default AuthSuccess;
