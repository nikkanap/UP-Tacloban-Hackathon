import { useLocation, useNavigate } from "react-router-dom";
import SubmittedVotePanel from "../components/SubmittedVotePanel";

function BallotConfirmationPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const ballotId = location.state?.ballotId ?? "75-3134-123";

  return (
    <div className="flex flex-col gap-6 min-h-full">
      <SubmittedVotePanel
        ballotId={ballotId}
        onVerify={() => navigate("/verify-vote", { state: { ballotId } })}
        onBackToDetails={() => navigate("/election-details")}
      />
    </div>
  );
}

export default BallotConfirmationPage;
