import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminElection } from "../../context/AdminElectionContext";
import { buildTally } from "../../utils/mockTally";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "draft", label: "Draft" },
  { id: "live", label: "Live" },
  { id: "ended", label: "Ended" },
];

const STATUS_LABELS = {
  draft: "Draft",
  live: "Live",
  ended: "Ended",
};

const formatDate = (value) => {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

function AllElectionsPage() {
  const navigate = useNavigate();
  const { election, candidates, voters, getElectionStatus, pastElections } =
    useAdminElection();

  const [activeFilter, setActiveFilter] = useState("all");

  const currentStatus = getElectionStatus();

  const { votesCast } = useMemo(
    () => buildTally(candidates, voters.length),
    [candidates, voters.length]
  );

  const currentElection = useMemo(() => {
    const start = formatDate(election.startTime);
    const end = formatDate(election.endTime);

    let dates = "Not scheduled";
    if (start && end) dates = `${start} – ${end}`;
    else if (start) dates = `From ${start}`;
    else if (end) dates = `Until ${end}`;

    return {
      id: "current",
      title: election.title || "Untitled Election",
      dates: currentStatus === "draft" ? "Not started" : dates,
      status: currentStatus,
      turnout:
        currentStatus === "draft" || voters.length === 0
          ? null
          : Math.round((votesCast / voters.length) * 100),
      isCurrent: true,
    };
  }, [election, currentStatus, voters.length, votesCast]);

  // Only the current election has live data behind it, so only it is clickable.
  // Where it goes depends on what stage it's at.
  const openElection = (entry) => {
    if (!entry.isCurrent) return;
    if (entry.status === "draft") navigate("/admin/review");
    else if (entry.status === "live") navigate("/admin/live-monitoring");
    else navigate("/admin/results");
  };

  const allElections = [currentElection, ...pastElections];
  const visibleElections =
    activeFilter === "all"
      ? allElections
      : allElections.filter((entry) => entry.status === activeFilter);

  return (
    <div className="flex flex-col gap-6 min-h-full">
      <button
        type="button"
        onClick={() => navigate("/admin/dashboard")}
        className="self-start px-4 py-2 rounded-lg font-medium text-foreground border border-border transition hover:bg-surface"
      >
        ← Back to Dashboard
      </button>

      <div className="flex flex-col gap-2">
        <h1>All Elections</h1>
        <p className="text-muted max-w-2xl">
          Every election this portal has set up, past and present.
        </p>
      </div>

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

        {visibleElections.length === 0 ? (
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
                {visibleElections.map((entry) => (
                  <tr
                    key={entry.id}
                    onClick={() => openElection(entry)}
                    onKeyDown={(event) => {
                      if (!entry.isCurrent) return;
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        openElection(entry);
                      }
                    }}
                    tabIndex={entry.isCurrent ? 0 : undefined}
                    role={entry.isCurrent ? "button" : undefined}
                    aria-label={
                      entry.isCurrent ? `Open ${entry.title}` : undefined
                    }
                    className={`border-t border-border ${
                      entry.isCurrent
                        ? "cursor-pointer hover:bg-background focus:outline-none focus:bg-background"
                        : ""
                    }`}
                  >
                    <td className="py-3 pr-4 font-medium text-foreground">
                      {entry.title}
                      {entry.isCurrent && (
                        <span className="ml-2 text-xs font-normal text-muted">
                          current
                        </span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-sm text-muted">
                      {entry.dates}
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full ${
                          entry.status === "live"
                            ? "bg-accent text-accent-foreground"
                            : "bg-background text-muted"
                        }`}
                      >
                        {entry.status === "live" && (
                          <span className="w-1.5 h-1.5 rounded-full bg-accent-foreground animate-pulse" />
                        )}
                        {STATUS_LABELS[entry.status]}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-muted tabular-nums">
                      {entry.turnout === null ? "—" : `${entry.turnout}%`}
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
