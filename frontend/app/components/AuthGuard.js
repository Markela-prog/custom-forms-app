"use client";
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../context/authContext";

const AuthGuard = ({ children }) => {
  const { isAuthenticated, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/"); // Redirect if not authenticated
    }
  }, [isAuthenticated, loading, router]);

  if (loading || !isAuthenticated) {
    return <p className="text-center mt-4">Checking authentication...</p>; // Prevents flashing content
  }

  return <>{children}</>;
};

export default AuthGuard;
