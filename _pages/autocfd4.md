---
layout: page
permalink: /fluidsbench4/
title: AutoCFD4
description: 
nav: false
nav_order: 2
---

<h3>Summary</h3>
Following the success of the previous three workshops (Oxford, 2019, Berlin, 2021 and Barcelona, 2022), we’re proud to announce that the 4th Automotive CFD Prediction Workshop (AutoCFD 4) will be held in 2024, in person, on Sept 26th/27th at Queen's University Belfast.


The main objective of the 4th Automotive CFD Prediction Workshop is to assess the predictive capability of CFD codes for road-cars geometries. Through mandatory geometry, boundary conditions and computational grids the aim is to provide practical modelling guidelines to the automotive community e.g best-practice turbulence modelling, meshing, numerical schemes. In addition we want to bring the automotive CFD community (both academia and industry) together to discuss future directions. The test-cases for the 4th workshop remain the same as per the 3rd workshop to enable participants to continue their research and progress on the existing cases that still have many unresolved challenges.

Computing the test-cases is not required to attend the workshop but we strongly encourage everyone to consider submitting results.

<h3>Technology Focus Groups</h3>

For this workshop we will use a Technology Focus Group (TFG) model (inspired by the 4th AIAA high-lift CFD prediction workshop) where each particpant is requested to join a TFG which covers 5 core areas. These groups will meet every 4-5 weeks and colloboratively share findings and results as we move towards the workshop. The purpose is to encourage deeper discussions over a longer period, compared to only seeing other results and having a discussion during the 2 days of the workshop. The TFG leaders and contacts details are below. Please reach out to them to be included in the monthly meetings.

[Meshing TFG](mailto:meshing@fluidsbench.org) - Vangelis Skaperdas (BETA-CAE Systems) \
[Noise Factors TFG](mailto:noise@fluidsbench.org) - Burkhard Hupertz (Ford) \
[AI/ML TFG](mailto:aiml@fluidsbench.org) - Neil Ashton (AWS) and Astrid Walle (Siemens Energy) \
[Scale Resolving Simulations (SRS) TFG](mailto:srs@fluidsbench.org) - Charles Mockett and Marian Fuchs (Upstream CFD) \
[HPC TFG](mailto:hpc@fluidsbench.org) - Hebert Owen and Oriol Lehmkuhl (Barcelona Supercomputing Center)


A description of the scope and goals of each TFG can be found [here](https://fluidsbench4.s3.eu-west-1.amazonaws.com/AutoCFD_TFG_overall.pdf).

Our data policy can be found [here](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/data-policy.pdf).

<h3>Dates</h3>
<b>Deadline for abstract*</b> : 14th June 2024 (extended) \
<b>Notice of acceptance</b> : 1st July 2024 (extended) \
<b>Deadline for data submission</b> : 9th August 2024 \
<b>Workshop</b> : September 26th/27th 2024
<br/><br/>

Due to the large number of registered contributors and the limited number of speaking slots during the two days, all participants who are submitting results will also be asked to submit a 250 word abstract (word or PDF) describing their preliminary findings and methodology ([template](https://fluidsbench4.s3.eu-west-1.amazonaws.com/fluidsbench4-abstract-template.docx)). This will go through a light peer-review by the organising committee to select speaking slots.
For those who are not selected to speak, there will be an opportunity to record a video that will be made available on the workshop website.
Please submit these abstracts to the TFG leads:

[Meshing TFG](mailto:meshing@fluidsbench.org) - Vangelis Skaperdas (BETA-CAE Systems) \
[Noise Factors TFG](mailto:noise@fluidsbench.org) - Burkhard Hupertz (Ford) \
[AI/ML TFG](mailto:aiml@fluidsbench.org) - Neil Ashton (AWS) and Astrid Walle (Siemens Energy) \
[Scale Resolving Simulations (SRS) TFG](mailto:srs@fluidsbench.org) - Charles Mockett and Marian Fuchs (Upstream CFD) \
[HPC TFG](mailto:hpc@fluidsbench.org) - Hebert Owen and Oriol Lehmkuhl (Barcelona Supercomputing Center)
<h3>Test-cases</h3>
<h5>Case 1</h5>

<img class="photo" alt="Windsor Body" src="{{ site.baseurl }}/assets/img/windsor.png">

Case 1 is the Windsor Squareback body at 2.5 degrees yaw and is the same test-case studied in the [3rd automotive CFD workshop](https://fluidsbench.org/fluidsbench3). The problem is at a Reynolds number of 3 million based on vehicle length and is within a wind-tunnel like domain. As well as force, moment and surface pressure data, there is also available non intrusive PIV measurements in the wake. The baseline grid is similar to the ‘eddy resolving’ grid from the second workshop and contains 37 million cells. The alternate grids halve and double the core cell size to give 7 million and 197 million cell grids. The grid type follows the second workshop using the ‘trimmer mesh’ and prism layer approach from Simcenter STAR-CCM+.

<h3>Documents</h3>

| [Test-case description and submission guidelines (April 2024)](https://fluidsbench4.s3.eu-west-1.amazonaws.com/test-cases/case1/Gary+Page+-+Case1AutoCFD4Description.pdf) |
| [Example submission form (v5 - May 2024)](https://fluidsbench4.s3.eu-west-1.amazonaws.com/test-cases/case1/AutoCFD4_Windsor_Case1_Result_Template_v5.xlsm) |

<h3> Submission </h3>
Please note that submissions should be uploaded to [dropbox](https://www.dropbox.com/request/A6cJNTT9egFtYiFICjAi) and an email sent to admin@fluidsbench.org to inform the organizers. If your organization has restricted access to cloud upload services then please contact the admin email so that we can use an alternative

<h3>Grids</h3>

 | Surface grids (windsor body) | [STL](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/Windsor_Square_nW.stl) | [JT](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/Windsor_Square_nW.jt) |
 | Surface grids (pins-only) | [STL](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/Windsor_Pins.stl) | [JT](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/Windsor_Pins.jt)
| Coarse Grids | [CGNS](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g1.cgns)|[OpenFOAM](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g1.OpenFOAM.tar.gz)|[Fluent](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g1.msh)|[STAR-CCM+](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g1.ccm)|
| Medium Grids (baseline) | [CGNS](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g2.cgns)|[OpenFOAM](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g2.OpenFOAM.tar.gz)|[Fluent](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g2.msh)|[STAR-CCM+](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g2.ccm)|
| Fine Grids | [CGNS](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g3.cgns)|[OpenFOAM](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g3.OpenFOAM.tar.gz)|[Fluent](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g3.msh)|[STAR-CCM+](https://fluidsbenchv3.s3.eu-west-1.amazonaws.com/test-cases/case1/meshes/c1g3.ccm)|

<h5>Case 2</h5>

Case 2 is the notchback version of the DrivAer and is the same as used in the 3rd automotive CFD prediction workshop. This includes the base variant of the DrivAer (Case 2a) which has been analyzed in the 2nd and 3rd Automotive CFD Prediction Workshops a variant of the DrivAer (Case 2b), which features a front wheel air deflector, and was studied for the 3rd workshop. A detailed description of both DrivAer test cases is available here and, for the base variant, from the SAE Technical Paper 2021-01-0958 by Hupertz et al.. For both DrivAer variants the workshop will focus on a closed cooling configuration with static wheels and static floor. A comprehensive set of experimental data from the Pininfarina Wind Tunnel (Courtesy of Ford) including aerodynamic forces, surface pressure, velocity profiles and 2D flowfield measurements will be available for both DrivAer variants for the correlation of CFD analyses presented at the workshop. Please see below for the meshes which were created using ANSA by BETA-CAE Systems. The mesh of the base variant (Case 2a) is identical to the “Case 2 – Wall-Function Grid” used in the 2nd workshop. The Case 2b mesh is identical to the Case 2a mesh except for the front wheel air deflector region.
<h3>Documents</h3>

| [Test-case description (updated May24)](https://fluidsbench4.s3.eu-west-1.amazonaws.com/test-cases/case2/AutoCFD4_Case2_Intro_240409.pdf) |
| [Submission template (updated May24)](https://fluidsbench4.s3.eu-west-1.amazonaws.com/test-cases/case2/AutoCFD4_DrivAer_Result_Template_v6s-2.xlsm) |
| [Flowfield mapping (ANSA and NASTRAN formats)](https://fluidsbench2.s3-eu-west-1.amazonaws.com/test-cases/case2/AutoCFD2.zip) |
| [Updated 2024 mesh details](https://fluidsbench4.s3.eu-west-1.amazonaws.com/test-cases/case2/meshes/AutoCFD4_UpdatedMesh.pdf) |

<h3> Submission </h3>
Please note that submissions should be uploaded to [dropbox](https://www.dropbox.com/request/A6cJNTT9egFtYiFICjAi) and an email sent to admin@fluidsbench.org to inform the organizers. If your organization has restricted access to cloud upload services then please contact the admin email so that we can use an alternative

<h3>Grids (updated 04/24)</h3>

| Case 2 CAD | [Baseline DrivAer](https://www.epc.ed.tum.de/en/aer/research-groups/automotive/drivaer/download/) | [Additional STEP](https://fluidsbench4.s3.eu-west-1.amazonaws.com/test-cases/case2/meshes/fluidsbench4case2additionalgeo.zip) |
| Case 2a Surface | [STL](https://fluidsbench4.s3.eu-west-1.amazonaws.com/test-cases/case2/meshes/AutoCFD4_Case2a.stl.gz) |
| Case 2b Surface  | [STL](https://fluidsbench4.s3.eu-west-1.amazonaws.com/test-cases/case2/meshes/AutoCFD4_Case2b.stl.gz) |
| Case 2a Volume | [CGNS](https://fluidsbench4.s3.eu-west-1.amazonaws.com/test-cases/case2/meshes/AutoCFD4_Case2.1.cgns.gz) | [CFD++](https://fluidsbench4.s3.eu-west-1.amazonaws.com/test-cases/case2/meshes/AutoCFD4_Case2.1_CFD_PP.tar.gz) | [Fluent](https://fluidsbench4.s3.eu-west-1.amazonaws.com/test-cases/case2/meshes/AutoCFD4_Case2.1.msh.gz) | [OpenFOAM](https://fluidsbench4.s3.eu-west-1.amazonaws.com/test-cases/case2/meshes/AutoCFD4_Case2.1_OF.tar.gz) |
| Case 2b Volume | [CGNS](https://fluidsbench4.s3.eu-west-1.amazonaws.com/test-cases/case2/meshes/AutoCFD4_Case2.2.cgns.gz) | [CFD++](https://fluidsbench4.s3.eu-west-1.amazonaws.com/test-cases/case2/meshes/AutoCFD4_Case2.2_CFD_PP.tar.gz) | [Fluent](https://fluidsbench4.s3.eu-west-1.amazonaws.com/test-cases/case2/meshes/AutoCFD4_Case2.2.msh.gz) | [OpenFOAM](https://fluidsbench4.s3.eu-west-1.amazonaws.com/test-cases/case2/meshes/AutoCFD4_Case2.2_OF.tar.gz) |

<h3>Agenda</h3>

[Final detailed Agenda (v2.0 - Sept 2024)](https://fluidsbench4.s3.eu-west-1.amazonaws.com/AutoCFD4DraftDetailedAgendav2.0.pdf)

Workshop [booklet](https://fluidsbench4.s3.eu-west-1.amazonaws.com/4th+Automotive+CFD+Prediction+Workshop.pdf) (including presentation titles)


<h3>Presentations</h3>

<h4>1st mini virtual workshop (Oct 2023)</h4>

* Mini-workshop [presentations](https://fluidsbench4.s3.eu-west-1.amazonaws.com/fluidsbench4-miniworkshop-presentations.zip) from each TFG
* Mini-workshop [video recording](https://fluidsbench4.s3.eu-west-1.amazonaws.com/fluidsbench4-miniworkshop-video.mp4)

<h4>Main workshop (Oct 2024)</h4>

* Workshop [booklet](https://fluidsbench4.s3.eu-west-1.amazonaws.com/4th+Automotive+CFD+Prediction+Workshop.pdf) (including presentation titles)
* The AutoCFD4 results dashboard is now available [here](https://fluidsbench4.cfdsolutions.net)

<h5>Day 1 - Opening</h5>

|Workshop opening talk  - Prof. Ben Thornber (Queens University), Dr Neil Ashton (AWS) [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/ThursdayMorningIntros-Website/OpeningCeremony.pdf) [Video](https://youtu.be/hntbFeLmvUA)|
|Test Case 1 Summary  - Gary Page (Loughborough University) [slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/ThursdayMorningIntros-Website/Case1AutoCFD4Workshop.pdf) [Video](https://youtu.be/sOcbbEDgQPU)|
|Test Case 2 Summary  - Burkhard Hupertz (Ford) [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/ThursdayMorningIntros-Website/AutoCFD4_Case2_Intro_Results_240918.pdf) [Video](https://youtu.be/u4HFI2aie4w)|

<h5>Day 1 - Meshing TFG</h5>

|Meshing TFG Summary  - Vangelis Skaperdas (BETA-CAE Systems) [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/Meshing-Website/Skaperdas_Meshing.pdf) [Video](https://youtu.be/HvNXoBCKuPM)|
|Maurice Nayman (Multimatic) - Meshing TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/Meshing-Website/Maurice_Nayman_Nayman_Meshing.pdf) [Video](https://youtu.be/XrBA3VSzToc)|
|David Egan (Ennova Technologies) - Meshing TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/Meshing-Website/David_Egan_Ennova_Introduction_v12.pdf) [Video](https://youtu.be/om9pPazB1Is)|
|Burkhard Hupertz (Ford) and Nils Thome (AVL Schrick) - Meshing TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/Meshing-Website/Nils_Thome%CC%81_20240920_AutoCFD4_mesh_analysis_BetaFord.pdf) [Video](https://youtu.be/pH_1SyMH__o)|
|Liang Yu (University of Sydney) - Meshing TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/Meshing-Website/SydneyQueensBelfastMQ.pdf) [Video](https://youtu.be/SAAai6ywtcs)|

<h5>Day 1 - SRS TFG</h5>

|SRS TFG Summary  - Charles Mockett (Upstream CFD) [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/SRS-Website/Mockett_SRS_AutoCFD4_TFG-SRS_Summary_UCFD_20240926.pdf) [Video](https://youtu.be/iW25bCsgzPE)|
|Ananda Subramani Kannan (Volvo) - SRS TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/SRS-Website/Ananda+Subramani_Kannan_Kannan_ScaleResolvingSimulation_24w38.pdf) [Video](https://youtu.be/ahYylotefjQ)|
|Louis Fliessbach (UpstreamCFD) - SRS TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/SRS-Website/Louis_Fliessbach_FliessbachEtAl_ScaleResolvingSimulation.pdf) [Video](https://youtu.be/JhAg7cKOAZA)|
|Emmanuel Guilmineau (CNRS) - SRS TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/SRS-Website/Emmanuel_GUILMINEAU_Guilmineau_SRS_v2.pdf) [Video](https://youtu.be/S0OMjhVxuec)|
|David Flad (Ansys) - SRS TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/SRS-Website/David_Flad_DavidFlad_SRS_ANSYS_DrivAer+Notch+Back.pdf) [Video](https://youtu.be/FgKcRYUxqnQ)|
|Z J Wang (University of Kansas) - SRS TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/SRS-Website/Z.J.+_Wang_Wang_ScaleResolvingSimulation.pdf) [Video](https://youtu.be/EsbNIk83Atk)|
|Dania Ahmed (University of Manchester) - SRS TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/SRS-Website/Dania_Ahmed_AutoCFD4-Dania-Ahmed.pdf) [Video](https://youtu.be/o5DAGTj7gA4)|
|Jordan Angel (Volcano Platforms) - SRS TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/SRS-Website/Jordan_Angel_JordanAngel_VolcanoScaLES_AutoCFD4.pdf) [Video](https://youtu.be/lgZ6A2ipkHg)|
|CJ Doolittle (Flexcompute) - SRS TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/SRS-Website/CJ_Doolittle_Doolittle_SRS_Flexcompute.pdf) [Video](https://youtu.be/tzy8bphs8Eg)|
|F. Schwertfirm (KM Turbulenz GmbH) - SRS TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/SRS-Website/Schwertfirm_SRS.pdf) [Video](https://youtu.be/E9G_c5fXCdU)|

<h5>Day 1 - HPC TFG</h5>

|HPC TFG Summary  - Herbert Owen (BSC) [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/HPC-Website/HPC-Owen.pdf) [Video](https://youtu.be/XYc41_Gk4uQ)|
|Eugen Riegel (Numeric Systems) - HPC TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/HPC-Website/Riegel_HPC.pdf) [Video](https://youtu.be/XRhHPUFh_ug)|
|Benet Eiximeno (BSC) - HPC TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/HPC-Website/Benet_Eiximeno_EiximenoFranch_Benet.pdf) [Video](https://youtu.be/pnL4f8z04u0)|
|Olivier Thiry (Cadence) - HPC TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/HPC-Website/Olivier_Thiry_2024-09-26_AutoCFD4_Cadence_Olivier_thiry.pdf) [Video](https://youtu.be/Yq7zGVuxpnc)|
|Guido Parenti (Dassault Systemes) - HPC TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/HPC-Website/Guido_Parenti_Parenti_HPC_PowerFLOW_Uncertainty_Quantification_using_DrivAer.pdf) [Video](https://youtu.be/1f0tcpVKe78)|
|Thomas D. Economon (Luminary Cloud) - HPC TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/HPC-Website/Thomas_Economon_Economon-SRS.pdf) [Video](https://youtu.be/lR2UIWex5cM)|

<h5>Day 2 - Noise Factors TFG</h5>

|Noise Factors TFG Summary  - Burkhard Hupertz (Ford) [slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/Noise-Website/Hupertz_Noise_Factors_Intro.pdf) [Video](https://youtu.be/fQ6ZR4MPnKg)|
|Guido Parenti (Dassault Systemes) - Noise Factors TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/HPC-Website/Guido_Parenti_Parenti_HPC_PowerFLOW_Uncertainty_Quantification_using_DrivAer.pdf) [Video](https://youtu.be/rmtJsF_ECgM)|
|Matthew Aultman (Ohio State University) - Noise Factors TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/Noise-Website/Matthew_Aultman_Aultman_NoiseFactors.pdf) [Video](https://youtu.be/pAso0Nab-_Q)|
|Grzegorz Borowiec (Siemens) - Noise Factors TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/Noise-Website/Grzegorz_Borowiec_Borowiec_noiseFactors.pdf) [Video](https://youtu.be/LIpN1A1ll24)|
|Paul Norman (Ford Motor Company) - Noise Factors TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/Noise-Website/Norman_Sowemimo_Thome_AutoCFD4.pdf) [Video](https://youtu.be/M_VKTtUnffY)|
|Ondřej Čavoj and Pavel Viochna (Skoda) - Noise Factors TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/Noise-Website/Ondrej_Cavoj_CavojViochna_Noise+1.pdf) [Video](https://youtu.be/TMblzkBgZ3Q)|
|Matheus Marques (BrambleCFD) - Noise Factors TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/Noise-Website/Matheus_Marques_Marques_NoiseFactor.pdf) [Video](https://youtu.be/Os3SgNthbPY)|

<h5>Day 2 - AIML TFG</h5>

|AI/ML TFG Summary - Neil Ashton (AWS), Astrid Walle (Siemens Energy) [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/AIML-Website/AIML_TFG_Summary.pdf) [Video](https://youtu.be/2TnowaQo6FA)|
|Neil Ashton (AWS) AI/ML TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/AIML-Website/Ashton_Neil_AWS_AIML.pdf) [Video](https://youtu.be/UgLYXtiJ84o)|
|Astrid Walle (Siemens Energy) AI/ML TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/AIML-Website/Astrid_Walle_Walle_AIML.pdf) [Video](https://youtu.be/5lDvZu7z_es)|
|Chao Xia (Chalmers University) AI/ML TFG [Slides](https://fluidsbench4.s3.eu-west-1.amazonaws.com/presentations/AIML-Website/Chao_Xia_Chao_AIML.pdf) [Video](https://youtu.be/H_mXw2aclxc)|

<h5>Day 2 - TFG Leader & Automotive OEM panel discussions</h5>

|Automotive OEM Panel Discussion - Charles Ribes (Stellantis), Burkhard Hupertz (Ford), Vilem Skarolek (Skoda), Karthik Thandayutham (JLR), Ananda Kannan (Volvo) [Video](https://youtu.be/91HLjjP3MEA)|
|TFG Leader Panel Discussion - Burkhard Hupertz (Ford), Gary Page (Loughborough University), Neil Ashton (AWS), Astrid Walle (Siemens Energy), Herbert Owen (BSC), Vangelis Skaperdas (BETA-CAE Systems) [Video](https://youtu.be/pNU5IBAwX5Q)|

<h3> Venue </h3>
The conference will be held in Riddle Hall which is located 1.5 miles (2.4km) south of Belfast City Centre.

**DIRECTIONS**

If you are travelling by air, train or road, our information will help you plan your trip to the AutoCFD4 Conference held at Riddel Hall, 185 Stranmillis Rd, Belfast BT9 5EE, UK. Riddel Hall is approximately 15 minutes from the city centre by several buses, the 8d being the fastest and running every 20 minutes from Great Northern Mall in the city centre. Alternatively, it is a 40 minutes walk.

**BY AIR**

**GEORGE BEST BELFAST CITY AIRPORT**

The airport is situated just three miles from Belfast City Centre. The Airport Express 600 bus service runs from the airport terminal to the city center every 20 minutes (06.00-22.05) Monday to Friday. (Please check timetable for services on Saturday & Sundays).

**BELFAST INTERNATIONAL AIRPORT**

Belfast International Airport is situated just 18 miles north-west of Belfast and is easily accessed via the major road and motorway network. For up to date traffic information log on to the Roads Service website: www.trafficwatchni.com Regular bus and coach services are available from the front of the terminal building to Belfast. Airport Express 300 operates a 24 hour service between the airport and Belfast with buses departing every 15 minutes for the majority of the day on weekdays, with reduced frequencies at off peak times and weekends. The bus leaves from the bus stop located opposite the terminal exit. The International Airport Taxi Company, official taxi operator for the Belfast International Airport, are available for hire 24 hours a day 7 days a week outside the right hand door of the airport Exit lobby. Only taxis approved by Belfast International Airport are permitted to use the taxi rank. A list of sample fares is displayed in the exit hall of the terminal building.

**DUBLIN AIRPORT**

Dublin airport is approximately 160km south of Belfast. The Dublin Airport Express Coach Service operates from Dublin Airport 24 hours a day, with a journey time of approximately 2 hours. Tickets and seat reservations +44 (0)28 9066 6630 www.translink.co.uk

**BY SEA**

Belfast is easily accessed by sea with crossings from both Scotland and England. Travel by state of the art superfast ferries with journey times from just 2 hours 15 minutes. Click on one of the links below for more details. https://www.stenaline.co.uk/ http://www.poferries.com/en/portal

**BY RAIL**

The Enterprise service runs 8 times daily (5 times on Sunday) from Dublin to Belfast. The journey time is approximately 2 hours. Enterprise tickets and seat reservations +44 (0)28 9089 9409 www.translink.co.uk Transport links for Queen’s University Belfast can be found here.

<img class="photo" alt="Hall" src="{{ site.baseurl }}/assets/img/belfast.jpg">

<h3> Accomadation </h3>
There are many hotels, airbnbs and guest houses available in Belfast. The [Visit Belfast website](https://visitbelfast.com) is a great resource for information on accommodation and ‘things to do’.


We have negotiated a 12% Discount for visiting delegates at both Clayton Hotel Belfast & Maldron Hotel Belfast City if you chose to stay there. To avail of the discount, attendees will need to enter the promo code “CONF12” in the promo box on the relevant website:

[Clayton Hotel Belfast](http://www.claytonhotelbelfast.com)

[Maldron Belfast City](http://www.maldronhotelbelfastcity.com)


<h3>Useful Links</h3>

* [Delegate Offers](https://businesseventsbelfastandni.com/exclusive-delegate-offers)
* [Brochures and Downloads (including City Guide and city Map)](https://businesseventsbelfastandni.com/bochures-downloads/)
* [Getting Here](https://visitbelfast.com/plan/getting-to-belfast-travel-options/)
* [Things To See & Do](https://visitbelfast.com/see-do/)
* [Places To Eat & Drink](https://visitbelfast.com/eat-drink/)
* [Ideas and Inspiration](https://visitbelfast.com/ideas/)
* [Sustainable Belfast](https://visitbelfast.com/plan/sustainable-belfast/)
* [What’s On](https://visitbelfast.com/whats-on)
* [Essential Information](https://visitbelfast.com/plan/essential-information/)
<h3> Organizers</h3>

* Ben Thornber (Queens University Belfast) - **Local Organiser**
* Neil Ashton (Amazon Web Services)
* Burkhard Hupertz (Ford)
* Gary Page (Loughborough University)
* Charles Mockett (Upstream CFD)
* Astrid Walle (Siemens Energy)
* Vangelis Skaperdas (BETA-CAE Systems)
* Oriol Lehmkuhl (Barcelona Supercomputing Center)
* Herbert Owen (Barcelona Supercomputing Center)
* Charles Ribes (Stellantis)
