import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import axios from "axios";

pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdfjs/pdf.worker.min.mjs";


const Publication = ({ onEntryAdded }) => {
  const [type, setType] = useState("Journal");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [publishedDate, setPublishedDate] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState(null);

  const handleTypeChange = (e) => {
    setType(e.target.value);
    setCategory(""); // Reset category when type changes
  };

  const handleFileChange = async (ev) => {
    const file = ev.target.files[0];
    if (!file) return;

    setFile(file);

    const fileReader = new FileReader();
    fileReader.onload = async function () {
      const typedArray = new Uint8Array(this.result);
      const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;

      // Try metadata first
      const metadata = await pdf.getMetadata();
      const metaTitle = metadata?.info?.Title;
      if (metaTitle) {
        setTitle(metaTitle);
        return;
      }

      // Fallback to first text on first page
      const page = await pdf.getPage(1);
      const content = await page.getTextContent();
      const text = content.items.map((item) => item.str).filter(Boolean);
      setTitle(text[0] || 'No title found');
    };

    fileReader.readAsArrayBuffer(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("area", "Publication");
      formData.append(
        "details",
        JSON.stringify({ type, author, publishedDate, category })
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
      console.error("Error submitting publication:", error);
    }
  };

  return (
    <div className="border border-gray-300 rounded p-4 overflow-y-auto">
      <h1 className="font-bold mb-4">Publication</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type of Publication */}
        <div>
          <label className="block font-bold mb-2">Type of Publication</label>
          <select
            value={type}
            onChange={handleTypeChange}
            className="p-2 border border-gray-300 rounded w-full"
          >
            <option value="Journal">Journal</option>
            <option value="Conference">Conference</option>
            <option value="Book Chapter">Book Chapter</option>
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="block font-bold mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>

        {/* Author */}
        <div>
          <label className="block font-bold mb-2">Author</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
            required
          />
        </div>

        {/* Published Date */}
        <div>
          <label className="block font-bold mb-2">
            Published Date (Optional)
          </label>
          <input
            type="date"
            value={publishedDate}
            onChange={(e) => setPublishedDate(e.target.value)}
            className="p-2 border border-gray-300 rounded w-full"
          />
        </div>

        {/* Category */}
        {type !== "Book Chapter" && (
          <div>
            <label className="block font-bold mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-2 border border-gray-300 rounded w-full"
              required
            >
              <option value="">Select Category</option>
              {type === "Journal" && (
                <>
                  <option value="WOS">WOS</option>
                  <option value="Scopus">Scopus</option>
                  <option value="Other">Other</option>
                </>
              )}
              {type === "Conference" && (
                <>
                  <option value="WOS">WOS</option>
                  <option value="Scopus">Scopus</option>
                </>
              )}
            </select>
          </div>
        )}

        {/* Upload File */}
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

export default Publication;
