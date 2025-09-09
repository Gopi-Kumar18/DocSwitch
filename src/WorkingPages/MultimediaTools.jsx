import React, {useState, useEffect}from "react";
import CardItem from "../otherComponents/CardItem"; 
import CardData  from "../otherComponents/CardData"; 

import '../Styles/OtherPdfTools.css';

const MultimediaTools = () => {

    const [currentSlide, setCurrentSlide] = useState(0); 
  
   const sliderImages = [
  "src/assets/mp4-banner.png",
  "src/assets/mp3-banner.png",
  "src/assets/mkv-banner.png",
  "src/assets/gif-banner.png",
];

 useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide(prevSlide => (prevSlide + 1) % sliderImages.length);
    }, 5000); 
    return () => clearInterval(slideInterval);
  }, []);


  return (
    <>
    <br />
    <div className="container my-5">
      <h1 className="text-center mb-4">All Multimedia Tools</h1>
      <h5 className="text-center">Utilize our powerful tools to edit, convert, and organize PDFs with ease and speed.</h5>

      <br />

      <div className="pdf-tools-section-container">
        {/* --- Image Slider --- */}
       <div className="pdf-slider-container" style={{ aspectRatio: 4 / 2.3 }}>
          {sliderImages.map((src, index) => (
            <img
              key={index}
              src={src}
              alt={`PDF Tool Slide ${index + 1}`}
              className={`pdf-slide ${index === currentSlide ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>
<br />
      <div className="row justify-content-center">
         {CardData.slice(23,27).map((card, index) => (
          <CardItem key={index} {...card} />
        ))}
      </div>

    </div>
    </>

  );
};

export default MultimediaTools;



