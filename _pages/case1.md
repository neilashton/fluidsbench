---
layout: page
permalink: /case1/
title: Test Case 1
description: 
nav: false
nav_order: 2
---

<h5>Case 1</h5>

<img class="photo" alt="Windsor Body" src="{{ site.baseurl }}/assets/img/windsor.png">

Case 1 is the Windsor Squareback body at 2.5 degrees yaw and is the same test-case studied in the [4th automotive CFD workshop](https://fluidsbench.org/fluidsbench4). The problem is at a Reynolds number of 3 million based on vehicle length and is within a wind-tunnel like domain. As well as force, moment and surface pressure data, there is also available non intrusive PIV measurements in the wake. The baseline grid is similar to the ‘eddy resolving’ grid from the second workshop and contains 37 million cells. The alternate grids halve and double the core cell size to give 7 million and 197 million cell grids. The grid type follows the second workshop using the ‘trimmer mesh’ and prism layer approach from Simcenter STAR-CCM+.

<h3>Documents</h3>

| [Test-case description and submission guidelines (Feb 2026)](https://fluidsbench5.s3.eu-west-1.amazonaws.com/test-cases/case1/Case1AutoCFD5Description.pdf) |
| [Example submission form (v5 - May 2024)](https://fluidsbench4.s3.eu-west-1.amazonaws.com/test-cases/case1/AutoCFD4_Windsor_Case1_Result_Template_v5.xlsm) |

<h3> Submission </h3>
Please note that submissions should be uploaded to [dropbox](https://www.dropbox.com/request/A6cJNTT9egFtYiFICjAi) and an email sent to admin@fluidsbench.org to inform the organizers. If your organization has restricted access to cloud upload services then please contact the admin email so that we can use an alternative

<h3>Grids</h3>

 | Surface grids (windsor body) | [STL](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/Windsor_Square_nW.stl) | [JT](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/Windsor_Square_nW.jt) |
 | Surface grids (pins-only) | [STL](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/Windsor_Pins.stl) | [JT](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/Windsor_Pins.jt)
| Coarse Grids | [CGNS](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g1.cgns)|[OpenFOAM](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g1.OpenFOAM.tar.gz)|[Fluent](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g1.msh)|[STAR-CCM+](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g1.ccm)|
| Medium Grids (baseline) | [CGNS](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g2.cgns)|[OpenFOAM](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g2.OpenFOAM.tar.gz)|[Fluent](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g2.msh)|[STAR-CCM+](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g2.ccm)|
| Fine Grids | [CGNS](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g3.cgns)|[OpenFOAM](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g3.OpenFOAM.tar.gz)|[Fluent](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g3.msh)|[STAR-CCM+](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g3.ccm)|
