import { useEffect, useMemo, useState } from "react";
import axios from "../utils/axiosInstance";
import { FaEdit, FaTrash, FaSearch, FaPlus, FaFileCsv, FaFilePdf, FaSort, FaSortUp, FaSortDown, FaUsers } from "react-icons/fa";
import EditUserModal from "./EditUserModal";

function UserTable({ onCreate }) {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const id = setTimeout(() => {
      const filteredUsers = users.filter((user) => {
        const q = search.trim().toLowerCase();
        const matchesSearch = q
          ? (user.name?.toLowerCase().includes(q) || user.email?.toLowerCase().includes(q))
          : true;
        const matchesRole = roleFilter ? user.role === roleFilter : true;
        return matchesSearch && matchesRole;
      });
      setFiltered(filteredUsers);
      setPage(1);
    }, 200);
    return () => clearTimeout(id);
  }, [search, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/auth/users");
      setUsers(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setMessage("error:Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = (updatedUser) => {
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setMessage("success:User updated successfully");
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await axios.delete(`/auth/users/${userId}`);
      setUsers(users.filter((u) => u.id !== userId));
      setMessage("success:User deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err);
      setMessage("error:Failed to delete user");
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await axios.get("/reports/generate?type=users&format=csv", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "users-report.csv");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("CSV export failed:", err);
    }
  };

  const handleExportPDF = async () => {
    try {
      const res = await axios.get("/reports/generate?type=users&format=pdf", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "users.pdf");
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error("PDF export failed:", err);
    }
  };

  const sorted = useMemo(() => {
    const s = [...filtered].sort((a, b) => {
      const av = (a[sortKey] || "").toString().toLowerCase();
      const bv = (b[sortKey] || "").toString().toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return s;
  }, [filtered, sortKey, sortDir]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sorted.slice(start, start + pageSize);
  }, [sorted, page, pageSize]);

  const setSort = (key) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
      seller: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
      customer: "bg-sage-100 text-sage-700 dark:bg-sage-900/20 dark:text-sage-400",
      cashier: "bg-terracotta-100 text-terracotta-700 dark:bg-terracotta-900/20 dark:text-terracotta-400",
      inventory: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400",
      delivery: "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
    };
    return badges[role] || "bg-charcoal-100 text-charcoal-600 dark:bg-charcoal-700 dark:text-charcoal-300";
  };

  const SortIcon = ({ column }) => {
    if (sortKey !== column) return <FaSort className="text-charcoal-300 dark:text-charcoal-600" />;
    return sortDir === "asc"
      ? <FaSortUp className="text-terracotta-500" />
      : <FaSortDown className="text-terracotta-500" />;
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="w-8 h-8 border-2 border-terracotta-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-charcoal-500 dark:text-charcoal-400">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-charcoal-800 dark:text-white">User List</h2>
          <span className="px-2.5 py-1 bg-charcoal-100 dark:bg-charcoal-700 text-charcoal-600 dark:text-charcoal-300 rounded-full text-xs font-semibold">
            {total} users
          </span>
        </div>
        <button
          onClick={onCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-terracotta-500 hover:bg-terracotta-600 text-white rounded-xl font-medium transition-all shadow-lg shadow-terracotta-500/20 active:scale-95"
        >
          <FaPlus className="text-sm" /> Create User
        </button>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-4 p-4 rounded-xl text-sm ${message.startsWith("success")
          ? "bg-sage-50 dark:bg-sage-900/20 border border-sage-200 dark:border-sage-800 text-sage-700 dark:text-sage-400"
          : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400"
          }`}>
          {message.split(":")[1]}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-cream-100 dark:bg-charcoal-700 border border-transparent focus:border-terracotta-500 rounded-xl text-charcoal-800 dark:text-white placeholder:text-charcoal-400 outline-none transition-colors"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 bg-cream-100 dark:bg-charcoal-700 border border-transparent focus:border-terracotta-500 rounded-xl text-charcoal-800 dark:text-white outline-none transition-colors min-w-[150px]"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="seller">Seller</option>
          <option value="cashier">Cashier</option>
          <option value="inventory">Inventory</option>
          <option value="delivery">Delivery</option>
          <option value="customer">Customer</option>
        </select>

        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-sage-500 hover:bg-sage-600 text-white rounded-xl font-medium transition-all text-sm"
          >
            <FaFileCsv /> CSV
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-medium transition-all text-sm"
          >
            <FaFilePdf /> PDF
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-cream-200 dark:border-charcoal-700">
        <table className="w-full">
          <thead className="bg-cream-50 dark:bg-charcoal-900">
            <tr>
              <th
                onClick={() => setSort("name")}
                className="px-6 py-4 text-left text-xs font-bold text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wider cursor-pointer hover:text-charcoal-700 dark:hover:text-charcoal-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  Name <SortIcon column="name" />
                </span>
              </th>
              <th
                onClick={() => setSort("email")}
                className="px-6 py-4 text-left text-xs font-bold text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wider cursor-pointer hover:text-charcoal-700 dark:hover:text-charcoal-200 transition-colors hidden md:table-cell"
              >
                <span className="flex items-center gap-2">
                  Email <SortIcon column="email" />
                </span>
              </th>
              <th
                onClick={() => setSort("role")}
                className="px-6 py-4 text-left text-xs font-bold text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wider cursor-pointer hover:text-charcoal-700 dark:hover:text-charcoal-200 transition-colors"
              >
                <span className="flex items-center gap-2">
                  Role <SortIcon column="role" />
                </span>
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-charcoal-500 dark:text-charcoal-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-100 dark:divide-charcoal-700 bg-white dark:bg-charcoal-800">
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <FaUsers className="text-4xl text-charcoal-300 dark:text-charcoal-600 mx-auto mb-3" />
                  <p className="text-charcoal-500 dark:text-charcoal-400">No users match your filters</p>
                </td>
              </tr>
            ) : (
              pageItems.map((user) => (
                <tr key={user.id} className="hover:bg-cream-50 dark:hover:bg-charcoal-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-charcoal-800 dark:text-white">{user.name}</div>
                    <div className="text-xs text-charcoal-500 dark:text-charcoal-400 md:hidden">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 text-charcoal-600 dark:text-charcoal-400 hidden md:table-cell">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getRoleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                        title="Edit"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t border-cream-200 dark:border-charcoal-700">
        <p className="text-sm text-charcoal-500 dark:text-charcoal-400">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${page === 1
              ? "bg-cream-100 dark:bg-charcoal-700 text-charcoal-400 cursor-not-allowed"
              : "bg-white dark:bg-charcoal-700 border border-cream-200 dark:border-charcoal-600 text-charcoal-700 dark:text-white hover:border-terracotta-500"
              }`}
          >
            Previous
          </button>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${page === totalPages
              ? "bg-cream-100 dark:bg-charcoal-700 text-charcoal-400 cursor-not-allowed"
              : "bg-terracotta-500 hover:bg-terracotta-600 text-white"
              }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}

export default UserTable;
