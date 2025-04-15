import "./App.css";
import React from "react";
import { ToastContainer, toast } from "react-toastify";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import ResetPassword from "./Pages/ResetPassword";
import Admin from "./Pages/Admin"; // Import Admin component
import Staff from "./Pages/Staff"; // Import Staff component

function App() {
  return (
    <div>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Home />}></Route>
        <Route path="/login" element={<Login />}></Route>
        <Route path="/reset-password" element={<ResetPassword />}></Route>
        <Route path="/admin" element={<Admin />}></Route>
        <Route path="/staff" element={<Staff />}></Route>
      </Routes>
    </div>
  );
}

export default App;
