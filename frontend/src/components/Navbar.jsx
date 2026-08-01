import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userContext } from "../App";
import logo from "../assets/logo/logo.svg";

function Navbar() {
    const navigate = useNavigate();
    const { fullname, voterId } = useContext(userContext);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const getInitials = (name) => {
        const names = name.split(' ');
        return names.slice(0, 2).map(n => n[0]).join('').toUpperCase();
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        setIsMenuOpen(false);
        navigate("/login");
    };

    return (
        <nav className="navbar flex justify-center bg-background border-b border-border">
            <div className="flex justify-between items-center w-full max-w-[var(--safe-width)] p-3">
                <div className="flex items-center gap-2">
                    <span
                        aria-hidden="true"
                        className="w-10 h-10 bg-accent shrink-0"
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
                    <h2 className="text-foreground font-semibold tracking-wide">SmartElect</h2>
                </div>

                <div className="relative" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        className="flex items-center gap-3 text-foreground font-medium rounded-lg px-2 py-1.5 transition hover:bg-surface"
                    >
                        <span className="flex items-center justify-center bg-accent text-accent-foreground text-sm font-semibold h-9 w-9 rounded-full">
                            {getInitials(fullname)}
                        </span>
                        {fullname}
                    </button>

                    {isMenuOpen && (
                        <div className="absolute right-0 top-full mt-2 w-64 bg-surface border border-border rounded-2xl shadow-lg overflow-hidden z-50">
                            <div className="flex flex-col items-center gap-2 p-5">
                                <span className="flex items-center justify-center bg-accent text-accent-foreground text-lg font-semibold h-14 w-14 rounded-full">
                                    {getInitials(fullname)}
                                </span>
                                <div className="flex flex-col items-center text-center">
                                    <span className="font-semibold text-foreground">{fullname}</span>
                                    <span className="text-xs text-muted">Voter ID: {voterId}</span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="w-full px-5 py-3 text-left font-medium text-foreground border-t border-border transition hover:bg-background"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
