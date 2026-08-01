import { useNavigate } from "react-router-dom";

function LockedNotice() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 min-h-full">
      <div className="flex flex-col gap-2">
        <h1>This election is locked</h1>
        <p className="text-muted max-w-2xl">
          Candidates and voter credentials have been finalized on-chain and can
          no longer be edited.
        </p>
      </div>

      <div className="flex">
        <button
          type="button"
          onClick={() => navigate("/admin/review")}
          className="px-5 py-2.5 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80"
        >
          Back to Review
        </button>
      </div>
    </div>
  );
}

export default LockedNotice;
