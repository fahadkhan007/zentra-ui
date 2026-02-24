import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    Zap, Plus, MessageSquare, Trash2, LogOut,
    Moon, Sun, Send, Bot,
    Menu, X, Pencil, Check,
    Activity, User,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useAuthStore } from "@/store/authStore";
import ResultsPage from "./ResultsPage";
import ProfilePage from "./ProfilePage";
import AccountPage from "./AccountPage";
import {
    chatApi,
    type ChatSessionSummary,
    type ChatMessage,
} from "@/api/client";

// ─── Dark mode hook ───────────────────────────────────────────────────────────
function useDarkMode() {
    const [dark, setDark] = useState<boolean>(() =>
        localStorage.getItem("theme") === "dark"
    );

    // Apply class on initial load
    useEffect(() => {
        document.documentElement.classList.toggle("dark", dark);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggle = () => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle("dark", next);
        localStorage.setItem("theme", next ? "dark" : "light");
    };
    return { dark, toggle };
}

// ─── Markdown renderer ────────────────────────────────────────────────────────
function MessageContent({ content, isUser }: { content: string; isUser: boolean }) {
    if (isUser) {
        return <p className="text-sm whitespace-pre-wrap leading-relaxed text-left">{content}</p>;
    }

    return (
        <div className="text-left">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // Paragraphs
                    p: ({ children }) => (
                        <p className="text-sm leading-relaxed mb-3 last:mb-0 text-left">{children}</p>
                    ),
                    // Headings — ChatGPT-style hierarchy
                    h1: ({ children }) => (
                        <h1 className="text-xl font-bold mt-5 mb-3 text-left text-foreground">{children}</h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-base font-bold mt-4 mb-2 text-left text-foreground">{children}</h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-sm font-semibold mt-3 mb-1.5 text-left text-foreground">{children}</h3>
                    ),
                    // Lists
                    ul: ({ children }) => (
                        <ul className="text-sm list-disc pl-5 space-y-1.5 mb-3 text-left">{children}</ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="text-sm list-decimal pl-5 space-y-1.5 mb-3 text-left">{children}</ol>
                    ),
                    li: ({ children }) => (
                        <li className="leading-relaxed text-left">{children}</li>
                    ),
                    // Inline formatting
                    strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">{children}</strong>
                    ),
                    em: ({ children }) => <em className="italic">{children}</em>,
                    // Code
                    code: ({ children, className }) => {
                        const isBlock = className?.includes("language-");
                        if (isBlock) {
                            return (
                                <pre className="bg-black/30 border border-border rounded-lg p-4 overflow-x-auto my-3 text-left">
                                    <code className="text-xs font-mono text-green-400">{children}</code>
                                </pre>
                            );
                        }
                        return (
                            <code className="bg-black/30 border border-border rounded px-1.5 py-0.5 text-xs font-mono text-green-400">
                                {children}
                            </code>
                        );
                    },
                    // Tables
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-4">
                            <table className="w-full text-sm border-collapse border border-border rounded-lg overflow-hidden text-left">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => (
                        <thead className="bg-muted text-foreground font-semibold">{children}</thead>
                    ),
                    tbody: ({ children }) => (
                        <tbody className="divide-y divide-border">{children}</tbody>
                    ),
                    tr: ({ children }) => (
                        <tr className="even:bg-muted/30 hover:bg-muted/50 transition-colors">{children}</tr>
                    ),
                    th: ({ children }) => (
                        <th className="px-4 py-2.5 text-left font-semibold border-b border-border text-foreground whitespace-nowrap">
                            {children}
                        </th>
                    ),
                    td: ({ children }) => (
                        <td className="px-4 py-2.5 text-left border-r border-border last:border-r-0">
                            {children}
                        </td>
                    ),
                    hr: () => <hr className="border-border my-4" />,
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary/50 pl-4 text-muted-foreground italic my-3 text-left">
                            {children}
                        </blockquote>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}

// ─── Typing indicator ─────────────────────────────────────────────────────────
function TypingDots() {
    return (
        <div className="flex items-center gap-1 h-5">
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-muted-foreground"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
            ))}
        </div>
    );
}

// ─── Session list item ────────────────────────────────────────────────────────
function SessionItem({
    session, active, onSelect, onDelete, onRename,
}: {
    session: ChatSessionSummary;
    active: boolean;
    onSelect: () => void;
    onDelete: () => void;
    onRename: (title: string) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(session.title);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editing) inputRef.current?.focus();
    }, [editing]);

    const commit = () => {
        const trimmed = draft.trim();
        if (trimmed && trimmed !== session.title) onRename(trimmed);
        setEditing(false);
    };

    return (
        <div
            onClick={onSelect}
            className={`group relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors
                ${active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
        >
            <MessageSquare className="w-4 h-4 shrink-0 opacity-60" />

            {editing ? (
                <input
                    ref={inputRef}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={commit}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") commit();
                        if (e.key === "Escape") setEditing(false);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="flex-1 bg-transparent text-sm outline-none border-b border-primary"
                />
            ) : (
                <span className="flex-1 text-sm truncate">{session.title}</span>
            )}

            <div
                className="absolute right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
            >
                {editing ? (
                    <button onClick={commit} className="p-1 rounded hover:bg-muted">
                        <Check className="w-3.5 h-3.5" />
                    </button>
                ) : (
                    <button onClick={() => setEditing(true)} className="p-1 rounded hover:bg-muted">
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                )}
                <button
                    onClick={onDelete}
                    className="p-1 rounded hover:bg-destructive/20 hover:text-destructive"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onCreate }: { onCreate: () => void }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 text-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center"
            >
                <Bot className="w-8 h-8 text-primary" />
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <h2 className="text-lg font-semibold mb-1">Your AI Health Assistant</h2>
                <p className="text-sm text-muted-foreground max-w-xs">
                    Powered by WHO data and personalised to your health profile.
                    Ask anything about nutrition, fitness, or wellness.
                </p>
            </motion.div>
            <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={onCreate}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
                <Plus className="w-4 h-4" /> New chat
            </motion.button>
        </div>
    );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
type ActiveView = "chat" | "results" | "profile" | "account";

export default function DashboardPage() {
    const navigate = useNavigate();
    const { logout, user } = useAuthStore();
    const { dark, toggle } = useDarkMode();

    const [activeView, setActiveView] = useState<ActiveView>("chat");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [loadingSession, setLoadingSession] = useState(false);
    const [sessionsLoaded, setSessionsLoaded] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Load sessions on mount, then restore last active session
    useEffect(() => {
        chatApi.listSessions().then((res) => {
            const fetched = res.data.sessions;
            setSessions(fetched);
            setSessionsLoaded(true);
            // Restore last active session from localStorage
            const saved = localStorage.getItem("zentra_active_session");
            if (saved && fetched.find((s) => s.id === saved)) {
                loadSession(saved);
            }
        }).catch(() => setSessionsLoaded(true));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, sending]);

    const adjustTextarea = () => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = "auto";
        ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
    };

    const loadSession = async (sessionId: string) => {
        setActiveSessionId(sessionId);
        localStorage.setItem("zentra_active_session", sessionId);
        setMessages([]);
        setLoadingSession(true);
        setSidebarOpen(false);
        try {
            const res = await chatApi.getSession(sessionId);
            setMessages(res.data.messages);
        } finally {
            setLoadingSession(false);
        }
    };

    const createSession = async () => {
        try {
            const res = await chatApi.createSession();
            const newSession = res.data;
            setSessions((prev) => [newSession, ...prev]);
            setActiveSessionId(newSession.id);
            localStorage.setItem("zentra_active_session", newSession.id);
            setMessages([]);
            setSidebarOpen(false);
        } catch { /* ignore */ }
    };

    const deleteSession = async (sessionId: string) => {
        try {
            await chatApi.deleteSession(sessionId);
            setSessions((prev) => prev.filter((s) => s.id !== sessionId));
            if (activeSessionId === sessionId) {
                setActiveSessionId(null);
                setMessages([]);
                localStorage.removeItem("zentra_active_session");
            }
        } catch { /* ignore */ }
    };

    const renameSession = async (sessionId: string, title: string) => {
        try {
            await chatApi.renameSession(sessionId, title);
            setSessions((prev) =>
                prev.map((s) => (s.id === sessionId ? { ...s, title } : s))
            );
        } catch { /* ignore */ }
    };

    const sendMessage = async () => {
        const text = input.trim();
        if (!text || !activeSessionId || sending) return;

        const userMsg: ChatMessage = {
            id: Date.now(),
            role: "user",
            content: text,
            created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setSending(true);
        if (textareaRef.current) textareaRef.current.style.height = "auto";

        try {
            const res = await chatApi.sendMessage(activeSessionId, text);
            const aiMsg = res.data.message;
            setMessages((prev) => [...prev, aiMsg]);

            // Auto-rename session after first message
            const session = sessions.find((s) => s.id === activeSessionId);
            if (session?.title === "New Chat") {
                const autoTitle = text.slice(0, 40) + (text.length > 40 ? "…" : "");
                renameSession(activeSessionId, autoTitle);
            }

            setSessions((prev) =>
                prev.map((s) =>
                    s.id === activeSessionId
                        ? { ...s, message_count: s.message_count + 2, updated_at: new Date().toISOString() }
                        : s
                )
            );
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: Date.now() + 1,
                    role: "assistant" as const,
                    content: "Sorry, I couldn't reach the server. Please try again.",
                    created_at: new Date().toISOString(),
                },
            ]);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const activeSession = sessions.find((s) => s.id === activeSessionId);

    return (
        <div className="flex h-screen bg-background overflow-hidden text-foreground">

            {/* Mobile overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* ── SIDEBAR ─────────────────────────────────────────────────── */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 z-40 flex flex-col
                    bg-background border-r border-border
                    transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0 lg:static lg:z-auto`}
            >
                {/* Logo */}
                <div className="flex items-center justify-between px-4 h-14 border-b border-border shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                            <Zap className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <span className="font-semibold text-sm tracking-tight">Zentra</span>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden text-muted-foreground hover:text-foreground"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* New chat */}
                <div className="px-3 pt-3 pb-1 shrink-0">
                    <button
                        onClick={() => { createSession(); setActiveView("chat"); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium
                            border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        New chat
                    </button>
                </div>

                {/* Session list */}
                <div className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
                    {!sessionsLoaded ? (
                        <div className="flex items-center justify-center py-8">
                            <span className="w-5 h-5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
                        </div>
                    ) : sessions.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-6 px-2">
                            No chats yet. Start a new one!
                        </p>
                    ) : (
                        sessions.map((session) => (
                            <SessionItem
                                key={session.id}
                                session={session}
                                active={session.id === activeSessionId}
                                onSelect={() => { loadSession(session.id); setActiveView("chat"); }}
                                onDelete={() => deleteSession(session.id)}
                                onRename={(title) => renameSession(session.id, title)}
                            />
                        ))
                    )}
                </div>

                {/* Health Metrics nav */}
                <div className="px-2 pb-2 border-t border-border pt-3 shrink-0 space-y-0.5">
                    <p className="text-[10px] text-muted-foreground/60 px-3 pb-1 font-semibold uppercase tracking-widest">
                        Health Metrics
                    </p>
                    <button
                        onClick={() => { setActiveView("results"); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
                            ${activeView === "results"
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
                    >
                        <Activity className="w-4 h-4" />
                        My Results
                    </button>
                    <button
                        onClick={() => { setActiveView("profile"); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
                            ${activeView === "profile"
                                ? "bg-muted text-foreground"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}
                    >
                        <User className="w-4 h-4" />
                        Health Profile
                    </button>
                </div>

                {/* Bottom controls */}
                <div className="px-3 py-3 border-t border-border shrink-0 space-y-1">
                    {/* User avatar card */}
                    {user && (
                        <button
                            onClick={() => { setActiveView("account"); setSidebarOpen(false); }}
                            className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition-colors
                                ${activeView === "account"
                                    ? "bg-muted"
                                    : "hover:bg-muted/60"}`}
                        >
                            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-primary">
                                    {(user.name ?? user.email).slice(0, 2).toUpperCase()}
                                </span>
                            </div>
                            <div className="text-left min-w-0">
                                {user.name && <p className="text-xs font-medium truncate">{user.name}</p>}
                                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                            </div>
                        </button>
                    )}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={toggle}
                            className="flex-1 flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm
                                text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                        >
                            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            <span className="text-xs">{dark ? "Light" : "Dark"}</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm
                                text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Log out"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>

            {/* ── MAIN AREA ───────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Top bar */}
                <header className="h-14 flex items-center px-4 border-b border-border shrink-0 gap-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <span className="text-sm font-medium truncate">
                        {activeView === "results" ? "My Results"
                            : activeView === "profile" ? "Health Profile"
                                : activeView === "account" ? "My Profile"
                                    : (activeSession?.title ?? "Zentra AI")}
                    </span>
                </header>

                {/* Non-chat views */}
                {activeView === "results" && <ResultsPage />}
                {activeView === "profile" && <ProfilePage />}
                {activeView === "account" && <AccountPage />}

                {/* Chat view */}
                <div className={`flex-1 overflow-y-auto ${activeView !== "chat" ? "hidden" : ""}`}>
                    {!activeSessionId ? (
                        <EmptyState onCreate={createSession} />
                    ) : loadingSession ? (
                        <div className="flex items-center justify-center h-full">
                            <span className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
                            <Bot className="w-10 h-10 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">
                                Send a message to start the conversation!
                            </p>
                        </div>
                    ) : (
                        <div className="w-full max-w-5xl mx-auto px-3 sm:px-6 py-6 space-y-8">
                            <AnimatePresence initial={false}>
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {msg.role === "user" ? (
                                            /* ── User message: compact right-aligned bubble ── */
                                            <div className="flex justify-end">
                                                <div className="max-w-[80%] bg-muted text-foreground px-4 py-2.5 rounded-2xl rounded-br-sm text-sm leading-relaxed">
                                                    <MessageContent content={msg.content} isUser={true} />
                                                </div>
                                            </div>
                                        ) : (
                                            /* ── AI message: full-width, no bubble, left-aligned ── */
                                            <div className="flex gap-3 items-start">
                                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Bot className="w-4 h-4 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0 text-foreground">
                                                    <MessageContent content={msg.content} isUser={false} />
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}

                                {/* Typing indicator */}
                                {sending && (
                                    <motion.div
                                        key="typing"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex gap-3 items-start"
                                    >
                                        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                            <Bot className="w-4 h-4 text-primary" />
                                        </div>
                                        <div className="pt-1.5">
                                            <TypingDots />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div ref={bottomRef} />
                        </div>
                    )}
                </div>

                {/* Input bar — only visible in chat view */}
                {activeView === "chat" && <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-border shrink-0">
                    <div className="w-full max-w-5xl mx-auto">
                        <div
                            className={`flex items-end gap-3 bg-muted/50 border rounded-2xl px-4 py-3 transition-all
                                ${activeSessionId
                                    ? "border-border focus-within:border-primary/50"
                                    : "border-border opacity-50"
                                }`}
                        >
                            <textarea
                                ref={textareaRef}
                                rows={1}
                                value={input}
                                onChange={(e) => { setInput(e.target.value); adjustTextarea(); }}
                                onKeyDown={handleKeyDown}
                                disabled={!activeSessionId || sending}
                                placeholder={
                                    activeSessionId
                                        ? "Ask about your health, diet, fitness…"
                                        : "Start a new chat to begin"
                                }
                                className="flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-muted-foreground max-h-40"
                                style={{ height: "24px" }}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || !activeSessionId || sending}
                                className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center
                                    text-primary-foreground hover:bg-primary/90 transition-colors
                                    disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-xs text-muted-foreground text-center mt-2">
                            Zentra may make mistakes. Verify important health information with a professional.
                        </p>
                    </div>
                </div>}
            </div>
        </div>
    );
}
