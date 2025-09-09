// import React from "react";
// import CardItem from "../otherComponents/CardItem"; 
// import CardData  from "../otherComponents/CardData"; 

// const OtherJpgTools = () => {

//   return (
//     <>
//     <br />
//     <div className="container my-5">
//       <h1 className="text-center mb-4">All various formats Of Image Conversion's</h1>
//       <h5 className="text-center">Utilize our powerful tools to convert, organize, and work with Image's efficiently and effortlessly.</h5>

//       <br />

//       <div className="row justify-content-center">
//         {CardData.slice(14,18).map((card, index) => (
//           <CardItem key={index} {...card} />
//         ))}
//       </div>

//       <div className="row justify-content-center">
//          {CardData.slice(18,21).map((card, index) => (
//           <CardItem key={index} {...card} />
//         ))}
//       </div>

//     </div>
//     </>

//   );
// };

// export default OtherJpgTools;





import React, { useState, useEffect } from "react";
import CardItem from "../otherComponents/CardItem"; 
import CardData  from "../otherComponents/CardData"; 

import '../Styles/OtherIMGTools.css';

const OtherJpgTools = () => {
    const [currentSlide, setCurrentSlide] = useState(0); 
 
    const sliderImages = [
      "src/assets/png-jpg-jpg-png.png",
      "src/assets/pdf-to-image.png",
      "src/assets/presentations-to-image.png",
      "src/assets/excel-to-image.png",
      "src/assets/bmp-to-image.png",
      "src/assets/word-to-image.png",
    ];

    useEffect(() => {
        const slideInterval = setInterval(() => {
          setCurrentSlide(prevSlide => (prevSlide + 1) % sliderImages.length);
        }, 3000); 
        return () => clearInterval(slideInterval);
    }, []);

  return (
    <>
    <br />
    <div className="container my-5">
      <h1 className="text-center mb-4">All various formats Of Image Conversion's</h1>
      <h5 className="text-center">Utilize our powerful tools to convert, organize, and work with Image's efficiently and effortlessly.</h5>

      <br />
      
      <div className="image-tools-section-container">
        <div className="image-slider-container" style={{ aspectRatio: '4 / 2.3' }}>
          {sliderImages.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`Image Tool Slide ${index + 1}`}
              className={`image-slide ${index === currentSlide ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>

      <br />

      <div className="row justify-content-center">
        {CardData.slice(14,18).map((card, index) => (
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
