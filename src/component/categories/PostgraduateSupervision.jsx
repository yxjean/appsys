import React, { useState, useEffect } from "react";
import axios from "axios";

const PostgraduateSupervision = ({ onEntryAdded = () => {} }) => {
  const [studentName, setStudentName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [faculty, setFaculty] = useState("");
  const [email, setEmail] = useState("");
  const [enrollmentDate, setEnrollmentDate] = useState("");
  const [expectedCompletionDate, setExpectedCompletionDate] = useState("");
  const [faculties, setFaculties] = useState([]);
  const [ programmeLevel, setProgrammeLevel ] = useState("");

  // Fetch faculties for dropdown
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:4000/api/faculties",
          {
            withCredentials: true,
          }
        );
        if (data.success) {
          setFaculties(data.faculties);
        }
      } catch (error) {
        console.error("Error fetching faculties:", error);
      }
    };

    fetchFaculties();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", "Postgraduate Supervision Entry");
      formData.append("area", "Postgraduate Supervision");
      formData.append(
        "details",
        JSON.stringify({
          studentName,
          studentId,
          faculty,
          email,
          enrollmentDate,
          expectedCompletionDate,
          programmeLevel
        })
      );

      const { data } = await axios.post(
        "http://localhost:4000/api/performance-entries",
        formData,
        { withCredentials: true }
      );

      if (data.success) {
        onEntryAdded(); // Notify parent to refresh entries

        // Reset form
        setStudentName("");
        setStudentId("");
        setFaculty("");
        setEmail("");
        setEnrollmentDate("");
        setExpectedCompletionDate("");
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error submitting postgraduate supervision entry:", error);
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md max-h-[80vh] overflow-y-auto">
      <h1 className="text-2xl font-bold text-teal-700 mb-6">
        Postgraduate Supervision
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
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
              Faculty
            </label>
            <select
              value={faculty}
              onChange={(e) => setFaculty(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="">Select Faculty</option>
              {faculties.map((fac) => (
                <option key={fac._id} value={fac.name}>
                  {fac.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Enrollment Date
            </label>
            <input
              type="date"
              value={enrollmentDate}
              onChange={(e) => setEnrollmentDate(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Expected Completion Date
            </label>
            <input
              type="date"
              value={expectedCompletionDate}
              onChange={(e) => setExpectedCompletionDate(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>
          <div>
            <label className="block font-medium text-gray-700 mb-2">
              Programme Level
            </label>
            <select
              value={programmeLevel}
              onChange={(e) => setProgrammeLevel(e.target.value)}
              className="p-3 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              required
            >
              <option value="">Select Level</option>
              <option value="Master">Master</option>
              <option value="PhD">PhD</option>
            </select>
          </div>
        </div>

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

export default PostgraduateSupervision;
