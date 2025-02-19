"use client";
import { useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthContext } from "../context/authContext";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout, loading } = useContext(AuthContext);

  if (pathname === "/login" || pathname === "/register" || pathname === "/reset-password") return null;
  if (loading) return null; // Prevents rendering before auth state is set

  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <h1 className="text-xl cursor-pointer" onClick={() => router.push("/")}>
        Custom Forms
      </h1>
      <nav className="flex gap-4">
        {isAuthenticated && user ? (
          <>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push("/profile")}
              className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
            >
              Profile
            </button>
            {user.role === "ADMIN" && (
              <button
                onClick={() => router.push("/admin/users")}
                className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600"
              >
                Users
              </button>
            )}
            <button
              onClick={logout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
          >
            Login
          </button>
        )}
      </nav>
    </header>
  );
};

export default Header;
