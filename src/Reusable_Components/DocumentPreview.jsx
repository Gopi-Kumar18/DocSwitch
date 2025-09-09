
import React from 'react';

const DocPreview = ({ previewUrl, fileName }) => {
  if (!previewUrl || !fileName) return null;

  const ext = fileName.split('.').pop().toLowerCase();

  const isPdf    = ext === 'pdf';
  const isOffice = ['doc','docx','xls','xlsx','ppt','pptx'].includes(ext);
  const isImage  = ['jpg','jpeg','png','bmp'].includes(ext);
  const isCsv    = ext === 'csv';


  if (isPdf) {
    return (
      <iframe
        src={previewUrl}
        title="PDF Preview"
        width="100%"
        height="700px"

        style={{ border: '1px solid #ccc' }}
      />
    );
  }
  if (isImage) {
    return <img src={previewUrl} alt="preview" style={{ maxWidth:'100%', maxHeight:'700px' }} />;
  }
  if (isCsv) {
    return (
      <iframe
        src={`https://docs.google.com/gview?url=${encodeURIComponent(previewUrl)}&embedded=true`}
        width="100%" height="700px" frameBorder="0"
      />
    );
  }
  if (isOffice) {
    return (
      <iframe
        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewUrl)}`}
        width="100%" height="700px" frameBorder="0"
      />
    );
  }

  return <p className="text-danger">Preview not available for this file type.</p>;
};

export default DocPreview;
