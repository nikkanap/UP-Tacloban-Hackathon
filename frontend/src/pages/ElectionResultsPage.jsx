import { useContext, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { electionDataContext } from "../App";
import { apiRequest } from "../api";
import StatusBadge from "../components/StatusBadge";
import CurrentPollsPanel from "../components/CurrentPollsPanel";
import WinnersPanel from "../components/WinnersPanel";
import defaultCandidateImage from "../assets/images/candidates/default-candidate.png";

function ElectionResultsPage(){
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const fallbackData = useContext(electionDataContext);
    const [apiData, setApiData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const requestedElectionId =
        searchParams.get("election") ||
        searchParams.get("id") ||
        location.state?.electionId;
    const routedTxid =
        searchParams.get("txid") ||
        location.state?.txid ||
        location.state?.txId;
    const queryTxids = (searchParams.get("txids") || "")
        .split(",")
        .map((txid) => txid.trim())
        .filter(Boolean);
    const routedTxids = [
        ...queryTxids,
        ...(location.state?.txids ?? []),
        ...(routedTxid ? [routedTxid] : []),
    ].filter(Boolean);
    const submittedCandidateIds = (location.state?.submittedCandidateIds ?? []).map(String);
    const submittedVotes = location.state?.submittedVotes ?? [];

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

        const loadResults = async () => {
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
                const voteTxids = votes
                    .map((vote) => vote.vote_txid)
                    .filter(Boolean);
                const submittedTxidSet = new Set(routedTxids);
                const submittedVoteCandidates = candidates
                    .filter((candidate) =>
                        submittedCandidateIds.includes(String(candidate.id)) ||
                        votes.some((vote) =>
                            sameId(vote.candidate, candidate.id) &&
                            submittedTxidSet.has(vote.vote_txid)
                        ) ||
                        submittedVotes.some((vote) => sameId(vote.candidate, candidate.id))
                    )
                    .map((candidate) => {
                        const position = positions.find((entry) =>
                            sameId(entry.id, candidate.position),
                        );

                        return {
                            id: candidate.id,
                            name: candidate.full_name || `Candidate ${candidate.id}`,
                            position: position?.name || `Position ${candidate.position}`,
                        };
                    });

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
                            : "Election results and blockchain vote records.",
                    status: getStatus(startTime, endTime),
                    totalVoters: turnoutResponse?.total_voters ?? voters.length,
                    totalVotersVoted: turnoutResponse?.voted ?? votedVoterIds.size,
                    startTime,
                    endTime,
                };

                if (isMounted) {
                    setApiData({
                        electionData,
                        electionCandidates,
                        electionResults,
                        blockchainTxid: routedTxid ?? voteTxids.at(-1) ?? "",
                        voteTxids,
                        submittedVoteCandidates,
                    });
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

        loadResults();

        return () => {
            isMounted = false;
        };
    }, [requestedElectionId, routedTxid]);

    const {
        electionData,
        electionCandidates,
        electionResults,
        blockchainTxid = routedTxid ?? "",
        voteTxids = [],
        submittedVoteCandidates = [],
    } = apiData ?? fallbackData;
    const detailsPath = electionData.id ? `/election-details?election=${electionData.id}` : "/election-details";
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

    const explorerUrl = blockchainTxid
        ? `https://explorer.bitcoinunlimited.info/search?q=${blockchainTxid}`
        : "";

    return(
        <div className="flex flex-col gap-6 min-h-full">
            {isLoading && (
                <div className="bg-surface rounded-2xl px-4 py-3 text-sm text-muted">
                    Loading election results...
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
                    onClick={() => navigate(detailsPath)}
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

            {submittedVoteCandidates.length > 0 && (
                <div className="flex flex-col gap-4 bg-surface rounded-3xl p-5">
                    <h2>Your Submitted Votes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {submittedVoteCandidates.map((candidate) => (
                            <div key={candidate.id} className="flex flex-col gap-1 rounded-xl bg-background px-4 py-3">
                                <span className="text-sm text-muted">{candidate.position}</span>
                                <span className="font-semibold text-foreground">{candidate.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-4 bg-surface rounded-3xl p-5">
                <h2>Blockchain Proof</h2>
                {blockchainTxid ? (
                    <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1 text-sm">
                            <span className="text-muted">Transaction ID</span>
                            <span className="font-medium text-foreground tabular-nums break-all">
                                {blockchainTxid}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <a
                                href={explorerUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex px-4 py-2 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80"
                            >
                                View on Public Ledger →
                            </a>
                            {voteTxids.length > 1 && (
                                <span className="text-sm text-muted">
                                    {voteTxids.length.toLocaleString()} vote transactions recorded
                                </span>
                            )}
                        </div>
                    </div>
                ) : (
                    <p className="text-sm text-muted">
                        No blockchain transaction ID has been recorded for this election yet.
                    </p>
                )}
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
