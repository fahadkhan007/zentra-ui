import { useState } from "react";
import { useNavigate, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap,
    LayoutDashboard,
    User,
    Activity,
    MessageSquare,
    LogOut,
    Moon,
    Sun,
    Menu,
    X,
    ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

// ─── Sub-pages (inline for now, extract later) ───────────────────────────────
function OverviewPage() {
    const user = useAuthStore((s) => s.user);
    const navigate = useNavigate();

    const cards = [
        {
            icon: User,
            title: "Your Profile",
            desc: "Set up your health profile with personal metrics.",
            action: () => navigate("/dashboard/profile"),
            color: "bg-blue-500/10 text-blue-500",
        },
        {
            icon: Activity,
            title: "Obesity Risk",
            desc: "Run the ML model to assess your obesity risk level.",
            action: () => navigate("/dashboard/predict"),
            color: "bg-purple-500/10 text-purple-500",
        },
        {
            icon: MessageSquare,
            title: "AI Health Chat",
            desc: "Ask your WHO-powered AI health assistant anything.",
            action: () => navigate("/dashboard/chat"),
            color: "bg-green-500/10 text-green-500",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome header */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <h1 className="text-2xl font-semibold tracking-tight">
                    Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""} 👋
                </h1>
                <p className="text-muted-foreground mt-1 text-sm">
                    Here's an overview of your Zentra dashboard.
                </p>
            </motion.div>

            {/* Quick-access cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cards.map((card, i) => (
                    <motion.button
                        key={card.title}
                        onClick={card.action}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.08, duration: 0.4 }}
                        className="group text-left p-6 rounded-2xl border border-border bg-card hover:bg-muted/60 transition-all hover:shadow-md"
                    >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${card.color}`}>
                            <card.icon className="w-5 h-5" />
                        </div>
                        <h2 className="font-semibold mb-1">{card.title}</h2>
                        <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
                        <div className="flex items-center gap-1 mt-4 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                            Open <ChevronRight className="w-3 h-3" />
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Info banner */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="rounded-2xl border border-border bg-card p-6 flex items-start gap-4"
            >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Zap className="w-4 h-4 text-primary" />
                </div>
                <div>
                    <h3 className="font-medium mb-1">Get the most out of Zentra</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Start by filling in your <strong>Profile</strong> — this lets the AI personalize
                        answers for you. Then run an <strong>Obesity Risk</strong> analysis, and finally
                        chat with your <strong>AI Health Assistant</strong>.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

function PlaceholderPage({ title, icon: Icon, color }: { title: string; icon: React.ElementType; color: string }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-4"
        >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${color}`}>
                <Icon className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-muted-foreground text-sm max-w-sm">
                This section is being built. Check back soon!
            </p>
        </motion.div>
    );
}

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV_ITEMS = [
    { label: "Overview", to: "/dashboard", icon: LayoutDashboard, end: true },
    { label: "Profile", to: "/dashboard/profile", icon: User, end: false },
    { label: "Obesity Risk", to: "/dashboard/predict", icon: Activity, end: false },
    { label: "AI Chat", to: "/dashboard/chat", icon: MessageSquare, end: false },
];

// ─── Dark mode hook ───────────────────────────────────────────────────────────
function useDarkMode() {
    const [dark, setDark] = useState<boolean>(() => {
        return localStorage.getItem("theme") === "dark";
    });
    const toggle = () => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem("theme", next ? "dark" : "light");
    };
    return { dark, toggle };
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ open, close }: { open: boolean; close: () => void }) {
    const { logout } = useAuthStore();
    const { dark, toggle } = useDarkMode();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <>
            {/* Overlay (mobile) */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={close}
                        className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar panel */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 z-40 flex flex-col
          bg-background border-r border-border
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static lg:z-auto`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                            <Zap className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="font-semibold tracking-tight">Zentra</span>
                    </div>
                    <button onClick={close} className="lg:hidden text-muted-foreground hover:text-foreground">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={close}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${isActive
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                }`
                            }
                        >
                            <item.icon className="w-4 h-4 shrink-0" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom controls */}
                <div className="px-3 py-4 border-t border-border space-y-1 shrink-0">
                    <button
                        onClick={toggle}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
              text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        {dark ? "Light mode" : "Dark mode"}
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium
              text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Log out
                    </button>
                </div>
            </aside>
        </>
    );
}

// ─── Dashboard layout + nested routes ────────────────────────────────────────
export default function DashboardPage() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar open={sidebarOpen} close={() => setSidebarOpen(false)} />

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top bar (mobile) */}
                <header className="h-16 flex items-center px-4 border-b border-border lg:px-8 shrink-0">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden mr-3 text-muted-foreground hover:text-foreground transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <span className="text-sm text-muted-foreground font-medium lg:hidden">Zentra</span>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-8 lg:py-8">
                    <Routes>
                        <Route index element={<OverviewPage />} />
                        <Route
                            path="profile"
                            element={
                                <PlaceholderPage
                                    title="Your Profile"
                                    icon={User}
                                    color="bg-blue-500/10 text-blue-500"
                                />
                            }
                        />
                        <Route
                            path="predict"
                            element={
                                <PlaceholderPage
                                    title="Obesity Risk Analysis"
                                    icon={Activity}
                                    color="bg-purple-500/10 text-purple-500"
                                />
                            }
                        />
                        <Route
                            path="chat"
                            element={
                                <PlaceholderPage
                                    title="AI Health Chat"
                                    icon={MessageSquare}
                                    color="bg-green-500/10 text-green-500"
                                />
                            }
                        />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}
