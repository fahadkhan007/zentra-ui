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
} from "lucide-react";

// ─── Dark mode helper ─────────────────────────────────────────────────────────
function useDarkMode() {
    const [dark, setDark] = useState<boolean>(() => {
        const saved = localStorage.getItem("theme");
        return saved === "dark";
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
        <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 pt-5 w-full flex justify-center pointer-events-none">
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
                        <span className="hidden sm:inline">{item.name}</span>
                        <span className="sm:hidden">
                            <item.icon size={16} />
                        </span>
                        {activeSection === item.name && (
                            <motion.div
                                layoutId="nav-indicator"
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
    );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
const CYCLING_WORDS = ["Trusted", "Knowledgeable", "Helpful", "Accurate", "Reliable"];

function Hero() {
    const navigate = useNavigate();
    const [wordIdx, setWordIdx] = useState(0);

    // Cycle words every 2 s
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
            className="min-h-screen flex flex-col items-center justify-center px-6 pt-28 pb-16"
        >
            {/* WHO badge */}
            <motion.a
                href="https://www.who.int/publications/i/item/9789240015128"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 mb-8 rounded-full
          bg-secondary text-secondary-foreground text-sm font-medium
          hover:bg-secondary/80 transition-colors cursor-pointer"
            >
                Sourced from WHO <MoveRight className="w-4 h-4" />
            </motion.a>

            {/* Headline */}
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular"
            >
                <span>Your AI Health Assistant,</span>
                <br />
                {/* Animated cycling word */}
                <span className="relative inline-flex justify-center w-full overflow-hidden h-[1.25em] mt-1">
                    {CYCLING_WORDS.map((word, i) => (
                        <motion.span
                            key={word}
                            className="absolute font-semibold"
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
                className="flex flex-row gap-3 mt-10"
            >
                <button
                    onClick={() => navigate("/login")}
                    className="inline-flex items-center gap-2 h-11 px-8 rounded-md border border-input
            bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground
            transition-colors"
                >
                    Login <MoveRight className="w-4 h-4" />
                </button>
                <button
                    onClick={() => navigate("/register")}
                    className="inline-flex items-center gap-2 h-11 px-8 rounded-md
            bg-primary text-primary-foreground text-sm font-medium
            hover:bg-primary/90 transition-colors"
                >
                    Get started <MoveRight className="w-4 h-4" />
                </button>
            </motion.div>
        </section>
    );
}

// ─── Features section ─────────────────────────────────────────────────────────
const FEATURES = [
    {
        icon: ShieldCheck,
        title: "WHO-Verified Data",
        desc: "Every answer is grounded in research published by the World Health Organization.",
    },
    {
        icon: Brain,
        title: "AI-Powered Insights",
        desc: "Ask anything health-related and receive personalised, context-aware answers.",
    },
    {
        icon: Activity,
        title: "Obesity Risk Analysis",
        desc: "Our ML model predicts your obesity risk and gives tailored lifestyle recommendations.",
    },
];

function Features() {
    return (
        <section id="about" className="py-24 px-6">
            <div className="max-w-4xl mx-auto text-center mb-14">
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tighter">
                    Everything you need, nothing you don't
                </h2>
                <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                    Zentra combines trusted health data with powerful AI to give you
                    accurate, personalized guidance.
                </p>
            </div>
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
                {FEATURES.map((f, i) => (
                    <motion.div
                        key={f.title}
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1, duration: 0.5 }}
                        className="p-6 rounded-2xl border border-border bg-card hover:bg-muted/50 transition-colors"
                    >
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                            <f.icon className="w-5 h-5 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-2">{f.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}

// ─── FAQ section ──────────────────────────────────────────────────────────────
const FAQS = [
    {
        q: "Is Zentra free to use?",
        a: "Yes — creating an account and using Zentra's AI chat is completely free.",
    },
    {
        q: "Where does the health information come from?",
        a: "All health advice is sourced from WHO-published research and guidelines.",
    },
    {
        q: "How accurate is the obesity risk prediction?",
        a: "Our ML model was trained on WHO obesity datasets and achieves high accuracy in classifying risk levels.",
    },
];

function FAQ() {
    const [open, setOpen] = useState<number | null>(null);

    return (
        <section id="faq" className="py-24 px-6">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-semibold tracking-tighter text-center mb-12">
                    Frequently asked questions
                </h2>
                <div className="space-y-3">
                    {FAQS.map((faq, i) => (
                        <div
                            key={i}
                            className="border border-border rounded-xl overflow-hidden"
                        >
                            <button
                                onClick={() => setOpen(open === i ? null : i)}
                                className="w-full flex items-center justify-between px-5 py-4 text-left font-medium hover:bg-muted/50 transition-colors"
                            >
                                {faq.q}
                                <span className="text-muted-foreground ml-4">
                                    {open === i ? "−" : "+"}
                                </span>
                            </button>
                            {open === i && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed"
                                >
                                    {faq.a}
                                </motion.div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
    const navigate = useNavigate();

    return (
        <footer className="border-t border-border py-10 px-6">
            <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-primary flex items-center justify-center">
                        <Zap className="w-3 h-3 text-primary-foreground" />
                    </div>
                    <span className="font-medium text-foreground">Zentra</span>
                    <span>— AI Health Assistant</span>
                </div>
                <div className="flex items-center gap-6">
                    <button onClick={() => navigate("/login")} className="hover:text-foreground transition-colors">
                        Login
                    </button>
                    <button onClick={() => navigate("/register")} className="hover:text-foreground transition-colors">
                        Sign up
                    </button>
                    <a
                        href="https://www.who.int"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground transition-colors"
                    >
                        WHO
                    </a>
                </div>
            </div>
        </footer>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function LandingPage() {
    const words = useMemo(() => CYCLING_WORDS, []);
    void words; // used by Hero internally via module scope

    return (
        <div className="min-h-screen bg-background text-foreground">
            <NavBar />
            <Hero />
            <Features />
            <FAQ />
            <Footer />
        </div>
    );
}
