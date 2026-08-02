import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal";
import StandingsList from "../../components/StandingsList";
import { api } from "../../services/api";
import { useApiQuery } from "../../hooks/useApiQuery";
import {
  ELECTION_STATUS,
  getElectionStatus,
  formatElectionRange,
} from "../../utils/electionStatus";
import {
  buildTally,
  turnoutPercent,
  winnersByPosition,
} from "../../utils/tally";
import { explorerTxUrl, shortTxid } from "../../utils/explorer";

const EMPTY = {
  election: null,
  votes: [],
  voters: [],
  candidates: [],
  positions: [],
};

function ResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedId = searchParams.get("election");

  const [showPublishModal, setShowPublishModal] = useState(false);
  // The backend has no published flag, so this is only for the current session.
  const [published, setPublished] = useState(false);

  const fetchResults = useCallback(
    async (signal) => {
      const [elections, votes, voters, candidates, positions] =
        await Promise.all([
          api.elections.list({ signal }),
          api.votes.list({ signal }),
          api.voters.list({ signal }),
          api.candidates.list({ signal }),
          api.positions.list({ signal }),
        ]);

      // ?election=<id> wins; otherwise report on the most recently closed
      // election, since that is what "results" usually means.
      const ended = elections
        .filter((entry) => getElectionStatus(entry) === ELECTION_STATUS.ENDED)
        .sort((a, b) => new Date(b.date_end) - new Date(a.date_end));

      const election =
        (requestedId &&
          elections.find((entry) => String(entry.id) === requestedId)) ||
        ended[0] ||
        [...elections].sort(
          (a, b) => new Date(b.date_start) - new Date(a.date_start),
        )[0] ||
        null;

      if (!election) return EMPTY;

      const forElection = (rows) =>
        rows.filter((row) => String(row.election) === String(election.id));

      return {
        election,
        voters,
        votes: forElection(votes),
        candidates: forElection(candidates),
        positions: forElection(positions),
      };
    },
    [requestedId],
  );

  const { data, loading, error, refresh } = useApiQuery(fetchResults, {
    initialData: EMPTY,
  });

  const { election, votes, voters, candidates, positions } = data ?? EMPTY;

  const status = election ? getElectionStatus(election) : null;
  const isFinal = status === ELECTION_STATUS.ENDED;

  const { ballotsCast, standings } = useMemo(
    () => buildTally(votes, candidates, positions),
    [votes, candidates, positions],
  );

  const winners = useMemo(() => winnersByPosition(standings), [standings]);

  const turnout = turnoutPercent(ballotsCast, voters.length);

  // Ballots are the proof: the tally is derived from them, not asserted.
  const onChain = useMemo(
    () => votes.filter((vote) => vote.vote_txid),
    [votes],
  );

  const backButton = (
    <button
      type="button"
      onClick={() => navigate("/admin/dashboard")}
      className="self-start px-4 py-2 rounded-lg font-medium text-foreground border border-border transition hover:bg-surface"
    >
      ← Back to Dashboard
    </button>
  );

  if (loading && !election) {
    return (
      <div className="flex flex-col gap-4 min-h-full">
        {backButton}
        <h1>Results</h1>
        <p className="text-muted">Loading results…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 min-h-full">
        {backButton}
        <h1>Results</h1>
        <div className="flex flex-wrap items-center justify-between gap-3 border border-border rounded-2xl p-4">
          <span className="text-sm text-foreground">{error.message}</span>
          <button
            type="button"
            onClick={refresh}
            className="px-4 py-1.5 rounded-lg text-sm font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="flex flex-col gap-4 min-h-full">
        {backButton}
        <div className="flex flex-col gap-2">
          <h1>Results</h1>
          <p className="text-muted max-w-2xl">
            No elections exist yet, so there is nothing to tally.
          </p>
        </div>
      </div>
    );
  }

  if (status === ELECTION_STATUS.DRAFT) {
    return (
      <div className="flex flex-col gap-4 min-h-full">
        {backButton}
        <div className="flex flex-col gap-2">
          <h1>Results — {election.name}</h1>
          <p className="text-muted max-w-2xl">
            Voting has not opened yet, so there are no results. This election
            runs {formatElectionRange(election)}.
          </p>
        </div>
        <div className="flex">
          <button
            type="button"
            onClick={() => navigate("/admin/elections")}
            className="px-5 py-2.5 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80"
          >
            Back to All Elections
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 min-h-full">
      <button
        type="button"
        onClick={() => navigate("/admin/dashboard")}
        className="self-start px-4 py-2 rounded-lg font-medium text-foreground border border-border transition hover:bg-surface"
      >
        ← Back to Dashboard
      </button>
      {backButton}

      <div className="flex flex-col gap-3">
        <span className="inline-flex items-center self-start text-xs font-semibold uppercase tracking-wide text-muted bg-surface px-3 py-1 rounded-full">
          {published
            ? "Results published"
            : isFinal
              ? "Election closed"
              : "Voting still open"}
        </span>
        <h1>
          {isFinal ? "Final Results" : "Provisional Results"} — {election.name}
        </h1>
        {!isFinal && (
          <p className="text-muted max-w-2xl">
            Voting is still open, so these standings can still change.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4 bg-surface rounded-3xl p-5">
        <h2>{isFinal ? "Elected" : "Currently Leading"}</h2>
        {winners.length === 0 ? (
          <p className="text-sm text-muted">
            No candidates were registered, so there is no result to report.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {winners.map((entry) => (
              <li key={entry.positionId} className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wide text-muted">
                  {entry.position ?? "Position"}
                </span>
                {entry.leaders.length === 0 ? (
                  <span className="text-sm text-muted">
                    No votes cast for this position.
                  </span>
                ) : (
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-lg font-semibold text-foreground">
                      {entry.leaders.map((leader) => leader.name).join(" · ")}
                    </span>
                    <span className="text-sm text-muted tabular-nums">
                      {entry.leaders[0].votes.toLocaleString()} votes (
                      {entry.leaders[0].percentage}%)
                    </span>
                    {entry.tied && (
                      <span className="text-xs font-semibold uppercase tracking-wide text-accent-foreground bg-accent px-2 py-0.5 rounded-full">
                        Tied
                      </span>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        <span className="text-sm text-muted">
          {voters.length.toLocaleString()} registered ·{" "}
          {ballotsCast.toLocaleString()} voted · {turnout}% turnout
        </span>
      </div>

      <div className="flex flex-col gap-4 bg-surface rounded-3xl p-5">
        <h2>{isFinal ? "Final Tally" : "Current Tally"}</h2>
        <StandingsList standings={standings} />
      </div>

      <div className="flex flex-col gap-4 bg-surface rounded-3xl p-5">
        <h2>Blockchain Proof</h2>
        <p className="text-sm text-muted">
          This tally is not asserted by this server — it is counted from ballots
          recorded on chipnet. Each one can be checked independently.
        </p>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap justify-between items-baseline gap-3 text-sm">
            <span className="text-muted">Election token category</span>
            <span className="font-medium text-foreground font-mono break-all">
              {election.nft_category ? (
                shortTxid(election.nft_category)
              ) : (
                <span className="text-muted font-sans">Not minted</span>
              )}
            </span>
          </div>
          <div className="flex justify-between items-baseline gap-3 text-sm">
            <span className="text-muted">Ballots recorded on chain</span>
            <span className="font-medium text-foreground tabular-nums">
              {onChain.length.toLocaleString()} of {votes.length.toLocaleString()}
            </span>
          </div>
        </div>

        {onChain.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[11px] uppercase tracking-wide text-muted">
              Most recent ballots
            </span>
            <ul className="flex flex-col gap-1.5">
              {onChain.slice(0, 3).map((vote) => (
                <li
                  key={vote.id}
                  className="flex flex-wrap justify-between items-baseline gap-2 text-sm"
                >
                  <span className="font-mono text-foreground">
                    {shortTxid(vote.vote_txid)}
                  </span>
                  <a
                    href={explorerTxUrl(vote.vote_txid)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-accent-foreground underline underline-offset-2"
                  >
                    View on ledger →
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            navigate(
              `/admin/live-monitoring?election=${encodeURIComponent(election.id)}`,
            )
          }
          className="self-start text-sm font-medium text-muted transition hover:text-foreground"
        >
          View full ballot ledger →
        </button>
      </div>

      <div className="flex justify-end">
        {published ? (
          <span className="px-5 py-2.5 rounded-lg font-medium bg-surface text-muted">
            Published
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setShowPublishModal(true)}
            className="px-5 py-2.5 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80"
          >
            Publish Results
          </button>
        )}
      </div>

      <ConfirmModal
        open={showPublishModal}
        title="Publish these results?"
        message="Voters will be able to see the final tally. This cannot be undone."
        confirmLabel="Publish"
        cancelLabel="Cancel"
        onConfirm={() => {
          setPublished(true);
          setShowPublishModal(false);
        }}
        onCancel={() => setShowPublishModal(false)}
      />
    </div>
  );
}

export default ResultsPage;
