import { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { MoveRight, Eye, EyeOff, Zap, ShieldCheck } from "lucide-react";
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
    "WHO-verified health information",
    "Personalised AI fitness insights",
    "Obesity risk analysis with ML",
    "Persistent AI chat sessions",
];

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const { signup, isLoading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

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
            navigate("/dashboard");
        } catch {
            // error is set in the store
        }
    };

    return (
        <div className="min-h-screen flex bg-background">
            {/* ── Left Panel ── */}
            <div className="hidden lg:flex flex-1 flex-col justify-center items-start px-16 relative overflow-hidden">
                {/* Glow blobs */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full bg-primary/5 blur-3xl pointer-events-none" />

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
                        Start your
                        <br />
                        <span className="font-semibold">health journey</span>
                        <br />
                        today.
                    </h1>

                    <p className="text-lg text-muted-foreground leading-relaxed mb-10">
                        Join Zentra and get access to AI-powered health guidance backed by
                        WHO research — completely personalised to you.
                    </p>

                    {/* Feature list */}
                    <ul className="space-y-3">
                        {perks.map((perk) => (
                            <motion.li
                                key={perk}
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * perks.indexOf(perk), duration: 0.4 }}
                                className="flex items-center gap-3 text-sm text-muted-foreground"
                            >
                                <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
                                {perk}
                            </motion.li>
                        ))}
                    </ul>
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
                                Create your account
                            </h2>
                            <p className="text-muted-foreground text-sm mt-1">
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
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium" htmlFor="name">
                                    Full name
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    autoComplete="name"
                                    placeholder="John Doe"
                                    {...register("name")}
                                    className={`w-full h-10 px-3 rounded-md text-sm bg-muted/40 border transition-colors outline-none focus:ring-2 focus:ring-ring
                    ${errors.name ? "border-destructive" : "border-input"}`}
                                />
                                {errors.name && (
                                    <p className="text-xs text-destructive">{errors.name.message}</p>
                                )}
                            </div>

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
                                        className={`w-full h-10 px-3 pr-10 rounded-md text-sm bg-muted/40 border transition-colors outline-none focus:ring-2 focus:ring-ring
                      ${errors.password ? "border-destructive" : "border-input"}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>

                                {/* Strength meter */}
                                {passwordValue.length > 0 && (
                                    <div className="space-y-1">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map((s) => (
                                                <div
                                                    key={s}
                                                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${s <= strength ? strengthColor : "bg-muted"
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
                            <div className="space-y-1.5">
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
                                        className={`w-full h-10 px-3 pr-10 rounded-md text-sm bg-muted/40 border transition-colors outline-none focus:ring-2 focus:ring-ring
                      ${errors.confirmPassword ? "border-destructive" : "border-input"}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((v) => !v)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
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
                                className="w-full gap-2 mt-1"
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

                        <p className="text-center text-sm text-muted-foreground mt-6">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-foreground font-medium hover:text-primary transition-colors"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
