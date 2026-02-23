import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, MoveRight, ChevronLeft, CheckCircle2 } from "lucide-react";
import { profileApi, predictApi, type HealthProfilePayload } from "@/api/client";

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
    { title: "Basic Info", subtitle: "Tell us about yourself" },
    { title: "Diet & Habits", subtitle: "Your eating and lifestyle habits" },
    { title: "Activity & Lifestyle", subtitle: "How you move through the day" },
];

// ─── Default values ───────────────────────────────────────────────────────────
const DEFAULTS: HealthProfilePayload = {
    gender: "Female",
    age: 25,
    height_m: 1.65,
    weight_kg: 65,
    family_overweight_history: "no",
    high_calorie_food: "no",
    vegetable_intake_freq: 2,
    main_meals_per_day: 3,
    snack_frequency: "Sometimes",
    smokes: "no",
    water_intake_liters: 2,
    calorie_tracking: "no",
    physical_activity_hours: 0.5,
    screentime_hours: 4,
    alcohol_consumption: "no",
    travel_mode: "Public_Transportation",
};

// ─── Field components ─────────────────────────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
    return (
        <label className="block text-sm font-medium mb-1.5 text-foreground">
            {children}
        </label>
    );
}

function NumInput({
    label, value, unit, step = 0.1, min, max,
    onChange,
}: {
    label: string; value: number; unit?: string;
    step?: number; min?: number; max?: number;
    onChange: (v: number) => void;
}) {
    return (
        <div>
            <Label>
                {label}
                {unit && <span className="text-muted-foreground font-normal"> ({unit})</span>}
            </Label>
            <input
                type="number"
                step={step}
                min={min}
                max={max}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                className="w-full h-10 px-3 rounded-md text-sm bg-muted/40 border border-input outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
        </div>
    );
}

function SelectField<T extends string>({
    label, value, options, onChange,
}: {
    label: string; value: T;
    options: { value: T; label: string }[];
    onChange: (v: T) => void;
}) {
    return (
        <div>
            <Label>{label}</Label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value as T)}
                className="w-full h-10 px-3 rounded-md text-sm bg-muted/40 border border-input outline-none focus:ring-2 focus:ring-ring transition-colors appearance-none cursor-pointer"
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </div>
    );
}

// ─── Main onboarding page ─────────────────────────────────────────────────────
export default function OnboardingPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [data, setData] = useState<HealthProfilePayload>(DEFAULTS);
    const [serverError, setServerError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const set = <K extends keyof HealthProfilePayload>(key: K, val: HealthProfilePayload[K]) =>
        setData((prev) => ({ ...prev, [key]: val }));

    const goNext = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
    const goBack = () => setStep((s) => Math.max(s - 1, 0));

    const handleSubmit = async () => {
        setServerError(null);
        setIsSubmitting(true);
        try {
            // Try to create the profile; if it already exists (400), update instead
            try {
                await profileApi.create(data);
            } catch (createErr: unknown) {
                const e = createErr as { response?: { status?: number } };
                if (e?.response?.status === 400) {
                    await profileApi.update(data);
                } else {
                    throw createErr; // re-throw unexpected errors
                }
            }
            // Always run the ML prediction
            await predictApi.run();
            navigate("/dashboard/chat");
        } catch (err: unknown) {
            const e = err as { response?: { data?: { detail?: string } }; code?: string };
            if (e?.code === "ERR_NETWORK") {
                setServerError("Cannot reach the server. Please check your connection.");
            } else {
                setServerError(e?.response?.data?.detail ?? "Something went wrong. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-lg">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-8 justify-center">
                    <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
                        <Zap className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="text-lg font-semibold tracking-tight">Zentra</span>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-2 mb-8">
                    {STEPS.map((_s, i) => (
                        <div key={i} className="flex-1">
                            <div
                                className={`h-1 rounded-full transition-all duration-500 ${i <= step ? "bg-primary" : "bg-muted"}`}
                            />
                        </div>
                    ))}
                </div>

                {/* Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.25 }}
                        className="bg-card border border-border rounded-2xl p-8 shadow-sm"
                    >
                        {/* Step header */}
                        <div className="mb-6">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                                Step {step + 1} of {STEPS.length}
                            </p>
                            <h2 className="text-xl font-semibold tracking-tight">{STEPS[step].title}</h2>
                            <p className="text-sm text-muted-foreground mt-0.5">{STEPS[step].subtitle}</p>
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {serverError && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-5 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
                                >
                                    {serverError}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* ── Step 0: Basic Info ── */}
                        {step === 0 && (
                            <div className="space-y-4">
                                <SelectField
                                    label="Gender" value={data.gender}
                                    onChange={(v) => set("gender", v)}
                                    options={[{ value: "Female", label: "Female" }, { value: "Male", label: "Male" }]}
                                />
                                <NumInput label="Age" value={data.age} unit="years" step={1} min={5} max={120}
                                    onChange={(v) => set("age", v)} />
                                <div className="grid grid-cols-2 gap-4">
                                    <NumInput label="Height" value={data.height_m} unit="m" step={0.01} min={0.5} max={3}
                                        onChange={(v) => set("height_m", v)} />
                                    <NumInput label="Weight" value={data.weight_kg} unit="kg" step={0.1} min={10} max={500}
                                        onChange={(v) => set("weight_kg", v)} />
                                </div>
                                <SelectField
                                    label="Family history of overweight?" value={data.family_overweight_history}
                                    onChange={(v) => set("family_overweight_history", v)}
                                    options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]}
                                />
                            </div>
                        )}

                        {/* ── Step 1: Diet & Habits ── */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <SelectField
                                    label="Do you eat high-calorie foods often?" value={data.high_calorie_food}
                                    onChange={(v) => set("high_calorie_food", v)}
                                    options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]}
                                />
                                <SelectField
                                    label="Vegetable intake frequency" value={String(data.vegetable_intake_freq) as "1" | "2" | "3"}
                                    onChange={(v) => set("vegetable_intake_freq", Number(v))}
                                    options={[
                                        { value: "1", label: "Rarely" },
                                        { value: "2", label: "Sometimes" },
                                        { value: "3", label: "Always" },
                                    ]}
                                />
                                <SelectField
                                    label="Main meals per day" value={String(data.main_meals_per_day) as "1" | "2" | "3" | "4"}
                                    onChange={(v) => set("main_meals_per_day", Number(v))}
                                    options={[
                                        { value: "1", label: "1 meal" },
                                        { value: "2", label: "2 meals" },
                                        { value: "3", label: "3 meals" },
                                        { value: "4", label: "4+ meals" },
                                    ]}
                                />
                                <SelectField
                                    label="Snacking between meals" value={data.snack_frequency}
                                    onChange={(v) => set("snack_frequency", v)}
                                    options={[
                                        { value: "no", label: "No" },
                                        { value: "Sometimes", label: "Sometimes" },
                                        { value: "Frequently", label: "Frequently" },
                                    ]}
                                />
                                <NumInput label="Water intake" value={data.water_intake_liters} unit="litres/day"
                                    step={0.1} min={0} max={10} onChange={(v) => set("water_intake_liters", v)} />
                                <SelectField
                                    label="Do you track calories?" value={data.calorie_tracking}
                                    onChange={(v) => set("calorie_tracking", v)}
                                    options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]}
                                />
                            </div>
                        )}

                        {/* ── Step 2: Activity & Lifestyle ── */}
                        {step === 2 && (
                            <div className="space-y-4">
                                <NumInput label="Physical activity" value={data.physical_activity_hours}
                                    unit="hrs/day" step={0.5} min={0} max={24}
                                    onChange={(v) => set("physical_activity_hours", v)} />
                                <NumInput label="Screen time" value={data.screentime_hours}
                                    unit="hrs/day" step={0.5} min={0} max={24}
                                    onChange={(v) => set("screentime_hours", v)} />
                                <SelectField
                                    label="Do you smoke?" value={data.smokes}
                                    onChange={(v) => set("smokes", v)}
                                    options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]}
                                />
                                <SelectField
                                    label="Alcohol consumption" value={data.alcohol_consumption}
                                    onChange={(v) => set("alcohol_consumption", v)}
                                    options={[
                                        { value: "no", label: "No" },
                                        { value: "Sometimes", label: "Sometimes" },
                                        { value: "Frequently", label: "Frequently" },
                                    ]}
                                />
                                <SelectField
                                    label="Primary mode of travel" value={data.travel_mode}
                                    onChange={(v) => set("travel_mode", v)}
                                    options={[
                                        { value: "Public_Transportation", label: "Public transport" },
                                        { value: "Walking", label: "Walking" },
                                        { value: "Bike", label: "Bike" },
                                        { value: "Car", label: "Car" },
                                        { value: "Motorbike", label: "Motorbike" },
                                    ]}
                                />
                            </div>
                        )}

                        {/* Nav buttons */}
                        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                            {step > 0 ? (
                                <button
                                    onClick={goBack}
                                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </button>
                            ) : (
                                <div />
                            )}

                            {step < STEPS.length - 1 ? (
                                <button
                                    onClick={goNext}
                                    className="inline-flex items-center gap-2 h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                                >
                                    Continue <MoveRight className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="inline-flex items-center gap-2 h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                            Analysing…
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="w-4 h-4" /> Let's go!
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                <p className="text-center text-xs text-muted-foreground mt-6">
                    You can update this information later from your profile settings.
                </p>
            </div>
        </div>
    );
}
