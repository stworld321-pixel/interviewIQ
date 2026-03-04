import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { BsCurrencyRupee, BsGraphUpArrow, BsPeople, BsTrash } from "react-icons/bs";
import { ServerUrl } from "../App";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [earnings, setEarnings] = useState({ monthly: [], recentPayments: [] });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setMessage("");
      const [statsRes, usersRes, earningsRes] = await Promise.allSettled([
        axios.get(ServerUrl + "/api/admin/stats", { withCredentials: true }),
        axios.get(ServerUrl + "/api/admin/users", { withCredentials: true }),
        axios.get(ServerUrl + "/api/admin/earnings", { withCredentials: true }),
      ]);

      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
      if (usersRes.status === "fulfilled") setUsers(usersRes.value.data);
      if (earningsRes.status === "fulfilled") setEarnings(earningsRes.value.data);

      const failed = [statsRes, usersRes, earningsRes].find((r) => r.status === "rejected");
      if (failed) {
        setMessage(
          failed.reason?.response?.data?.message ||
            "Some admin data could not be loaded. Please refresh."
        );
      }
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to load admin dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter(
      (u) => u.name.toLowerCase().includes(keyword) || u.email.toLowerCase().includes(keyword)
    );
  }, [users, search]);

  const updateCredits = async (userId, credits) => {
    try {
      await axios.patch(
        ServerUrl + `/api/admin/users/${userId}`,
        { credits: Number(credits) },
        { withCredentials: true }
      );
      setMessage("User credits updated");
      loadData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to update credits");
    }
  };

  const updateRole = async (userId, role) => {
    try {
      await axios.patch(ServerUrl + `/api/admin/users/${userId}`, { role }, { withCredentials: true });
      setMessage("User role updated");
      loadData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to update role");
    }
  };

  const deleteUser = async (userId) => {
    try {
      await axios.delete(ServerUrl + `/api/admin/users/${userId}`, { withCredentials: true });
      setMessage("User deleted");
      loadData();
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-10 text-slate-600">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-slate-500 mt-1">User management, earnings and platform overview.</p>
          <div className="mt-3">
            <Link
              to="/admin/blogs"
              className="inline-flex items-center rounded-full bg-[#0B3C6D] text-white px-4 py-2 text-sm hover:bg-[#1E88E5] transition"
            >
              Open Blog Manager
            </Link>
          </div>
          {message && <p className="text-sm text-[#0B3C6D] mt-2">{message}</p>}
        </div>

        <section className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-slate-500"><BsPeople /> Total Users</div>
            <p className="text-2xl font-semibold mt-2">{stats?.totalUsers || 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-slate-500"><BsGraphUpArrow /> Interviews</div>
            <p className="text-2xl font-semibold mt-2">{stats?.totalInterviews || 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-slate-500"><BsCurrencyRupee /> Revenue</div>
            <p className="text-2xl font-semibold mt-2">{stats?.totalRevenue || 0}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <div className="flex items-center gap-2 text-slate-500"><BsCurrencyRupee /> Credits Sold</div>
            <p className="text-2xl font-semibold mt-2">{stats?.totalCreditsSold || 0}</p>
          </div>
        </section>

        <section className="grid lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="font-semibold text-lg mb-4">Monthly Earnings</h2>
            <div className="space-y-3">
              {earnings.monthly.length === 0 && <p className="text-sm text-slate-500">No earnings data yet.</p>}
              {earnings.monthly.map((m) => (
                <div key={m.label} className="flex items-center justify-between text-sm border border-slate-100 rounded-lg px-3 py-2">
                  <span>{m.label}</span>
                  <span className="font-medium">Rs {m.revenue}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <h2 className="font-semibold text-lg mb-4">Recent Payments</h2>
            <div className="space-y-3 max-h-[280px] overflow-y-auto">
              {earnings.recentPayments.length === 0 && <p className="text-sm text-slate-500">No payments found.</p>}
              {earnings.recentPayments.map((p) => (
                <div key={p._id} className="border border-slate-100 rounded-lg px-3 py-2 text-sm">
                  <p className="font-medium">{p.userId?.name || "Unknown user"}</p>
                  <p className="text-slate-500">{p.userId?.email}</p>
                  <p className="mt-1">Amount: Rs {p.amount} | Credits: {p.credits}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h2 className="font-semibold text-lg">User Management</h2>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name or email"
              className="w-full md:w-72 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Credits</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id} className="border-b border-slate-100">
                    <td className="py-2">{u.name}</td>
                    <td className="py-2">{u.email}</td>
                    <td className="py-2">
                      <select
                        value={u.role || "user"}
                        onChange={(e) => updateRole(u._id, e.target.value)}
                        className="border border-slate-300 rounded px-2 py-1"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="py-2">
                      <input
                        defaultValue={u.credits}
                        type="number"
                        min="0"
                        className="w-24 border border-slate-300 rounded px-2 py-1"
                        onBlur={(e) => updateCredits(u._id, e.target.value)}
                      />
                    </td>
                    <td className="py-2">
                      <button
                        onClick={() => deleteUser(u._id)}
                        className="text-red-500 hover:text-red-700 inline-flex items-center gap-1"
                      >
                        <BsTrash />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;

