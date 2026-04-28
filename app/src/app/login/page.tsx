"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const heroHeading = "Shaping tomorrow\nwith vision and action.";
const charDelay = 30;
const initialDelay = 200;

function FadeIn({
  children,
  delay,
  duration,
  className = "",
}: {
  children: React.ReactNode;
  delay: number;
  duration: number;
  className?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), delay);
    return () => window.clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`transition-opacity ${className}`}
      style={{
        opacity: visible ? 1 : 0,
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

function AnimatedHeading({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  const lines = text.split("\n");

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), initialDelay);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="text-4xl font-normal leading-none text-white md:text-5xl lg:text-6xl xl:text-7xl">
      {lines.map((line, lineIndex) => (
        <div key={`${line}-${lineIndex}`} style={{ letterSpacing: "-0.04em" }}>
          {line.split("").map((char, charIndex) => {
            const delay =
              initialDelay + lineIndex * line.length * charDelay + charIndex * charDelay;
            return (
              <span
                key={`${lineIndex}-${charIndex}-${char}`}
                className="inline-block"
                style={{
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateX(0)" : "translateX(-18px)",
                  transitionProperty: "opacity, transform",
                  transitionDuration: "500ms",
                  transitionDelay: `${delay}ms`,
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}

type AuthMode = "login" | "signup";
type AuthAction = "login" | "signup" | "demo" | "google" | null;

type LoginFormState = {
  email: string;
  password: string;
};

type SignupFormState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type LoginErrors = Partial<Record<keyof LoginFormState, string>>;
type SignupErrors = Partial<Record<keyof SignupFormState, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLoginForm(form: LoginFormState) {
  const errors: LoginErrors = {};

  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!form.password) {
    errors.password = "Password is required.";
  }

  return errors;
}

function validateSignupForm(form: SignupFormState) {
  const errors: SignupErrors = {};

  if (!form.name.trim()) {
    errors.name = "Full name is required.";
  }

  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!emailPattern.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!form.password) {
    errors.password = "Password is required.";
  } else if (form.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = "Confirm your password.";
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

function getInputClass(hasError: boolean) {
  return `w-full rounded-xl border px-4 py-3 text-white placeholder:text-gray-400 focus:outline-none ${
    hasError
      ? "border-red-300/80 bg-red-950/25 focus:border-red-200"
      : "border-white/20 bg-black/25 focus:border-white/35"
  }`;
}

export default function LoginPage() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [activeAction, setActiveAction] = useState<AuthAction>(null);
  const [isGoogleAvailable, setIsGoogleAvailable] = useState(
    process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true"
  );
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });
  const [loginErrors, setLoginErrors] = useState<LoginErrors>({});
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [signupErrors, setSignupErrors] = useState<SignupErrors>({});
  const router = useRouter();
  const isBusy = activeAction !== null;

  useEffect(() => {
    let cancelled = false;

    async function loadProviders() {
      try {
        const providers = await getProviders();
        if (!cancelled) {
          setIsGoogleAvailable(Boolean(providers?.google));
        }
      } catch {
        if (!cancelled) {
          setIsGoogleAvailable(false);
        }
      }
    }

    loadProviders();

    return () => {
      cancelled = true;
    };
  }, []);

  const updateLoginForm = (field: keyof LoginFormState, value: string) => {
    const nextForm = { ...loginForm, [field]: value };
    setLoginForm(nextForm);
    setLoginErrors(validateLoginForm(nextForm));
    setError("");
  };

  const updateSignupForm = (field: keyof SignupFormState, value: string) => {
    const nextForm = { ...signupForm, [field]: value };
    setSignupForm(nextForm);
    setSignupErrors(validateSignupForm(nextForm));
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validateLoginForm(loginForm);
    setLoginErrors(nextErrors);
    setError("");
    setSuccess("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setActiveAction("login");

    try {
      const result = await signIn("credentials", {
        email: loginForm.email.trim(),
        password: loginForm.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to sign in right now.");
    } finally {
      setActiveAction(null);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors = validateSignupForm(signupForm);
    setSignupErrors(nextErrors);
    setError("");
    setSuccess("");

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setActiveAction("signup");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupForm.name.trim(),
          email: signupForm.email.trim(),
          password: signupForm.password,
        }),
      });

      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setError(data.error || "Unable to create account.");
        return;
      }

      const loginResult = await signIn("credentials", {
        email: signupForm.email,
        password: signupForm.password,
        redirect: false,
      });

      if (loginResult?.error) {
        setSuccess("Account created. Please sign in.");
        setMode("login");
        setLoginForm({ email: signupForm.email, password: "" });
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to create account right now.");
    } finally {
      setActiveAction(null);
    }
  };

  const handleDemoSignIn = async () => {
    setActiveAction("demo");
    setError("");
    setSuccess("");

    try {
      const result = await signIn("credentials", {
        email: "admin@halfstep.in",
        password: "admin123",
        redirect: false,
      });

      if (result?.error) {
        setError("Unable to sign in with the demo account.");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Unable to complete sign in right now.");
    } finally {
      setActiveAction(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setActiveAction("google");
    setError("");
    setSuccess("");

    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      setError("Unable to start Google sign in right now.");
      setActiveAction(null);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260403_050628_c4e32401-fab4-4a27-b7a8-6e9291cd5959.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      <div className="relative z-10 min-h-screen">
        <div className="px-6 pt-6 md:px-12 lg:px-16">
          <nav className="liquid-glass flex items-center justify-between rounded-xl px-4 py-2">
            <div className="text-2xl font-semibold tracking-tight text-white">VEX</div>
            <div className="hidden items-center gap-8 text-sm text-white md:flex">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`transition-colors hover:text-gray-300 ${mode === "login" ? "text-white" : "text-gray-300"}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`transition-colors hover:text-gray-300 ${mode === "signup" ? "text-white" : "text-gray-300"}`}
              >
                Sign Up
              </button>
            </div>
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={isBusy}
              className="rounded-lg bg-white px-6 py-2 text-sm font-medium text-black transition-colors hover:bg-gray-100 disabled:bg-gray-200"
            >
              {activeAction === "demo" ? "Loading..." : "Demo Login"}
            </button>
          </nav>
        </div>

        <div className="flex-1 px-6 pb-12 pt-10 md:px-12 lg:flex lg:flex-col lg:justify-end lg:px-16 lg:pb-16">
          <div className="flex min-h-[calc(100vh-8rem)] flex-col justify-end">
            <div className="lg:grid lg:grid-cols-2 lg:items-end">
              <div>
                <AnimatedHeading text={heroHeading} />

                <FadeIn delay={800} duration={1000}>
                  <p className="mb-5 mt-5 max-w-xl text-base text-gray-300 md:text-lg">
                    Access your dashboard or create a new account to start reporting and tracking assets.
                  </p>
                </FadeIn>
              </div>

              <div className="mt-10 flex items-end justify-start lg:mt-0 lg:justify-end">
                <FadeIn delay={900} duration={1000} className="w-full max-w-md">
                  <div className="liquid-glass rounded-2xl border border-white/20 p-6 md:p-7">
                    <div className="mb-5 flex rounded-xl border border-white/15 bg-black/20 p-1">
                      <button
                        type="button"
                        onClick={() => {
                          setMode("login");
                          setError("");
                          setSuccess("");
                        }}
                        className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                          mode === "login" ? "bg-white text-black" : "text-white hover:text-gray-300"
                        }`}
                      >
                        Login
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMode("signup");
                          setError("");
                          setSuccess("");
                        }}
                        className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                          mode === "signup" ? "bg-white text-black" : "text-white hover:text-gray-300"
                        }`}
                      >
                        Sign Up
                      </button>
                    </div>

                    {mode === "login" ? (
                      <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm text-gray-300">Email</label>
                          <input
                            type="email"
                            value={loginForm.email}
                            onChange={(e) => updateLoginForm("email", e.target.value)}
                            required
                            aria-invalid={Boolean(loginErrors.email)}
                            className={getInputClass(Boolean(loginErrors.email))}
                            placeholder="you@example.com"
                          />
                          {loginErrors.email ? (
                            <p className="mt-2 text-sm text-red-200">{loginErrors.email}</p>
                          ) : null}
                        </div>
                        <div>
                          <label className="mb-2 block text-sm text-gray-300">Password</label>
                          <input
                            type="password"
                            value={loginForm.password}
                            onChange={(e) => updateLoginForm("password", e.target.value)}
                            required
                            aria-invalid={Boolean(loginErrors.password)}
                            className={getInputClass(Boolean(loginErrors.password))}
                            placeholder="Enter your password"
                          />
                          {loginErrors.password ? (
                            <p className="mt-2 text-sm text-red-200">{loginErrors.password}</p>
                          ) : null}
                        </div>
                        <button
                          type="submit"
                          disabled={isBusy}
                          className="w-full rounded-lg bg-white px-8 py-3 font-medium text-black transition-colors hover:bg-gray-100 disabled:bg-gray-200"
                        >
                          {activeAction === "login" ? "Signing in..." : "Login"}
                        </button>
                        {isGoogleAvailable ? (
                          <>
                            <div className="flex items-center gap-3 py-1 text-xs uppercase tracking-[0.24em] text-gray-400">
                              <span className="h-px flex-1 bg-white/10" />
                              Or continue with
                              <span className="h-px flex-1 bg-white/10" />
                            </div>
                            <button
                              type="button"
                              onClick={handleGoogleSignIn}
                              disabled={isBusy}
                              className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/20 bg-black/20 px-8 py-3 font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-60"
                            >
                              <span className="text-base">G</span>
                              {activeAction === "google" ? "Redirecting..." : "Continue with Google"}
                            </button>
                          </>
                        ) : (
                          <p className="text-sm text-gray-400">
                            Google sign-in will appear once both Google OAuth keys are configured.
                          </p>
                        )}
                      </form>
                    ) : (
                      <form onSubmit={handleSignup} className="space-y-4">
                        <div>
                          <label className="mb-2 block text-sm text-gray-300">Full Name</label>
                          <input
                            type="text"
                            value={signupForm.name}
                            onChange={(e) => updateSignupForm("name", e.target.value)}
                            required
                            aria-invalid={Boolean(signupErrors.name)}
                            className={getInputClass(Boolean(signupErrors.name))}
                            placeholder="Your name"
                          />
                          {signupErrors.name ? (
                            <p className="mt-2 text-sm text-red-200">{signupErrors.name}</p>
                          ) : null}
                        </div>
                        <div>
                          <label className="mb-2 block text-sm text-gray-300">Email</label>
                          <input
                            type="email"
                            value={signupForm.email}
                            onChange={(e) => updateSignupForm("email", e.target.value)}
                            required
                            aria-invalid={Boolean(signupErrors.email)}
                            className={getInputClass(Boolean(signupErrors.email))}
                            placeholder="you@example.com"
                          />
                          {signupErrors.email ? (
                            <p className="mt-2 text-sm text-red-200">{signupErrors.email}</p>
                          ) : null}
                        </div>
                        <div>
                          <label className="mb-2 block text-sm text-gray-300">Password</label>
                          <input
                            type="password"
                            value={signupForm.password}
                            onChange={(e) => updateSignupForm("password", e.target.value)}
                            required
                            minLength={6}
                            aria-invalid={Boolean(signupErrors.password)}
                            className={getInputClass(Boolean(signupErrors.password))}
                            placeholder="Minimum 6 characters"
                          />
                          {signupErrors.password ? (
                            <p className="mt-2 text-sm text-red-200">{signupErrors.password}</p>
                          ) : null}
                        </div>
                        <div>
                          <label className="mb-2 block text-sm text-gray-300">Confirm Password</label>
                          <input
                            type="password"
                            value={signupForm.confirmPassword}
                            onChange={(e) => updateSignupForm("confirmPassword", e.target.value)}
                            required
                            aria-invalid={Boolean(signupErrors.confirmPassword)}
                            className={getInputClass(Boolean(signupErrors.confirmPassword))}
                            placeholder="Re-enter your password"
                          />
                          {signupErrors.confirmPassword ? (
                            <p className="mt-2 text-sm text-red-200">
                              {signupErrors.confirmPassword}
                            </p>
                          ) : null}
                        </div>
                        <button
                          type="submit"
                          disabled={isBusy}
                          className="w-full rounded-lg bg-white px-8 py-3 font-medium text-black transition-colors hover:bg-gray-100 disabled:bg-gray-200"
                        >
                          {activeAction === "signup" ? "Creating account..." : "Create Account"}
                        </button>
                        {isGoogleAvailable ? (
                          <>
                            <div className="flex items-center gap-3 py-1 text-xs uppercase tracking-[0.24em] text-gray-400">
                              <span className="h-px flex-1 bg-white/10" />
                              Or use Google
                              <span className="h-px flex-1 bg-white/10" />
                            </div>
                            <button
                              type="button"
                              onClick={handleGoogleSignIn}
                              disabled={isBusy}
                              className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/20 bg-black/20 px-8 py-3 font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-60"
                            >
                              <span className="text-base">G</span>
                              {activeAction === "google" ? "Redirecting..." : "Sign up with Google"}
                            </button>
                          </>
                        ) : (
                          <p className="text-sm text-gray-400">
                            Google signup will appear once both Google OAuth keys are configured.
                          </p>
                        )}
                      </form>
                    )}

                    {error ? <p className="mt-4 text-sm text-red-200">{error}</p> : null}
                    {success ? <p className="mt-4 text-sm text-emerald-200">{success}</p> : null}
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
