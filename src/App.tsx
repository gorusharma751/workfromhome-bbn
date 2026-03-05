import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import TasksPage from "./pages/TasksPage";
import ReferEarnPage from "./pages/ReferEarnPage";
import ProfilePage from "./pages/ProfilePage";
import WithdrawPage from "./pages/WithdrawPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTasks from "./pages/admin/AdminTasks";
import AdminSubmissions from "./pages/admin/AdminSubmissions";
import AdminReferrals from "./pages/admin/AdminReferrals";
import AdminWithdrawals from "./pages/admin/AdminWithdrawals";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<TasksPage />} />
          <Route path="/refer" element={<ReferEarnPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/withdraw" element={<WithdrawPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="tasks" element={<AdminTasks />} />
            <Route path="submissions" element={<AdminSubmissions />} />
            <Route path="referrals" element={<AdminReferrals />} />
            <Route path="withdrawals" element={<AdminWithdrawals />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
        <BottomNav />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
