
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import '../Styles/HomePage.css'; 

import CardItem from '../otherComponents/CardItem'; 
import CardData from '../otherComponents/CardData'

const conversionTypes = ["DOCX", "PDF", "PPTX", "JPG", "PNG"];

const HomePage = () => {
  const [currentConversion, setCurrentConversion] = useState(conversionTypes[0]);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setCurrentConversion(prev => {
          const index = conversionTypes.indexOf(prev);
          return conversionTypes[(index + 1) % conversionTypes.length];
        });
        setFade(false);
      }, 500);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-page container">
      <header className="text-center mt-5">
        <div className="display-6">From PDFs to Everything – Instantly</div>
        <p className="lead">
          Transform your documents to {" "}
          <span className={`conversion-text ${fade ? 'fade-out' : 'fade-in'}`}>{currentConversion}</span>{" "}
          effortlessly. All tools are FREE and user-friendly!
        </p>
      </header>

      <div className="row justify-content-center mt-4">
        {CardData.slice(0, 6).map((card, index) => (
          <CardItem key={index} {...card} />
        ))}
      </div>

      <br /><br />
      <h3 className="text-center">Our other frequently used PDF conversions</h3>
      <br />

      <div className="row justify-content-center">
        {CardData.slice(6, 8).map((card, index) => (
          <CardItem key={index} {...card} />
        ))}

         <div className="text-center mt-1"> 
           <a href="/other-pdf-tools" className="btn btn-primary fw-bold other-tools-btn-custom">
             See All PDF Tools
           </a>
         </div>

      </div>

      <br /><br />
      <h3 className="text-center">Anything To PDF</h3>
      <br />

    </div>
  );
};

export default HomePage;



