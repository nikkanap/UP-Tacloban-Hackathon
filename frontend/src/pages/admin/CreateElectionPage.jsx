import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../../api";
import { useAdminElection } from "../../context/AdminElectionContext";

const inputClass =
  "border border-border bg-background text-foreground p-2.5 rounded-lg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

const isNumericId = (value) => /^\d+$/.test(String(value).trim());

function CreateElectionPage() {
  const navigate = useNavigate();
  const {
    election,
    updateElection,
    addPosition,
    removePosition,
    locked,
    startNewElection,
  } = useAdminElection();

  const [positionId, setPositionId] = useState("");
  const [positionName, setPositionName] = useState("");
  const [positionSeats, setPositionSeats] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // The current election is locked, so this page can only mean "start another".
  // Ask first — starting over clears the registered candidates and voters.
  if (locked) {
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
          <h1>Start a new election?</h1>
          <p className="text-muted max-w-2xl">
            The current election is locked, so it can no longer be edited.
            Starting a new one clears the registered candidates and voters and
            gives you a fresh draft.
          </p>
        </div>

        <div className="flex">
          <button
            type="button"
            onClick={startNewElection}
            className="px-5 py-2.5 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80"
          >
            Start New Election
          </button>
        </div>
      </div>
    );
  }

  const handleAddPosition = () => {
    if (!positionId.trim() || !positionName.trim()) return;
    addPosition(positionName.trim(), Number(positionSeats) || 1, positionId.trim());
    setPositionId("");
    setPositionName("");
    setPositionSeats(1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !election.id?.trim() ||
      !election.title.trim() ||
      !election.startTime ||
      !election.endTime
    ) {
      setError("Election ID, title, opening time, and closing time are required.");
      return;
    }

    if (!isNumericId(election.id)) {
      setError("Election ID must be numeric for blockchain NFT creation.");
      return;
    }

    if (election.positions.length === 0) {
      setError("Add at least one position before continuing.");
      return;
    }

    const invalidPosition = election.positions.find(
      (position) => !String(position.id).trim() || !position.name.trim(),
    );

    if (invalidPosition) {
      setError("Every position needs both a position ID and name.");
      return;
    }

    const nonNumericPosition = election.positions.find(
      (position) => !isNumericId(position.id),
    );

    if (nonNumericPosition) {
      setError("Every position ID must be numeric for blockchain NFT creation.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const savedElection = await apiRequest("elections/", {
        method: "POST",
        body: JSON.stringify({
          id: election.id.trim(),
          name: election.title.trim(),
          date_start: new Date(election.startTime).toISOString(),
          date_end: new Date(election.endTime).toISOString(),
        }),
      });

      const savedPositions = [];

      for (const position of election.positions) {
        const savedPosition = await apiRequest("positions/", {
          method: "POST",
          body: JSON.stringify({
            id: String(position.id).trim(),
            election: savedElection.id,
            name: position.name.trim(),
          }),
        });

        savedPositions.push({
          ...position,
          id: savedPosition.id,
          name: savedPosition.name,
        });
      }

      updateElection({
        id: savedElection.id,
        title: savedElection.name,
        startTime: election.startTime,
        endTime: election.endTime,
        positions: savedPositions,
      });
      navigate("/admin/register-candidates");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 min-h-full">
      <button
        type="button"
        onClick={() => navigate("/admin/dashboard")}
        className="self-start text-sm font-medium text-muted transition hover:text-foreground"
      >
        ← Back to Dashboard
      </button>

      <div className="flex flex-col gap-2">
        <h1>Create Election</h1>
        <p className="text-muted max-w-2xl">
          Define the election, its positions, and when voting opens and closes.
        </p>
      </div>

      <div className="flex flex-col gap-5 bg-surface rounded-3xl p-5">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="electionId"
            className="text-sm font-medium text-foreground"
          >
            Election ID
          </label>
          <input
            id="electionId"
            type="text"
            value={election.id ?? ""}
            onChange={(event) => updateElection({ id: event.target.value })}
            placeholder="1"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="title"
            className="text-sm font-medium text-foreground"
          >
            Title
          </label>
          <input
            id="title"
            type="text"
            value={election.title}
            onChange={(event) => updateElection({ title: event.target.value })}
            placeholder="Student Government Election"
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="description"
            className="text-sm font-medium text-foreground"
          >
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={election.description}
            onChange={(event) =>
              updateElection({ description: event.target.value })
            }
            placeholder="Describe what members are voting on"
            className={`${inputClass} resize-y`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="startTime"
              className="text-sm font-medium text-foreground"
            >
              Opens
            </label>
            <input
              id="startTime"
              type="datetime-local"
              value={election.startTime}
              onChange={(event) =>
                updateElection({ startTime: event.target.value })
              }
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="endTime"
              className="text-sm font-medium text-foreground"
            >
              Closes
            </label>
            <input
              id="endTime"
              type="datetime-local"
              value={election.endTime}
              onChange={(event) =>
                updateElection({ endTime: event.target.value })
              }
              className={inputClass}
            />
          </div>
        </div>

        <label className="flex items-center gap-2.5 text-sm text-foreground">
          <input
            type="checkbox"
            checked={election.requireCredential}
            onChange={(event) =>
              updateElection({ requireCredential: event.target.checked })
            }
            className="w-4 h-4 accent-[var(--color-accent)]"
          />
          Require one voting credential (NFT) per member
        </label>
      </div>

      <div className="flex flex-col gap-4 bg-surface rounded-3xl p-5">
        <h2>Positions</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={positionId}
            onChange={(event) => setPositionId(event.target.value)}
            placeholder="Position ID"
            className={`${inputClass} sm:w-36`}
          />
          <input
            type="text"
            value={positionName}
            onChange={(event) => setPositionName(event.target.value)}
            placeholder="Position name"
            className={`${inputClass} flex-1`}
          />
          <input
            type="number"
            min={1}
            value={positionSeats}
            onChange={(event) => setPositionSeats(event.target.value)}
            placeholder="Seats"
            className={`${inputClass} sm:w-28`}
          />
          <button
            type="button"
            onClick={handleAddPosition}
            className="px-4 py-2.5 rounded-lg font-medium border border-border text-foreground transition hover:bg-background active:opacity-80"
          >
            + Add
          </button>
        </div>

        {election.positions.length === 0 ? (
          <p className="text-sm text-muted">No positions added yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {election.positions.map((position) => (
              <li
                key={position.id}
                className="flex items-center justify-between gap-3 bg-background rounded-xl px-4 py-3"
              >
                <span className="font-medium text-foreground">
                  {position.name}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted tabular-nums">
                    ID {position.id}
                  </span>
                  <span className="text-sm text-muted">
                    {position.seats} {position.seats === 1 ? "seat" : "seats"}
                  </span>
                  {election.positions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePosition(position.id)}
                      className="text-sm text-muted transition hover:text-foreground"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSaving ? "Saving..." : "Save & Continue →"}
        </button>
      </div>
    </form>
  );
}

export default CreateElectionPage;
