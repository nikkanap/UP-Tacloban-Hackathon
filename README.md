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
