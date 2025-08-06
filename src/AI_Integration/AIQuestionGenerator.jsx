import React, { useState, useEffect } from 'react';
import DragDropFile from '../otherComponents/DragDropFile.jsx';
import '../Styles/Main-1.css';

const TypingEffect = ({ text, speed = 50 }) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    let index = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      setDisplayed((prev) => prev + text.charAt(index));
      index += 1;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6em' }}>{displayed}</p>;
};

const AIQuestionGenerator = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [showAnswers, setShowAnswers] = useState({});

  const maxFileSize = 10 * 1024 * 1024; 
  const allowedMimeTypes = ['application/pdf'];
  const allowedExtensions = ['.pdf'];

  const sanitizeFilename = (filename) => filename.replace(/[^a-zA-Z0-9-_.]/g, '');

  const toggleAnswer = (index) => {
    setShowAnswers((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  };

  const generateQuestions = async () => {
    if (!pdfFile) {
      setError('Please upload a PDF file first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setQuestions([]);

    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

      const reader = new FileReader();
      reader.readAsArrayBuffer(pdfFile);
      reader.onload = async (e) => {
        try {
          const pdfData = new Uint8Array(e.target.result);
          const pdf = await window.pdfjsLib.getDocument({
            data: pdfData,
            onPassword: (cb, reason) => {
              setError('This PDF is password protected.');
              setIsLoading(false);
            },
          }).promise;

          let text = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            text += content.items.map((item) => item.str).join(' ');
          }

          const prompt = `Based on the following text, generate ${numQuestions} questions with a difficulty level of ${difficulty}. For each question, provide a concise answer. Format as JSON array of objects with \"question\" and \"answer\" keys.\n\nText: ${text}`;
          const payload = {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    question: { type: 'STRING' },
                    answer: { type: 'STRING' },
                  },
                  required: ['question', 'answer'],
                },
              },
            },
          };
          const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            }
          );
          if (!res.ok) throw new Error(`API failure: ${res.status}`);

          const result = await res.json();
          const jsonText =
            result.candidates?.[0]?.content.parts?.[0]?.text;
          if (!jsonText) throw new Error('Empty response');
          setQuestions(JSON.parse(jsonText));
        } catch (err) {
          console.error(err);
          setError('An error occurred while generating questions.');
        } finally {
          setIsLoading(false);
        }
      };
    } catch (err) {
      console.error(err);
      setError('Failed to process PDF.');
      setIsLoading(false);
    }
  };

  const downloadPdf = async () => {
    try {
      await loadScript(
        'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
      );
      await loadScript(
        'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js'
      );
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();
      doc.text('Generated Q&A', 20, 10);
      const head = [['#', 'Question', 'Answer']];
      const body = questions.map((q, i) => [
        i + 1,
        doc.splitTextToSize(q.question, 80),
        doc.splitTextToSize(q.answer, 50),
      ]);
      doc.autoTable({ head, body, startY: 20 });
      const safeName = sanitizeFilename(pdfFile.name);
      doc.save(`${safeName}`);
    } catch {
      setError("Couldn't download PDF.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">AI Question Generator</h2>
      <div className="card mx-auto" style={{ maxWidth: '600px' }}>
        <div className="card-body">
          <div>
            <DragDropFile
              setFile={setPdfFile}
              setErrorMessage={setError}
              allowedMimeTypes={allowedMimeTypes}
              allowedExtensions={allowedExtensions}
              sanitizeFilename={sanitizeFilename}
              maxFileSize={maxFileSize}
              description="PDF files (.pdf)"
            />
            {error && (
              <div className="alert alert-danger mt-3">{error}</div>
            )}
          </div>

          <div className="mt-3 d-flex justify-content-between">
            <select
              className="form-select w-25"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
            >
              {[1, 3, 5, 10].map((n) => (
                <option key={n} value={n}>
                  {n} Questions
                </option>
              ))}
            </select>
            <select
              className="form-select w-25"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              {['Easy', 'Medium', 'Hard'].map((d) => (
                <option key={d} value={d.toLowerCase()}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="text-center mt-4">
            <button
              onClick={generateQuestions}
              disabled={!pdfFile || isLoading}
              className="btn btn-primary"
            >
              {isLoading ? (
                <span className="converting-shimmer">Generating...</span>
              ) : (
                'Generate Questions'
              )}
            </button>
          </div>

          {questions.length > 0 && (
            <>
              <div className="mt-4 text-center">
                <button onClick={downloadPdf} className="btn btn-success">
                  Download as PDF
                </button>
              </div>
              <div className="mt-4">
                {questions.map((q, i) => (
                  <div key={i} className="card mb-3">
                    <div className="card-body">
                      <p>
                        <strong>
                          {i + 1}. {q.question}
                        </strong>
                      </p>
                      <button
                        onClick={() => toggleAnswer(i)}
                        className="btn btn-link p-0"
                      >
                        {showAnswers[i] ? 'Hide Answer' : 'Show Answer'}
                      </button>
                      {showAnswers[i] && (
                        <div
                          style={{
                            backgroundColor: '#f8f9fa',
                            color: '#212529',
                          }}
                          className="mt-2 p-3 rounded border border-info"
                        >
                          <TypingEffect text={q.answer} speed={30} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIQuestionGenerator;
