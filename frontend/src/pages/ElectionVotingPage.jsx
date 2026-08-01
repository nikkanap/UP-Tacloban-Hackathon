import { useContext, useState } from "react";
import { electionDataContext } from "../App";
import VotingPanel from "../components/VotingPanel";
import ReviewVotesPanel from "../components/ReviewVotesPanel";
import ProgressBar from "../components/ProgressBar";
import useCountdown from "../hooks/useCountdown";

function ElectionVotingPage(){

    const { electionData, electionCandidates } = useContext(electionDataContext);
    const [activePosition, setActivePosition] = useState(0);
    const [selections, setSelections] = useState({});
    const [isReviewing, setIsReviewing] = useState(false);
    const timeLeft = useCountdown(electionData.endTime);

    const currentPosition = electionCandidates[activePosition];
    const isLastPosition = activePosition === electionCandidates.length - 1;

    const formatDateTime = (date) =>
        date.toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });

    const toggleCandidate = (position, candidateName) => {
        setSelections((prev) => {
            const current = prev[position.position] ?? [];

            if (candidateName === "Abstain") {
                const isAbstaining = current.includes("Abstain");
                return { ...prev, [position.position]: isAbstaining ? [] : ["Abstain"] };
            }

            if (current.includes(candidateName)) {
                return { ...prev, [position.position]: current.filter((name) => name !== candidateName) };
            }

            const withoutAbstain = current.filter((name) => name !== "Abstain");
            if (withoutAbstain.length >= position.maxVotes) return prev;

            return { ...prev, [position.position]: [...withoutAbstain, candidateName] };
        });
    };

    const clearVote = () => {
        setSelections((prev) => {
            const next = { ...prev };
            delete next[currentPosition?.position];
            return next;
        });
    };

    const goToNext = () => {
        if (isLastPosition) {
            setIsReviewing(true);
        } else {
            setActivePosition((prev) => prev + 1);
        }
    };

    return(
        <div className="flex flex-col gap-6 min-h-full">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <span className="inline-flex items-center gap-1.5 self-start text-xs font-semibold uppercase tracking-wide text-accent-foreground bg-accent px-3 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-foreground animate-pulse" />
                        Voting is open
                    </span>
                    <h1>{electionData.title}</h1>
                    <p className="text-muted max-w-2xl">{electionData.description}</p>
                    <p className="text-sm text-muted">
                        {formatDateTime(electionData.startTime)} – {formatDateTime(electionData.endTime)}
                    </p>
                </div>

                <div className="flex flex-col gap-4 bg-surface p-5 rounded-3xl shadow-lg shrink-0 w-full md:w-80">
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-muted">Closes on</span>
                        <span className="font-semibold text-foreground">{formatDateTime(electionData.endTime)}</span>
                    </div>

                    <div className="flex gap-2">
                        {[
                            { label: "days", value: timeLeft.days },
                            { label: "hrs", value: timeLeft.hours },
                            { label: "min", value: timeLeft.minutes },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex-1 flex flex-col items-center gap-0.5 bg-background rounded-xl py-2">
                                <span className="text-xl font-bold text-foreground tabular-nums">
                                    {String(value).padStart(2, "0")}
                                </span>
                                <span className="text-[11px] uppercase tracking-wide text-muted">{label}</span>
                            </div>
                        ))}
                    </div>

                    {timeLeft.totalMs === 0 && (
                        <span className="text-sm font-medium text-foreground">Voting has closed</span>
                    )}

                    <ProgressBar value={electionData.totalVotersVoted} total={electionData.totalVoters} />
                </div>
            </div>
            {/* Election Voting */}
            {isReviewing ? (
                <ReviewVotesPanel />
            ) : (
                <VotingPanel
                    electionCandidates={electionCandidates}
                    activePosition={activePosition}
                    setActivePosition={setActivePosition}
                    selections={selections}
                    toggleCandidate={toggleCandidate}
                    clearVote={clearVote}
                    goToNext={goToNext}
                />
            )}
        </div>
    )
}

export default ElectionVotingPage;
