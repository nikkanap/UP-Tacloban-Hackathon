import PositionTabs from "./PositionTabs";
import CandidateCard from "./CandidateCard";

function VotingPanel({
    electionCandidates,
    activePosition,
    setActivePosition,
    selections,
    toggleCandidate,
    clearVote,
    goToNext,
}) {
    const currentPosition = electionCandidates[activePosition];
    const isLastPosition = activePosition === electionCandidates.length - 1;

    return (
        <div className="flex flex-col gap-5 bg-surface p-5 rounded-3xl shadow-lg">
            <h2 className="text-center">Cast Your Vote</h2>

            <PositionTabs
                positions={electionCandidates.map((position) => position.position)}
                activeIndex={activePosition}
                onSelect={setActivePosition}
                completed={electionCandidates.map((position) => (selections[position.position]?.length ?? 0) > 0)}
            />

            <div className="flex items-baseline justify-between">
                <h2>{currentPosition?.position}</h2>
                <span className="text-sm text-muted">
                    Position {activePosition + 1} of {electionCandidates.length}
                </span>
            </div>

            <p className="text-sm text-muted -mt-3">
                Select up to {currentPosition?.maxVotes} candidate{currentPosition?.maxVotes > 1 ? "s" : ""} ·{" "}
                {(selections[currentPosition?.position]?.filter((id) => id !== "Abstain").length ?? 0)} / {currentPosition?.maxVotes} selected
            </p>

            <div className="flex flex-wrap gap-4 justify-center">
                {currentPosition?.candidates.map((candidate) => (
                    <CandidateCard
                        key={candidate.id}
                        name={candidate.name}
                        party={candidate.party}
                        image={candidate.image}
                        selected={selections[currentPosition.position]?.includes(candidate.id) ?? false}
                        onClick={() => toggleCandidate(currentPosition, candidate.id)}
                    />
                ))}
                <CandidateCard
                    name="Abstain"
                    selected={selections[currentPosition?.position]?.includes("Abstain") ?? false}
                    onClick={() => toggleCandidate(currentPosition, "Abstain")}
                />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-border">
                <button
                    type="button"
                    onClick={clearVote}
                    className="px-5 py-2.5 rounded-lg font-medium text-foreground border border-border transition hover:bg-background"
                >
                    Clear Vote
                </button>
                <button
                    type="button"
                    onClick={goToNext}
                    className="px-5 py-2.5 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isLastPosition ? "Review & Submit" : "Next Position"}
                </button>
            </div>
        </div>
    );
}

export default VotingPanel;
