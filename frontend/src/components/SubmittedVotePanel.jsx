function SubmittedVotePanel({ ballotId, onVerify, onBackToDetails }) {
    return (
        <div className="flex flex-col gap-5 bg-surface p-5 rounded-3xl shadow-lg">
            <h2 className="text-center">Vote Submitted</h2>

            <div className="flex flex-col items-center gap-4 py-6">
                <div className="flex flex-col items-center gap-1 text-center">
                    <span className="font-semibold text-foreground">Your Vote is Confirmed</span>
                    <p className="text-sm text-muted">
                        Keep this Ballot ID to verify your vote
                    </p>
                </div>

                <div className="w-full max-w-sm bg-background rounded-2xl px-5 py-4">
                    <span className="block text-center text-xl font-bold text-foreground tabular-nums">
                        BCH: {ballotId}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={onVerify}
                    className="w-full max-w-sm px-5 py-2.5 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80"
                >
                    Verify My Vote →
                </button>

                <button
                    type="button"
                    onClick={onBackToDetails}
                    className="w-full max-w-sm px-5 py-2.5 rounded-lg font-medium text-foreground border border-border transition hover:bg-background"
                >
                    Back to Election Details
                </button>
            </div>
        </div>
    );
}

export default SubmittedVotePanel;
