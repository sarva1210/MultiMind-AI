import { useState } from "react";
import { LockKeyhole, Mail, Swords, UserRound, X } from "lucide-react";

export default function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const isRegister = mode === "register";

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("Form validated. Backend authentication will be connected next.");
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setMessage("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden bg-black/60 p-3 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        className="relative my-auto w-full max-w-md shrink-0 rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950 sm:p-7"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close authentication modal"
          className="absolute right-3 top-3 rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <X size={19} />
        </button>

        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <Swords size={23} />
          </div>

          <h2
            id="auth-title"
            className="text-2xl font-semibold text-zinc-900 dark:text-white"
          >
            {isRegister ? "Join the Arena" : "Welcome Back"}
          </h2>

          <p className="mt-2 text-sm leading-relaxed text-zinc-500">
            {isRegister
              ? "Create an account to save your AI battles."
              : "Sign in to continue your AI battles."}
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`rounded-lg py-2.5 text-sm font-medium transition ${
              !isRegister
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => switchMode("register")}
            className={`rounded-lg py-2.5 text-sm font-medium transition ${
              isRegister
                ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white"
                : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Full name
              </span>
              <div className="flex items-center gap-3 rounded-xl border border-zinc-200 px-3 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-zinc-800">
                <UserRound size={18} className="shrink-0 text-zinc-400" />
                <input
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full min-w-0 bg-transparent py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white"
                />
              </div>
            </label>
          )}

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email address
            </span>
            <div className="flex items-center gap-3 rounded-xl border border-zinc-200 px-3 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-zinc-800">
              <Mail size={18} className="shrink-0 text-zinc-400" />
              <input
                required
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full min-w-0 bg-transparent py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </span>
            <div className="flex items-center gap-3 rounded-xl border border-zinc-200 px-3 transition focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-zinc-800">
              <LockKeyhole size={18} className="shrink-0 text-zinc-400" />
              <input
                required
                type="password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                minLength={isRegister ? 8 : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isRegister ? "At least 8 characters" : "Enter password"}
                className="w-full min-w-0 bg-transparent py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-white"
              />
            </div>
          </label>

          {message && (
            <p
              role="status"
              className="rounded-lg bg-blue-50 p-3 text-sm leading-relaxed text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99]"
          >
            {isRegister ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs leading-relaxed text-zinc-500">
          Authentication is not connected yet. Your account will not be created
          until the backend API is integrated.
        </p>
      </div>
    </div>
  );
}