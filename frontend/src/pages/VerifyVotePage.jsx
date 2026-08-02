import { useCallback, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import { useApiQuery } from "../hooks/useApiQuery";
import { explorerTxUrl } from "../utils/explorer";

// Voter-facing transparency: hand it a ballot transaction id and it proves the
// ballot exists in the tally, then links out to the public chipnet ledger so
// the claim can be checked without trusting this app.
function VerifyVotePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Arrives from the confirmation screen, a shared ?txid= link, or by hand.
  const initialTxid =
    location.state?.ballotId ?? searchParams.get("txid") ?? "";

  const [input, setInput] = useState(initialTxid);
  const [txid, setTxid] = useState(initialTxid);

  const lookup = useCallback(
    async (signal) => {
      if (!txid) return { vote: null, election: null, candidate: null };

      const vote = await api.votes.findByTxid(txid, { signal });
      if (!vote) return { vote: null, election: null, candidate: null };

      // Resolve the labels the receipt shows. Either can 404 on partially seeded
      // data, which should not sink an otherwise valid verification.
      const [election, candidate] = await Promise.all([
        api.elections.retrieve(vote.election, { signal }).catch(() => null),
        api.candidates.retrieve(vote.candidate, { signal }).catch(() => null),
      ]);

      return { vote, election, candidate };
    },
    [txid],
  );

  const { data, loading, error, refresh } = useApiQuery(lookup, {
    initialData: { vote: null, election: null, candidate: null },
  });

  const { vote, election, candidate } = data ?? {};

  const submit = (event) => {
    event.preventDefault();
    const next = input.trim();
    if (next === txid) refresh();
    else setTxid(next);
  };

  const formatDate = (value) => {
    if (!value) return "—";
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? "—"
      : parsed.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        });
  };

  const verified = Boolean(vote);
  const explorer = explorerTxUrl(vote?.vote_txid ?? txid);

  const icon = verified ? (
    <path d="M4 12.5 9.5 18 20 6.5" />
  ) : (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6M12 16.5v.5" />
    </>
  );

  let heading = "Verify a Ballot";
  let blurb =
    "Paste a ballot transaction ID to confirm it was recorded on chain and counted in the official tally.";

  if (loading) {
    heading = "Checking…";
    blurb = "Looking this ballot up in the tally.";
  } else if (error) {
    heading = "Could Not Verify";
    blurb = error.message;
  } else if (txid && verified) {
    heading = "Ballot Verified";
    blurb =
      "This ballot was recorded on the blockchain and counted in the official tally.";
  } else if (txid && !verified) {
    heading = "Ballot Not Found";
    blurb =
      "No ballot with this transaction ID is in the tally. Check the ID for typos.";
  }

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
              {icon}
            </svg>
          </span>

          <div className="flex flex-col items-center gap-2 text-center">
            <h1>{heading}</h1>
            <p className="text-muted">{blurb}</p>
          </div>

          <form onSubmit={submit} className="w-full flex flex-col gap-2 mt-2">
            <label
              htmlFor="txid"
              className="text-[11px] uppercase tracking-wide text-muted"
            >
              Ballot transaction ID
            </label>
            <div className="flex gap-2">
              <input
                id="txid"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="e.g. a3f9c41d7b2e…"
                spellCheck={false}
                className="flex-1 min-w-0 bg-background rounded-lg px-3 py-2.5 text-sm font-mono text-foreground border border-border focus:outline-none focus:border-accent"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="shrink-0 px-4 py-2.5 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80 disabled:opacity-50"
              >
                Verify
              </button>
            </div>
          </form>

          {verified && (
            <>
              <div className="w-full bg-background rounded-xl px-5 py-4 mt-2">
                <span className="block text-center text-sm font-bold font-mono tracking-wider text-foreground break-all">
                  {vote.vote_txid}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-8 w-full mt-2">
                {[
                  { label: "Election", value: election?.name ?? vote.election },
                  { label: "Recorded", value: formatDate(vote.date_voted) },
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

              {candidate && (
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[11px] uppercase tracking-wide text-muted">
                    Counted for
                  </span>
                  <span className="text-sm font-medium text-foreground text-center">
                    {candidate.full_name}
                  </span>
                </div>
              )}
            </>
          )}

          {explorer && txid && (
            <a
              href={explorer}
              target="_blank"
              rel="noreferrer"
              className="mt-2 w-full text-center px-5 py-2.5 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80"
            >
              View on Public Ledger →
            </a>
          )}

          <button
            type="button"
            onClick={() => navigate("/election-details")}
            className="w-full px-5 py-2.5 rounded-lg font-medium text-foreground border border-border transition hover:bg-background"
          >
            ← Back to Election Details
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyVotePage;
