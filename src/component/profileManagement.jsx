import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ProfileManagement = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
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
  const navigate = useNavigate();

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

  const updateUserProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.put(
        "http://localhost:4000/api/user/profile",
        {
          faculty: user.jobInfo[0]?.faculty || "",
          designation: user.jobInfo[0]?.designation || "",
          contactNumber: user.jobInfo[0]?.contactNumber || "",
          qualifications: user.jobInfo[0]?.qualifications || "",
          areaOfExpertise: user.jobInfo[0]?.areaOfExpertise || "",
        },
        {
          withCredentials: true,
        }
      );
      if (data.success) {
        toast.success("Profile updated successfully");
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
      <h2 className="text-2xl font-bold mb-4">Profile Management</h2>
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
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={user.email}
            className="p-2 border border-gray-300 rounded w-full"
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
            className="p-2 border border-gray-300 rounded w-full"
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Designation</label>
          <input
            type="text"
            name="designation"
            value={user.jobInfo[0]?.designation || ""}
            onChange={handleJobInfoChange}
            className="p-2 border border-gray-300 rounded w-full"
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
          <input
            type="text"
            name="qualifications"
            value={user.jobInfo[0]?.qualifications || ""}
            onChange={handleJobInfoChange}
            className="p-2 border border-gray-300 rounded w-full"
          />
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
