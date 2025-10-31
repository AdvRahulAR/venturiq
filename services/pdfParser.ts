// This tells TypeScript that pdfjsLib is available globally, attached to the window object.
declare const pdfjsLib: any;

export const parsePdf = async (file: File): Promise<string> => {
  const fileReader = new FileReader();

  return new Promise((resolve, reject) => {
    fileReader.onload = async (event) => {
      if (!event.target?.result) {
        return reject(new Error('Failed to read file.'));
      }

      // Access pdfjsLib from the window object to prevent ReferenceError
      const pdfjs = (window as any).pdfjsLib;

      if (!pdfjs) {
        return reject(new Error("Failed to initialize PDF reader. Please check your internet connection and refresh the page. If the problem persists, a browser extension might be blocking required scripts."));
      }

      try {
        const typedarray = new Uint8Array(event.target.result as ArrayBuffer);
        const pdf = await pdfjs.getDocument(typedarray).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n\n';
        }
        resolve(fullText);
      } catch (error) {
        console.error('Error parsing PDF:', error);
        reject(new Error('Could not parse PDF file. It might be corrupted or in an unsupported format.'));
      }
    };

    fileReader.onerror = () => {
      reject(new Error('Error reading the file.'));
    };

    fileReader.readAsArrayBuffer(file);
  });
};