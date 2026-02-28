---
layout: page
permalink: /fluidsbench1/
title: AutoCFD1
description: 
nav: false
nav_order: 2
---

<h3>Summary</h3>
The 1st Automotive CFD Prediction Workshop was held on the 11-12th December 2019 in Oxford at St Anne's College. Three test-cases were studied; SAE Notchback geometry, DrivAer Fastback and DrivAer Estate vehicle which are described below Meshes were created for all cases in major grid formats i.e OpenFOAM, STAR-CCM+, Fluent, CGNS in addition to geometry and surface meshes. Participants who submitted results were allocated a 15 minute presentation slot however those who wished to present relevant material (i.e wind-tunnel campaign of the DrivAer model) without computing the test-cases were allowed to speak.
Three test-cases were available for participants to compute and submit to the workshop organisors to crossplot and summarize. Each participant who computes these cases will be given a 15 minute presentation slot to discuss their results. 

Participants were encouraged to run the coarse, medium and fine meshes to demonstrate mesh convergence where possible.

<h3>Document</h3>

| [Test case 1 - SAE Notchback description](https://fluidsbench1.s3.eu-west-1.amazonaws.com/Presentations/Case1-descriptionv0p6.pdf) |
| [Test Case 2a - DrivAer Fastback description](https://fluidsbench1.s3.eu-west-1.amazonaws.com/Presentations/Case2-descriptionv1p9.pdf) |
| [Test Case 2b - DrivAer Estate description](https://fluidsbench1.s3.eu-west-1.amazonaws.com/Presentations/Case2-descriptionv1p9.pdf) |


Experimental data for Case 1 was made [available](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case1/Exp_Data/all-expdata-compressed.tgz) which has the data itself and some instructions. Please refer to the main [test-case description](https://fluidsbench1.s3.eu-west-1.amazonaws.com/Presentations/Case1-descriptionv0p6.pdf) for complete information.

<h3>Grids</h3>
<h5>Case 1 </h5>

 | Surface grids | [STL](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case1/Geometry/SAENotchback.stl) | [STEP](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case1/Geometry/SAENotchback.step) | [PRT](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case1/Geometry/SAENotchback.prt) | [IGS](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case1/Geometry/SAENotchback.igs)
| DES-type committee grids | [CGNS](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case1/Committee_Grids/DES_Grid/SAE20DESgridCGNSADF.cgns.gz)|[OpenFOAM](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case1/Committee_Grids/DES_Grid/SAE20DESgridOF.tar.gz)|[Fluent](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case1/Committee_Grids/DES_Grid/SAE20DESgridFluentA.msh.gz)|[STAR-CCM+](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case1/Committee_Grids/DES_Grid/SAE20DESgrid.ccm.gz)|
| RANS-type committee grids | [CGNS](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case1/Committee_Grids/RANS_Grid/SAE20loReGridCGNS.cgns.gz)|[OpenFOAM](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case1/Committee_Grids/RANS_Grid/SAE20loReGridOF.tar.gz) | [Fluent](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case1/Committee_Grids/RANS_Grid/SAE20loReGridFluentA.msh.gz)|[STAR-CCM+](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case1/Committee_Grids/RANS_Grid/SAE20loReGrid.ccm.gz) |
| BETA-CAE Participant ANSA grid (Coarse) | [OpenFOAM](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case1/Participant_Grids/BETA-CAE/SAE20_Coarse_HexaPoly_OF.tar.gz) | [Fluent](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case1/Participant_Grids/BETA-CAE/SAE20_Coarse_HexaPoly.msh.gz)|[STAR-CCM+](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case1/Participant_Grids/BETA-CAE/SAE20_Coarse_HexaPoly.ccm.gz)|
| BETA-CAE Participant ANSA grid (Medium) |[CGNS](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case1/Participant_Grids/BETA-CAE/SAE20_Medium_HexaPoly.cgns.gz) | [OpenFOAM](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case1/Participant_Grids/BETA-CAE/SAE20_Medium_HexaPoly_OF.tar.gz)|[Fluent](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case1/Participant_Grids/BETA-CAE/SAE20_Medium_HexaPoly.msh.gz)|[STAR-CCM+](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case1/Participant_Grids/BETA-CAE/SAE20_Medium_HexaPoly.ccm.gz)|
| BETA-CAE Participant ANSA grid (Fine) |[CGNS](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case1/Participant_Grids/BETA-CAE/SAE20_Fine_HexaPoly.cgns.gz) | [OpenFOAM](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case1/Participant_Grids/BETA-CAE/SAE20_Fine_HexaPoly_OF.tar.gz)|[Fluent](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case1/Participant_Grids/BETA-CAE/SAE20_Fine_HexaPoly.msh.gz)|[STAR-CCM+](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case1/Participant_Grids/BETA-CAE/SAE20_Fine_HexaPoly.ccm.gz)|


<h5>Case 2a</h5>

 | Surface grids | [STL](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2a/Geometry/DrivAer_FastBack.stl) | [STEP](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2a/Geometry/DrivAer_fastback.step) |
| Coarse volume grid |[CGNS](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2a/Committee_Grids/coarse/DrivAer_fastback_Coarse_HexaPoly.ansa.gz.cgns.gz) | [OpenFOAM](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2a/Committee_Grids/coarse/DrivAer_fastback_Coarse_HexaPoly.ansa.gz_OPENFOAM.tar.gz) | [Fluent](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2a/Committee_Grids/coarse/DrivAer_fastback_Coarse_HexaPoly.ansa.gz.msh.gz)|[STAR-CCM+](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2a/Committee_Grids/coarse/DrivAer_fastback_Coarse_HexaPoly.ansa.gz.ccm.gz)|
| Medium volume grid |[CGNS](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2a/Committee_Grids/medium/DrivAer_fastback_Medium_HexaPoly.ansa.gz.cgns.gz) | [OpenFOAM](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2a/Committee_Grids/medium/DrivAer_fastback_Medium_HexaPoly.ansa.gz_OPENFOAM.tar.gz)|[Fluent](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2a/Committee_Grids/medium/DrivAer_fastback_Medium_HexaPoly.ansa.gz.msh.gz)|[STAR-CCM+](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2a/Committee_Grids/medium/DrivAer_fastback_Medium_HexaPoly.ansa.gz.ccm.gz)|
| Fine volume grid |[CGNS](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2a/Committee_Grids/fine/DrivAer_fastback_Fine_Volume_HexaPoly.ansa.gz.cgns.gz) | [OpenFOAM](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2a/Committee_Grids/fine/DrivAer_fastback_Fine_Volume_HexaPoly.ansa.gz_OPENFOAM.tar.gz)|[Fluent](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2a/Committee_Grids/fine/DrivAer_fastback_Fine_Volume_HexaPoly.ansa.gz.msh.gz)|[STAR-CCM+](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2a/Committee_Grids/fine/DrivAer_fastback_Fine_Volume_HexaPoly.ansa.gz.ccm.gz)|

<h5>Case 2b</h5>

 | Surface grids | [STL](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2b/Geometry/DrivAer_Estate.stl) | [STEP](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2b/Geometry/DrivAer_estate.step) |
| Coarse volume grid | [CGNS](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2b/Committee_Grids/coarse/DrivAer_estate_Coarse_HexaPoly.ansa.gz.cgns.gz) | [OpenFOAM](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2b/Committee_Grids/coarse/DrivAer_estate_Coarse_HexaPoly.ansa.gz_OPENFOAM.tar.gz) | [Fluent](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2b/Committee_Grids/coarse/DrivAer_estate_Coarse_HexaPoly.ansa.gz.msh.tgz)|[STAR-CCM+](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2b/Committee_Grids/coarse/DrivAer_estate_Coarse_HexaPoly.ansa.gz.ccm.gz)|
| Medium volume grid |[CGNS](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2b/Committee_Grids/medium/DrivAer_estate_Medium_Hexapoly.ansa.gz.cgns.gz) | [OpenFOAM](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2b/Committee_Grids/medium/DrivAer_estate_Medium_Hexapoly.ansa.gz_OPENFOAM.tar.gz)|[Fluent](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2b/Committee_Grids/medium/DrivAer_estate_Medium_Hexapoly.ansa.gz.msh.gz)|[STAR-CCM+](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2b/Committee_Grids/medium/DrivAer_estate_Medium_Hexapoly.ansa.gz.ccm.gz)|
| Fine volume grid |[CGNS](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2b/Committee_Grids/fine/DrivAer_estate_Fine_HexaPoly.ansa.gz.cgns.gz) | [OpenFOAM](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2b/Committee_Grids/fine/DrivAer_estate_Fine_HexaPoly.ansa.gz_OPENFOAM.tar.gz)|[Fluent](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2b/Committee_Grids/fine/DrivAer_estate_Fine_HexaPoly.ansa.gz.msh.gz)|[STAR-CCM+](https://fluidsbench1.s3.eu-west-1.amazonaws.com/case2b/Committee_Grids/fine/DrivAer_estate_Fine_HexaPoly.ansa.gz.ccm.gz)|

<h3>Agenda</h3>

Final Agenda for the workshop is [here](https://fluidsbench1.s3.eu-west-1.amazonaws.com/Presentations/agendav4.pdf)

<h3>Presentations</h3>

|[Case 1](https://fluidsbench1.s3.eu-west-1.amazonaws.com/Presentations/Case1-Summary.pdf) - Test-Case Description, Meshing and Cross-Plotting Results - Loughborough University Organisers |
|[Case 2](https://fluidsbench1.s3.eu-west-1.amazonaws.com/Presentations/BETA-CAE-Case2aMeshing.pdf) - Mesh Generation - BETA-CAE Systems/Organisers |
|[Case 2](https://fluidsbench1.s3.eu-west-1.amazonaws.com/Presentations/Case2-summary-v2.pdf) - Cross-plotting- University of Oxford/BETA-CAE/Organisers |
|[001](https://fluidsbench1.s3.eu-west-1.amazonaws.com/Presentations/001-Oxford-Presentation.pdf) - Oxford/BETA-CAE/AWS |
|[007](https://fluidsbench1.s3.eu-west-1.amazonaws.com/Presentations/007-ANSYS-Presentation.pdf) - ANSYS |
|[011](https://fluidsbench1.s3.eu-west-1.amazonaws.com/Presentations/011-BSC-Presentation.pdf) - Barcelona Supercomputing Centre |
|[012](https://fluidsbench1.s3.eu-west-1.amazonaws.com/Presentations/012-Metacomp-Presentation.pdf) - Metacomp |
|[013](https://fluidsbench1.s3.eu-west-1.amazonaws.com/Presentations/013-Imperial-Presentation.pdf) - Imperial College London |
|[015](https://fluidsbench1.s3.eu-west-1.amazonaws.com/Presentations/015-Linkoping-Presentation.pdf) - Linköping University |
|[020](https://fluidsbench1.s3.eu-west-1.amazonaws.com/Presentations/020-Siemens-Presentation.pdf) - Siemens |
|[022](https://fluidsbench1.s3.eu-west-1.amazonaws.com/Presentations/022-ohio-presentation.pdf) - The Ohio State University |
|[025](https://fluidsbench1.s3.eu-west-1.amazonaws.com/Presentations/025-PSA-Presentation.pdf) - PSA |
|[026](https://fluidsbench1.s3.eu-west-1.amazonaws.com/Presentations/026-upstreamCFD-presentation.pdf) - upstreamCFD |
|[029](https://fluidsbench1.s3.eu-west-1.amazonaws.com/Presentations/029-Sydney-Presentation.pdf) - University of Sydney |

<h3> Organizers</h3>

* Neil Ashton (University of Oxford)  
* Gary Page (Loughborough University) 
* Vangelis Skaperdas (BETA-CAE Systems) 
* Owen Sinclair (University of Oxford) 
* William Van Noordt (University of Oxford) 
* Agata Dybisz (University of Oxford) 
* Martin Passmore (Loughborough University)

<h3> Thank you </h3>

The organisers are grateful to Amazon Web Services for sponsoring this workshop. The organisers would also like to thank the UK Fluids Network and the Ground Vehicle Aerodynamics Special Interest Group (a EPSRC project funded under grant agreement EP/N032861/1) for early discussions on this workshop. In addition members of the UK Automotive Aerodynamics Forum have also given very useful input on the workshop.


