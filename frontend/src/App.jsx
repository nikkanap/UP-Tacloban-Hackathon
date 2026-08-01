import { Routes, Route } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import AuthLayout from "./layouts/AuthLayout";

import LoginPage from "./pages/LoginPage";
import Page from "./pages/Page";
import ElectionVotingPage from "./pages/ElectionVotingPage";
import VoterDashboardPage from "./pages/VoterDashboardPage";
import ElectionDetailsPage from "./pages/ElectionDetailsPage";
import { createContext, useState } from "react";
import defaultCandidateImage from "./assets/images/candidates/default-candidate.png";
import BallotConfirmationPage from "./pages/BallotConfirmationPage";
import VerifyVotePage from "./pages/VerifyVotePage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import CreateElectionPage from "./pages/admin/CreateElectionPage";
import RegisterCandidatesPage from "./pages/admin/RegisterCandidatesPage";
import RegisterVotersPage from "./pages/admin/RegisterVotersPage";
import ReviewAndLockPage from "./pages/admin/ReviewAndLockPage";

export const userContext = createContext();
export const electionDataContext = createContext();

function App() {
  const [fullname, setFullname] = useState("Juan Dela Cruz");

  const electionData = {
    title: "Student Government Election",
    description:
      "Vote for your preferred candidates for the upcoming student government positions. Make your voice heard and help shape the future of our student community! Your vote matters, so choose wisely and make a difference!",
    totalVoters: 1000,
    totalVotersVoted: 500,
    startTime: new Date("2026-08-01T08:00:00"),
    endTime: new Date("2026-08-03T17:00:00"),
  };

  const electionCandidates = [
    {
      position: "President",
      maxVotes: 1,
      candidates: [
        { name: "Candidate 1", party: "Party A", image: defaultCandidateImage },
        { name: "Candidate 2", party: "Party B", image: defaultCandidateImage },
        { name: "Candidate 3", party: "Party C", image: defaultCandidateImage },
      ],
    },
    {
      position: "Vice President",
      maxVotes: 1,
      candidates: [
        { name: "Candidate 4", party: "Party A", image: defaultCandidateImage },
        { name: "Candidate 5", party: "Party B", image: defaultCandidateImage },
        { name: "Candidate 6", party: "Party C", image: defaultCandidateImage },
      ],
    },
    {
      position: "Secretary",
      maxVotes: 1,
      candidates: [
        { name: "Candidate 7", party: "Party A", image: defaultCandidateImage },
        { name: "Candidate 8", party: "Party B", image: defaultCandidateImage },
        { name: "Candidate 9", party: "Party C", image: defaultCandidateImage },
      ],
    },
    {
      position: "Treasurer",
      maxVotes: 1,
      candidates: [
        {
          name: "Candidate 10",
          party: "Party A",
          image: defaultCandidateImage,
        },
        {
          name: "Candidate 11",
          party: "Party B",
          image: defaultCandidateImage,
        },
        {
          name: "Candidate 12",
          party: "Party C",
          image: defaultCandidateImage,
        },
      ],
    },
    {
      position: "Councilor",
      maxVotes: 5,
      candidates: [
        {
          name: "Candidate 13",
          party: "Party A",
          image: defaultCandidateImage,
        },
        {
          name: "Candidate 14",
          party: "Party B",
          image: defaultCandidateImage,
        },
        {
          name: "Candidate 15",
          party: "Party C",
          image: defaultCandidateImage,
        },
        {
          name: "Candidate 16",
          party: "Party A",
          image: defaultCandidateImage,
        },
        {
          name: "Candidate 17",
          party: "Party B",
          image: defaultCandidateImage,
        },
        {
          name: "Candidate 18",
          party: "Party C",
          image: defaultCandidateImage,
        },
        {
          name: "Candidate 19",
          party: "Party A",
          image: defaultCandidateImage,
        },
        {
          name: "Candidate 20",
          party: "Party B",
          image: defaultCandidateImage,
        },
        {
          name: "Candidate 21",
          party: "Party C",
          image: defaultCandidateImage,
        },
        {
          name: "Candidate 22",
          party: "Party A",
          image: defaultCandidateImage,
        },
        {
          name: "Candidate 23",
          party: "Party B",
          image: defaultCandidateImage,
        },
        {
          name: "Candidate 24",
          party: "Party C",
          image: defaultCandidateImage,
        },
        {
          name: "Candidate 25",
          party: "Party A",
          image: defaultCandidateImage,
        },
        {
          name: "Candidate 26",
          party: "Party B",
          image: defaultCandidateImage,
        },
        {
          name: "Candidate 27",
          party: "Party C",
          image: defaultCandidateImage,
        },
      ],
    },
  ];

  return (
    <userContext.Provider value={fullname}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>
        <Route
          element={
            <electionDataContext.Provider
              value={{ electionData, electionCandidates }}
            >
              <DashboardLayout />
            </electionDataContext.Provider>
          }
        >
          <Route path="/" element={<Page />} />
          <Route path="/election-voting" element={<ElectionVotingPage />} />

          <Route path="/voter-dashboard" element={<VoterDashboardPage />} />

          <Route path="/election-details" element={<ElectionDetailsPage />} />
          <Route
            path="/ballot-confirmation"
            element={<BallotConfirmationPage />}
          />
          <Route path="verify-vote" element={<VerifyVotePage />} />
        </Route>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route
            path="/admin/create-election"
            element={<CreateElectionPage />}
          />
          <Route
            path="/admin/register-candidates"
            element={<RegisterCandidatesPage />}
          />
          <Route
            path="/admin/register-voters"
            element={<RegisterVotersPage />}
          />
          <Route path="/admin/review" element={<ReviewAndLockPage />} />
        </Route>
      </Routes>
    </userContext.Provider>
  );
}

export default App;
