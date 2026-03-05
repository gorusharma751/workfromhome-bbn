import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Wallet, CreditCard, Bitcoin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GlassCard from "@/components/GlassCard";
import { mockUser } from "@/data/mockData";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const WithdrawPage = () => {
  const navigate = useNavigate();
  const [method, setMethod] = useState<"upi" | "binance">("upi");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState(method === "upi" ? mockUser.upiId || "" : "");

  const handleSubmit = () => {
    if (!amount || parseFloat(amount) <= 0) { toast.error("Enter a valid amount"); return; }
    if (!address) { toast.error("Enter payment address"); return; }
    if (parseFloat(amount) > mockUser.walletBalance) { toast.error("Insufficient balance"); return; }
    toast.success("Withdrawal request submitted!");
    navigate("/profile");
  };

  return (
    <div className="min-h-screen pb-24 pt-4">
      <div className="mx-auto max-w-md px-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-lg bg-muted/50 p-2"><ArrowLeft className="h-5 w-5 text-foreground" /></button>
          <div>
            <h1 className="font-display text-xl font-bold gradient-text">Withdraw</h1>
            <p className="text-xs text-muted-foreground">Balance: ₹{mockUser.walletBalance}</p>
          </div>
        </motion.div>

        {/* Method selector */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-4 grid grid-cols-2 gap-3">
          {([
            { key: "upi" as const, icon: CreditCard, label: "UPI" },
            { key: "binance" as const, icon: Bitcoin, label: "Binance" },
          ]).map((m) => (
            <GlassCard
              key={m.key}
              className={`cursor-pointer text-center py-4 ${method === m.key ? "border-primary/50 glow" : ""}`}
              onClick={() => { setMethod(m.key); setAddress(""); }}
            >
              <m.icon className={`mx-auto h-6 w-6 mb-1 ${method === m.key ? "text-primary" : "text-muted-foreground"}`} />
              <p className={`text-sm font-medium ${method === m.key ? "text-foreground" : "text-muted-foreground"}`}>{m.label}</p>
            </GlassCard>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <GlassCard className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Amount (₹)</label>
              <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Enter amount" className="bg-muted/50 border-border/30" />
              <p className="mt-1 text-xs text-muted-foreground">Min: ₹100</p>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                {method === "upi" ? "UPI ID" : "Binance Wallet Address (USDT)"}
              </label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={method === "upi" ? "name@paytm" : "0x..."} className="bg-muted/50 border-border/30" />
            </div>
            <Button onClick={handleSubmit} className="w-full gradient-primary border-0 font-display font-semibold text-primary-foreground">
              <Wallet className="h-4 w-4" /> Submit Request
            </Button>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
};

export default WithdrawPage;
