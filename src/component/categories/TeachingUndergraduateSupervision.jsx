import React, { useState } from "react";
import axios from "axios";

const TeachingUndergraduateSupervision = ({ onEntryAdded = () => {} }) => {
  const [selectedForm, setSelectedForm] = useState("Teaching"); // Dropdown state

  // Teaching Section State
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [studentEvaluationRating, setStudentEvaluationRating] = useState("");
  const [semester, setSemester] = useState("");
  const [teachingHour, setTeachingHour] = useState("");

  // Undergraduate Supervision Section State
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [degreeProgram, setDegreeProgram] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectStatus, setProjectStatus] = useState("Ongoing");
  const [projectType, setProjectType] = useState("Research-based");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      // Include the specific area (Teaching or Undergraduate Supervision) in the title
      formData.append("title", `${selectedForm} Entry`);
      formData.append("area", "Teaching & Undergraduate Supervision");
      formData.append(
        "details",
        JSON.stringify({
          teaching:
            selectedForm === "Teaching"
              ? {
                  courseName,
                  courseCode,
                  studentEvaluationRating,
                  semester,
                  teachingHour,
                }
              : null,
          undergraduateSupervision:
            selectedForm === "Undergraduate Supervision"
              ? {
                  studentName,
                  studentId,
                  degreeProgram,
                  projectTitle,
                  projectStatus,
                  projectType,
                }
              : null,
        })
      );

      const { data } = await axios.post(
        "http://localhost:4000/api/performance-entries",
        formData,
        { withCredentials: true }
      );

      if (data.success) {
        onEntryAdded(); // Notify parent to refresh entries
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error(
        "Error submitting teaching and undergraduate supervision:",
        error
      );
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md max-h-[80vh] overflow-y-auto ">
      {/* Add margin-top (mt-6) to move the form down */}
      <h1 className="text-2xl font-bold text-teal-700 mb-6">
        Teaching and Undergraduate Supervision
      </h1>

      {/* Dropdown to select form */}
      <div className="mb-6">
        <label className="block font-semibold text-gray-700 mb-2">
          Select Form
        </label>
        <select
          value={selectedForm}
          onChange={(e) => setSelectedForm(e.target.value)}
          className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="Teaching">Teaching</option>
          <option value="Undergraduate Supervision">
            Undergraduate Supervision
          </option>
        </select>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {selectedForm === "Teaching" && (
          <div>
            <h2 className="text-xl font-semibold text-teal-600 mb-4">
              Teaching Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Course Name
                </label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Course Code
                </label>
                <input
                  type="text"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Student Evaluation Rating
                </label>
                <input
                  type="number"
                  value={studentEvaluationRating}
                  onChange={(e) => setStudentEvaluationRating(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Semester
                </label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Teaching Hour
                </label>
                <input
                  type="number"
                  value={teachingHour}
                  onChange={(e) => setTeachingHour(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {selectedForm === "Undergraduate Supervision" && (
          <div>
            <h2 className="text-xl font-semibold text-teal-600 mb-4">
              Undergraduate Supervision Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Student Name
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Student ID
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Degree Program
                </label>
                <input
                  type="text"
                  value={degreeProgram}
                  onChange={(e) => setDegreeProgram(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Project Title
                </label>
                <input
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                />
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Project Status
                </label>
                <select
                  value={projectStatus}
                  onChange={(e) => setProjectStatus(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block font-medium text-gray-700 mb-2">
                  Project Type
                </label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
                  required
                >
                  <option value="Research-based">Research-based</option>
                  <option value="Development-based">Development-based</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="text-right">
          <button
            type="submit"
            className="py-3 px-6 bg-teal-500 text-white rounded-lg hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default TeachingUndergraduateSupervision;
