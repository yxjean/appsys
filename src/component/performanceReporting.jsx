import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const PerformanceReporting = ({ staffId, reportData: initialReportData }) => {
  const [reportData, setReportData] = useState(initialReportData || null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetchReportDataForLoggedInUser();
    fetchCategories();
  }, [staffId, initialReportData]);

  const fetchReportDataForLoggedInUser = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        "http://localhost:4000/api/performance-report",
        { withCredentials: true }
      );
      if (data.success) {
        setReportData(data.reportData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const getFilteredEntries = () => {
    if (!reportData) return [];
    if (selectedCategory === "All") return reportData.publications;

    return reportData.publications.filter(
      (entry) => entry.area === selectedCategory
    );
  };

  const calculateCategoryProgress = (category) => {
    if (!reportData || !category) return { count: 0, total: 50 };

    const matchedCount = reportData.publications.filter(
      (entry) => entry.area === category.name
    ).length;

    return { count: matchedCount, total: 50 };
  };

  const calculateCategoryCounts = () => {
    if (!categories || !reportData) return [];

    return categories.map((category) => {
      const count = reportData.publications.filter(
        (entry) => entry.area === category.name
      ).length;
      return { category: category.name, count };
    });
  };

  const getChartData = () => {
    const categoryCounts = calculateCategoryCounts();

    return {
      labels: categoryCounts.map((item) => item.category),
      datasets: [
        {
          label: "Number of Entries",
          data: categoryCounts.map((item) => item.count),
          backgroundColor: "#4caf50",
        },
      ],
    };
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen mt-10">
      <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
        Academic Staff Performance Report
      </h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading report...</p>
      ) : reportData ? (
        <div className="space-y-6">
          {/* Publications Summary */}
          <section className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold mb-4 text-gray-700">
              Publications Summary
            </h3>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">
                <strong>Total Entries:</strong> {getFilteredEntries().length}
              </p>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="py-2 px-4 bg-gray-200 text-gray-700 rounded"
              >
                <option value="All">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <table className="w-full mt-4 border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-2 text-left">Title</th>
                  <th className="border p-2 text-left">Area</th>
                  <th className="border p-2 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredEntries().map((entry, index) => (
                  <tr key={index} className="border">
                    <td className="border p-2">{entry.title}</td>
                    <td className="border p-2">{entry.area}</td>
                    <td className="border p-2">
                      {new Date(entry.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* Area Progress - Modified to show counts instead of percentages */}
          <section className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold mb-4 text-gray-700">
              Area Progress
            </h3>
            {categories.map((category) => {
              const { count, total } = calculateCategoryProgress(category);
              const progressWidth = Math.min((count / total) * 100, 100); // Cap at 100%

              return (
                <div key={category._id} className="mb-6">
                  <div className="flex justify-between mb-2">
                    <h4 className="text-xl font-semibold text-gray-700">
                      {category.name}
                    </h4>
                    <span className="font-bold text-gray-700">
                      {count} / 50 entries
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-6 relative">
                    <div
                      className={`${
                        count >= 50 ? "bg-green-500" : "bg-teal-500"
                      } h-6 rounded-full transition-all duration-500`}
                      style={{
                        width: `${progressWidth}%`,
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Overall Performance Summary */}
          <section className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold mb-4 text-gray-700">
              Overall Performance Summary
            </h3>
            <Bar data={getChartData()} />
          </section>
        </div>
      ) : (
        <p className="text-center text-gray-500">No report data available.</p>
      )}
    </div>
  );
};

export default PerformanceReporting;
