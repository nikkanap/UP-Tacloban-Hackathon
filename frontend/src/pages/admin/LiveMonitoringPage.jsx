import { useCallback, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import StandingsList from "../../components/StandingsList";
import useCountdown from "../../hooks/useCountdown";
import { api } from "../../services/api";
import { useApiQuery } from "../../hooks/useApiQuery";
import {
  ELECTION_STATUS,
  getElectionStatus,
  formatElectionRange,
} from "../../utils/electionStatus";
import { buildTally, recentBallots, turnoutPercent } from "../../utils/tally";
import { explorerTxUrl, shortTxid } from "../../utils/explorer";

const REFRESH_MS = 15000;

const EMPTY = {
  election: null,
  votes: [],
  voters: [],
  candidates: [],
  positions: [],
};

const formatTime = (value) => {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? "—"
    : parsed.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
};

function LiveMonitoringPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedId = searchParams.get("election");

  const fetchMonitoring = useCallback(
    async (signal) => {
      const [elections, votes, voters, candidates, positions] =
        await Promise.all([
          api.elections.list({ signal }),
          api.votes.list({ signal }),
          api.voters.list({ signal }),
          api.candidates.list({ signal }),
          api.positions.list({ signal }),
        ]);

      // ?election=<id> wins; otherwise monitor whichever election is currently
      // open, falling back to the most recently scheduled one.
      const election =
        (requestedId &&
          elections.find((entry) => String(entry.id) === requestedId)) ||
        elections.find(
          (entry) => getElectionStatus(entry) === ELECTION_STATUS.LIVE,
        ) ||
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

  const { data, loading, error, refresh } = useApiQuery(fetchMonitoring, {
    initialData: EMPTY,
  });

  const { election, votes, voters, candidates, positions } = data ?? EMPTY;

  // "Live" means live — poll while the election is open.
  const status = election ? getElectionStatus(election) : null;
  const isLive = status === ELECTION_STATUS.LIVE;

  useEffect(() => {
    if (!isLive) return undefined;
    const timer = setInterval(refresh, REFRESH_MS);
    return () => clearInterval(timer);
  }, [isLive, refresh]);

  const endDate = useMemo(() => {
    const parsed = election?.date_end ? new Date(election.date_end) : null;
    return parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date();
  }, [election?.date_end]);

  const timeLeft = useCountdown(endDate);

  const { votesCast, ballotsCast, standings } = useMemo(
    () => buildTally(votes, candidates, positions),
    [votes, candidates, positions],
  );

  const ledger = useMemo(() => recentBallots(votes), [votes]);

  const turnout = turnoutPercent(ballotsCast, voters.length);
  const remaining = Math.max(0, voters.length - ballotsCast);

  const timeRemainingLabel = !election?.date_end
    ? "No end date"
    : timeLeft.totalMs === 0
      ? "Closed"
      : `${timeLeft.days}d ${timeLeft.hours}h`;

  const stats = [
    { label: "Ballots Cast", value: ballotsCast.toLocaleString() },
    { label: "Turnout", value: `${turnout}%` },
    { label: "Remaining", value: remaining.toLocaleString() },
    { label: "Time Remaining", value: timeRemainingLabel },
  ];

  const backButton = (
    <button
      type="button"
      onClick={() => navigate("/admin/dashboard")}
      className="self-start text-sm font-medium text-muted transition hover:text-foreground"
    >
      ← Back to Dashboard
    </button>
  );

  if (loading && !election) {
    return (
      <div className="flex flex-col gap-4 min-h-full">
        {backButton}
        <h1>Live Monitoring</h1>
        <p className="text-muted">Loading election data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 min-h-full">
        {backButton}
        <h1>Live Monitoring</h1>
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
          <h1>Live Monitoring</h1>
          <p className="text-muted max-w-2xl">
            No elections exist yet, so there is nothing to monitor.
          </p>
        </div>
        <div className="flex">
          <button
            type="button"
            onClick={() => navigate("/admin/create-election")}
            className="px-5 py-2.5 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80"
          >
            Create an Election
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 min-h-full">
      {backButton}

      <div className="flex flex-col gap-3">
        <span className="inline-flex items-center gap-1.5 self-start text-xs font-semibold uppercase tracking-wide text-accent-foreground bg-accent px-3 py-1 rounded-full">
          {isLive && (
            <span className="w-1.5 h-1.5 rounded-full bg-accent-foreground animate-pulse" />
          )}
          {isLive
            ? "Live"
            : status === ELECTION_STATUS.DRAFT
              ? "Not started"
              : "Voting closed"}
        </span>
        <h1>{election.name}</h1>
        <p className="text-muted max-w-2xl">
          {formatElectionRange(election)} · turnout and standings update as
          ballots are recorded on chain.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(({ label, value }) => (
          <div
            key={label}
            className="flex flex-col gap-1 bg-surface rounded-2xl p-4"
          >
            <span className="text-2xl font-bold text-foreground tabular-nums">
              {value}
            </span>
            <span className="text-sm text-muted">{label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 bg-surface rounded-3xl p-5">
        <h2>Turnout</h2>
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-sm text-muted">
            <span>
              {ballotsCast.toLocaleString()} / {voters.length.toLocaleString()}{" "}
              voted
            </span>
            <span className="tabular-nums">{turnout}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-background overflow-hidden">
            <div
              className="h-full rounded-full bg-accent transition-[width]"
              style={{ width: `${turnout}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 bg-surface rounded-3xl p-5">
        <h2>Standings</h2>
        <StandingsList standings={standings} />
      </div>

      <div className="flex flex-col gap-4 bg-surface rounded-3xl p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2>Ballot Ledger</h2>
          <span className="text-sm text-muted tabular-nums">
            {votesCast.toLocaleString()} vote
            {votesCast === 1 ? "" : "s"} recorded
          </span>
        </div>
        <p className="text-sm text-muted">
          Every ballot as it was written to chipnet. Anyone can check a
          transaction against the public ledger.
        </p>

        {ledger.length === 0 ? (
          <p className="text-sm text-muted">No ballots recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted">
                  <th className="font-medium pb-2 pr-4">Recorded</th>
                  <th className="font-medium pb-2 pr-4">Transaction</th>
                  <th className="font-medium pb-2">Proof</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((vote) => {
                  const url = explorerTxUrl(vote.vote_txid);
                  return (
                    <tr key={vote.id} className="border-t border-border">
                      <td className="py-3 pr-4 text-sm text-muted whitespace-nowrap">
                        {formatTime(vote.date_voted)}
                      </td>
                      <td className="py-3 pr-4 text-sm font-mono text-foreground">
                        {shortTxid(vote.vote_txid)}
                      </td>
                      <td className="py-3 text-sm">
                        {url ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-color  underline underline-offset-2"
                          >
                            View on ledger →
                          </a>
                        ) : (
                          <span className="text-muted">Not on chain</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate("/admin/results")}
          className="px-5 py-2.5 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80"
        >
          View Results →
        </button>
      </div>
    </div>
  );
}

export default LiveMonitoringPage;
