import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LockedNotice from "../../components/LockedNotice";
import { useAdminElection } from "../../context/AdminElectionContext";

const inputClass =
  "border border-border bg-background text-foreground p-2.5 rounded-lg outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20";

const PREVIEW_ROW_COUNT = 3;

function RegisterVotersPage() {
  const navigate = useNavigate();
  const { addVoter, importVoters, locked } = useAdminElection();

  const [activeTab, setActiveTab] = useState("individual");
  const [form, setForm] = useState({ name: "", voterId: "", email: "" });
  const [fileName, setFileName] = useState("");
  const [parsedRows, setParsedRows] = useState([]);

  if (locked) return <LockedNotice />;

  const updateField = (field) => (event) =>
    setForm({ ...form, [field]: event.target.value });

  const tabs = [
    { id: "individual", label: "Individual" },
    { id: "bulk", label: "Bulk Upload" },
  ];

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
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

      setParsedRows(
        dataRows.map(([name, voterId, email]) => ({ name, voterId, email })),
      );
    };
    reader.readAsText(file);
  };

  const handleIndividualSubmit = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.voterId.trim()) return;
    addVoter({ ...form, name: form.name.trim(), voterId: form.voterId.trim() });
    setForm({ name: "", voterId: "", email: "" });
  };

  const handleImport = () => {
    if (parsedRows.length === 0) return;
    importVoters(parsedRows);
    setParsedRows([]);
    setFileName("");
    navigate("/admin/review");
  };

  return (
    <div className="flex flex-col gap-6 min-h-full">
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

            <div className="flex justify-end gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg font-medium border border-border text-foreground transition hover:bg-background active:opacity-80"
              >
                Register Voter
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
                  ? `${parsedRows.length} rows detected · choose another file to replace`
                  : "Columns: name, voter ID, email"}
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
                      {parsedRows.slice(0, PREVIEW_ROW_COUNT).map((row) => (
                        <tr
                          key={row.voterId}
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
                disabled={parsedRows.length === 0}
                className="px-5 py-2.5 rounded-lg font-medium bg-accent text-accent-foreground transition hover:opacity-90 active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirm &amp; Import {parsedRows.length || ""} Voters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegisterVotersPage;
