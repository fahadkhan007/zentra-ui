import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { MoveRight, Eye, EyeOff, Zap, Shield, Brain, Activity, Heart, ArrowLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

// ─── Validation Schema ────────────────────────────────────────────────────────
const registerSchema = z
    .object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        email: z.string().email("Enter a valid email address"),
        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .regex(/[A-Z]/, "Must include an uppercase letter")
            .regex(/[0-9]/, "Must include a number"),
        confirmPassword: z.string(),
    })
    .refine((d) => d.password === d.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type RegisterForm = z.infer<typeof registerSchema>;

// ─── Perks shown on the left panel ───────────────────────────────────────────
const perks = [
    { icon: Shield, text: "WHO-verified data", desc: "Trusted health sources" },
    { icon: Brain, text: "AI-powered insights", desc: "Context-aware answers" },
    { icon: Activity, text: "Obesity risk analysis", desc: "Personalized ML model" },
    { icon: Heart, text: "Persistent chat sessions", desc: "Pick up where you left" },
];

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { signup, isLoading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    // Ensure dark mode on mount
    useEffect(() => {
        document.documentElement.classList.add("dark");
        if (!localStorage.getItem("theme")) {
            localStorage.setItem("theme", "dark");
        }
    }, []);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

    const passwordValue = watch("password", "");

    // Simple password strength meter
    const strength = (() => {
        let score = 0;
        if (passwordValue.length >= 8) score++;
        if (/[A-Z]/.test(passwordValue)) score++;
        if (/[0-9]/.test(passwordValue)) score++;
        if (/[^A-Za-z0-9]/.test(passwordValue)) score++;
        return score; // 0-4
    })();

    const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
    const strengthColor = ["", "bg-destructive", "bg-yellow-500", "bg-blue-500", "bg-green-500"][strength];

    const onSubmit = async (data: RegisterForm) => {
        clearError();
        try {
            await signup(data.email, data.password, data.name);
            navigate("/onboarding");
        } catch {
            // error is set in the store
        }
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
                <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[100px]" />
                <div className="absolute top-1/3 right-1/3 w-[300px] h-[300px] rounded-full bg-primary/4 blur-[100px]" />
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
                style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
                    backgroundSize: "60px 60px",
                }}
            />

            {/* ── Back to Home button (top left) ── */}
            <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                onClick={() => navigate("/")}
                className="fixed top-6 left-6 z-50 group inline-flex items-center gap-2 px-4 py-2 rounded-full
                    border border-border bg-card/50 backdrop-blur-sm text-sm font-medium text-muted-foreground
                    hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
            >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                Back to Home
            </motion.button>

            {/* Centered container */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
                <div className="w-full max-w-5xl flex items-center gap-16 xl:gap-20">

                    {/* ── Left Panel ── */}
                    <div className="hidden lg:block flex-1">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, ease: "easeOut" }}
                        >
                            {/* Logo */}
                            <div className="flex items-center gap-2.5 mb-10">
                                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                                    <Zap className="w-5 h-5 text-primary-foreground" />
                                </div>
                                <span className="text-xl font-semibold tracking-tight">Zentra</span>
                            </div>

                            <h1 className="text-4xl xl:text-5xl font-regular tracking-tighter text-foreground mb-5 leading-[1.1]">
                                Start your
                                <br />
                                <span className="font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                    health journey
                                </span>
                                <br />
                                today.
                            </h1>

                            <p className="text-base text-muted-foreground leading-relaxed max-w-sm mb-10">
                                Join Zentra and get access to AI-powered health guidance
                                backed by WHO research — completely personalised to you.
                            </p>

                            {/* Feature mini-cards */}
                            <div className="flex flex-col gap-3">
                                {perks.map((f, i) => (
                                    <motion.div
                                        key={f.text}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                                        className="flex items-center gap-3.5 p-3 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm
                                            hover:border-primary/20 hover:bg-primary/5 transition-all group"
                                    >
                                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0
                                            group-hover:bg-primary/20 transition-colors">
                                            <f.icon className="w-4 h-4 text-primary" />
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-foreground">{f.text}</span>
                                            <p className="text-xs text-muted-foreground">{f.desc}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Social proof */}
                            <div className="mt-10 flex items-center gap-3 text-sm text-muted-foreground">
                                <div className="flex -space-x-2">
                                    {["Z", "A", "B", "K"].map((l) => (
                                        <div
                                            key={l}
                                            className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-semibold"
                                        >
                                            {l}
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <span className="text-xs font-medium text-foreground">2,000+</span>
                                    <span className="text-xs text-muted-foreground"> users trust Zentra</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* ── Right Panel — Sign Up Card ── */}
                    <div className="w-full max-w-[420px] lg:max-w-[420px] mx-auto lg:mx-0 shrink-0">
                        <motion.div
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                        >
                            {/* Mobile logo */}
                            <div className="lg:hidden flex items-center gap-2.5 mb-8">
                                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                                    <Zap className="w-4 h-4 text-primary-foreground" />
                                </div>
                                <span className="text-lg font-semibold tracking-tight">Zentra</span>
                            </div>

                            {/* Card with gradient top border */}
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
                                {/* Gradient accent line */}
                                <div className="h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent" />

                                <div className="bg-card border border-border border-t-0 rounded-b-2xl p-8">
                                    <div className="mb-7">
                                        <h2 className="text-2xl font-semibold tracking-tight">
                                            Create your account
                                        </h2>
                                        <p className="text-muted-foreground text-sm mt-1.5">
                                            It's free — no credit card required
                                        </p>
                                    </div>

                                    {/* Server error */}
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            className="mb-5 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
                                        >
                                            {error}
                                        </motion.div>
                                    )}

                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                                        {/* Name */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium" htmlFor="name">
                                                Full name
                                            </label>
                                            <input
                                                id="name"
                                                type="text"
                                                autoComplete="name"
                                                placeholder="John Doe"
                                                {...register("name")}
                                                className={`w-full h-11 px-4 rounded-lg text-sm bg-background border transition-all outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                                ${errors.name ? "border-destructive" : "border-input"}`}
                                            />
                                            {errors.name && (
                                                <p className="text-xs text-destructive">{errors.name.message}</p>
                                            )}
                                        </div>

                                        {/* Email */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium" htmlFor="email">
                                                Email
                                            </label>
                                            <input
                                                id="email"
                                                type="email"
                                                autoComplete="email"
                                                placeholder="you@example.com"
                                                {...register("email")}
                                                className={`w-full h-11 px-4 rounded-lg text-sm bg-background border transition-all outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                                ${errors.email ? "border-destructive" : "border-input"}`}
                                            />
                                            {errors.email && (
                                                <p className="text-xs text-destructive">{errors.email.message}</p>
                                            )}
                                        </div>

                                        {/* Password */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium" htmlFor="password">
                                                Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="password"
                                                    type={showPassword ? "text" : "password"}
                                                    autoComplete="new-password"
                                                    placeholder="••••••••"
                                                    {...register("password")}
                                                    className={`w-full h-11 px-4 pr-11 rounded-lg text-sm bg-background border transition-all outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                                  ${errors.password ? "border-destructive" : "border-input"}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword((v) => !v)}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                                >
                                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>

                                            {/* Strength meter */}
                                            {passwordValue.length > 0 && (
                                                <div className="space-y-1.5">
                                                    <div className="flex gap-1">
                                                        {[1, 2, 3, 4].map((s) => (
                                                            <div
                                                                key={s}
                                                                className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${s <= strength ? strengthColor : "bg-muted"
                                                                    }`}
                                                            />
                                                        ))}
                                                    </div>
                                                    {strengthLabel && (
                                                        <p className="text-xs text-muted-foreground">
                                                            Strength:{" "}
                                                            <span className="font-medium text-foreground">{strengthLabel}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            )}

                                            {errors.password && (
                                                <p className="text-xs text-destructive">{errors.password.message}</p>
                                            )}
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium" htmlFor="confirmPassword">
                                                Confirm password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="confirmPassword"
                                                    type={showConfirm ? "text" : "password"}
                                                    autoComplete="new-password"
                                                    placeholder="••••••••"
                                                    {...register("confirmPassword")}
                                                    className={`w-full h-11 px-4 pr-11 rounded-lg text-sm bg-background border transition-all outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                                  ${errors.confirmPassword ? "border-destructive" : "border-input"}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirm((v) => !v)}
                                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                    aria-label={showConfirm ? "Hide password" : "Show password"}
                                                >
                                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {errors.confirmPassword && (
                                                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                                            )}
                                        </div>

                                        {/* Submit */}
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full gap-2 h-11 shadow-lg shadow-primary/20 rounded-lg mt-1"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                                    Creating account…
                                                </>
                                            ) : (
                                                <>
                                                    Get started <MoveRight className="w-4 h-4" />
                                                </>
                                            )}
                                        </Button>
                                    </form>

                                    {/* Divider */}
                                    <div className="flex items-center gap-3 my-6">
                                        <div className="flex-1 h-px bg-border" />
                                        <span className="text-xs text-muted-foreground">or</span>
                                        <div className="flex-1 h-px bg-border" />
                                    </div>

                                    <p className="text-center text-sm text-muted-foreground">
                                        Already have an account?{" "}
                                        <Link
                                            to="/login"
                                            className="text-primary font-medium hover:text-primary/80 transition-colors"
                                        >
                                            Sign in
                                        </Link>
                                    </p>

                                    {/* Security note */}
                                    <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-muted-foreground/60">
                                        <Lock className="w-3 h-3" />
                                        Secured with end-to-end encryption
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
