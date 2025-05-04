import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar";
import ProfileManagement from "../component/profileManagement";
import PerformanceReporting from "../component/performanceReporting";
import PerformanceArea from "../component/performanceArea";
import AdminPerformanceReporting from "../component/adminPerformanceReporting";
import axios from "axios";
import { toast } from "react-toastify";
import {
  FaSearch,
  FaTable,
  FaSortAlphaDown,
  FaSortAmountUp,
  FaSortAmountDown,
  FaUser,
} from "react-icons/fa";

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
  const [staffSearchQuery, setStaffSearchQuery] = useState("");
  const [showStaffSummary, setShowStaffSummary] = useState(false);
  const [staffEntriesData, setStaffEntriesData] = useState([]);
  const [sortOrder, setSortOrder] = useState("alphabetical");
  const [isLoadingEntries, setIsLoadingEntries] = useState(false);
  const [showMoreInfo, setShowMoreInfo] = useState(false);

  useEffect(() => {
    fetchViewableStaff();
  }, []);

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

  const fetchStaffWithEntries = async () => {
    if (filteredStaff.length === 0) return;

    setIsLoadingEntries(true);
    try {
      const staffWithEntries = [];

      for (const staff of filteredStaff) {
        const { data } = await axios.get(
          `http://localhost:4000/api/performance-entries-summary/${staff._id}`,
          { withCredentials: true }
        );

        if (data.success) {
          const entryCounts = {
            name: staff.name,
            id: staff._id,
            Publication: 0,
            Research: 0,
            "Teaching & Undergraduate Supervision": 0,
            "Postgraduate Supervision": 0,
            VASI: 0,
            "Administrative Service": 0,
            Consultancy: 0,
            total: 0,
          };

          data.entries.forEach((entry) => {
            if (entryCounts.hasOwnProperty(entry.area)) {
              entryCounts[entry.area]++;
              entryCounts.total++;
            }
          });

          staffWithEntries.push(entryCounts);
        }
      }

      setStaffEntriesData(staffWithEntries);
    } catch (error) {
      toast.error("Failed to fetch staff entries");
      console.error(error);
    } finally {
      setIsLoadingEntries(false);
    }
  };

  const handleShowSummary = () => {
    setShowStaffSummary(true);
    if (staffEntriesData.length === 0) {
      fetchStaffWithEntries();
    }
  };

  const sortStaffEntries = (data) => {
    if (!data || data.length === 0) return [];

    const sortedData = [...data];

    switch (sortOrder) {
      case "alphabetical":
        return sortedData.sort((a, b) => a.name.localeCompare(b.name));
      case "entriesAsc":
        return sortedData.sort((a, b) => a.total - b.total);
      case "entriesDesc":
        return sortedData.sort((a, b) => b.total - a.total);
      default:
        return sortedData;
    }
  };

  const filteredViewableStaff = filteredStaff.filter((staff) =>
    staff.name.toLowerCase().includes(staffSearchQuery.toLowerCase())
  );

  return (
    <div className="flex">
      <Navbar />
      <div className="flex w-full pt-20">
        <div className="w-1/6 min-h-screen bg-gray-200 p-4 mt-5">
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
        <div className="w-5/6 h-full min-h-screen p-4">
          {selectedSection === "Profile Management" && <ProfileManagement />}
          {selectedSection === "Performance Reporting" && (
            <PerformanceReporting />
          )}
          {selectedSection === "Performance Area" && <PerformanceArea />}
          {selectedSection === "View All Staff" && (
            <div className="bg-white p-6 rounded shadow-lg h-screen overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Viewable Staff</h2>
                <button
                  onClick={handleShowSummary}
                  className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer flex items-center"
                >
                  <FaTable className="mr-2" /> View Entries Summary
                </button>
              </div>

              {/* Search bar */}
              <div className="mb-4 relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg pl-10 p-2.5 w-full"
                  placeholder="Search staff by name..."
                  value={staffSearchQuery}
                  onChange={(e) => setStaffSearchQuery(e.target.value)}
                />
              </div>

              <ul className="space-y-2">
                {filteredViewableStaff.length > 0 ? (
                  filteredViewableStaff.map((staffMember) => (
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
                  ))
                ) : (
                  <li className="p-4 text-center text-gray-500">
                    {staffSearchQuery
                      ? "No staff members match your search"
                      : "No viewable staff available"}
                  </li>
                )}
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
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">
                Profile of {selectedStaffProfile.name}
              </h2>
              {/* Profile Picture */}
              <div className="w-30 h-30 rounded-lg bg-gray-200 overflow-hidden absolute top-[320px] right-[500px] items-center justify-center border-4 border-gray-300">
                {selectedStaffProfile.profilePicture ? (
                  <img
                    src={`http://localhost:4000/uploads/profile/${selectedStaffProfile.profilePicture}`}
                    alt={selectedStaffProfile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser size={110} className="text-gray-400" />
                )}
              </div>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-bold">Email</h3>
              <p>{selectedStaffProfile.email}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-bold">Faculty</h3>
              <p>
                {selectedStaffProfile.faculty
                  ? selectedStaffProfile.faculty.name
                  : "Not assigned"}
              </p>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-bold">Department</h3>
              <p>{selectedStaffProfile.department.name}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setShowMoreInfo(!showMoreInfo)}
                className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer mb-4"
              >
                {showMoreInfo ? "Hide Information" : "More Information"}
              </button>
              {showMoreInfo && (
                <div className="mt-2 mb-4">
                  <h3 className="text-xl font-bold">Job Information</h3>
                  <p>
                    <strong>Designation:</strong>{" "}
                    {selectedStaffProfile.jobInfo &&
                    selectedStaffProfile.jobInfo.length > 0
                      ? selectedStaffProfile.jobInfo[0].designation
                      : "Not specified"}
                  </p>
                  <p>
                    <strong>Contact Number:</strong>{" "}
                    {selectedStaffProfile.jobInfo &&
                    selectedStaffProfile.jobInfo.length > 0
                      ? selectedStaffProfile.jobInfo[0].contactNumber
                      : "Not specified"}
                  </p>
                  <p>
                    <strong>Qualifications:</strong>{" "}
                    {selectedStaffProfile.jobInfo &&
                    selectedStaffProfile.jobInfo.length > 0
                      ? selectedStaffProfile.jobInfo[0].qualifications
                      : "Not specified"}
                  </p>
                  <p>
                    <strong>Area of Expertise:</strong>{" "}
                    {selectedStaffProfile.jobInfo &&
                    selectedStaffProfile.jobInfo.length > 0
                      ? selectedStaffProfile.jobInfo[0].areaOfExpertise
                      : "Not specified"}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => viewStaffReport(selectedStaffProfile._id)}
                className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
              >
                View Report
              </button>
              <button
                onClick={() => {
                  setSelectedStaffProfile(null);
                  setShowMoreInfo(false);
                }}
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
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">
                Profile of {viewProfile.name}
              </h2>
              <div className="w-24 h-24 rounded-lg bg-gray-200 overflow-hidden flex items-center justify-center border-4 border-gray-300">
                {viewProfile.profilePicture ? (
                  <img
                    src={`http://localhost:4000/uploads/profile/${viewProfile.profilePicture}`}
                    alt={viewProfile.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser size={50} className="text-gray-400" />
                )}
              </div>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-bold">Email</h3>
              <p>{viewProfile.email}</p>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-bold">Faculty</h3>
              <p>
                {viewProfile.faculty
                  ? viewProfile.faculty.name
                  : "Not assigned"}
              </p>
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-bold">Department</h3>
              <p>{viewProfile.department.name}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => setShowMoreInfo(!showMoreInfo)}
                className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer mb-4"
              >
                {showMoreInfo ? "Hide Information" : "More Information"}
              </button>
              {showMoreInfo && (
                <div className="mt-2 mb-4">
                  <h3 className="text-xl font-bold">Job Information</h3>
                  <p>
                    <strong>Designation:</strong>{" "}
                    {viewProfile.jobInfo && viewProfile.jobInfo.length > 0
                      ? viewProfile.jobInfo[0].designation
                      : "Not specified"}
                  </p>
                  <p>
                    <strong>Contact Number:</strong>{" "}
                    {viewProfile.jobInfo && viewProfile.jobInfo.length > 0
                      ? viewProfile.jobInfo[0].contactNumber
                      : "Not specified"}
                  </p>
                  <p>
                    <strong>Qualifications:</strong>{" "}
                    {viewProfile.jobInfo && viewProfile.jobInfo.length > 0
                      ? viewProfile.jobInfo[0].qualifications
                      : "Not specified"}
                  </p>
                  <p>
                    <strong>Area of Expertise:</strong>{" "}
                    {viewProfile.jobInfo && viewProfile.jobInfo.length > 0
                      ? viewProfile.jobInfo[0].areaOfExpertise
                      : "Not specified"}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => viewStaffReport(viewProfile._id)}
                className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
              >
                View Report
              </button>
              <button
                onClick={() => {
                  setViewProfile(null);
                  setShowMoreInfo(false);
                }}
                className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {viewReport && selectedStaff && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 mt-20">
          <div className="bg-white p-6 rounded shadow-lg w-3/4 h-[90%] overflow-auto">
            <AdminPerformanceReporting staffId={selectedStaff} />
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setViewReport(null);
                  setSelectedStaff(null);
                }}
                className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {showStaffSummary && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-4/5 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Staff Entries Summary</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSortOrder("alphabetical")}
                  className={`p-2 rounded ${
                    sortOrder === "alphabetical"
                      ? "bg-teal-500 text-white"
                      : "bg-gray-200"
                  }`}
                  title="Sort alphabetically"
                >
                  <FaSortAlphaDown />
                </button>
                <button
                  onClick={() => setSortOrder("entriesAsc")}
                  className={`p-2 rounded ${
                    sortOrder === "entriesAsc"
                      ? "bg-teal-500 text-white"
                      : "bg-gray-200"
                  }`}
                  title="Sort by total entries (low to high)"
                >
                  <FaSortAmountUp />
                </button>
                <button
                  onClick={() => setSortOrder("entriesDesc")}
                  className={`p-2 rounded ${
                    sortOrder === "entriesDesc"
                      ? "bg-teal-500 text-white"
                      : "bg-gray-200"
                  }`}
                  title="Sort by total entries (high to low)"
                >
                  <FaSortAmountDown />
                </button>
              </div>
            </div>

            {isLoadingEntries ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-2">Loading staff entry data...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="py-2 px-3 border-b text-left">Staff</th>
                      <th className="py-2 px-3 border-b text-center">
                        Publication
                      </th>
                      <th className="py-2 px-3 border-b text-center">
                        Research
                      </th>
                      <th className="py-2 px-3 border-b text-center">
                        Teaching & Undergrad
                      </th>
                      <th className="py-2 px-3 border-b text-center">
                        Postgrad
                      </th>
                      <th className="py-2 px-3 border-b text-center">VASI</th>
                      <th className="py-2 px-3 border-b text-center">
                        Admin Service
                      </th>
                      <th className="py-2 px-3 border-b text-center">
                        Consultancy
                      </th>
                      <th className="py-2 px-3 border-b text-center font-bold">
                        Total Entries
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortStaffEntries(staffEntriesData).map((staff) => (
                      <tr key={staff.id} className="hover:bg-gray-50">
                        <td className="py-2 px-3 border-b font-medium">
                          {staff.name}
                        </td>
                        <td className="py-2 px-3 border-b text-center">
                          {staff.Publication}
                        </td>
                        <td className="py-2 px-3 border-b text-center">
                          {staff.Research}
                        </td>
                        <td className="py-2 px-3 border-b text-center">
                          {staff["Teaching & Undergraduate Supervision"]}
                        </td>
                        <td className="py-2 px-3 border-b text-center">
                          {staff["Postgraduate Supervision"]}
                        </td>
                        <td className="py-2 px-3 border-b text-center">
                          {staff.VASI}
                        </td>
                        <td className="py-2 px-3 border-b text-center">
                          {staff["Administrative Service"]}
                        </td>
                        <td className="py-2 px-3 border-b text-center">
                          {staff.Consultancy}
                        </td>
                        <td className="py-2 px-3 border-b text-center font-bold">
                          {staff.total}
                        </td>
                      </tr>
                    ))}

                    {staffEntriesData.length === 0 && (
                      <tr>
                        <td
                          colSpan="9"
                          className="py-4 text-center text-gray-500"
                        >
                          No entry data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowStaffSummary(false)}
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
