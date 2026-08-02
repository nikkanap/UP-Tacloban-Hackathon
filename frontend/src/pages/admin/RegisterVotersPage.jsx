import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LockedNotice from "../../components/LockedNotice";
import { apiRequest } from "../../api";
import { useAdminElection } from "../../context/AdminElectionContext";

const inputClass =
  "border border-border bg-background text-foreground p-2.5 rounded-lg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

const PREVIEW_ROW_COUNT = 3;
const isNumericId = (value) => /^\d+$/.test(String(value).trim());
const defaultForm = {
  name: "",
  voterId: "",
  voterKey: "",
  gender: "NTS",
  dateOfBirth: "",
  placeOfBirth: "",
  email: "",
};

const toVoterPayload = (voter) => ({
  id: voter.voterId.trim(),
  voter_key: voter.voterKey.trim(),
  full_name: voter.name.trim(),
  gender: voter.gender || "NTS",
  ...(voter.dateOfBirth && { date_of_birth: voter.dateOfBirth }),
  ...(voter.placeOfBirth && { place_of_birth: voter.placeOfBirth.trim() }),
  ...(voter.email && { email_address: voter.email.trim() }),
});

const fromVoterResponse = (voter) => ({
  id: voter.id,
  name: voter.full_name,
  voterId: voter.id,
  voterKey: voter.voter_key,
  gender: voter.gender,
  dateOfBirth: voter.date_of_birth,
  placeOfBirth: voter.place_of_birth,
  email: voter.email_address,
});

function RegisterVotersPage() {
  const navigate = useNavigate();
  const { addVoter, importVoters, locked } = useAdminElection();

  const [activeTab, setActiveTab] = useState("individual");
  const [form, setForm] = useState(defaultForm);
  const [fileName, setFileName] = useState("");
  const [parsedRows, setParsedRows] = useState([]);
  const [skippedRows, setSkippedRows] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  if (locked) return <LockedNotice />;

  const updateField = (field) => (event) =>
    setForm({ ...form, [field]: event.target.value });

  const tabs = [
    { id: "individual", label: "Individual" },
    { id: "bulk", label: "Bulk Upload" },
  ];

  const handleFileChange = (event) => {
    const input = event.target;
    const file = input.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = () => {
      const rows = String(reader.result)
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line) => line.split(",").map((cell) => cell.trim()));

      const hasHeader = rows.length > 0 && /name/i.test(rows[0][0] ?? "");
      const dataRows = hasHeader ? rows.slice(1) : rows;

      // A row is only usable with both a name and a voter ID. Short or junk
      // lines would otherwise import as blank voters and inflate the count.
      const cleaned = dataRows
        .map(([name, voterId, email, voterKey, gender, dateOfBirth, placeOfBirth]) => ({
          name: (name ?? "").trim(),
          voterId: (voterId ?? "").trim(),
          voterKey: (voterKey ?? voterId ?? "").trim(),
          gender: (gender ?? "NTS").trim() || "NTS",
          dateOfBirth: (dateOfBirth ?? "").trim(),
          placeOfBirth: (placeOfBirth ?? "").trim(),
          email: (email ?? "").trim(),
        }))
        .filter((row) => row.name && row.voterId);

      setParsedRows(cleaned);
      setSkippedRows(dataRows.length - cleaned.length);
    };
    reader.readAsText(file);

    // Clearing the input lets the same file be picked again later; the read
    // above already holds its own reference to the File.
    input.value = "";
  };

  const handleIndividualSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.voterId.trim() || !form.voterKey.trim()) {
      setError("Full name, voter ID, and voter key are required.");
      return;
    }

    if (!isNumericId(form.voterId)) {
      setError("Voter ID must be numeric for blockchain NFT creation.");
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const voter = await apiRequest("voters/", {
        method: "POST",
        body: JSON.stringify(toVoterPayload(form)),
      });

      addVoter(fromVoterResponse(voter));
      setForm(defaultForm);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImport = async () => {
    if (parsedRows.length === 0) return;
    const nonNumericRow = parsedRows.find((row) => !isNumericId(row.voterId));

    if (nonNumericRow) {
      setError(`Voter ID must be numeric for blockchain NFT creation: ${nonNumericRow.voterId}`);
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const createdVoters = [];

      for (const row of parsedRows) {
        const voter = await apiRequest("voters/", {
          method: "POST",
          body: JSON.stringify(toVoterPayload(row)),
        });
        createdVoters.push(fromVoterResponse(voter));
      }

      importVoters(createdVoters);
      setParsedRows([]);
      setSkippedRows(0);
      setFileName("");
      navigate("/admin/review");
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setIsSaving(false);
    }
  };

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
        <h1>Register Voters</h1>
        <p className="text-muted max-w-2xl">
          Add voters one at a time, or import a full member list from CSV.
        </p>
      </div>

      <div className="flex flex-col gap-5 bg-surface rounded-3xl p-5">
        <div className="flex gap-6 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 -mb-px border-b-2 font-medium transition ${
                activeTab === tab.id
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "individual" ? (
          <form
            onSubmit={handleIndividualSubmit}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="voterName"
                className="text-sm font-medium text-foreground"
              >
                Full Name
              </label>
              <input
                id="voterName"
                type="text"
                value={form.name}
                onChange={updateField("name")}
                placeholder="Juan Dela Cruz"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="voterId"
                className="text-sm font-medium text-foreground"
              >
                Voter ID
              </label>
              <input
                id="voterId"
                type="text"
                value={form.voterId}
                onChange={updateField("voterId")}
                placeholder="RHC-04821"
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="voterKey"
                className="text-sm font-medium text-foreground"
              >
                Voter Key
              </label>
              <input
                id="voterKey"
                type="text"
                value={form.voterKey}
                onChange={updateField("voterKey")}
                placeholder="Credential key"
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="voterGender"
                  className="text-sm font-medium text-foreground"
                >
                  Gender
                </label>
                <select
                  id="voterGender"
                  value={form.gender}
                  onChange={updateField("gender")}
                  className={inputClass}
                >
                  <option value="FE">Female</option>
                  <option value="MA">Male</option>
                  <option value="NTS">Not to say</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="voterBirthDate"
                  className="text-sm font-medium text-foreground"
                >
                  Date of Birth
                </label>
                <input
                  id="voterBirthDate"
                  type="date"
                  value={form.dateOfBirth}
                  onChange={updateField("dateOfBirth")}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="voterBirthPlace"
                  className="text-sm font-medium text-foreground"
                >
                  Place of Birth
                </label>
                <input
                  id="voterBirthPlace"
                  type="text"
                  value={form.placeOfBirth}
                  onChange={updateField("placeOfBirth")}
                  placeholder="Tacloban City"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="voterEmail"
                className="text-sm font-medium text-foreground"
              >
                Email
              </label>
              <input
                id="voterEmail"
                type="email"
                value={form.email}
                onChange={updateField("email")}
                placeholder="name@email.com"
                className={inputClass}
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex justify-end gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-lg font-medium border border-border text-foreground transition hover:bg-background active:opacity-80"
              >
                {isSaving ? "Saving..." : "Register Voter"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/admin/review")}
                className="px-5 py-2.5 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80"
              >
                Continue →
              </button>
            </div>
          </form>
        ) : (
          <div className="flex flex-col gap-5">
            <label
              htmlFor="csvUpload"
              className="flex flex-col items-center gap-1 border border-dashed border-border rounded-2xl p-8 text-center cursor-pointer transition hover:bg-background"
            >
              <span className="font-medium text-foreground">
                {fileName || "Drop a CSV file or click to browse"}
              </span>
              <span className="text-sm text-muted">
                {fileName
                  ? `${parsedRows.length} valid rows${
                      skippedRows > 0 ? ` · ${skippedRows} skipped` : ""
                    } · choose another file to replace`
                  : "Columns: name, voter ID, email, voter key, gender, birth date, birth place"}
              </span>
              <input
                id="csvUpload"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {parsedRows.length > 0 && (
              <div className="flex flex-col gap-3">
                <h2>Preview</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs uppercase tracking-wide text-muted">
                        <th className="font-medium pb-2 pr-4">Name</th>
                        <th className="font-medium pb-2 pr-4">Voter ID</th>
                        <th className="font-medium pb-2">Email</th>
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.slice(0, PREVIEW_ROW_COUNT).map((row, index) => (
                        <tr
                          key={`${row.voterId}-${index}`}
                          className="border-t border-border"
                        >
                          <td className="py-3 pr-4 font-medium text-foreground">
                            {row.name}
                          </td>
                          <td className="py-3 pr-4 text-sm text-muted tabular-nums">
                            {row.voterId}
                          </td>
                          <td className="py-3 text-sm text-muted">
                            {row.email}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleImport}
                disabled={parsedRows.length === 0 || isSaving}
                className="px-5 py-2.5 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSaving
                  ? "Importing..."
                  : `Confirm & Import ${parsedRows.length || ""} Voters`}
              </button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default RegisterVotersPage;
