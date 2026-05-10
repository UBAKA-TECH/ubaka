import { useState } from "react";
import api from "../utils/axiosInstance";

function CreateUserForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "cashier",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await api.post("/auth/users", form);
      setMessage("✅ User created successfully");
      setForm({ name: "", email: "", password: "", role: "cashier" });
    } catch (err) {
      console.error("User creation failed:", err.response?.data || err.message);
      setMessage("❌ Failed to create user: " + (err.response?.data?.message || "Server error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md mb-6 max-w-lg">
      <h2 className="text-xl font-semibold mb-4">Create New User</h2>

      {message && (
        <div className={`mb-4 text-sm ${message.startsWith("✅") ? "text-green-600" : "text-red-600"}`}>
          {message}
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="create-user-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          id="create-user-name"
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="create-user-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          id="create-user-email"
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="create-user-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <input
          id="create-user-password"
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="create-user-role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
        <select
          id="create-user-role"
          name="role"
          value={form.role}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
        >
          <option value="cashier">Cashier</option>
          <option value="manager">Manager</option>
          <option value="inventory">Inventory</option>
          <option value="delivery">Delivery</option>
          <option value="user">User</option>
          <option value="guest">Guest</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 rounded text-white ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
      >
        {loading ? "Creating..." : "Create User"}
      </button>
    </form>
  );
}

export default CreateUserForm;
