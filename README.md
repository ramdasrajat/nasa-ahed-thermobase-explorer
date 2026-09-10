# ThermoBase — Interactive Web App

A static, GitHub Pages-ready scientific exploration of the completed ThermoBase analysis.

## Design principle

This is intentionally a **journey of discovery**, not a dashboard dump:

1. Meet the dataset.
2. Explore the physiological space.
3. Ask whether environment predicts metabolism.
4. Stress-test the result against lineage.
5. Carry the learned relationship to Enceladus.
6. Compare competing metabolic pathways.
7. Inspect the underlying organisms and evidence.

All charts are interactive Plotly visualizations. No analytical result is rendered as a static chart image.

## Data provenance

- Frozen dataset: ThermoBase v72
- ML release: v74
- Integrated Enceladus case study: v75
- Organism explorer uses a deliberately reduced, presentation-safe subset of the final v74 release.
- The complete scientific CSV should remain in the research repository/archive rather than being silently replaced by this web subset.

## Run locally

Because browsers restrict local JSON loading, serve the directory:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## GitHub Pages

Upload the contents of this directory to a repository, enable **Settings → Pages → Deploy from a branch**, and select the repository root (or `/docs` if you move the files there).

## Scientific guardrails

The site intentionally states that:

- ML scores are predictive performance metrics, not probabilities of extraterrestrial life.
- Phylum-grouped validation is the stricter generalization test.
- Methanogenesis is not estimable under phylum holdout because all 52 positives are Euryarchaeota.
- H₂ oxidation loses its apparent environment-only signal under lineage control.
- Enceladus methane is not treated as a standalone biosignature.
- Pathway compatibility scores are ordinal decision-support values, not probabilities.
