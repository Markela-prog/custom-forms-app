"use client";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("accessToken"); // Remove token
    router.push("/login"); // Redirect to login
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <h1 className="text-xl">Custom Forms</h1>
      <nav>
        <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded hover:bg-red-600">
          Logout
        </button>
      </nav>
    </header>
  );
};

export default Header;
