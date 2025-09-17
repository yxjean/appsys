import React,{ useEffect, useState } from "react";
import moment from 'moment';

function StaffPerformanceSummaryPrintTemplate({ reportData, userData, assessmentPeriod }){

  return (
    <html>
      <head>
        <style>{`
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #222;
          }
          h1 {
            text-align: center;
            margin-bottom: 20px;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 1rem;
          }
          th, td {
            border: 1px solid #444;
            padding: 6px 10px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
          label {
            display: block;
            margin-top: 6px;
          }
          strong {
            display: block;
            margin-bottom: 6px;
            margin-top: 12px;
            font-size: 1.1rem;
          }
        `}</style>
      </head>
      <body>
        <div>
          <h1 style={{textAlign: "center"}} >ACADEMIC STAFF PERFORMANCE SUMMARY</h1>
          <div style={{ marginBottom: "1rem" }}>
            <label>Name: { userData.name }</label>
            <br/>
            <label>Faculty: { userData.faculty.name }</label>
            <br/>
            <label>Department: { userData.department.name } </label>
            <br/>
            <label>Assesment Period: { `${moment(assessmentPeriod.startDate).format("DD-MM-YYYY HH:mm")} - ${moment(assessmentPeriod.endDate).format("DD-MM-YYYY HH:mm")}`  } </label>
          </div>
          <div>
            <strong>PUBLICATION</strong>
            <table border="1">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  {/* <th>Published Date</th> */}
                  <th>Category</th>
                </tr>
              </thead>
              <tbody>
                {
                  reportData.publications && reportData.publications.filter(val=>val.area === "Publication").map((val)=>{
                    const details = JSON.parse(val.details); 

                    return (
                      <tr>
                        <td>{val.title}</td>
                        <td>{details.type}</td>
                        {/* <td>{moment(val.date).format("DD-MM-YYYY HH:mm")}</td> */}
                        <td>{details.category}</td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
            <label>Entries: {reportData.publications.filter(val=>val.area === "Publication").length}</label>
          </div>
          <br/>


          <div>
            <strong>POSTGRADUATE SUPERVISION</strong>
            <table border="1">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>StudentID</th>
                  <th>Enrolment Date</th>
                </tr>
              </thead>
              <tbody>
                {
                  reportData.publications && reportData.publications.filter(val=>val.area === "Postgraduate Supervision").map((val)=>{
                    const details = JSON.parse(val.details); 

                    return (
                      <tr>
                        <td>{details.name}</td>
                        <td>{details.studentId}</td>
                        <td>{moment(details.enrollmentDate,"YYYY-MM-DD").format("DD-MM-YYYY")}</td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
            <label>Entries: {reportData.publications.filter(val=>val.area === "Postgraduate Supervision").length}</label>
          </div>
          <br/>


          <div>
            <strong>CONSULTANCY</strong>
            <table border="1">
              <thead>
                <tr>
                  <th>Project Title</th>
                  <th>Total Amount(RM)</th>
                  <th>Individual Amount(RM)</th>
                </tr>
              </thead>
              <tbody>
                {
                  reportData.publications && reportData.publications.filter(val=>val.area === "Consultancy").map((val)=>{
                    const details = JSON.parse(val.details); 

                    return (
                      <tr>
                        <td>{details.projectTitle}</td>
                        <td>{details.totalAmount}</td>
                        <td>{details.individualAmount}</td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
            <label>Entries: {reportData.publications.filter(val=>val.area === "Consultancy").length}</label>
          </div>
          <br/>

          <div>
            <strong>ADMINISTRATIVE SERVICE</strong>
            <table border="1">
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Group</th>
                </tr>
              </thead>
              <tbody>
                {
                  reportData.publications && reportData.publications.filter(val=>val.area === "Administrative Service").map((val)=>{
                    const details = JSON.parse(val.details); 

                    return (
                      <tr>
                        <td>{details.category}</td>
                        <td>{details.group}</td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
            <label>Entries: {reportData.publications.filter(val=>val.area === "Administrative Service").length}</label>
          </div>
          <br/>


          <div>
            <strong>TEACHING & UNDERGRADUATE SUPERVISION</strong>
            <strong>Teaching</strong>
            <table border="1">
              <thead>
                <tr>
                  <th>Course Code</th>
                  <th>Course name</th>
                  <th>Evaluation Rating</th>
                  <th>Teaching Hours</th>
                </tr>
              </thead>
              <tbody>
                {
                  reportData.publications && reportData.publications.filter(val=>{
                    const details = JSON.parse(val.details); 
                    return val.area === "Teaching & Undergraduate Supervision" && details.teaching
                  }).map((val)=>{
                    const details = JSON.parse(val.details); 

                    return (
                      <tr>
                        <td>{details.teaching.courseCode}</td>
                        <td>{details.teaching.courseName}</td>
                        <td>{details.teaching.studentEvaluationRating}</td>
                        <td>{details.teaching.teachingHour}</td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
            <label>
              Entries: {
                reportData.publications.filter(val=>{
                    const details = JSON.parse(val.details); 
                    return val.area === "Teaching & Undergraduate Supervision" && details.teaching
                }).length
              }
            </label>
          </div>
          <br/>


          <div>
            <strong>Undergraduate Supervision</strong>
            <table border="1">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Student ID</th>
                  <th>Program</th>
                  <th>Project Title</th>
                </tr>
              </thead>
              <tbody>
                {
                  reportData.publications && reportData.publications.filter(val=>{
                    const details = JSON.parse(val.details); 
                    return val.area === "Teaching & Undergraduate Supervision" && details.undergraduateSupervision
                }).map((val)=>{
                    const details = JSON.parse(val.details); 

                    return (
                      <tr>
                        <td>{details.undergraduateSupervision.studentName}</td>
                        <td>{details.undergraduateSupervision.studentId}</td>
                        <td>{details.undergraduateSupervision.degreeProgram}</td>
                        <td>{details.undergraduateSupervision.projectTitle}</td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
            <label>Entries: {
                reportData.publications && reportData.publications.filter(val=>{
                      const details = JSON.parse(val.details); 
                      return val.area === "Teaching & Undergraduate Supervision" && details.undergraduateSupervision
                }).length
              }
            </label>
          </div>
          <br/>


          <div>
            <strong>RESEARCH</strong>
            <table border="1">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Funding Agency</th>
                  <th>Funding Amount(RM)</th>
                </tr>
              </thead>
              <tbody>
                {
                  reportData.publications && reportData.publications.filter(val=>val.area === "Research").map((val)=>{
                    const details = JSON.parse(val.details); 

                    return (
                      <tr>
                        <td>{val.title}</td>
                        <td>{details.researchCategory}</td>
                        <td>{details.fundingAgency}</td>
                        <td>{details.fundingAmount}</td>
                      </tr>
                    )
                  })
                }
              </tbody>
            </table>
            <label>Entries: {reportData.publications.filter(val=>val.area === "Research").length}</label>
          </div>
          <br/>


          <div>
            <strong>VASI</strong>
            <br/>
            <label>Entries: {reportData.publications.filter(val=>val.area === "VASI").length}</label>
          </div>
          <br/>


          <div>
            <label>Total Entries: {reportData.publications.length}</label>
          </div>
        </div>
      </body>
    </html>
  )
};

export default StaffPerformanceSummaryPrintTemplate;
