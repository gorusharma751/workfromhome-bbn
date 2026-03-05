import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import GlassCard from "@/components/GlassCard";
import StatusBadge from "@/components/StatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, ShieldCheck, ShieldOff, Users } from "lucide-react";

const AdminUsers = () => {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["admin-all-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, user_id, name, email, created_at, wallet_balance, tasks_completed")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: adminRoles = [] } = useQuery({
    queryKey: ["admin-all-roles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .eq("role", "admin");
      if (error) throw error;
      return data || [];
    },
  });

  const adminUserIds = new Set(adminRoles.map((r) => r.user_id));

  const makeAdmin = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role: "admin" });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-roles"] });
      toast.success("User promoted to admin!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const removeAdmin = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", "admin");
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-all-roles"] });
      toast.success("Admin role removed!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const filtered = profiles.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-4xl">
      <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-display text-2xl font-bold gradient-text mb-6">
        <Users className="inline h-6 w-6 mr-2" />
        User Management
      </motion.h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-muted/50 border-border/30"
        />
      </div>

      <GlassCard>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/30">
                <th className="py-2 text-left text-xs text-muted-foreground font-medium">Name</th>
                <th className="py-2 text-left text-xs text-muted-foreground font-medium hidden sm:table-cell">Email</th>
                <th className="py-2 text-left text-xs text-muted-foreground font-medium">Role</th>
                <th className="py-2 text-right text-xs text-muted-foreground font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No users found</td></tr>
              ) : (
                filtered.map((p) => {
                  const isUserAdmin = adminUserIds.has(p.user_id);
                  return (
                    <tr key={p.id} className="border-b border-border/10 last:border-0">
                      <td className="py-3 text-foreground font-medium">{p.name}</td>
                      <td className="py-3 text-muted-foreground hidden sm:table-cell text-xs">{p.email}</td>
                      <td className="py-3">
                        <StatusBadge status={isUserAdmin ? "approved" : "pending"} />
                      </td>
                      <td className="py-3 text-right">
                        {isUserAdmin ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeAdmin.mutate(p.user_id)}
                            disabled={removeAdmin.isPending}
                            className="text-xs gap-1 border-destructive/30 text-destructive hover:bg-destructive/10"
                          >
                            <ShieldOff className="h-3 w-3" /> Remove
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => makeAdmin.mutate(p.user_id)}
                            disabled={makeAdmin.isPending}
                            className="text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10"
                          >
                            <ShieldCheck className="h-3 w-3" /> Make Admin
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default AdminUsers;
