import { Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import AuthLayout from "./layouts/AuthLayout";

import LoginPage from "./pages/LoginPage";
import Page from "./pages/Page";
import ElectionVotingPage from "./pages/ElectionVotingPage";
import VoterDashboardPage from "./pages/VoterDashboardPage";
import ElectionDetailsPage from "./pages/ElectionDetailsPage";
import { createContext, useState } from "react";
import randomPerson1 from "./assets/images/candidates/random-person.jpeg";
import randomPerson2 from "./assets/images/candidates/random-person (1).jpeg";
import randomPerson3 from "./assets/images/candidates/random-person (2).jpeg";
import randomPerson4 from "./assets/images/candidates/random-person (3).jpeg";
import randomPerson5 from "./assets/images/candidates/random-person (4).jpeg";
import randomPerson6 from "./assets/images/candidates/random-person (5).jpeg";
import randomPerson7 from "./assets/images/candidates/random-person (6).jpeg";
import randomPerson8 from "./assets/images/candidates/random-person (7).jpeg";
import randomPerson9 from "./assets/images/candidates/random-person (8).jpeg";
import randomPerson10 from "./assets/images/candidates/random-person (9).jpeg";
import randomPerson11 from "./assets/images/candidates/random-person (10).jpeg";
import BallotConfirmationPage from "./pages/BallotConfirmationPage";
import VerifyVotePage from "./pages/VerifyVotePage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import CreateElectionPage from "./pages/admin/CreateElectionPage";
import RegisterCandidatesPage from "./pages/admin/RegisterCandidatesPage";
import RegisterVotersPage from "./pages/admin/RegisterVotersPage";

export const userContext = createContext();
export const electionDataContext = createContext();

function App() {
  const [fullname, setFullname] = useState("Juan Dela Cruz");

  const electionStartTime = new Date("2026-08-01T08:00:00");
  const electionEndTime = new Date("2026-08-03T17:00:00");

  const now = new Date();
  const electionStatus =
    now < electionStartTime ? "upcoming" : now > electionEndTime ? "completed" : "ongoing";

  const electionData = {
    title: "Student Government Election",
    description:
      "Vote for your preferred candidates for the upcoming student government positions. Make your voice heard and help shape the future of our student community! Your vote matters, so choose wisely and make a difference!",
    status: electionStatus,
    totalVoters: 1000,
    totalVotersVoted: 500,
    startTime: electionStartTime,
    endTime: electionEndTime,
  };

  const electionCandidates = [
    {
      position: "President",
      maxVotes: 1,
      candidates: [
        { id: 1, name: "Candidate 1", party: "Party A", image: randomPerson1 },
        { id: 2, name: "Candidate 2", party: "Party B", image: randomPerson2 },
        { id: 3, name: "Candidate 3", party: "Party C", image: randomPerson3 },
      ],
    },
    {
      position: "Vice President",
      maxVotes: 1,
      candidates: [
        { id: 4, name: "Candidate 4", party: "Party A", image: randomPerson4 },
        { id: 5, name: "Candidate 5", party: "Party B", image: randomPerson5 },
        { id: 6, name: "Candidate 6", party: "Party C", image: randomPerson6 },
      ],
    },
    {
      position: "Secretary",
      maxVotes: 1,
      candidates: [
        { id: 7, name: "Candidate 7", party: "Party A", image: randomPerson7 },
        { id: 8, name: "Candidate 8", party: "Party B", image: randomPerson8 },
        { id: 9, name: "Candidate 9", party: "Party C", image: randomPerson9 },
      ],
    },
    {
      position: "Treasurer",
      maxVotes: 1,
      candidates: [
        { id: 10, name: "Candidate 10", party: "Party A", image: randomPerson10 },
        { id: 11, name: "Candidate 11", party: "Party B", image: randomPerson11 },
        { id: 12, name: "Candidate 12", party: "Party C", image: randomPerson1 },
      ],
    },
    {
      position: "Councilor",
      maxVotes: 24,
      candidates: [
        { id: 13, name: "Candidate 13", party: "Party A", image: randomPerson2 },
        { id: 14, name: "Candidate 14", party: "Party B", image: randomPerson3 },
        { id: 15, name: "Candidate 15", party: "Party C", image: randomPerson4 },
        { id: 16, name: "Candidate 16", party: "Party A", image: randomPerson5 },
        { id: 17, name: "Candidate 17", party: "Party B", image: randomPerson6 },
        { id: 18, name: "Candidate 18", party: "Party C", image: randomPerson7 },
        { id: 19, name: "Candidate 19", party: "Party A", image: randomPerson8 },
        { id: 20, name: "Candidate 20", party: "Party B", image: randomPerson9 },
        { id: 21, name: "Candidate 21", party: "Party C", image: randomPerson10 },
        { id: 22, name: "Candidate 22", party: "Party A", image: randomPerson11 },
        { id: 23, name: "Candidate 23", party: "Party B", image: randomPerson1 },
        { id: 24, name: "Candidate 24", party: "Party C", image: randomPerson2 },
        { id: 25, name: "Candidate 25", party: "Party A", image: randomPerson3 },
        { id: 26, name: "Candidate 26", party: "Party B", image: randomPerson4 },
        { id: 27, name: "Candidate 27", party: "Party C", image: randomPerson5 },
      ],
    },
  ];

  const candidateVoteCounts = {
    1: 99,
    2: 214,
    3: 187,
    4: 176,
    5: 83,
    6: 241,
    7: 53,
    8: 302,
    9: 145,
    10: 201,
    11: 110,
    12: 189,
    13: 104,
    14: 158,
    15: 76,
    16: 176,
    17: 51,
    18: 141,
    19: 162,
    20: 88,
    21: 133,
    22: 64,
    23: 149,
    24: 120,
    25: 97,
    26: 128,
    27: 112,
  };

  const positionAbstainedCounts = {
    President: 12,
    "Vice President": 18,
    Secretary: 21,
    Treasurer: 9,
    Councilor: 34,
  };

  const electionResults = electionCandidates.map((position) => ({
    position: position.position,
    abstained: positionAbstainedCounts[position.position] ?? 0,
    candidates: position.candidates.map((candidate) => ({
      id: candidate.id,
      name: candidate.name,
      party: candidate.party,
      image: candidate.image,
      votes: candidateVoteCounts[candidate.id] ?? 0,
    })),
  }));

  return (
    <userContext.Provider value={fullname}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route
          element={
            <electionDataContext.Provider
              value={{ electionData, electionCandidates, electionResults }}
            >
              <DashboardLayout />
            </electionDataContext.Provider>
          }
        >
          <Route path="/" element={<Page />} />
          <Route path="/election-voting" element={<ElectionVotingPage />} />

          <Route path="/voter-dashboard" element={<VoterDashboardPage />} />

          <Route path="/election-details" element={<ElectionDetailsPage />} />
          <Route path="/ballot-confirmation" element={<BallotConfirmationPage />} />
          <Route path="/verify-vote" element={<VerifyVotePage />} />
        </Route>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        </Route>
        <Route element={<DashboardLayout />}>
          <Route
            path="/admin/create-election"
            element={<CreateElectionPage />}
          />
        </Route>
        <Route element={<DashboardLayout />}>
          <Route
            path="/admin/register-candidates"
            element={<RegisterCandidatesPage />}
          />
        </Route>
        <Route element={<DashboardLayout />}>
          <Route
            path="/admin/register-voters"
            element={<RegisterVotersPage />}
          />
        </Route>
      </Routes>
    </userContext.Provider>
  );
}

export default App;
