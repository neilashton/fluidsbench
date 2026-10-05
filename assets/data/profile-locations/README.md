# Profile location guide

`drivaerml-v9.json` is a byte-for-byte display copy of
[`benchmark-specs/drivaerml/drivaerml-diagnostics-v9.json`](https://github.com/neilashton/fluidsbench-submission/blob/f0f5b455929f18fef5c9b41c04beba7468bb3c84/benchmark-specs/drivaerml/drivaerml-diagnostics-v9.json)
from the submission snapshot used by the development leaderboard.

SHA-256: `df22bc807b62f925c32659d681ac44064e6acf46449038b8431b1e9139aba1e8`.

The guide projects the sixteen fixed velocity lines and four Cp cutting planes in
metres. The vehicle outline and Cp surface highlights are schematic; they are not
case geometry or sampled pressure paths. Geometry-relative families show an
explanation instead of fixed coordinates. Selecting a guide location updates the
existing station selector and profile chart. The guide is available only for
DrivAerML and does not change evaluation, scores, profile support, or exports.

Run `node --test tests/test_profile_locations.js` to check the definition digest,
projection scale, station coverage, Cp regions, unavailable support and SVG labels.
