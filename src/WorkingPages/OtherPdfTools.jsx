import React from "react";
import CardItem from "../otherComponents/CardItem"; 
import CardData  from "../otherComponents/CardData"; 

const OtherPdfTools = () => {

  return (
    <>
    <br />
    <div className="container my-5">
      <h1 className="text-center mb-4">All PDF Tools</h1>
      <h5 className="text-center">Utilize our powerful tools to edit, convert, and organize PDFs with ease and speed.</h5>

      <br />

      <div className="row justify-content-center">
        {CardData.slice(8,11).map((card, index) => (
          <CardItem key={index} {...card} />
        ))}
      </div>
    </div>
    </>

  );
};

export default OtherPdfTools;
