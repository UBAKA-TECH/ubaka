import { useState } from "react";
import axios from "../utils/axiosInstance";
import { FaTimes, FaSave } from "react-icons/fa";

function EditUserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({ name: user.name, email: user.email, role: user.role });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.put(`/auth/users/${user.id}`, form);
      onSave(res.data);
      onClose();
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-charcoal-800 rounded-2xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 dark:border-charcoal-700">
          <h3 className="text-lg font-bold text-charcoal-800 dark:text-white">Edit User</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-charcoal-400 hover:text-charcoal-600 hover:bg-cream-100 dark:hover:bg-charcoal-700 transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-cream-100 dark:bg-charcoal-700 border border-transparent focus:border-terracotta-500 rounded-xl text-charcoal-800 dark:text-white outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-cream-100 dark:bg-charcoal-700 border border-transparent focus:border-terracotta-500 rounded-xl text-charcoal-800 dark:text-white outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal-700 dark:text-charcoal-300 mb-1.5">
              Role
            </label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full px-4 py-2.5 bg-cream-100 dark:bg-charcoal-700 border border-transparent focus:border-terracotta-500 rounded-xl text-charcoal-800 dark:text-white outline-none transition-colors"
            >
              <option value="admin">Admin</option>
              <option value="seller">Seller</option>
              <option value="cashier">Cashier</option>
              <option value="inventory">Inventory</option>
              <option value="delivery">Delivery</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-charcoal-600 dark:text-charcoal-400 hover:bg-cream-100 dark:hover:bg-charcoal-700 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-terracotta-500 hover:bg-terracotta-600 disabled:opacity-50 text-white rounded-xl font-medium transition-all shadow-lg shadow-terracotta-500/20"
            >
              <FaSave /> {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditUserModal;
