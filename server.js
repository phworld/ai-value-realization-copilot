import express from "express";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.json({ limit: "5mb" }));
app.use(express.static(path.join(__dirname, "public")));

function portfolioText(p) {
  const rows = p.workloads.map((w, i) => {
    const r = w.recommended;
    return `${i + 1}. ${w.name} | volume ${Math.round(w.annualTasks).toLocaleString()} tasks/yr | required success ${(w.requiredSuccess*100).toFixed(0)}% | latency SLA ${w.latencySlaMs}ms | control required ${w.controlRequired}/5 | business value/success $${w.valuePerSuccess.toFixed(2)} | recommended ${r.name} | success ${(r.successRate*100).toFixed(0)}% | effective cost/success $${r.costPerSuccess.toFixed(2)} | year-1 TCO $${Math.round(r.year1Tco).toLocaleString()} | net annual value $${Math.round(r.netValue).toLocaleString()} | ROI ${r.roi.toFixed(2)}x | payback ${r.paybackMonths == null ? "n/a" : r.paybackMonths.toFixed(1)+" months"} | constraint fit ${r.eligible ? "yes" : "no"}`;
  }).join("\n");
  return `PORTFOLIO\nAnnual tasks: ${Math.round(p.summary.annualTasks).toLocaleString()}\nYear-1 TCO: $${Math.round(p.summary.year1Tco).toLocaleString()}\nNet annual value: $${Math.round(p.summary.netValue).toLocaleString()}\nPortfolio ROI: ${p.summary.roi.toFixed(2)}x\nAverage effective cost per successful task: $${p.summary.costPerSuccess.toFixed(2)}\nRouting mix: Frontier ${(p.summary.frontierShare*100).toFixed(0)}%, Open Weight ${(p.summary.openShare*100).toFixed(0)}%, Hybrid ${(p.summary.hybridShare*100).toFixed(0)}%\n\nWORKLOADS\n${rows}`;
}

app.post("/api/analyze", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) return res.status(400).json({ error: "OPENAI_API_KEY is not configured." });
    const { portfolio, question } = req.body;
    if (!portfolio?.workloads?.length) return res.status(400).json({ error: "Portfolio data is required." });
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6",
      input: [
        { role: "system", content: `You are an enterprise AI model-strategy advisor to CDOs, CAIOs, CIOs, CTOs and CFOs. Explain workload segmentation across Frontier API, Open Weight / VPC, and Hybrid Routing. Never invent missing facts. Do not equate lowest inference price with best economics. Treat capability, latency, data/control requirements, human review, engineering/MLOps burden, implementation cost, and business value as part of TCO. Make the recommendation operational and financially literate. Flag assumptions that dominate the result. Distinguish model economics from governance judgments. Use concise executive language.` },
        { role: "user", content: `${portfolioText(portfolio)}\n\nQUESTION\n${question || "Give a CDO/CAIO-ready readout: what belongs on frontier, what belongs on open weight, where hybrid routing creates value, what assumptions should be challenged, and what this means for AI platform strategy."}` }
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
app.listen(port, () => console.log(`Enterprise AI Model Economics running at http://localhost:${port}`));
