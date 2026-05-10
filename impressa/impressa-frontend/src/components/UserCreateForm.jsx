import { useState } from "react";
import axios from "../utils/axiosInstance";
import { FaUserPlus } from "react-icons/fa";

function UserCreateForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "customer",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post("/admin/users", formData);
      onSuccess?.();
      setFormData({ name: "", email: "", password: "", role: "customer" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="user-name" className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">Full Name</label>
        <input
          id="user-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-4 py-2.5 bg-cream-100 dark:bg-charcoal-700 border border-transparent focus:border-terracotta-500 rounded-xl text-charcoal-800 dark:text-white outline-none transition-colors"
          placeholder="e.g. John Doe"
        />
      </div>

      <div>
        <label htmlFor="user-email" className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">Email Address</label>
        <input
          id="user-email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
          type="email"
          className="w-full px-4 py-2.5 bg-cream-100 dark:bg-charcoal-700 border border-transparent focus:border-terracotta-500 rounded-xl text-charcoal-800 dark:text-white outline-none transition-colors"
          placeholder="john@example.com"
        />
      </div>

      <div>
        <label htmlFor="user-password" className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">Password</label>
        <input
          id="user-password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          type="password"
          className="w-full px-4 py-2.5 bg-cream-100 dark:bg-charcoal-700 border border-transparent focus:border-terracotta-500 rounded-xl text-charcoal-800 dark:text-white outline-none transition-colors"
          placeholder="••••••••"
        />
      </div>

      <div>
        <label htmlFor="user-role" className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">User Role</label>
        <select
          id="user-role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-4 py-2.5 bg-cream-100 dark:bg-charcoal-700 border border-transparent focus:border-terracotta-500 rounded-xl text-charcoal-800 dark:text-white outline-none transition-colors"
        >
          {["customer", "cashier", "inventory", "delivery", "owner", "admin"].map(role => (
            <option key={role} value={role}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-xl">{error}</div>}

      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-charcoal-600 dark:text-charcoal-400 hover:bg-cream-100 dark:hover:bg-charcoal-700 rounded-xl font-medium transition-colors">Cancel</button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-50 text-white rounded-xl font-medium transition-all shadow-lg shadow-terracotta-500/20"
        >
          <FaUserPlus /> {loading ? "Creating..." : "Create User"}
        </button>
      </div>
    </form>
  );
}

export default UserCreateForm;
