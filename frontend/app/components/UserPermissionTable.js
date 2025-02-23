"use client";
import { useState, useEffect } from "react";
import { FaCheck, FaTimes, FaSort, FaSortUp, FaSortDown } from "react-icons/fa";

const ActionButton = ({ onClick, label, bgColor, hoverColor }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 ${bgColor} text-white py-2 px-4 rounded-md hover:${hoverColor} focus:outline-none focus:ring-2 focus:ring-offset-2`}
  >
    {label}
  </button>
);

export default function UserPermissionTable({ templateId }) {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [statusMessage, setStatusMessage] = useState(null);
  const [sortBy, setSortBy] = useState(null);
  const [filterByAccess, setFilterByAccess] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/template-access/non-admin-users`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to fetch users");
      const allUsers = await response.json();

      const accessResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/template-access/${templateId}/access`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!accessResponse.ok) throw new Error("Failed to fetch access data");
      const accessUsers = await accessResponse.json();
      const accessUserIds = new Set(accessUsers.map((u) => u.userId));

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

  const handleGrantAccess = async () => {
    if (selectedUsers.size === 0) return;

    try {
      const token = localStorage.getItem("accessToken");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/template-access/${templateId}/access`,
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
      showStatusMessage("✅ Access granted successfully!");
      setSelectedUsers(new Set());
    } catch (error) {
      console.error("Error granting access:", error.message);
      showStatusMessage("❌ Error granting access");
    }
  };

  const handleRemoveAccess = async () => {
    if (selectedUsers.size === 0) return;

    try {
      const token = localStorage.getItem("accessToken");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/template-access/${templateId}/access`,
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
      showStatusMessage("✅ Access removed successfully!");
      setSelectedUsers(new Set());
    } catch (error) {
      console.error("Error removing access:", error.message);
      showStatusMessage("❌ Error removing access");
    }
  };

  const handleSort = () => {
    setSortBy(sortBy === "asc" ? "desc" : "asc");
  };

  const filteredAndSortedUsers = users
    .filter((user) =>
      searchQuery
        ? (user.username?.toLowerCase() || "").includes(searchQuery) ||
          (user.email?.toLowerCase() || "").includes(searchQuery)
        : true
    )
    .filter((user) =>
      filterByAccess === "granted"
        ? user.hasAccess
        : filterByAccess === "notGranted"
        ? !user.hasAccess
        : true
    )
    .sort((a, b) => {
      const nameA = a.username ?? "";
      const nameB = b.username ?? "";

      return sortBy === "asc"
        ? nameA.localeCompare(nameB)
        : sortBy === "desc"
        ? nameB.localeCompare(nameA)
        : 0;
    });

  return (
    <div className="p-4 w-full max-w-4xl mx-auto">
      {statusMessage && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-md shadow-md">
          {statusMessage}
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <input
          type="text"
          placeholder="Search by username or email..."
          className="border p-2 w-full rounded-md bg-inputBg text-inputText border-borderColor"
          onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
        />

        <select
          className="border p-2 rounded-md"
          onChange={(e) => setFilterByAccess(e.target.value)}
        >
          <option value="all">All Users</option>
          <option value="granted">Access Granted</option>
          <option value="notGranted">No Access</option>
        </select>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
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
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-borderColor text-sm">
          <thead>
            <tr className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              <th className="p-2 border">
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
              <th className="p-2 border">Access</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-hoverBg">
                <td className="p-2 border text-center">
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.id)}
                    onChange={() => handleSelectSingle(user.id)}
                  />
                </td>
                <td className="p-2 border">{user.username || "Anonymous"}</td>
                <td className="p-2 border">{user.email}</td>
                <td className="p-2 border text-center">
                  {user.hasAccess ? (
                    <FaCheck className="text-green-500" />
                  ) : (
                    <FaTimes className="text-red-500" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
