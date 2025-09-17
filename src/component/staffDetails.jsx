import React, { useState, useEffect, useRef, useContext } from "react";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { AppContent } from "../context/AppContext";
import moment from "moment";
import EditSquareIcon from '@mui/icons-material/EditSquare';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  FaUser,
} from "react-icons/fa";
import { toast } from "react-toastify";

const StaffDetails = ({ staffDetails, setSelectedSection, setPerformanceReportingStaffId}) => {
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
  const [ currUserData, setCurrUserData ] = useState(null);



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
      renderCell: (params)=> { 
        return params.row.status === "pending"?(
          <div className="flex justify-center items-center h-full">
            <EditSquareIcon onClick={ ()=> { 
              setIsMdlShowing(true); 
              setIsNewBooking(false); 
              setBookingIdToEdit(params.row.id) 
              
              // Prefill directly from row
              setBookingTitle(params.row.title);
              setBookingStartTime(moment(params.row.startTime, "DD-MM-YYYY hh:mm A").format("YYYY-MM-DDTHH:mm"));
              setBookingEndTime(moment(params.row.endTime, "DD-MM-YYYY hh:mm A").format("YYYY-MM-DDTHH:mm"));
              }} className="cursor-pointer" />
          </div>
        ):null;
      }
    }
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
      case "completed":
        return "gray";
    }
  }

  async function onInit() {
    const userData = await axios.get(`${backendUrl}/api/user/data`,{ withCredentials: true });

    setCurrUserData(userData.data.userData);

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
  // Input validation
  if (!bookingTitle || !bookingStartTime || !bookingEndTime) {
    toast.error("Please fill in all required fields.");
    return;
  }

  // Check if end time is before start time
  if (new Date(bookingEndTime) < new Date(bookingStartTime)) {
    toast.error("End time cannot be earlier than start time.");
    return;
  }

  try {
    const { data } = await axios.post(
      backendUrl+"/api/booking/create", {
        bookedById: currUserId,
        bookedToId: staffDetails.id,
        title: bookingTitle,
        //type: bookingType,
        startTime: bookingStartTime,
        endTime: bookingEndTime,
      },
      { withCredentials: true }
    );

    if (data.success) {
      toast.success("Booking created successfully!");
      getStaffAllBookings();
      setIsMdlShowing(false);
    } else {
      toast.error(data.message || "Failed to create booking.");
    }
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
      error.message ||
      "An error occurred while creating booking."
    );
  }
}

async function updateBookingDetails() {
  // Input validation
  if (!bookingTitle || !bookingStartTime || !bookingEndTime) {
    toast.error("Please fill in all required fields.");
    return;
  }

  // Check if end time is before start time
  if (new Date(bookingEndTime) <= new Date(bookingStartTime)) {
    toast.error("End time must be later than start time.");
    return;
  }

  try {
    const { data } = await axios.put(
      `${backendUrl}/api/booking/${bookingIdToEdit}`,
      {
        title: bookingTitle,
        //type: bookingType,
        startTime: bookingStartTime,
        endTime: bookingEndTime
      },
      { withCredentials: true }
    );

    if (data.success) {
      toast.success("Booking updated successfully!");
      getStaffAllBookings();
      setIsMdlShowing(false);
    } else {
      toast.error(data.message || "Failed to update booking.");
    }
  } catch (error) {
    toast.error(
      error.response?.data?.message ||
      error.message ||
      "An error occurred while updating booking."
    );
  }
}

  return (
    <div className="w-full p-6">
      <h2 className="text-2xl font-bold">Staff Details</h2>
      <div className="flex items-center justify-center gap-20 my-6">
        <div className="flex items-center flex-col">
          <div class="w-40 h-40 rounded-lg bg-gray-200 flex items-center justify-center relative overflow-hidden cursor-pointer border-4 border-teal-500">
          {staffDetails.profilePic ? (
            <img src={`http://localhost:4000/uploads/profile/${staffDetails.profilePic}`} alt="Profile Picture" class="w-full h-full object-cover"/>
          ) : (
            <FaUser siclassName="text-gray-400" />
          )}
            {/* <img src={`http://localhost:4000/uploads/profile/${staffDetails.profilePic}`} alt="Profile Picture" class="w-full h-full object-cover"/> */}
          </div>
          <strong>{staffDetails.name}</strong>
          <button className="mt-8 py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer" onClick={()=>{ setSelectedSection("Admin & Superior Performance Reporting"); setPerformanceReportingStaffId(staffDetails.id) }}>View Report</button>
        </div>
        <div className="grid grid-cols-[180px_auto] bg-teal-500 text-white rounded-lg p-5 gap-y-2">
          <span className="font-bold">Faculty</span>
          <span>: {staffDetails.faculty}</span>

          <span className="font-bold">Department</span>
          <span>: {staffDetails.department}</span>

          <span className="font-bold">Contact Number</span>
          <span>: {staffDetails.contactNumber}</span>

          <span className="font-bold">Email</span>
          <span>: {staffDetails.email}</span>

          <span className="font-bold">Designation</span>
          <span>: {staffDetails.designation}</span>

          <span className="font-bold">Qualifications</span>
          <span>: {staffDetails.qualifications}</span>

          <span className="font-bold">Area of Expertise</span>
          <span>: {staffDetails.areaOfExpertise}</span>
        </div>
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

      {currUserData && currUserData.privileges === "view" &&
        (
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
        )
      }
      { isMdlShowing && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="w-[50vw] bg-white p-5">
              <h2 className="text-2xl font-bold">{isNewBooking ? "New Booking" : "Update Booking"}</h2>
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
    </div>
  );
};

export default StaffDetails;
