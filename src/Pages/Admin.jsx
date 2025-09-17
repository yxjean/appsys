import React, { useState, useEffect, useContext, useRef } from "react";
import Navbar from "../component/navbar";
import AcademicStaff from "../component/academic";
import Performance from "../component/Performance";
import Faculties from "../component/Faculties";
import StaffPerformanceSummary from "../component/StaffPerformanceSummary";
import axios from "axios";
import { toast } from "react-toastify";
import { FaUser, FaCamera, FaPlus } from "react-icons/fa";
import { AppContent } from "../context/AppContext";
import { DataGrid } from '@mui/x-data-grid'; 
import StaffDetails from "../component/staffDetails";
import AssesmentPeriod from '../component/AssesmentPeriod';
import CancelIcon from '@mui/icons-material/Cancel';
import PerformanceArea from "../component/performanceArea";
import PerformanceReporting from "../component/performanceReporting";
//import PerformanceAreaPrintTemplate from "../component/PerformanceAreaPrintTemplate";
import { useReactToPrint } from 'react-to-print';


export default function Admin() {
  const [ rows, setRows ] = useState([]);
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
  const [mdlCurrSelectedPage, setMdlCurrSelectedPage] = useState(1);
  const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10});
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [departmentStaff, setDepartmentStaff] = useState([]);
  const [privileged, setPrivileged] = useState(false);
  const [selectedStaffDetails, setSelectedStaffDetails] = useState({});
  const [staff, setStaff] = useState([]);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [ performanceAreaStaffId, setPerformanceAreaStaffId ] = useState("");
  const [ performanceReportingStaffId, setPerformanceReportingStaffId ] = useState("");
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    designation: "",
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [staffIdToRemove, setStaffIdToRemove] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const designationOptions = [
    "Professor",
    "Associate Professor",
    "Assistant Professor",
    "Lecturer",
  ];


  const columns = [
    { field: "id", headerName: "ID", flex: 1 },
    { 
      field: "name", 
      headerName: "Name", 
      flex: 1,
      renderCell: (params)=>(
      <a className="cursor-pointer text-blue-800"
        onClick={()=>{setSelectedSection('Staff Details'), setSelectedStaffDetails(params.row)}}>{params.row.name}</a>
    )},
    { field: "email", headerName: "Email", flex: 1 },
    { field: "faculty", headerName: "Faculty", flex: 1 },
    { field: "department", headerName: "Department", flex: 1 },
    { field: "designation", headerName: "Designation", flex: 1 },
    { field: "contactNumber", headerName: "Contact Number", flex: 1 },
    { field: "qualifications", headerName: "Qualifications", flex: 1 },
    { field: "areaOfExpertise", headerName: "Area of Expertise", flex: 1 },
    { 
      headerName: "Action",  
      renderCell: (params)=>(
        <div className="flex justify-center items-center h-full">
          <CancelIcon onClick={ ()=>{ setStaffIdToRemove(params.row.id); setShowConfirmModal(true) } }  className="cursor-pointer text-red-500" />
        </div>
      )
    }
  ]

  useEffect(() => {
    fetchFaculties();
    fetchAdminProfile();
    fetchViewableStaff();
  }, []);



  useEffect(()=>{
    setRows(filteredStaff.map((item)=>{
      return {
        id: item._id,
        name: item.name,
        email: item.email,
        faculty: item.jobInfo[0].facultyName,
        department: item.departmentName,
        designation: item.jobInfo[0].designation || "-",
        contactNumber: item.jobInfo[0].contactNumber || "-",
        qualifications: item.jobInfo[0].qualifications || "-",
        areaOfExpertise: item.jobInfo[0].areaOfExpertise || "-",
        profilePic: item.profilePicture
      }
    }))

  },[filteredStaff])


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


  const fetchStaff = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/staff/search?query=",
        { withCredentials: true }
      );
      if (data.success) {
        setStaff(data.staff);
        //setSearchResults(data.staff);
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
        "http://localhost:4000/api/staff/getAdminAllStaff",
        { withCredentials: true }
      );

      if (data.success) {
        setRows(data.viewableStaff.map((item)=>{


          return {
            id: item._id,
            name: item.name,
            email: item.email,
            faculty: item.faculty?item.faculty.name : "-",
            department: item.department.name,
            designation: item.jobInfo[0].designation || "-",
            contactNumber: item.jobInfo[0].contactNumber || "-",
            qualifications: item.jobInfo[0].qualifications || "-",
            areaOfExpertise: item.jobInfo[0].areaOfExpertise || "-",
            profilePic: item.profilePicture
          }
        }))


      //  const viewableStaffIds = data.user.viewableStaff || [];
      //  const departmentId = data.user.department?._id;

      //  if (departmentId) {
      //    const staffResponse = await axios.get(
      //      `http://localhost:4000/api/departments/${departmentId}/staff`,
      //      { withCredentials: true }
      //    );
      //    if (staffResponse.data.success) {
      //      const allStaff = staffResponse.data.staff || [];
      //      const filtered = allStaff.filter((staff) =>
      //        viewableStaffIds.includes(staff._id)
      //      );
      //      setRows(allStaff);
      //      setDepartmentStaff(allStaff);
      //      setFilteredStaff(filtered);
      //    } else {
      //      setDepartmentStaff([]);
      //      setFilteredStaff([]);
      //      toast.error(staffResponse.data.message);
      //    }
      //  } else {
      //    setDepartmentStaff([]);
      //    setFilteredStaff([]);
      //    toast.error("No department assigned to the user.");
      //  }
      //  //setPrivileged(data.user.privileges !== "");
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
        //setSearchResults([...searchResults, newStaffComplete]);

        setNewStaff({
          name: "",
          email: "",
          password: "",
          department: "",
          designation: "",
        });

        setShowStaffModal(false);
        toast.success("Staff account created");

        fetchViewableStaff()
        //fetchStaff();
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
        fetchViewableStaff();
        //setSearchResults(
        //  searchResults.filter((staffMember) => staffMember._id !== id)
        //);
        toast.success("Staff account deleted");
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
                onClick={() => setSelectedSection("Staff Performance Summary")}
                className="w-full py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
              >
                Staff Performace Summary
              </button>
            </li>
            <li>
              <button
                onClick={() => setSelectedSection("Assesment Period")}
                className="w-full py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
              >
                Assesment Period
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
          {selectedSection === "Staff Details" && <StaffDetails staffDetails={selectedStaffDetails} setSelectedSection={setSelectedSection} setPerformanceReportingStaffId={setPerformanceReportingStaffId} />}
          {selectedSection === "Admin & Superior Performance Reporting" && <PerformanceReporting userIdToView={performanceReportingStaffId}/>}
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
          {selectedSection === "Academic Staff" && (
            <div className="bg-white p-6 rounded shadow-lg h-screen overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Academic Staff</h2>
                <button
                  onClick={() => setShowStaffModal(true)}
                  className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer flex items-center"
                >
                  <FaPlus className="mr-2" /> Add Staff
                </button>
              </div>

              <DataGrid
                autoHeight
                rows={rows}
                columns={columns}
                paginationModel={paginationModel}
                onPaginationModelChange={setPaginationModel}
                pageSizeOptions={[10]}
                disableRowSelectionOnClick  
                checkboxSelection={false}   
                initialState={{
                  columns: {
                    columnVisibilityModel: {
                      id: false,   
                    },
                  },
                  sorting: {
                    sortModel: [{ field: "name", sort: "asc" }],
                  },
                }}
              />
            </div>

          )}
          {selectedSection === "Performance Area" && <Performance/>}
          {selectedSection === "Admin & Superior Performance Area" && <PerformanceArea userIdToView={performanceAreaStaffId}/>}
          {selectedSection === "Assesment Period" && <AssesmentPeriod />}
          {selectedSection === "Staff Performance Summary" && <StaffPerformanceSummary setSelectedSection={setSelectedSection} setPerformanceAreaStaffId={setPerformanceAreaStaffId}/>}

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
    </div>
  );
}
