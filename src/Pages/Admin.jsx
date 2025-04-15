import React, { useState, useEffect } from "react";
import Navbar from "../component/navbar";
import AcademicStaff from "../component/academic";
import Performance from "../component/Performance";
import Faculties from "../component/Faculties";
import axios from "axios";
import { toast } from "react-toastify";

export default function Admin() {
  const [faculties, setFaculties] = useState([]);
  const [selectedSection, setSelectedSection] = useState("Faculties");
  const [expandedDepartment, setExpandedDepartment] = useState(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchFaculties();
  }, []);

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

  const addFaculty = async (newFacultyName) => {
    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/faculties/add",
        { name: newFacultyName },
        { withCredentials: true }
      );
      if (data.success) {
        setFaculties([...faculties, data.faculty]);
        toast.success("Faculty added successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const addDepartmentToFaculty = async (facultyId, newDepartment) => {
    try {
      const { data } = await axios.post(
        `http://localhost:4000/api/faculties/${facultyId}/departments/add`,
        { name: newDepartment },
        { withCredentials: true }
      );
      if (data.success) {
        setFaculties(
          faculties.map((faculty) =>
            faculty._id === facultyId ? data.faculty : faculty
          )
        );
        toast.success("Department added to faculty");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const removeFaculty = async (id) => {
    try {
      const { data } = await axios.delete(
        `http://localhost:4000/api/faculties/remove/${id}`,
        { withCredentials: true }
      );
      if (data.success) {
        setFaculties(faculties.filter((faculty) => faculty._id !== id));
        toast.success("Faculty removed");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const removeDepartmentFromFaculty = async (facultyId, departmentId) => {
    try {
      const { data } = await axios.delete(
        `http://localhost:4000/api/departments/remove/${departmentId}`,
        { withCredentials: true }
      );
      if (data.success) {
        setFaculties(
          faculties.map((faculty) =>
            faculty._id === facultyId
              ? {
                  ...faculty,
                  departments: faculty.departments.filter(
                    (dept) => dept._id !== departmentId
                  ),
                }
              : faculty
          )
        );
        toast.success("Department removed");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleDepartment = async (id) => {
    if (expandedDepartment === id) {
      setExpandedDepartment(null);
      return;
    }
    try {
      const { data } = await axios.get(
        `http://localhost:4000/api/departments/${id}/staff`,
        { withCredentials: true }
      );
      if (data.success) {
        setExpandedDepartment(id);
        setFaculties((prevFaculties) =>
          prevFaculties.map((faculty) => ({
            ...faculty,
            departments: faculty.departments.map((dept) =>
              dept._id === id ? { ...dept, staff: data.staff } : dept
            ),
          }))
        );
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const assignPrivileges = async (selectedStaffIds, privileges) => {
    try {
      const { data } = await axios.put(
        "http://localhost:4000/api/staff/assign-privileges",
        { staffIds: selectedStaffIds, privileges },
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("Privileges assigned successfully");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match.");
      return;
    }

    try {
      const { data } = await axios.put(
        "http://localhost:4000/api/user/change-password",
        { currentPassword, newPassword },
        { withCredentials: true }
      );

      if (data.success) {
        toast.success("Password changed successfully.");
        setShowChangePasswordModal(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
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
          <h2 className="text-2xl font-bold mb-4">Admin Panel</h2>
          <ul className="space-y-4">
            <li>
              <button
                onClick={() => setSelectedSection("Faculties")}
                className="w-full py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
              >
                Faculties
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedSection("Academic Staff")}
                className="w-full py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
              >
                Academic Staff
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
            <li>
              <button
                onClick={() => setShowChangePasswordModal(true)}
                className="w-full py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
              >
                Change Password
              </button>
            </li>
          </ul>
        </div>
        <div className="w-5/6 p-4">
          {selectedSection === "Faculties" && (
            <Faculties
              faculties={faculties}
              setFaculties={setFaculties}
              addFaculty={addFaculty} // Pass the addFaculty function
              addDepartmentToFaculty={addDepartmentToFaculty}
              removeFaculty={removeFaculty}
              removeDepartmentFromFaculty={removeDepartmentFromFaculty}
              toggleDepartment={toggleDepartment}
              expandedDepartment={expandedDepartment}
              assignPrivileges={assignPrivileges}
            />
          )}
          {selectedSection === "Academic Staff" && <AcademicStaff />}
          {selectedSection === "Performance Area" && <Performance />}
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-2xl font-bold mb-4">Change Password</h2>
            <div className="mb-4">
              <label className="block font-bold mb-2">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="p-2 border border-gray-300 rounded w-full"
                placeholder="Enter current password"
              />
            </div>
            <div className="mb-4">
              <label className="block font-bold mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="p-2 border border-gray-300 rounded w-full"
                placeholder="Enter new password"
              />
            </div>
            <div className="mb-4">
              <label className="block font-bold mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="p-2 border border-gray-300 rounded w-full"
                placeholder="Confirm new password"
              />
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowChangePasswordModal(false)}
                className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
