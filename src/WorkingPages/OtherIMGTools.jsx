import React from "react";
import CardItem from "../otherComponents/CardItem"; 
import CardData  from "../otherComponents/CardData"; 

const OtherJpgTools = () => {

  return (
    <>
    <br />
    <div className="container my-5">
      <h1 className="text-center mb-4">All various formats Of Image Conversion's</h1>
      <h5 className="text-center">Utilize our powerful tools to convert, organize, and work with Image's efficiently and effortlessly.</h5>

      <br />

      <div className="row justify-content-center">
        {CardData.slice(16,18).map((card, index) => (
          <CardItem key={index} {...card} />
        ))}
      </div>

      <div className="row justify-content-center">
         {CardData.slice(18,21).map((card, index) => (
          <CardItem key={index} {...card} />
        ))}
      </div>

    </div>
    </>

  );
};

export default OtherJpgTools;
