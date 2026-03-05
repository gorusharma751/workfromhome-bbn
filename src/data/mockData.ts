export interface Task {
  id: string;
  title: string;
  description: string;
  reviewText: string;
  taskLink: string;
  reward: number;
  points: number;
  slotsTotal: number;
  slotsRemaining: number;
  status: "active" | "paused" | "completed";
  startDate: string;
  endDate: string;
  category: string;
}

export interface TaskSubmission {
  id: string;
  userId: string;
  userName: string;
  taskId: string;
  taskTitle: string;
  screenshotUrl: string;
  comment: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  mobile: string;
  email: string;
  referralCode: string;
  walletBalance: number;
  pointsBalance: number;
  referralEarnings: number;
  totalEarnings: number;
  tasksCompleted: number;
  upiId?: string;
  binanceAddress?: string;
}

export interface Referral {
  id: string;
  name: string;
  level: 1 | 2 | 3;
  earnings: number;
  joinedAt: string;
  isActive: boolean;
}

export interface WithdrawRequest {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  method: "upi" | "binance";
  address: string;
  status: "pending" | "approved" | "rejected" | "paid";
  requestedAt: string;
}

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Google Review Task",
    description: "Write a 5-star review for our partner business on Google Maps.",
    reviewText: "Amazing experience! The service was outstanding and the staff was incredibly helpful. Highly recommend to everyone looking for quality service. Will definitely come back again!",
    taskLink: "https://maps.google.com",
    reward: 20,
    points: 200,
    slotsTotal: 100,
    slotsRemaining: 45,
    status: "active",
    startDate: "2026-03-01",
    endDate: "2026-03-31",
    category: "Google Review",
  },
  {
    id: "2",
    title: "App Rating Task",
    description: "Rate our partner app 5 stars on the Play Store with a short review.",
    reviewText: "Great app with amazing features! Very user friendly and works perfectly. Love the design and smooth performance. Must try!",
    taskLink: "https://play.google.com",
    reward: 15,
    points: 150,
    slotsTotal: 200,
    slotsRemaining: 120,
    status: "active",
    startDate: "2026-03-01",
    endDate: "2026-04-15",
    category: "App Rating",
  },
  {
    id: "3",
    title: "YouTube Comment Task",
    description: "Leave a positive comment on our partner's YouTube video.",
    reviewText: "Incredible video! Very informative and well-produced. Learned so much from this. Subscribed and looking forward to more content like this!",
    taskLink: "https://youtube.com",
    reward: 10,
    points: 100,
    slotsTotal: 150,
    slotsRemaining: 80,
    status: "active",
    startDate: "2026-03-05",
    endDate: "2026-03-25",
    category: "YouTube Comment",
  },
  {
    id: "4",
    title: "Trustpilot Review",
    description: "Write a detailed review on Trustpilot for our partner company.",
    reviewText: "Excellent company with top-notch customer service. They went above and beyond to help me. The product quality is superb. I've already recommended them to my friends!",
    taskLink: "https://trustpilot.com",
    reward: 25,
    points: 250,
    slotsTotal: 50,
    slotsRemaining: 12,
    status: "active",
    startDate: "2026-03-01",
    endDate: "2026-03-20",
    category: "Trustpilot Review",
  },
  {
    id: "5",
    title: "Instagram Follow & Comment",
    description: "Follow and leave a genuine comment on a partner's Instagram post.",
    reviewText: "Love this post! Your content is always so inspiring 🔥 Keep up the amazing work!",
    taskLink: "https://instagram.com",
    reward: 12,
    points: 120,
    slotsTotal: 300,
    slotsRemaining: 210,
    status: "active",
    startDate: "2026-03-02",
    endDate: "2026-04-01",
    category: "Social Media",
  },
];

export const mockSubmissions: TaskSubmission[] = [
  { id: "s1", userId: "u1", userName: "Rahul Sharma", taskId: "1", taskTitle: "Google Review Task", screenshotUrl: "/placeholder.svg", comment: "Done!", status: "pending", submittedAt: "2026-03-05T10:30:00" },
  { id: "s2", userId: "u2", userName: "Priya Patel", taskId: "2", taskTitle: "App Rating Task", screenshotUrl: "/placeholder.svg", comment: "Completed the rating", status: "approved", submittedAt: "2026-03-04T14:20:00" },
  { id: "s3", userId: "u3", userName: "Amit Kumar", taskId: "1", taskTitle: "Google Review Task", screenshotUrl: "/placeholder.svg", comment: "", status: "rejected", submittedAt: "2026-03-03T09:15:00" },
  { id: "s4", userId: "u4", userName: "Sneha Gupta", taskId: "3", taskTitle: "YouTube Comment Task", screenshotUrl: "/placeholder.svg", comment: "Posted the comment", status: "pending", submittedAt: "2026-03-05T11:45:00" },
];

export const mockUser: UserProfile = {
  id: "u1",
  name: "Rahul Sharma",
  mobile: "+91 9876543210",
  email: "rahul@example.com",
  referralCode: "RAHUL123",
  walletBalance: 450,
  pointsBalance: 1200,
  referralEarnings: 150,
  totalEarnings: 600,
  tasksCompleted: 24,
  upiId: "rahul@paytm",
};

export const mockReferrals: Referral[] = [
  { id: "r1", name: "Priya Patel", level: 1, earnings: 45, joinedAt: "2026-02-15", isActive: true },
  { id: "r2", name: "Amit Kumar", level: 1, earnings: 30, joinedAt: "2026-02-20", isActive: true },
  { id: "r3", name: "Sneha Gupta", level: 2, earnings: 20, joinedAt: "2026-02-25", isActive: true },
  { id: "r4", name: "Vikash Singh", level: 2, earnings: 15, joinedAt: "2026-03-01", isActive: false },
  { id: "r5", name: "Neha Joshi", level: 3, earnings: 10, joinedAt: "2026-03-02", isActive: true },
  { id: "r6", name: "Ravi Teja", level: 3, earnings: 8, joinedAt: "2026-03-03", isActive: true },
];

export const mockWithdrawals: WithdrawRequest[] = [
  { id: "w1", userId: "u1", userName: "Rahul Sharma", amount: 200, method: "upi", address: "rahul@paytm", status: "pending", requestedAt: "2026-03-05T08:00:00" },
  { id: "w2", userId: "u2", userName: "Priya Patel", amount: 500, method: "binance", address: "0xABC123DEF456", status: "approved", requestedAt: "2026-03-04T12:00:00" },
  { id: "w3", userId: "u3", userName: "Amit Kumar", amount: 100, method: "upi", address: "amit@gpay", status: "paid", requestedAt: "2026-03-03T16:00:00" },
];

export const adminStats = {
  totalUsers: 1247,
  totalTasks: 35,
  pendingSubmissions: 18,
  totalEarningsPaid: 45600,
};

export const referralSettings = {
  enabled: true,
  l1Percentage: 15,
  l2Percentage: 10,
  l3Percentage: 5,
};
