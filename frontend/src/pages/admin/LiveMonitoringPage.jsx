import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import StandingsList from "../../components/StandingsList";
import useCountdown from "../../hooks/useCountdown";
import { useAdminElection } from "../../context/AdminElectionContext";
import { buildTally } from "../../utils/mockTally";

function LiveMonitoringPage() {
  const navigate = useNavigate();
  const { election, candidates, voters, locked, getElectionStatus } =
    useAdminElection();

  // Memoised so useCountdown's effect isn't torn down on every render.
  const endDate = useMemo(() => {
    const parsed = election.endTime ? new Date(election.endTime) : null;
    return parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date();
  }, [election.endTime]);

  const timeLeft = useCountdown(endDate);
  const status = getElectionStatus();

  const { votesCast, standings } = useMemo(
    () => buildTally(candidates, voters.length),
    [candidates, voters.length]
  );

  const remaining = Math.max(0, voters.length - votesCast);
  const turnout =
    voters.length > 0 ? Math.round((votesCast / voters.length) * 100) : 0;

  const timeRemainingLabel = election.endTime
    ? timeLeft.totalMs === 0
      ? "Closed"
      : `${timeLeft.days}d ${timeLeft.hours}h`
    : "No end date";

  const stats = [
    { label: "Votes Cast", value: votesCast.toLocaleString() },
    { label: "Turnout", value: `${turnout}%` },
    { label: "Remaining", value: remaining.toLocaleString() },
    { label: "Time Remaining", value: timeRemainingLabel },
  ];

  if (!locked) {
    return (
      <div className="flex flex-col gap-4 min-h-full">
        <button
          type="button"
          onClick={() => navigate("/admin/dashboard")}
          className="self-start text-sm font-medium text-muted transition hover:text-foreground"
        >
          ← Back to Dashboard
        </button>

        <div className="flex flex-col gap-2">
          <h1>Live Monitoring</h1>
          <p className="text-muted max-w-2xl">
            Voting hasn&rsquo;t started. Lock the election to finalize
            candidates and voter credentials, then monitoring begins here.
          </p>
        </div>

        <div className="flex">
          <button
            type="button"
            onClick={() => navigate("/admin/review")}
            className="px-5 py-2.5 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80"
          >
            Go to Review &amp; Lock
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
        className="self-start text-sm font-medium text-muted transition hover:text-foreground"
      >
        ← Back to Dashboard
      </button>

      <div className="flex flex-col gap-3">
        <span className="inline-flex items-center gap-1.5 self-start text-xs font-semibold uppercase tracking-wide text-accent-foreground bg-accent px-3 py-1 rounded-full">
          {status === "live" && (
            <span className="w-1.5 h-1.5 rounded-full bg-accent-foreground animate-pulse" />
          )}
          {status === "live" ? "Live" : "Voting closed"}
        </span>
        <h1>{election.title || "Untitled Election"}</h1>
        <p className="text-muted max-w-2xl">
          Turnout and standings update as ballots are cast.
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
              {votesCast.toLocaleString()} / {voters.length.toLocaleString()}{" "}
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
