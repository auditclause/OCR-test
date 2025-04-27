function startOCR() {
  const imageInput = document.getElementById("imageUpload");
  const outputDiv = document.getElementById("output");
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

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
      outputDiv.innerHTML = ""; // Clear previous results

      ctx.strokeStyle = "red";
      ctx.lineWidth = 2;

      // Create a form to hold editable words
      const form = document.createElement("form");
      form.id = "ocrForm";

      data.words.forEach((word, index) => {
        const { x0, y0, x1, y1 } = word.bbox;
        ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);

        ctx.font = "10px Arial";
        ctx.fillStyle = "blue";
        ctx.fillText(word.text, x0, y0 - 2);

        // Create an input for each word
        const input = document.createElement("input");
        input.type = "text";
        input.name = `word-${index}`;
        input.value = word.text;
        input.style.margin = "5px";

        form.appendChild(input);
      });

      outputDiv.appendChild(form);

      // Optional: add a Save button
      const saveButton = document.createElement("button");
      saveButton.type = "button";
      saveButton.innerText = "Save Corrected Text";
      saveButton.onclick = saveCorrectedText;
      outputDiv.appendChild(saveButton);
    })
    .catch((err) => {
      outputDiv.innerText = "Error: " + err.message;
    });
  };
}

// This function gathers corrected words
function saveCorrectedText() {
  const form = document.getElementById("ocrForm");
  const inputs = form.querySelectorAll("input");
  const correctedText = Array.from(inputs).map(input => input.value).join(" ");
  
  console.log("Corrected Text:", correctedText);
  alert("Corrected Text:\n" + correctedText); // You could also display/save it
}
