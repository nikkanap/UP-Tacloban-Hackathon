import { createContext, useContext, useState } from "react";

const AdminElectionContext = createContext(null);

const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

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
