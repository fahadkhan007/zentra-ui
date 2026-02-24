import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
    User, Pencil, Save, X, AlertCircle,
    Scale, Footprints, Droplets, Flame, Car, Cigarette, Wine,
} from "lucide-react";
import { profileApi, type HealthProfilePayload, type ProfileResponse } from "@/api/client";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function bmiCategory(bmi: number) {
    if (bmi < 18.5) return { label: "Underweight", color: "text-blue-500" };
    if (bmi < 25) return { label: "Normal", color: "text-green-500" };
    if (bmi < 30) return { label: "Overweight", color: "text-yellow-500" };
    return { label: "Obese", color: "text-red-500" };
}

// ─── Read-only row ────────────────────────────────────────────────────────────
function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
    return (
        <div className="flex items-center gap-3 py-3 border-b border-border last:border-0">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <span className="text-sm text-muted-foreground flex-1">{label}</span>
            <span className="text-sm font-medium text-right">{value}</span>
        </div>
    );
}

// ─── Field wrappers for edit mode ─────────────────────────────────────────────
function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-xs font-medium text-muted-foreground uppercase tracking-wider">
                {label}
            </label>
            {children}
        </div>
    );
}

const inputCls = "w-full h-9 px-3 rounded-lg text-sm bg-muted/50 border border-input outline-none focus:ring-2 focus:ring-ring transition-colors";
const selectCls = `${inputCls} appearance-none cursor-pointer`;

// ─── Main ProfilePage ─────────────────────────────────────────────────────────
export default function ProfilePage() {
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [saveError, setSaveError] = useState<string | null>(null);

    const { register, handleSubmit, reset } = useForm<HealthProfilePayload>();

    useEffect(() => {
        profileApi.get()
            .then((res) => {
                setProfile(res.data);
                reset(res.data);
            })
            .catch(() => setError("Could not load your profile."))
            .finally(() => setLoading(false));
    }, [reset]);

    const startEdit = () => {
        if (profile) reset(profile);
        setSaveError(null);
        setEditing(true);
    };

    const cancelEdit = () => {
        if (profile) reset(profile);
        setSaveError(null);
        setEditing(false);
    };

    const onSave = async (data: HealthProfilePayload) => {
        setSaving(true);
        setSaveError(null);
        try {
            const res = await profileApi.update(data);
            setProfile(res.data);
            setEditing(false);
        } catch {
            setSaveError("Failed to save changes. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const bmi = profile
        ? parseFloat((profile.weight_kg / (profile.height_m ** 2)).toFixed(1))
        : null;
    const bmiCat = bmi ? bmiCategory(bmi) : null;

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="w-full max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-xl font-semibold">Health Profile</h1>
                        <p className="text-sm text-muted-foreground mt-0.5">Your health information</p>
                    </div>
                    {!loading && profile && !editing && (
                        <button
                            onClick={startEdit}
                            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                        </button>
                    )}
                    {editing && (
                        <div className="flex gap-2">
                            <button
                                onClick={cancelEdit}
                                className="inline-flex items-center gap-2 h-9 px-4 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="w-3.5 h-3.5" /> Cancel
                            </button>
                            <button
                                onClick={handleSubmit(onSave)}
                                disabled={saving}
                                className="inline-flex items-center gap-2 h-9 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60"
                            >
                                {saving
                                    ? <span className="w-3.5 h-3.5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                    : <Save className="w-3.5 h-3.5" />
                                }
                                {saving ? "Saving…" : "Save"}
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Error banner */}
                {(error || saveError) && (
                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {error ?? saveError}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-24">
                        <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    </div>
                )}

                {/* BMI summary card */}
                {!loading && bmi && bmiCat && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4"
                    >
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <User className="w-7 h-7 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">BMI</p>
                            <p className="text-3xl font-bold tracking-tight">{bmi}</p>
                            <p className={`text-sm font-medium mt-0.5 ${bmiCat.color}`}>{bmiCat.label}</p>
                        </div>
                        {profile && (
                            <div className="ml-auto text-right text-sm text-muted-foreground space-y-0.5">
                                <p>{profile.height_m} m tall</p>
                                <p>{profile.weight_kg} kg</p>
                                <p>{profile.gender} · {profile.age} yrs</p>
                            </div>
                        )}
                    </motion.div>
                )}

                {/* ── VIEW MODE ── */}
                {!loading && profile && !editing && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-card border border-border rounded-2xl p-5 space-y-0"
                    >
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Health Details</p>
                        <InfoRow icon={Flame} label="High-calorie food" value={profile.high_calorie_food === "yes" ? "Yes" : "No"} />
                        <InfoRow icon={Droplets} label="Water intake" value={`${profile.water_intake_liters} L/day`} />
                        <InfoRow icon={Footprints} label="Physical activity" value={`${profile.physical_activity_hours} hrs/day`} />
                        <InfoRow icon={Scale} label="Main meals/day" value={profile.main_meals_per_day} />
                        <InfoRow icon={Flame} label="Snacking" value={profile.snack_frequency} />
                        <InfoRow icon={Scale} label="Vegetable intake"
                            value={["", "Rarely", "Sometimes", "Always"][profile.vegetable_intake_freq] ?? profile.vegetable_intake_freq}
                        />
                        <InfoRow icon={Cigarette} label="Smokes" value={profile.smokes === "yes" ? "Yes" : "No"} />
                        <InfoRow icon={Wine} label="Alcohol" value={profile.alcohol_consumption} />
                        <InfoRow icon={Car} label="Travel mode" value={profile.travel_mode.replace(/_/g, " ")} />
                        <InfoRow icon={Scale} label="Calorie tracking" value={profile.calorie_tracking === "yes" ? "Yes" : "No"} />
                        <InfoRow icon={Scale} label="Family overweight history" value={profile.family_overweight_history === "yes" ? "Yes" : "No"} />
                    </motion.div>
                )}

                {/* ── EDIT MODE ── */}
                {!loading && editing && (
                    <motion.form
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-card border border-border rounded-2xl p-5 space-y-4"
                        onSubmit={handleSubmit(onSave)}
                    >
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Edit Health Details</p>

                        <div className="grid grid-cols-2 gap-4">
                            <FieldGroup label="Gender">
                                <select className={selectCls} {...register("gender")}>
                                    <option value="Female">Female</option>
                                    <option value="Male">Male</option>
                                </select>
                            </FieldGroup>
                            <FieldGroup label="Age (years)">
                                <input type="number" className={inputCls} step={1} min={5} max={120} {...register("age", { valueAsNumber: true })} />
                            </FieldGroup>
                            <FieldGroup label="Height (m)">
                                <input type="number" className={inputCls} step={0.01} min={0.5} max={3} {...register("height_m", { valueAsNumber: true })} />
                            </FieldGroup>
                            <FieldGroup label="Weight (kg)">
                                <input type="number" className={inputCls} step={0.1} min={10} max={500} {...register("weight_kg", { valueAsNumber: true })} />
                            </FieldGroup>
                        </div>

                        <FieldGroup label="Family overweight history">
                            <select className={selectCls} {...register("family_overweight_history")}>
                                <option value="no">No</option>
                                <option value="yes">Yes</option>
                            </select>
                        </FieldGroup>

                        <div className="grid grid-cols-2 gap-4">
                            <FieldGroup label="High-calorie food">
                                <select className={selectCls} {...register("high_calorie_food")}>
                                    <option value="no">No</option>
                                    <option value="yes">Yes</option>
                                </select>
                            </FieldGroup>
                            <FieldGroup label="Calorie tracking">
                                <select className={selectCls} {...register("calorie_tracking")}>
                                    <option value="no">No</option>
                                    <option value="yes">Yes</option>
                                </select>
                            </FieldGroup>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FieldGroup label="Vegetable intake">
                                <select className={selectCls} {...register("vegetable_intake_freq", { valueAsNumber: true })}>
                                    <option value={1}>Rarely</option>
                                    <option value={2}>Sometimes</option>
                                    <option value={3}>Always</option>
                                </select>
                            </FieldGroup>
                            <FieldGroup label="Main meals/day">
                                <select className={selectCls} {...register("main_meals_per_day", { valueAsNumber: true })}>
                                    <option value={1}>1</option>
                                    <option value={2}>2</option>
                                    <option value={3}>3</option>
                                    <option value={4}>4+</option>
                                </select>
                            </FieldGroup>
                        </div>

                        <FieldGroup label="Snacking between meals">
                            <select className={selectCls} {...register("snack_frequency")}>
                                <option value="no">No</option>
                                <option value="Sometimes">Sometimes</option>
                                <option value="Frequently">Frequently</option>
                            </select>
                        </FieldGroup>

                        <div className="grid grid-cols-2 gap-4">
                            <FieldGroup label="Water intake (L/day)">
                                <input type="number" className={inputCls} step={0.1} min={0} max={10} {...register("water_intake_liters", { valueAsNumber: true })} />
                            </FieldGroup>
                            <FieldGroup label="Activity (hrs/day)">
                                <input type="number" className={inputCls} step={0.5} min={0} max={24} {...register("physical_activity_hours", { valueAsNumber: true })} />
                            </FieldGroup>
                            <FieldGroup label="Screen time (hrs/day)">
                                <input type="number" className={inputCls} step={0.5} min={0} max={24} {...register("screentime_hours", { valueAsNumber: true })} />
                            </FieldGroup>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FieldGroup label="Smokes">
                                <select className={selectCls} {...register("smokes")}>
                                    <option value="no">No</option>
                                    <option value="yes">Yes</option>
                                </select>
                            </FieldGroup>
                            <FieldGroup label="Alcohol">
                                <select className={selectCls} {...register("alcohol_consumption")}>
                                    <option value="no">No</option>
                                    <option value="Sometimes">Sometimes</option>
                                    <option value="Frequently">Frequently</option>
                                </select>
                            </FieldGroup>
                        </div>

                        <FieldGroup label="Travel mode">
                            <select className={selectCls} {...register("travel_mode")}>
                                <option value="Public_Transportation">Public transport</option>
                                <option value="Walking">Walking</option>
                                <option value="Bike">Bike</option>
                                <option value="Car">Car</option>
                                <option value="Motorbike">Motorbike</option>
                            </select>
                        </FieldGroup>
                    </motion.form>
                )}
            </div>
        </div>
    );
}
