import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Styles/HomePage.css';

import CardItem from '../otherComponents/CardItem';
import CardData from '../otherComponents/CardData';


import pdfSlide1 from '../assets/pdf-2.png';
import pdfSlide2 from '../assets/pdf-1.jpg';
import imgToolkitBanner from '../assets/image-tkit.jpg';
import multimediaBanner from '../assets/mm-banner.png';
import aiGeneratorBanner from '../assets/ai-question-gen.png';

const conversionTypes = ["PDF", "DOCX", "PPTX", "EXCEL", "JPG", "PNG", "AI QA Generator", "OCR", "COMPRESS", "MERGE", "SPLIT", "WATERMARK", "SIGN"];


const pdfsliderImages = [pdfSlide1, pdfSlide2];

const HomePage = () => {
  const [currentConversion, setCurrentConversion] = useState(conversionTypes[0]);
  const [fade, setFade] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setFade(true);
      setTimeout(() => {
        setCurrentConversion(prev => {
          const index = conversionTypes.indexOf(prev);
          return conversionTypes[(index + 1) % conversionTypes.length];
        });
        setFade(false);
      }, 500);
    }, 3000);
    return () => clearInterval(textInterval);
  }, []);

  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide(prevSlide => (prevSlide + 1) % pdfsliderImages.length);
    }, 5000);
    return () => clearInterval(slideInterval);
  }, []);

  return (
    <div className="home-page container">
      <header className="text-center mt-5">
        <div className="display-6">From PDFs to Everything – Instantly</div>
        <p className="lead">
          Transform your documents to{" "}
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
      <div className="feature-section pdf-section">
        <div className="feature-content-column">
          <div className="feature-card">
            <h4>Your Complete PDF Toolkit</h4>
            <p>
              Beyond simple conversions, unlock a full suite of tools to manage your documents. Merge, split, compress, or sign PDFs with ease. Everything you need to master your workflow is right here.
            </p>
            <a href="/other-pdf-tools" className="feature-btn">
              See All PDF Tools
            </a>
          </div>
        </div>
        <div className="feature-media-container">
          {pdfsliderImages.map((src, index) => (
            <img
              key={index}
              src={src} 
              alt={`PDF Tool Slide ${index + 1}`}
              className={`pdf-slide ${index === currentSlide ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>

      <br /><br />

      <div className="feature-section image-ops-section">
        <div className="feature-media-container">
          <img
            src={imgToolkitBanner} 
            alt="Image Operations"
          />
        </div>
        <div className="feature-content-column">
          <h3 className="feature-heading text-center">Image Op's</h3>
          <div className="feature-card">
            <h4>Optimize Your Images</h4>
            <p>
              Effortlessly convert, resize, and compress your images. Our tools help you manage image files for web, print, or storage with just a few clicks.
            </p>
            <a href="/other-img-tools" className="feature-btn">
              See All Image Tools
            </a>
          </div>
        </div>
      </div>
      
      <br/>

      <div className="feature-section ai-section">
        <div className="feature-content-column">
          <h3 className="feature-heading">Work With AI</h3>
          <div className="feature-card">
            <i className="fas fa-robot" style={{ fontSize: "2rem", color: "#673AB7", marginBottom: "1rem", display: "block" }}></i>
            <h4>AI Question Generator</h4>
            <p>
              Generate Questions with AI. Create questions from PDFs using AI instantly. This powerful tool helps you quickly build quizzes, study guides, and more from your existing documents.
            </p>
            <a href="/ai-question-generator" className="feature-btn">
              Click to Generate
            </a>
          </div>
        </div>
        <div className="feature-media-container">
          <img
            src={aiGeneratorBanner} 
            alt="AI illustrations"
          />
        </div>
      </div>

      <br /><br /><br /><br />

      <div className="feature-section multimedia-section">
        <div className="feature-media-container">
          <img
            src={multimediaBanner} 
            alt="Multimedia Tools"
          />
        </div>
        <div className="feature-content-column">
          <h3 className="feature-heading text-center">Multimedia Tools</h3>
          <div className="feature-card">
            <h4>Your Multimedia Toolkit</h4>
            <p>
              Convert, edit, and create with our suite of powerful multimedia tools. Handle audio and video files with ease for any project.
            </p>
            <a href="/multimedia-tools" className="feature-btn">
              See All Multimedia Tools
            </a>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HomePage;