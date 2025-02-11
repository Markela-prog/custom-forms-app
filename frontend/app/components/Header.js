"use client";
import { usePathname, useRouter } from "next/navigation";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login" || pathname === "/register") return null;

  const handleLogout = () => {
    localStorage.removeItem("accessToken"); // Remove token
    router.push("/login"); // Redirect to login
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <h1
        className="text-xl cursor-pointer"
        onClick={() => router.push("/dashboard")}
      >
        Custom Forms
      </h1>
      <nav className="flex gap-4">
        <button
          onClick={() => router.push("/profile")}
          className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
        >
          Profile
        </button>
        <button
          onClick={handleLogout}
          className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </nav>
    </header>
  );
};

export default Header;
