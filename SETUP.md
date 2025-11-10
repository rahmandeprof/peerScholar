# Local Development Setup

This guide walks you through setting up the Scholar App backend for local development and testing.

## Quick Start (with Postgres)

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Database

Ensure Postgres is running, then create a database:

```bash
psql -U postgres -h localhost -c "CREATE DATABASE scholar_dev;"
```

Or with Docker:

```bash
docker run --name scholar-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_DB=scholar_dev \
  -p 5432:5432 \
  -d postgres:15
```

### 3. Update `.env` with Your OpenAI API Key

Edit `.env` and set:

```
OPENAI_API_KEY=sk-your-actual-key-here
```

### 4. Start Development Server

```bash
npm run start:dev
```

The app will start at `http://localhost:3000` with the API prefix `/v1`.

---

## Alternative: SQLite (No Postgres Required)

For quick local experiments without setting up Postgres, use SQLite:

### 1. Update `.env`

Comment out the Postgres section and uncomment SQLite:

```bash
# TYPEORM_CONNECTION=postgres
# TYPEORM_URL=postgres://postgres:postgres@localhost:5432/scholar_dev
# TYPEORM_SYNCHRONIZE=true
# TYPEORM_ENTITIES=src/**/entities/*.ts
# TYPEORM_MIGRATIONS=src/database/migrations/*.ts

TYPEORM_CONNECTION=sqlite
TYPEORM_URL=scholar_dev.sqlite
TYPEORM_SYNCHRONIZE=true
TYPEORM_ENTITIES=src/**/entities/*.ts
TYPEORM_MIGRATIONS=src/database/migrations/*.ts
```

### 2. Install SQLite Support

```bash
npm install
```

SQLite3 is already included as a dependency. No extra setup needed.

### 3. Start with SQLite

```bash
npm run start:dev:sqlite
```

The app will create `scholar_dev.sqlite` automatically. This is ignored by git.

> **Note:** This script uses `cross-env` to set environment variables cross-platform (Windows, macOS, Linux).

---

## Testing the Chat Endpoints

### Info

In **development** (`NODE_ENV=development`), the auth guard automatically bypasses authentication. This allows you to test endpoints without obtaining a token.

> **Note:** This bypass is **only for development**. It is automatically disabled in production.

### Upload Files

```bash
curl -X POST "http://localhost:3000/v1/chat/upload" \
  -F "files=@/path/to/sample.pdf" \
  -F "files=@/path/to/document.docx" \
  -H "Content-Type: multipart/form-data"
```

**Expected response:**

```json
{
	"uploaded": [
		{
			"documentId": "doc_abc123...",
			"count": 5,
			"fileName": "sample.pdf"
		}
	],
	"failed": []
}
```

### Query a Document

```bash
curl -X POST "http://localhost:3000/v1/chat/query" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What is this document about?",
    "topK": 4
  }'
```

**Expected response:**

```json
{
	"answer": "This document discusses...",
	"sources": [
		{
			"documentId": "doc_abc123...",
			"chunkIndex": 0,
			"text": "Relevant excerpt from the document...",
			"score": 0.95
		}
	]
}
```

---

## Running Tests

### Unit Tests

```bash
npm run test
```

### E2E Tests

```bash
npm run test:e2e
```

### With Coverage

```bash
npm run test:cov
```

---

## Linting & Formatting

### Auto-fix Lint Issues

```bash
npm run lint
```

### Format Code

```bash
npm run format
```

### Build for Production

```bash
npm run build
```

---

## Troubleshooting

### "OPENAI_API_KEY is not set"

- Make sure you've set `OPENAI_API_KEY` in your `.env` file.
- Get a key from [OpenAI API](https://platform.openai.com/api-keys).

### "connect ECONNREFUSED 127.0.0.1:5432" (Postgres)

- Postgres is not running.
- Start it: `docker start scholar-postgres` (if using Docker).
- Or ensure the local Postgres service is running.

### "sqlite_open: unable to open database file"

- Check that you have write permissions in the project directory.
- Clear and try again: `rm scholar_dev.sqlite && npm run start:dev:sqlite`.

### "Module not found: pdf-parse"

- Run: `npm install pdf-parse mammoth`.

### Auth Issues in Dev

- If auth guard is still blocking endpoints, ensure `NODE_ENV=development` is set in your `.env`.
- In development, you should **not** need an auth token for chat endpoints.

---

## What's Next?

- Implement additional chat endpoints as needed.
- Add unit tests for the chat service in `src/app/chat/chat.service.spec.ts`.
- Configure migrations when ready to use Postgres in a team environment.
- Set proper secrets and production env vars before deploying.
