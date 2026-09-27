import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const navigate = useNavigate();

  const adminId = localStorage.getItem("adminId");

  const handleLogout = async () => {
    const token = localStorage.getItem("adminToken");

    try {
      if (token) {
        await fetch("http://localhost:5000/api/admin/logout", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } finally {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminId");

      navigate("/admin/login", {
        replace: true,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

          <p className="mt-2 text-gray-600">Welcome</p>
        </div>
      </div>
    </div>
  );
}
