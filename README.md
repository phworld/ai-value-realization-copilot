# AI Value Realization Copilot

A public-facing, industry-agnostic enterprise AI ROI prototype designed to show how AI portfolio leaders can move from **adoption → realized value → ROI → capital allocation**.

## What the demo does

- Models a cross-functional AI portfolio across Customer Operations, Engineering, Sales, Finance, Enterprise Knowledge, and Legal/Procurement.
- Lets the user edit adoption, volume, benefit-per-unit, confidence, recurring platform cost, and implementation cost.
- Recalculates:
  - Risk-adjusted annual benefit
  - Year 1 ROI
  - Steady-state ROI
  - Payback period
  - 3-year NPV
  - Portfolio priority score
- Surfaces adoption gaps, payback risk, value concentration, and recommended portfolio actions.
- Uses the OpenAI API to turn the calculated portfolio into a CFO/CDAO-ready executive narrative.

## Run locally

```bash
npm install
cp .env.example .env
# Add your OpenAI API key to .env, then:
export $(cat .env | xargs)
npm run dev
```

Open http://localhost:3000

## Deploy

Deploy this Node app on a service such as Render, Railway, Fly.io, or another Node-compatible host.

Set environment variables:

- `OPENAI_API_KEY`
- `OPENAI_MODEL` (optional)
- `PORT` is normally supplied by the host

## LinkedIn demo flow

1. Open with the thesis: **AI potential is not AI value realized.**
2. Show the cross-functional portfolio and change one adoption assumption.
3. Show how ROI, payback, and portfolio signals update immediately.
4. Click **Generate Executive Readout**.
5. Ask:  
   `Which assumptions should a CFO challenge before funding this portfolio?`
6. Close on the operating model: adoption → realized value → ROI → capital allocation.

## Positioning

This is deliberately industry agnostic. It is meant to demonstrate a repeatable operating model for enterprise AI value realization rather than a vertical-specific ROI calculator.

All example values are illustrative.
