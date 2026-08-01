import { createContext, useContext, useState } from "react";

const AdminElectionContext = createContext(null);

const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

// Stand-in for the on-chain tally transaction shown on the Results screen.
export const RESULTS_TX_ID =
  "a3f9c41d7b2e88604fa1c5d93e07b6528cd41af90b7e3162994ac0de5b217e21";

// Seeded history so the All Elections screen has something to list. Only the
// current election in context is live data; these are read-only records.
const PAST_ELECTIONS = [
  {
    id: "past-2025-bylaw",
    title: "2025 Bylaw Amendment Vote",
    dates: "Closed Nov 2, 2025",
    status: "ended",
    turnout: 74,
  },
  {
    id: "past-2025-board",
    title: "2025 Board of Directors Election",
    dates: "Jul 15 – Aug 15, 2025",
    status: "ended",
    turnout: 68,
  },
];

export function AdminElectionProvider({ children }) {
  const [election, setElection] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    requireCredential: true,
    positions: [{ id: createId(), name: "President", seats: 1 }],
  });

  const [candidates, setCandidates] = useState([
    {
      id: createId(),
      name: "Geoffrey Tomagan",
      position: "President",
      party: "Party A",
    },
    {
      id: createId(),
      name: "Daniel Cho",
      position: "President",
      party: "Party B",
    },
  ]);

  const [voters, setVoters] = useState([
    { id: createId(), name: "Jordan Alvarez", voterId: "RHC-04821" },
    { id: createId(), name: "Amara Osei", voterId: "RHC-04822" },
    { id: createId(), name: "Daniel Cho", voterId: "RHC-04823" },
    { id: createId(), name: "Maria Santos", voterId: "RHC-04824" },
    { id: createId(), name: "Liam Reyes", voterId: "RHC-04825" },
  ]);

  const [locked, setLocked] = useState(false);
  const [published, setPublished] = useState(false);

  const updateElection = (changes) =>
    setElection((current) => ({ ...current, ...changes }));

  const addPosition = (name, seats) =>
    setElection((current) => ({
      ...current,
      positions: [...current.positions, { id: createId(), name, seats }],
    }));

  const removePosition = (id) =>
    setElection((current) => ({
      ...current,
      positions: current.positions.filter((position) => position.id !== id),
    }));

  const addCandidate = (candidate) =>
    setCandidates((current) => [...current, { ...candidate, id: createId() }]);

  const removeCandidate = (id) =>
    setCandidates((current) =>
      current.filter((candidate) => candidate.id !== id),
    );

  const addVoter = (voter) =>
    setVoters((current) => [...current, { ...voter, id: createId() }]);

  const importVoters = (rows) =>
    setVoters((current) => [
      ...current,
      ...rows.map((row) => ({ ...row, id: createId() })),
    ]);

  const removeVoter = (id) =>
    setVoters((current) => current.filter((voter) => voter.id !== id));

  const lockElection = () => setLocked(true);
  const publishResults = () => setPublished(true);

  // Clears everything back to a fresh draft. Locking makes the current election
  // immutable; starting a new one is the way out of that.
  const startNewElection = () => {
    setElection({
      title: "",
      description: "",
      startTime: "",
      endTime: "",
      requireCredential: true,
      positions: [{ id: createId(), name: "President", seats: 1 }],
    });
    setCandidates([]);
    setVoters([]);
    setLocked(false);
    setPublished(false);
  };

  // draft -> live -> ended. Time-based, so callers that need it to tick should
  // already be re-rendering (the monitoring page does, via useCountdown).
  const getElectionStatus = () => {
    if (!locked) return "draft";
    if (published) return "ended";

    const end = election.endTime ? new Date(election.endTime) : null;
    if (end && !Number.isNaN(end.getTime()) && end <= new Date()) {
      return "ended";
    }
    return "live";
  };

  return (
    <AdminElectionContext.Provider
      value={{
        election,
        updateElection,
        addPosition,
        removePosition,
        candidates,
        addCandidate,
        removeCandidate,
        voters,
        addVoter,
        importVoters,
        removeVoter,
        locked,
        lockElection,
        published,
        publishResults,
        startNewElection,
        getElectionStatus,
        pastElections: PAST_ELECTIONS,
      }}
    >
      {children}
    </AdminElectionContext.Provider>
  );
}

export function useAdminElection() {
  const context = useContext(AdminElectionContext);
  if (!context) {
    throw new Error(
      "useAdminElection must be used inside AdminElectionProvider",
    );
  }
  return context;
}
