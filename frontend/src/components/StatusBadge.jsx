const STATUS_LABELS = {
    upcoming: "Upcoming",
    ongoing: "Ongoing",
    completed: "Completed",
};

function StatusBadge({ status }) {
    return (
        <span className="inline-flex items-center gap-1.5 align-middle text-xs font-semibold uppercase tracking-wide text-accent-foreground bg-accent px-3 py-1 rounded-full">
            {status === "ongoing" && (
                <span className="w-1.5 h-1.5 rounded-full bg-accent-foreground animate-pulse" />
            )}
            {STATUS_LABELS[status] ?? status}
        </span>
    );
}

export default StatusBadge;
