const dropZone = /** @type {HTMLDivElement} */ (document.getElementById("dropZone"));
const textArea = /** @type {HTMLTextAreaElement} */ (document.getElementById("textArea"));
const copyBtn = /** @type {HTMLButtonElement} */ (document.getElementById("copyBtn"));
const downloadBtn = /** @type {HTMLButtonElement} */ (document.getElementById("downloadBtn"));
let fileData = [];

dropZone.addEventListener("dragover", event => {
  event.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", async event => {
  event.preventDefault();
  dropZone.classList.remove("dragover");
  fileData = [];
  textArea.value = "Processing...";
  copyBtn.disabled = true;
  downloadBtn.disabled = true;

  const items = event.dataTransfer?.items || [];
  const processingPromises = [];

  if (items.length > 0) {
    for (const item of items) {
      const entry = item.webkitGetAsEntry();
      if (entry) {
        processingPromises.push(processEntry(entry));
      }
    }

    try {
      await Promise.all(processingPromises);
    } catch (error) {
      console.error("Error processing dropped items:", error);
      textArea.value = `An error occurred during processing: ${error.message}`;
      return;
    }
  }

  if (fileData.length > 0) {
    textArea.value = fileData.join("\n");
    copyBtn.disabled = false;
    downloadBtn.disabled = false;
  } else {
    textArea.value = "No text files found or processed.";
  }
});

/**
 * Recursively processes a FileSystemEntry (file or directory).
 * @param {FileSystemEntry} entry - The file or directory entry.
 * @param {string} [path=""] - The current path relative to the drop root.
 * @returns {Promise<void>}
 */
async function processEntry(entry, path = "") {
  if (entry.isFile) {
    await processFile(/** @type {FileSystemFileEntry} */ (entry), path);
  } else if (entry.isDirectory) {
    const reader = entry.createReader();
    const directoryPromises = [];

    const readEntriesBatch = () => {
      return new Promise((resolve, reject) => {
        reader.readEntries(resolve, reject);
      });
    };

    try {
      let entries;
      do {
        entries = await readEntriesBatch();
        for (const nestedEntry of entries) {
          directoryPromises.push(processEntry(nestedEntry, `${path}${entry.name}/`));
        }
      } while (entries.length > 0);

      await Promise.all(directoryPromises);
    } catch (error) {
      console.error(`Error reading directory ${path}${entry.name}:`, error);
    }
  }
}

/**
 * Processes a FileSystemFileEntry, reads it as text if applicable, and adds to fileData.
 * @param {FileSystemFileEntry} fileEntry - The file entry to process.
 * @param {string} filePath - The path leading up to the file.
 * @returns {Promise<void>}
 */
function processFile(fileEntry, filePath) {
  return new Promise((resolve, reject) => {
    fileEntry.file(
      file => {
        const fileType = file.type;
        const fileName = file.name;
        const fullPath = `${filePath}${fileName}`;

        const isTextBased =
          !fileType ||
          fileType.startsWith("text/") ||
          fileType === "application/json" ||
          fileType === "application/javascript" ||
          fileType === "application/xml" ||
          fileType === "application/xhtml+xml" ||
          fileType === "application/rss+xml" ||
          fileType.endsWith("+xml");

        if (isTextBased) {
          const reader = new FileReader();

          reader.onload = () => {
            fileData.push(`Path: ${fullPath}\nContent:\n${reader.result}\n\n`);
            resolve();
          };

          reader.onerror = () => {
            console.error(`Error reading file: ${fullPath}`, reader.error);

            resolve();
          };

          reader.readAsText(file);
        } else {
          console.log(`Skipping non-text file: ${fullPath} (Type: ${fileType})`);
          resolve();
        }
      },
      err => {
        console.error(`Error accessing file entry ${filePath}${fileEntry.name}:`, err);
        reject(err);
      }
    );
  });
}

copyBtn.addEventListener("click", () => {
  if (!textArea.value) return;
  textArea.select();
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(textArea.value)
        .then(() => {})
        .catch(err => {
          console.error("Failed to copy using Clipboard API:", err);
          document.execCommand("copy");
        });
    } else {
      document.execCommand("copy");
    }
  } catch (err) {
    console.error("Failed to copy text: ", err);
  }
});

downloadBtn.addEventListener("click", () => {
  if (!textArea.value) return;
  try {
    const blob = new Blob([textArea.value], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "files_content.txt";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err) {
    console.error("Failed to initiate download: ", err);
  }
});
