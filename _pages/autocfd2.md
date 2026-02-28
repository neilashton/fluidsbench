---
layout: page
permalink: /fluidsbench2/
title: AutoCFD2
description: 
nav: false
nav_order: 2
---

<h3>Summary</h3>

The 2nd Automotive CFD Prediction Workshop was held on the 26th-27th August 2021 in a hybrid format - virtually and in Berlin, Germany. It was preceded by the Fourth International Conference in Numerical and Experimental Aerodynamics of Road Vehicles and Trains (AEROVEHICLES 4 ), and both the conference and workshop were held during the same week. Two test-cases were studied; Windsor body and the DrivAer Notchback (detailed underbody with no rolling road or rotating wheels). Meshes were created for all cases in major grid formats i.e OpenFOAM, STAR-CCM+, Fluent, CGNS in addition to geometry and surface meshes. Participants who submitted results were allocated a 15 minute presentation slot however those who wished to present relevant material (i.e wind-tunnel campaign of the DrivAer model) without computing the test-cases were allowed to speak. 
<h3>Test-cases</h3>
<h3>Case 1</h3>

Case 1 is the Windsor Body, which is a simplified vehicle like shape in wind tunnel conditions and is intended to capture the important flow-field structures without needing to model complex geometrical detail as is found in the second DriVAer case. The Windsor model, as developed by Steve Windsor of Jaguar Land Rover, used here has been modified to include a version with wheels. Further details are given in the [paper]https://doi.org/10.26174/thesis.lboro.11823759.v1) by Pavia et al. and the PhD thesis of Varney.
These two cases have had extensive measurements taken at the Loughborough University wind tunnel at a Reynolds number of approximately 3 million (based on vehicle length). The full dataset is available [here](https://repository.lboro.ac.uk/articles/dataset/Windsor_Body_Experimental_Aerodynamic_Dataset/13161284)

Two CAD definitions are provided for the with wheels (1A) and without wheels (1B) geometry. For each case, four standard meshes will be provided in a range of grid formats: low Re wall resolved RANS (WRRANS), wall modelled RANS (WMRANS), low Re wall resolved Eddy Resolving (WRER), wall modelled Eddy Resolving (WMER). For the WRER case, the high aspect ratio near the wall makes this suitable for DES and hybrid RANS-LES approaches, and it is not recommended to be used for a classic eddy resolving LES. Links can also be found below for the post-processing instructions and an example set of files/templates to use for your submission.

<h3>Case 2</h3>
Case 2 is the notchback version of the open cooling DrivAer. A detailed description of the open cooling DrivAer test case is available [here](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/AutoCFD2_OCDA_Info_210706.pdf) (Version v6 - 6th July)  and from the SAE Technical Paper 2021-01-0958 by Hupertz et al.. The workshop will focus on a closed cooling DrivAer configuration with static wheels and static floor. A comprehensive set of experimental data from the Pininfarina Wind Tunnel (Courtesy of Ford) including aerodynamic forces, surface pressure, velocity profiles and 2D flowfield measurements will be available for the correlation of CFD analyses presented at the workshop. Please see below for the meshes which were created using ANSA by BETA-CAE Systems.

<h3>Documents</h3>

| [Test case 1 - Windsor body description](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case1/WindsorDefinitionv0.5.pdf) |
| [Test case 1 kick off presentation](https://fluidsbench2.s3-eu-west-1.amazonaws.com/test-cases/case1/Case1Briefing.pdf)|
| [Test case 1 submission instructions](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case1/WindsorDataSubmission.pdf)|
| [Test case 1 example submission files/template](href=https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case1/Case1DataSubmission.zip)|
| [Test case 1 exp. data]()|
| [Test Case 2 description](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/AutoCFD2_OCDA_Info_210706.pdf) |
| [Test Case 2 submission template](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/AutoCFD2_DrivAer_Result_Template_v15.xlsm) |
| [Test Case 2 flowfield mapping in ANSA/Nastran format](https://fluidsbench2.s3-eu-west-1.amazonaws.com/test-cases/case2/AutoCFD2.zip)|


<h3>Grids</h3>
<h5>Case 1a</h5>

|Surface grids [STL](https://fluidsbench2.s3-eu-west-1.amazonaws.com/test-cases/case1/grids/Windsor_Square_wW_Simplified_Wrap.stl.tgz) |
|Low-Re RANS grid (WRRANS) |[CGNS](https://fluidsbench2.s3-eu-west-1.amazonaws.com/test-cases/case1/grids/wW1A_WRRANS.cgns.tgz)|[OpenFOAM](https://fluidsbench2.s3-eu-west-1.amazonaws.com/test-cases/case1/grids/wW1A_WRRANS.OpenFOAM.tar.gz)|[Fluent](https://fluidsbench2.s3-eu-west-1.amazonaws.com/test-cases/case1/grids/wW1A_WRRANS.msh.tgz)|[STAR-CCM+](https://fluidsbench2.s3-eu-west-1.amazonaws.com/test-cases/case1/grids/wW1A_WRRANS.ccm.tgz) |
|High-Re RANS grid (WMRANS) |[CGNS](https://fluidsbench2.s3-eu-west-1.amazonaws.com/test-cases/case1/grids/wW1A_WMRANS.cgns.tgz)|[OpenFOAM](https://fluidsbench2.s3-eu-west-1.amazonaws.com/test-cases/case1/grids/wW1A_WMRANS.OpenFOAM.tar.gz)|[Fluent](https://fluidsbench2.s3-eu-west-1.amazonaws.com/test-cases/case1/grids/wW1A_WMRANS.msh.tgz)|[STAR-CCM+](https://fluidsbench2.s3-eu-west-1.amazonaws.com/test-cases/case1/grids/wW1A_WMRANS.ccm.tgz) |

<h5>Case 2</h5>

| Case 2 Surface | [STL](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/grids/OC_DrivAer_CC_NB_210512_stla.zip) | [ANSA](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/grids/OC_DrivAer_CC_NB_210512.ansa.zip) | [JT](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/grids/OC_DrivAer_CC_NB_210512.jt.zip) | [Nastran](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/grids/OC_DrivAer_CC_NB_210512.nas.zip) |
| Case 2 Volume (Wall-function) | [CGNS](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/grids/OC_DrivAer_CC_NB_201208_WF.cgns.gz) | [CFD++](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/grids/OC_DrivAer_CC_NB_201208_WF_CFD_PP.tar.gz) | [Fluent](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/grids/OC_DrivAer_CC_NB_201208_WF.msh.gz) | [OpenFOAM](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/grids/OC_DrivAer_CC_NB_201208_WF_OF.tar) |
| Case 2 Volume (Low-Re grid) | [CGNS](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/grids/OC_DrivAer_CC_NB_201208_y1.cgns.gz) | [CFD++](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/grids/OC_DrivAer_CC_NB_201208_y1_CFD_PP.tar.gz) | [Fluent](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/grids/OC_DrivAer_CC_NB_201208_y1.msh.gz) | [OpenFOAM](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/case2/grids/OC_DrivAer_CC_NB_201208_y1_OF.tar) |

<h3>Agenda</h3>

Final Agenda for the workshop is [here](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/admin/AutoCFD2_Agenda.pdf)

<h3>Presentations</h3>

|Workshop kick-off - Neil Ashton (AWS) [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Neil+Ashton+-+fluidsbench2-intro-neil.pdf)|
|Case 1 description and cross-plotting - Gary Page (Loughborough University) [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Gary+Page+-+AutoCFDWorkshopCase1.pdf) [Video-Part1](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/videos/AutoCFD2_01_CommPres_TC1Descr_Page.mp4) [Video-Part2](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/videos/AutoCFD2_33_CommPres_TC1CrossPlot_Pt1_Page.mp4) [Video-Part3](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/videos/AutoCFD2_33_CommPres_TC1CrossPlot_Pt2_Page.mp4) [Video-Part4](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/videos/AutoCFD2_33_CommPres_TC1CrossPlot_Pt3_Page.mp4) |
|Case 2 description and cross-plotting - Burkhard Hupertz (Ford Motor Company) [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Burkhard+Hupertz+-+AutoCFD2_Case2_Post_Final.pdf) [Video-Part1](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/videos/AutoCFD2_02_CommPres_TC2Descr_Hupertz.mp4) [Video-Part2](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/videos/AutoCFD2_34_CommPres_TC2CrossPlot_Pt1_Hupertz.mp4) [Video-Part3](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/videos/AutoCFD2_34_CommPres_TC2CrossPlot_Pt2_Hupertz.mp4) [Video-Part4](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/videos/AutoCFD2_34_CommPres_TC2CrossPlot_Pt3_Hupertz.mp4) |
|Case 2 meshes  - Vangelis Skaperdas (BETA-CAE Systems) [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Vangelis+Skaperdas+-+Skaperdas_BETA_CAE_2ndACW.pdf) [Video](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/videos/Vangelis+Skaperdas+-+Skaperdas_BETA_CAE_2ndACW_2nd_edit.mp4) |
|Statistical error quantification  - Charles Mockett (Upstream CFD) [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Charlie+Mockett+-+UCFD_AutoCFD2_StatisticalErrorQuantification.pdf)|

|Emmanuel Guilmineau  - CNRS - Centrale Nantes [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Emmanuel+Guilmineau+-+guilmineau_AutoCFD2.pdf) [Video](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/videos/AutoCFD2_04_ContrPres_CNRS_Guilmineau.mp4)|
|Eugen Riegel  - Numeric Systems GmbH [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Eugen+Riegel+-+20210216_Numeric+Systems+Pacefish+-+AutoCFD2+Results+discussion.pdf)|
|Marian Zastawny  - Siemens Digital Industries Software [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Marian+Zastawny+-+AutomotiveCFDWorkshop-2.pdf) [Video](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/videos/AutoCFD2_06_ContrPres_SiemensDIS_Zastawny.mp4)|
|Olivier Thiry  - Cadence Design Systems [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/CadenceDesignSystems_Olivier-Thiry_AutoCFD2.pdf) |
|Hendrik Hetmann  - Upstream CFD [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/UCFD_AutoCFD2_UpstreamCFD_Partner_Presentation.pdf) [Video](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/videos/Charlie+Mockett+-+AutoCFD2_08_ContrPres_UpstreamCFD_Hetmann_fixed.mp4)|
|Francesco Fabio Semeraro  - Politecnico di Milano [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Francesco+Fabio+Semeraro+-+Semeraro_AutoCFD2_DrivAer.pdf)|
|Samuel Gomez  - Barcelona Supercomputing Center [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Samuel+G%C3%B3mez+Gonz%C3%A1lez+-+BSC-presentation_ID-26.pdf) [Video](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/videos/AutoCFD2_11_ContrPres_BSC_Gomez.mp4)|
|Walid Hambli  - Imperial College London [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Walid+Hambli+-+AutoCFD_Nektar_Final.pdf)|
|Date Rentema  - DAF Trucks [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/DAFpresentation_AutoCFD2_20210826.pdf)|
|Christian Taucher  - ICON Technology and Process Consulting Ltd. [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Taucher+Christian+-+ICON_2nd_Automotive_Prediction_Workshop.pdf)|
|Astrid Walle  - Astrid Walle CFDsolutions [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Astrid+W+-+AutoCFD_AstridWalle.pdf)|
|Gary Page  - Loughborough University [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Gary+Page+-+LUCase1.pdf)|
|Neil Lewington  - Ford Motor Company [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Neil+Lewington+-+20210826-AutoCFD2-Workshop-Case2-Ford-Motor-Company.pdf)|
|Lian Duan  - The Ohio State University [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Lian+Duan+-+Duan_AutoCFD2_OhioStateU.pdf)|
|Matthew Kronheimer  - TotalSim US [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Matthew+Kronheimer+-+TotalSimUS-2nd-AutoCFD-Prediction-Workshop-Presentation.pdf)|
|Michael Emory - Cascade Technologies, Inc. [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Michael+Emory+-+Cascade_autoCFD2.pdf) [Video](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/videos/AutoCFD2_22_ContrPres_Cascade_Emory.mp4)|
|Paul Batten  - Metacomp Technologies, Inc. [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Paul+Batten+-+AutoCFD2_Metacomp.pdf) [Video](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/videos/AutoCFD2_23_ContrPres_Metacomp_Batten.mp4)|
|Liang Yu  - University of Sydney [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Liang+Yu+-+ID-35.pdf)|
|Arjun Yadav  - Digital Solutions Inc. [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Arjun+Yadav+-+ParticipantId18_ArjunDigitalSolutions.pdf) [Video](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/videos/AutoCFD2_25_ContrPres_DigitalSolutions_Yadav.mp4)|
|Shijun Chu  - Tongji University [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Shijun+Chu+-+The+Wall-modeled+LES+simulation+for+Windsor+model_Chushijun.pdf) [Video](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/videos/AutoCFD2_26_ContrPres_Tongji_Chu.mp4)|
|Krishna Zore  - ANSYS [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Krishna+Zore+-+2ndAutoCFDPW_ANSYS.pdf)|
|Kaushik Reddy Mallareddygari  - SankhyaSutra Labs Ltd. [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Kaushik+Reddy+Mallareddygari+-+ContributorID_16_presentation.pdf)|
|Ondrej Cavoj  - Skoda Auto + Brno University [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Ondrej+Cavoj+-+AUTOCFD2_WORKSHOP_FINAL_PRESENTATION_SKODA_AUTO.pdf)|
|Neil Ashton  - Amazon Web Services [Slides](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/presentations/Neil+Ashton+-+Ashton-AWS.pdf) [Video](https://fluidsbench2.s3.eu-west-1.amazonaws.com/test-cases/videos/AutoCFD2_30_ContrPres_AWS_Ashton.mp4)|

<h3> Organizers</h3>

* Charles Mockett (Upstream CFD) - **Local Organiser**
* Gary Page (Loughborough University)
* Neil Ashton (Amazon Web Services / University of Oxford)
* Burkhard Hupertz (Ford)
* Lian Duan (Ohio State University)
* Timo Kuthada (FKFS)
* Simone Sebben (Chalmers University)
* Charles Ribes (Stellantis)
* Iraj Mortazavi (CNAM)
* Vangelis Skaperdas (BETA-CAE Systems)
* Martin Passmore (Loughborough University)
* Adrian Gaylard (Jaguar Land Rover)
* Fabian Rösler (Audi)
* Marco Kiewat (Audi)
* Astrid Walle (CFD Solutions)

