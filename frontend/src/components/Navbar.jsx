function Navbar() {
    const fullname = "Juan Dela Cruz";

    const getInitials = (name) => {
        const names = name.split(' ');
        return names.slice(0, 2).map(n => n[0]).join('').toUpperCase();
    };

    return (
        <nav className="navbar flex justify-center bg-background border-b border-border">
            <div className="flex justify-between items-center w-full max-w-[var(--safe-width)] p-3">
                <h2 className="text-foreground font-semibold tracking-wide">SmartElect</h2>

                <button className="flex items-center gap-3 text-foreground font-medium rounded-lg px-2 py-1.5 transition hover:bg-surface">
                    <span className="flex items-center justify-center bg-accent text-accent-foreground text-sm font-semibold h-9 w-9 rounded-full">
                        {getInitials(fullname)}
                    </span>
                    {fullname}
                </button>
            </div>
        </nav>
    );
}

export default Navbar;
