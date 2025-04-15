import React, { useState } from "react";
import axios from "axios";

const Consultancy = ({ onEntryAdded = () => {} }) => {
  const [projectTitle, setProjectTitle] = useState("");
  const [client, setClient] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [role, setRole] = useState("");
  const [projectScope, setProjectScope] = useState("");
  const [fundingAmount, setFundingAmount] = useState("");
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", "Consultancy Entry");
      formData.append("area", "Consultancy");
      formData.append(
        "details",
        JSON.stringify({
          projectTitle,
          client,
          startDate,
          endDate,
          role,
          projectScope,
          fundingAmount,
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
      console.error("Error submitting consultancy entry:", error);
    }
  };

  return (
    <div className="border border-gray-300 rounded p-4 max-h-[80vh] overflow-y-auto">
      <h1 className="font-bold mb-4">Consultancy</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-bold mb-2">Project Title</label>
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block font-bold mb-2">Client/Organization</label>
          <input
            type="text"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block font-bold mb-2">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block font-bold mb-2">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block font-bold mb-2">Role</label>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block font-bold mb-2">
            Project Scope/Description
          </label>
          <textarea
            value={projectScope}
            onChange={(e) => setProjectScope(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
            rows="4"
            required
          ></textarea>
        </div>
        <div>
          <label className="block font-bold mb-2">Funding Amount (RM)</label>
          <input
            type="number"
            value={fundingAmount}
            onChange={(e) => setFundingAmount(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block font-bold mb-2">Upload File</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="p-2 border border-gray-300 rounded w-full"
          />
        </div>
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

export default Consultancy;
