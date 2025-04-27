const fileInput = document.getElementById('fileInput');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Event listener for image upload
fileInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Create image object and load it
  const img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = async () => {
    // Set canvas size to match image
    canvas.width = img.width;
    canvas.height = img.height;

    // Draw image to canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);

    // Run OCR using Tesseract.js
    const { data } = await Tesseract.recognize(
      img,
      'eng',
      { logger: m => console.log(m) }  // Logs progress in console (optional)
    );

    console.log('Detected words:', data.words);

    const fields = groupFieldsByKeywords(data.words);

    // Draw bounding boxes and labels
    data.words.forEach(word => {
      const bbox = word.bbox;
      if (bbox) {
        const x = bbox.x0 || bbox.x || 0;
        const y = bbox.y0 || bbox.y || 0;
        const width = (bbox.x1 && bbox.x0) ? (bbox.x1 - bbox.x0) : (bbox.width || 0);
        const height = (bbox.y1 && bbox.y0) ? (bbox.y1 - bbox.y0) : (bbox.height || 0);
    
        ctx.strokeStyle = getColorForWord(word.text);
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
    
        ctx.fillStyle = ctx.strokeStyle;
        ctx.font = '14px Arial';
        ctx.fillText(word.text, x, y - 5);
      }
    });
    

    console.log('Grouped Fields:', fields);
  };
});

// Function to group fields based on keywords
function groupFieldsByKeywords(words) {
  const groupedFields = {
    phoneNumbers: [],
    addresses: [],
  };

  words.forEach(word => {
    const text = word.text.toLowerCase(); // normalize
    if (text.includes('phone')) {
      groupedFields.phoneNumbers.push(word);
    } else if (text.includes('address')) {
      groupedFields.addresses.push(word);
    }
  });

  return groupedFields;
}

// Function to set color based on keyword
function getColorForWord(text) {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('phone')) {
    return 'green';
  } else if (lowerText.includes('address')) {
    return 'blue';
  } else {
    return 'red'; // default color for everything else
  }
}
