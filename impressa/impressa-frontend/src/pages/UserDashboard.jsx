import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axiosInstance";
import Header from "../components/Header";
import { getProvinces, getDistricts, getSectors, getCells } from "../utils/locationHelpers";
import { FaBox, FaMapMarkerAlt, FaUser, FaSignOutAlt } from "react-icons/fa";


function UserDashboard() {
  const [activeTab, setActiveTab] = useState("orders");
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Form states
  const [profileForm, setProfileForm] = useState({ name: "", email: "", password: "", profileImage: null });
  // Add detailed fields
  const [billingAddress, setBillingAddress] = useState({
    street: "", city: "", state: "", zip: "", country: "Rwanda", phone: "",
    province: "", district: "", sector: "", cell: ""
  });
  const [shippingAddress, setShippingAddress] = useState({
    street: "", city: "", state: "", zip: "", country: "Rwanda", phone: "",
    province: "", district: "", sector: "", cell: ""
  });

  // Location Options State
  const [locationOptions, setLocationOptions] = useState({
    billing: { districts: [], sectors: [], cells: [] },
    shipping: { districts: [], sectors: [], cells: [] }
  });

  const provinces = getProvinces(); // Static list

  const fetchData = useCallback(async () => {
    try {
      const [profileRes, ordersRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/orders/my-orders")
      ]);

      setUser(profileRes.data);
      setOrders(ordersRes.data.data || []);

      // Init forms
      setProfileForm({ name: profileRes.data.name, email: profileRes.data.email, password: "", profileImage: null });

      const billing = profileRes.data.billingAddress || {};
      const shipping = profileRes.data.shippingAddress || {};

      setBillingAddress(prev => ({ ...prev, ...billing }));
      setShippingAddress(prev => ({ ...prev, ...shipping }));

      // Pre-load options if data exists
      setLocationOptions({
        billing: {
          districts: billing.province ? getDistricts(billing.province) : [],
          sectors: billing.district ? getSectors(billing.district) : [],
          cells: billing.sector ? getCells(billing.sector) : []
        },
        shipping: {
          districts: shipping.province ? getDistricts(shipping.province) : [],
          sectors: shipping.district ? getSectors(shipping.district) : [],
          cells: shipping.sector ? getCells(shipping.sector) : []
        }
      });

      setLoading(false);
    } catch (error) {
      // If unauthorized, redirect to login
      if (error.response?.status === 401) navigate("/login");
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", profileForm.name);
      formData.append("email", profileForm.email);
      if (profileForm.password) formData.append("password", profileForm.password);
      if (profileForm.profileImage) formData.append("profileImage", profileForm.profileImage);

      // Sync legacy fields
      const finalBilling = {
        ...billingAddress,
        state: billingAddress.province,
        city: billingAddress.district
      };
      const finalShipping = {
        ...shippingAddress,
        state: shippingAddress.province,
        city: shippingAddress.district
      };

      formData.append("billingAddress", JSON.stringify(finalBilling));
      formData.append("shippingAddress", JSON.stringify(finalShipping));

      await api.put("/auth/me", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Profile updated successfully!");
      fetchData(); // refresh
    } catch (error) {
      alert("Failed to update profile.");
    }
  };

  // Helper handling change
  const handleAddressChange = (type, field, value) => {
    const isBilling = type === 'billing';
    const setAddress = isBilling ? setBillingAddress : setShippingAddress;
    const currentAddress = isBilling ? billingAddress : shippingAddress;

    const newAddress = { ...currentAddress, [field]: value };

    // Cascading logic
    if (field === 'province') {
      newAddress.district = "";
      newAddress.sector = "";
      newAddress.cell = "";
      // Update options
      setLocationOptions(prev => ({
        ...prev,
        [type]: {
          districts: getDistricts(value),
          sectors: [],
          cells: []
        }
      }));
    } else if (field === 'district') {
      newAddress.sector = "";
      newAddress.cell = "";
      setLocationOptions(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          sectors: getSectors(value),
          cells: []
        }
      }));
    } else if (field === 'sector') {
      newAddress.cell = "";
      setLocationOptions(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          cells: getCells(value)
        }
      }));
    }

    setAddress(newAddress);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-charcoal-900 transition-colors duration-300 font-sans">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white dark:bg-charcoal-800 rounded-lg shadow p-6 border border-gray-100 dark:border-charcoal-700">
              <div className="mb-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 text-blue-600 text-2xl font-bold overflow-hidden">
                  {user?.profileImage ? (
                    <img src={`${process.env.REACT_APP_API_URL?.replace(/\/api$/, '') || 'http://localhost:5000'}${user.profileImage}`} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <h2 className="font-bold text-gray-800 dark:text-white">{user?.name}</h2>
                <p className="text-sm text-gray-500 dark:text-charcoal-400">{user?.email}</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-all active:scale-[0.97] duration-150 ${activeTab === "orders" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-charcoal-700"}`}
                >
                  <FaBox /> Orders
                </button>
                <button
                  onClick={() => setActiveTab("addresses")}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-all active:scale-[0.97] duration-150 ${activeTab === "addresses" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-charcoal-700"}`}
                >
                  <FaMapMarkerAlt /> Addresses
                </button>
                <button
                  onClick={() => setActiveTab("account")}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-all active:scale-[0.97] duration-150 ${activeTab === "account" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-charcoal-700"}`}
                >
                  <FaUser /> Account Details
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-[0.97] duration-150 mt-4"
                >
                  <FaSignOutAlt /> Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === "orders" && (
              <div className="bg-white dark:bg-charcoal-800 rounded-lg shadow p-6 border border-gray-100 dark:border-charcoal-700">
                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">My Orders</h2>
                {orders.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No orders found.</p>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order.id} className="border dark:border-charcoal-700 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-charcoal-900/50">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white">Order #{order.publicId}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</p>
                          <div className="mt-2 space-y-2">
                            {order.items?.map((item, idx) => (
                              <div key={idx} className="flex flex-wrap items-center gap-2">
                                <span className="inline-block bg-white dark:bg-charcoal-700 border dark:border-charcoal-600 text-gray-700 dark:text-gray-200 text-xs px-2 py-1 rounded">
                                  {item.productName} x{item.quantity}
                                </span>
                                {item.product?.isDigital && item.product?.downloadLink && (
                                  <a
                                    href={item.product.downloadLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded hover:bg-blue-200"
                                  >
                                    <FaBox className="text-xs" /> Download
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-2
                            ${order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'}`}>
                            {order.status.toUpperCase()}
                          </span>
                          <p className="font-bold text-gray-900 dark:text-white">
                            {order.totals?.grandTotal?.toLocaleString()} Rwf
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="bg-white dark:bg-charcoal-800 rounded-lg shadow p-6 border border-gray-100 dark:border-charcoal-700">
                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Addresses</h2>
                <form onSubmit={updateProfile}>
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Billing Address */}
                    <div>
                      <h3 className="font-semibold text-gray-700 dark:text-charcoal-300 mb-4 border-b dark:border-charcoal-700 pb-2">Billing Address</h3>
                      <div className="space-y-3">
                        {/* Province */}
                        <select
                          className="w-full border dark:border-charcoal-600 p-2 rounded bg-white dark:bg-charcoal-700 text-gray-900 dark:text-white"
                          value={billingAddress.province}
                          onChange={e => handleAddressChange('billing', 'province', e.target.value)}
                        >
                          <option value="">Select Province</option>
                          {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        {/* District */}
                        <select
                          className="w-full border dark:border-charcoal-600 p-2 rounded bg-white dark:bg-charcoal-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-charcoal-900 disabled:text-gray-500"
                          value={billingAddress.district}
                          disabled={!billingAddress.province}
                          onChange={e => handleAddressChange('billing', 'district', e.target.value)}
                        >
                          <option value="">Select District</option>
                          {locationOptions.billing.districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        {/* Sector */}
                        <select
                          className="w-full border dark:border-charcoal-600 p-2 rounded bg-white dark:bg-charcoal-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-charcoal-900 disabled:text-gray-500"
                          value={billingAddress.sector}
                          disabled={!billingAddress.district}
                          onChange={e => handleAddressChange('billing', 'sector', e.target.value)}
                        >
                          <option value="">Select Sector</option>
                          {locationOptions.billing.sectors.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {/* Cell */}
                        <select
                          className="w-full border dark:border-charcoal-600 p-2 rounded bg-white dark:bg-charcoal-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-charcoal-900 disabled:text-gray-500"
                          value={billingAddress.cell}
                          disabled={!billingAddress.sector}
                          onChange={e => handleAddressChange('billing', 'cell', e.target.value)}
                        >
                          <option value="">Select Cell</option>
                          {locationOptions.billing.cells.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <input type="text" placeholder="Street Address / Village" className="w-full border dark:border-charcoal-600 p-2 rounded bg-white dark:bg-charcoal-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" value={billingAddress.street} onChange={e => setBillingAddress({ ...billingAddress, street: e.target.value })} />
                        <input type="text" placeholder="Country" className="w-full border dark:border-charcoal-600 p-2 rounded bg-gray-50 dark:bg-charcoal-900 text-gray-900 dark:text-white" value={billingAddress.country} readOnly />
                        <input type="text" placeholder="Phone" className="w-full border dark:border-charcoal-600 p-2 rounded bg-white dark:bg-charcoal-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" value={billingAddress.phone} onChange={e => setBillingAddress({ ...billingAddress, phone: e.target.value })} />
                      </div>
                    </div>

                    {/* Delivery Address */}
                    <div>
                      <h3 className="font-semibold text-gray-700 dark:text-charcoal-300 mb-4 border-b dark:border-charcoal-700 pb-2">Delivery Address</h3>
                      <div className="space-y-3">
                        {/* Province */}
                        <select
                          className="w-full border dark:border-charcoal-600 p-2 rounded bg-white dark:bg-charcoal-700 text-gray-900 dark:text-white"
                          value={shippingAddress.province}
                          onChange={e => handleAddressChange('shipping', 'province', e.target.value)}
                        >
                          <option value="">Select Province</option>
                          {provinces.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        {/* District */}
                        <select
                          className="w-full border dark:border-charcoal-600 p-2 rounded bg-white dark:bg-charcoal-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-charcoal-900 disabled:text-gray-500"
                          value={shippingAddress.district}
                          disabled={!shippingAddress.province}
                          onChange={e => handleAddressChange('shipping', 'district', e.target.value)}
                        >
                          <option value="">Select District</option>
                          {locationOptions.shipping.districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        {/* Sector */}
                        <select
                          className="w-full border dark:border-charcoal-600 p-2 rounded bg-white dark:bg-charcoal-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-charcoal-900 disabled:text-gray-500"
                          value={shippingAddress.sector}
                          disabled={!shippingAddress.district}
                          onChange={e => handleAddressChange('shipping', 'sector', e.target.value)}
                        >
                          <option value="">Select Sector</option>
                          {locationOptions.shipping.sectors.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {/* Cell */}
                        <select
                          className="w-full border dark:border-charcoal-600 p-2 rounded bg-white dark:bg-charcoal-700 text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-charcoal-900 disabled:text-gray-500"
                          value={shippingAddress.cell}
                          disabled={!shippingAddress.sector}
                          onChange={e => handleAddressChange('shipping', 'cell', e.target.value)}
                        >
                          <option value="">Select Cell</option>
                          {locationOptions.shipping.cells.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>

                        <input type="text" placeholder="Street Address / Village" className="w-full border dark:border-charcoal-600 p-2 rounded bg-white dark:bg-charcoal-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" value={shippingAddress.street} onChange={e => setShippingAddress({ ...shippingAddress, street: e.target.value })} />
                        <input type="text" placeholder="Country" className="w-full border dark:border-charcoal-600 p-2 rounded bg-gray-50 dark:bg-charcoal-900 text-gray-900 dark:text-white" value={shippingAddress.country} readOnly />
                        <input type="text" placeholder="Phone" className="w-full border dark:border-charcoal-600 p-2 rounded bg-white dark:bg-charcoal-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" value={shippingAddress.phone} onChange={e => setShippingAddress({ ...shippingAddress, phone: e.target.value })} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 text-right">
                    <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-all active:scale-95 duration-150">Save Addresses</button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === "account" && (
              <div className="bg-white dark:bg-charcoal-800 rounded-lg shadow p-6 border border-gray-100 dark:border-charcoal-700">
                <h2 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Account Details</h2>
                <form onSubmit={updateProfile} className="max-w-md">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-charcoal-300 mb-1">Display Name</label>
                      <input type="text" className="w-full border dark:border-charcoal-600 p-2 rounded bg-white dark:bg-charcoal-700 text-gray-900 dark:text-white" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-charcoal-300 mb-1">Email Address</label>
                      <input type="email" className="w-full border dark:border-charcoal-600 p-2 rounded bg-white dark:bg-charcoal-700 text-gray-900 dark:text-white" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-charcoal-300 mb-1">New Password (leave blank to keep current)</label>
                      <input type="password" className="w-full border dark:border-charcoal-600 p-2 rounded bg-white dark:bg-charcoal-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500" placeholder="New Password" value={profileForm.password} onChange={e => setProfileForm({ ...profileForm, password: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-charcoal-300 mb-1">Profile Picture</label>
                      <input type="file" className="w-full border dark:border-charcoal-600 p-2 rounded bg-white dark:bg-charcoal-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900/30 dark:file:text-blue-400 hover:file:bg-blue-100" accept="image/*" onChange={e => setProfileForm({ ...profileForm, profileImage: e.target.files[0] })} />
                    </div>
                    <div className="pt-4">
                      <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-all active:scale-95 duration-150">Save Changes</button>
                    </div>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
