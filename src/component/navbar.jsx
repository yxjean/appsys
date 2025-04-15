import React, { useContext } from "react";
import Logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();
  const { userData, backendUrl, setUserData, setIsLoggedin } =
    useContext(AppContent);

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      if (data.success) {
        setIsLoggedin(false);
        setUserData(null);
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
        <div className="flex items-center mt-7">
          <div className="w-10 h-10 flex justify-center items-center rounded-full bg-[#ff8800] text-white text-xl relative group">
            {userData.name[0].toUpperCase()}
            <div className="absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-10 text-3xl">
              <ul className="list-none m-0 p-2 bg-gray-100 text-sm">
                <li
                  onClick={logout}
                  className="py-1 px-2 hover:bg-gray-200 cursor-pointer pr-10"
                >
                  Logout
                </li>
              </ul>
            </div>
          </div>
          <h1 className="ml-2 flex items-center gap-2 text-md sm:text-xl font-medium text-black">
            {userData ? userData.name : null}
          </h1>
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
