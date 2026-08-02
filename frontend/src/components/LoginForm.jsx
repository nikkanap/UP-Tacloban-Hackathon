import { useState } from "react";
import logo from "../assets/logo/logo.svg";

function LoginForm({ onSubmit, isLoading = false, error = "" }) {
    const [mode, setMode] = useState("voter");
    const [voterId, setVoterId] = useState("");
    const [voterKey, setVoterKey] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (event) => {
        event.preventDefault();

        if (mode === "admin") {
            onSubmit({
                mode,
                username: username.trim(),
                password,
            });
            return;
        }

        onSubmit({
            mode,
            voterId: voterId.trim(),
            voterKey: voterKey.trim(),
        });
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
                <span className="text-accent-foreground text-lg font-semibold">BotoKita</span>
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
                        Voter
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode("admin")}
                        className={`relative z-10 flex-1 py-2 text-sm font-medium rounded-lg transition ${
                            mode === "admin" ? "text-accent-foreground" : "text-muted"
                        }`}
                    >
                        Admin
                    </button>
                </div>
            </div>

            <form className="flex flex-col gap-5 p-8" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-1 text-center">
                    <h1 className="text-2xl font-semibold text-foreground">
                        {mode === "admin" ? "Admin Login" : "Welcome"}
                    </h1>
                    <p className="text-sm text-muted">
                        {mode === "admin"
                            ? "Enter admin credentials to manage elections"
                            : "Enter credentials to start voting"}
                    </p>
                </div>

                {mode === "admin" ? (
                    <>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="adminUsername" className="text-sm font-medium text-foreground">
                                Username
                            </label>
                            <input
                                id="adminUsername"
                                type="text"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                placeholder="Enter admin username"
                                autoComplete="username"
                                required
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
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                placeholder="Enter admin password"
                                autoComplete="current-password"
                                required
                                className="border border-border bg-background text-foreground p-2.5 rounded-lg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="voterId" className="text-sm font-medium text-foreground">
                                Voter ID
                            </label>
                            <input
                                id="voterId"
                                type="text"
                                value={voterId}
                                onChange={(event) => setVoterId(event.target.value)}
                                placeholder="Enter your voter ID"
                                autoComplete="username"
                                required
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
                                value={voterKey}
                                onChange={(event) => setVoterKey(event.target.value)}
                                placeholder="Enter your voter key"
                                autoComplete="current-password"
                                required
                                className="border border-border bg-background text-foreground p-2.5 rounded-lg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                            />
                        </div>
                    </>
                )}

                {error ? (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                    </p>
                ) : null}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-accent text-accent-foreground font-medium p-2.5 rounded-lg transition hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isLoading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}

export default LoginForm;
