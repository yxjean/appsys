import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { renderToString } from "react-dom/server";
import Publication from "./categories/Publication";
import PostgraduateSupervision from "./categories/PostgraduateSupervision";
import TeachingUndergraduateSupervision from "./categories/TeachingUndergraduateSupervision";
import VASI from "./categories/VASI";
import AdministrativeService from "./categories/AdministrativeService";
import Consultancy from "./categories/Consultancy";
import Research from "./categories/Research";
import { DataGrid } from "@mui/x-data-grid";
import EditSquareIcon from '@mui/icons-material/EditSquare';
import PrintIcon from '@mui/icons-material/Print';
import StaffPerformanceSummaryPrintTemplate from './staffPerformanceSummaryPrintTemplate';

const StaffPerformanceSummary = ({ setSelectedSection, setPerformanceAreaStaffId }) => {


  const [ rows, setRows ] = useState([]);
  const [ userData, setUserData ] = useState(null);
  const [ isShowingEditMdl, setIsShowingEditMdl ] = useState(false);
  const [ selectedUserId, setSelectedUserId ] = useState("");
  const [ selectedCategory, setSelectedCategory ] = useState("");
  const [ selectedEntries, setSelectedEntries ] = useState("");
  const [ selectedMarks, setSelectedMarks ] = useState("");
  const [ isShowingConfirmAgreementMdl, setIsShowingConfirmAgreementMdl ] = useState(false);
  const [ hasConfirmedAgreement, setHasConfirmedAgreement ] = useState(false);
  const [ maxCap, setMaxCap ] = useState(0)
  const [ reportData, setReportData ] = useState(null);

  const componentRef = useRef(null);
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const columns = [{
    field: "id",
    headerName: "Id"
  },
  {
    field: "name",
    headerName: "Name",
    flex: 1,
    renderCell: (params)=>(
      <a className="cursor-pointer text-blue-800"
        onClick={()=>{ setSelectedSection('Admin & Superior Performance Area'); setPerformanceAreaStaffId(params.row.id) }} 
      >{params.row.name}</a>
    )
  },
  {
    field: "publication",
    headerName: "Publication",
    renderCell: (params)=>{
      return (
        <div className="h-full w-full" onDoubleClick={()=>{ handleCellDblClickEvent(params.row.id,"publication",params.row.publicationEntries.length,params.formattedValue,params.row.performance_area_score_distribution?.find(d => d.name === "Publication")?.quantity || 0) }}>
          <label> { params.row.publicationEntries } e / { params.formattedValue } m</label>
        </div>
      )
    },
    flex: 1,
    align: "center", headerAlign: "center"
  },
  {
    field: "research",
    headerName: "Research",
    renderCell: (params)=>{
      return (
        <div className="h-full w-full" onDoubleClick={()=>{ handleCellDblClickEvent(params.row.id,"research",params.row.researchEntries.length,params.formattedValue,params.row.performance_area_score_distribution?.find(d => d.name === "Research")?.quantity || 0) }}>
          <label> { params.row.researchEntries } e / { params.formattedValue } m</label>
        </div>
      )
    },
    flex: 1,
    align: "center", headerAlign: "center"
  },
  {
    field: "teachingAndUndergraduateSupervision",
    headerName: "Teaching & Undergraduate Supervision",
    renderCell: (params)=>{
      return (
        <div className="h-full w-full" onDoubleClick={()=>{ handleCellDblClickEvent(params.row.id,"teachingAndUndergraduateSupervision",params.row.teachingAndUndergraduateSupervisionEntries.length,params.formattedValue,params.row.performance_area_score_distribution?.find(d => d.name === "Teaching & Undergraduate Supervision")?.quantity || 0
  ) }}>
          <label> { params.row.teachingAndUndergraduateSupervisionEntries } e / { params.formattedValue } m</label>
        </div>
      )
    },
    flex: 1,
    align: "center", headerAlign: "center"
  },
  {
    field: "postgraduateSupervision",
    headerName: "Postgraduate Supervision",
    renderCell: (params)=>{
      return (
        <div className="h-full w-full" onDoubleClick={()=>{ handleCellDblClickEvent(params.row.id,"postgraduateSupervision",params.row.postgraduateSupervisionEntries.length,params.formattedValue,params.row.performance_area_score_distribution?.find(d => d.name === "Postgraduate Supervision")?.quantity || 0) }}>
          <label> { params.row.postgraduateSupervisionEntries } e / { params.formattedValue } m</label>
        </div>
      )
    },
    flex: 1,
    align: "center", headerAlign: "center"
  },
  {
    field: "vasi",
    headerName: "VASI",
    renderCell: (params)=>{
      return (
        <div className="h-full w-full" onDoubleClick={()=>{ handleCellDblClickEvent(params.row.id,"vasi",params.row.vasiEntries.length,params.formattedValue,params.row.performance_area_score_distribution?.find(d => d.name === "VASI")?.quantity || 0) }}>
          <label> { params.row.vasiEntries } e / { params.formattedValue } m</label>
        </div>
      )
    },
    flex: 1,
    align: "center", headerAlign: "center"
  },
  {
    field: "admin_service",
    headerName: "Admin Service",
    renderCell: (params)=>{
      return (
        <div className="h-full w-full" onDoubleClick={()=>{ handleCellDblClickEvent(params.row.id,"admin_service",params.row.adminServiceEntries.length,params.formattedValue,params.row.performance_area_score_distribution?.find(d => d.name === "Administrative Service")?.quantity || 0) }}>
          <label> { params.row.adminServiceEntries } e / { params.formattedValue } m</label>
        </div>
      )
    },
    flex: 1,
    align: "center", headerAlign: "center"
  },
  {
    field: "consultancy",
    headerName: "Consultancy",
    renderCell: (params)=>{
      return (
        <div className="h-full w-full" onDoubleClick={()=>{ handleCellDblClickEvent(params.row.id,"consultancy",params.row.consultancyEntries.length,params.formattedValue,params.row.performance_area_score_distribution?.find(d => d.name === "Consultancy")?.quantity || 0) }}>
          <label> { params.row.consultancyEntries } e / { params.formattedValue } m</label>
        </div>
      )
    },
    flex: 1,
    align: "center", headerAlign: "center"
  },
  {
    field: "total_marks",
    headerName: "Total Marks",
    flex: 1,
    align: "center", headerAlign: "center"
  },
  {
    field: "grade",
    headerName: "Grade",
    flex: 1,
    align: "center", headerAlign: "center"
  },
  {
    headerName: "Actions",
    renderCell: (params)=>(
      <div className="w-full h-full flex justify-center items-center">
        <PrintIcon onClick={()=>{handleOnPrintButton(params.row.id)}}/>
      </div>
    )
  }]

  useEffect(()=>{
    getUserData();
    getUserAllPerformanceEnries()
  },[])

  async function handleConfirmAgreementBtn(){
    const { data } = await axios.post(`${backendUrl}/api/staffPerformanceSummary`,{
      confirmedAgreement: rows
    },{withCredentials: true});

    if(data.success){
      setIsShowingConfirmAgreementMdl(false);
      setHasConfirmedAgreement(true);
    }
  }




  async function handleOnPrintButton(userId){
    try{
      const [ reportRes, userProfileRes, assessmentPeriodRes ] = await Promise.all([
        axios.get(
          "http://localhost:4000/api/performance-report/user/"+userId,
          { withCredentials: true }
        ),
        axios.get(
          "http://localhost:4000/api/user/profile/user/"+userId,
          { withCredentials: true }
        ),
        axios.get(
          "http://localhost:4000/api/assessment-period",
          { withCredentials: true }
        )        
      ])


      if(reportRes.data.success && userProfileRes.data.success && assessmentPeriodRes.data.success){
        const html = renderToString(
          <StaffPerformanceSummaryPrintTemplate reportData={reportRes.data.reportData} userData={userProfileRes.data.user} assessmentPeriod={assessmentPeriodRes.data.assessmentPeriod}/>
        ) 

        const printPreview = window.open("","_blank","width=800","height=600");
        printPreview.document.open();
        printPreview.document.write(html);
        printPreview.document.close();
        printPreview.focus();
        printPreview.print();
        printPreview.close();
      }
    }
    catch(err){
      toast.error(err.message);
    }

  }


  function handleMdlSubmit(){

    if(selectedMarks > maxCap){
      toast.error("The max capacity for this area is "+ maxCap);
      return;
    }

    let changedVal = JSON.parse(JSON.stringify(rows));
    const userInd = rows.findIndex(val=>val.id === selectedUserId);
    const valChanged = parseFloat(selectedMarks) - parseFloat(changedVal[userInd][selectedCategory]);


    changedVal[userInd][selectedCategory] = selectedMarks;
    changedVal[userInd]["total_marks"] += valChanged;


    changedVal[userInd]["grade"] = "F";

    if(changedVal[userInd]["total_marks"] >= 80){
      changedVal[userInd]["grade"] = "A";
    }
    else if(changedVal[userInd]["total_marks"] >= 60){
      changedVal[userInd]["grade"] = "B";
    }
    else if(changedVal[userInd]["total_marks"] >= 50){
      changedVal[userInd]["grade"] = "C";
    }

    setRows(changedVal);

    closeEditMdl();
  }

  function handleCellDblClickEvent(userId, category,entries,marks,maxCap){
    if(userData.privileges !== "view"){
      return;
    }

    setIsShowingEditMdl(true);
    setSelectedUserId(userId);
    setSelectedCategory(category);
    setSelectedEntries(entries);
    setSelectedMarks(marks);
    setMaxCap(maxCap);
  }

  function closeEditMdl(){
    setIsShowingEditMdl(false);
    setSelectedUserId("");
    setSelectedCategory('');
    setSelectedEntries("");
    setSelectedMarks("");
    setMaxCap(0);
  }

  async function getUserData(){
    const { data } = await axios.get(`${backendUrl}/api/user/profile`,{ withCredentials: true });
    setUserData(data.user);
  }

  async function getUserAllPerformanceEnries(){
    const { data } = await axios.get(`${backendUrl}/api/performance-entries/all`, { withCredentials: true })
    const confirmedAgreement = await axios.get(`${backendUrl}/api/staffPerformanceSummary`,{ withCredentials: true });



    if(data.success && confirmedAgreement.data.success) {
      if(confirmedAgreement.data.confirmedAgreement.length){
        setHasConfirmedAgreement(true);
      }




      setRows(data.allUserPerformanceEntries.map((val,ind)=>{
        let hasModifiedMarks = false;

        if(confirmedAgreement.data.confirmedAgreement.length){
          confirmedAgreement.data.confirmedAgreement[0].confirmedAgreement.forEach((vle)=>{
            if(val._id === vle.staffId._id){
              val = vle;
              val.id = val.staffId._id;
              val.name = val.staffId.name;
              val["publication"] = val.publicationMarks;
              val["research"] = val.researchMarks;
              val["teachingAndUndergraduateSupervision"] = val.teachingAndUndergraduateSupervisionMarks;
              val["postgraduateSupervision"] = val.postgraduateSupervisionMarks;
              val["vasi"] = val.vasiMarks;
              val["admin_service"] = val.adminServiceMarks;
              val["consultancy"] = val.consultancyMarks;
              val["total_marks"] = val.totalMarks;


              hasModifiedMarks = true;
              return false;
            }
          })
        }


        if(hasModifiedMarks){
          return val;
        }

        
        
        val.id = val._id;



        val.publicationEntries = val.performanceEntries.publication.length;
        val.researchEntries = val.performanceEntries.research.length;
        val.teachingAndUndergraduateSupervisionEntries = val.performanceEntries.teaching_and_undergraduate_supervision.length;
        val.postgraduateSupervisionEntries = val.performanceEntries.postgraduate_supervision?val.performanceEntries.postgraduate_supervision.length:0;
        val.vasiEntries = val.performanceEntries.vasi.length;
        val.adminServiceEntries = val.performanceEntries.admin_service.length;
        val.consultancyEntries = val.performanceEntries.consultancy.length;



        let publicationMarks = 0;
        let researchMarks = val.performanceEntries.research.length * 2;
        let teachingMarks = 0;
        let undergraduateMarks = 0;
        let teachingCount = 0;
        let postgraduateMarks = 0;
        let vasiMarks = val.performanceEntries.vasi.length * 2;
        let adminServiceMarks = val.performanceEntries.admin_service.length * 2;
        let consultancyMarks = 0;


        val.performanceEntries.publication.forEach((vle,idx)=>{
          const details = JSON.parse(vle.details);
          const type = details.type.toLowerCase();
          const category = details.category.toLowerCase();
          if(type === "journal" || type === "conference")
          {
            if(category === "wos"){
              publicationMarks += 2
            }
            else if(category === "scopus"){
              publicationMarks += 1
            }
            else {
              publicationMarks += 0.5
            }
          }
          else if(type === "book chapter"){
            publicationMarks += 0.5
          }
        })

        val.performanceEntries.postgraduate_supervision.forEach((vle,idx)=>{
          const details = JSON.parse(vle.details);
          const programmeLevel = details.programmeLevel.toLowerCase();

          postgraduateMarks += programmeLevel === "master"?1:2;
        })



        val.performanceEntries.teaching_and_undergraduate_supervision.forEach((vle,idx)=>{
          const details = JSON.parse(vle.details);
          const teaching = details.teaching;
          const undergraduateSupervision = details.undergraduateSupervision;

          if(teaching){
            teachingCount++;
            teachingMarks += parseFloat(teaching.studentEvaluationRating);
          }

          if(undergraduateSupervision){
            undergraduateMarks += 2; 
          }

        })

        val.performanceEntries.consultancy.forEach((vle,idx)=>{
          const details = JSON.parse(vle.details);
          const individualAmt = parseFloat(details.individualAmount);
          const totalAmt = parseFloat(details.totalAmt);

          if(!individualAmt){
            console.log(details);
          }

          consultancyMarks += individualAmt;
        })


        if(teachingCount) {
          teachingMarks = teachingMarks / teachingCount;
        }

        if(publicationMarks > 10) publicationMarks = 10;
        if(researchMarks > 10) researchMarks = 10;
        if(teachingMarks > 5) teachingMarks = 5;
        if(undergraduateMarks > 10) undergraduateMarks = 10;
        if(postgraduateMarks > 10) postgraduateMarks = 10;
        if(vasiMarks > 10) vasiMarks = 10;
        if(adminServiceMarks > 10) adminServiceMarks = 10;
        if(consultancyMarks > 20000) consultancyMarks = 20000;



        val["publication"] = (val["performance_area_score_distribution"].filter(val=> val.name === "Publication")[0].quantity * publicationMarks / 10).toFixed(1);
        val["research"] = (val["performance_area_score_distribution"].filter(val=> val.name === "Research")[0].quantity *  researchMarks / 10).toFixed(1);
        val["teachingAndUndergraduateSupervision"] = (val["performance_area_score_distribution"].filter(val=> val.name === "Teaching & Undergraduate Supervision")[0].quantity *  (teachingMarks + undergraduateMarks) / 15).toFixed(1);
        val["postgraduateSupervision"] = (val["performance_area_score_distribution"].filter(val=> val.name === "Postgraduate Supervision")[0].quantity *  postgraduateMarks / 10).toFixed(1);
        val["vasi"] = (val["performance_area_score_distribution"].filter(val=> val.name === "VASI")[0].quantity *  vasiMarks / 10).toFixed(1);
        val["admin_service"] = (val["performance_area_score_distribution"].filter(val=> val.name === "Administrative Service")[0].quantity *  adminServiceMarks / 10).toFixed(1);
        val["consultancy"] = (val["performance_area_score_distribution"].filter(val=> val.name === "Consultancy")[0].quantity * consultancyMarks / 20000).toFixed(1);

        val["total_marks"] = parseFloat(val["publication"]) + 
          parseFloat(val["research"]) + 
          parseFloat(val["teachingAndUndergraduateSupervision"]) + 
          parseFloat(val["postgraduateSupervision"]) + 
          parseFloat(val["vasi"]) + 
          parseFloat(val["admin_service"]) + 
          parseFloat(val["consultancy"]);



        val["grade"] = "F";

        if(val["total_marks"] >= 80){
          val["grade"] = "A";
        }
        else if(val["total_marks"] >= 60){
          val["grade"] = "B";
        }
        else if(val["total_marks"] >= 50){
          val["grade"] = "C";
        }

        return val;
      }))

    }
  }

  return (
    <>
      <div className="w-full p-6 flex flex-col min-h-screen">
        <div className="flex flex-col justify-between gap-8">
          <h2 className="text-2xl font-bold">Staff Performance Result Summary</h2>
          <p className="text-sm text-gray-500">e = entries; m = marks</p>
          <div className="flex flex-col justify-center cursor-pointer">
            <DataGrid 
              rows={rows}
              columns={columns}
              disableOnClickRowSelection={true}
              getRowHeight={() => 'auto'}
              initialState={{
                sorting: {
                  sortModel: [{ field: "name", sort: "asc" }],
                },
                columns: {
                  columnVisibilityModel: {
                    id: false,   
                  },
                },
              }}
            />
            {
               userData && userData.privileges === "view" && !hasConfirmedAgreement &&
              (<div className="flex justify-end mt-4">
                <button onClick={()=>{ setIsShowingConfirmAgreementMdl(true) }} className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer">Confirm Agreement</button>
              </div>)
            }
            <div className="w-full pt-4 px-4">
              <div className="text-center font-bold underline mb-2">
                Grading System
              </div>
              <div className="flex justify-between">
                <span className="pl-2">A - Exceed Expectation</span>
                <span>B - Meet Expectation</span>
                <span>C - Below Expectation</span>
                <span>F - No Expectation</span>
              </div>
            </div>

          </div>
        </div>
      </div>
      {

        isShowingEditMdl && 
        (<div className="fixed top-0 left-0 w-screen h-screen bg-black/50 z-[1000] justify-center items-center flex">
          <div className="w-[30vw] bg-white rounded overflow-hidden">
            <div className="p-4 bg-gray-100">
              <h1 className="text-xl font-bold">Edit Marks</h1>
            </div>
            <div className="flex flex-col items-center justify-center p-8">
              <div>
                <div className="mb-2">
                  <strong className="mr-2">Entries: </strong> 
                  <label>{selectedEntries}</label> 
                </div>
                <div>
                  <strong className="mr-2">Marks: </strong> 
                  <input className="border border-gray-300" value={selectedMarks} onChange={(ev)=>{ setSelectedMarks(ev.target.value) }}/>
                </div>
              </div>
            </div>
            <div className="p-2 flex  gap-2 justify-end border-t border-gray-200">
              <button className="py-2 px-4 bg-gray-300 text-white rounded hover:bg-gray-500 cursor-pointer" onClick={closeEditMdl}>Cancel</button>
              <button className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer" onClick={(ev)=>{ handleMdlSubmit() }}>Submit</button>
            </div>
          </div>
        </div>)
      }
      {

        isShowingConfirmAgreementMdl && 
        (<div className="fixed top-0 left-0 w-screen h-screen bg-black/50 z-[10000] justify-center items-center flex">
          <div className="w-[30vw] bg-white rounded overflow-hidden">
            <div className="p-4 bg-gray-100">
              <h1 className="text-xl font-bold">Confirm Grading Approval</h1>
            </div>
            <div className="flex flex-col items-center justify-center p-8">
              By agreeing to the grading. you confirm that no further edits will be allowed.
            </div>
            <div className="p-2 flex  gap-2 justify-end border-t border-gray-200">
              <button className="py-2 px-4 bg-gray-300 text-white rounded hover:bg-gray-500 cursor-pointer" onClick={()=>{ setIsShowingConfirmAgreementMdl(false) }}>Cancel</button>
              <button className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer" onClick={handleConfirmAgreementBtn}>Confirm</button>
            </div>
          </div>
        </div>)
      }
    </>
  )
};

export default StaffPerformanceSummary;
