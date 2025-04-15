import React, { useState } from "react";
import axios from "axios";

const AdministrativeService = ({ onEntryAdded }) => {
  const [category, setCategory] = useState("University");
  const [group, setGroup] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", "Administrative Service Entry");
      formData.append("area", "Administrative Service");
      formData.append("details", JSON.stringify({ category, group }));

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
      console.error("Error submitting administrative service entry:", error);
    }
  };

  return (
    <div className="border border-gray-300 rounded p-4">
      <h1 className="font-bold mb-4">Administrative Service</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Category Dropdown */}
        <div>
          <label className="block font-bold mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
          >
            <option value="University">University</option>
            <option value="Faculty">Faculty</option>
          </select>
        </div>

        {/* Group Input */}
        <div>
          <label className="block font-bold mb-2">Group</label>
          <input
            type="text"
            value={group}
            onChange={(e) => setGroup(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
            placeholder="Enter group name"
            required
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

export default AdministrativeService;
