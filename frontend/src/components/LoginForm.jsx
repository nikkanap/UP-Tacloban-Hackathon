import { useNavigate } from "react-router-dom";
import favicon from "../../public/favicon.svg";

function LoginForm() {
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        navigate("/voter-dashboard");
    };

    return (
        <div className="flex flex-col w-full max-w-sm bg-surface shadow-lg rounded-3xl overflow-hidden border border-border">
            <div className="flex flex-col items-center gap-2 bg-accent p-8">
                <img src={favicon} alt="App logo" className="w-12 h-12" />
                <span className="text-accent-foreground text-lg font-semibold">SmartElect</span>
            </div>

            <form className="flex flex-col gap-5 p-8" onSubmit={handleSubmit}>
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
            </form>
        </div>
    );
}

export default LoginForm;
