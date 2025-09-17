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
  const [ totalAmount, setTotalAmt ] = useState("");
  const [ individualAmount, setIndividualAmt ] = useState("");
  const [ memberName, setMemberName ] = useState("");
  const [ letterFile, setLetterFile ] = useState(null);
  const [ slipFile, setSlipFile ] = useState(null);

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
          startDate,
          endDate,
          totalAmount,
          individualAmount,
          memberName,
        })
      );
      formData.append("letterFile", letterFile);
      formData.append("slipFile", slipFile);

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
        {/*<div>
          <label className="block font-bold mb-2">Client/Organization</label>
          <input
            type="text"
            value={client}
            onChange={(e) => setClient(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>*/}
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
        {/*<div>
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
        <div className="mb-4">
          <label className="block font-bold mb-2">Upload File</label>
          <div className="relative">
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-base text-gray-700
                         file:mr-4 file:py-2 file:px-4
                         file:rounded file:border-0
                         file:text-base file:font-semibold
                         file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100
                         border border-gray-300 rounded"
            />
          </div>
        </div>*/}
        <div>
          <label className="block font-bold mb-2">Total Amount (RM)</label>
          <input
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmt(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block font-bold mb-2">Individual Amount (RM)</label>
          <input
            type="number"
            value={individualAmount}
            onChange={(e) => setIndividualAmt(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>
        <div>
          <label className="block font-bold mb-2">Member (name)</label>
          <input
            type="text"
            value={memberName}
            onChange={(e) => setMemberName(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block font-bold mb-2">Upload Letter</label>
          <div className="relative">
            <input
              type="file"
              onChange={ev=> setLetterFile(ev.target.files[0]) }
              className="block w-full text-base text-gray-700
                         file:mr-4 file:py-2 file:px-4
                         file:rounded file:border-0
                         file:text-base file:font-semibold
                         file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100
                         border border-gray-300 rounded"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-bold mb-2">Upload Slip</label>
          <div className="relative">
            <input
              type="file"
              onChange={ev=>setSlipFile(ev.target.files[0])}
              className="block w-full text-base text-gray-700
                         file:mr-4 file:py-2 file:px-4
                         file:rounded file:border-0
                         file:text-base file:font-semibold
                         file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100
                         border border-gray-300 rounded"
            />
          </div>
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
