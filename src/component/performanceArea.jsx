import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Publication from "./categories/Publication";
import PostgraduateSupervision from "./categories/PostgraduateSupervision";
import TeachingUndergraduateSupervision from "./categories/TeachingUndergraduateSupervision";
import VASI from "./categories/VASI";
import AdministrativeService from "./categories/AdministrativeService";
import Consultancy from "./categories/Consultancy";
import Research from "./categories/Research";

const PerformanceArea = () => {
  const [entries, setEntries] = useState([]);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [categoryProgress, setCategoryProgress] = useState(0);

  useEffect(() => {
    fetchCategories();
    fetchEntries();
  }, []);

  useEffect(() => {
    filterEntries();
    calculateCategoryProgress();
  }, [entries, selectedCategory, categories]);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/performance-categories",
        { withCredentials: true }
      );
      if (data.success) {
        setCategories(data.categories);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const fetchEntries = async () => {
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/performance-entries",
        { withCredentials: true }
      );
      if (data.success) {
        setEntries(data.entries);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filterEntries = () => {
    if (selectedCategory === "") {
      setFilteredEntries(entries); // Show all entries when no category is selected
    } else {
      setFilteredEntries(
        entries.filter((entry) => entry.area === selectedCategory)
      );
    }
  };

  const calculateCategoryProgress = () => {
    if (!selectedCategory) {
      setCategoryProgress(0);
      return;
    }

    const category = categories.find((cat) => cat.name === selectedCategory);
    if (!category) {
      setCategoryProgress(0);
      return;
    }

    const matchedEntries = entries.filter(
      (entry) => entry.area === category.name
    ).length;
    const progress =
      category.quantity > 0 ? (matchedEntries / category.quantity) * 100 : 0;

    setCategoryProgress(Math.min(progress, 100)); // Ensure progress does not exceed 100%
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleEntryAdded = () => {
    fetchEntries(); // Refresh entries after a new entry is added
    setShowEntryModal(false); // Close the modal
  };

  const renderForm = () => {
    switch (selectedCategory) {
      case "Publication":
        return <Publication onEntryAdded={handleEntryAdded} />;
      case "Postgraduate Supervision":
        return <PostgraduateSupervision onEntryAdded={handleEntryAdded} />;
      case "Teaching & Undergraduate Supervision":
        return (
          <TeachingUndergraduateSupervision onEntryAdded={handleEntryAdded} />
        );
      case "VASI":
        return <VASI onEntryAdded={handleEntryAdded} />;
      case "Administrative Service":
        return <AdministrativeService onEntryAdded={handleEntryAdded} />;
      case "Consultancy":
        return <Consultancy onEntryAdded={handleEntryAdded} />;
      case "Research":
        return <Research onEntryAdded={handleEntryAdded} />;
      default:
        return null;
    }
  };

  const formatDetails = (details) => {
    try {
      const parsedDetails = JSON.parse(details);
      return (
        <ul className="list-disc pl-5 space-y-1">
          {Object.entries(parsedDetails).map(([key, value]) => (
            <li key={key}>
              <strong className="capitalize">
                {key.replace(/([A-Z])/g, " $1")}:
              </strong>{" "}
              {typeof value === "object" ? (
                <ul className="list-disc pl-5">
                  {Object.entries(value).map(([subKey, subValue]) => (
                    <li key={subKey}>
                      <strong className="capitalize">
                        {subKey.replace(/([A-Z])/g, " $1")}:
                      </strong>{" "}
                      {subValue}
                    </li>
                  ))}
                </ul>
              ) : (
                value
              )}
            </li>
          ))}
        </ul>
      );
    } catch (error) {
      return <p>{details}</p>; // Fallback for non-JSON details
    }
  };

  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Performance Area Management</h2>
        <div className="flex items-center">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="py-2 px-4 bg-gray-200 text-gray-700 rounded mr-2"
          >
            <option value="">Select Area</option>
            {categories.map((category) => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowEntryModal(true)}
            className="py-2 px-4 bg-teal-500 text-white rounded hover:bg-teal-600 cursor-pointer"
            disabled={!selectedCategory}
          >
            Add Entry
          </button>
        </div>
      </div>
      {selectedCategory && (
        <div className="w-full bg-gray-200 rounded-full h-4 mb-4 relative">
          <div
            className={`${
              categoryProgress === 100 ? "bg-green-500" : "bg-teal-500"
            } h-4 rounded-full`}
            style={{ width: `${categoryProgress}%` }}
          ></div>
          <span className="absolute inset-0 flex items-center justify-center text-black font-bold">
            {categoryProgress.toFixed(2)}%
          </span>
        </div>
      )}
      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <div
            key={entry._id}
            className="border border-gray-300 rounded p-4 flex flex-col space-y-2"
          >
            <h3 className="text-xl font-bold">{entry.title}</h3>
            <p>
              <strong>Area:</strong> {entry.area}
            </p>
            <div>
              <strong>Details:</strong>
              <div className="bg-gray-100 p-3 rounded mt-2">
                {formatDetails(entry.details)}
              </div>
            </div>
          </div>
        ))}
      </div>
      {showEntryModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg w-1/2 overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 ">Add New Entry</h2>
            {renderForm()}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowEntryModal(false)}
                className="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceArea;
