import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlassCard from "@/components/GlassCard";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const SignupPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState(searchParams.get("ref") || "");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = () => {
    if (!name || !mobile || !password) { toast.error("Fill all required fields"); return; }
    toast.success("Account created successfully!");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary animate-float">
            <span className="text-2xl font-bold text-primary-foreground font-display">W</span>
          </div>
          <h1 className="font-display text-3xl font-bold gradient-text">Create Account</h1>
          <p className="text-sm text-muted-foreground mt-1">Join & start earning today</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Full Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="bg-muted/50 border-border/30" />
            </div>
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
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Referral Code (optional)</label>
              <Input value={referralCode} onChange={(e) => setReferralCode(e.target.value)} placeholder="Enter code" className="bg-muted/50 border-border/30" />
            </div>
            <Button onClick={handleSignup} className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground">
              Sign Up
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button onClick={() => navigate("/login")} className="text-primary font-medium hover:underline">Login</button>
            </p>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
