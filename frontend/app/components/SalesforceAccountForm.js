import { useState } from "react";

const SalesforceAccountForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(
      "https://custom-forms-app-r0hw.onrender.com/api/salesforce/create-account",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, phone }),
      }
    );

    const data = await response.json();
    if (data.error) {
      alert("Error: " + data.error);
    } else {
      alert("Salesforce Account Created! Account ID: " + data.accountId);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="tel"
        placeholder="Phone (Optional)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <button type="submit">Create Salesforce Account</button>
    </form>
  );
};

export default SalesforceAccountForm;
