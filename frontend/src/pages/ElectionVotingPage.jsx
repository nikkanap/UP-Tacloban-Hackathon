import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { electionDataContext } from "../App";
import VotingPanel from "../components/VotingPanel";
import ReviewVotesPanel from "../components/ReviewVotesPanel";
import SubmittedVotePanel from "../components/SubmittedVotePanel";
import VotingRoadmap from "../components/VotingRoadmap";
import ProgressBar from "../components/ProgressBar";
import ConfirmModal from "../components/ConfirmModal";
import StatusBadge from "../components/StatusBadge";
import useCountdown from "../hooks/useCountdown";

function ElectionVotingPage(){

    const navigate = useNavigate();
    const { electionData, electionCandidates } = useContext(electionDataContext);
    const [activePosition, setActivePosition] = useState(0);
    const [selections, setSelections] = useState({});
    const [isReviewing, setIsReviewing] = useState(false);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [ballotId, setBallotId] = useState(null);
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

    const toggleCandidate = (position, candidateId) => {
        setSelections((prev) => {
            const current = prev[position.position] ?? [];

            if (current.includes(candidateId)) {
                return { ...prev, [position.position]: current.filter((id) => id !== candidateId) };
            }

            if (position.maxVotes === 1) {
                return { ...prev, [position.position]: [candidateId] };
            }

            if (current.length >= position.maxVotes) return prev;

            return { ...prev, [position.position]: [...current, candidateId] };
        });
    };

    const requestClearVote = () => setIsClearModalOpen(true);

    const confirmClearVote = () => {
        setSelections((prev) => {
            const next = { ...prev };
            delete next[currentPosition?.position];
            return next;
        });
        setIsClearModalOpen(false);
    };

    const requestSubmit = () => setIsSubmitModalOpen(true);

    const confirmSubmit = () => {
        setIsSubmitModalOpen(false);
        setBallotId(`${Math.floor(10 + Math.random() * 90)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(100 + Math.random() * 900)}`);
    };

    const goToNext = () => {
        if (isLastPosition) {
            setIsReviewing(true);
        } else {
            setActivePosition((prev) => prev + 1);
        }
    };

    const changeVote = (positionIndex) => {
        setActivePosition(positionIndex);
        setIsReviewing(false);
    };

    const requestLeave = () => {
        if (ballotId) {
            navigate("/election-details");
        } else {
            setIsLeaveModalOpen(true);
        }
    };

    const confirmLeave = () => {
        setIsLeaveModalOpen(false);
        navigate("/election-details");
    };

    return(
        <div className="flex flex-col gap-6 min-h-full">
            <div className="flex flex-col min-[1049px]:flex-row min-[1049px]:items-center justify-between gap-4">
                <div className="flex flex-col gap-2 flex-1 min-w-0">
                    <button
                        type="button"
                        onClick={requestLeave}
                        className="self-start px-4 py-2 rounded-lg font-medium text-foreground border border-border transition hover:bg-surface"
                    >
                        ← Back to Election Details
                    </button>
                    <h1>
                        {electionData.title}{" "}
                        <StatusBadge status={electionData.status} />
                    </h1>
                    <p className="text-muted max-w-2xl">{electionData.description}</p>
                    <p className="text-sm text-muted">
                        {formatDateTime(electionData.startTime)} – {formatDateTime(electionData.endTime)}
                    </p>
                </div>

                <div className="flex flex-col gap-4 bg-surface p-5 rounded-2xl shadow-lg w-full min-[1049px]:w-auto min-[1049px]:min-w-[320px] min-[1049px]:max-w-sm shrink">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                        <div className="flex flex-col gap-0.5 shrink-0">
                            <span className="text-sm text-muted">Closes on</span>
                            <span className="text-lg font-semibold text-foreground whitespace-nowrap">
                                {formatDateTime(electionData.endTime)}
                            </span>
                        </div>

                        <div className="hidden sm:block h-10 w-px bg-border shrink-0" />

                        {timeLeft.totalMs === 0 ? (
                            <span className="text-sm font-medium text-foreground shrink-0">Voting has closed</span>
                        ) : (
                            <div className="flex flex-1 min-w-45 gap-2">
                                {[
                                    { label: "d", value: timeLeft.days },
                                    { label: "h", value: timeLeft.hours },
                                    { label: "m", value: timeLeft.minutes },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex-1 flex flex-col items-center gap-0.5 bg-background rounded-lg px-3 py-2">
                                        <span className="text-xl font-bold text-foreground tabular-nums leading-tight">
                                            {String(value).padStart(2, "0")}
                                        </span>
                                        <span className="text-[11px] uppercase tracking-wide text-muted leading-tight">{label}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <ProgressBar value={electionData.totalVotersVoted} total={electionData.totalVoters} />
                </div>
            </div>
            <VotingRoadmap currentStep={ballotId ? 2 : isReviewing ? 1 : 0} />

            {/* Election Voting */}
            {ballotId ? (
                <SubmittedVotePanel
                    ballotId={ballotId}
                    onVerify={() => navigate("/verify-vote", { state: { ballotId } })}
                    onBackToDetails={() => navigate("/election-details")}
                />
            ) : isReviewing ? (
                <ReviewVotesPanel
                    electionCandidates={electionCandidates}
                    selections={selections}
                    onChangeVote={changeVote}
                    onSubmit={requestSubmit}
                    onBack={() => setIsReviewing(false)}
                />
            ) : (
                <VotingPanel
                    electionCandidates={electionCandidates}
                    activePosition={activePosition}
                    setActivePosition={setActivePosition}
                    selections={selections}
                    toggleCandidate={toggleCandidate}
                    clearVote={requestClearVote}
                    goToNext={goToNext}
                />
            )}

            <ConfirmModal
                open={isLeaveModalOpen}
                title="Leave without submitting?"
                message="Your selections aren't counted yet and will be lost if you leave now. You can always come back and vote again before the election closes."
                confirmLabel="Leave"
                cancelLabel="Stay"
                onConfirm={confirmLeave}
                onCancel={() => setIsLeaveModalOpen(false)}
            />

            <ConfirmModal
                open={isClearModalOpen}
                title="Clear this vote?"
                message="This will remove your selection for this position."
                confirmLabel="Clear"
                cancelLabel="Cancel"
                onConfirm={confirmClearVote}
                onCancel={() => setIsClearModalOpen(false)}
            />

            <ConfirmModal
                open={isSubmitModalOpen}
                title="Submit your votes?"
                message="You won't be able to change your selections after submitting."
                confirmLabel="Submit"
                cancelLabel="Cancel"
                onConfirm={confirmSubmit}
                onCancel={() => setIsSubmitModalOpen(false)}
            />
        </div>
    )
}

export default ElectionVotingPage;
