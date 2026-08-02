# SmartElect

Transparent, tamper-resistant elections on Bitcoin Cash — built for the Bitcoin
Cash Conference Hackathon 2026 by UP Tacloban.

## The problem

> Traditional elections can be expensive, difficult to audit, and vulnerable to
> fraud or manipulation. **How can we make elections more transparent,
> tamper-resistant, and independently verifiable without relying entirely on a
> centralized authority?**

The real difficulty is not dishonesty — it is that honesty cannot be *checked*.
When results live in a database one authority controls, no voter can
independently confirm the count. A recount just asks the same people for the
same number again.

## Our answer, in four points

**1. The ballot box is a token.** Each candidate has a mutable NFT whose
commitment holds `candidateId + positionId + count`. The tally is not a row in
our database — it is on-chain state.

**2. The count can only go up by one.** The `Vote` covenant requires the output
commitment to equal the input's count plus exactly one, with the candidate
unchanged and the token returned to the contract. Setting a total to 500 is not
forbidden by policy; it is an invalid transaction the network rejects — from an
outsider, an admin, or from us holding our own keys.

**3. Voting destroys the right to vote.** A vote is two inputs and one output:
the candidate's tally NFT and the voter's credential NFT go in, only the tally
comes out. The credential is consumed and never recreated, so double voting is
impossible *by construction* rather than by a database check.

**4. Therefore the result is publicly provable.** The sum of all candidate
counts equals the number of credentials destroyed. Anyone can verify that
without our permission, our API, or our cooperation.

## What is trusted, and what is not

Stated plainly, because overclaiming is how these systems fail under scrutiny.

| Enforced by the contract | Still trusted |
| --- | --- |
| A count can only increase by 1 | The organizer decides who gets a credential |
| One credential, one vote | One server-side wallet signs votes today |
| Ballots are publicly auditable | Voter-held keys are the next step |

The chain removes trust in the **counter**, not in the registrar. The roll
remains publicly countable, since credentials are minted on-chain.

## Architecture

```text
React + Vite  →  Django REST API  →  Node blockchain service  →  Vote covenant  →  chipnet
   (reads)         (organizes)            (signs, mints)          (enforces)
```

The backend *organizes* the election — registration, login, dashboards. The
covenant *protects* it — voting window, one-credential-one-vote, tally
integrity. Backend convenience is never security: every trust-critical rule
lives in [`Vote.cash`](backend/blockchain/cashscript/Vote.cash).

| Path | What it is |
| --- | --- |
| `backend/blockchain/cashscript/Vote.cash` | The covenant. The load-bearing part |
| `backend/blockchain/src/` | Node service — minting, wallet, transaction building |
| `backend/config/` | Django REST API and data model |
| `frontend/src/` | React admin and voter interfaces |

## Running it locally

Requires Python 3.11+, Node 18+. Docker is optional.

### Backend API

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows;  source venv/bin/activate on macOS/Linux
pip install -r config/requirements.txt
```

Create `backend/config/.env`:

```ini
SECRET_KEY=dev-only-insecure-key

# SQLite needs no database server. For Postgres, use
# django.db.backends.postgresql and fill in the rest.
DATABASE_ENGINE=django.db.backends.sqlite3
DATABASE_NAME=db.sqlite3

# Required — migrate fails without these, because server/apps.py seeds a
# superuser on post_migrate.
SUPERUSER_NAME=admin
SUPERUSER_PASSWORD=admin
SUPERUSER_EMAIL=admin@example.com

BLOCKCHAIN_API=http://localhost:3001
```

Then:

```bash
cd config
python manage.py migrate
python manage.py runserver 8000
```

The browsable API is at `http://localhost:8000/api/`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:9000`. Vite proxies `/api` to the backend — the API must
be same-origin, since `django-cors-headers` is not installed. To point at a
different backend, copy `.env.example` to `.env` and set
`VITE_API_PROXY_TARGET`.

### Blockchain service (optional)

Needed only to mint tokens and cast votes on chain. Requires a funded chipnet
wallet.

```bash
cd backend/blockchain
npm install
```

Create `backend/blockchain/.env` with `PRIVATE_KEY_WIF=<chipnet WIF>`, then
`npm run dev` to serve on port 3001.

### Docker

```bash
cd backend
docker compose up          # Postgres + Django + blockchain + nginx on :80
```

Needs `backend/.env` with the `DATABASE_*` values from the table below.

## Environment variables

| Variable | Used by | Notes |
| --- | --- | --- |
| `SECRET_KEY` | Django | Also keys the ballot pseudonym |
| `DATABASE_ENGINE` / `NAME` / `USER` / `PASSWORD` / `HOST` / `PORT` | Django | SQLite needs only engine and name |
| `SUPERUSER_NAME` / `PASSWORD` / `EMAIL` | Django | **Required** — `migrate` errors if unset |
| `BLOCKCHAIN_API` | Django | URL of the Node service |
| `PRIVATE_KEY_WIF` | Node | Funded chipnet wallet |
| `VITE_API_PROXY_TARGET` | Vite | Optional; defaults to `http://localhost:8000` |
| `VITE_EXPLORER_TX_URL` | Frontend | Optional; defaults to a chipnet explorer |

## Privacy

`GET /api/votes/` publishes the tally and every ballot transaction, but never
the voter. Turnout is counted through `ballot_ref`, an HMAC of voter and
election keyed to `SECRET_KEY` — stable enough to count distinct ballots,
opaque enough that the roll cannot be enumerated to recover who voted.

Public tally, private ballot.
Analyze the entire repository and generate a professional README.md file for this project.

IMPORTANT RULES:
- DO NOT modify, rename, move, or delete any existing files.
- DO NOT create any files except a single README.md.
- DO NOT change source code, configurations, dependencies, or project structure.
- Your only task is to produce a complete README.md based on the existing codebase.

README REQUIREMENTS:

1. Project Overview
   - Determine the project's purpose from the codebase.
   - Write a concise executive summary.
   - Explain the problem being solved.
   - Explain how Django, CashScript, React, and Vite interact within the system.

2. Features
   - List all major user-facing and technical features.
   - Separate blockchain features from web application features.
   - Include authentication, APIs, smart contracts, tokens, auctions, voting, loans, escrow, NFTs, or any other detected functionality.

3. Technology Stack
   Create a table containing:
   - Frontend technologies
   - Backend technologies
   - Blockchain technologies
   - Database technologies
   - Infrastructure and deployment technologies

4. Architecture
   - Explain the overall architecture.
   - Describe frontend, backend, database, blockchain, and external services.
   - Include a Mermaid architecture diagram.

5. Project Structure
   - Generate a tree view of the repository.
   - Briefly explain the purpose of each major directory.

6. Installation Guide
   Include:
   - Prerequisites
   - Python requirements
   - Node.js requirements
   - Database setup
   - Environment variables
   - Backend installation
   - Frontend installation
   - Smart contract compilation steps if applicable

7. Configuration
   - Identify environment variables from the codebase.
   - Document them in a table:
     Variable | Required | Description | Example

8. Running the Project
   Include commands for:
   - Backend development server
   - Frontend development server
   - Contract compilation
   - Database migrations
   - Production builds

9. API Documentation
   - Discover all API endpoints.
   - Group them by feature.
   - Create tables containing:
     Method | Endpoint | Description

10. Smart Contract Documentation
    For each CashScript contract:
    - Contract name
    - Purpose
    - Constructor parameters
    - Public functions
    - Validation logic
    - Example transaction flow

11. Database Models
    - Document major Django models.
    - Explain relationships between models.

12. Authentication and Security
    - Explain authentication flow.
    - Explain blockchain verification mechanisms.
    - Explain authorization rules if present.

13. Deployment
    - Explain deployment architecture based on repository files.
    - Document Docker, Nginx, Gunicorn, Redis, Channels, PostgreSQL, or other infrastructure if present.

14. Development Workflow
    - Explain how developers should work on the project.
    - Include migration workflow.
    - Include frontend workflow.
    - Include contract development workflow.

15. Troubleshooting
    - Add common setup and runtime issues that can be inferred from the project.
    - Include likely fixes.

16. Future Improvements
    - Suggest reasonable future enhancements based on the codebase.

17. License
    - If a license exists, document it.
    - Otherwise create a placeholder section.

WRITING REQUIREMENTS:
- Write as if this repository is intended for professional developers and hackathon judges.
- Use clear Markdown formatting.
- Use tables where appropriate.
- Use Mermaid diagrams where helpful.
- Be accurate to the codebase.
- Do not invent features that do not exist.
- Infer missing details only when strongly supported by the repository structure.
- Prefer concrete information extracted from the repository over assumptions.

OUTPUT:
Return only the complete contents of README.md.