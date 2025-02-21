"use client";
import { useState, useEffect } from "react";
import { FaCheck, FaTimes } from "react-icons/fa";

const ActionButton = ({ onClick, label, bgColor, hoverColor }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 ${bgColor} text-white py-2 px-4 rounded-md hover:${hoverColor} focus:outline-none focus:ring-2 focus:ring-offset-2`}
  >
    {label}
  </button>
);

export default function UserPermissionTable({ templateId }) {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      // ✅ Fetch all non-admin users
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/non-admin`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch users");
      const allUsers = await response.json();

      // ✅ Fetch users with access
      const accessResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/templates/${templateId}/access`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!accessResponse.ok) throw new Error("Failed to fetch access data");
      const accessUsers = await accessResponse.json();
      const accessUserIds = new Set(accessUsers.map((u) => u.userId));

      // ✅ Combine data
      setUsers(
        allUsers.map((user) => ({
          ...user,
          hasAccess: accessUserIds.has(user.id),
        }))
      );
    } catch (error) {
      console.error("Error fetching users:", error.message);
    }
  };

  const handleSelectSingle = (userId) => {
    setSelectedUsers((prev) =>
      prev.has(userId)
        ? new Set([...prev].filter((id) => id !== userId))
        : new Set([...prev, userId])
    );
  };

  const handleGrantAccess = async () => {
    if (selectedUsers.size === 0) return;

    try {
      const token = localStorage.getItem("accessToken");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/templates/${templateId}/access`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userIds: [...selectedUsers] }),
        }
      );

      setUsers((prev) =>
        prev.map((user) =>
          selectedUsers.has(user.id) ? { ...user, hasAccess: true } : user
        )
      );
      setSelectedUsers(new Set());
    } catch (error) {
      console.error("Error granting access:", error.message);
    }
  };

  const handleRemoveAccess = async () => {
    if (selectedUsers.size === 0) return;

    try {
      const token = localStorage.getItem("accessToken");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/templates/${templateId}/access`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userIds: [...selectedUsers] }),
        }
      );

      setUsers((prev) =>
        prev.map((user) =>
          selectedUsers.has(user.id) ? { ...user, hasAccess: false } : user
        )
      );
      setSelectedUsers(new Set());
    } catch (error) {
      console.error("Error removing access:", error.message);
    }
  };

  return (
    <div>
      {statusMessage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-md shadow-md">
          {statusMessage}
        </div>
      )}

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search user..."
        className="border p-2 w-full mb-4"
        onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
      />

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <ActionButton
          onClick={handleGrantAccess}
          label="Grant Access"
          bgColor="bg-blue-500"
          hoverColor="bg-blue-600"
        />
        <ActionButton
          onClick={handleRemoveAccess}
          label="Remove Access"
          bgColor="bg-red-500"
          hoverColor="bg-red-600"
        />
      </div>

      {/* Users With Access Section */}
      <h2 className="text-lg font-semibold mt-4">✅ Users with Access</h2>
      <table className="w-full border-collapse border border-gray-300 mb-6">
        <tbody>
          {users
            .filter((user) => user.hasAccess)
            .map((user) => (
              <tr key={user.id} className="hover:bg-gray-100">
                <td className="p-2 border">{user.username || "Anonymous"}</td>
                <td className="p-2 border">{user.email}</td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Users Without Access Section */}
      <h2 className="text-lg font-semibold mt-4">❌ Users Without Access</h2>
      <table className="w-full border-collapse border border-gray-300">
        <tbody>
          {users
            .filter((user) => !user.hasAccess)
            .map((user) => (
              <tr key={user.id} className="hover:bg-gray-100">
                <td className="p-2 border">{user.username || "Anonymous"}</td>
                <td className="p-2 border">{user.email}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
