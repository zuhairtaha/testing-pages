document.addEventListener("DOMContentLoaded", async () => {
  for (let i = 0; i < 3; i++) {
    await new Promise(resolve => window.requestAnimationFrame(resolve));
  }

  document.querySelectorAll("th").forEach(th => {
    th.style.cursor = "pointer";
    th.addEventListener("click", () => {
      const table = th.closest("table");
      const tbody = table.querySelector("tbody");
      const index = Array.from(th.parentNode.children).indexOf(th);
      const asc = th.dataset.sortAsc === "true" ? false : true;
      th.dataset.sortAsc = asc;

      const rows = Array.from(tbody.querySelectorAll("tr"));
      rows.sort((a, b) => {
        const aText = a.children[index].textContent.trim();
        const bText = b.children[index].textContent.trim();
        const aNum = parseFloat(aText.replace(",", "."));
        const bNum = parseFloat(bText.replace(",", "."));
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return asc ? aNum - bNum : bNum - aNum;
        }
        return asc ? aText.localeCompare(bText) : bText.localeCompare(aText);
      });
      rows.forEach(row => tbody.appendChild(row));
    });
  });
});
