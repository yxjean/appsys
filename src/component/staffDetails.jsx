import React, { useState, useEffect, useRef, useContext } from "react";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { AppContent } from "../context/AppContext";
import PerformanceReporting from "../component/performanceReporting";
import AdminPerformanceReporting from "../component/adminPerformanceReporting";
import moment from "moment";
import EditSquareIcon from '@mui/icons-material/EditSquare';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const StaffDetails = ({staffDetails}) => {
  const { backendUrl } = useContext(AppContent);
  const [ isNewBooking, setIsNewBooking ] = useState(true);
  const [ rows, setRows ] = useState([]);
  const [ paginationModel, setPaginationModel ] = useState([10])
  const [ isMdlShowing, setIsMdlShowing ] = useState(false);
  const [ bookingTitle, setBookingTitle ] = useState("")
  //const [ bookingType, setBookingType ] = useState("")
  const [ bookingStartTime, setBookingStartTime ] = useState("")
  const [ bookingEndTime, setBookingEndTime ] = useState("")
  const [ currUserId, setCurrUserId ] = useState("");
  const [ bookingIdToEdit, setBookingIdToEdit ] = useState("");
  const [ calendarEvents, setCalendarEvents ] = useState([]);
  const [ events, setEvents ] = useState([]);
  const [report, setReport] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);


  const columns = [
    { field: "id", headerName: "ID", flex: 1, hide: true },
    { field: "title", headerName: "Title", flex: 1 },
    { field: "appointmentWith", headerName: "Appointment With", flex: 1 },
    { field: "startTime", headerName: "Start Time", flex: 1 },
    { field: "endTime", headerName: "End Time", flex: 1 },
    { 
      field: "status", 
      headerName: "Status", 
      flex: 1, 
      renderCell: (params)=>(
        <label style={{ "color": getStatusColor(params.row.status) }} >{params.row.status.toUpperCase()}</label>
    )},
    { field: "lastUpdated", headerName: "Last Updated", flex: 1 },
    { 
      field: "action", 
      headerName: "Action", 
      flex: 1, 
      renderCell: (params)=> (
        <div className="flex justify-center items-center h-full">
          <EditSquareIcon onClick={ ()=> { setIsMdlShowing(true); setIsNewBooking(false); setBookingIdToEdit(params.row.id) }} className="cursor-pointer" />
        </div>
    )}
  ]

  useEffect(()=>{
    onInit();
  },[])


  useEffect(()=>{
    const bookings = rows.filter(val=>val.status === "accepted").map((val)=>{
      return {
        title: val.title,
        start: moment(val.startTime,"DD-MM-YYYY HH:mm A").toISOString(),
        end: moment(val.endTime,"DD-MM-YYYY HH:mm A").toISOString(),
        color: '#006400'
    }})


    const userEvents = events.map((val)=>{
      return {
        title: val.title,
        start: val.startTime,
        end: val.endTime,
        color: '#3788d8'
    }})


    setCalendarEvents([...bookings,...userEvents])
  },[rows, events])

  useEffect(()=> {
    getBookingDetailsById();
  },[ bookingIdToEdit ])


  async function getBookingDetailsById() {
    if(!bookingIdToEdit) {
      return false;
    }
    const { data } = await axios.get(`${backendUrl}/api/booking/${bookingIdToEdit}`,{ withCredentials: true })

    if(data.success) {
      setBookingTitle(data.booking.title);
      //setBookingType(data.booking.type);
      setBookingStartTime(moment(data.booking.startTime).format("YYYY-MM-DDTHH:mm"));
      setBookingEndTime(moment(data.booking.endTime).format("YYYY-MM-DDTHH:mm"));
    }
  }


  function getStatusColor(status) {
    switch(status) {
      case "pending":
        return "orange";
      case "accepted":
        return "green";
      case "rejected":
        return "red";
    }
  }

  async function onInit() {
    const userData = await axios.get(`${backendUrl}/api/user/data`,{ withCredentials: true });

    getStaffAllBookings();
    getStaffEvents();
    setCurrUserId(userData.data.userData.id);
  }

  async function getStaffEvents() {
    const { data } = await axios.get(`${backendUrl}/api/event/user/${staffDetails.id}`,{ withCredentials: true });
    
    if(data.success) {
      setEvents(data.events);
    }
  }

  async function getStaffAllBookings() {
    const staffBookingDetails = await axios.get(`${backendUrl}/api/booking/getUserBookingWithStaff/${staffDetails.id}`,{ withCredentials: true });
    setRows(staffBookingDetails.data.bookings.map((booking)=>{
      return {
        id: booking._id,
        title: booking.title,
        appointmentWith: booking.bookedTo.name,
        startTime: moment(booking.startTime).format("DD-MM-YYYY hh:mm A"),
        endTime: moment(booking.endTime).format("DD-MM-YYYY hh:mm A"),
        status: booking.status,
        lastUpdated: moment(booking.updatedAt).format("DD-MM-YYYY hh:mm A")
      }
    }))
  }


  function clearMdlInput() {
    setBookingTitle("")
    //setBookingType("")
    setBookingStartTime("")
    setBookingEndTime("")
    setBookingIdToEdit("")
  } 

  async function createNewBooking() {
    const { data } = await axios.post(
      backendUrl+"/api/booking/create", {
        bookedById: currUserId,
        bookedToId: staffDetails.id,
        title: bookingTitle,
        //type: bookingType,
        startTime: bookingStartTime,
        endTime: bookingEndTime
      },
      { withCredentials: true }
    );

    if(data.success) {
      getStaffAllBookings();
      setIsMdlShowing(false);
    }
  }

  async function updateBookingDetails() {
    const { data } = await axios.put(
      `${backendUrl}/api/booking/${bookingIdToEdit}`, {
        title: bookingTitle,
        //type: bookingType,
        startTime: bookingStartTime,
        endTime: bookingEndTime
      },
      { withCredentials: true }
    );

    if(data.success) {
      getStaffAllBookings();
      setIsMdlShowing(false);
    }

  }

  const fetchStaffReport = async (id) => {
    if (!id) {
      toast.error("Invalid staff ID");
      return;
    }
    try {
      const { data } = await axios.get(
        `http://localhost:4000/api/performance-report/${id}`,
        { withCredentials: true }
      );
      if (data.success) {
        setReport(data.reportData);
        setShowReportModal(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };


  return (
    <div className="w-full p-6">
      <h2 className="text-2xl font-bold">Staff Details</h2>
      <div className="flex items-center justify-center gap-20 my-6">
        <div className="flex items-center flex-col">
          <div class="w-40 h-40 rounded-lg bg-gray-200 flex items-center justify-center relative overflow-hidden cursor-pointer border-4 border-teal-500">
            <img src={`http://localhost:4000/uploads/profile/${staffDetails.profilePic}`} alt="Profile Picture" class="w-full h-full object-cover"/>
          </div>
          <strong>{staffDetails.name}</strong>
          <strong>{staffDetails.id}</strong>
        </div>
        <div className="flex flex-col bg-teal-500 text-white items-center rounded-lg p-5">
          <strong>{staffDetails.faculty}</strong>
          <strong>{staffDetails.department}</strong>
          <strong>{staffDetails.contactNumber}</strong>
          <strong>{staffDetails.email}</strong>
          <strong>{staffDetails.designation}</strong>
          <strong>{staffDetails.qualifications}</strong>
          <strong>{staffDetails.areaOfExpertise}</strong>
        </div>
      </div>
      {/*View Report Button*/}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => fetchStaffReport(staffDetails.id)}
          className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer mb-5 ml-auto"
        >
          View Report
        </button>
      </div>
      <div className="border-1 border-gray-200 rounded-lg mt-10 p-5">
        <h2 className="text-2xl font-bold mb-4">Calendar</h2>
        <FullCalendar
          plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'  
          }}
          initialView="dayGridMonth"
          events={calendarEvents}
        />
      </div>
      <div className="mt-10 flex flex-col">
        <button onClick={()=>{setIsMdlShowing(true); setIsNewBooking(true)}} className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer mb-5 ml-auto">
          New Booking
        </button>
        <DataGrid 
          rows={rows}
          columns={columns}
          autoHeight
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[10]}
          disableRowSelectionOnClick  
          checkboxSelection={false}   
          columnVisibilityModel={{id: false}}
        />
      </div>
      { isMdlShowing && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="w-[50vw] bg-white p-5">
              <h2 className="text-2xl font-bold">New Booking</h2>
              <div className="mt-5">
                <div class="mb-4">
                  <label class="block text-gray-700">Title</label>
                  <input class="p-2 border border-gray-300 rounded w-full" value={bookingTitle} onChange={ev=>setBookingTitle(ev.target.value)} type="text" name="name"/>
                </div>
                <div class="mb-4">
                  <label class="block text-gray-700">Start Time</label>
                  <input class="p-2 border border-gray-300 rounded w-full" value={bookingStartTime} onChange={ev=>setBookingStartTime(ev.target.value)} type="datetime-local" name="startTime"/>
                </div>
                <div class="mb-4">
                  <label class="block text-gray-700">End Time</label>
                  <input class="p-2 border border-gray-300 rounded w-full" value={bookingEndTime} onChange={ev=>setBookingEndTime(ev.target.value)} type="datetime-local" name="endTime"/>
                </div>
              </div>


              <div className="flex justify-end gap-3 mt-10">

                <button onClick={isNewBooking?createNewBooking:updateBookingDetails} className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer">
                  {isNewBooking?"Create":"Update"}
                </button>
                <button onClick={()=>{ clearMdlInput(); setIsMdlShowing(false)}} className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer">Cancel</button>
              </div>
            </div>
          </div>

      )}
      {showReportModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto mt-20 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-3/4 h-[90%] overflow-y-auto">
            <AdminPerformanceReporting staffId={staffDetails.id} />
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowReportModal(false)}
                className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDetails;
