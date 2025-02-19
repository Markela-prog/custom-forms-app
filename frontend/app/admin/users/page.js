"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/app/context/authContext";
import UserTable from "@/app/components/userTable";

const UserManagement = () => {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated || user?.role !== "ADMIN") {
      router.push("/");
      return;
    }

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok) throw new Error("Failed to fetch users");

        setUsers(await response.json());
      } catch (error) {
        setStatusMessage(`❌ Error: ${error.message}`);
      }
    };

    fetchUsers();
  }, [loading, isAuthenticated, user, router]);

  const showStatusMessage = (message) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">User Management</h1>

      {/* Status Message */}
      {statusMessage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-md shadow-md">
          {statusMessage}
        </div>
      )}

      {/* User Table */}
      <UserTable users={users} setUsers={setUsers} />
    </div>
  );
};

export default UserManagement;
