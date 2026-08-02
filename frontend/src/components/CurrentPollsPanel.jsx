import { useState } from "react";
import PositionTabs from "./PositionTabs";
import ProgressBar from "./ProgressBar";

function CurrentPollsPanel({ electionResults, title = "Current Polls" }) {
    const [activePosition, setActivePosition] = useState(0);
    const currentPosition = electionResults[activePosition];
    const sortedCandidates = [...(currentPosition?.candidates ?? [])].sort((a, b) => b.votes - a.votes);

    const totalVotes =
        (currentPosition?.candidates.reduce((sum, candidate) => sum + candidate.votes, 0) ?? 0) +
        (currentPosition?.abstained ?? 0);

    return (
        <div className="flex flex-col gap-4 bg-surface rounded-3xl p-5">
            <h2>{title}</h2>

            <PositionTabs
                positions={electionResults.map((position) => position.position)}
                activeIndex={activePosition}
                onSelect={setActivePosition}
                alwaysShowArrows
            />

            <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                {sortedCandidates.map((candidate) => (
                    <div key={candidate.id} className="flex items-center gap-3">
                        <img
                            src={candidate.image}
                            alt={candidate.name}
                            className="w-12 h-12 rounded-lg object-cover bg-background shrink-0"
                        />
                        <div className="flex-1 flex flex-col gap-1 min-w-0">
                            <div className="flex justify-between gap-2 text-sm">
                                <span className="font-medium text-foreground truncate">{candidate.name}</span>
                                <span className="text-muted shrink-0">{candidate.party}</span>
                            </div>
                            <ProgressBar value={candidate.votes} total={totalVotes} />
                        </div>
                    </div>
                ))}

                {currentPosition?.abstained > 0 && (
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-lg border border-dashed border-border bg-background shrink-0">
                            <span className="text-[10px] font-semibold text-muted">N/A</span>
                        </div>
                        <div className="flex-1 flex flex-col gap-1 min-w-0">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium text-muted italic">Abstained</span>
                            </div>
                            <ProgressBar value={currentPosition.abstained} total={totalVotes} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CurrentPollsPanel;
