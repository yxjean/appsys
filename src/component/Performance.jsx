import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const PerformanceManager = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

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

  const updateCategoryQuantity = async (id, quantity) => {
    try {
      const { data } = await axios.put(
        `http://localhost:4000/api/performance-categories/${id}`,
        { quantity },
        { withCredentials: true }
      );
      if (data.success) {
        setCategories(
          categories.map((category) =>
            category._id === id ? data.category : category
          )
        );
        toast.success("Category total quantity updated");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleQuantityChange = (id, value) => {
    const quantity = parseInt(value, 10);
    if (!isNaN(quantity)) {
      updateCategoryQuantity(id, quantity);
    }
  };

  return (
    <div className="w-full p-4">
      <h2 className="text-2xl font-bold mb-4">Performance Area Management</h2>
      <div className="space-y-4">
        {categories.map((category) => (
          <div
            key={category._id}
            className="border border-gray-300 rounded p-4 flex justify-between items-center"
          >
            <span className="font-bold">{category.name}</span>
            <div className="flex items-center border border-gray-300 rounded px-2">
              <input
                type="number"
                value={category.quantity}
                onChange={(e) =>
                  handleQuantityChange(category._id, e.target.value)
                }
                className="p-2 w-16 border-none focus:outline-none"
              />
              <span className="text-gray-600">%</span>
            </div>
              
          </div>
        ))}
      </div>
    </div>
  );
};

export default PerformanceManager;
