import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { MoveRight, Eye, EyeOff, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

// ─── Validation Schema ────────────────────────────────────────────────────────
const loginSchema = z.object({
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginForm = z.infer<typeof loginSchema>;

// ─── Animated word cycle (mirrors the Hero component) ─────────────────────────
const rotatingWords = ["Trusted", "Reliable", "Accurate", "Intelligent"];

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [wordIndex, setWordIndex] = useState(0);
    const { login, isLoading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    // Rotate words every 2s (same timing as Hero)
    useState(() => {
        const id = setInterval(
            () => setWordIndex((i) => (i + 1) % rotatingWords.length),
            2000
        );
        return () => clearInterval(id);
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

    const onSubmit = async (data: LoginForm) => {
        clearError();
        try {
            await login(data.email, data.password);
            navigate("/dashboard");
        } catch {
            // error is already set in the store
        }
    };

    return (
        <div className="min-h-screen flex bg-background">
            {/* ── Left Panel ── */}
            <div className="hidden lg:flex flex-1 flex-col justify-center items-start px-16 relative overflow-hidden">
                {/* Background glow blobs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="relative z-10 max-w-lg"
                >
                    {/* Logo */}
                    <div className="flex items-center gap-2 mb-12">
                        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                            <Zap className="w-5 h-5 text-primary-foreground" />
                        </div>
                        <span className="text-xl font-semibold tracking-tight">Zentra</span>
                    </div>

                    <h1 className="text-5xl font-regular tracking-tighter text-foreground mb-4 leading-tight">
                        Your AI Health
                        <br />
                        Assistant, Always{" "}
                        <span className="relative inline-block overflow-hidden h-[1.2em] align-bottom w-52">
                            {rotatingWords.map((word, i) => (
                                <motion.span
                                    key={word}
                                    className="absolute left-0 font-semibold text-primary"
                                    initial={{ opacity: 0, y: 80 }}
                                    animate={
                                        wordIndex === i
                                            ? { opacity: 1, y: 0 }
                                            : { opacity: 0, y: wordIndex > i ? -80 : 80 }
                                    }
                                    transition={{ type: "spring", stiffness: 50 }}
                                >
                                    {word}
                                </motion.span>
                            ))}
                        </span>
                    </h1>

                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Zentra is an AI-powered assistant that answers your health questions
                        using verified information from the World Health Organization.
                    </p>

                    <div className="mt-10 flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex -space-x-2">
                            {["Z", "A", "B"].map((l) => (
                                <div
                                    key={l}
                                    className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-semibold"
                                >
                                    {l}
                                </div>
                            ))}
                        </div>
                        <span>Trusted by thousands of users worldwide</span>
                    </div>
                </motion.div>
            </div>

            {/* ── Right Panel — Glass Card ── */}
            <div className="flex-1 flex items-center justify-center px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="w-full max-w-md"
                >
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                            <Zap className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="text-lg font-semibold tracking-tight">Zentra</span>
                    </div>

                    {/* Glass card */}
                    <div className="bg-background/5 border border-border backdrop-blur-lg rounded-2xl p-8 shadow-xl">
                        <div className="mb-7">
                            <h2 className="text-2xl font-semibold tracking-tight">
                                Welcome back
                            </h2>
                            <p className="text-muted-foreground text-sm mt-1">
                                Sign in to your Zentra account
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

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    {...register("email")}
                                    className={`w-full h-10 px-3 rounded-md text-sm bg-muted/40 border transition-colors outline-none focus:ring-2 focus:ring-ring
                    ${errors.email ? "border-destructive" : "border-input"}`}
                                />
                                {errors.email && (
                                    <p className="text-xs text-destructive">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium" htmlFor="password">
                                        Password
                                    </label>
                                    <Link
                                        to="/forgot-password"
                                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        placeholder="••••••••"
                                        {...register("password")}
                                        className={`w-full h-10 px-3 pr-10 rounded-md text-sm bg-muted/40 border transition-colors outline-none focus:ring-2 focus:ring-ring
                      ${errors.password ? "border-destructive" : "border-input"}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-4 h-4" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-destructive">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Submit */}
                            <Button
                                type="submit"
                                size="lg"
                                className="w-full gap-2 mt-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                        Signing in…
                                    </>
                                ) : (
                                    <>
                                        Sign in <MoveRight className="w-4 h-4" />
                                    </>
                                )}
                            </Button>
                        </form>

                        <p className="text-center text-sm text-muted-foreground mt-6">
                            Don't have an account?{" "}
                            <Link
                                to="/register"
                                className="text-foreground font-medium hover:text-primary transition-colors"
                            >
                                Create one
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
