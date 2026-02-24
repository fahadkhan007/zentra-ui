import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, AlertCircle, Scale, Footprints, Droplets, TrendingUp } from "lucide-react";
import { predictApi, profileApi, type ProfileResponse } from "@/api/client";

// ─── Level config ─────────────────────────────────────────────────────────────
const LEVELS = [
    { key: "Insufficient_Weight", label: "Underweight", short: "Underweight", color: "#60a5fa", gaugePos: 0 },
    { key: "Normal_Weight", label: "Normal Weight", short: "Normal", color: "#4ade80", gaugePos: 14.3 },
    { key: "Overweight_Level_I", label: "Overweight I", short: "OW I", color: "#a3e635", gaugePos: 28.6 },
    { key: "Overweight_Level_II", label: "Overweight II", short: "OW II", color: "#facc15", gaugePos: 42.9 },
    { key: "Obesity_Type_I", label: "Obesity Type I", short: "Obese I", color: "#fb923c", gaugePos: 57.1 },
    { key: "Obesity_Type_II", label: "Obesity Type II", short: "Obese II", color: "#f87171", gaugePos: 71.4 },
    { key: "Obesity_Type_III", label: "Obesity Type III", short: "Obese III", color: "#dc2626", gaugePos: 85.7 },
];

function getLevelConfig(raw: string) {
    return LEVELS.find((l) => l.key === raw) ?? {
        key: raw, label: raw.replace(/_/g, " "), short: raw, color: "#94a3b8", gaugePos: 50,
    };
}

// ─── Premium Speedometer ──────────────────────────────────────────────────────
function Speedometer({ percent, color, label }: { percent: number; color: string; label: string }) {
    const W = 320, H = 220;
    const cx = W / 2, cy = 165;
    const R = 110;
    const toRad = (d: number) => (d * Math.PI) / 180;

    // Arc runs from -210° to 30° (240° sweep) starting from bottom-left
    const START = -210;
    const SWEEP = 240;

    const arcPt = (angleDeg: number, r: number) => ({
        x: cx + r * Math.cos(toRad(angleDeg)),
        y: cy + r * Math.sin(toRad(angleDeg)),
    });

    // Build 7 segment paths
    const SEG = SWEEP / LEVELS.length;
    const segColors = LEVELS.map((l) => l.color);



    // Needle angle
    const needleAngle = START + (percent / 100) * SWEEP;
    const needleTip = arcPt(needleAngle, R - 14);
    const needleBase1 = arcPt(needleAngle + 90, 8);
    const needleBase2 = arcPt(needleAngle - 90, 8);

    // Which segment is active?
    const activeIdx = LEVELS.findIndex((l) => l.color === color);

    return (
        <div className="relative flex flex-col items-center">
            {/* Radial glow behind gauge */}
            <div
                className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700"
                style={{ backgroundColor: color }}
            />

            <svg viewBox={`0 0 ${W} ${H}`} className="w-80 h-56 select-none relative z-10">
                <defs>
                    {/* Needle glow filter */}
                    <filter id="needleGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <filter id="segGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* ── Track (grey background arc) */}
                {LEVELS.map((_, i) => {
                    const a0 = START + i * SEG;
                    const a1 = START + (i + 1) * SEG - 1.5; // small gap
                    const s = arcPt(a0, R);
                    const e = arcPt(a1, R);
                    return (
                        <path
                            key={`track-${i}`}
                            d={`M ${s.x} ${s.y} A ${R} ${R} 0 0 1 ${e.x} ${e.y}`}
                            fill="none"
                            stroke="white"
                            strokeOpacity={0.06}
                            strokeWidth={14}
                            strokeLinecap="butt"
                        />
                    );
                })}

                {/* ── Coloured segments */}
                {segColors.map((c, i) => {
                    const a0 = START + i * SEG;
                    const a1 = START + (i + 1) * SEG - 1.5;
                    const s = arcPt(a0, R);
                    const e = arcPt(a1, R);
                    const isActive = i === activeIdx;
                    return (
                        <path
                            key={`seg-${i}`}
                            d={`M ${s.x} ${s.y} A ${R} ${R} 0 0 1 ${e.x} ${e.y}`}
                            fill="none"
                            stroke={c}
                            strokeWidth={isActive ? 16 : 10}
                            strokeLinecap="butt"
                            opacity={isActive ? 1 : 0.28}
                            filter={isActive ? "url(#segGlow)" : undefined}
                            style={{ transition: "all 0.6s ease" }}
                        />
                    );
                })}

                {/* ── Tick marks at segment boundaries */}
                {LEVELS.map((_, i) => {
                    const a = START + i * SEG;
                    const inner = arcPt(a, R - 22);
                    const outer = arcPt(a, R + 4);
                    return (
                        <line
                            key={`tick-${i}`}
                            x1={inner.x} y1={inner.y}
                            x2={outer.x} y2={outer.y}
                            stroke="white"
                            strokeOpacity={0.2}
                            strokeWidth={1.5}
                        />
                    );
                })}

                {/* ── Short label at start and end */}
                {(() => {
                    const startPt = arcPt(START - 8, R - 30);
                    const endPt = arcPt(START + SWEEP + 8, R - 30);
                    return (
                        <>
                            <text x={startPt.x} y={startPt.y} fontSize={9} fill="white" fillOpacity={0.35} textAnchor="middle">Under</text>
                            <text x={endPt.x} y={endPt.y} fontSize={9} fill="white" fillOpacity={0.35} textAnchor="middle">Obese III</text>
                        </>
                    );
                })()}

                {/* ── Needle (animated, tapered polygon) */}
                <motion.polygon
                    points={`${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y} ${needleTip.x},${needleTip.y}`}
                    fill={color}
                    filter="url(#needleGlow)"
                    initial={false}
                    animate={{ rotate: 0 }}
                    style={{
                        transformOrigin: `${needleBase1.x}px ${needleBase1.y}px`,
                    }}
                />

                {/* Animated needle as a rotating line from centre */}
                <motion.g
                    initial={{ rotate: START, originX: `${cx}px`, originY: `${cy}px` }}
                    animate={{ rotate: needleAngle, originX: `${cx}px`, originY: `${cy}px` }}
                    transition={{ type: "spring", stiffness: 55, damping: 18, delay: 0.4 }}
                >
                    {/* Needle shaft */}
                    <line
                        x1={cx} y1={cy}
                        x2={cx + (R - 18)} y2={cy}
                        stroke={color}
                        strokeWidth={2.5}
                        strokeLinecap="round"
                        filter="url(#needleGlow)"
                        opacity={0.9}
                    />
                    {/* Needle tip dot */}
                    <circle cx={cx + (R - 18)} cy={cy} r={4} fill={color} filter="url(#needleGlow)" />
                </motion.g>

                {/* ── Centre hub */}
                {/* outer ring */}
                <circle cx={cx} cy={cy} r={16} fill="none" stroke={color} strokeWidth={1.5} opacity={0.4} />
                {/* inner fill */}
                <circle cx={cx} cy={cy} r={12} fill="#1a1a1a" />
                <circle cx={cx} cy={cy} r={12} fill={color} fillOpacity={0.15} />
                {/* centre dot */}
                <circle cx={cx} cy={cy} r={5} fill={color} />
                <circle cx={cx} cy={cy} r={2.5} fill="white" fillOpacity={0.7} />
            </svg>

            {/* Result label below the gauge */}
            <motion.div
                key={label}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-col items-center gap-1 -mt-4"
            >
                <span className="text-3xl font-bold tracking-tight" style={{ color }}>
                    {label}
                </span>
                <span className="text-xs text-muted-foreground/60 tracking-widest uppercase">
                    obesity risk level
                </span>
            </motion.div>
        </div>
    );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, unit, color }: {
    icon: React.ElementType; label: string; value: string | number; unit?: string; color?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3.5"
        >
            {/* Subtle left accent */}
            <div
                className="absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl"
                style={{ backgroundColor: color ?? "rgba(255,255,255,0.15)" }}
            />
            <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: color ? `${color}18` : "rgba(255,255,255,0.06)" }}
            >
                <Icon className="w-4 h-4" style={{ color: color ?? "currentColor" }} />
            </div>
            <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold">
                    {value}
                    {unit && <span className="text-muted-foreground font-normal ml-1 text-xs">{unit}</span>}
                </p>
            </div>
        </motion.div>
    );
}

// ─── Advice map ───────────────────────────────────────────────────────────────
const ADVICE: Record<string, string> = {
    Insufficient_Weight: "Your weight is below the healthy range. Consider calorie-dense, nutrient-rich foods and consult a registered dietitian.",
    Normal_Weight: "You're in a healthy weight range. Keep up your balanced diet and consistent activity — you're doing great.",
    Overweight_Level_I: "You're slightly above a healthy range. Small changes — more daily movement and fewer ultra-processed foods — make a meaningful difference.",
    Overweight_Level_II: "Consider increasing physical activity and reducing high-calorie foods. A consultation with a healthcare provider is recommended.",
    Obesity_Type_I: "Your results suggest Obesity Type I. Working with a professional on a structured diet and exercise plan is strongly recommended.",
    Obesity_Type_II: "Please seek guidance from a medical professional for a personalised weight management plan tailored to your situation.",
    Obesity_Type_III: "Your results indicate severe obesity. Immediate consultation with a healthcare professional is strongly advised.",
};

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ResultsPage() {
    const [obesityLevel, setObesityLevel] = useState<string | null>(null);
    const [profile, setProfile] = useState<ProfileResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [rerunning, setRerunning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async (isRerun = false) => {
        if (isRerun) setRerunning(true);
        else setLoading(true);
        setError(null);
        try {
            const [predRes, profRes] = await Promise.all([
                predictApi.run(),
                profileApi.get(),
            ]);
            setObesityLevel(predRes.data.obesity_level);
            setProfile(profRes.data);
        } catch {
            setError("Unable to fetch your results. Please try again.");
        } finally {
            setLoading(false);
            setRerunning(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const cfg = obesityLevel ? getLevelConfig(obesityLevel) : null;
    const bmi = profile
        ? (profile.weight_kg / (profile.height_m ** 2)).toFixed(1)
        : null;

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="w-full max-w-xl mx-auto px-4 sm:px-6 py-8 space-y-5">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
                    <h1 className="text-xl font-semibold">Health Analysis</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        ML-powered results based on your health profile
                    </p>
                </motion.div>

                {/* Error */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm"
                        >
                            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        <p className="text-sm text-muted-foreground">Running health analysis…</p>
                    </div>
                )}

                {/* ── Results ── */}
                {!loading && cfg && (
                    <>
                        {/* Gauge card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="relative overflow-hidden bg-card border border-border rounded-2xl p-6 flex flex-col items-center"
                        >
                            {/* Subtle card glow */}
                            <div
                                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                                style={{
                                    background: `radial-gradient(ellipse at 50% 60%, ${cfg.color}, transparent 70%)`,
                                }}
                            />
                            <Speedometer percent={cfg.gaugePos} color={cfg.color} label={cfg.label} />
                        </motion.div>

                        {/* Advice card */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                            className="bg-card border border-border rounded-2xl p-5"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />
                                <p className="text-sm font-medium">What this means</p>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {ADVICE[cfg.key] ?? "Consult a healthcare professional for personalised advice."}
                            </p>
                        </motion.div>

                        {/* Stats grid */}
                        {profile && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                            >
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3 px-0.5">
                                    Your Stats
                                </p>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <StatCard icon={Scale} label="BMI" value={bmi ?? "—"} unit="kg/m²" color={cfg.color} />
                                    <StatCard icon={TrendingUp} label="Weight" value={profile.weight_kg} unit="kg" color={cfg.color} />
                                    <StatCard icon={Footprints} label="Daily Activity" value={profile.physical_activity_hours} unit="hrs" color={cfg.color} />
                                    <StatCard icon={Droplets} label="Water Intake" value={profile.water_intake_liters} unit="L/day" color={cfg.color} />
                                </div>
                            </motion.div>
                        )}

                        {/* Re-run */}
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                            className="flex justify-center pb-4"
                        >
                            <button
                                onClick={() => fetchData(true)}
                                disabled={rerunning}
                                className="inline-flex items-center gap-2 h-9 px-5 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                            >
                                <RefreshCw className={`w-3.5 h-3.5 ${rerunning ? "animate-spin" : ""}`} />
                                {rerunning ? "Analysing…" : "Re-run Analysis"}
                            </button>
                        </motion.div>
                    </>
                )}
            </div>
        </div>
    );
}
