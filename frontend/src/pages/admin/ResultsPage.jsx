import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal";
import StandingsList from "../../components/StandingsList";
import {
  RESULTS_TX_ID,
  useAdminElection,
} from "../../context/AdminElectionContext";
import { buildTally } from "../../utils/mockTally";

function ResultsPage() {
  const navigate = useNavigate();
  const { election, candidates, voters, locked, published, publishResults } =
    useAdminElection();

  const [showPublishModal, setShowPublishModal] = useState(false);

  const { votesCast, standings } = useMemo(
    () => buildTally(candidates, voters.length),
    [candidates, voters.length]
  );

  const turnout =
    voters.length > 0 ? Math.round((votesCast / voters.length) * 100) : 0;
  const winner = standings[0] ?? null;
  const shortTx = `${RESULTS_TX_ID.slice(0, 4)}...${RESULTS_TX_ID.slice(-4)}`;

  const confirmPublish = () => {
    publishResults();
    setShowPublishModal(false);
  };

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
          <h1>Results</h1>
          <p className="text-muted max-w-2xl">
            There are no results yet. Lock the election and let voting run
            before results can be tallied.
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
        <span className="inline-flex items-center self-start text-xs font-semibold uppercase tracking-wide text-muted bg-surface px-3 py-1 rounded-full">
          {published ? "Results published" : "Election closed"}
        </span>
        <h1>Final Results — {election.title || "Untitled Election"}</h1>
      </div>

      {winner ? (
        <div className="flex items-center gap-4 bg-surface rounded-3xl p-5">
          <span className="flex items-center justify-center w-11 h-11 shrink-0 rounded-full bg-accent text-accent-foreground text-lg font-bold">
            1
          </span>
          <div className="flex flex-col">
            <span className="text-lg font-semibold text-foreground">
              {winner.name} elected — {winner.votes.toLocaleString()} votes (
              {winner.percentage}%)
            </span>
            <span className="text-sm text-muted">
              {voters.length.toLocaleString()} credentials ·{" "}
              {votesCast.toLocaleString()} cast · {turnout}% turnout
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-surface rounded-3xl p-5">
          <p className="text-sm text-muted">
            No candidates were registered, so there is no result to report.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4 bg-surface rounded-3xl p-5">
        <h2>Final Tally</h2>
        <StandingsList standings={standings} />
      </div>

      <div className="flex flex-col gap-4 bg-surface rounded-3xl p-5">
        <h2>Blockchain Proof</h2>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-baseline gap-3 text-sm">
            <span className="text-muted">Final tally tx</span>
            <span className="font-medium text-foreground tabular-nums break-all">
              {shortTx}
            </span>
          </div>
          <span className="text-sm text-muted">
            Explorer link becomes available once the contract is wired up.
          </span>
        </div>
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
        onConfirm={confirmPublish}
        onCancel={() => setShowPublishModal(false)}
      />
    </div>
  );
}

export default ResultsPage;
