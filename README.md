# Kiber-DNT | Avtonom Kiber Müdafiə Platformu

Autonomous Cyber Defense Platform (SOC) — real-time threat detection, AI-driven decision engine, incident response orchestration.

## Quick Start (no dependencies)

```bash
node demo-server.js
```

Open http://localhost:3000 — Login: `admin@kiberdnt.az` / `admin`

## Full Stack (Docker)

```bash
docker compose up
```

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite + TailwindCSS + Recharts |
| Backend | Express + TypeScript + Prisma |
| AI Engine | Risk scoring, auto-remediation |
| Worker | BullMQ (Redis) |
| Database | PostgreSQL |

## Project Structure

```
apps/
  web/          React frontend (14 pages)
  api/          Express REST API
  worker/       BullMQ background jobs
  ai-engine/    AI decision engine
packages/
  shared-types/ TypeScript types
  db/           Prisma schema + client
```

## Architecture

- **Closed-loop defense**: Detect → Analyze → Decide → Act → Report
- **AI-driven**: Risk scoring, confidence thresholds, auto-execute
- **Mock-first**: All provider adapters (WAF, SIEM, EDR, Vuln Scanner) return mock data — swap in real APIs via adapter interface
