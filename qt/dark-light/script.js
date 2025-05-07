// Check localStorage for dark mode preference
if (localStorage.getItem("dark-mode") === "enabled") {
  document.body.classList.add("dark-mode");
}

// Toggle dark mode and save the preference
function toggleDarkMode() {
  const isDarkMode = document.body.classList.toggle("dark-mode");
  const button = document.querySelector(".mode-toggle");

  // Change button text based on mode
  if (isDarkMode) {
    button.textContent = "Switch to Light Mode";
    localStorage.setItem("dark-mode", "enabled");
  } else {
    button.textContent = "Switch to Dark Mode";
    localStorage.setItem("dark-mode", "disabled");
  }
}
