import React,{ useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import { toast } from "react-toastify";

export default function AssesmentPeriod(){
  const [ startDate, setStartDate ] = useState("")
  const [ endDate, setEndDate ] = useState("")

  useEffect(()=>{
    getAssesmentPeriod();
  },[])

  async function getAssesmentPeriod(){
    const { data } = await axios.get("http://localhost:4000/api/assessment-period",{
    },{ withCredentials: true }) 

    if(data.success){
      setStartDate(moment(data.assessmentPeriod[0].startDate).format("YYYY-MM-DDTHH:MM"));
      setEndDate(moment(data.assessmentPeriod[0].endDate).format("YYYY-MM-DDTHH:MM"));
    }
  }

  async function handleSubmitBtn(ev){
    const { data } = await axios.post('http://localhost:4000/api/assessment-period',{
      startDate,
      endDate
    },{ withCredentials: true }); 
    
    if(data.success){
      toast.success("Submitted Successfully !");
    }
  }



  return (
    <div className="w-full p-4">
      <h2 className="text-2xl font-bold mb-8">Assesment Period</h2>

      <div className="flex gap-4">
        <div>
          <strong>Start Date: </strong>
          <input 
            onChange={setStartDate}
            value={startDate}
            type="datetime-local" 
            className="border border-gray-300 ml-2"/>
        </div>
        <div>
          <strong>End Date: </strong>
          <input 
            onChange={setEndDate}
            value={endDate}
            type="datetime-local" 
            className="border border-gray-300 ml-2"/>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={handleSubmitBtn}
          className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
        >Submit</button>
      </div>
    </div>
  )
}
