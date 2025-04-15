import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AdminPerformanceReporting from "./adminPerformanceReporting";

const AcademicStaff = ({ onDepartmentChange }) => {
  const [staff, setStaff] = useState([]);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
  });
  const [departments, setDepartments] = useState([]); // Ensure departments state is initialized
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [report, setReport] = useState("");
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [faculties, setFaculties] = useState([]); // Faculties state
  const [selectedFaculty, setSelectedFaculty] = useState(""); // Selected faculty
  const [filteredDepartments, setFilteredDepartments] = useState([]); // Departments filtered by faculty

  useEffect(() => {
    fetchStaff();
    fetchFaculties();
    fetchDepartments();
  }, []);

  const fetchStaff = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/staff/search?query=",
        { withCredentials: true }
      );
      if (data.success) {
        setStaff(data.staff);
        setSearchResults(data.staff);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/departments",
        { withCredentials: true }
      );
      if (data.success) {
        setDepartments(data.departments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch departments.");
    }
  };

  const fetchFaculties = async () => {
    try {
      const { data } = await axios.get("http://localhost:4000/api/faculties", {
        withCredentials: true,
      });
      if (data.success) {
        setFaculties(data.faculties);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleFacultyChange = async (facultyId) => {
    setSelectedFaculty(facultyId);
    try {
      const { data } = await axios.get(
        `http://localhost:4000/api/departments?facultyId=${facultyId}`,
        { withCredentials: true }
      );
      if (data.success) {
        setFilteredDepartments(data.departments); // Set departments filtered by faculty
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch departments for the selected faculty.");
    }
  };

  const addStaff = async () => {
    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/staff/create",
        { ...newStaff, faculty: selectedFaculty }, // Include faculty
        { withCredentials: true }
      );
      if (data.success) {
        setStaff([...staff, data.staff]);
        setSearchResults([...searchResults, data.staff]);
        setNewStaff({ name: "", email: "", password: "", department: "" }); // Reset newStaff state to clear the form fields
        setShowStaffModal(false); // Close modal
        toast.success("Staff account created");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteStaff = async (id) => {
    if (!id) {
      toast.error("Invalid staff ID");
      return;
    }
    try {
      const { data } = await axios.delete(
        `http://localhost:4000/api/staff/delete/${id}`,
        { withCredentials: true }
      );
      if (data.success) {
        setStaff(staff.filter((staffMember) => staffMember._id !== id));
        setSearchResults(
          searchResults.filter((staffMember) => staffMember._id !== id)
        );
        toast.success("Staff account deleted");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const searchStaff = async () => {
    if (!searchQuery.trim()) {
      toast.error("Search query cannot be empty");
      return;
    }
    try {
      const { data } = await axios.get(
        `http://localhost:4000/api/staff/search?query=${searchQuery}`,
        { withCredentials: true }
      );
      if (data.success) {
        setSearchResults(data.staff);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
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
        const staff = data.staff;

        // Populate faculty from the department
        if (staff.department && staff.department.faculty) {
          staff.faculty = staff.department.faculty.name;
        }

        setSelectedStaff(staff);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

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
    <div className="w-full p-4">
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Academic Staff</h2>
          <button
            onClick={() => setShowStaffModal(true)}
            className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
          >
            Add Staff
          </button>
        </div>
        <div className="mb-4 flex">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name"
            className="p-2 border border-gray-300 rounded w-full"
          />
          <button
            onClick={searchStaff}
            className="ml-2 py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
          >
            Search
          </button>
        </div>
        <ul className="space-y-2">
          {searchResults.map((staffMember) => (
            <li
              key={staffMember._id}
              className="p-2 border border-gray-300 rounded flex justify-between items-center"
            >
              {staffMember.name}
              <div>
                <button
                  onClick={() => viewStaffProfile(staffMember._id)}
                  className="py-1 px-3 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer mr-2"
                >
                  View Profile
                </button>
                <button
                  onClick={() => deleteStaff(staffMember._id)}
                  className="py-1 px-3 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      {selectedStaff && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white p-6 rounded shadow-lg w-3/4 max-h-full overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              Profile of {selectedStaff.name}
            </h2>
            <div className="mb-4">
              <h3 className="text-xl font-bold">Email</h3>
              <p>{selectedStaff.email}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-bold">Faculty</h3>
              <p>{selectedStaff.faculty?.name || "No faculty assigned"}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-bold">Department</h3>
              <p>
                {selectedStaff.department?.name || "No department assigned"}
              </p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setShowMoreInfo(!showMoreInfo)}
                className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer mb-4"
              >
                More Information
              </button>
              {showMoreInfo && (
                <div className="mt-2 mb-4">
                  <h3 className="text-xl font-bold">Job Information</h3>
                  <p>
                    <strong>Designation:</strong>{" "}
                    {selectedStaff.jobInfo[0]?.designation}
                  </p>
                  <p>
                    <strong>Contact Number:</strong>{" "}
                    {selectedStaff.jobInfo[0]?.contactNumber}
                  </p>
                  <p>
                    <strong>Qualifications:</strong>{" "}
                    {selectedStaff.jobInfo[0]?.qualifications}
                  </p>
                  <p>
                    <strong>Area of Expertise:</strong>{" "}
                    {selectedStaff.jobInfo[0]?.areaOfExpertise}
                  </p>
                </div>
              )}
            </div>
            <div className="mt-4">
              <button
                onClick={() => fetchStaffReport(selectedStaff._id)}
                className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
              >
                View Report
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setSelectedStaff(null)}
                className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showStaffModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Create Staff Account</h2>
            <input
              type="text"
              value={newStaff.name}
              onChange={(e) =>
                setNewStaff({ ...newStaff, name: e.target.value })
              }
              placeholder="Full Name"
              className="p-2 border border-gray-300 rounded w-full mb-4"
            />
            <input
              type="email"
              value={newStaff.email}
              onChange={(e) =>
                setNewStaff({ ...newStaff, email: e.target.value })
              }
              placeholder="Email"
              className="p-2 border border-gray-300 rounded w-full mb-4"
            />
            <input
              type="password"
              value={newStaff.password}
              onChange={(e) =>
                setNewStaff({ ...newStaff, password: e.target.value })
              }
              placeholder="Password"
              className="p-2 border border-gray-300 rounded w-full mb-4"
            />
            <select
              value={selectedFaculty}
              onChange={(e) => handleFacultyChange(e.target.value)}
              className="p-2 border border-gray-300 rounded w-full mb-4"
            >
              <option value="">Select Faculty</option>
              {faculties.map((faculty) => (
                <option key={faculty._id} value={faculty._id}>
                  {faculty.name}
                </option>
              ))}
            </select>
            <select
              value={newStaff.department}
              onChange={(e) =>
                setNewStaff({ ...newStaff, department: e.target.value })
              }
              className="p-2 border border-gray-300 rounded w-full mb-4"
              disabled={!selectedFaculty}
            >
              <option value="">Select Department</option>
              {filteredDepartments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
            <div className="flex justify-end">
              <button
                onClick={() => setShowStaffModal(false)}
                className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer mr-2"
              >
                Cancel
              </button>
              <button
                onClick={addStaff}
                className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
      {showReportModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white p-6 rounded shadow-lg w-3/4 h-[90%] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Performance Report</h2>
            <AdminPerformanceReporting staffId={selectedStaff._id} />
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

export default AcademicStaff;
