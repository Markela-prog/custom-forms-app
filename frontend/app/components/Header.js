"use client";
import { useContext, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthContext } from "../context/authContext";
import { Menu, X } from "lucide-react";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout, loading } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);

  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/reset-password"
  )
    return null;
  if (loading) return null;

  return (
    <header className="bg-gray-800 text-white p-4 sm:px-6 flex justify-between items-center relative">
      {/* Logo / Home Button */}
      <h1
        className="text-xl cursor-pointer font-bold"
        onClick={() => router.push("/")}
      >
        Custom Forms
      </h1>

      {/* Desktop Navigation */}
      <nav className="hidden sm:flex gap-4">
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

      {/* Mobile Menu Button */}
      <button
        className="sm:hidden block z-50 relative"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {menuOpen ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Navigation Menu */}
      {menuOpen && (
        <div className="absolute top-14 left-0 w-full bg-gray-900 p-4 flex flex-col space-y-3 sm:hidden z-50 shadow-lg">
          {isAuthenticated && user ? (
            <>
              <button
                onClick={() => {
                  router.push("/dashboard");
                  setMenuOpen(false);
                }}
                className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  router.push("/profile");
                  setMenuOpen(false);
                }}
                className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
              >
                Profile
              </button>
              {user.role === "ADMIN" && (
                <button
                  onClick={() => {
                    router.push("/admin/users");
                    setMenuOpen(false);
                  }}
                  className="bg-yellow-500 px-4 py-2 rounded hover:bg-yellow-600"
                >
                  Users
                </button>
              )}
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                router.push("/login");
                setMenuOpen(false);
              }}
              className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
            >
              Login
            </button>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
