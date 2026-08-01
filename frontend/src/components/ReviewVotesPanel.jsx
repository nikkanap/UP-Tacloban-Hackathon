function ReviewVotesPanel({ electionCandidates, selections, onChangeVote, onSubmit, onBack }) {
    return (
        <div className="flex flex-col gap-5 bg-surface p-5 rounded-3xl shadow-lg">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                <button
                    type="button"
                    onClick={onBack}
                    className="justify-self-start px-4 py-2 rounded-lg font-medium text-foreground border border-border transition hover:bg-background"
                >
                    ← Go Back to Voting
                </button>
                <h2 className="text-center whitespace-nowrap">Review Your Votes</h2>
                <span aria-hidden="true" />
            </div>

            <div className="flex flex-col divide-y divide-border">
                {electionCandidates.map((position, index) => {
                    const picks = selections[position.position] ?? [];
                    const pickedCandidates = position.candidates.filter((candidate) =>
                        picks.includes(candidate.id)
                    );
                    const hasAbstained = pickedCandidates.length === 0;

                    return (
                        <div key={position.position} className="flex flex-col md:flex-row md:items-center gap-3 py-4">
                            <div className="flex items-center gap-2 md:w-60 shrink-0">
                                <span className="text-lg font-bold text-foreground">{position.position}</span>
                                <span className="text-xs font-medium text-muted bg-background px-2 py-0.5 rounded-full">
                                    {pickedCandidates.length} / {position.maxVotes}
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-3 flex-1">
                                {hasAbstained ? (
                                    <span className="text-sm font-medium text-muted italic self-center">
                                        Abstained
                                    </span>
                                ) : (
                                    pickedCandidates.map((candidate) => (
                                        <div
                                            key={candidate.id}
                                            className="flex items-center gap-4 bg-background border border-border rounded-2xl p-4"
                                        >
                                            <img
                                                src={candidate.image}
                                                alt={candidate.name}
                                                className="w-24 h-24 rounded-xl object-cover bg-surface shrink-0"
                                            />
                                            <div className="flex flex-col leading-tight">
                                                <span className="text-lg font-semibold text-foreground">{candidate.name}</span>
                                                <span className="text-muted">{candidate.party}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <button
                                type="button"
                                onClick={() => onChangeVote(index)}
                                className="shrink-0 px-4 py-2 rounded-lg font-medium text-foreground border border-border transition hover:bg-background self-start md:self-center"
                            >
                                Change Vote
                            </button>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end pt-2 border-t border-border">
                <button
                    type="button"
                    onClick={onSubmit}
                    className="px-5 py-2.5 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80"
                >
                    Submit Votes
                </button>
            </div>
        </div>
    );
}

export default ReviewVotesPanel;
