import React,{ useEffect, useState } from "react";
import moment from 'moment';

function AllStaffPerformanceResultSummaryPrintTemplate({ dataToPrint }){

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
          <h1 style={{textAlign: "center"}} >STAFF PERFORMANCE RESULTS SUMMARY</h1>
        </div>
        <table border="1">
          <thead>
            <tr>
              {
                dataToPrint.columns.map(val=>(
                  <th>{val}</th>
                ))
              }
            </tr>
          </thead>
          <tbody>
            {
              dataToPrint.rows.map(val=>(
                <tr>
                  <td>{val.name}</td> 
                  <td>{val.publication}</td> 
                  <td>{val.research}</td> 
                  <td>{val.teachingAndUndergraduateSupervision}</td> 
                  <td>{val.postgraduateSupervision}</td> 
                  <td>{val.vasi}</td> 
                  <td>{val.adminService}</td> 
                  <td>{val.consultancy}</td> 
                  <td>{val.totalMarks}</td> 
                  <td>{val.grade}</td> 
                </tr>
              ))
            }
          </tbody>
        </table>
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
      </body>
    </html>
  )
};

export default AllStaffPerformanceResultSummaryPrintTemplate;
