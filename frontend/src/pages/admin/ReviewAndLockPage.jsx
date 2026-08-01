import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConfirmModal from "../../components/ConfirmModal";
import { useAdminElection } from "../../context/AdminElectionContext";

const VOTER_PREVIEW_COUNT = 3;

const searchClass =
  "border border-border bg-background text-foreground text-sm px-3 py-2 rounded-lg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 sm:w-72";

const matchesQuery = (fields, query) =>
  fields.some((field) => String(field ?? "").toLowerCase().includes(query));

function ReviewAndLockPage() {
  const navigate = useNavigate();
  const {
    candidates,
    removeCandidate,
    voters,
    removeVoter,
    locked,
    lockElection,
  } = useAdminElection();

  const [showLockModal, setShowLockModal] = useState(false);
  const [showAllVoters, setShowAllVoters] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState(null);
  const [candidateQuery, setCandidateQuery] = useState("");
  const [voterQuery, setVoterQuery] = useState("");

  const normalizedCandidateQuery = candidateQuery.trim().toLowerCase();
  const filteredCandidates = normalizedCandidateQuery
    ? candidates.filter((candidate) =>
        matchesQuery(
          [candidate.name, candidate.position, candidate.party],
          normalizedCandidateQuery
        )
      )
    : candidates;

  const normalizedVoterQuery = voterQuery.trim().toLowerCase();
  const filteredVoters = normalizedVoterQuery
    ? voters.filter((voter) =>
        matchesQuery(
          [voter.name, voter.voterId, voter.email],
          normalizedVoterQuery
        )
      )
    : voters;

  // While searching, never truncate — hiding matches behind "show all" is worse
  // than a long list.
  const isSearchingVoters = normalizedVoterQuery.length > 0;
  const visibleVoters =
    showAllVoters || isSearchingVoters
      ? filteredVoters
      : filteredVoters.slice(0, VOTER_PREVIEW_COUNT);
  const hiddenVoterCount = filteredVoters.length - visibleVoters.length;

  const confirmLock = () => {
    lockElection();
    setShowLockModal(false);
    navigate("/admin/dashboard");
  };

  const confirmRemoval = () => {
    if (pendingRemoval.type === "candidate") {
      removeCandidate(pendingRemoval.id);
    } else {
      removeVoter(pendingRemoval.id);
    }
    setPendingRemoval(null);
  };

  return (
    <div className="flex flex-col gap-6 min-h-full">
      <button
        type="button"
        onClick={() => navigate("/admin/dashboard")}
        className="self-start text-sm font-medium text-muted transition hover:text-foreground"
      >
        ← Back to Dashboard
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1>Review Registered Data</h1>
          <p className="text-muted max-w-2xl">
            Check everything below before locking. Once locked, candidates and
            voter credentials are finalized on-chain and can no longer be
            edited.
          </p>
        </div>

        {locked ? (
          <span className="shrink-0 px-4 py-2 rounded-full text-sm font-medium bg-background text-muted">
            Locked
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setShowLockModal(true)}
            className="shrink-0 px-5 py-2.5 rounded-lg font-medium bg-red-600 text-white transition hover:opacity-90 active:opacity-80"
          >
            Lock Election
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4 bg-surface rounded-3xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2>Candidates ({candidates.length})</h2>

          {candidates.length > 0 && (
            <input
              type="search"
              value={candidateQuery}
              onChange={(event) => setCandidateQuery(event.target.value)}
              placeholder="Search name, position, or party"
              aria-label="Search candidates"
              className={searchClass}
            />
          )}
        </div>

        {candidates.length === 0 ? (
          <p className="text-sm text-muted">No candidates registered.</p>
        ) : filteredCandidates.length === 0 ? (
          <p className="text-sm text-muted">
            No candidates match &ldquo;{candidateQuery.trim()}&rdquo;.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {filteredCandidates.map((candidate) => (
              <li
                key={candidate.id}
                className="flex items-center justify-between gap-3 bg-background rounded-xl px-4 py-3"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {candidate.name}
                  </span>
                  <span className="text-sm text-muted">
                    {candidate.position}
                    {candidate.party && ` · ${candidate.party}`}
                  </span>
                </div>

                {!locked && (
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => navigate("/admin/register-candidates")}
                      className="text-sm text-muted transition hover:text-foreground"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPendingRemoval({
                          type: "candidate",
                          id: candidate.id,
                          name: candidate.name,
                        })
                      }
                      className="text-sm text-muted transition hover:text-foreground"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-col gap-4 bg-surface rounded-3xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2>Registered Voters ({voters.length})</h2>

          {voters.length > 0 && (
            <input
              type="search"
              value={voterQuery}
              onChange={(event) => setVoterQuery(event.target.value)}
              placeholder="Search name or voter ID"
              aria-label="Search registered voters"
              className={searchClass}
            />
          )}
        </div>

        {voters.length === 0 ? (
          <p className="text-sm text-muted">No voters registered.</p>
        ) : filteredVoters.length === 0 ? (
          <p className="text-sm text-muted">
            No voters match &ldquo;{voterQuery.trim()}&rdquo;.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {visibleVoters.map((voter) => (
              <li
                key={voter.id}
                className="flex items-center justify-between gap-3 bg-background rounded-xl px-4 py-3"
              >
                <div className="flex flex-col">
                  <span className="font-medium text-foreground">
                    {voter.name}
                  </span>
                  <span className="text-sm text-muted tabular-nums">
                    {voter.voterId}
                  </span>
                </div>

                {!locked && (
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => navigate("/admin/register-voters")}
                      className="text-sm text-muted transition hover:text-foreground"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPendingRemoval({
                          type: "voter",
                          id: voter.id,
                          name: voter.name,
                        })
                      }
                      className="text-sm text-muted transition hover:text-foreground"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {isSearchingVoters ? (
          <span className="self-center text-sm text-muted">
            {filteredVoters.length} of {voters.length} voters
          </span>
        ) : (
          filteredVoters.length > VOTER_PREVIEW_COUNT && (
            <button
              type="button"
              onClick={() => setShowAllVoters(!showAllVoters)}
              className="self-center text-sm font-medium text-muted transition hover:text-foreground"
            >
              {showAllVoters
                ? "Show fewer"
                : `Show all ${voters.length} voters (+ ${hiddenVoterCount} more)`}
            </button>
          )
        )}
      </div>

      <ConfirmModal
        open={showLockModal}
        title="Lock this election?"
        message="Candidates and voter credentials will be finalized on-chain and can no longer be edited."
        confirmLabel="Lock Election"
        cancelLabel="Cancel"
        onConfirm={confirmLock}
        onCancel={() => setShowLockModal(false)}
      />

      <ConfirmModal
        open={pendingRemoval !== null}
        title={`Remove ${pendingRemoval?.name}?`}
        message={
          pendingRemoval?.type === "candidate"
            ? "This candidate will be taken off the ballot."
            : "This voter will lose their voting credential."
        }
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={confirmRemoval}
        onCancel={() => setPendingRemoval(null)}
      />
    </div>
  );
}

export default ReviewAndLockPage;
