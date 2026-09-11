import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../../services/api.js";
import Spinner from "../../components/Spinner.jsx";
import Alert from "../../components/Alert.jsx";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data.data.users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggle = async (id) => {
    try {
      await api.put(`/admin/users/${id}/status`);
      fetchUsers();
    } catch (error) {
      setMessage({ type: "error", text: getErrorMessage(error) });
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Manage Users</h1>
      <Alert type={message.type || "info"} message={message.text} />

      <div className="overflow-x-auto card">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-gray-100">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3 capitalize">{u.role}</td>
                <td className="p-3">
                  <span className={u.isActive ? "text-green-600" : "text-red-500"}>
                    {u.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3">
                  {u.role !== "admin" && (
                    <button onClick={() => handleToggle(u._id)} className="text-primary-600 hover:underline">
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
