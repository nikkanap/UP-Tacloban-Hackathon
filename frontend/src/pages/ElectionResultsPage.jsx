import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { electionDataContext } from "../App";
import StatusBadge from "../components/StatusBadge";
import CurrentPollsPanel from "../components/CurrentPollsPanel";
import WinnersPanel from "../components/WinnersPanel";

function ElectionResultsPage(){
    const navigate = useNavigate();
    const { electionData, electionCandidates, electionResults } = useContext(electionDataContext);
    const isCompleted = electionData.status === "completed";

    const totalPositions = electionCandidates.length;
    const totalCandidates = electionCandidates.reduce(
        (sum, position) => sum + position.candidates.length,
        0
    );

    const positionsWithWinners = electionResults.map((result) => {
        const maxVotes =
            electionCandidates.find((position) => position.position === result.position)?.maxVotes ?? 1;
        const sortedCandidates = [...result.candidates].sort((a, b) => b.votes - a.votes);
        const totalVotes = sortedCandidates.reduce((sum, candidate) => sum + candidate.votes, 0) + result.abstained;

        return {
            position: result.position,
            totalVotes,
            winners: isCompleted ? sortedCandidates.slice(0, Math.min(maxVotes, sortedCandidates.length)) : [],
        };
    });

    return(
        <div className="flex flex-col gap-6 min-h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-3">
                    <h1>
                        {electionData.title}{" "}
                        <StatusBadge status={electionData.status} />
                    </h1>
                    <p className="text-muted max-w-2xl">{electionData.description}</p>
                </div>

                <button
                    type="button"
                    onClick={() => navigate("/election-details")}
                    className="shrink-0 px-4 py-2 rounded-lg font-medium text-foreground border border-border transition hover:bg-surface"
                >
                    ← Back to Election Details
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Positions", value: totalPositions },
                    { label: "Candidates", value: totalCandidates },
                    { label: "Total Voters", value: electionData.totalVoters.toLocaleString() },
                    {
                        label: isCompleted ? "Votes Were Cast" : "Votes Cast",
                        value: electionData.totalVotersVoted.toLocaleString(),
                    },
                ].map(({ label, value }) => (
                    <div key={label} className="flex flex-col gap-1 bg-surface rounded-2xl p-4">
                        <span className="text-2xl font-bold text-foreground">{value}</span>
                        <span className="text-sm text-muted">{label}</span>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
                <WinnersPanel positions={positionsWithWinners} isCompleted={isCompleted} />

                <CurrentPollsPanel
                    electionResults={electionResults}
                    title={isCompleted ? "Final Poll Tally" : "Current Poll Tally"}
                />
            </div>
        </div>
    )
}

export default ElectionResultsPage;
