"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

const StatusMessage = ({ message, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg flex items-center space-x-2 transition-transform duration-300 ${
        visible ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"
      }`}
    >
      <p>{message}</p>
      <X
        size={18}
        className="cursor-pointer hover:text-gray-200"
        onClick={() => setVisible(false)}
      />
    </div>
  );
};

export default StatusMessage;
