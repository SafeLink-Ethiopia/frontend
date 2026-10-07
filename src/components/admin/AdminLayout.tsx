import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-[#f7f5f6]">
      <AdminSidebar />

      <main className="min-w-0 flex-1 bg-[#f7f5f6]">
        <Outlet />
      </main>
    </div>
  );
}