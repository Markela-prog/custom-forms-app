"use client";
import { useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "../../context/authContext";

const UserManagement = () => {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [error, setError] = useState(null);
  const [loadingData, setLoadingData] = useState(true);

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
        setError(error.message);
      } finally {
        setLoadingData(false);
      }
    };

    fetchUsers();
  }, [loading, isAuthenticated, user, router]);

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) =>
      prev.has(userId)
        ? new Set([...prev].filter((id) => id !== userId))
        : new Set([...prev, userId])
    );
  };

  const handleAction = async (action) => {
    if (selectedUsers.size === 0) return;
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userIds: [...selectedUsers] }),
        }
      );

      if (!response.ok) throw new Error(`Failed to ${action} users`);

      setUsers((prev) =>
        action === "delete"
          ? prev.filter((u) => !selectedUsers.has(u.id))
          : prev.map((u) =>
              selectedUsers.has(u.id)
                ? { ...u, role: action === "promote" ? "ADMIN" : "USER" }
                : u
            )
      );
      setSelectedUsers(new Set());
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">User Management</h1>
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex gap-2 mb-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => handleAction("promote")}
        >
          Promote
        </button>
        <button
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          onClick={() => handleAction("demote")}
        >
          Demote
        </button>
        <button
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() => handleAction("delete")}
        >
          Delete
        </button>
      </div>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th></th>
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-gray-100">
              <td className="p-2 border text-center">
                <input
                  type="checkbox"
                  checked={selectedUsers.has(u.id)}
                  onChange={() => handleSelectUser(u.id)}
                />
              </td>
              <td className="p-2 border">{u.name}</td>
              <td className="p-2 border">{u.email}</td>
              <td className="p-2 border">{u.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;
