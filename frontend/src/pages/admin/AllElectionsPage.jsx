import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api";
import { useApiQuery } from "../../hooks/useApiQuery";
import {
  ELECTION_STATUS,
  STATUS_LABELS,
  getElectionStatus,
  formatElectionRange,
} from "../../utils/electionStatus";
import { countBallots, turnoutPercent } from "../../utils/tally";

const FILTERS = [
  { id: "all", label: "All" },
  { id: ELECTION_STATUS.DRAFT, label: "Draft" },
  { id: ELECTION_STATUS.LIVE, label: "Live" },
  { id: ELECTION_STATUS.ENDED, label: "Ended" },
];

const EMPTY = { elections: [], votes: [], voters: [] };

function AllElectionsPage() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchElections = useCallback(async (signal) => {
    const [elections, votes, voters] = await Promise.all([
      api.elections.list({ signal }),
      api.votes.list({ signal }),
      api.voters.list({ signal }),
    ]);
    return { elections, votes, voters };
  }, []);

  const { data, loading, error, refresh } = useApiQuery(fetchElections, {
    initialData: EMPTY,
  });

  const { elections, votes, voters } = data ?? EMPTY;

  const rows = useMemo(() => {
    // Voters are registered globally rather than per election, so the roll is
    // the same denominator for every row.
    const rollSize = voters.length;

    return [...elections]
      .sort((a, b) => new Date(b.date_start) - new Date(a.date_start))
      .map((election) => {
        const status = getElectionStatus(election);
        const cast = countBallots(
          votes.filter((vote) => String(vote.election) === String(election.id)),
        );

        return {
          id: election.id,
          title: election.name,
          dates:
            status === ELECTION_STATUS.DRAFT
              ? "Not started"
              : formatElectionRange(election),
          status,
          // A draft has no turnout to report yet, which is different from 0%.
          turnout:
            status === ELECTION_STATUS.DRAFT || rollSize === 0
              ? null
              : turnoutPercent(cast, rollSize),
        };
      });
  }, [elections, votes, voters]);

  const visibleRows =
    activeFilter === "all"
      ? rows
      : rows.filter((row) => row.status === activeFilter);

  // Live monitoring reads any election by id and handles all three states, so
  // every row has somewhere real to land.
  const openElection = (row) =>
    navigate(`/admin/live-monitoring?election=${encodeURIComponent(row.id)}`);

  return (
    <div className="flex flex-col gap-6 min-h-full">
      <button
        type="button"
        onClick={() => navigate("/admin/dashboard")}
        className="self-start text-sm font-medium text-muted transition hover:text-foreground"
      >
        ← Back to Dashboard
      </button>

      <div className="flex flex-col gap-2">
        <h1>All Elections</h1>
        <p className="text-muted max-w-2xl">
          Every election this portal has set up, past and present.
        </p>
      </div>

      {error && (
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
      )}

      <div className="flex flex-col gap-4 bg-surface rounded-3xl p-5">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition ${
                activeFilter === filter.id
                  ? "bg-accent text-accent-foreground border-transparent"
                  : "border-border text-muted hover:text-foreground"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {loading && rows.length === 0 ? (
          <p className="text-sm text-muted">Loading elections…</p>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted">
              No elections have been created yet.
            </p>
            <button
              type="button"
              onClick={() => navigate("/admin/create-election")}
              className="px-5 py-2.5 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80"
            >
              Create an Election
            </button>
          </div>
        ) : visibleRows.length === 0 ? (
          <p className="text-sm text-muted">
            No {STATUS_LABELS[activeFilter]?.toLowerCase()} elections.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted">
                  <th className="font-medium pb-2 pr-4">Election</th>
                  <th className="font-medium pb-2 pr-4">Dates</th>
                  <th className="font-medium pb-2 pr-4">Status</th>
                  <th className="font-medium pb-2">Turnout</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => openElection(row)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openElection(row);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label={`Open ${row.title}`}
                    className="border-t border-border cursor-pointer hover:bg-background focus:outline-none focus:bg-background"
                  >
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {row.title}
                    </td>
                    <td className="py-3 pr-4 text-sm text-muted">{row.dates}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${
                          row.status === ELECTION_STATUS.LIVE
                            ? "bg-accent text-accent-foreground"
                            : "bg-background text-muted"
                        }`}
                      >
                        {row.status === ELECTION_STATUS.LIVE && (
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-foreground animate-pulse" />
                        )}
                        {STATUS_LABELS[row.status]}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-muted tabular-nums">
                      {row.turnout === null ? "—" : `${row.turnout}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllElectionsPage;
