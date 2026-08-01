import { use, useState } from "react";
import { useNavigate } from "react-router-dom";

const VOTER_PREVIEW_COUNT = 3;

function ReviewAndLockPage() {
  const navigate = useNavigate();
  const [showLockModal, setShowLockModal] = useState(false);

  const [candidates, setCandidates] = useState([
    { name: "Geoffrey Tomagan", position: "President", party: "Party A" },
    { name: "Daniel Cho", position: "President", party: "Party B" },
    { name: "Priya Nair", position: "Vice President", party: "Party C" },
  ]);

  const [voters, setVoters] = useState([
    { name: "Jordan Alvarez", voterId: "RHC-04821" },
    { name: "Amara Osei", voterId: "RHC-04822" },
    { name: "Daniel Cho", voterId: "RHC-04823" },
    { name: "Maria Santos", voterId: "RHC-04824" },
    { name: "Liam Reyes", voterId: "RHC-04825" },
  ]);

  const removeCandidate = (index) => {
    setCandidates(candidates.filter((_, i) => i !== index));
  };

  const removeVoter = (index) => {
    setVoters(voters.filter((_, i) => i !== index));
  };

  const visibleVoters = voters.slice(0, VOTER_PREVIEW_COUNT);
  const hiddenVoterCount = voters.length - visibleVoters.length;

  const confirmLock = () => {
    setShowLockModal(false);
    navigate("/admin/live-monitoring");
  };

  return (
    // Title and Lock Button
    <div className="flex flex-col gap-6 min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1>Review Registered Data</h1>
          <p className="text-muted max-w-2xl">
            Check everything below before locking. Once locked, candidates and
            voter credentials are finalized on-chain and can no longer be
            edited.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowLockModal(true)}
          className="shrink-0 px-5 py-2.5 rounded-lg font-medium bg-red-600 text-white transition hover:opacity-90 active:opacity-80"
        >
          Lock Election
        </button>
      </div>

      {/* Candidate Showing */}
      <div className="flex flex-col gap-4 bg-surface rounded-3xl p-5">
        <h2>Candidates ({candidates.length})</h2>

        {candidates.length === 0 ? (
          <p className="text-sm text-muted">No candidates registered.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {candidates.map((candidate, index) => (
              <li
                key={`${candidate.name}-${index}`}
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
                    onClick={() => removeCandidate(index)}
                    className="text-sm text-muted transition hover:text-foreground"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Registered Voters Show */}
      <div className="flex flex-col gap-4 bg-surface rounded-3xl p-5">
        <h2>Registered Voters ({voters.length})</h2>

        {voters.length === 0 ? (
          <p className="text-sm text-muted">No voters registered.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {visibleVoters.map((voter, index) => (
              <li
                key={voter.voterId}
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
                    onClick={() => removeVoter(index)}
                    className="text-sm text-muted transition hover:text-foreground"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}

            {hiddenVoterCount > 0 && (
              <li className="flex justify-center text-sm text-muted py-2">
                + {hiddenVoterCount} more
              </li>
            )}
          </ul>
        )}
      </div>

      {showLockModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5"
          onClick={() => setShowLockModal(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="lockTitle"
            onClick="flex flex-col gap-4 w-full max-w-sm bg-surface rounded-3xl p-6 shadow-lg"
          >
            <h2 id="lockTitle">Lock this election?</h2>
            <p className="text-sm text-muted">
              Candidates and voter credentials will be finalized on-chain can no
              longer be edited
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowLockModal(false)}
                className="flex-1 px-4 py-2.5 rounded-lg font-medium border border-border text-foreground transition hover:bg-background"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmLock}
                className="flex-1 px-4 py-2.5 rounded-lg font-medium bg-red-600 text-white transition hover:opacity-90 active:opacity-80"
              >
                Lock Election
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReviewAndLockPage;
