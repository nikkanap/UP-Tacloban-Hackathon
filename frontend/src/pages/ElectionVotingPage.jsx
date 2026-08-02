import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { electionDataContext } from "../App";
import { apiRequest } from "../api";
import VotingPanel from "../components/VotingPanel";
import ReviewVotesPanel from "../components/ReviewVotesPanel";
import SubmittedVotePanel from "../components/SubmittedVotePanel";
import VotingRoadmap from "../components/VotingRoadmap";
import ProgressBar from "../components/ProgressBar";
import ConfirmModal from "../components/ConfirmModal";
import StatusBadge from "../components/StatusBadge";
import useCountdown from "../hooks/useCountdown";
import defaultCandidateImage from "../assets/images/candidates/default-candidate.png";

const asArray = (data) => Array.isArray(data) ? data : data?.results ?? [];

const sameId = (left, right) => String(left) === String(right);

const toDate = (value) => {
    const date = value ? new Date(value) : null;
    return date && !Number.isNaN(date.getTime()) ? date : null;
};

const getStatus = (startTime, endTime) => {
    const now = new Date();
    if (startTime && now < startTime) return "upcoming";
    if (endTime && now > endTime) return "completed";
    return "ongoing";
};

const getCurrentVoter = () => {
    try {
        return JSON.parse(localStorage.getItem("currentVoter") || "null");
    } catch {
        localStorage.removeItem("currentVoter");
        return null;
    }
};

function ElectionVotingPage(){

    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const fallbackData = useContext(electionDataContext);
    const requestedElectionId =
        searchParams.get("election") ||
        searchParams.get("id") ||
        location.state?.electionData?.id;
    const [apiData, setApiData] = useState(null);
    const [isLoadingElection, setIsLoadingElection] = useState(Boolean(requestedElectionId));
    const [loadError, setLoadError] = useState("");
    const electionData = apiData?.electionData ?? location.state?.electionData ?? fallbackData.electionData;
    const electionCandidates = apiData?.electionCandidates ?? location.state?.electionCandidates ?? fallbackData.electionCandidates;
    const electionId = requestedElectionId || electionData.id;
    const detailsPath = electionId ? `/election-details?election=${electionId}` : "/election-details";
    const [activePosition, setActivePosition] = useState(0);
    const [selections, setSelections] = useState({});
    const [isReviewing, setIsReviewing] = useState(false);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
    const [ballotId, setBallotId] = useState(null);
    const [submitError, setSubmitError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const timeLeft = useCountdown(electionData.endTime);

    const currentPosition = electionCandidates[activePosition];
    const isLastPosition = activePosition === electionCandidates.length - 1;

    useEffect(() => {
        if (!requestedElectionId) return undefined;

        let isMounted = true;

        const loadElection = async () => {
            setIsLoadingElection(true);
            setLoadError("");

            try {
                const [
                    election,
                    positionsResponse,
                    candidatesResponse,
                    votesResponse,
                    votersResponse,
                    turnoutResponse,
                ] = await Promise.all([
                    apiRequest(`elections/${requestedElectionId}/`),
                    apiRequest("positions/"),
                    apiRequest("candidates/"),
                    apiRequest("votes/"),
                    apiRequest("voters/"),
                    apiRequest(`elections/${requestedElectionId}/turnout/`).catch(() => null),
                ]);

                const positions = asArray(positionsResponse).filter((position) =>
                    sameId(position.election, election.id),
                );
                const candidates = asArray(candidatesResponse).filter((candidate) =>
                    sameId(candidate.election, election.id),
                );
                const votes = asArray(votesResponse).filter((vote) =>
                    sameId(vote.election, election.id),
                );
                const voters = asArray(votersResponse);
                const startTime = toDate(election.date_start);
                const endTime = toDate(election.date_end);
                const votedVoterIds = new Set(
                    votes
                        .map((vote) => vote.voter)
                        .filter((voterId) => voterId !== null && voterId !== undefined),
                );

                const electionCandidates = positions.map((position) => ({
                    position: position.name || `Position ${position.id}`,
                    maxVotes: Number(position.seats) || 1,
                    candidates: candidates
                        .filter((candidate) => sameId(candidate.position, position.id))
                        .map((candidate) => ({
                            id: candidate.id,
                            name: candidate.full_name || `Candidate ${candidate.id}`,
                            party: candidate.party ?? "",
                            image: defaultCandidateImage,
                        })),
                }));

                if (isMounted) {
                    setApiData({
                        electionData: {
                            id: election.id,
                            title: election.name || `Election ${election.id}`,
                            description:
                                election.nft_category
                                    ? `Election NFT category: ${election.nft_category}`
                                    : "Election details and live voting information.",
                            status: getStatus(startTime, endTime),
                            totalVoters: turnoutResponse?.total_voters ?? voters.length,
                            totalVotersVoted: turnoutResponse?.voted ?? votedVoterIds.size,
                            startTime,
                            endTime,
                        },
                        electionCandidates,
                    });
                    setActivePosition(0);
                    setSelections({});
                    setIsReviewing(false);
                }
            } catch (error) {
                if (isMounted) {
                    setLoadError(error.message);
                }
            } finally {
                if (isMounted) {
                    setIsLoadingElection(false);
                }
            }
        };

        loadElection();

        return () => {
            isMounted = false;
        };
    }, [requestedElectionId]);

    const formatDateTime = (date) =>
        date ? date.toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        }) : "Not scheduled";

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

    const confirmSubmit = async () => {
        const candidateIds = Object.values(selections).flat();
        const currentVoter = getCurrentVoter();

        setSubmitError("");

        if (!currentVoter?.id) {
            setSubmitError("Please log in before submitting your vote.");
            setIsSubmitModalOpen(false);
            return;
        }

        if (!electionId) {
            setSubmitError("Election ID is missing.");
            setIsSubmitModalOpen(false);
            return;
        }

        if (candidateIds.length === 0) {
            setSubmitError("Select at least one candidate before submitting.");
            setIsSubmitModalOpen(false);
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await apiRequest("votes/", {
                method: "POST",
                body: JSON.stringify({
                    election: electionId,
                    voter: currentVoter.id,
                    candidate_ids: candidateIds,
                }),
            });

            const txids = result.txids ?? result.votes?.map((vote) => vote.vote_txid).filter(Boolean) ?? [];
            const txid = txids[0] ?? "";
            setBallotId(txid);
            const resultsParams = new URLSearchParams();
            if (electionId) resultsParams.set("election", electionId);
            if (txid) resultsParams.set("txid", txid);
            if (txids.length > 0) resultsParams.set("txids", txids.join(","));

            navigate(`/election-results?${resultsParams.toString()}`, {
                state: {
                    electionId,
                    txid,
                    txids,
                    submittedVotes: result.votes ?? [],
                    submittedCandidateIds: candidateIds,
                },
            });
        } catch (error) {
            console.error(error);
            setSubmitError(error.message);
        } finally {
            setIsSubmitting(false);
            setIsSubmitModalOpen(false);
        }
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
            navigate(detailsPath);
        } else {
            setIsLeaveModalOpen(true);
        }
    };

    const confirmLeave = () => {
        setIsLeaveModalOpen(false);
        navigate(detailsPath);
    };

    return(
        <div className="flex flex-col gap-6 min-h-full">
            {isLoadingElection && (
                <div className="bg-surface rounded-2xl px-4 py-3 text-sm text-muted">
                    Loading ballot...
                </div>
            )}

            {loadError && (
                <div className="bg-surface rounded-2xl px-4 py-3 text-sm text-red-600">
                    {loadError}
                </div>
            )}

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

            {submitError && (
                <div className="bg-surface rounded-2xl px-4 py-3 text-sm text-red-600">
                    {submitError}
                </div>
            )}

            {/* Election Voting */}
            {ballotId ? (
                <SubmittedVotePanel
                    ballotId={ballotId}
                    onVerify={() => navigate("/verify-vote", { state: { ballotId } })}
                    onBackToDetails={() => navigate(detailsPath)}
                />
            ) : isReviewing ? (
                <ReviewVotesPanel
                    electionCandidates={electionCandidates}
                    selections={selections}
                    onChangeVote={changeVote}
                    onSubmit={requestSubmit}
                    isSubmitting={isSubmitting}
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
                confirmLabel={isSubmitting ? "Submitting..." : "Submit"}
                cancelLabel="Cancel"
                onConfirm={confirmSubmit}
                onCancel={() => setIsSubmitModalOpen(false)}
                confirmDisabled={isSubmitting}
            />
        </div>
    )
}

export default ElectionVotingPage;
