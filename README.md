**DocSwitch**

*DocSwitch* is a powerful, web-based file conversion platform built using the MERN stack and modern DevOps practices. Convert documents and images between a variety of formats—PDF, Word, PowerPoint, Excel, CSV, BMP, PNG, JPG—and more & more, all with a simple drag-and-drop interface.


🚀 Key Features

Universal File Conversion: Convert between common document and image formats:

**(Document Conversion's)**

PDF ↔ Word 

Word → PDF

PowerPoint → PDF

PDF → Powerpoint

Excel (XLS/XLSX/CSV/XLSM) → CSV

PDF → Excel

Split PDF

Compress PDF

Merge PDF

Create PDF

OCR PDF

Secure PDF

Unlock PDF


**(Image Conversions)**

PDF ↔ Image (JPG, PNG)

Word (DOC/DOCX) → Image

PowerPoint (PPT/PPTX) → Image

Excel (XLS/XLSX/CSV/XLSM) → Image

BMP ↔ JPG/PNG

PNG ↔ JPG


**(Unique Feature)**

AI-Question Generator(using Gemini API)

Multi-Page Support: Automatically ZIP multiple page outputs into a single archive.

Secure Temporary Storage: Files are stored in MongoDB temporary, served via expiring tokens, and deleted after conversion.

Scalable APIs: Powered by "Adobe PDF Services", "CloudConvert" for high-quality, reliable conversions.

Responsive UI: React front-end with drag-and-drop and live progress indicators.

🛠️ Tech Stack

Frontend: React, Bootstrap, React Router, css

Backend: Node.js, Express, MongoDB

File Conversion: Adobe PDF Services, CloudConvert API

DevOps:

Version Control: Git & GitHub

Containerization: Docker & Docker Compose(will be there..)

CI/CD: Jenkins pipelines for automated testing, build, and deployment(will be there..)

Environment: .env configuration for secrets and API keys

⚙️ Installation & Setup

Clone the repository

git clone https://github.com/Gopi-Kumar18/DocSwitch.git
cd DocSwitch

Environment Variables
Copy .env.example to .env and fill in your:

MONGODB_URI

ADOBE_PDF_CLIENT_SECRET & ID

CLOUDCONVERT_API_KEY

JWT_SECRET

Other optional settings

Backend

cd backend
npm install
nodemon server.js

Frontend

cd DocSwitch
npm install
npm run dev

Access the App
Open your browser to http://localhost:5173 for React and http://localhost:3000 for the backend.

📝 Usage

Navigate to the All Tools page (/other-img-tools)&&(/other-pdf-tools)  to see available converters.

Choose a converter card (e.g., PDF to Image) and click Generate.

Drag & drop or click to upload your file.

Select the desired output format (JPG or PNG).

Click Convert and download your converted file. If multiple pages, download the ZIP or Share the download link.


**Live Project Demo Images:** 

1.) SignUp Page:

<img width="1916" height="874" alt="image" src="https://github.com/user-attachments/assets/23842e84-ad68-4e6d-8686-49be1ff84671" />


2.) Login Page:

<img width="1913" height="882" alt="image" src="https://github.com/user-attachments/assets/be9fd3ef-05e3-4688-b2b8-4528ae223617" />


3.) Homepage:

<img width="1893" height="869" alt="image" src="https://github.com/user-attachments/assets/a93b6226-9e43-4cfd-b91d-f321591fc72c" />


4.) Conversion Page:

<img width="1919" height="797" alt="image" src="https://github.com/user-attachments/assets/43d18d43-7219-455e-b9d9-8bf2b64fe4c6" />


5.) Download Page:

<img width="1912" height="703" alt="image" src="https://github.com/user-attachments/assets/dfbb584d-9d2e-4955-90b2-efc9522efe92" />


6.) Ai-Question Generator:

<img width="1095" height="880" alt="image" src="https://github.com/user-attachments/assets/ab05db5b-84d5-4e87-ad93-6c10aa1eb804" />





👥 Contributing

Contributions are welcome! Feel free to:

📖 Improve documentation

🐞 Report issues or request features

✨ Submit pull requests

Fork the repo

Create a feature branch (git checkout -b feature/YourFeature)

Commit your changes (git commit -m 'Add feature')

Push to branch (git push origin feature/YourFeature)

Open a pull request

📄 License

Built with ❤️ by Gopi-Kumar18

