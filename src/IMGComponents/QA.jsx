import React from "react";

export default function ConversionQA({ title, steps }) {
  return (
    <div className="container mt-5 mb-5 text-center">
      <h4 className="mb-4">{title}</h4>
      <div className="d-flex justify-content-center">
        <ol
          className="list-group list-group-numbered text-start"
          style={{ maxWidth: "600px", width: "100%" }}
        >
          {steps.map((step, i) => (
            <li key={i} className="list-group-item">
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
