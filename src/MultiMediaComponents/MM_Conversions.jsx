
import React from 'react';
import MultimediaConverter from './MultimediaConverter.jsx';
import ConversionQA from "./QA.jsx";
import multimediaQA from "./data/qa.js";


export const MP4Converter = () => (
    <>
  <MultimediaConverter
    title="MP4 Converter"
    inputLabel="MP4 files"
    inputMimeTypes={['video/mp4']}
    inputExtensions={['.mp4']}
    outputFormats={['mp3','gif','m4a','wav','mkv','mov','webm','flac']}
    endpointBase="/mmConvert"
  />
   <ConversionQA title={multimediaQA.mp4ToOthers.title} steps={multimediaQA.mp4ToOthers.steps}/>
  </>
);

export const MP3Converter = () => (
    <>
  <MultimediaConverter
    title="MP3 Converter"
    inputLabel="MP3 files"
    inputMimeTypes={['audio/mpeg','audio/mp3']}
    inputExtensions={['.mp3']}
    outputFormats={['flac','m4a','wav','wma','aac','ogg']}
    endpointBase="/mmConvert"
  />
   <ConversionQA title={multimediaQA.mp3ToOthers.title} steps={multimediaQA.mp3ToOthers.steps}/>
   </>
);


export const MKVConverter = () => (
    <>
  <MultimediaConverter
    title="MKV Converter"
    inputLabel="MKV files"
    inputMimeTypes={['video/x-matroska','video/mkv']}
    inputExtensions={['.mkv']}
    outputFormats={['mp4','mp3','mov','webm','flac','wav','m4a']}
    endpointBase="/mmConvert"
  />
   <ConversionQA title={multimediaQA.mkvToOthers.title} steps={multimediaQA.mkvToOthers.steps}/>
   </>
);


export const GIFConverter = () => (
    <>
  <MultimediaConverter
    title="GIF Converter"
    inputLabel="GIF files"
    inputMimeTypes={['image/gif']}
    inputExtensions={['.gif']}
    outputFormats={['mp3','m4a','mp4','wav','mkv','mov','webm','flac']}
    endpointBase="/mmConvert"
  />
   <ConversionQA title={multimediaQA.gifToOthers.title} steps={multimediaQA.gifToOthers.steps}/>
  </>
);

// export default {
//   MP4Converter,
//   MP3Converter,
//   MKVConverter,
//   GIFConverter
// };
