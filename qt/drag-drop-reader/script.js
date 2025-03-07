const dropZone = /** @type {HTMLDivElement} */ (
  document.getElementById("drop-zone")
);

const textArea = /** @type {HTMLTextAreaElement} */ (
  document.getElementById("file-content")
);

dropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  dropZone.style.backgroundColor = "#f0f0f0";
});

dropZone.addEventListener("dragleave", () => {
  dropZone.style.backgroundColor = "#fff";
});

dropZone.addEventListener("drop", async (event) => {
  event.preventDefault();
  dropZone.style.backgroundColor = "#fff";
  textArea.value = "";

  const files = event.dataTransfer?.files ?? [];
  for (const file of files) {
    const content = await file.text();
    textArea.value += `${file.name}\n${content}\n\n`;
  }
});
