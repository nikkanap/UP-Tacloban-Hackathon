import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { electionDataContext } from "../App";
import { apiRequest } from "../api";
import ProgressBar from "../components/ProgressBar";
import CurrentPollsPanel from "../components/CurrentPollsPanel";
import WinnersPanel from "../components/WinnersPanel";
import StatusBadge from "../components/StatusBadge";
import useCountdown from "../hooks/useCountdown";
import defaultCandidateImage from "../assets/images/candidates/default-candidate.png";

function ElectionDetailsPage(){
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const fallbackData = useContext(electionDataContext);
    const [apiData, setApiData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const requestedElectionId = searchParams.get("election") || searchParams.get("id");

    useEffect(() => {
        let isMounted = true;

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

        const loadElection = async () => {
            setIsLoading(true);
            setError("");

            try {
                const elections = asArray(await apiRequest("elections/"));
                if (elections.length === 0) {
                    throw new Error("No elections found.");
                }

                const selectedElection =
                    elections.find((election) => sameId(election.id, requestedElectionId)) ??
                    elections.find((election) => {
                        const startTime = toDate(election.date_start);
                        const endTime = toDate(election.date_end);
                        return getStatus(startTime, endTime) === "ongoing";
                    }) ??
                    elections[elections.length - 1];

                const [
                    positionsResponse,
                    candidatesResponse,
                    votesResponse,
                    votersResponse,
                    turnoutResponse,
                ] = await Promise.all([
                    apiRequest("positions/"),
                    apiRequest("candidates/"),
                    apiRequest("votes/"),
                    apiRequest("voters/"),
                    apiRequest(`elections/${selectedElection.id}/turnout/`).catch(() => null),
                ]);

                const positions = asArray(positionsResponse).filter((position) =>
                    sameId(position.election, selectedElection.id),
                );
                const candidates = asArray(candidatesResponse).filter((candidate) =>
                    sameId(candidate.election, selectedElection.id),
                );
                const votes = asArray(votesResponse).filter((vote) =>
                    sameId(vote.election, selectedElection.id),
                );
                const voters = asArray(votersResponse);
                const startTime = toDate(selectedElection.date_start);
                const endTime = toDate(selectedElection.date_end);
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

                const electionResults = electionCandidates.map((position) => ({
                    position: position.position,
                    abstained: 0,
                    candidates: position.candidates.map((candidate) => ({
                        ...candidate,
                        votes: votes.filter((vote) => sameId(vote.candidate, candidate.id)).length,
                    })),
                }));

                const electionData = {
                    id: selectedElection.id,
                    title: selectedElection.name || `Election ${selectedElection.id}`,
                    description:
                        selectedElection.nft_category
                            ? `Election NFT category: ${selectedElection.nft_category}`
                            : "Election details and live voting information.",
                    status: getStatus(startTime, endTime),
                    totalVoters: turnoutResponse?.total_voters ?? voters.length,
                    totalVotersVoted: turnoutResponse?.voted ?? votedVoterIds.size,
                    startTime,
                    endTime,
                };

                if (isMounted) {
                    setApiData({ electionData, electionCandidates, electionResults });
                }
            } catch (loadError) {
                if (isMounted) {
                    setError(loadError.message);
                    setApiData(null);
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        loadElection();

        return () => {
            isMounted = false;
        };
    }, [requestedElectionId]);

    const {
        electionData,
        electionCandidates,
        electionResults,
    } = apiData ?? fallbackData;
    const timeLeft = useCountdown(electionData.endTime);
    const isUpcoming = electionData.status === "upcoming";
    const isOngoing = electionData.status === "ongoing";
    const isCompleted = electionData.status === "completed";

    const totalPositions = electionCandidates.length;
    const totalCandidates = electionCandidates.reduce(
        (sum, position) => sum + position.candidates.length,
        0
    );

    const positionsWithWinners = useMemo(() => electionResults.map((result) => {
        const maxVotes =
            electionCandidates.find((position) => position.position === result.position)?.maxVotes ?? 1;
        const sortedCandidates = [...result.candidates].sort((a, b) => b.votes - a.votes);
        const totalVotes = sortedCandidates.reduce((sum, candidate) => sum + candidate.votes, 0) + result.abstained;

        return {
            position: result.position,
            totalVotes,
            winners: isCompleted ? sortedCandidates.slice(0, Math.min(maxVotes, sortedCandidates.length)) : [],
        };
    }), [electionCandidates, electionResults, isCompleted]);

    const formatDateTime = (date) => {
        if (!date) return "Not scheduled";

        return date.toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    return(
        <div className="flex flex-col gap-6 min-h-full">
            {isLoading && (
                <div className="bg-surface rounded-2xl px-4 py-3 text-sm text-muted">
                    Loading election details...
                </div>
            )}

            {error && (
                <div className="bg-surface rounded-2xl px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

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
                    onClick={() =>
                        navigate(`/election-voting?election=${electionData.id}`, {
                            state: {
                                electionData,
                                electionCandidates,
                            },
                        })
                    }
                    disabled={!isOngoing}
                    className="shrink-0 px-12 py-4 rounded-xl font-semibold text-lg bg-accent text-accent-foreground shadow-lg transition hover:opacity-90 active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    {isCompleted ? "Voting Closed" : isUpcoming ? "Voting Not Yet Open" : "Vote Now"}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-4 bg-surface rounded-3xl p-5">
                    <h2>Schedule</h2>
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted">Opens</span>
                            <span className="font-medium text-foreground">{formatDateTime(electionData.startTime)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted">Closes</span>
                            <span className="font-medium text-foreground">{formatDateTime(electionData.endTime)}</span>
                        </div>
                    </div>

                    {isOngoing ? (
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
                    ) : (
                        <span className="text-sm font-medium text-foreground">
                            {isUpcoming
                                ? `Voting opens ${formatDateTime(electionData.startTime)}`
                                : "Voting has closed"}
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-4 bg-surface rounded-3xl p-5">
                    <h2>Turnout</h2>
                    <ProgressBar value={electionData.totalVotersVoted} total={electionData.totalVoters} />

                    <h2 className="mt-2">{isCompleted ? "Positions contested" : "Positions up for vote"}</h2>
                    <ul className="flex flex-wrap gap-2">
                        {electionCandidates.map((position) => (
                            <li
                                key={position.position}
                                className="text-sm font-medium text-foreground bg-background px-3 py-1.5 rounded-full"
                            >
                                {position.position}
                            </li>
                        ))}
                    </ul>
                </div>
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

export default ElectionDetailsPage;
