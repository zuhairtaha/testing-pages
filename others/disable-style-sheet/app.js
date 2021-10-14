const btn = document.getElementById('btn');

btn.addEventListener('click', () => {
  Array.from(document.styleSheets).forEach(sheet => {
    sheet.disabled = !sheet.disabled;
    btn.textContent = sheet.disabled ? 'Enable' : 'Disable';
  });
});
