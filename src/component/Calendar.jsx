import React, { useState, useEffect, useContext } from "react";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from "axios";
import { AppContent } from "../context/AppContext";
import { DataGrid } from "@mui/x-data-grid";
import moment from "moment";
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { toast } from "react-toastify";


const Calendar = () => {
  const columns = [
    { field: "id", headerName: "ID", flex: 1, hide: true },
    { field: "title", headerName: "Title", flex: 1 },
    //{ field: "type", headerName: "Type", flex: 1 },
    { field: "bookedBy", headerName: "Booked By", flex: 1 },
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
        <div className="flex justify-center items-center h-full gap-2">
          {params.row.status === "pending" && (<CheckCircleIcon onClick={ ()=>{ updateBookingStatus(params.row.id,"accepted") } } className="cursor-pointer text-green-500" />) }
          {params.row.status === "pending" && (<CancelIcon onClick={ ()=>{ updateBookingStatus(params.row.id,"rejected") } }  className="cursor-pointer text-red-500" />)}
        </div>
    )}
  ];
  const [ rows, setRows ] = useState([]);
  const { backendUrl } = useContext(AppContent);
  const [ currUserPrivilege, setCurrUserPriviledge ] = useState("");
  const [ userType, setUserType ] = useState("");
  const [ paginationModel, setPaginationModel ] = useState([10]);
  const [ currUserId, setCurrUserId ] = useState("");
  const [ calendarEvents, setCalendarEvents ] = useState([])
  const [ isEventMdlShowing, setIsEventMdlShowing ] = useState(false);
  const [ eventTitle, setEventTitle ] = useState("");
  const [ eventStartTime, setEventStartTime ] = useState("");
  const [ eventEndTime, setEventEndTime ] = useState("");
  const [ events, setEvents ] = useState([]);
  const [ isEventMdlOnCreate, setIsEventMdlOnCreate ] = useState(true);
  const [ selectedEventId, setSelectedEventId ] = useState(0);

  useEffect(()=>{
    onInit();
  },[])

  useEffect(()=> {
    getBookings();
    getEvents();
  }, [ currUserId ])

  useEffect(()=>{
    const bookings = rows.filter(val=>val.status === "accepted").map((val)=>{
      return {
        _id: val.id,
        title: val.title,
        start: moment(val.startTime,"DD-MM-YYYY HH:mm A").toISOString(),
        end: moment(val.endTime,"DD-MM-YYYY HH:mm A").toISOString(),
        type: "booking",
        color: '#006400'
    }})

    const userEvents = events.map((val)=>{
      return {
        _id: val._id,
        title: val.title,
        start: val.startTime,
        end: val.endTime,
        type: "event",
        color: '#3788d8'
    }})


    setCalendarEvents([...bookings,...userEvents])
  },[rows, events])


  async function onInit() {
    const userData = await axios.get(`${backendUrl}/api/user/data`,{ withCredentials: true });

    setUserType(userData.data.userData.userType);
    setCurrUserPriviledge(userData.data.userData.privileges);
    setCurrUserId(userData.data.userData.id);
  }
  
  function clearEventMdlInput() {
    setEventTitle("")
    setEventStartTime("")
    setEventEndTime("")
    setSelectedEventId(0);
  }

  async function createNewEvent() {
    const { data } = await axios.post(`${backendUrl}/api/event/create`,{
      user: currUserId,
      title: eventTitle,
      startTime: eventStartTime,
      endTime: eventEndTime
    },{ withCredentials: true })


    if(data.success) {
      getEvents();
      setIsEventMdlShowing(false);
    }
  }

  async function getEvents() {
    if(!currUserId) {
      return false;
    }

    const { data } = await axios.get(`${backendUrl}/api/event/user/${currUserId}`,{ withCredentials: true });
    
    if(data.success) {
      setEvents(data.events);
    }
    
  }

  async function getBookings() {
    if(!currUserId) {
      return false;
    }

    const allBookings = await axios.get(`${backendUrl}/api/booking/${currUserPrivilege !== "view" && userType === "staff"?"staff":"superior"}/${currUserId}`,{ withCredentials: true });
    setRows(allBookings.data.bookings.map((booking)=>{
      return {
        id: booking._id,
        title: booking.title,
        type: booking.type,
        bookedBy: booking.bookedBy.name,
        startTime: moment(booking.startTime).format("DD-MM-YYYY hh:mm A"),
        endTime: moment(booking.endTime).format("DD-MM-YYYY hh:mm A"),
        status: booking.status,
        lastUpdated: moment(booking.updatedAt).format("DD-MM-YYYY hh:mm A")
      }
    }))
  }


  async function updateBookingStatus(bookingId,status) {
    await axios.put(`${backendUrl}/api/booking/${bookingId}`,{
      status: status
    },{ withCredentials: true })

    getBookings()
  }
  
  async function deleteEvent(){
    const { data } = await axios.delete(`${backendUrl}/api/event/${selectedEventId}`,{ withCredentials: true });

    if(data.success){
      setIsEventMdlShowing(false);
      clearEventMdlInput();
      toast.success("Event Deleted Successfully !");
      getEvents();
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

  async function handleEventClick(ev){
    if(ev.event._def.extendedProps.type !== "event"){
      return;
    }

    const selectedEventId = ev.event._def.extendedProps._id;
    setIsEventMdlOnCreate(false);
    setIsEventMdlShowing(true);
    setSelectedEventId(selectedEventId);

    const { data } = await axios.get(`${backendUrl}/api/event/${selectedEventId}`,{ withCredentials: true });

    setEventTitle(data.event.title);
    setEventStartTime(moment(data.event.startTime).local().format("YYYY-MM-DDTHH:mm"));
    setEventEndTime(moment(data.event.endTime).local().format("YYYY-MM-DDTHH:mm"));
  }

  async function updateEvent(ev){
    const { data } = await axios.put(`${backendUrl}/api/event/${selectedEventId}`,{
      title: eventTitle,
      startTime: eventStartTime,
      endTime: eventEndTime
    },{ withCredentials: true });

    if(data.success){
      setIsEventMdlShowing(false);
      clearEventMdlInput();
      toast.success("Event Successfully Updated !");
      getEvents();
    }
  }



  return (
    <div className="w-full p-4">
      <div>
        <div className="flex justify-between mt-5">
          <h2 className="text-2xl font-bold mb-4">Calendar</h2>
          <button onClick={()=>{ setIsEventMdlShowing(true); isEventMdlOnCreate(true) }}  className="float-right py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer mb-5 ml-auto">
            New Event
          </button>
        </div>
        <FullCalendar
          plugins={[ dayGridPlugin, timeGridPlugin, interactionPlugin ]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'  
          }}
          initialView="dayGridMonth"
          events={calendarEvents}
          eventClick={handleEventClick}
        />
      </div>
      
      {
        userType === "staff" && currUserPrivilege !== "view" && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Bookings</h2>
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
      )}

      { isEventMdlShowing && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="w-[50vw] bg-white p-5">
              <h2 className="text-2xl font-bold">{isEventMdlOnCreate?"New Event":"Edit Event"}</h2>
              <div className="mt-5">
                <div class="mb-4">
                  <label class="block text-gray-700">Title</label>
                  <input class="p-2 border border-gray-300 rounded w-full" value={eventTitle} onChange={ev=>setEventTitle(ev.target.value)} type="text" name="name"/>
                </div>
                <div class="mb-4">
                  <label class="block text-gray-700">Start Time</label>
                  <input class="p-2 border border-gray-300 rounded w-full" value={eventStartTime} onChange={ev=>setEventStartTime(ev.target.value)} type="datetime-local" name="startTime"/>
                </div>
                <div class="mb-4">
                  <label class="block text-gray-700">End Time</label>
                  <input class="p-2 border border-gray-300 rounded w-full" value={eventEndTime} onChange={ev=>setEventEndTime(ev.target.value)} type="datetime-local" name="endTime"/>
                </div>
              </div>


              <div className="flex justify-end gap-3 mt-10">

                {
                  isEventMdlOnCreate?(
                    <button onClick={createNewEvent} className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer">
                      Create
                    </button>
                  ):(
                    <>
                      <button onClick={updateEvent} className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer">
                        Submit
                      </button>
                      <button onClick={deleteEvent} className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer">
                        Delete
                      </button>
                    </>
                  )
                }
                <button onClick={()=>{ clearEventMdlInput(); setIsEventMdlShowing(false)}} className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer">Cancel</button>
              </div>
            </div>
          </div>

      )}


    </div>
  );
};

export default Calendar;
