"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const demoUsers = [
  { role: "Admin", email: "admin@halfstep.in", password: "admin123" },
  { role: "Department Officer", email: "amit@halfstep.in", password: "admin123" },
  { role: "Field Inspector", email: "rajesh@halfstep.in", password: "inspector123" },
  { role: "Citizen", email: "citizen@halfstep.in", password: "citizen123" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fillDemoUser = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-10">
      <div className="w-full max-w-5xl grid gap-8 lg:grid-cols-[1.2fr_0.9fr]">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
              Role-based access enabled
            </p>
            <h2 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">
              Sign in by role
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400">
              Use the correct account for admin, department officer, field inspector, or citizen access.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {demoUsers.map((demoUser) => (
              <button
                key={demoUser.email}
                type="button"
                onClick={() => fillDemoUser(demoUser.email, demoUser.password)}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 text-left hover:border-blue-400 hover:bg-blue-50/60 dark:hover:bg-blue-900/10 transition-colors"
              >
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {demoUser.role}
                </p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {demoUser.email}
                </p>
                <p className="text-xs text-zinc-500 mt-2">Click to autofill credentials</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">
              Half-Step India
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Infrastructure Monitoring System
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                placeholder="role@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <div className="space-y-2 text-xs text-zinc-500 dark:text-zinc-500">
              {demoUsers.map((demoUser) => (
                <p key={demoUser.email}>
                  {demoUser.role}: {demoUser.email} / {demoUser.password}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
