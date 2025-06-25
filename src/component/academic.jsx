import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AdminPerformanceReporting from "./adminPerformanceReporting";
import { FaPlus, FaTrash, FaFilter, FaSearch, FaUser } from "react-icons/fa";

const AcademicStaff = ({ onDepartmentChange }) => {
  const [staff, setStaff] = useState([]);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    designation: "",
  });
  const [departments, setDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [report, setReport] = useState("");
  const [showMoreInfo, setShowMoreInfo] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [faculties, setFaculties] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [staffIdToRemove, setStaffIdToRemove] = useState(null);


  const [searchType, setSearchType] = useState("name");
  const searchRef = useRef(null);

  const designationOptions = [
    "Professor",
    "Associate Professor",
    "Assistant Professor",
    "Lecturer",
  ];

  useEffect(() => {
    fetchStaff();
    fetchFaculties();
    fetchDepartments();
  }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults(staff);
      return;
    }

    let filtered = [];
    const query = searchQuery.toLowerCase();

    switch (searchType) {
      case "name":
        filtered = staff.filter((staffMember) =>
          staffMember?.name?.toLowerCase().includes(query)
        );
        break;
      case "faculty":
        filtered = staff.filter((staffMember) => {
          if (staffMember?.faculty) {
            if (
              typeof staffMember.faculty === "object" &&
              staffMember.faculty?.name
            ) {
              return staffMember.faculty.name.toLowerCase().includes(query);
            } else if (typeof staffMember.faculty === "string") {
              const faculty = faculties.find(
                (f) => f._id === staffMember.faculty
              );
              return faculty?.name?.toLowerCase().includes(query);
            }
          }
          return false;
        });
        break;
      case "department":
        filtered = staff.filter((staffMember) => {
          if (staffMember?.department) {
            if (
              typeof staffMember.department === "object" &&
              staffMember.department?.name
            ) {
              return staffMember.department.name.toLowerCase().includes(query);
            } else if (typeof staffMember.department === "string") {
              const department = departments.find(
                (d) => d._id === staffMember.department
              );
              return department?.name?.toLowerCase().includes(query);
            }
          }
          return false;
        });
        break;
      default:
        filtered = staff;
    }

    setSearchResults(filtered);
  };

  useEffect(() => {
    if (staff && staff.length > 0) {
      handleSearch();
    }
  }, [searchQuery, searchType, staff]);

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
        setFilteredDepartments(data.departments);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch departments for the selected faculty.");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const addStaff = async () => {
    try {
      const jobInfo = [
        {
          faculty: selectedFaculty,
          designation: newStaff.designation,
          contactNumber: "",
          qualifications: "",
          areaOfExpertise: "",
        },
      ];

      // Find the faculty and department names before creating staff
      const selectedFacultyObj = faculties.find(
        (f) => f._id === selectedFaculty
      );
      const selectedDepartmentObj = filteredDepartments.find(
        (d) => d._id === newStaff.department
      );

      const { data } = await axios.post(
        "http://localhost:4000/api/staff/create",
        {
          ...newStaff,
          faculty: selectedFaculty,
          jobInfo,
        },
        { withCredentials: true }
      );

      if (data.success) {
        const newStaffComplete = {
          ...data.staff,
          faculty: {
            _id: selectedFaculty,
            name: selectedFacultyObj
              ? selectedFacultyObj.name
              : "Unknown Faculty",
          },
          department: {
            _id: newStaff.department,
            name: selectedDepartmentObj
              ? selectedDepartmentObj.name
              : "Unknown Department",
          },
        };

        setStaff([...staff, newStaffComplete]);
        setSearchResults([...searchResults, newStaffComplete]);

        setNewStaff({
          name: "",
          email: "",
          password: "",
          department: "",
          designation: "",
        });

        setShowStaffModal(false);
        toast.success("Staff account created");

        fetchStaff();
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
        setSelectedStaff(data.staff);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    setShowMoreInfo(false); // Reset to false when selectedStaff changes
  }, [selectedStaff]);

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

  const confirmRemoval = () => {
    deleteStaff(staffIdToRemove);
    setShowConfirmModal(false);
    setStaffIdToRemove(null);
  };

  return (
    <div className="w-full">
      <div className="mt-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Academic Staff</h2>
          <button
            onClick={() => setShowStaffModal(true)}
            className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer flex items-center"
          >
            <FaPlus className="mr-2" /> Add Staff
          </button>
        </div>

        {/* Simplified search section */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search by ${searchType}...`}
                className="p-2 pl-10 border border-gray-300 rounded w-full"
              />
            </div>

            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="p-2 border border-gray-300 rounded bg-gray-50"
            >
              <option value="name">Search by Name</option>
              <option value="faculty">Search by Faculty</option>
              <option value="department">Search by Department</option>
            </select>
          </div>
        </div>

        {/* Staff list display */}
        <ul className="space-y-2">
          {searchResults.length > 0 ? (
            searchResults.sort((a, b) => a.name.localeCompare(b.name)).map((staffMember) => {
              let facultyName = "";
              let departmentName = "";

              if (staffMember.faculty) {
                facultyName =
                  typeof staffMember.faculty === "object"
                    ? staffMember.faculty.name
                    : faculties.find((f) => f._id === staffMember.faculty)
                        ?.name || "";
              }

              if (staffMember.department) {
                departmentName =
                  typeof staffMember.department === "object"
                    ? staffMember.department.name
                    : departments.find((d) => d._id === staffMember.department)
                        ?.name || "";
              }

              return (
                <li
                  key={staffMember._id}
                  className="p-2 border border-gray-300 rounded flex justify-between items-center"
                >
                  <div>
                    <span className="font-bold">{staffMember.name}</span>
                    {departmentName && (
                      <span className="text-gray-600 text-sm ml-2">
                        {departmentName}
                      </span>
                    )}
                    {facultyName && (
                      <span className="text-gray-500 text-sm ml-2">
                        ({facultyName})
                      </span>
                    )}
                  </div>
                  <div>
                    <button
                      onClick={() => viewStaffProfile(staffMember._id)}
                      className="py-1 px-3 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer mr-2"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => {
                        setStaffIdToRemove(staffMember._id);
                        setShowConfirmModal(true);
                      }}
                      className="p-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                      title="Remove Staff"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </li>
              );
            })
          ) : (
            <li className="p-4 text-center text-gray-500">
              No staff members found matching your search criteria
            </li>
          )}
        </ul>
      </div>

      {selectedStaff && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white p-6 rounded shadow-lg w-3/4 max-h-full overflow-y-auto">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              {/* Left side: Info */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold">
                    Profile of {selectedStaff.name}
                  </h2>
                </div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold">Email</h3>
                  <p>{selectedStaff.email}</p>
                </div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold">Faculty</h3>
                  <p>
                    {selectedStaff.faculty
                      ? selectedStaff.faculty.name
                      : "No faculty assigned"}
                  </p>
                </div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold">Department</h3>
                  <p>
                    {selectedStaff.department
                      ? selectedStaff.department.name
                      : "No department assigned"}
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => setShowMoreInfo(!showMoreInfo)}
                    className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600     cursor-pointer mb-4"
                  >
                    {showMoreInfo ? "Hide Information" : "More Information"}
                  </button>
                  {showMoreInfo && (
                    <div className="mt-2 mb-4">
                      <h3 className="text-xl font-bold">Job Information</h3>
                      <p>
                        <strong>Designation:</strong>{" "}
                        {selectedStaff.jobInfo && selectedStaff.jobInfo.length > 0
                          ? selectedStaff.jobInfo[0].designation
                          : "Not specified"}
                      </p>
                      <p>
                        <strong>Contact Number:</strong>{" "}
                        {selectedStaff.jobInfo && selectedStaff.jobInfo.length > 0
                          ? selectedStaff.jobInfo[0].contactNumber
                          : "Not specified"}
                      </p>
                      <p>
                        <strong>Qualifications:</strong>{" "}
                        {selectedStaff.jobInfo && selectedStaff.jobInfo.length > 0
                          ? selectedStaff.jobInfo[0].qualifications
                          : "Not specified"}
                      </p>
                      <p>
                        <strong>Area of Expertise:</strong>{" "}
                        {selectedStaff.jobInfo && selectedStaff.jobInfo.length > 0
                          ? selectedStaff.jobInfo[0].areaOfExpertise
                          : "Not specified"}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right side: Image */}
              <div className="w-40 h-40 rounded-lg bg-gray-200 overflow-hidden border-4 border-gray-300">
                {selectedStaff.profilePicture ? (
                  <img
                    src={`http://localhost:4000/uploads/profile/${selectedStaff.profilePicture}`}
                    alt={selectedStaff.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser size={150} className="text-gray-400" />
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => fetchStaffReport(selectedStaff._id)}
                className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
              >
                View Report
              </button>
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
          <div className="bg-white p-6 rounded shadow-lg w-96">
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

            {/* Designation dropdown */}
            <select
              value={newStaff.designation}
              onChange={(e) =>
                setNewStaff({ ...newStaff, designation: e.target.value })
              }
              className="p-2 border border-gray-300 rounded w-full mb-4"
            >
              <option value="">Select Designation</option>
              {designationOptions.map((designation, index) => (
                <option key={index} value={designation}>
                  {designation}
                </option>
              ))}
            </select>

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
                disabled={
                  !newStaff.name ||
                  !newStaff.email ||
                  !newStaff.password ||
                  !selectedFaculty ||
                  !newStaff.department ||
                  !newStaff.designation
                }
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-2xl font-bold mb-4">Confirm Removal</h2>
            <p className="mb-6">
              Are you sure you want to remove this staff? This action cannot be undone.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer mr-2"
              >
                Cancel
              </button>
              <button
                onClick={confirmRemoval}
                className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}


      {showReportModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto mt-20">
          <div className="bg-white p-6 rounded shadow-lg w-3/4 h-[90%] overflow-y-auto">
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
