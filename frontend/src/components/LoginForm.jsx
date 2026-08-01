import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo/logo.svg";

function LoginForm() {
    const navigate = useNavigate();
    const [mode, setMode] = useState("voter");

    const handleSubmit = (event) => {
        event.preventDefault();
        navigate(mode === "voter" ? "/voter-dashboard" : "/admin/dashboard");
    };

    return (
        <div className="flex flex-col w-full max-w-sm bg-surface shadow-lg rounded-3xl overflow-hidden border border-border">
            <div className="flex flex-col items-center gap-2 bg-accent p-8">
                <span
                    aria-hidden="true"
                    className="w-12 h-12 bg-accent-foreground shrink-0"
                    style={{
                        WebkitMaskImage: `url(${logo})`,
                        maskImage: `url(${logo})`,
                        WebkitMaskSize: "contain",
                        maskSize: "contain",
                        WebkitMaskRepeat: "no-repeat",
                        maskRepeat: "no-repeat",
                        WebkitMaskPosition: "center",
                        maskPosition: "center",
                    }}
                />
                <span className="text-accent-foreground text-lg font-semibold">SmartElect</span>
            </div>

            <div className="px-8 pt-6">
                <div className="relative flex bg-background rounded-xl p-1">
                    <div
                        className={`absolute top-1 bottom-1 w-1/2 rounded-lg bg-accent transition-transform duration-200 ${
                            mode === "admin" ? "translate-x-full" : "translate-x-0"
                        }`}
                    />
                    <button
                        type="button"
                        onClick={() => setMode("voter")}
                        className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-lg transition ${
                            mode === "voter" ? "text-accent-foreground" : "text-muted"
                        }`}
                    >
                        Login as Voter
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("admin")}
                        className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-lg transition ${
                            mode === "admin" ? "text-accent-foreground" : "text-muted"
                        }`}
                    >
                        Login as Admin
                    </button>
                </div>
            </div>

            <form className="flex flex-col gap-5 p-8" onSubmit={handleSubmit}>
                {mode === "voter" ? (
                    <>
                        <div className="flex flex-col gap-1 text-center">
                            <h1 className="text-2xl font-semibold text-foreground">Welcome</h1>
                            <p className="text-sm text-muted">Enter credentials to start voting</p>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="voterId" className="text-sm font-medium text-foreground">
                                Voter ID
                            </label>
                            <input
                                id="voterId"
                                type="text"
                                placeholder="Enter your voter ID"
                                className="border border-border bg-background text-foreground p-2.5 rounded-lg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="voterKey" className="text-sm font-medium text-foreground">
                                Voter Key
                            </label>
                            <input
                                id="voterKey"
                                type="password"
                                placeholder="Enter your voter key"
                                className="border border-border bg-background text-foreground p-2.5 rounded-lg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-accent text-accent-foreground font-medium p-2.5 rounded-lg transition hover:opacity-90 active:opacity-80"
                        >
                            Login
                        </button>

                        <p className="text-xs text-muted text-center">
                            Don't know your credentials? Please contact your election administrator for assistance.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="flex flex-col gap-1 text-center">
                            <h1 className="text-2xl font-semibold text-foreground">Admin Login</h1>
                            <p className="text-sm text-muted">Sign in to manage your organization's elections</p>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="adminEmail" className="text-sm font-medium text-foreground">
                                Admin Email
                            </label>
                            <input
                                id="adminEmail"
                                type="email"
                                placeholder="Enter your admin email"
                                className="border border-border bg-background text-foreground p-2.5 rounded-lg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="adminPassword" className="text-sm font-medium text-foreground">
                                Password
                            </label>
                            <input
                                id="adminPassword"
                                type="password"
                                placeholder="Enter your password"
                                className="border border-border bg-background text-foreground p-2.5 rounded-lg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                            />
                        </div>

                        <button
                            type="submit"
                            className="bg-accent text-accent-foreground font-medium p-2.5 rounded-lg transition hover:opacity-90 active:opacity-80"
                        >
                            Login
                        </button>

                        <p className="text-xs text-muted text-center">
                            Don't have an organization account yet?{" "}
                            <Link to="/register-organization" className="font-medium text-accent hover:underline">
                                Register
                            </Link>
                        </p>
                    </>
                )}
            </form>
        </div>
    );
}

export default LoginForm;
