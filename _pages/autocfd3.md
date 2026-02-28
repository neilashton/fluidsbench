---
layout: page
permalink: /fluidsbench3/
title: AutoCFD3
description: 
nav: false
nav_order: 2
---

<h3>Summary</h3>
The 3rd Automotive CFD Prediction Workshop was held on the 22th-23rd September 2022 in a hybrid format - virtually and in Barcelona, Spain. Two test-cases were studied; Windsor body and the DrivAer Notchback (detailed underbody with no rolling road or rotating wheels) as well as an additional geometry containing a front deflector to assess the ability to predict geometry deltas as well as the absolute numbers and flow fields correctly. Meshes were created for all cases in major grid formats i.e OpenFOAM, STAR-CCM+, Fluent, CGNS in addition to geometry and surface meshes. Participants who submitted results were allocated a 15 minute presentation slot. 

<h3>Test-cases</h3>
<h5>Case 1</h5>
Case 1 is the Windsor Squareback body at 2.5 degrees yaw. In comparison to the second workshop, the test case has been simplified to be just the original no wheels model and to only require meshes with a high y+ and a wall function type boundary condition. The problem is at a Reynolds number of 3 million based on vehicle length and is within a wind-tunnel like domain. As well as force, moment and surface pressure data, there is also available non intrusive PIV measurements in the wake. The baseline grid is similar to the ‘eddy resolving’ grid from the second workshop and contains 37 million cells. The alternate grids halve and double the core cell size to give 7 million and 197 million cell grids. The grid type follows the second workshop using the ‘trimmer mesh’ and prism layer approach from Simcenter STAR-CCM+. The test description can be found [here](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/Case1AutoCFD3Definition.pdf). The submission guidelines can be found [here](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/Case1AutoCFD3Submission.pdf). Example data submission folder can be found [here](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/Case1DataSubmission.zip) too. Grids are available in a variety of formats below.

<h5> Case 2</h5>
Case 2 is the notchback version of the DrivAer. Beside the base variant of the DrivAer (Case 2a) which has been analyzed in the 2nd Automotive CFD Prediction Workshop a variant of the DrivAer (Case 2b), which features a front wheel air deflector, has been proposed for the 3rd workshop. A detailed description of both DrivAer test cases is available [here](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/AutoCFD3_Case2_Intro_220608.pdf) and, for the base variant, from the SAE Technical Paper 2021-01-0958 by Hupertz et al.. For both DrivAer variants the workshop will focus on a closed cooling configuration with static wheels and static floor.  A comprehensive set of experimental data from the Pininfarina Wind Tunnel (Courtesy of Ford) including aerodynamic forces, surface pressure, velocity profiles and 2D flowfield measurements will be available for both DrivAer variants for the correlation of CFD analyses presented at the workshop. Please see below for the meshes which were created using ANSA by BETA-CAE Systems. The mesh of the base variant (Case 2a) is identical to the “Case 2 – Wall-Function Grid” used in the 2nd workshop. The Case 2b mesh is identical to the Case 2a mesh except for the front wheel air deflector region. The post-processing excel spreadsheet to enter your results can be found [here](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/AutoCFD3_DrivAer_Result_Template_v6.xlsm). Also the grid files for flowfield mapping in ANSA and Nastran format can be found [here](https://fluidsbench2.s3-eu-west-1.amazonaws.com/test-cases/case2/AutoCFD2.zip).

<h3>Documents</h3>

| [Test-case description](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/Case1AutoCFD3Definition.pdf) |
| [Example submission folder](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/Case1DataSubmission.zip) |
| [Submission guidelines](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/Case1AutoCFD3Submission.pdf) |

<h3>Grids</h3>
<h5>Case 1</h5>

 | Surface grids (windsor body) | [STL](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/Windsor_Square_nW.stl) | [JT](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/Windsor_Square_nW.jt) |
 | Surface grids (pins-only) | [STL](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/Windsor_Pins.stl) | [JT](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/Windsor_Pins.jt)
| Coarse Grids | [CGNS](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g1.cgns)|[OpenFOAM](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g1.OpenFOAM.tar.gz)|[Fluent](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g1.msh)|[STAR-CCM+](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g1.ccm>)|
| Medium Grids (baseline) | [CGNS](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g2.cgns)|[OpenFOAM](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g2.OpenFOAM.tar.gz)|[Fluent](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g2.msh)|[STAR-CCM+](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g2.ccm)|
| Fine Grids | [CGNS](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g3.cgns)|[OpenFOAM](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g3.OpenFOAM.tar.gz)|[Fluent](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g3.msh)|[STAR-CCM+](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g3.ccm)|

<h5>Case 2</h5>

| Case 2a Surface | [STL](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/grids/OC_DrivAer_CC_NB_210512_stla.zip) | [ANSA](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/grids/OC_DrivAer_CC_NB_210512.ansa.zip) | [JT](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/grids/OC_DrivAer_CC_NB_210512.jt.zip) | [Nastran](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/grids/OC_DrivAer_CC_NB_210512.nas.zip) |
| Case 2b Surface  | [STL](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case2/meshes/OC_DrivAer_CC_NB_FWD_220614_v2_A.stl) | [ANSA](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case2/meshes/OC_DrivAer_CC_NB_FWD_220614_v2.ansa) | [JT](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case2/meshes/OC_DrivAer_CC_NB_FWD_220614_v2.jt) | [Nastran](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case2/meshes/OC_DrivAer_CC_NB_FWD_220614_v2.nas) |
| Case 2a Volume (Wall-function) | [CGNS](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/grids/OC_DrivAer_CC_NB_201208_WF.cgns.gz) | [CFD++](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/grids/OC_DrivAer_CC_NB_201208_WF_CFD_PP.tar.gz) | [Fluent](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/grids/OC_DrivAer_CC_NB_201208_WF.msh.gz) | [OpenFOAM](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/grids/OC_DrivAer_CC_NB_201208_WF_OF.tar) |
| Case 2a Volume (Low-Re grid) | [CGNS](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/grids/OC_DrivAer_CC_NB_201208_y1.cgns.gz) | [CFD++](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/grids/OC_DrivAer_CC_NB_201208_y1_CFD_PP.tar.gz) | [Fluent](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/grids/OC_DrivAer_CC_NB_201208_y1.msh.gz) | [OpenFOAM](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/grids/OC_DrivAer_CC_NB_201208_y1_OF.tar) |
| Case 2b Volume (Wall-function) | [CGNS](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case2/meshes/DrivAer_withDeflectors_WF.cgns.gz) | [CFD++](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case2/meshes/DrivAer_withDeflectors_WF_CFDPP.tar.gz) | [Fluent](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case2/meshes/DrivAer_withDeflectors_WF.msh.gz) | [OpenFOAM](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case2/meshes/DrivAer_withDeflectors_WF_OF.tar.gz) |
| Case 2b Volume (Low-Re grid) | [CGNS](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case2/meshes/DrivAer_withDeflectors_y1.cgns.gz) | [CFD++](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case2/meshes/DrivAer_withDeflectors_y1_CFDPP.tar.gz) | [Fluent](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case2/meshes/DrivAer_withDeflectors_y1.msh.gz) | [OpenFOAM](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case2/meshes/DrivAer_withDeflectors_y1_OF.tar.gz) |

<h3>Agenda</h3>

Final Agenda for the workshop is [here](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/fluidsbench3-210922%2Bagenda-v10.pdf)

<h3> Results Dashboard </h3>

The interactive results dashboard can also be found [here](https://auto-cfd-workshop-3.cfdsolutions.net)


<h3>Presentations</h3>

|Case 1 description and cross-plotting  - Gary Page (Loughborough University) [Slides](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/Fr1135_Case1AutoCFD3full.pdf) [Video](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/case1-part2.mp4)|
|Case 2 description and cross-plotting  - Burkhard Hupertz (Ford Motor Company) [Slides](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/Th1105_AutoCFD3_Case2_Results_220421_PUBLISHED.pdf) [Video](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/case2-part1.mp4)|

|Dashboard Video Demo (Astrid Walle - Neural Concept) [Video](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/dashboard.mp4)|
|Giorgio Giangasperio  - Siemens Digital Industries Software [Slides](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/Th1150_Siemens_AutomotiveCFDWorkshop2022.pdf) [Video](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/Siemens.mp4)|
|Miguel Class  - TotalSim US [Slides](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/Th1210_TotalSimUS-3rd-AutoCFD-Prediction-Workshop-Presentation-no-gifs.pdf) [Video](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/totalsimUS.mp4)|
|Astrid Walle  - Neural Concept [Slides](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/Th1430_AutoCFD3_Walle_NC.pdf) [Video](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/NeuralConcept.mp4)|
|Ivor Annetts  - Bramble CFD/TotalSim UK [Slides](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/Th1450_IvorAnnetts-AutoCFD3.pdf) [Video](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/TotalSimUK.mp4)|
|Tom Fahner - ActiFlow/Lightyear [Slides](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/Actiflow_Lightyear+-+DrivAer-notchback-effect-of-turbulence-modelling-on-delta-prediction.pdf) [Video](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/lightyear.mp4)|
|Sanjin Saric - AVL [Slides](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/Th1530_AutoCFD3_workshop_AVL_Presentation.pdf) [Video](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/AVL.mp4)|
|Olivier Thiry  - Cadence Design Systems [Slides](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/Th1550_PRES_2022-09-22_OTH_AutoCFD3.pdf) [Video](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/Cadence.mp4)|
|Emmanuel Guilmineau  - CNRS - Centrale Nantes [Slides](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/Th1610_guilmineau_AutoCFD3.pdf) [Video](href="https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/CNRS.mp4)|
|Jan Pischinger and Bastian Morcinkowski  - FEV [Slides](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/Th1640_FEV_AutoCFD3_Presentation.pdf) [Video](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/FEV.mp4)|
|Rob Winstanley and Christina Peristeri  - ANSYS [Slides](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/Th1720_3rdAutoCFDPW_ANSYS_RW.pdf) [Video](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/ANSYS.mp4)|
|Paul Norman  - Ford Motor Company [Slides](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/Th1740_PEN_ford_fluidsbench_presentation.pdf) [Video](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/ford.mp4)|
|Francesco Fabio Semeraro  - Politecnico di Milano [Slides](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/Th1800_Semeraro_AutoCFD3_2022.pdf) [Video](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/poli.mp4)|
|CJ Doolittle  - FlexCompute [Slides](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/Flexcompute+AutoCFD3.pdf) [Video](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/flexcompute.mp4)|
|Eugen Riegel  - Numeric Systems GmbH [Slides](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/Fr0915_20220914_Numeric+Systems+Pacefish+-+AutoCFD3+Results+discussion.pdf) [Video](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/pacefish.mp4)|
|Gary Page  - Loughborough University [Slides](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/Fr0935_LUCase1WindsorYaw4.pdf) [Video](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/page.mp4)|
|B. Eiximeno - Barcelona Supercomputing Center [Slides](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/Fr0955_BSC.pdf) [Video](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/bsc.mp4)|
|Neil Ashton  - Amazon Web Services [Slides](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/Fr1015_Ashton-AWS.pdf) [Video](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/aws.mp4)|
|Håkon Strandenes and Florian Schwertfirm  - Kreuzinger und Manhart Turbulenz GmbH [Slides](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/Fr1035_KMTurbulenz-slides.pdf) [Video](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/mglet.mp4)|
|Dr. Eric Jacuzzi and Chris Popiela - NASCAR [Slides](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/Fr1055_NASCAR+AUTOCFD3+Conference+Presentation.pdf) [Video](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/presentations/nascar.mp4)|


<h3> Organizers</h3>

* Oriol Lehmkuhl (Barcelona Supercomputing Center) - **Local Organiser**
* Herbert Owen (Barcelona Supercomputing Center) - **Local Organiser**
* Gary Page (Loughborough University)
* Burkhard Hupertz (Ford)
* Astrid Walle (Neural Concept)
* Neil Ashton (Amazon Web Services / University of Oxford)
* Charles Mockett (Upstream CFD)
* Lian Duan (Ohio State University)
* Timo Kuthada (FKFS)
* Simone Sebben (Chalmers University)
* Charles Ribes (Stellantis)
* Iraj Mortazavi (CNAM)
* Vangelis Skaperdas (BETA-CAE Systems)
* Martin Passmore (Loughborough University)
