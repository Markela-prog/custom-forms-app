"use client";
import { useEffect, useRef, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../context/authContext";

const AuthSuccess = () => {
  const router = useRouter();
  const { login } = useContext(AuthContext);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");

    if (token) {
      login(token);
      console.log("✅ OAuth Login Successful, Token Stored:", token);

      setTimeout(() => {
        router.push("/");
      }, 100);
    } else {
      console.error("❌ OAuth Login Failed: No Token Found");
      router.push("/login");
    }
  }, [router, login]);

  return <p className="text-center text-gray-700">Processing login...</p>;
};

export default AuthSuccess;
