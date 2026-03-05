import { motion } from "framer-motion";
import { Users, ListTodo, Clock, DollarSign } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import { adminStats, mockSubmissions } from "@/data/mockData";
import StatusBadge from "@/components/StatusBadge";

const stats = [
  { label: "Total Users", value: adminStats.totalUsers.toLocaleString(), icon: Users, color: "text-primary" },
  { label: "Total Tasks", value: adminStats.totalTasks, icon: ListTodo, color: "text-secondary" },
  { label: "Pending", value: adminStats.pendingSubmissions, icon: Clock, color: "text-warning" },
  { label: "Paid Out", value: `₹${adminStats.totalEarningsPaid.toLocaleString()}`, icon: DollarSign, color: "text-success" },
];

const AdminDashboard = () => (
  <div className="mx-auto max-w-4xl">
    <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-2xl font-bold gradient-text mb-6">
      Dashboard
    </motion.h1>

    <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((s, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <GlassCard className="text-center py-5">
            <s.icon className={`mx-auto h-6 w-6 mb-2 ${s.color}`} />
            <p className="font-display text-xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </GlassCard>
        </motion.div>
      ))}
    </div>

    <GlassCard>
      <h3 className="font-display font-bold text-foreground mb-4">Recent Submissions</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/30">
              <th className="py-2 text-left text-xs text-muted-foreground font-medium">User</th>
              <th className="py-2 text-left text-xs text-muted-foreground font-medium">Task</th>
              <th className="py-2 text-left text-xs text-muted-foreground font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {mockSubmissions.slice(0, 5).map((s) => (
              <tr key={s.id} className="border-b border-border/10 last:border-0">
                <td className="py-3 text-foreground">{s.userName}</td>
                <td className="py-3 text-muted-foreground">{s.taskTitle}</td>
                <td className="py-3"><StatusBadge status={s.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  </div>
);

export default AdminDashboard;
