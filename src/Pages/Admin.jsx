import React, { useState, useEffect, useContext } from "react";
import Navbar from "../component/navbar";
import AcademicStaff from "../component/academic";
import Performance from "../component/Performance";
import Faculties from "../component/Faculties";
import axios from "axios";
import { toast } from "react-toastify";
import { FaUser, FaCamera } from "react-icons/fa";
import { AppContent } from "../context/AppContext";

export default function Admin() {
  const [faculties, setFaculties] = useState([]);
  const [selectedSection, setSelectedSection] = useState("Faculties");
  const [expandedDepartment, setExpandedDepartment] = useState(null);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // Add new state variables for profile management
  const [adminName, setAdminName] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = React.useRef(null);
  const { updateProfileImage } = useContext(AppContent);

  useEffect(() => {
    fetchFaculties();
    fetchAdminProfile();
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

  // Add function to fetch admin profile
  const fetchAdminProfile = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/user/profile",
        { withCredentials: true }
      );
      if (data.success) {
        setAdminName(data.user.name);
        if (data.user.profilePicture) {
          setImagePreview(
            `http://localhost:4000/uploads/profile/${data.user.profilePicture}`
          );
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to fetch profile information");
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

  // Add handlers for profile picture upload
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("File size should not exceed 5MB");
        return;
      }

      if (!file.type.match("image.*")) {
        toast.error("Please select an image file");
        return;
      }

      setProfilePicture(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Update handler for profile update
  const handleProfileUpdate = async () => {
    if (!adminName.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", adminName);

      if (profilePicture) {
        formData.append("profilePicture", profilePicture);
      }

      const { data } = await axios.put(
        "http://localhost:4000/api/user/profile",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (data.success) {
        toast.success("Profile updated successfully");

        // Update the profile image in context if a new one was uploaded
        if (profilePicture) {
          updateProfileImage(data.user.profilePicture);
        }

        fetchAdminProfile(); // Refresh profile data
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleUpdateProfile = async () => {
    await handleProfileUpdate();

    if (currentPassword && newPassword && confirmPassword) {
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
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error("Failed to change password");
      }
    }

    // Close modal when done
    setShowChangePasswordModal(false);
  };

  return (
    <div className="flex">
      <Navbar />
      <div className="flex w-full pt-25">
        <div className="w-1/6 min-h-screen bg-gray-200 p-4">
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
        <div className="w-5/6 min-h-screen p-4">
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

      {/* Updated Profile/Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto mt-20">
          <div className="bg-white px-6 py-4 rounded shadow-lg w-2/5 max-h-[90%] overflow-y-auto mt-[20px]">
            <h2 className="text-2xl font-bold mb-4 mt-5">Update Profile</h2>

            {/* Profile Picture Section */}
            <div className="flex flex-col items-center mb-6">
              <div
                className="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center relative overflow-hidden cursor-pointer border-4 border-teal-500"
                onClick={triggerFileInput}
              >
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUser size={50} className="text-gray-400" />
                )}
                <div className="absolute bottom-0 right-0 left-0 bg-black bg-opacity-50 py-1 text-center">
                  <FaCamera className="text-white mx-auto" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleProfilePictureChange}
                className="hidden"
                accept="image/*"
              />
              <p className="text-sm text-gray-500 mt-2">
                Click to change photo
              </p>
            </div>

            {/* Name Field */}
            <div className="mb-4">
              <label className="block font-bold mb-2">Name</label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="p-2 border border-gray-300 rounded w-full"
                placeholder="Your name"
              />
            </div>

            <h3 className="text-xl font-bold mt-6 mb-3 border-t pt-4">
              Change Password (Optional)
            </h3>

            {/* Password Fields */}
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
                onClick={handleUpdateProfile}
                className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
              >
                Update Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
