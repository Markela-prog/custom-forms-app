"use client";
import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../context/authContext";

const AuthGuard = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated || (adminOnly && user?.role !== "ADMIN")) {
        router.push("/");
      }
    }
  }, [isAuthenticated, user, loading, router, adminOnly]);

  if (loading || !isAuthenticated || (adminOnly && user?.role !== "ADMIN")) {
    return <p className="text-center mt-4">Checking authentication...</p>;
  }

  return <>{children}</>;
};

export default AuthGuard;