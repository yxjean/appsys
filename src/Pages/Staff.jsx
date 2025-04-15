import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar";
import ProfileManagement from "../component/profileManagement";
import PerformanceReporting from "../component/performanceReporting";
import PerformanceArea from "../component/performanceArea";
import AdminPerformanceReporting from "../component/adminPerformanceReporting";
import axios from "axios";
import { toast } from "react-toastify";

export default function Staff() {
  const [selectedSection, setSelectedSection] = useState("Profile Management");
  const [privileged, setPrivileged] = useState(false);
  const [departmentStaff, setDepartmentStaff] = useState([]);
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedStaffProfile, setSelectedStaffProfile] = useState(null);
  const [viewProfile, setViewProfile] = useState(null);
  const [viewReport, setViewReport] = useState(null);

  useEffect(() => {
    fetchViewableStaff();
  }, []);

  const checkPrivileges = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/user/profile",
        {
          withCredentials: true,
        }
      );
      if (data.success && data.user.privileges !== "") {
        setPrivileged(true);
        fetchPrivilegedStaff(data.user.department._id);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchPrivilegedStaff = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/staff/privileged",
        { withCredentials: true }
      );
      if (data.success) {
        setDepartmentStaff(data.staff);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchViewableStaff = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/user/profile",
        { withCredentials: true }
      );
      if (data.success) {
        const viewableStaffIds = data.user.viewableStaff || [];
        const departmentId = data.user.department?._id;

        if (departmentId) {
          const staffResponse = await axios.get(
            `http://localhost:4000/api/departments/${departmentId}/staff`,
            { withCredentials: true }
          );
          if (staffResponse.data.success) {
            const allStaff = staffResponse.data.staff || [];
            const filtered = allStaff.filter((staff) =>
              viewableStaffIds.includes(staff._id)
            );
            setDepartmentStaff(allStaff);
            setFilteredStaff(filtered);
          } else {
            setDepartmentStaff([]);
            setFilteredStaff([]);
            toast.error(staffResponse.data.message);
          }
        } else {
          setDepartmentStaff([]);
          setFilteredStaff([]);
          toast.error("No department assigned to the user.");
        }
        setPrivileged(data.user.privileges !== "");
      } else {
        setDepartmentStaff([]);
        setFilteredStaff([]);
        setPrivileged(false);
        toast.error(data.message);
      }
    } catch (error) {
      setDepartmentStaff([]);
      setFilteredStaff([]);
      setPrivileged(false);
      toast.error(error.message);
    }
  };

  const viewStaffProfile = async (id) => {
    if (!id) {
      toast.error("Invalid staff ID");
      return;
    }
    try {
      const { data } = await axios.get(
        `http://localhost:4000/api/staff/profile/${id}`,
        { withCredentials: true }
      );
      if (data.success) {
        setSelectedStaffProfile(data.staff);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const viewStaffReport = async (id) => {
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
        setSelectedStaff(id);
        setViewReport(data.reportData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="flex">
      <Navbar />
      <div className="flex w-full pt-23">
        {/*Added mt-2*/}
        <div className="w-1/6 h-screen bg-gray-200 p-4 mt-2">
          <h2 className="text-2xl font-bold mb-4">Staff Panel</h2>
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => setSelectedSection("Profile Management")}
                className="w-full py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
              >
                Profile Management
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedSection("Performance Reporting")}
                className="w-full py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
              >
                Performance Reporting
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedSection("Performance Area")}
                className="w-full py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
              >
                Performance Area
              </button>
            </li>
            {privileged && (
              <li>
                <button
                  onClick={() => setSelectedSection("View All Staff")}
                  className="w-full py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
                >
                  View All Staff
                </button>
              </li>
            )}
          </ul>
        </div>
        <div className="w-5/6 p-4">
          {selectedSection === "Profile Management" && <ProfileManagement />}
          {selectedSection === "Performance Reporting" && (
            <PerformanceReporting />
          )}
          {selectedSection === "Performance Area" && <PerformanceArea />}
          {selectedSection === "View All Staff" && (
            <div>
              <div className="flex justify-between items-center mb-4">
                {/*added p-2 */}
                <h2 className="text-2xl font-bold p-2">Viewable Staff</h2>
              </div>
              <ul className="space-y-2">
                {filteredStaff.map((staffMember) => (
                  <li
                    key={staffMember._id}
                    className="p-2 border border-gray-300 rounded flex justify-between items-center"
                  >
                    <span>{staffMember.name}</span>
                    <button
                      onClick={() => viewStaffProfile(staffMember._id)}
                      className="py-1 px-3 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
                    >
                      View Profile
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {selectedSection === "Staff Report" && selectedStaff && (
            <AdminPerformanceReporting staffId={selectedStaff} />
          )}
        </div>
      </div>
      {selectedStaffProfile && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/2">
            <h2 className="text-2xl font-bold mb-4">
              Profile of {selectedStaffProfile.name}
            </h2>
            <div className="mb-4">
              <h3 className="text-xl font-bold">Email</h3>
              <p>{selectedStaffProfile.email}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-bold">Department</h3>
              <p>{selectedStaffProfile.department.name}</p>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => viewStaffReport(selectedStaffProfile._id)}
                className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
              >
                View Report
              </button>
              <button
                onClick={() => setSelectedStaffProfile(null)}
                className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {viewProfile && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/2">
            <h2 className="text-2xl font-bold mb-4">
              Profile of {viewProfile.name}
            </h2>
            <div className="mb-4">
              <h3 className="text-xl font-bold">Email</h3>
              <p>{viewProfile.email}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-bold">Department</h3>
              <p>{viewProfile.department.name}</p>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => viewStaffReport(viewProfile._id)}
                className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
              >
                View Report
              </button>
              <button
                onClick={() => setViewProfile(null)}
                className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {viewReport && selectedStaff && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-3/4 h-[90%] overflow-auto">
            <h2 className="text-2xl font-bold mb-4">Performance Report</h2>
            <AdminPerformanceReporting staffId={selectedStaff} />
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setViewReport(null);
                  setSelectedStaff(null); // Reset selected staff when closing
                }}
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
}
