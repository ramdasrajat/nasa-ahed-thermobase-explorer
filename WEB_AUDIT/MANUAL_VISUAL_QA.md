# ThermoBase manual visual QA checklist

Automated audit is necessary but cannot prove that a live browser layout is visually correct. Before a major release, inspect the deployed GitHub Pages build at desktop, laptop, tablet and mobile widths.

## Journey
- [ ] Overview → Physiology → Environments → Metabolism → Evidence → Integrated → ML → Environment Laboratory → Planetary → Synthesis has no dead end.
- [ ] Browser Back/Forward follows the journey.
- [ ] Sidebar collapses and mobile navigation opens/closes cleanly.

## Charts
- [ ] Every populated chart has readable axes, labels and legend where needed.
- [ ] Every chart can be maximized.
- [ ] Maximize view has no clipping or overlap.
- [ ] Every chart visibly has How to read and What it tells us.
- [ ] Clicking an interactive chart reveals genuinely new information.
- [ ] Sparse data produce an evidence-aware message, never a blank plot.
- [ ] Long labels do not overlap or bleed outside cards.
- [ ] No chart is misleading because a score is presented as a probability.

## Data exploration
- [ ] 337-field architecture drills family → field → detail.
- [ ] Evidence search finds both field names and representative values.
- [ ] Field detail reports population, missingness, examples and origin class.
- [ ] Organism drill-down exposes physiology, environment, metabolism, chemistry and QC.
- [ ] Metabolism search responds while typing.

## Machine learning
- [ ] Target pathway changes all dependent visuals.
- [ ] Predictor set changes the model comparison.
- [ ] Random vs phylum-grouped validation is visibly distinct.
- [ ] Non-estimable grouped results never become zeros.
- [ ] ROC, PR and confusion matrix render and are interpretable.
- [ ] Threshold changes confusion-matrix counts and diagnostics.
- [ ] Methodology is visible and explains leakage control and validation.

## Environment Laboratory
- [ ] Temperature, pH, salinity and pressure change analogue ranking.
- [ ] Oxygen, H₂, CO₂, sulfate, sulfur and Fe(III) change the pathway heuristic as documented.
- [ ] Outputs are labelled as scenario heuristics, not probabilities.
- [ ] Candidate products are not described as atmospheric abundances.

## Planetary hypotheses
- [ ] Switching worlds changes the evidence/unknowns/discriminator content.
- [ ] The Enceladus 14-criterion matrix is not applied to other worlds.
- [ ] 14/14 is visibly described as ordinal compatibility, never probability of life.
- [ ] Current source links open in HTTPS.

## Chat
- [ ] Free-form text produces an answer.
- [ ] Unknown questions receive an explicit limitation rather than silence.
- [ ] Record searches return clickable records.
- [ ] Field searches open field details.
- [ ] Visualization requests produce the intended chart.

## Final rendering
- [ ] No horizontal page overflow.
- [ ] No clipped headings.
- [ ] No clipped buttons.
- [ ] No fixed panel obscures content.
- [ ] Dark mode has readable contrast.
- [ ] Keyboard focus is visible.
