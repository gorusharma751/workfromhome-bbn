import { motion } from "framer-motion";
import { Users, ListTodo, Clock, DollarSign } from "lucide-react";
import GlassCard from "@/components/GlassCard";
import StatusBadge from "@/components/StatusBadge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [profiles, tasks, submissions, withdrawals] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("tasks").select("id", { count: "exact", head: true }),
        supabase.from("task_submissions").select("id", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("withdraw_requests").select("amount").eq("status", "paid"),
      ]);
      const totalPaid = (withdrawals.data || []).reduce((s, w) => s + Number(w.amount), 0);
      return {
        totalUsers: profiles.count || 0,
        totalTasks: tasks.count || 0,
        pendingSubmissions: submissions.count || 0,
        totalPaid,
      };
    },
  });

  const { data: recentSubmissions = [] } = useQuery({
    queryKey: ["admin-recent-submissions"],
    queryFn: async () => {
      const { data: subs } = await supabase
        .from("task_submissions")
        .select("*, tasks(title)")
        .order("submitted_at", { ascending: false })
        .limit(5);
      if (!subs || subs.length === 0) return [];
      // Fetch profile names for these user_ids
      const userIds = [...new Set(subs.map((s: any) => s.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name")
        .in("user_id", userIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p.name]));
      return subs.map((s: any) => ({ ...s, user_name: profileMap.get(s.user_id) || "Unknown" }));
    },
  });

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers?.toLocaleString() || "0", icon: Users, color: "text-primary" },
    { label: "Total Tasks", value: stats?.totalTasks || 0, icon: ListTodo, color: "text-secondary" },
    { label: "Pending", value: stats?.pendingSubmissions || 0, icon: Clock, color: "text-warning" },
    { label: "Paid Out", value: `₹${(stats?.totalPaid || 0).toLocaleString()}`, icon: DollarSign, color: "text-success" },
  ];

  return (
    <div className="mx-auto max-w-4xl">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-2xl font-bold gradient-text mb-6">Dashboard</motion.h1>

      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((s, i) => (
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
              {recentSubmissions.map((s: any) => (
                <tr key={s.id} className="border-b border-border/10 last:border-0">
                  <td className="py-3 text-foreground">{s.user_name || "Unknown"}</td>
                  <td className="py-3 text-muted-foreground">{s.tasks?.title || "Unknown"}</td>
                  <td className="py-3"><StatusBadge status={s.status} /></td>
                </tr>
              ))}
              {recentSubmissions.length === 0 && (
                <tr><td colSpan={3} className="py-6 text-center text-muted-foreground">No submissions yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default AdminDashboard;
