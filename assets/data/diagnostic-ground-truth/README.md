# Diagnostic ground truth

This directory is the website-owned source for reference curves shown in the leaderboard's dataset-defined diagnostic
panels. Prediction curves remain in approved submission files in `fluidsbench-submission`; ground-truth values must not be
copied into that repository.

`manifest.json` maps each dataset name to one JSON file under `datasets/`. Each dataset file contains arrays matching the
`diagnostic_panels[].data_key` values in the approved-submission manifest. Existing external-aerodynamics datasets use:

- `diagnostics.cp_cuts`: one reference curve for every Cp `station_id` declared by the approved-submission manifest.
- `diagnostics.velocity_profiles`: one reference curve for every dataset-specific velocity station declared by the
  approved-submission manifest, or for three shared illustrative placeholder stations when no official list is defined.
- `status`: `prototype_dummy_data` until the arrays are replaced by evaluator-owned benchmark values.

Every curve uses a manifest station ID, quantity ID, and numeric `values`. The manifest declares accepted x and y keys,
so diagnostics are not restricted to pressure coefficient or velocity. Keep station and quantity IDs stable.

HiLiftAeroML uses the 16 published HLPW-5 stations A.1 through D.3. Its `x` coordinate is the vertical offset
`z - z_surface` in full-scale inches at the station's fixed published `x,y` location. The current profile values remain
prototype dummy data; the station locations and coordinate convention follow the official HLPW-5 submission template.

HiLiftAeroML Cp ground truth covers all ten HLPW-5 wing pressure rows A through J, using full-scale `x` in inches. The
HiLiftAeroML paper plots A, D, G, and I as a validation subset, but the website keeps complete workshop station coverage.

VKI-LS59 uses blade-surface isentropic Mach traces on the pressure and suction sides plus a normalized downstream velocity
trace. Rotor37 uses pressure-ratio, temperature-ratio, and density-ratio traces at 10%, 50%, and 90% span; it does not use
a velocity-profile diagnostic. All current VKI-LS59 and Rotor37 reference values are explicitly prototype dummy data.

BlendedNet uses pressure-coefficient and skin-friction traces at three `prototype_*` surface cuts. The locations and
values are explicitly illustrative until the evaluator defines canonical extraction coordinates and tolerances. The
dataset contains surface coefficients rather than volume velocity fields, so no velocity-profile reference is included.
