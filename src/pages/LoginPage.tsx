import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlassCard from "@/components/GlassCard";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const LoginPage = () => {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = () => {
    if (!mobile || !password) { toast.error("Fill all fields"); return; }
    toast.success("Logged in successfully!");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary animate-float">
            <span className="text-2xl font-bold text-primary-foreground font-display">W</span>
          </div>
          <h1 className="font-display text-3xl font-bold gradient-text">Work From Home</h1>
          <p className="text-sm text-muted-foreground mt-1">Login to start earning</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Mobile Number</label>
              <Input type="tel" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91 9876543210" className="bg-muted/50 border-border/30" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="bg-muted/50 border-border/30 pr-10" />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button onClick={handleLogin} className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground">
              Login
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button onClick={() => navigate("/signup")} className="text-primary font-medium hover:underline">Sign Up</button>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
