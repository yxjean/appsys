import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FaUser, FaCamera } from "react-icons/fa";

const ProfileManagement = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    profilePicture: null,
    jobInfo: [
      {
        faculty: "",
        designation: "",
        contactNumber: "",
        qualifications: "",
        areaOfExpertise: "",
      },
    ],
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  // Qualification options
  const qualificationOptions = ["Bachelor", "Master", "Doctor"];

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/user/profile",
        {
          withCredentials: true,
        }
      );
      if (data.success) {
        setUser(data.user);
        if (data.user.profilePicture) {
          setImagePreview(
            `http://localhost:4000/uploads/profile/${data.user.profilePicture}`
          );
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const handleJobInfoChange = (e) => {
    const { name, value } = e.target;
    setUser({
      ...user,
      jobInfo: [{ ...user.jobInfo[0], [name]: value }],
    });
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
  };

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

      setProfilePictureFile(file);

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

  const updateUserProfile = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("faculty", user.jobInfo[0]?.faculty || "");
      formData.append("designation", user.jobInfo[0]?.designation || "");
      formData.append("contactNumber", user.jobInfo[0]?.contactNumber || "");
      formData.append("qualifications", user.jobInfo[0]?.qualifications || "");
      formData.append(
        "areaOfExpertise",
        user.jobInfo[0]?.areaOfExpertise || ""
      );

      if (profilePictureFile) {
        formData.append("profilePicture", profilePictureFile);
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
        setProfilePictureFile(null); // Reset file input after successful upload
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }
    try {
      const { data } = await axios.put(
        "http://localhost:4000/api/user/change-password",
        passwords,
        { withCredentials: true }
      );
      if (data.success) {
        toast.success("Password changed successfully");
        setPasswords({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteUserProfile = async () => {
    try {
      const { data } = await axios.delete(
        "http://localhost:4000/api/user/profile",
        {
          withCredentials: true,
        }
      );
      if (data.success) {
        toast.success("Profile deleted successfully");
        navigate("/login");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="w-full p-4">
      <h2 className="text-2xl font-bold">Profile Management</h2>
      <div className="flex flex-col items-center my-6">
        <div
          className="w-40 h-40 rounded-lg bg-gray-200 flex items-center justify-center relative overflow-hidden cursor-pointer border-4 border-teal-500"
          onClick={triggerFileInput}
        >
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <FaUser size={60} className="text-gray-400" />
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
        <p className="text-sm text-gray-500 mt-2">Click to change photo</p>
      </div>

      <form onSubmit={updateUserProfile}>
        <div className="mb-4">
          <label className="block text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={user.name}
            onChange={handleInputChange}
            className="p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={user.email}
            className="p-2 border border-gray-300 rounded w-full bg-gray-100"
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">
            Faculty/Institute/Centre/Division
          </label>
          <input
            type="text"
            name="faculty"
            value={user.faculty?.name || "No faculty assigned"}
            className="p-2 border border-gray-300 rounded w-full bg-gray-100"
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Designation</label>
          <input
            type="text"
            name="designation"
            value={user.jobInfo[0]?.designation || ""}
            className="p-2 border border-gray-300 rounded w-full bg-gray-100"
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Contact Number</label>
          <input
            type="text"
            name="contactNumber"
            value={user.jobInfo[0]?.contactNumber || ""}
            onChange={handleJobInfoChange}
            className="p-2 border border-gray-300 rounded w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Qualifications</label>
          <select
            name="qualifications"
            value={user.jobInfo[0]?.qualifications || ""}
            onChange={handleJobInfoChange}
            className="p-2 border border-gray-300 rounded w-full"
          >
            <option value="">Select Qualification</option>
            {qualificationOptions.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">
            Area of Expertise (Optional)
          </label>
          <input
            type="text"
            name="areaOfExpertise"
            value={user.jobInfo[0]?.areaOfExpertise || ""}
            onChange={handleJobInfoChange}
            className="p-2 border border-gray-300 rounded w-full"
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer mr-2"
          >
            Update Profile
          </button>
          <button
            type="button"
            onClick={deleteUserProfile}
            className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
          >
            Delete Profile
          </button>
        </div>
      </form>
      <h2 className="text-2xl font-bold mt-8 mb-4">Change Password</h2>
      <form onSubmit={changePassword}>
        <div className="mb-4">
          <label className="block text-gray-700">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={passwords.currentPassword}
            onChange={handlePasswordChange}
            className="p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={passwords.newPassword}
            onChange={handlePasswordChange}
            className="p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Confirm New Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={passwords.confirmPassword}
            onChange={handlePasswordChange}
            className="p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
          >
            Change Password
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileManagement;
