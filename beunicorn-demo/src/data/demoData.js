export const currentUser = {
  name: "User 1",
  email: "aarav@novalabs.ai",
  role: "Admin",
  company: "Nova Labs Pvt Ltd",
  plan: "Private Office",
  location: "BeUnicorn Golden Enclave, Jayanagar",
  wallet: {
    total: 18450,
    grant: 6500,
    topup: 11950,
    overage: 0,
  },
};

export const metrics = [
  { label: "Wallet Balance", value: "₹18,450", sub: "Grant + Top-up credits" },
  { label: "Active Booking", value: "11:00 AM", sub: "Meeting Room today" },
  { label: "Access Status", value: "eKey Active", sub: "BLE offline unlock" },
  { label: "KYC Status", value: "PAN Verified", sub: "Cashfree Secure ID" },
];

export const bookings = [
  {
    space: "Meeting Room",
    time: "Today, 11:00 AM - 12:00 PM",
    cost: "₹1,200",
    status: "Confirmed",
  },
  {
    space: "Creator Studio",
    time: "Tomorrow, 03:00 PM - 05:00 PM",
    cost: "₹3,500",
    status: "Upcoming",
  },
  {
    space: "Day Pass",
    time: "Friday, Full Day",
    cost: "₹799",
    status: "Available",
  },
];

export const ledger = [
  {
    type: "Grant Credits",
    amount: "+₹10,000",
    note: "Welcome credits allocated by staff",
    time: "Today, 09:10 AM",
    status: "Credit",
  },
  {
    type: "Meeting Room Booking",
    amount: "-₹1,200",
    note: "Credits locked after booking confirmation",
    time: "Today, 10:42 AM",
    status: "Debit",
  },
  {
    type: "Print Job",
    amount: "-₹86",
    note: "PaperCut webhook post-print deduction",
    time: "Yesterday, 04:15 PM",
    status: "Debit",
  },
  {
    type: "Wallet Top-up",
    amount: "+₹5,000",
    note: "Cashfree UPI payment success",
    time: "Yesterday, 12:10 PM",
    status: "Credit",
  },
];

export const notifications = [
  "Booking confirmed for Meeting Room",
  "Wallet credited through Cashfree",
  "TTLock eKey provisioned successfully",
  "Print job charged from wallet",
  "Low balance reminder enabled",
];

export const integrations = [
  "Zoho CRM",
  "Zoho Billing",
  "Zoho Books",
  "Google Calendar",
  "Cashfree",
  "TTLock",
  "PaperCut NG",
  "Zoho IoT",
  "APNs / FCM",
];