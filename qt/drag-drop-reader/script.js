const dropZone = /** @type {HTMLDivElement} */ (document.getElementById("dropZone"));
const textArea = /** @type {HTMLTextAreaElement} */ (document.getElementById("textArea"));
const copyBtn = /** @type {HTMLButtonElement} */ (document.getElementById("copyBtn"));
const downloadBtn = /** @type {HTMLButtonElement} */ (document.getElementById("downloadBtn"));
let fileData = [];

dropZone.addEventListener("dragover", event => {
  event.preventDefault();
  dropZone.style.background = "#e3f2fd";
});

dropZone.addEventListener("dragleave", () => {
  dropZone.style.background = "#ffffff";
});

dropZone.addEventListener("drop", async event => {
  event.preventDefault();
  dropZone.style.background = "#ffffff";
  fileData = [];

  const items = event.dataTransfer?.items || [];
  for (const item of items) {
    const entry = item.webkitGetAsEntry();
    if (entry) await processEntry(entry);
  }

  if (fileData.length > 0) {
    textArea.value = fileData.join("\n");
    copyBtn.disabled = false;
    downloadBtn.disabled = false;
  }
});

/**
 * @param {FileSystemEntry} entry
 * @param {string} path
 */
async function processEntry(entry, path = "") {
  if (entry.isFile) {
    await processFile(entry, path);
  } else if (entry.isDirectory) {
    const reader = entry.createReader();
    const readEntries = async () => {
      return new Promise(resolve => reader.readEntries(resolve));
    };

    let entries = await readEntries();
    while (entries.length > 0) {
      for (const nestedEntry of entries) {
        await processEntry(nestedEntry, `${path}${entry.name}/`);
      }
      entries = await readEntries();
    }
  }
}

/**
 * @param {FileSystemFileEntry} fileEntry
 * @param {string} filePath
 * @returns {Promise<void>}
 */
function processFile(fileEntry, filePath) {
  return new Promise(resolve => {
    fileEntry.file(file => {
      const reader = new FileReader();
      reader.onload = () => {
        fileData.push(`Path: ${filePath}${file.name}\nContent:\n${reader.result}\n\n`);
        resolve();
      };
      reader.onerror = () => resolve();
      reader.readAsText(file);
    });
  });
}

copyBtn.addEventListener("click", () => {
  textArea.select();
  document.execCommand("copy");
});

downloadBtn.addEventListener("click", () => {
  const blob = new Blob([fileData.join("\n")], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "files_content.txt";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
});
