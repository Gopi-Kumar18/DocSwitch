import React, { useState } from 'react';

const FileUpload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    // For image preview
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }

    // Simulated upload logic
    alert(`Uploading: ${selectedFile.name}`);
    console.log('Uploading file:', selectedFile);
    // You can integrate with backend/API here
  };

  const handleDelete = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="max-w-md mx-auto p-4 border rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Upload a File</h2>

      <input type="file" onChange={handleFileChange} className="mb-3" />

      {previewUrl && (
        <div className="mb-3">
          <img src={previewUrl} alt="Preview" className="w-full h-auto rounded" />
        </div>
      )}

      {selectedFile && (
        <div className="text-sm mb-3">
          <strong>Selected:</strong> {selectedFile.name}
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={handleUpload}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Upload
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default FileUpload;
