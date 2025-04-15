import React, { useState } from "react";
import axios from "axios";

const PostgraduateSupervision = ({ onEntryAdded = () => {} }) => {
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [faculty, setFaculty] = useState("");
  const [email, setEmail] = useState("");
  const [enrollmentDate, setEnrollmentDate] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", "Postgraduate Supervision Entry");
      formData.append("area", "Postgraduate Supervision");
      formData.append(
        "details",
        JSON.stringify({
          name,
          studentId,
          faculty,
          email,
          enrollmentDate,
          completionDate,
        })
      );
      formData.append("document", file);

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
      console.error("Error submitting postgraduate supervision:", error);
    }
  };

  return (
    <div className="border border-gray-300 rounded p-4 max-h-[80vh] overflow-y-auto ">
      <h1 className="font-bold mb-4">Postgraduate Supervision</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="block font-bold mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>

        {/* Student ID */}
        <div>
          <label className="block font-bold mb-2">Student ID</label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>

        {/* Faculty */}
        <div>
          <label className="block font-bold mb-2">Faculty</label>
          <input
            type="text"
            value={faculty}
            onChange={(e) => setFaculty(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block font-bold mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>

        {/* Enrollment/Registration Date */}
        <div>
          <label className="block font-bold mb-2">Enrollment Date</label>
          <input
            type="date"
            value={enrollmentDate}
            onChange={(e) => setEnrollmentDate(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>

        {/* Expected Completion Date */}
        <div>
          <label className="block font-bold mb-2">
            Expected Completion Date
          </label>
          <input
            type="date"
            value={completionDate}
            onChange={(e) => setCompletionDate(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>

        {/* Upload File */}
        <div>
          <label className="block font-bold mb-2">Upload File</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="p-2 border border-gray-300 rounded w-full"
          />
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostgraduateSupervision;
