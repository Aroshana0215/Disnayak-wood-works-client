import React, { useState } from "react";
import { ImportCubicValuesJSON } from "../../services/ImportCategoriesJSON";

const ImportCubicValues = () => {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleImport = async () => {
    if (!file) return alert("Please select a JSON file");

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      setStatus("Uploading...");
      const count = await ImportCubicValuesJSON(jsonData);
      setStatus(`Upload complete! ${count} records added.`);
    } catch (error) {
      console.error("Import Error:", error);
      setStatus("Error: " + error.message);
    }
  };

  return (
    <div>
      <h2>Import Cubic Values from JSON</h2>
      <input type="file" accept=".json" onChange={handleFileChange} />
      <button onClick={handleImport}>Upload</button>
      <p>{status}</p>
    </div>
  );
};

export default ImportCubicValues;
