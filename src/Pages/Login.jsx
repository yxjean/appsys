import React, { useContext, useState, useEffect } from "react";
import Logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { AppContent } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();

  const { backendUrl, setIsLoggedin, getUserData } = useContext(AppContent);

  const [state, setState] = useState("Sign Up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("admin");

  const onSubmitHandler = async (e) => {
    try {
      e.preventDefault();

      axios.defaults.withCredentials = true; // Ensure credentials are included in requests

      if (state === "Sign Up") {
        const payload = {
          name,
          email,
          password,
          userType,
        };

        const { data } = await axios.post(
          backendUrl + "/api/user/create",
          payload
        );

        if (data.success) {
          toast.success("Account created successfully. Please log in.");
          setState("Login");
        } else {
          toast.error(data.message);
        }
      } else {
        const { data } = await axios.post(
          backendUrl + "/api/auth/login",
          {
            email,
            password,
          },
          { withCredentials: true }
        );
        if (data.success) {
          setIsLoggedin(true);
          const userDataResponse = await axios.get(
            backendUrl + "/api/user/data",
            {
              withCredentials: true,
            }
          );
          const userData = userDataResponse.data.userData;
          navigate(userData.userType === "admin" ? "/admin" : "/staff");
          toast.success(data.message);
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error("Unauthorized: Please log in again.");
      } else {
        toast.error(error.message);
      }
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen px-6 sm:px-0 overflow-y-auto"
      style={{
        backgroundImage: `url(https://img.freepik.com/free-photo/watercolor-green-sea-wave-white-canvas-background_91008-499.jpg)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "100vh",
        paddingTop: "50px",
      }}
    >
      <img
        onClick={() => navigate("/")}
        src={Logo}
        alt=""
        className="absolute left-5 sm:left-20 top-5 w-10 sm:w-15 cursor-pointer"
      />
      <div className="bg-gray-100 p-10 rounded-lg shadow-lg w-full sm:w-96 text-indigo-300 text-sm">
        <h2 className="text-3xl font-semibold text-black text-center mb-3 ">
          {state === "Sign Up" ? "Create Account" : "Login"}
        </h2>
        <p className="text-center text-sm mb-6 text-teal-700">
          {state === "Sign Up"
            ? "Create your account"
            : "Login to your account!"}
        </p>

        <form onSubmit={onSubmitHandler}>
          {state === "Sign Up" && (
            <>
              <div className="mb-4 flex items-center ga[-3 w-full px-5 py-2.5 rounded-full bg-teal-900">
                <input
                  onChange={(e) => setName(e.target.value)}
                  value={name}
                  className=" bg-transparent outline-none ml-5 text-white"
                  type="text"
                  placeholder="Full Name"
                  required
                />
              </div>
            </>
          )}

          <div className="mb-4 flex items-center ga[-3 w-full px-5 py-2.5 rounded-full bg-teal-900">
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className=" bg-transparent outline-none ml-5 text-white"
              type="email"
              placeholder="Email id"
              required
            />
          </div>
          <div className="mb-4 flex items-center ga[-3 w-full px-5 py-2.5 rounded-full bg-teal-900">
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className=" bg-transparent outline-none ml-5 text-white"
              type="password"
              placeholder="Password"
              required
            />
          </div>

          <p
            onClick={() => navigate("/reset-password")}
            className="mb-4 text-teal-700 cursor-pointer hover:text-teal-500"
          >
            Forgot password
          </p>

          <button className="w-full py-2.5 rounded-full bg-gradient-to-r from-teal-500 to-teal-900 text-white front-medium cursor-pointer">
            {state}
          </button>
        </form>

        {state === "Sign Up" ? (
          <p className="text-black text-center text-xs mt-4">
            Already have an account?{" "}
            <span
              onClick={() => setState("Login")}
              className="text-blue-400 cursor-pointer underline"
            >
              Login here
            </span>
          </p>
        ) : (
          <p className="text-gray-400 text-center text-xs mt-4">
            Don't have an account?{" "}
            <span
              onClick={() => setState("Sign Up")}
              className="text-blue-400 cursor-pointer underline"
            >
              Sign Up
            </span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
