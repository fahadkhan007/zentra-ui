import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    MoveRight,
    Zap,
    Moon,
    Sun,
    Home,
    Info,
    HelpCircle,
    ShieldCheck,
    Brain,
    Activity,
    ChevronDown,
    Sparkles,
    MessageCircle,
    Clock,
    Heart,
    Lock,
} from "lucide-react";

// ─── Dark mode helper ─────────────────────────────────────────────────────────
function useDarkMode() {
    const [dark, setDark] = useState<boolean>(() => {
        const saved = localStorage.getItem("theme");
        return saved !== "light";
    });

    useEffect(() => {
        const root = document.documentElement;
        if (dark) root.classList.add("dark");
        else root.classList.remove("dark");
        localStorage.setItem("theme", dark ? "dark" : "light");
    }, [dark]);

    return { dark, toggle: () => setDark((d) => !d) };
}

// ─── NavBar ───────────────────────────────────────────────────────────────────
function NavBar() {
    const navigate = useNavigate();
    const { dark, toggle } = useDarkMode();
    const [activeSection, setActiveSection] = useState("Home");

    const navItems = [
        { name: "Home", href: "#", icon: Home },
        { name: "About", href: "#about", icon: Info },
        { name: "FAQ", href: "#faq", icon: HelpCircle },
    ];

    return (
        <>
            {/* ── Desktop navbar (top floating pill) ─────────────────── */}
            <div className="hidden md:flex fixed top-0 left-1/2 -translate-x-1/2 z-50 pt-5 w-full justify-center pointer-events-none">
                <div className="flex items-center gap-2 bg-background/80 border border-border backdrop-blur-xl py-1.5 px-2 rounded-full shadow-lg pointer-events-auto">
                    {/* Logo */}
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-full"
                    >
                        <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
                            <Zap className="w-3.5 h-3.5 text-primary-foreground" />
                        </div>
                        <span className="text-sm font-semibold tracking-tight">Zentra</span>
                    </button>

                    <div className="w-px h-5 bg-border/60 mx-1" />

                    {/* Nav links */}
                    {navItems.map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                            onClick={() => setActiveSection(item.name)}
                            className={`relative text-sm font-medium px-4 py-1.5 rounded-full transition-colors
                  ${activeSection === item.name
                                    ? "text-primary bg-muted"
                                    : "text-foreground/70 hover:text-foreground"
                                }`}
                        >
                            {item.name}
                            {activeSection === item.name && (
                                <motion.div
                                    layoutId="nav-indicator-desktop"
                                    className="absolute inset-0 bg-primary/5 rounded-full -z-10"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </a>
                    ))}

                    <div className="w-px h-5 bg-border/60 mx-1" />

                    {/* Dark mode toggle */}
                    <button
                        onClick={toggle}
                        aria-label="Toggle dark mode"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
                    >
                        {dark ? <Sun size={16} /> : <Moon size={16} />}
                    </button>

                    {/* Login CTA */}
                    <button
                        onClick={() => navigate("/login")}
                        className="ml-1 px-4 py-1.5 text-sm font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        Login
                    </button>
                </div>
            </div>

            {/* ── Mobile navbar (bottom dock) ────────────────────────── */}
            <div
                className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
                style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
            >
                <div className="pointer-events-auto mx-4 mb-4 flex items-center justify-around bg-background/80 border border-border backdrop-blur-xl rounded-full shadow-lg px-3 py-2">
                    {navItems.map((item) => (
                        <a
                            key={item.name}
                            href={item.href}
                            onClick={() => setActiveSection(item.name)}
                            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
                      ${activeSection === item.name
                                    ? "text-primary bg-primary/10"
                                    : "text-foreground/50 hover:text-foreground"
                                }`}
                        >
                            <item.icon size={20} strokeWidth={2} />
                        </a>
                    ))}

                    <button
                        onClick={toggle}
                        aria-label="Toggle dark mode"
                        className="w-10 h-10 rounded-full flex items-center justify-center text-foreground/50 hover:text-foreground transition-colors"
                    >
                        {dark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>

                    <button
                        onClick={() => navigate("/login")}
                        className="h-10 px-5 text-xs font-semibold rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                        Login
                    </button>
                </div>
            </div>
        </>
    );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
const CYCLING_WORDS = ["Trusted", "Knowledgeable", "Helpful", "Accurate", "Reliable"];

function Hero() {
    const navigate = useNavigate();
    const [wordIdx, setWordIdx] = useState(0);

    useEffect(() => {
        const id = setInterval(
            () => setWordIdx((i) => (i + 1) % CYCLING_WORDS.length),
            2000
        );
        return () => clearInterval(id);
    }, []);

    return (
        <section
            id="home"
            className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-16 overflow-hidden"
        >
            {/* Ambient background glows */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px]" />
                <div className="absolute bottom-1/3 left-1/4 w-[300px] h-[300px] rounded-full bg-primary/3 blur-[100px]" />
                <div className="absolute top-1/3 right-1/4 w-[200px] h-[200px] rounded-full bg-primary/4 blur-[80px]" />
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            <div className="relative z-10 flex flex-col items-center">
                {/* WHO badge */}
                <motion.a
                    href="https://www.who.int/publications/i/item/9789240015128"
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="group inline-flex items-center gap-2 px-5 py-2 mb-10 rounded-full
                        border border-border bg-card/50 backdrop-blur-sm text-sm font-medium
                        hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer"
                >
                    <Sparkles className="w-4 h-4 text-primary" />
                    Sourced from WHO
                    <MoveRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </motion.a>

                {/* Headline */}
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-5xl md:text-7xl max-w-3xl tracking-tighter text-center font-regular"
                >
                    <span>Your AI Health Assistant,</span>
                    <br />
                    {/* Animated cycling word with gradient */}
                    <span className="relative inline-flex justify-center w-full overflow-hidden h-[1.25em] mt-1">
                        {CYCLING_WORDS.map((word, i) => (
                            <motion.span
                                key={word}
                                className="absolute font-semibold bg-gradient-to-r from-primary via-primary to-primary/60 bg-clip-text text-transparent"
                                initial={{ opacity: 0, y: 100 }}
                                animate={
                                    wordIdx === i
                                        ? { opacity: 1, y: 0 }
                                        : { opacity: 0, y: wordIdx > i ? -100 : 100 }
                                }
                                transition={{ type: "spring", stiffness: 50 }}
                            >
                                {word}
                            </motion.span>
                        ))}
                    </span>
                </motion.h1>

                {/* Subheading */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-6 text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center"
                >
                    Zentra is an AI-powered chatbot that answers your health questions using
                    verified information from the World Health Organization. Get reliable
                    health guidance, anytime.
                </motion.p>

                {/* CTA buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-row gap-4 mt-10"
                >
                    <button
                        onClick={() => navigate("/login")}
                        className="group inline-flex items-center gap-2 h-12 px-8 rounded-full border border-border
                            bg-card/50 backdrop-blur-sm text-sm font-medium hover:bg-muted hover:border-primary/30
                            transition-all"
                    >
                        Login <MoveRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                    <button
                        onClick={() => navigate("/register")}
                        className="group inline-flex items-center gap-2 h-12 px-8 rounded-full
                            bg-primary text-primary-foreground text-sm font-medium
                            hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
                    >
                        Get started <MoveRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                </motion.div>

                {/* Trust indicators */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="mt-14 flex items-center gap-6 text-xs text-muted-foreground/70"
                >
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Free to use
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        WHO-verified
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        No signup required
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

// ─── Features section ─────────────────────────────────────────────────────────
const FEATURES = [
    {
        icon: ShieldCheck,
        title: "WHO-Verified Data",
        desc: "Every answer is grounded in research published by the World Health Organization.",
        gradient: "from-emerald-500/20 to-emerald-500/5",
        iconColor: "text-emerald-400",
        iconBg: "bg-emerald-500/10",
    },
    {
        icon: Brain,
        title: "AI-Powered Insights",
        desc: "Ask anything health-related and receive personalised, context-aware answers.",
        gradient: "from-blue-500/20 to-blue-500/5",
        iconColor: "text-blue-400",
        iconBg: "bg-blue-500/10",
    },
    {
        icon: Activity,
        title: "Obesity Risk Analysis",
        desc: "Our ML model predicts your obesity risk and gives tailored lifestyle recommendations.",
        gradient: "from-violet-500/20 to-violet-500/5",
        iconColor: "text-violet-400",
        iconBg: "bg-violet-500/10",
    },
    {
        icon: MessageCircle,
        title: "Conversational AI Chat",
        desc: "Natural, flowing conversations that understand context and remember your preferences.",
        gradient: "from-amber-500/20 to-amber-500/5",
        iconColor: "text-amber-400",
        iconBg: "bg-amber-500/10",
    },
    {
        icon: Lock,
        title: "Privacy First",
        desc: "Your health data is encrypted end-to-end. We never share your information with third parties.",
        gradient: "from-rose-500/20 to-rose-500/5",
        iconColor: "text-rose-400",
        iconBg: "bg-rose-500/10",
    },
    {
        icon: Clock,
        title: "24/7 Availability",
        desc: "Get instant health guidance anytime, anywhere — no appointments or waiting rooms.",
        gradient: "from-cyan-500/20 to-cyan-500/5",
        iconColor: "text-cyan-400",
        iconBg: "bg-cyan-500/10",
    },
];

const STATS = [
    { value: "2,000+", label: "Active Users" },
    { value: "50K+", label: "Questions Answered" },
    { value: "99.9%", label: "Uptime" },
    { value: "4.9/5", label: "User Rating" },
];

function Features() {
    return (
        <section id="about" className="relative py-28 px-6">
            {/* Section glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/3 blur-[150px] pointer-events-none" />

            <div className="relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="max-w-5xl mx-auto text-center mb-16"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/50 backdrop-blur-sm text-xs font-medium text-muted-foreground mb-6">
                        <Sparkles className="w-3 h-3 text-primary" />
                        Features
                    </span>
                    <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter">
                        Everything you need,{" "}
                        <span className="bg-gradient-to-r from-muted-foreground to-muted-foreground/50 bg-clip-text text-transparent">nothing you don't</span>
                    </h2>
                    <p className="mt-5 text-muted-foreground max-w-xl mx-auto leading-relaxed">
                        Zentra combines trusted health data with powerful AI to give you
                        accurate, personalized guidance.
                    </p>
                </motion.div>

                {/* Feature cards — 3 columns */}
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {FEATURES.map((f, i) => (
                        <motion.div
                            key={f.title}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.08, duration: 0.5 }}
                            className="group relative p-7 rounded-2xl border border-border bg-card/50 backdrop-blur-sm
                                hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
                        >
                            {/* Gradient glow on hover */}
                            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                            <div className="relative z-10">
                                <div className={`w-11 h-11 rounded-xl ${f.iconBg} flex items-center justify-center mb-5
                                    group-hover:scale-110 transition-transform duration-300`}>
                                    <f.icon className={`w-5 h-5 ${f.iconColor}`} />
                                </div>
                                <h3 className="font-semibold mb-2 text-lg tracking-tight">{f.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Stats bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="max-w-4xl mx-auto mt-16 p-6 rounded-2xl border border-border bg-card/30 backdrop-blur-sm"
                >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {STATS.map((stat, i) => (
                            <div key={i} className="text-center">
                                <div className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                    {stat.value}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

// ─── FAQ section ──────────────────────────────────────────────────────────────
const FAQS = [
    {
        q: "Is Zentra free to use?",
        a: "Yes — creating an account and using Zentra's AI chat is completely free. No credit card required, no hidden fees.",
    },
    {
        q: "Where does the health information come from?",
        a: "All health advice is sourced from WHO-published research, clinical guidelines, and peer-reviewed medical literature.",
    },
    {
        q: "How accurate is the obesity risk prediction?",
        a: "Our ML model was trained on WHO obesity datasets and achieves high accuracy in classifying risk levels. It considers multiple factors including BMI, lifestyle, and dietary habits.",
    },
    {
        q: "Is my health data safe?",
        a: "Absolutely. Your conversations are encrypted end-to-end. We never share, sell, or use your personal health data for advertising.",
    },
    {
        q: "Can Zentra replace my doctor?",
        a: "No — Zentra provides health information and guidance, but it is not a substitute for professional medical advice. Always consult a healthcare provider for diagnosis and treatment.",
    },
    {
        q: "How do I delete my account and data?",
        a: "You can delete your account and all associated data at any time from your profile settings. All data is permanently removed within 30 days.",
    },
];

function FAQ() {
    const [open, setOpen] = useState<number | null>(null);
    const navigate = useNavigate();

    return (
        <section id="faq" className="relative py-28 px-6">
            {/* Section glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[120px] pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-14"
                >
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/50 backdrop-blur-sm text-xs font-medium text-muted-foreground mb-6">
                        <HelpCircle className="w-3 h-3 text-primary" />
                        FAQ
                    </span>
                    <h2 className="text-3xl md:text-5xl font-semibold tracking-tighter">
                        Frequently asked{" "}
                        <span className="bg-gradient-to-r from-muted-foreground to-muted-foreground/50 bg-clip-text text-transparent">questions</span>
                    </h2>
                    <p className="mt-4 text-muted-foreground max-w-md mx-auto leading-relaxed text-sm">
                        Everything you need to know about Zentra. Can't find what you're looking for? Reach out to us.
                    </p>
                </motion.div>
                <div className="space-y-3">
                    {FAQS.map((faq, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 16 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.06, duration: 0.4 }}
                            className={`border rounded-2xl overflow-hidden transition-all duration-300
                                ${open === i
                                    ? "border-primary/20 bg-card/50 shadow-lg shadow-primary/5"
                                    : "border-border bg-card/20 hover:border-primary/10 hover:bg-card/30"}`}
                        >
                            <button
                                onClick={() => setOpen(open === i ? null : i)}
                                className="w-full flex items-center gap-4 px-6 py-5 text-left transition-colors"
                            >
                                <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors duration-200
                                    ${open === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <span className="flex-1 font-medium">{faq.q}</span>
                                <ChevronDown
                                    className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-300
                                        ${open === i ? "rotate-180" : ""}`}
                                />
                            </button>
                            {open === i && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="px-6 pl-[4.25rem] pb-5 text-sm text-muted-foreground leading-relaxed"
                                >
                                    {faq.a}
                                </motion.div>
                            )}
                        </motion.div>
                    ))}
                </div>

                {/* Still have questions CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="mt-10 p-6 rounded-2xl border border-border bg-card/30 backdrop-blur-sm text-center"
                >
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-primary" />
                        <span className="font-semibold text-sm">Still have questions?</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                        Can't find the answer you're looking for? Get started and ask Zentra directly.
                    </p>
                    <button
                        onClick={() => navigate("/register")}
                        className="group inline-flex items-center gap-2 h-9 px-5 rounded-full
                            bg-primary text-primary-foreground text-xs font-medium
                            hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                    >
                        Get in touch <MoveRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </button>
                </motion.div>
            </div>
        </section>
    );
}

// ─── CTA Section ──────────────────────────────────────────────────────────────
function CTASection() {
    const navigate = useNavigate();

    return (
        <section className="py-20 px-6">
            <div className="max-w-3xl mx-auto relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative overflow-hidden rounded-3xl border border-border bg-card/50 backdrop-blur-sm p-12 md:p-16 text-center"
                >
                    {/* Background glow */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full bg-primary/10 blur-[100px]" />
                    </div>

                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-semibold tracking-tighter mb-4">
                            Ready to take control of your{" "}
                            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">health?</span>
                        </h2>
                        <p className="text-muted-foreground max-w-md mx-auto mb-8 leading-relaxed">
                            Join thousands of users who trust Zentra for reliable, AI-powered health guidance.
                        </p>
                        <button
                            onClick={() => navigate("/register")}
                            className="group inline-flex items-center gap-2 h-12 px-8 rounded-full
                                bg-primary text-primary-foreground text-sm font-medium
                                hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
                        >
                            Get started for free <MoveRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </button>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
const FOOTER_LINKS = {
    Product: [
        { label: "Features", href: "#about" },
        { label: "FAQ", href: "#faq" },
        { label: "Obesity Predictor", href: "/register" },
        { label: "AI Chat", href: "/register" },
    ],
    Resources: [
        { label: "WHO Guidelines", href: "https://www.who.int", external: true },
        { label: "Health Topics", href: "https://www.who.int/health-topics", external: true },
        { label: "BMI Calculator", href: "https://www.who.int/tools/growth-reference-data-for-5to19-years/indicators/bmi-for-age", external: true },
    ],
    Legal: [
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "Cookie Policy", href: "#" },
    ],
};

function Footer() {
    const navigate = useNavigate();

    return (
        <footer className="relative border-t border-border">
            {/* Gradient accent line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

            <div className="max-w-5xl mx-auto px-6 pt-16 pb-8">
                {/* Top section: Brand + Link columns */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-14">
                    {/* Brand */}
                    <div className="md:col-span-4">
                        <div className="flex items-center gap-2.5 mb-4">
                            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <Zap className="w-4.5 h-4.5 text-primary-foreground" />
                            </div>
                            <span className="text-lg font-semibold tracking-tight">Zentra</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-6">
                            AI-powered health guidance backed by WHO research. Personalised, accurate, and always available.
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card/50 text-xs text-muted-foreground">
                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                All systems operational
                            </span>
                        </div>
                    </div>

                    {/* Link columns */}
                    {Object.entries(FOOTER_LINKS).map(([title, links]) => (
                        <div key={title} className="md:col-span-2 md:col-start-auto">
                            <h4 className="text-sm font-semibold mb-4 text-foreground">{title}</h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.label}>
                                        {(link as any).external ? (
                                            <a
                                                href={link.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {link.label}
                                            </a>
                                        ) : link.href.startsWith("#") ? (
                                            <a
                                                href={link.href}
                                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {link.label}
                                            </a>
                                        ) : (
                                            <button
                                                onClick={() => navigate(link.href)}
                                                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {link.label}
                                            </button>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div className="h-px bg-border mb-8" />

                {/* Bottom bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Zentra. All rights reserved.</p>
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                            Made with <Heart className="w-3 h-3 text-rose-400" /> for better health
                        </span>
                        <span className="text-muted-foreground/40">·</span>
                        <a
                            href="https://www.who.int"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-foreground transition-colors"
                        >
                            Powered by WHO Data
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
    const words = useMemo(() => CYCLING_WORDS, []);
    void words;

    return (
        <div className="min-h-screen bg-background text-foreground pb-24 md:pb-0">
            <NavBar />
            <Hero />
            <Features />
            <FAQ />
            <CTASection />
            <Footer />
        </div>
    );
}
