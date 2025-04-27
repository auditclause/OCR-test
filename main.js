function startOCR() {
  const imageInput = document.getElementById("imageUpload");
  const outputDiv = document.getElementById("output");

  if (imageInput.files.length === 0) {
    outputDiv.innerText = "Please select an image first.";
    return;
  }

  const file = imageInput.files[0];

  Tesseract.recognize(
    file,
    "eng", // Language code (English)
    { logger: (m) => console.log(m) } // Optional: to see progress in the console
  )
    .then(({ data: { text } }) => {
      outputDiv.innerText = text;
    })
    .catch((err) => {
      outputDiv.innerText = "Error: " + err.message;
    });
}
