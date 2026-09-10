# ThermoBase Web App v3 — Scientific Journey

This is the GitHub Pages version of the ThermoBase interactive scientific narrative.

## Architecture

- `index.html` — narrative structure
- `styles.css` — visual system and responsive layout
- `app.js` — interactions and Plotly visualizations
- `data/thermobase.json` — presentation-oriented payload generated from the validated ThermoBase v74 release

## Intended journey

1. Exploratory data analysis
2. Evidence / reconstruction / missingness
3. Integrated physiological analysis
4. Machine learning and lineage-controlled validation
5. Planetary case studies
6. Research framework and record explorer

The app is deliberately not a conventional dashboard. Each section presents an observation, then a scientific question that motivates the next section.

## Deployment

Upload the contents of this folder to the GitHub repository used for GitHub Pages. The app expects to be served over HTTP(S). Plotly is loaded from its CDN.

## Scientific status

- Frozen validated dataset: v72
- ML release: v74
- Integrated Enceladus case study: v75
- 1,238 records retained
- 337 structured fields
- One taxonomy identity remains unresolved
- Methanogenesis is not estimable under phylum-grouped validation because all positives are Euryarchaeota
- Compatibility scores are ordinal decision-support values, not probabilities


## v6 — ThermoBase Research Chat

v5 adds a scientist-facing **ThermoBase Scientific assistant** to the GitHub Pages observatory.

It is designed around:
- evidence-aware answers
- current dashboard context
- interactive Plotly visual generation
- explicit separation of observed, literature-supported, ThermoBase-derived, inference and unknown
- ML stress-test interpretation
- Enceladus pathway reasoning with explicit non-probabilistic guardrails

### Static deployment
The v5 demo operates entirely from the public JSON data layer and does not expose an API key. For production LLM responses, connect the assistant UI to a secure server/serverless endpoint; never place an LLM API secret in `app.js` or GitHub Pages.


## v8 — Final visual QA pass

A final presentation-quality pass was applied to the dashboard and research chat:
- hardened against horizontal text/chart bleeding
- responsive chart resizing and safer Plotly margins
- long categorical labels moved to horizontal layouts where appropriate
- improved mobile/tablet breakpoints
- synchronized research-chat context with dashboard filters
- Enter-to-send and Escape-to-close chat behavior
- keyboard focus states
- removed obsolete assistant assets and references
- corrected grouped-ML binding
- restrained shadows, transitions and spacing for a more scientific rather than consumer-app aesthetic

The application remains a static GitHub Pages site backed by the ThermoBase JSON release.
