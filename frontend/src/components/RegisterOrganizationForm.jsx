import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo/logo.svg";

function RegisterOrganizationForm() {
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        navigate("/admin/dashboard");
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

            <form className="flex flex-col gap-5 p-8" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-1 text-center">
                    <h1 className="text-2xl font-semibold text-foreground">Register</h1>
                    <p className="text-sm text-muted">Set up your organization to manage elections</p>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="orgName" className="text-sm font-medium text-foreground">
                        Organization Name
                    </label>
                    <input
                        id="orgName"
                        type="text"
                        placeholder="Enter your organization name"
                        className="border border-border bg-background text-foreground p-2.5 rounded-lg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label htmlFor="adminEmail" className="text-sm font-medium text-foreground">
                        Admin Email
                    </label>
                    <input
                        id="adminEmail"
                        type="email"
                        placeholder="Enter your work email"
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
                        placeholder="Create a password"
                        className="border border-border bg-background text-foreground p-2.5 rounded-lg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                    />
                </div>

                <button
                    type="submit"
                    className="bg-accent text-accent-foreground font-medium p-2.5 rounded-lg transition hover:opacity-90 active:opacity-80"
                >
                    Register
                </button>

                <p className="text-xs text-muted text-center">
                    Already have an organization account?{" "}
                    <Link to="/login" className="font-medium text-accent hover:underline">
                        Login
                    </Link>
                </p>
            </form>
        </div>
    );
}

export default RegisterOrganizationForm;
