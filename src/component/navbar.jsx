import React, { useContext, useState, useEffect } from "react";
import Logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { Popover } from "@mui/material";
import { FaUser } from "react-icons/fa";

const Navbar = ({selectedSection, setSelectedSection}) => {
  const navigate = useNavigate();
  const [ notifications, setNotifications ] = useState([]);
  const {
    userData,
    backendUrl,
    setUserData,
    setIsLoggedin,
    profileImageUrl,
    updateProfileImage,
    profileImageTimestamp,
    getUserData
  } = useContext(AppContent);
  const [showDropdown, setShowDropdown] = useState(false);
  const [ isNotificationPopoverShowing, setIsNotificationPopoverShowing ] = useState(null);
  const [ notificationIconAnchorEl, setNotificationIconAnchorEl ] = useState(null);

  useEffect(()=>{
    if(window.location.pathname !== "/") {
      getUserData()
    }

  },[])


  useEffect(() => {
    // Fetch user profile to get profile picture if available
    const fetchUserProfile = async () => {
      if (userData) {
        try {
          const { data } = await axios.get(
            "http://localhost:4000/api/user/profile",
            { withCredentials: true }
          );
          if (data.success && data.user.profilePicture) {
            updateProfileImage(data.user.profilePicture);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
    };

    fetchUserProfile();
    getUserNotifications();
  }, [userData]);


  async function getUserNotifications() {
    if(userData) {
      const { data } = await axios.get(
        "http://localhost:4000/api/notifications/user/"+userData.id,
        { withCredentials: true }
      )

      if(data.success) {
        setNotifications(data.notifications);
      }
    }
  }

  function handleNotificationOnClick() {
    setSelectedSection("Calendar"); 
    setNotificationIconAnchorEl(null);
    setIsNotificationPopoverShowing(false);
  }

  function handlePopoverOnClose() {
    setNotificationIconAnchorEl(null);
    setIsNotificationPopoverShowing(false);
  }

  function handleNotificationIconOnClick(ev) {
    setNotificationIconAnchorEl(ev.currentTarget)
    setIsNotificationPopoverShowing(!isNotificationPopoverShowing)
  }

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      if (data.success) {
        setIsLoggedin(false);
        setUserData(null);
        updateProfileImage(null); // Clear profile image
        navigate("/");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="w-full flex justify-between items-center p-4 sm:p-6 sm:px-24 fixed top-0 bg-gray-100 z-10">
      <div className="font-bold text-2xl flex items-center gap-2 cursor-pointer">
        <img
          onClick={() => navigate("/")}
          src={Logo}
          alt=""
          className="w-10 sm:w-15 cursor-pointer"
        />
        Appraisal
      </div>
      {userData ? (
        <div className="flex items-center relative">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="w-10 h-10 flex justify-center items-center rounded-full bg-[#ff8800] text-white text-xl overflow-hidden">
              {profileImageUrl ? (
                <img
                  src={`${profileImageUrl}?t=${profileImageTimestamp}`} // Add timestamp to prevent caching
                  alt={userData.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                userData.name[0].toUpperCase()
              )}
            </div>
            <h1 className="ml-2 text-md sm:text-xl font-medium text-black">
              {userData ? userData.name : null}
            </h1>
          </div>
          {showDropdown && (
            <div className="absolute top-full right-0 mt-1 z-10 bg-gray-100 rounded shadow-md">
              <ul className="list-none m-0 p-2 text-sm">
                <li
                  onClick={() => {
                    logout();
                    setShowDropdown(false);
                  }}
                  className="py-1 px-4 hover:bg-gray-200 cursor-pointer whitespace-nowrap"
                >
                  Logout
                </li>
              </ul>
            </div>
          )}
          <NotificationsNoneIcon onClick={handleNotificationIconOnClick} className="cursor-pointer ml-5" />
          <Popover
            open={isNotificationPopoverShowing}
            anchorEl={notificationIconAnchorEl}
            onClose={handlePopoverOnClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            slotProps={{
              paper: {
                sx: {
                  width: 250,        // fixed width
                  maxHeight: 400,    // maximum height
                  overflowY: "auto", // scroll if content overflows
                }}
            }}
          >
            {
              notifications.length? (notifications.map((val,ind)=> (
                  <a className="flex flex-col px-5 pt-3 w-full hover:bg-gray-100" onClick={handleNotificationOnClick}>
                    <strong>{val.title}</strong>
                    <label className="mb-3 cursor-pointer">{val.description}</label>
                    {notifications.length - 1 === ind? null:(<hr className="border-gray-400"/>)}
                  </a>
              ))) :(<strong className="px-5 py-5 block">No notification available</strong>)
            }
          </Popover>
        </div>
      ) : (
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 border border-gray-500 rounded-full px-8 py-3 text-gray-800 hover:bg-teal-500 hover:text-white transition-all cursor-pointer font-bold"
        >
          Login
        </button>
      )}
    </div>
  );
};

export default Navbar;
