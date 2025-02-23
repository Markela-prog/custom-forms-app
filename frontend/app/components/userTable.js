"use client";
import { useState } from "react";
import {
  FaArrowUp,
  FaArrowDown,
  FaTrash,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";

const ActionButton = ({ onClick, icon, label, bgColor, hoverColor }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 ${bgColor} text-white py-2 px-4 rounded-md hover:${hoverColor} focus:outline-none focus:ring-2 focus:ring-offset-2`}
  >
    {icon} {label}
  </button>
);

export default function UserTable({ users, setUsers }) {
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [statusMessage, setStatusMessage] = useState(null);
  const [sortBy, setSortBy] = useState(null);

  const showStatusMessage = (message) => {
    setStatusMessage(message);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleSelectAll = (isChecked) => {
    const allUserIds = isChecked ? users.map((user) => user.id) : [];
    setSelectedUsers(new Set(allUserIds));
  };

  const handleSelectSingle = (userId) => {
    setSelectedUsers((prev) =>
      prev.has(userId)
        ? new Set([...prev].filter((id) => id !== userId))
        : new Set([...prev, userId])
    );
  };

  const handleAction = async (action) => {
    if (selectedUsers.size === 0) return;

    const userIds = [...selectedUsers];

    console.log("Sending userIds:", userIds);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/${action}`,
        {
          method: action === "delete" ? "DELETE" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userIds }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} users`);
      }

      setUsers((prev) =>
        action === "delete"
          ? prev.filter((u) => !selectedUsers.has(u.id))
          : prev.map((u) =>
              selectedUsers.has(u.id)
                ? { ...u, role: action === "promote" ? "ADMIN" : "USER" }
                : u
            )
      );
      showStatusMessage(
        `✅ Users successfully ${
          action === "promote"
            ? "promoted"
            : action === "demote"
            ? "demoted"
            : "deleted"
        }!`
      );
      setSelectedUsers(new Set());
    } catch (error) {
      console.error("Error:", error.message);
      showStatusMessage(`❌ Error: ${error.message}`);
    }
  };

  const handleSort = () => {
    setSortBy(sortBy === "asc" ? "desc" : "asc");
  };

  return (
    <div className="p-4 w-full max-w-4xl mx-auto">
      {statusMessage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-md shadow-md">
          {statusMessage}
        </div>
      )}

      {/* Page Title */}
      <h2 className="text-2xl font-bold mb-4 text-center md:text-left">
        User Management
      </h2>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
        <div className="flex flex-wrap gap-2">
          <ActionButton
            onClick={() => handleAction("promote")}
            icon={<FaArrowUp />}
            label="Promote"
            bgColor="bg-blue-500"
            hoverColor="bg-blue-600"
          />
          <ActionButton
            onClick={() => handleAction("demote")}
            icon={<FaArrowDown />}
            label="Demote"
            bgColor="bg-purple-500"
            hoverColor="bg-purple-600"
          />
          <ActionButton
            onClick={() => handleAction("delete")}
            icon={<FaTrash />}
            label="Delete"
            bgColor="bg-red-500"
            hoverColor="bg-red-600"
          />
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 text-sm">
          <thead>
            <tr className="bg-gray-200">
              <th className="p-2 border w-12 text-center">
                <input
                  type="checkbox"
                  onChange={(e) => handleSelectAll(e.target.checked)}
                />
              </th>
              <th className="p-2 border">
                <button
                  onClick={handleSort}
                  className="flex items-center gap-1"
                >
                  Username {sortBy === "asc" ? <FaSortUp /> : <FaSortDown />}
                </button>
              </th>
              <th className="p-2 border">Email</th>
              <th className="p-2 border">Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-400 dark:hover:bg-gray-700">
                <td className="p-2 border text-center">
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => handleSelectSingle(user.id)}
                  />
                </td>
                <td className="p-2 border">{user.username || "Anonymous"}</td>
                <td className="p-2 border">{user.email}</td>
                <td className="p-2 border text-center">{user.role}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
