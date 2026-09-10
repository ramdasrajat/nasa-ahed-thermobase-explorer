# ThermoBase v16

## Interactive Scientific Observatory for Extremophile Physiology, Metabolism and Planetary Habitability

ThermoBase v16 is the interactive research interface for the ThermoBase project. It is designed as a continuous scientific exploration rather than a conventional dashboard:

**Dataset → Physiology → Environment → Metabolism → Evidence → Integrated structure → Machine learning → Environment laboratory → Planetary hypotheses → Synthesis**

The interface is built around the current ThermoBase analytical release and presents the completed curation, QC, chemical adjudication, integrated analysis, machine-learning and planetary case-study work.

## Current data release

- **1,238 organism records**
- **337 structured fields**
- Bacteria, Archaea and Eukaryota
- Temperature, pH, salinity and pressure layers
- Environmental and ecosystem descriptors
- Metabolic pathway information
- Extracted chemical vocabulary and chemical-role adjudication
- Taxonomic information
- QC and provenance status
- Machine-learning results
- Enceladus pathway-discrimination analysis

The original ThermoBase S1 baseline is treated as immutable. Literature-derived, normalized and analytical fields remain distinguishable from original source values in the research workflow.

## Scientific journey

### 01 — Dataset & questions

Explore the domain/ecosystem structure, missingness and the complete 337-field architecture. The architecture explorer is drillable from field family to individual field and population coverage.

### 02 — Physiological space

Explore temperature, pH, salinity and pressure. The section includes temperature × pH space, thermal distributions, parallel coordinates, measurement coverage and record-level drill-down.

### 03 — Environments

Move from organisms to environmental settings. Interactive views connect environments to thermal niches, oxygen requirements, taxonomy and metabolic pathways.

### 04 — Metabolism & chemistry

Search organisms, environments, pathways and compounds. Explore pathway counts, chemical-role adjudication, pathway-to-chemical-role relationships and extracted chemical vocabulary.

A chemical mention is not automatically treated as evidence of metabolic utilization.

### 05 — Evidence & quality

Inspect missingness, final QC dispositions and the 337-field evidence architecture. Field-level population and source-family interpretation are exposed rather than hidden.

### 06 — Integrated structure

Combine physiological dimensions, environmental representation and metabolism. Interactive 3D physiology, environment-to-metabolism flows and a variable-pair explorer help formulate questions before prediction.

### 07 — Machine-learning laboratory

Compare environment-only, taxonomy-only and combined models under random five-fold validation. Switch to phylum-grouped validation to stress-test apparent environmental signal.

The interface explicitly distinguishes predictive performance from biological or planetary probabilities.

### 08 — Environment laboratory

Construct a hypothetical environment using temperature, pH, salinity, pressure, oxygen and chemical availability controls. The application ranks measured ThermoBase organisms by a transparent similarity heuristic and shows pathway/product associations.

**This is an exploratory scenario tool, not a life detector and not a validated probability model.** It does not report a fabricated percentage probability of life or abiotic origin.

### 09 — Planetary hypotheses

Compare Earth, Enceladus, Europa, TRAPPIST-1 e and K2-18 b using world-specific evidence regimes.

The Enceladus 14/14 pathway score is explicitly labelled an **ordinal compatibility score**, not a probability of life.

### 10 — Synthesis & open questions

The final section traces the full reasoning chain and separates observations, supported inferences and unresolved questions.

## Visualization principles

Every major chart is designed to provide:

- interactive hover information
- click/drill-down where appropriate
- a full-screen expansion control
- a reading guide
- scientific interpretation
- an explicit distinction between association and causation
- an explicit limitation state when evidence is incomplete

Empty charts are avoided where possible. If a requested visualization lacks sufficient data, the interface should explain the evidence limitation rather than present empty axes.

## Machine-learning interpretation

The current ML results include random five-fold environment-only, taxonomy-only and combined comparisons, plus phylum-grouped environment validation.

Important examples include:

- Methanogenesis: random environment-only ROC-AUC ≈ 0.953; grouped validation is not estimable because all positives occur in one phylum group.
- Sulfate reduction: environment signal remains useful under phylum control.
- Sulfur reduction: environment signal remains useful under phylum control.
- Iron reduction: environment signal remains useful under phylum control.
- Fermentation: environment signal remains useful under phylum control.
- Hydrogen oxidation: the strong random-CV environment signal collapses under lineage control.

These are scientific results, not claims of causal environmental determination.

## Enceladus interpretation

The principal reaction considered is:

**4 H₂ + CO₂ → CH₄ + 2 H₂O**

The pathway analysis evaluates compatibility against a set of planetary constraints. The resulting 14/14 value for hydrogenotrophic methanogenesis is **not** a probability of life.

The case study explicitly considers:

- H₂ availability
- CO₂/carbon chemistry
- methane production
- terrestrial methanogenic analogues
- hydrothermal water-rock chemistry
- abiotic methane production
- transport from the ocean to the plume
- observational uncertainty

## Current planetary information

The planetary interface is updated for the current release using current NASA material and the project's scientific literature layer.

The application intentionally avoids assigning a common life score to worlds whose observational evidence is fundamentally different.

## Research Chat

The Research Chat is a local ThermoBase retrieval layer, not a general-purpose chatbot.

It can answer documented questions about:

- dataset structure
- field architecture
- thermal and pH completeness
- pathways
- compounds
- QC
- machine-learning validation
- lineage stress tests
- Enceladus pathway discrimination
- planetary interpretation

It can also generate a physiological visualization using the current filter context.

Unsupported claims should be identified rather than invented.

## Dark mode

Use the **Dark mode / Light mode** control in the top navigation. The preference is retained locally in the browser.

## Repository structure

```text
ThermoBase/
├── index.html
├── app.js
├── styles.css
├── README.md
└── data/
    └── thermobase.json
```

The application is client-side and can be deployed directly with GitHub Pages.

## Data integrity principles

ThermoBase follows these principles:

1. Original S1 values are not silently overwritten.
2. Literature augmentation remains distinguishable from original source data.
3. Exact-strain evidence is preferred over evidence for related organisms.
4. Upper bounds are not silently converted into optima.
5. Chemical mentions are not automatically treated as metabolic roles.
6. Ambiguous evidence is retained and labelled.
7. Negative ML results are scientifically meaningful and remain visible.
8. Planetary compatibility is not represented as a probability of life unless a defensible probabilistic model exists.

## Important limitations

ThermoBase is not a random sample of terrestrial life. Literature and culture availability introduce sampling bias. Some physiological variables remain incompletely populated, particularly pH and pressure. Chemical contexts can remain ambiguous. One taxonomy record remains unresolved at strain-specific TaxID level. A dedicated ThermoBase-specific phylogenetic tree has not yet been constructed and validated.

Planetary applications are hypotheses and analogical frameworks, not evidence that extraterrestrial life exists.

## AI disclosure

AI-assisted tools were used during selected programming, visualization, research-assistance and interface-development tasks. AI output was treated as provisional and does not replace scientific verification. Quantitative values, literature claims, source identity, taxonomic assignments and scientific interpretations require checking against the underlying data and cited evidence.

## Design philosophy

> **Do not hide complexity; organize it.**

ThermoBase is deliberately built so that users can move from an attractive pattern to the evidence behind it, from the evidence to the confounders, from the model to its stress test, and from a planetary hypothesis to the abiotic alternatives that could make it fail.


## Original dataset

The immutable source baseline used by this project is the NASA Astrobiology Habitable Environments Database (AHED) ThermoBase dataset:

https://ahed.nasa.gov/datasets/e6e6ade4a91fee03d9f99ea19602/t3c34s

The web application preserves the original S1 baseline conceptually and distinguishes audited, normalized, literature-augmented and derived analytical layers.

## v16 interface additions

The v16 interface adds:

- collapsible navigation
- chart maximization with dedicated reading guides
- explicit “How to read” and “What it tells us” guidance for visualizations
- reliable no-data states instead of blank charts
- drillable 337-field architecture based on the actual field list
- evidence search that can match representative field values as well as field names
- an expanded ML Model Explorer using the stored v74 validated metrics and out-of-fold environment-model probabilities for measured records
- transparent methodology and leakage-control explanations
- a simplified planetary comparison framework that does not assign a common probability of life
- an explicit Enceladus reasoning chain separating observation, metabolic analogue, chemical hypothesis and abiotic alternative
- improved Environment Laboratory outputs with non-empty pathway/product views


### v16 verification focus

The v16 interface adds a stricter visualization QA layer: every chart has an explicit reading guide and interpretation, sparse views use evidence-aware empty states, expanded charts retain drill-down context, the ML laboratory separates stored validated metrics from scenario exploration, precision–recall diagnostics are shown alongside ROC, and the environment laboratory exposes the chemical inputs used by its compatibility heuristic. The web release exposes the full 1,238-record, 337-field ML-final record schema. Missing numeric values are serialized as JSON `null` for standards-compliant browser parsing; this is a representation of missingness, not an imputation or scientific correction.

---

# 28. Automated Web Release Audit

ThermoBase includes a dedicated `WEB_AUDIT` release gate so that recurring application and data-integrity failures are checked systematically rather than by memory.

The audit verifies:

- release dimensions (1,238 × 337)
- complete 337-field exposure in every web record
- unique schema and record identifiers
- standards-compliant JSON with no NaN/Infinity values
- frozen web-data SHA-256 against the release manifest
- source-to-web column order and value equivalence when the source CSV is supplied
- chart render paths
- dynamic chart mounts
- maximize/fullscreen support
- universal chart explanation and empty-state contracts
- navigation and browser-history wiring
- physiology, ML and environment-laboratory controls
- field and record drill-down paths
- metabolic target counts against the validated release
- ML comparison, grouped-validation and OOF layers
- non-probabilistic framing of the Enceladus 14/14 compatibility score
- HTTPS source links
- responsive and overflow safeguards
- dark-mode support

Run the release gate locally with:

```bash
python WEB_AUDIT/audit_webapp.py .
```

For the strongest data check, supply the exact ML-final CSV used to build the web release:

```bash
python WEB_AUDIT/audit_webapp.py . --source /path/to/ThermoBase_clean_v74_ML_FINAL_RELEASE.csv
```

A release containing a failed gate should not be deployed. The automated gate complements, but does not replace, manual inspection of the live GitHub Pages rendering. The manual inspection checklist is maintained in `WEB_AUDIT/MANUAL_VISUAL_QA.md`.

A GitHub Actions workflow is included so the structural release gate runs automatically on pushes and pull requests to `main`.
