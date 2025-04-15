import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; // Import useNavigate

const Faculties = ({
  faculties,
  setFaculties,
  removeFaculty,
  removeDepartmentFromFaculty,
  toggleDepartment,
  expandedDepartment,
}) => {
  const navigate = useNavigate();
  const [selectedStaffIds, setSelectedStaffIds] = useState([]);
  const [showPrivilegesModal, setShowPrivilegesModal] = useState(false);
  const [role, setRole] = useState("");
  const [currentDepartmentStaff, setCurrentDepartmentStaff] = useState([]);
  const [newFacultyName, setNewFacultyName] = useState("");
  const [showAddFacultyModal, setShowAddFacultyModal] = useState(false);
  const [privilegedStaffId, setPrivilegedStaffId] = useState("");
  const [newDepartmentName, setNewDepartmentName] = useState("");
  const [showAddDepartmentModal, setShowAddDepartmentModal] = useState(false);
  const [selectedFacultyId, setSelectedFacultyId] = useState("");

  const openPrivilegesModal = async (staffId, staffList, departmentId) => {
    try {
      setPrivilegedStaffId(staffId);

      if (staffList && staffList.length > 0) {
        setCurrentDepartmentStaff(staffList);
        setShowPrivilegesModal(true);
      } else if (departmentId) {
        const { data } = await axios.get(
          `http://localhost:4000/api/departments/${departmentId}/staff`,
          { withCredentials: true }
        );

        if (data.success) {
          setCurrentDepartmentStaff(data.staff);
          setShowPrivilegesModal(true);
        } else {
          toast.error(data.message);
        }
      } else {
        toast.error("No staff available in this department.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching staff.");
    }
  };

  const handleUnassignPrivilegesDirectly = async (staffId) => {
    try {
      await axios.put(
        "http://localhost:4000/api/staff/assign-privileges",
        { staffIds: [staffId], unassign: true },
        { withCredentials: true }
      );

      toast.success("Privileges and viewable staff unassigned successfully");
      setFaculties((prevFaculties) =>
        prevFaculties.map((faculty) => ({
          ...faculty,
          departments: faculty.departments.map((dept) => ({
            ...dept,
            staff: dept.staff.map((staffMember) =>
              staffMember._id === staffId
                ? {
                    ...staffMember,
                    privileges: "",
                    role: "",
                    viewableStaff: [],
                  }
                : staffMember
            ),
          })),
        }))
      );
    } catch (error) {
      toast.error("Failed to unassign privileges and clear viewable staff");
    }
  };

  const handleAssignPrivilegesAndSaveViewableStaff = async () => {
    if (!role.trim()) {
      toast.error("Please enter a role.");
      return;
    }

    if (selectedStaffIds.length === 0) {
      toast.error("Please select at least one staff member as viewable staff.");
      return;
    }

    try {
      await axios.put(
        "http://localhost:4000/api/staff/assign-privileges",
        { staffIds: [privilegedStaffId], role },
        { withCredentials: true }
      );

      await axios.put(
        "http://localhost:4000/api/staff/save-viewable-staff",
        { staffIds: selectedStaffIds, privilegedStaffId },
        { withCredentials: true }
      );

      setFaculties((prevFaculties) =>
        prevFaculties.map((faculty) => ({
          ...faculty,
          departments: faculty.departments.map((dept) => ({
            ...dept,
            staff: dept.staff.map((staffMember) =>
              staffMember._id === privilegedStaffId
                ? { ...staffMember, role, privileges: "view" }
                : staffMember
            ),
          })),
        }))
      );

      toast.success(
        "Privileges assigned and viewable staff saved successfully."
      );
      setShowPrivilegesModal(false);
      setRole("");
      setSelectedStaffIds([]);
      setPrivilegedStaffId("");
    } catch (error) {
      toast.error("Failed to assign privileges or save viewable staff.");
    }
  };

  const addFaculty = async (facultyName) => {
    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/faculties/add",
        { name: facultyName },
        { withCredentials: true }
      );

      if (data.success) {
        setFaculties((prevFaculties) => [...prevFaculties, data.faculty]);
        toast.success("Faculty added successfully.");
        setShowAddFacultyModal(false);
        navigate("/admin");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to add faculty.");
    }
  };

  const addDepartment = async (facultyId, departmentName) => {
    try {
      const { data } = await axios.post(
        `http://localhost:4000/api/faculties/${facultyId}/departments/add`,
        { name: departmentName },
        { withCredentials: true }
      );

      if (data.success) {
        setFaculties((prevFaculties) =>
          prevFaculties.map((faculty) =>
            faculty._id === facultyId ? data.faculty : faculty
          )
        );
        toast.success("Department added successfully.");
        setShowAddDepartmentModal(false);
        setNewDepartmentName("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to add department.");
    }
  };

  useEffect(() => {
    const fetchFacultiesWithDepartments = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/faculties",
          { withCredentials: true }
        );
        if (data.success) {
          setFaculties(data.faculties);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error("Failed to fetch faculties and departments.");
      }
    };

    fetchFacultiesWithDepartments();
  }, []);

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        {/*<h2 className="text-2xl font-bold">Faculties</h2>*/}
        <button
          onClick={() => setShowAddFacultyModal(true)}
          //added ml-auto
          className="ml-auto py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
        >
          Add Faculty
        </button>
      </div>
      <ul className="space-y-2">
        {faculties.map((faculty) => (
          //change gray-300
          <li key={faculty._id} className="border border-gray-600 rounded">
            <div className="flex justify-between items-center p-2">
              {/*added className="text-xl font-bold"*/}
              <span className="text-xl font-bold">{faculty.name}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => removeFaculty(faculty._id)}
                  className="py-1 px-3 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                >
                  Remove Faculty
                </button>
                <button
                  onClick={() => {
                    setSelectedFacultyId(faculty._id);
                    setShowAddDepartmentModal(true);
                  }}
                  className="py-1 px-3 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
                >
                  Add Department
                </button>
              </div>
            </div>
            <div className="p-4">
              {/*<h3 className="text-xl font-bold mb-2">Departments</h3>*/}
              <ul className="space-y-2">
                {faculty.departments.map((dept) => (
                  <li
                    key={dept._id}
                    className="p-2 border border-gray-300 rounded"
                  >
                    <div className="flex justify-between items-center">
                      <span>{dept.name}</span>
                      <div>
                        <button
                          onClick={() => toggleDepartment(dept._id)}
                          className="py-1 px-3 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer mr-2"
                        >
                          {expandedDepartment === dept._id
                            ? "Hide Staff"
                            : "View Staff"}
                        </button>
                        <button
                          onClick={() =>
                            removeDepartmentFromFaculty(faculty._id, dept._id)
                          }
                          className="py-1 px-3 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                        >
                          Remove Department
                        </button>
                      </div>
                    </div>
                    {expandedDepartment === dept._id && (
                      <ul className="pl-4 pb-2">
                        {dept.staff && dept.staff.length > 0 ? (
                          <>
                            {dept.staff.map((staffMember) => (
                              <li
                                key={staffMember._id}
                                className="p-2 flex justify-between items-center"
                              >
                                <span>
                                  {staffMember.name}{" "}
                                  {staffMember.role && (
                                    <span className="text-gray-500">
                                      ({staffMember.role})
                                    </span>
                                  )}
                                </span>
                                <button
                                  onClick={() =>
                                    staffMember.privileges
                                      ? handleUnassignPrivilegesDirectly(
                                          staffMember._id
                                        )
                                      : openPrivilegesModal(
                                          staffMember._id,
                                          dept.staff,
                                          dept._id
                                        )
                                  }
                                  className={`py-1 px-3 rounded hover:bg-opacity-80 cursor-pointer ${
                                    staffMember.privileges
                                      ? "bg-red-500 text-white"
                                      : "bg-teal-500 text-white"
                                  }`}
                                >
                                  {staffMember.privileges
                                    ? "Unassign Privileges"
                                    : "Assign Privileges"}
                                </button>
                              </li>
                            ))}
                          </>
                        ) : (
                          <li className="p-2">No staff found</li>
                        )}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
      {showAddFacultyModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-2xl font-bold mb-4">Add Faculty</h2>
            <input
              type="text"
              value={newFacultyName}
              onChange={(e) => setNewFacultyName(e.target.value)}
              placeholder="Faculty Name"
              className="p-2 border border-gray-300 rounded w-full mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddFacultyModal(false)}
                className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newFacultyName.trim()) {
                    addFaculty(newFacultyName); // Call the addFaculty function
                  } else {
                    toast.error("Faculty name cannot be empty");
                  }
                }}
                className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
      {showPrivilegesModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/2">
            <h2 className="text-2xl font-bold mb-4">Assign Privileges</h2>
            <div className="mb-4">
              <label className="block font-bold mb-2">Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="p-2 border border-gray-300 rounded w-full"
                placeholder="Enter role here..."
              />
            </div>
            <h3 className="text-xl font-bold mb-4">Select Viewable Staff</h3>
            <ul className="space-y-2">
              {currentDepartmentStaff.map((staffMember) => (
                <li key={staffMember._id} className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={selectedStaffIds.includes(staffMember._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStaffIds([
                          ...selectedStaffIds,
                          staffMember._id,
                        ]);
                      } else {
                        setSelectedStaffIds(
                          selectedStaffIds.filter(
                            (id) => id !== staffMember._id
                          )
                        );
                      }
                    }}
                  />
                  {staffMember.name}
                </li>
              ))}
            </ul>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowPrivilegesModal(false)}
                className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer mr-2"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignPrivilegesAndSaveViewableStaff}
                className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
              >
                Assign Privileges
              </button>
            </div>
          </div>
        </div>
      )}
      {showAddDepartmentModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-2xl font-bold mb-4">Add Department</h2>
            <input
              type="text"
              value={newDepartmentName}
              onChange={(e) => setNewDepartmentName(e.target.value)}
              placeholder="Department Name"
              className="p-2 border border-gray-300 rounded w-full mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddDepartmentModal(false)}
                className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newDepartmentName.trim()) {
                    addDepartment(selectedFacultyId, newDepartmentName);
                  } else {
                    toast.error("Department name cannot be empty");
                  }
                }}
                className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Faculties;
