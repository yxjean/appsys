import React, { useState } from "react";
import axios from "axios";

const Research = ({ onEntryAdded = () => {} }) => {
  const [researchTitle, setResearchTitle] = useState("");
  const [researchCategory, setResearchCategory] = useState("Funded Research");
  const [fundingAgency, setFundingAgency] = useState("");
  const [fundingAmount, setFundingAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [researchField, setResearchField] = useState("");
  const [role, setRole] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [researchOutput, setResearchOutput] = useState("");
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", "Research Entry");
      formData.append("area", "Research");
      formData.append(
        "details",
        JSON.stringify({
          researchTitle,
          researchCategory,
          fundingAgency,
          fundingAmount,
          startDate,
          endDate,
          researchField,
          role,
          projectDescription,
          researchOutput,
        })
      );
      formData.append("document", file);

      const { data } = await axios.post(
        "http://localhost:4000/api/performance-entries",
        formData,
        { withCredentials: true }
      );

      if (data.success) {
        onEntryAdded();
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error submitting research entry:", error);
    }
  };

  return (
    <div className="mt-[50px] border border-gray-300 rounded p-4 max-h-[80vh] overflow-y-auto">
      <h1 className="font-bold mb-4">Research</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-bold mb-2">Research Title</label>
          <input
            type="text"
            value={researchTitle}
            onChange={(e) => setResearchTitle(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block font-bold mb-2">Research Category</label>
          <select
            value={researchCategory}
            onChange={(e) => setResearchCategory(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
          >
            <option value="Funded Research">Funded Research</option>
            <option value="Non-Funded Research">Non-Funded Research</option>
          </select>
        </div>
        <div>
          <label className="block font-bold mb-2">Funding Agency</label>
          <input
            type="text"
            value={fundingAgency}
            onChange={(e) => setFundingAgency(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
          />
        </div>
        <div>
          <label className="block font-bold mb-2">Funding Amount (RM)</label>
          <input
            type="number"
            value={fundingAmount}
            onChange={(e) => setFundingAmount(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
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
          <label className="block font-bold mb-2">Research Field</label>
          <input
            type="text"
            value={researchField}
            onChange={(e) => setResearchField(e.target.value)}
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
          <label className="block font-bold mb-2">Project Description</label>
          <textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
            rows="4"
            required
          ></textarea>
        </div>
        <div>
          <label className="block font-bold mb-2">Research Output</label>
          <textarea
            value={researchOutput}
            onChange={(e) => setResearchOutput(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
            rows="4"
          ></textarea>
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

export default Research;
