import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

export const AppContent = createContext();

export const AppContextProvider = ({ children }) => {
  const [isLoggedin, setIsLoggedin] = useState(false);
  const [userData, setUserData] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [profileImageTimestamp, setProfileImageTimestamp] = useState(
    Date.now()
  );
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const getUserData = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.get(`${backendUrl}/api/user/data`);
      if (data.success) {
        setUserData(data.userData);
      } else {
        setUserData(null);
        toast.error(data.message);
      }
    } catch (error) {
      setUserData(null);
      toast.error(error.message);
    }
  };

  const getOAuthUserData = async () => {
    try {
      axios.defaults.withCredentials = true;
      const userId = Cookies.get("oauthUserId");
      if (!userId) {
        throw new Error("OAuth user ID not found in cookies");
      }
      const { data } = await axios.post(`${backendUrl}/api/user/oauth-data`, {
        userId,
      });
      if (data.success) {
        setUserData(data.userData);
      } else {
        setUserData(null);
        toast.error(data.message);
      }
    } catch (error) {
      setUserData(null);
      toast.error(error.message);
    }
  };

  const logout = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/logout`);
      if (data.success) {
        setIsLoggedin(false);
        setUserData(null);
        Cookies.remove("oauthUserId");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const updateProfileImage = (imageFilename) => {
    if (imageFilename) {
      setProfileImageUrl(
        `http://localhost:4000/uploads/profile/${imageFilename}`
      );
    } else {
      setProfileImageUrl(null);
    }
    setProfileImageTimestamp(Date.now());
  };

  useEffect(() => {
    if (isLoggedin) {
      getUserData();
    }
  }, [isLoggedin]);

  useEffect(() => {
    const userId = Cookies.get("oauthUserId");
    if (userId) {
      setIsLoggedin(true);
      getOAuthUserData();
    }
  }, []);

  return (
    <AppContent.Provider
      value={{
        isLoggedin,
        setIsLoggedin,
        userData,
        setUserData,
        getUserData,
        getOAuthUserData,
        logout,
        backendUrl,
        profileImageUrl,
        updateProfileImage,
        profileImageTimestamp,
      }}
    >
      {children}
    </AppContent.Provider>
  );
};
