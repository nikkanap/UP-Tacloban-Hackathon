function WinnersPanel({ positions, isCompleted }) {
    return (
        <div className="flex flex-col gap-4 bg-surface rounded-3xl p-5">
            <h2 className="">Elected Officials</h2>

            <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                {positions.map(({ position, totalVotes, winners }) => (
                    <div
                        key={position}
                        className="flex flex-col gap-3 bg-background rounded-2xl p-4"
                    >
                        <span className="text-lg font-bold text-foreground">{position}</span>

                        <div className="flex flex-col gap-2">
                            {isCompleted ? (
                                winners.map((winner) => {
                                    const percentage =
                                        totalVotes > 0 ? Math.round((winner.votes / totalVotes) * 100) : 0;

                                    return (
                                        <div
                                            key={winner.id}
                                            className="flex items-center gap-3 bg-surface rounded-xl p-3"
                                        >
                                            <img
                                                src={winner.image}
                                                alt={winner.name}
                                                className="w-16 h-16 rounded-lg object-cover border border-border bg-background shrink-0"
                                            />
                                            <div className="flex-1 flex flex-col min-w-0">
                                                <span className="font-semibold text-foreground truncate">
                                                    {winner.name}
                                                </span>
                                                <span className="text-xs text-muted">{winner.party}</span>
                                            </div>
                                            <div className="flex flex-col items-end shrink-0">
                                                <span className="text-sm font-bold text-foreground tabular-nums">
                                                    {percentage}%
                                                </span>
                                                <span className="text-xs text-muted whitespace-nowrap">
                                                    {winner.votes.toLocaleString()} votes
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex items-center gap-3 bg-surface border border-dashed border-border rounded-xl p-3">
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-background text-muted text-xs font-bold shrink-0">
                                        ◯
                                    </span>
                                    <span className="text-sm font-medium text-muted italic">
                                        No winner yet. Results are pending.
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default WinnersPanel;
