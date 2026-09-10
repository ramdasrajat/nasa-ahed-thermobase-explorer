# ThermoBase Web Audit System

This is the automated release gate for the ThermoBase GitHub Pages application.

## Run

From the repository root:

```bash
python WEB_AUDIT/audit_webapp.py .
```

For a full source-to-web data equivalence check, provide the ML-final CSV used to build the web release:

```bash
python WEB_AUDIT/audit_webapp.py . --source /path/to/ThermoBase_clean_v74_ML_FINAL_RELEASE.csv
```

## What it checks

### A — Data integrity
- 1,238 records
- 337 fields
- unique schema and record IDs
- every record exposes the complete schema
- standards-compliant JSON
- no NaN/Infinity values
- metadata/payload consistency

### B — Source equivalence
- source dimensions
- source/web column order
- source/web cell equivalence
- explicit handling of harmless floating-point serialization differences

### C — Application wiring
- unique HTML IDs
- static DOM references
- scientific journey sections
- local data path
- chat wiring
- navigation history
- mobile/collapsible navigation

### D — Visualization contracts
- every static chart has a render path
- dynamic modal/chat plots are accounted for
- maximize/fullscreen support
- universal empty-state handling
- universal “How to read” / “What it tells us” framework

### E — Interaction contracts
- physiology filters
- ML controls
- environment laboratory controls
- field and record drill-downs
- metabolism search
- scenario updates

### F — Scientific consistency
- canonical metabolic target counts
- model-comparison release
- lineage-controlled validation release
- 1,238 OOF rows

### G — Scientific language/sources
- 14/14 is not allowed to be framed as probability of life
- external links must use HTTPS
- original NASA/AHED dataset link must remain present

### H — Presentation safeguards
- responsive CSS
- horizontal overflow protection
- keyboard focus states
- theme support
- payload-size warning

## Release policy

A release with any **FAIL** is not considered deployment-ready.

Warnings are non-blocking presentation safeguards, but should still be reviewed.

This system does not replace real-browser visual QA. It exists to catch recurring structural, data, interaction and scientific-consistency failures before deployment.
