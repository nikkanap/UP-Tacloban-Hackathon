function StandingsList({ standings, highlightLeader = true }) {
    if (standings.length === 0) {
        return <p className="text-sm text-muted">No votes recorded yet.</p>;
    }

    return (
        <ul className="flex flex-col gap-4">
            {standings.map((entry, index) => (
                <li key={entry.id} className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-baseline gap-3 text-sm">
                        <span className="font-medium text-foreground">
                            {entry.name}
                            {(entry.subtitle ?? entry.party) && (
                                <span className="font-normal text-muted">
                                    {" "}
                                    · {entry.subtitle ?? entry.party}
                                </span>
                            )}
                        </span>
                        <span className="text-muted tabular-nums shrink-0">
                            {entry.votes.toLocaleString()} · {entry.percentage}%
                        </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-background overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-[width] ${
                                highlightLeader && index === 0 ? "bg-accent" : "bg-muted"
                            }`}
                            style={{ width: `${entry.percentage}%` }}
                        />
                    </div>
                </li>
            ))}
        </ul>
    );
}

export default StandingsList;
