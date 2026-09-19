import express from "express";
import OpenAI from "openai";
import XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: "5mb" }));
app.use(express.static(path.join(__dirname, "public")));

function buildPortfolioNarrative(portfolio) {
  const lines = portfolio.useCases.map((u, i) => (
    `${i+1}. ${u.name} | Function: ${u.function} | Stage: ${u.stage} | Status: ${u.status} | ` +
    `Adoption: ${(u.adoption*100).toFixed(0)}% | Risk-adjusted annual benefit: $${Math.round(u.riskAdjustedBenefit).toLocaleString()} | ` +
    `Year 1 ROI: ${u.year1ROI.toFixed(2)}x | Steady-state ROI: ${u.steadyROI.toFixed(2)}x | ` +
    `Payback: ${u.paybackMonths.toFixed(1)} months | Priority score: ${u.priorityScore.toFixed(2)} | Action: ${u.action}`
  )).join("\n");

  return `
PORTFOLIO SUMMARY
Use cases: ${portfolio.summary.useCases}
Risk-adjusted annual benefit: $${Math.round(portfolio.summary.riskAdjustedAnnualBenefit).toLocaleString()}
Year 1 total cost: $${Math.round(portfolio.summary.year1TotalCost).toLocaleString()}
Year 1 net benefit: $${Math.round(portfolio.summary.year1NetBenefit).toLocaleString()}
Blended Year 1 ROI: ${portfolio.summary.blendedYear1ROI.toFixed(2)}x
Steady-state ROI: ${portfolio.summary.steadyStateROI.toFixed(2)}x
Weighted adoption: ${(portfolio.summary.weightedAdoption*100).toFixed(1)}%
3-year NPV: $${Math.round(portfolio.summary.npv3yr).toLocaleString()}

USE CASES
${lines}
`.trim();
}

app.post("/api/analyze", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(400).json({ error: "OPENAI_API_KEY is not configured on the server." });
    }

    const { portfolio, question } = req.body;
    if (!portfolio?.useCases?.length) {
      return res.status(400).json({ error: "Portfolio data is required." });
    }

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const portfolioText = buildPortfolioNarrative(portfolio);

    const system = `
You are an enterprise AI value-realization advisor to CFOs, CIOs, CDAOs, CAIOs, operating partners, and transformation leaders.

Your job is to turn portfolio economics into decision-quality executive insight.

Rules:
- Never invent data that is not present.
- Explicitly distinguish measured results from assumptions when possible.
- Focus on adoption-to-value conversion, ROI, payback, cost efficiency, execution risk, confidence, and capital allocation.
- Surface concentration risk and weak assumptions.
- Avoid generic AI commentary.
- Make recommendations specific, operational, and financially literate.
- Use crisp executive language.
- When comparing use cases, explain the evidence behind the comparison.
- If economics look implausibly strong, flag the assumption that likely drives the result.
`;

    const user = `
${portfolioText}

Executive question:
${question || `Produce a CFO/CDAO-ready portfolio readout with:
1. The three most important economic insights.
2. Where value is leaking through adoption, cost, or execution.
3. Which use cases should be scaled, optimized, or remediated and why.
4. The assumptions an executive should challenge.
5. A concise 5-sentence board-ready narrative.`}
`;

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6",
      input: [
        { role: "system", content: system },
        { role: "user", content: user }
      ]
    });

    res.json({ text: response.output_text });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e?.message || "Analysis failed." });
  }
});

app.get("/health", (_, res) => res.json({ ok: true }));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`AI Value Realization Copilot running on http://localhost:${port}`));