function startOCR() {
  const imageInput = document.getElementById("imageUpload");
  const outputDiv = document.getElementById("output");
  const canvas = document.getElementById("canvas");
  const container = document.getElementById("canvasContainer");
  const ctx = canvas.getContext("2d");

  // Clear previous inputs
  const oldInputs = container.querySelectorAll(".ocr-input");
  oldInputs.forEach(input => input.remove());

  if (imageInput.files.length === 0) {
    outputDiv.innerText = "Please select an image first.";
    return;
  }

  const file = imageInput.files[0];
  const img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    Tesseract.recognize(
      file,
      "eng",
      { logger: (m) => console.log(m) }
    )
    .then(({ data }) => {
      outputDiv.innerHTML = ""; // Clear any previous messages

      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;

      data.words.forEach((word, index) => {
        const { x0, y0, x1, y1 } = word.bbox;
        ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);

        ctx.font = "10px Arial";
        ctx.fillStyle = "blue";
        ctx.fillText(word.text, x0, y0 - 2);

        // Create an input positioned at the word location
        const input = document.createElement("input");
        input.type = "text";
        input.value = word.text;
        input.className = "ocr-input";

        // Position the input box over the word bounding box
        input.style.left = `${x0}px`;
        input.style.top = `${y0}px`;
        input.style.width = `${x1 - x0}px`;
        input.style.height = `${y1 - y0}px`;

        container.appendChild(input);
      });

      // Optional: Add a save button
      const saveButton = document.createElement("button");
      saveButton.innerText = "Save Corrected Text";
      saveButton.onclick = saveCorrectedText;
      outputDiv.appendChild(saveButton);
    })
    .catch((err) => {
      outputDiv.innerText = "Error: " + err.message;
    });
  };
}

function saveCorrectedText() {
  const inputs = document.querySelectorAll(".ocr-input");
  const correctedText = Array.from(inputs).map(input => input.value).join(" ");

  // Create a Blob (binary large object) with the corrected text
  const blob = new Blob([correctedText], { type: "text/plain" });
  
  // Create a temporary link element
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "corrected_text.txt"; // file name for download

  // Trigger the download
  link.click();

  // Clean up the URL object
  URL.revokeObjectURL(link.href);
}
