import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaTrash,
  FaEye,
  FaEyeSlash,
  FaEdit,
  FaUserCog,
  FaUserSlash,
  FaSearch,
} from "react-icons/fa";

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
  const [showEditFacultyModal, setShowEditFacultyModal] = useState(false);
  const [editFacultyId, setEditFacultyId] = useState("");
  const [editFacultyName, setEditFacultyName] = useState("");
  const [showEditDepartmentModal, setShowEditDepartmentModal] = useState(false);
  const [editDepartmentId, setEditDepartmentId] = useState("");
  const [editDepartmentName, setEditDepartmentName] = useState("");
  const [editDepartmentFacultyId, setEditDepartmentFacultyId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [removalType, setRemovalType] = useState("");

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

  const editFaculty = async (facultyId, facultyName) => {
    try {
      const { data } = await axios.put(
        `http://localhost:4000/api/faculties/${facultyId}`,
        { name: facultyName },
        { withCredentials: true }
      );

      if (data.success) {
        setFaculties((prevFaculties) =>
          prevFaculties.map((faculty) =>
            faculty._id === facultyId
              ? { ...faculty, name: facultyName }
              : faculty
          )
        );
        toast.success("Faculty updated successfully.");
        setShowEditFacultyModal(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to update faculty.");
    }
  };

  const editDepartment = async (facultyId, departmentId, departmentName) => {
    try {
      const { data } = await axios.put(
        `http://localhost:4000/api/faculties/${facultyId}/departments/${departmentId}`,
        { name: departmentName },
        { withCredentials: true }
      );

      if (data.success) {
        setFaculties((prevFaculties) =>
          prevFaculties.map((faculty) =>
            faculty._id === facultyId
              ? {
                  ...faculty,
                  departments: faculty.departments.map((dept) =>
                    dept._id === departmentId
                      ? { ...dept, name: departmentName }
                      : dept
                  ),
                }
              : faculty
          )
        );
        toast.success("Department updated successfully.");
        setShowEditDepartmentModal(false);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to update department.");
    }
  };

  const handleRemoveFaculty = (facultyId) => {
    setItemToRemove(facultyId);
    setRemovalType("faculty");
    setShowConfirmModal(true);
  };

  const handleRemoveDepartment = (facultyId, departmentId) => {
    setItemToRemove({ facultyId, departmentId });
    setRemovalType("department");
    setShowConfirmModal(true);
  };

  const confirmRemoval = () => {
    if (removalType === "faculty") {
      removeFaculty(itemToRemove);
    } else if (removalType === "department") {
      removeDepartmentFromFaculty(
        itemToRemove.facultyId,
        itemToRemove.departmentId
      );
    }
    setShowConfirmModal(false);
    setItemToRemove(null);
    setRemovalType("");
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

  const filteredStaff = currentDepartmentStaff
    .filter((staff) =>
      staff.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name)); // Sort staff alphabetically

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Faculties</h2>
        <button
          onClick={() => setShowAddFacultyModal(true)}
          className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer flex items-center"
        >
          <FaPlus className="mr-2" /> Add Faculty
        </button>
      </div>
      <ul className="space-y-2">
        {faculties.map((faculty) => (
          <li key={faculty._id} className="border-2 border-teal-500 rounded">
            <div className="flex justify-between items-center p-2">
              <span className="text-2xl font-bold text-teal-500">
                {faculty.name}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditFacultyId(faculty._id);
                    setEditFacultyName(faculty.name);
                    setShowEditFacultyModal(true);
                  }}
                  className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
                  title="Edit Faculty"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => {
                    setSelectedFacultyId(faculty._id);
                    setShowAddDepartmentModal(true);
                  }}
                  className="p-2 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
                  title="Add Department"
                >
                  <FaPlus />
                </button>
                <button
                  onClick={() => handleRemoveFaculty(faculty._id)}
                  className="p-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                  title="Remove Faculty"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-xl font-bold mb-2">Departments</h3>
              <ul className="space-y-2">
                {faculty.departments.map((dept) => (
                  <li
                    key={dept._id}
                    className="p-2 border border-gray-300 rounded"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold">{dept.name}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleDepartment(dept._id)}
                          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
                          title={
                            expandedDepartment === dept._id
                              ? "Hide Staff"
                              : "View Staff"
                          }
                        >
                          {expandedDepartment === dept._id ? (
                            <FaEyeSlash />
                          ) : (
                            <FaEye />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditDepartmentId(dept._id);
                            setEditDepartmentName(dept.name);
                            setEditDepartmentFacultyId(faculty._id);
                            setShowEditDepartmentModal(true);
                          }}
                          className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 cursor-pointer"
                          title="Edit Department"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() =>
                            handleRemoveDepartment(faculty._id, dept._id)
                          }
                          className="p-2 bg-red-500 text-white rounded hover:bg-red-600 cursor-pointer"
                          title="Remove Department"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                    {expandedDepartment === dept._id && (
                      <ul className="pl-4 pb-2">
                        {dept.staff && dept.staff.length > 0 ? (
                          <>
                            {[...dept.staff]
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((staffMember) => (
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
                                    className={`p-2 rounded hover:bg-opacity-80 cursor-pointer ${
                                      staffMember.privileges
                                        ? "bg-red-500 text-white"
                                        : "bg-teal-500 text-white"
                                    }`}
                                    title={
                                      staffMember.privileges
                                        ? "Unassign Privileges"
                                        : "Assign Privileges"
                                    }
                                  >
                                    {staffMember.privileges ? (
                                      <FaUserSlash />
                                    ) : (
                                      <FaUserCog />
                                    )}
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
                    addFaculty(newFacultyName);
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

            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"></div>
              <input
                type="text"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5"
                placeholder="Search staff members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="max-h-60 overflow-y-auto">
              <ul className="space-y-2">
                {filteredStaff.map((staffMember) => (
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
              {filteredStaff.length === 0 && (
                <p className="text-gray-500 text-center py-2">
                  No staff members found
                </p>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => {
                  setShowPrivilegesModal(false);
                  setSearchTerm("");
                }}
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
      {showEditFacultyModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-2xl font-bold mb-4">Edit Faculty</h2>
            <input
              type="text"
              value={editFacultyName}
              onChange={(e) => setEditFacultyName(e.target.value)}
              placeholder="Faculty Name"
              className="p-2 border border-gray-300 rounded w-full mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setShowEditFacultyModal(false)}
                className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editFacultyName.trim()) {
                    editFaculty(editFacultyId, editFacultyName);
                  } else {
                    toast.error("Faculty name cannot be empty");
                  }
                }}
                className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditDepartmentModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/3">
            <h2 className="text-2xl font-bold mb-4">Edit Department</h2>
            <input
              type="text"
              value={editDepartmentName}
              onChange={(e) => setEditDepartmentName(e.target.value)}
              placeholder="Department Name"
              className="p-2 border border-gray-300 rounded w-full mb-4"
            />
            <div className="flex justify-end">
              <button
                onClick={() => setShowEditDepartmentModal(false)}
                className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer mr-2"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editDepartmentName.trim()) {
                    editDepartment(
                      editDepartmentFacultyId,
                      editDepartmentId,
                      editDepartmentName
                    );
                  } else {
                    toast.error("Department name cannot be empty");
                  }
                }}
                className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
              >
                Save
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
              Are you sure you want to remove this {removalType}? This action
              cannot be undone.
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
};

export default Faculties;
