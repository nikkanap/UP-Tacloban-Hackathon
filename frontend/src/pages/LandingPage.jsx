import { Link } from "react-router-dom";
import logo from "../assets/logo/logo.svg";
import heroBanner from "../assets/hero.png";

const voterSteps = [
    {
        title: "Receive your credentials",
        description: "Your organization issues you a Voter ID and Voter Key once you're registered for an election.",
    },
    {
        title: "Log in",
        description: "Sign in with your Voter ID and Voter Key to access the elections you're eligible to vote in.",
    },
    {
        title: "Cast your vote",
        description: "Review each position's candidates and submit your selections before the election closes.",
    },
    {
        title: "Verify your ballot",
        description: "Use your Ballot ID to confirm your vote was recorded on the public ledger, anytime.",
    },
];

const organizationSteps = [
    {
        title: "Register your organization",
        description: "Create an organization account to start setting up elections for your group.",
    },
    {
        title: "Set up an election",
        description: "Define positions, add candidates, and schedule when voting opens and closes.",
    },
    {
        title: "Register your voters",
        description: "Add your voter roll so each eligible voter receives their own credentials.",
    },
    {
        title: "Monitor and publish results",
        description: "Track turnout in real time and publish tamper-proof results once voting ends.",
    },
];

const whyChooseUs = [
    {
        title: "Transparent",
        description: "Voting rights, ballots, and vote counts are represented on-chain. Anyone can check turnout and results, not just the organizers.",
    },
    {
        title: "Tamper-Resistant",
        description: "Votes are secured through smart contracts and tokens instead of a spreadsheet or database an insider could quietly edit after the fact.",
    },
    {
        title: "Independently Verifiable",
        description: "Results don't rely on trusting a single centralized authority. Every ballot can be checked against the public ledger.",
    },
];

function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            <nav className="flex justify-center border-b border-border">
                <div className="flex items-center justify-between w-full max-w-[var(--safe-width)] p-3">
                    <div className="flex items-center gap-2">
                        <span
                            aria-hidden="true"
                            className="w-9 h-9 bg-accent shrink-0"
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
                        <span className="text-foreground font-semibold tracking-wide">SmartElect</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/login"
                            className="px-4 py-2 rounded-lg font-medium text-foreground border border-border transition hover:bg-surface"
                        >
                            Login as Voter
                        </Link>
                        <Link
                            to="/register-organization"
                            className="px-4 py-2 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80"
                        >
                            Register
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="flex-1 flex flex-col items-center">
                <section className="w-full max-w-[var(--safe-width)] px-5 py-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
                        <div className="flex flex-col gap-5">
                            <div className="flex items-center gap-3">
                                <span
                                    aria-hidden="true"
                                    className="w-14 h-14 bg-accent shrink-0"
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
                                <span className="text-6xl font-semibold text-foreground tracking-wide">
                                    SmartElect
                                </span>
                            </div>
                            <h1 className="text-4xl leading-tight">
                                Elections your community can trust, secured on the blockchain
                            </h1>
                            <p className="text-muted max-w-lg">
                                SmartElect is an online voting platform for organizations running any kind of
                                election. Voting rights, ballots, and vote counts are represented and managed
                                through smart contracts and tokens on the Bitcoin Cash blockchain. That keeps
                                elections transparent, tamper-resistant, and independently verifiable, without
                                relying entirely on a centralized authority.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    to="/login"
                                    className="px-6 py-3 rounded-xl font-semibold bg-accent text-accent-foreground shadow-lg transition hover:opacity-90 active:opacity-80"
                                >
                                    Login as Voter
                                </Link>
                                <Link
                                    to="/register-organization"
                                    className="px-6 py-3 rounded-xl font-semibold text-foreground border border-border transition hover:bg-surface"
                                >
                                    Register
                                </Link>
                            </div>
                        </div>

                        <div className="relative rounded-3xl bg-gradient-to-br from-accent/25 via-accent/5 to-transparent p-4">
                            <img
                                src={heroBanner}
                                alt="SmartElect voting platform"
                                className="w-full rounded-2xl border border-border shadow-lg object-cover"
                            />
                        </div>
                    </div>
                </section>

                <section className="w-full bg-surface border-y border-border">
                    <div className="max-w-[var(--safe-width)] mx-auto px-5 py-16 flex flex-col items-center gap-4 text-center">
                        <h2>Why We Built SmartElect</h2>
                        <p className="text-muted max-w-2xl">
                            Traditional elections can be expensive to run, difficult to audit, and vulnerable to
                            fraud or manipulation. We built SmartElect to fix that. Voting rights, ballots, and
                            vote counting are represented and managed using smart contracts and tokens, so every
                            step of an election can be independently verified. Voters don't have to place blind
                            trust in a single centralized authority.
                        </p>
                    </div>
                </section>

                <section className="w-full max-w-[var(--safe-width)] px-5 py-16">
                    <div className="flex flex-col items-center gap-2 text-center mb-10">
                        <h2>How It Works</h2>
                        <p className="text-muted">Simple steps for voters and for the organizations running an election.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-4 bg-surface rounded-3xl p-6">
                            <h3>For Voters</h3>
                            <div className="flex flex-col gap-4">
                                {voterSteps.map((step, index) => (
                                    <div key={step.title} className="flex items-start gap-3">
                                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-accent text-accent-foreground text-xs font-bold shrink-0">
                                            {index + 1}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground">{step.title}</span>
                                            <span className="text-sm text-muted">{step.description}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 bg-surface rounded-3xl p-6">
                            <h3>For Organizations</h3>
                            <div className="flex flex-col gap-4">
                                {organizationSteps.map((step, index) => (
                                    <div key={step.title} className="flex items-start gap-3">
                                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-accent text-accent-foreground text-xs font-bold shrink-0">
                                            {index + 1}
                                        </span>
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-foreground">{step.title}</span>
                                            <span className="text-sm text-muted">{step.description}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="w-full bg-surface border-t border-border">
                    <div className="max-w-[var(--safe-width)] mx-auto px-5 py-16">
                        <div className="flex flex-col items-center gap-2 text-center mb-10">
                            <h2>Why Choose Us</h2>
                            <p className="text-muted max-w-2xl">
                                Elections run on SmartElect are transparent, tamper-resistant, and
                                independently verifiable, backed by smart contracts and tokens on the Bitcoin
                                Cash blockchain.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {whyChooseUs.map((item) => (
                                <div key={item.title} className="flex flex-col gap-2 bg-background rounded-2xl p-6">
                                    <h3>{item.title}</h3>
                                    <p className="text-sm text-muted">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <footer className="flex justify-center border-t border-border">
                <div className="w-full max-w-[var(--safe-width)] px-5 py-6 text-sm text-muted text-center">
                    © {new Date().getFullYear()} SmartElect. Transparent, tamper-resistant elections powered by the Bitcoin Cash blockchain.
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;
