import React from "react";
import CardItem from "../otherComponents/CardItem"; 
import CardData  from "../otherComponents/CardData"; 

const OtherPdfTools = () => {

  return (
    <>
    <br />
    <div className="container my-5">
      <h2 className="text-center mb-4">Anything To PDF</h2>
      <div className="row justify-content-center">
        {CardData.slice(8,10).map((card, index) => (
          <CardItem key={index} {...card} />
        ))}
      </div>
    </div>
    </>

  );
};

export default OtherPdfTools;
