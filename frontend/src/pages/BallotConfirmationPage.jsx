import { useLocation, useNavigate } from "react-router-dom";

function BallotConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const ballotId = location.state?.ballotId ?? "75-3134-123";

  return (
    <div className="flex flex-col gap-6 min-h-full">
      <div className="flex-1 flex items-center justify-center bg-surface p-5 rounded-3xl shadow-lg">
        <div className="flex flex-col items-center gap-4 w-full max-w-md bg-background rounded-3xl px-8 py-12">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1>Your Vote is Confirmed</h1>
            <p className="text-muted">
              Keep this Ballot ID to verify your vote
            </p>
          </div>

          <div className="w-full bg-surface rounded-xl px-5 py-4 mt-4">
            <span className="block text-center text-2xl font-bold text-foreground tabular-nums">
              BCH: {ballotId}
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate("/verify-vote", { state: { ballotId } })}
            className="w-full px-5 py-2.5 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80"
          >
            Verify My Vote →
          </button>
        </div>
      </div>
    </div>
  );
}

export default BallotConfirmationPage;
