const holidays = {
  "1-1": "New Year's Day",
  "3-30": "Maundy Thursday",
  "3-31": "Good Friday",
  "4-2": "Easter Sunday",
  "4-3": "Easter Monday",
  "5-5": "General Prayers Day",
  "5-25": "Ascension Day",
  "6-11": "Whit Sunday",
  "6-12": "Whit Monday",
  "12-24": "Christmas Eve",
  "12-25": "Christmas Day",
  "12-26": "Second day of Christmas"
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const calendar = document.getElementById("calendar");
const today = new Date();
const currentYear = today.getFullYear();
const currentMonth = today.getMonth();
const currentDate = today.getDate();

for (let month = 0; month < 12; month++) {
  const monthContainer = document.createElement("div");
  monthContainer.className = "month-container";
  calendar.append(monthContainer);

  const monthTitle = document.createElement("div");
  monthTitle.className = "month-title";
  monthTitle.textContent = monthNames[month];
  monthContainer.append(monthTitle);

  const table = document.createElement("table");
  monthContainer.append(table);

  const thead = document.createElement("thead");
  table.append(thead);
  const tr = document.createElement("tr");
  thead.append(tr);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  for (let i = 0; i < 7; i++) {
    const th = document.createElement("th");
    th.textContent = days[i];
    tr.append(th);
  }

  const tbody = document.createElement("tbody");
  table.append(tbody);

  const date = new Date(`2023-${month + 1}-01`);
  let row;

  while (date.getMonth() === month) {
    if (date.getDate() === 1 || date.getDay() === 0) {
      row = tbody.insertRow();
    }

    const cell = row.insertCell();
    cell.textContent = date.getDate();

    const formattedDate = `${date.getMonth() + 1}-${date.getDate()}`;
    if (holidays.hasOwnProperty(formattedDate)) {
      cell.classList.add("holiday");
      cell.title = holidays[formattedDate];
    }

    if (date.getFullYear() === currentYear && date.getMonth() === currentMonth && date.getDate() === currentDate) {
      cell.style.backgroundColor = "#ccffcc"; // Highlight today's cell with a different color
    }

    date.setDate(date.getDate() + 1);
  }

  // Fill in the remaining empty cells
  while (row && row.cells.length < 7) {
    row.insertCell();
  }
}
