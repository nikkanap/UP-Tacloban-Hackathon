import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LockedNotice from "../../components/LockedNotice";
import { useAdminElection } from "../../context/AdminElectionContext";

const inputClass =
  "border border-border bg-background text-foreground p-2.5 rounded-lg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

function RegisterCandidatesPage() {
  const navigate = useNavigate();
  const { election, candidates, addCandidate, removeCandidate, locked } =
    useAdminElection();

  const positionOptions = election.positions.map((position) => position.name);

  const [form, setForm] = useState({
    name: "",
    position: positionOptions[0] ?? "",
    party: "",
    bio: "",
  });

  if (locked) return <LockedNotice />;

  const updateField = (field) => (event) =>
    setForm({ ...form, [field]: event.target.value });

  const handleAddCandidate = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.position) return;
    addCandidate({ ...form, name: form.name.trim() });
    setForm({
      name: "",
      position: positionOptions[0] ?? "",
      party: "",
      bio: "",
    });
  };

  const getInitials = (name) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();

  return (
    <div className="flex flex-col gap-6 min-h-full">
      <button
        type="button"
        onClick={() => navigate("/admin/dashboard")}
        className="self-start text-sm font-medium text-muted transition hover:text-foreground"
      >
        ← Back to Dashboard
      </button>

      <div className="flex flex-col gap-2">
        <h1>Register Candidates</h1>
        <p className="text-muted max-w-2xl">
          Add each candidate running for a position on the ballot.
        </p>
      </div>

      <form
        onSubmit={handleAddCandidate}
        className="flex flex-col gap-5 bg-surface rounded-3xl p-5"
      >
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="flex items-center justify-center w-20 h-20 shrink-0 rounded-full border border-border bg-background text-muted font-semibold">
            {form.name ? getInitials(form.name) : "?"}
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="candidateName"
                className="text-sm font-medium text-foreground"
              >
                Candidate Name
              </label>
              <input
                id="candidateName"
                type="text"
                value={form.name}
                onChange={updateField("name")}
                placeholder="Full name"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="candidatePosition"
                className="text-sm font-medium text-foreground"
              >
                Candidate Position
              </label>
              <select
                id="candidatePosition"
                value={form.position}
                onChange={updateField("position")}
                className={inputClass}
              >
                {positionOptions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="candidateParty"
            className="text-sm font-medium text-foreground"
          >
            Party / Affiliation{" "}
            <span className="font-normal text-muted">(optional)</span>
          </label>
          <input
            id="candidateParty"
            type="text"
            value={form.party}
            onChange={updateField("party")}
            placeholder="Party name"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="candidateBio"
            className="text-sm font-medium text-foreground"
          >
            Short Bio / Platform
          </label>
          <textarea
            id="candidateBio"
            rows={3}
            value={form.bio}
            onChange={updateField("bio")}
            placeholder="Platform statement"
            className={`${inputClass} resize-y`}
          />
        </div>

        <div className="flex justify-start">
          <button
            type="submit"
            className="px-4 py-2.5 rounded-lg font-medium border border-border text-foreground transition hover:bg-background active:opacity-80"
          >
            + Add Candidate
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-4 bg-surface rounded-3xl p-5">
        <h2>Registered so far ({candidates.length})</h2>

        {candidates.length === 0 ? (
          <p className="text-sm text-muted">No candidates registered yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {candidates.map((candidate) => (
              <li
                key={candidate.id}
                className="flex items-center gap-3 bg-background rounded-xl px-4 py-3"
              >
                <span className="flex items-center justify-center w-9 h-9 shrink-0 rounded-full bg-accent text-accent-foreground text-sm font-semibold">
                  {getInitials(candidate.name)}
                </span>
                <div className="flex-1 flex flex-col">
                  <span className="font-medium text-foreground">
                    {candidate.name}
                  </span>
                  <span className="text-sm text-muted">
                    {candidate.position}
                    {candidate.party && ` · ${candidate.party}`}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeCandidate(candidate.id)}
                  className="text-sm text-muted transition hover:text-foreground"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => navigate("/admin/register-voters")}
          className="px-5 py-2.5 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}

export default RegisterCandidatesPage;
