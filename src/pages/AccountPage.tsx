import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, User, Scale, Activity, Droplets } from "lucide-react";
import { profileApi, type ProfileResponse } from "@/api/client";
import { useAuthStore } from "@/store/authStore";

function bmiInfo(bmi: number) {
    if (bmi < 18.5) return { label: "Underweight", color: "#60a5fa" };
    if (bmi < 25) return { label: "Normal", color: "#4ade80" };
    if (bmi < 30) return { label: "Overweight", color: "#facc15" };
    return { label: "Obese", color: "#f87171" };
}

function Chip({ label, value, color }: { label: string; value: string; color?: string }) {
    return (
        <div className="flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-xl bg-muted/40 border border-border">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm font-semibold" style={color ? { color } : undefined}>{value}</span>
        </div>
    );
}

export default function AccountPage() {
    const { user } = useAuthStore();
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        profileApi.get()
            .then((r) => setProfile(r.data))
            .finally(() => setLoading(false));
    }, []);

    // Avatar initials
    const initials = user?.name
        ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
        : user?.email?.slice(0, 2).toUpperCase() ?? "?";

    const bmi = profile
        ? parseFloat((profile.weight_kg / profile.height_m ** 2).toFixed(1))
        : null;
    const bmiMeta = bmi ? bmiInfo(bmi) : null;

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="w-full max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-5">

                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-xl font-semibold">My Profile</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Account info &amp; health snapshot</p>
                </motion.div>

                {/* Identity card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                    className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4"
                >
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center shrink-0">
                        <span className="text-lg font-bold text-primary">{initials}</span>
                    </div>
                    <div className="min-w-0">
                        {user?.name && (
                            <p className="text-base font-semibold truncate">{user.name}</p>
                        )}
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                            <Mail className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{user?.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60 mt-1">
                            <User className="w-3 h-3" />
                            Zentra member
                        </div>
                    </div>
                </motion.div>

                {/* Health snapshot */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                )}

                {!loading && profile && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                        className="space-y-3"
                    >
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-0.5">
                            Health Summary
                        </p>

                        {/* Key metrics grid */}
                        <div className="grid grid-cols-4 gap-2">
                            <Chip label="Age" value={`${profile.age} yrs`} />
                            <Chip label="Gender" value={profile.gender} />
                            <Chip label="Height" value={`${profile.height_m} m`} />
                            <Chip label="Weight" value={`${profile.weight_kg} kg`} />
                        </div>

                        {/* BMI card */}
                        {bmi && bmiMeta && (
                            <div className="flex items-center gap-4 bg-card border border-border rounded-xl px-5 py-4">
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground mb-0.5">Body Mass Index (BMI)</p>
                                    <div className="flex items-end gap-2">
                                        <span className="text-3xl font-bold tracking-tight">{bmi}</span>
                                        <span className="text-sm font-medium pb-0.5" style={{ color: bmiMeta.color }}>
                                            {bmiMeta.label}
                                        </span>
                                    </div>
                                </div>
                                {/* Mini BMI bar */}
                                <div className="w-28 space-y-1.5 shrink-0">
                                    <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min((bmi / 40) * 100, 100)}%` }}
                                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: bmiMeta.color }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-muted-foreground text-right">Target: &lt;25</p>
                                </div>
                            </div>
                        )}

                        {/* Lifestyle quick stats */}
                        <div className="grid grid-cols-3 gap-2">
                            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-3">
                                <Activity className="w-4 h-4 text-primary shrink-0" />
                                <div>
                                    <p className="text-[10px] text-muted-foreground leading-none">Activity</p>
                                    <p className="text-xs font-semibold mt-0.5">{profile.physical_activity_hours} hrs</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-3">
                                <Droplets className="w-4 h-4 text-blue-400 shrink-0" />
                                <div>
                                    <p className="text-[10px] text-muted-foreground leading-none">Water</p>
                                    <p className="text-xs font-semibold mt-0.5">{profile.water_intake_liters} L</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-3">
                                <Scale className="w-4 h-4 text-orange-400 shrink-0" />
                                <div>
                                    <p className="text-[10px] text-muted-foreground leading-none">Meals</p>
                                    <p className="text-xs font-semibold mt-0.5">{profile.main_meals_per_day}/day</p>
                                </div>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground/50 text-center pt-1">
                            Edit your full health data under <span className="text-muted-foreground">Health Profile</span>
                        </p>
                    </motion.div>
                )}

                {!loading && !profile && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No health profile found. Complete your onboarding to see stats here.
                    </p>
                )}
            </div>
        </div>
    );
}
