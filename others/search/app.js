import { lastYearsQuestions } from "./lastYearsQuestions.js";

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const includeWrongAnswersCheckbox = document.getElementById("include-wrong-answers");
  const resultsContainer = document.getElementById("results-container");
  const resultsHeader = document.getElementById("results-header");

  // Tjekker om data er indlæst
  if (typeof lastYearsQuestions === "undefined" || Object.keys(lastYearsQuestions).length === 0) {
    resultsContainer.innerHTML =
      '<p style="color: red; text-align: center;">FEJL: Spørgsmålsdata (lastYearsQuestions.js) blev ikke fundet eller er tom.</p>';
    return;
  }

  const allExams = lastYearsQuestions;

  // Get query parameters from URL
  const getQueryParam = param => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  };

  // Update URL with query parameters
  const updateURL = (searchTerm, includeWrong) => {
    const url = new URL(window.location);

    if (searchTerm && searchTerm.trim() !== "") {
      url.searchParams.set("q", searchTerm);
    } else {
      url.searchParams.delete("q");
    }

    if (includeWrong) {
      url.searchParams.set("includeWrong", "true");
    } else {
      url.searchParams.delete("includeWrong");
    }

    window.history.replaceState({}, "", url);
  };

  // Initialize from URL parameters
  const initializeFromURL = () => {
    const searchQuery = getQueryParam("q");
    const includeWrongParam = getQueryParam("includeWrong");

    if (searchQuery) {
      searchInput.value = searchQuery;
    }

    if (includeWrongParam === "true") {
      includeWrongAnswersCheckbox.checked = true;
    }
  };

  // Funktion til at normalisere tekst til case-insensitiv søgning
  const normalizeText = text => text.toString().toLowerCase();

  // Funktion til at opdatere resultattælleren
  const updateResultsHeader = count => {
    if (count > 0) {
      resultsHeader.textContent = `Fandt ${count} matchende spørgsmål.`;
    } else {
      resultsHeader.textContent = "Ingen resultater.";
    }
  };

  // Funktion til at oprette spørgsmålskortet
  const createQuestionCard = (q, index) => {
    const card = document.createElement("div");
    card.className = "question-card";

    const questionText = document.createElement("div");
    questionText.className = "question-text";
    questionText.textContent = `${index}: ${q.question}`;

    const answerList = document.createElement("ul");
    answerList.className = "answer-list";

    q.answers.forEach((answer, ansIndex) => {
      const li = document.createElement("li");
      li.textContent = answer;
      if (ansIndex === q.correctIndex) {
        li.className = "correct-answer";
      } else {
        li.className = "incorrect-answer";
      }
      answerList.appendChild(li);
    });

    card.appendChild(questionText);
    card.appendChild(answerList);
    return card;
  };

  // Hovedfunktion for søgning og filtrering
  const performSearch = () => {
    const rawSearchTerm = searchInput.value;
    const searchTerm = normalizeText(rawSearchTerm);
    const includeWrong = includeWrongAnswersCheckbox.checked;

    // Update URL with current search parameters
    updateURL(rawSearchTerm, includeWrong);

    resultsContainer.innerHTML = "";
    let totalMatches = 0;

    // Vis alle sektioner, hvis søgefeltet er tomt
    if (searchTerm.trim() === "") {
      renderAllQuestions();
      updateResultsHeader(Object.values(allExams).flat().length);
      return;
    }

    for (const examDate in allExams) {
      const matchingQuestions = [];

      allExams[examDate].forEach(q => {
        const correctAns = normalizeText(q.answers[q.correctIndex]);
        const question = normalizeText(q.question);
        let isMatch = false;

        // 1. Søg i spørgsmålet
        if (question.includes(searchTerm)) {
          isMatch = true;
        }
        // 2. Søg i det korrekte svar
        else if (correctAns.includes(searchTerm)) {
          isMatch = true;
        }
        // 3. Søg i de forkerte svar (hvis afkrydset)
        else if (includeWrong) {
          for (let i = 0; i < q.answers.length; i++) {
            if (i !== q.correctIndex) {
              if (normalizeText(q.answers[i]).includes(searchTerm)) {
                isMatch = true;
                break;
              }
            }
          }
        }

        if (isMatch) {
          matchingQuestions.push(q);
          totalMatches++;
        }
      });

      if (matchingQuestions.length > 0) {
        const examSection = document.createElement("div");
        examSection.className = "exam-section";

        const header = document.createElement("div");
        header.className = "exam-header";
        header.innerHTML = `<span>✅ Eksamen d. ${examDate} (${matchingQuestions.length} match)</span>`;
        header.onclick = () => content.classList.toggle("hidden");

        const content = document.createElement("div");
        content.className = "exam-content";
        content.style.maxHeight = "500px";
        content.style.overflowY = "auto";

        matchingQuestions.forEach(q => {
          // Find det originale indeks for spørgsmålet
          const originalIndex = allExams[examDate].indexOf(q);
          const questionCard = createQuestionCard(q, originalIndex + 1);
          content.appendChild(questionCard);
        });

        examSection.appendChild(header);
        examSection.appendChild(content);
        resultsContainer.appendChild(examSection);
      }
    }

    updateResultsHeader(totalMatches);

    if (totalMatches === 0 && rawSearchTerm !== "") {
      resultsContainer.innerHTML = `<p style="text-align: center; color: #cc3333; margin-top: 20px;">Ingen spørgsmål matchede søgeordet "${rawSearchTerm}".</p>`;
    }
  };

  // Funktion til at vise alle spørgsmål uden filter (starttilstand)
  const renderAllQuestions = () => {
    resultsContainer.innerHTML = "";
    for (const examDate in allExams) {
      const examSection = document.createElement("div");
      examSection.className = "exam-section";

      const header = document.createElement("div");
      header.className = "exam-header";
      header.innerHTML = `<span>Eksamen d. ${examDate} (${allExams[examDate].length} spørgsmål)</span>`;
      header.onclick = () => content.classList.toggle("hidden");

      const content = document.createElement("div");
      content.className = "exam-content";

      allExams[examDate].forEach((q, index) => {
        const questionCard = createQuestionCard(q, index + 1);
        content.appendChild(questionCard);
      });

      examSection.appendChild(header);
      examSection.appendChild(content);
      resultsContainer.appendChild(examSection);
    }
  };

  // Initialize from URL parameters first
  initializeFromURL();

  // Tilføj lyttere til søgefeltet og checkbox
  searchInput.addEventListener("input", performSearch);
  includeWrongAnswersCheckbox.addEventListener("change", performSearch);

  // Perform initial search if there are URL parameters, otherwise show all questions
  const initialQuery = getQueryParam("q");
  if (initialQuery) {
    performSearch();
  } else {
    renderAllQuestions();
    updateResultsHeader(Object.values(allExams).flat().length);
  }
});
