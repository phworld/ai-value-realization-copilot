# Enterprise AI Model Economics & Routing Copilot

An industry-agnostic prototype for CDOs, CAIOs, CIOs, CTOs, CFOs, operating partners, and AI transformation leaders.

## Core question

**Which model belongs on which workload?**

The app compares three enterprise deployment strategies at the workload level:

1. Frontier API
2. Open Weight / VPC
3. Hybrid Routing

The decision is deliberately **not** based on token or inference price alone. A route must first clear the workload's capability, latency, and control requirements. The model then compares total economics.

## Economics modeled

For every route:

- Annual task volume
- Expected task-success rate
- Required task-success threshold
- Latency vs SLA
- Deployment/control fit
- Variable model / compute cost
- Human-review cost
- Annual engineering / MLOps burden
- Implementation cost
- Year-1 TCO
- Business value from successful tasks
- Net annual value
- ROI
- Effective cost per successful task
- Payback period

The recommended route is the eligible route with the highest modeled net value. If no route clears all constraints, the UI flags that fact rather than pretending the cheapest route is acceptable.

## OpenAI layer

The OpenAI API receives the calculated portfolio economics and turns them into a CDO/CAIO-ready narrative covering:

- Which workloads warrant frontier capability
- Which are better fits for open-weight infrastructure
- Where hybrid routing has the strongest economics
- Which assumptions dominate the recommendation
- What the portfolio means for enterprise AI platform strategy

The prompt explicitly instructs the model not to invent missing data.

## Run locally

```bash
npm install
cp .env.example .env
# add OPENAI_API_KEY to .env
export $(cat .env | xargs)
npm start
```

Open `http://localhost:3000`.

## Render deployment

- Build command: `npm install`
- Start command: `npm start`
- Health check: `/health`
- Environment variable: `OPENAI_API_KEY`
- Optional: `OPENAI_MODEL=gpt-5.6`

## Recommended demo sequence

1. Open with: **“The enterprise decision isn't frontier versus open weight. It's workload segmentation.”**
2. Point to the three hard gates: capability, latency, control.
3. Change a workload's required success rate or control requirement.
4. Show the recommended route change.
5. Explain effective cost per successful task—not cost per token.
6. Generate the OpenAI executive readout.
7. Ask: **“Which assumptions should a CDO challenge before standardizing this model strategy?”**

All example data is illustrative. Replace it with evaluated model performance, infrastructure costs, and enterprise workload data.
