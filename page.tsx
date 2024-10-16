import React, { useState } from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { FileUp, Merge } from 'lucide-react';

function App() {
  const [pdf1, setPdf1] = useState<File | null>(null);
  const [pdf2, setPdf2] = useState<File | null>(null);
  const [merging, setMerging] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, setPdf: React.Dispatch<React.SetStateAction<File | null>>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdf(file);
    } else {
      alert('Please select a valid PDF file.');
    }
  };

  const mergePDFs = async () => {
    if (!pdf1 || !pdf2) {
      alert('Please select both PDF files.');
      return;
    }

    setMerging(true);

    try {
      const pdf1Data = await pdf1.arrayBuffer();
      const pdf2Data = await pdf2.arrayBuffer();

      const mergedPdf = await PDFDocument.create();
      const pdf1Doc = await PDFDocument.load(pdf1Data);
      const pdf2Doc = await PDFDocument.load(pdf2Data);

      const copiedPages1 = await mergedPdf.copyPages(pdf1Doc, pdf1Doc.getPageIndices());
      const copiedPages2 = await mergedPdf.copyPages(pdf2Doc, pdf2Doc.getPageIndices());

      copiedPages1.forEach((page) => mergedPdf.addPage(page));

      const font = await mergedPdf.embedFont(StandardFonts.Helvetica);

      // Extract number from PDF1 filename
      const numberMatch = pdf1.name.match(/(\d+)-(\d+)/);
      const numberText = numberMatch ? `${numberMatch[1]}/${numberMatch[2]}` : pdf1.name.replace('.pdf', '');

      copiedPages2.forEach((page) => {
        mergedPdf.addPage(page);
        const { width, height } = page.getSize();
        page.drawText(numberText, {
          x: width - 70,
          y: height - 30,
          size: 12,
          font: font,
          color: rgb(0, 0, 0),
        });
      });

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, 'merged.pdf');
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('An error occurred while merging the PDFs. Please try again.');
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">PDF Merger</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PDF 1 (Number Source)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileUp className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">{pdf1 ? pdf1.name : 'Click or drag PDF here'}</p>
                </div>
                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, setPdf1)} accept=".pdf" />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">PDF 2 (To be numbered)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FileUp className="w-8 h-8 mb-2 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">{pdf2 ? pdf2.name : 'Click or drag PDF here'}</p>
                </div>
                <input type="file" className="hidden" onChange={(e) => handleFileChange(e, setPdf2)} accept=".pdf" />
              </label>
            </div>
          </div>
          <button
            onClick={mergePDFs}
            disabled={!pdf1 || !pdf2 || merging}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {merging ? (
              'Processing...'
            ) : (
              <>
                <Merge className="w-5 h-5 mr-2" />
                Merge PDFs
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
