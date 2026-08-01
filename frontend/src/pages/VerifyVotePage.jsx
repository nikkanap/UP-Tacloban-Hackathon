import { useContext } from "react";
import { useLocation } from "react-router-dom";
import { electionDataContext } from "../App";

function VerifyVotePage() {
  const location = useLocation();
  const { electionData } = useContext(electionDataContext);

  const ballotId = location.state?.ballotId ?? "75-3134-123";
  const recordedAt = location.state?.recordedAt ?? new Date();
  const explorerUrl =
    location.state?.explorerUrl ??
    `https://explorer.bitcoinunlimited.info/search?q=${ballotId}`;

  const formatDate = (date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="flex flex-col gap-6 min-h-full">
      <div className="flex-1 flex items-center justify-center bg-surface p-5 rounded-3xl shadow-lg">
        <div className="flex flex-col items-center gap-4 w-full max-w-md px-8 py-12">
          <span className="flex items-center justify-center w-16 h-16 rounded-full bg-background border border-border">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="w-7 h-7 text-foreground"
            >
              <path d="M4 12.5 9.5 18 20 6.5" />
            </svg>
          </span>

          <div className="flex flex-col items-center gap-2 text-center">
            <h1>Ballot Verified</h1>
            <p className="text-muted">
              This ballot was recorded on the blockchain and counted in the
              official tally.
            </p>
          </div>

          <div className="w-full bg-background rounded-xl px-5 py-4 mt-2">
            <span className="block text-center text-2xl font-bold font-mono tracking-wider text-foreground">
              BCH: {ballotId}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-8 w-full mt-2">
            {[
              { label: "Election", value: electionData.title },
              { label: "Recorded", value: formatDate(recordedAt) },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <span className="text-[11px] uppercase tracking-wide text-muted">
                  {label}
                </span>
                <span className="text-sm font-medium text-foreground text-center">
                  {value}
                </span>
              </div>
            ))}
          </div>

          <a
            href={explorerUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-2 px-5 py-2.5 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80"
          >
            View on Public Ledger →
          </a>
        </div>
      </div>
    </div>
  );
}

export default VerifyVotePage;
