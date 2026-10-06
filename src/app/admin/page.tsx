import type { Metadata } from "next";
import AdminGate from "./AdminGate";
import AdminDashboard from "./AdminDashboard";

export const metadata: Metadata = {
  title: "Admin: 6th Annual Arbor Day",
  description: "Hosts only.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <AdminGate>
      <AdminDashboard />
    </AdminGate>
  );
}
