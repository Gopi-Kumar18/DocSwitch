const CardData = [
  {
    path: "/pdf-to-word",
    icon: "fas fa-file-word",
    color: "#2B579A", 
    title: "PDF to Word",
    text: "Transform your PDF to Word format",
    subtext: "Quickly edit and reuse PDF content in Word.",
    footerNote: "Click to convert"
  },
  {
    path: "/pdf-to-presentation",
    icon: "fas fa-file-powerpoint",
    color: "#D24726", 
    title: "PDF to Presentation",
    text: "Create presentations from PDFs",
    subtext: "Turn PDFs into ready-to-use slides instantly.",
    footerNote: "Click to convert"
  },
  {
    path: "/pdf-to-excel",
    icon: "fas fa-file-excel",
    color: "#217346", 
    title: "PDF To SpreadSheets",
    text: "Convert PDFs to various SpreadSheets.",
    subtext: "Extract tables from PDFs for easy analysis.",
    footerNote: "Click to convert"
  },
  {
    path: "/word-to-pdf",
    icon: "fas fa-file-pdf",
    color: "#E5222A", 
    title: "Word to PDF",
    text: "Transform your Word to PDF",
    subtext: "Keep your Word formatting safe in PDF.",
    footerNote: "Click to convert"
  },
  {
    path: "/presentation-to-pdf",
    icon: "fas fa-file-pdf",
    color: "#E5222A",
    title: "Presentation to PDF",
    text: "Convert presentations to PDFs",
    subtext: "Share slides as PDFs with consistent layout.",
    footerNote: "Click to convert"
  },
  {
    path: "/excel-to-csv",
    icon: "fas fa-file-csv",
    color: "#FFD43B", 
    title: "SpreadSheets To CSV",
    text: "Convert spreadsheets to CSV",
    subtext: "Export spreadsheet data to a simple CSV file.",
    footerNote: "Click to convert"
  },
  {
    path: "/merge-docs",
    icon: "fas fa-file-medical",
    color: "#9B59B6", 
    title: "Merge PDFs",
    text: "Combine multiple DOCs into one",
    subtext: "Join multiple files into a single PDF easily.",
    footerNote: "Click to merge"
  },
  {
    path: "/compress-pdf",
    icon: "fas fa-compress",
    color: "#FF6F00", 
    title: "Compress PDF",
    text: "Compress an PDF file",
    subtext: "Reduce PDF size for faster sharing.",
    footerNote: "Click to compress"
  },
  {
    path: "/create-pdf",
    icon: "fas fa-file-circle-plus",
    color: "#4CAF50", 
    title: "Create PDF",
    text: "Create PDF from any file",
    subtext: "Generate PDFs from your favorite files.",
    footerNote: "Click to create"
  },
  {
    path: "/split-pdf",
    icon: "fas fa-scissors",
    color: "#E91E63", 
    title: "Split PDF",
    text: "Transform your PDF to Word format",
    subtext: "Divide a PDF into separate pages or files.",
    footerNote: "Click to convert"
  },
  {
    path: "/ocr-pdf",
    icon: "fas fa-eye",
    color: "#3F51B5", 
    title: "Apply OCR",
    text: "Transform your PDF to Word format",
    subtext: "Make scanned PDFs searchable and editable.",
    footerNote: "Click to convert"
  },
  {
    path: "/protect-pdf",
    icon: "fas fa-lock",
    color: "#C62828", 
    title: "Protect PDF",
    text: "Protect your PDF files with a password ",
    subtext: "Add password protection to your PDF files.",
    footerNote: "Click to convert"
  },
  {
    path: "/unlock-pdf",
    icon: "fas fa-unlock",
    color: "#2E7D32", 
    title: "Unlock Your PDF",
    text: "Unlock your PDF files ",
    subtext: "Remove PDF passwords for easy access.",
    footerNote: "Click to convert"
  },
  {
    path: "/ai-question-generator",
    icon: "fas fa-robot",
    color: "#673AB7", 
    title: "AI Question Generator",
    text: "Generate Questions with AI",
    subtext: "Create questions from PDFs using AI instantly.",
    footerNote: "Click to Generate"
  },
  {
    path: "/jpg-to-png",
    icon: "fas fa-image",
    color: "#00897B", 
    title: "Convert an JPG to PNG",
    text: "Transform your JPG to PNG format",
    subtext: "Switch JPG images to PNG with one click.",
    footerNote: "Click to Generate"
  },
  {
    path: "/png-to-jpg",
    icon: "fas fa-image",
    color: "#00897B",
    title: "Convert an PNG to JPG",
    text: "Transform your PNG to JPG format",
    subtext: "Convert PNG images to JPG in seconds.",
    footerNote: "Click to Generate"
  },
  {
    path: "/pdf-to-image",
    icon: "fas fa-file-image",
    color: "#FF9800", 
    title: "Convert PDF to Image",
    text: "Convert PDF to any Format of Image",
    subtext: "Turn PDFs into images like JPG or PNG easily.",
    footerNote: "Click to Generate"
  },
  {
    path: "/word-to-image",
    icon: "fas fa-file-image",
    color: "#FF9800",
    title: "Convert Word to Image",
    text: "Convert Word to any Format of Image",
    subtext: "Convert Word to images for quick sharing.",
    footerNote: "Click to Generate"
  },
  {
    path: "/presentation-to-image",
    icon: "fas fa-file-image",
    color: "#FF9800",
    title: "Convert Presentation to Image",
    text: "Convert Presentation to any Format of Image",
    subtext: "Save slides as images for easy previews.",
    footerNote: "Click to Generate"
  },
  {
    path: "/excel-to-image",
    icon: "fas fa-file-image",
    color: "#FF9800",
    title: "Convert Excel to Image",
    text: "Convert Excel to any Format of Image",
    subtext: "Export spreadsheet data as clear images.",
    footerNote: "Click to Generate"
  },
  {
    path: "/bmp-to-image",
    icon: "fas fa-file-image",
    color: "#FF9800",
    title: "Convert BMP to Image",
    text: "Convert BMP to any Format of Image",
    subtext: "Change BMP files to modern image formats.",
    footerNote: "Click to Generate"
  },
  {
    path: "/sign-pdf",
    icon: "fas fa-signature",
    color: "#795548", 
    title: "Seal PDF",
    text: "Sign your PDF files",
    subtext: "Add your signature to PDF documents easily.",
    footerNote: "Click to Generate"
  },
  {
    path: "/watermark-pdf",
    icon: "fas fa-tint",
    color: "grey", 
    title: "Watermark PDF",
    text: "Add Watermark to PDF",
    subtext: "Protect your PDFs with custom watermarks.",
    footerNote: "Click to Generate"
  },
  {
  path: "/mp4-converter",
  icon: "fas fa-video", 
  color: "blue", 
  title: "Convert From MP4",
  text: "MP4 To Various Multimedia",
  subtext: "Convert MP4 videos into various multimedia.",
  footerNote: "Click to Convert"
},
{
  path: "/mp3-converter",
  icon: "fas fa-music", 
  color: "green", 
  title: "Convert From MP3",
  text: "MP3 To Various Audio Formats",
  subtext: "Convert MP3 audio into various multimedia.",
  footerNote: "Click to Convert"
},
{
  path: "/mkv-converter",
  icon: "fas fa-film", 
  color: "purple", 
  title: "Convert From MKV",
  text: "MKV To Various Multimedia",
  subtext: "Convert MKV videos into various multimedia.",
  footerNote: "Click to Convert"
},
{
  path: "/gif-converter",
  icon: "fas fa-gift", 
  color: "orange", 
  title: "Convert From GIF",
  text: "GIF To Various Multimedia",
  subtext: "Convert GIF images into various multimedia.",
  footerNote: "Click to Convert"
}
];
export default CardData;
