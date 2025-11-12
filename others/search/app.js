import { lastYearsQuestions } from "./lastYearsQuestions.js";

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const includeWrongAnswersCheckbox = document.getElementById("include-wrong-answers");
  const resultsContainer = document.getElementById("results-container");
  const resultsHeader = document.getElementById("results-header");
  const scrollToTopButton = document.getElementById("scroll-to-top");

  // Translation cache to avoid repeated API calls
  const translationCache = new Map();
  // Element-specific translation cache for quick tooltip access
  const elementTranslationCache = new WeakMap();
  // Queue for background translation processing
  const translationQueue = new Set();
  // Flag to prevent multiple simultaneous translation processes
  let isProcessingTranslations = false;

  // Translation function
  async function translateDanishToArabic(text) {
    // Check cache first
    if (translationCache.has(text)) {
      return translationCache.get(text);
    }

    try {
      const url =
        "https://translate.googleapis.com/translate_a/single?client=gtx&sl=da&tl=ar&dt=t&q=" + encodeURIComponent(text);
      const response = await fetch(url);
      const data = await response.json();
      const translation = data[0].map(item => item[0]).join("");

      // Cache the translation
      translationCache.set(text, translation);
      return translation;
    } catch (error) {
      console.error("Translation error:", error);
      return "خطأ في الترجمة";
    }
  }

  // Background translation processor
  const processTranslationQueue = async () => {
    if (isProcessingTranslations || translationQueue.size === 0) {
      return;
    }

    isProcessingTranslations = true;
    const elementsToProcess = Array.from(translationQueue);
    translationQueue.clear();

    // Process in batches to avoid overwhelming the API
    const batchSize = 3;
    for (let i = 0; i < elementsToProcess.length; i += batchSize) {
      const batch = elementsToProcess.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async element => {
          const text = element.dataset.originalText;
          if (text && !elementTranslationCache.has(element)) {
            try {
              const translation = await translateDanishToArabic(text);
              elementTranslationCache.set(element, translation);
            } catch (error) {
              elementTranslationCache.set(element, "خطأ في الترجمة");
            }
          }
        })
      );

      // Small delay between batches to be respectful to the API
      if (i + batchSize < elementsToProcess.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    isProcessingTranslations = false;

    // Check if more items were added while processing
    if (translationQueue.size > 0) {
      setTimeout(processTranslationQueue, 200);
    }
  };

  // Intersection Observer for viewport translation
  const createViewportObserver = () => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const element = entry.target;
            if (element.dataset.originalText && !elementTranslationCache.has(element)) {
              translationQueue.add(element);
            }
          }
        });

        // Process translation queue
        if (translationQueue.size > 0) {
          setTimeout(processTranslationQueue, 100);
        }
      },
      {
        rootMargin: "100px", // Start translating 100px before element enters viewport
        threshold: 0.1
      }
    );

    return observer;
  };

  const viewportObserver = createViewportObserver();

  // Tooltip functions
  const createTooltip = () => {
    let tooltip = document.getElementById("translation-tooltip");
    if (!tooltip) {
      tooltip = document.createElement("div");
      tooltip.id = "translation-tooltip";
      tooltip.className = "tooltip";
      document.body.appendChild(tooltip);
    }
    return tooltip;
  };

  const showTooltip = async (element, text) => {
    const tooltip = createTooltip();

    // Check if we have a pre-cached translation for this element
    const cachedTranslation = elementTranslationCache.get(element);

    if (cachedTranslation) {
      tooltip.textContent = cachedTranslation;
    } else {
      tooltip.textContent = "جاري الترجمة...";
    }

    tooltip.style.display = "block";

    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 + "px";
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + "px";

    // If not cached, translate and update
    if (!cachedTranslation) {
      try {
        const translation = await translateDanishToArabic(text);
        elementTranslationCache.set(element, translation);
        tooltip.textContent = translation;

        // Reposition after content change
        const newRect = element.getBoundingClientRect();
        tooltip.style.left = newRect.left + newRect.width / 2 - tooltip.offsetWidth / 2 + "px";
        tooltip.style.top = newRect.top - tooltip.offsetHeight - 10 + "px";
      } catch (error) {
        const errorMsg = "خطأ في الترجمة";
        elementTranslationCache.set(element, errorMsg);
        tooltip.textContent = errorMsg;
      }
    } else {
      // Reposition with cached content
      const newRect = element.getBoundingClientRect();
      tooltip.style.left = newRect.left + newRect.width / 2 - tooltip.offsetWidth / 2 + "px";
      tooltip.style.top = newRect.top - tooltip.offsetHeight - 10 + "px";
    }
  };

  const hideTooltip = () => {
    const tooltip = document.getElementById("translation-tooltip");
    if (tooltip) {
      tooltip.style.display = "none";
    }
  };

  const addTooltipEvents = (element, text) => {
    let hoverTimeout;

    // Store original text for background translation
    element.dataset.originalText = text;

    // Observe element for viewport translation
    viewportObserver.observe(element);

    element.addEventListener("mouseenter", () => {
      showTooltip(element, text);
    });

    element.addEventListener("mouseleave", () => {
      clearTimeout(hoverTimeout);
      hideTooltip();
    });

    element.addEventListener("mousemove", e => {
      const tooltip = document.getElementById("translation-tooltip");
      if (tooltip && tooltip.style.display === "block") {
        tooltip.style.left = e.pageX - tooltip.offsetWidth / 2 + "px";
        tooltip.style.top = e.pageY - tooltip.offsetHeight - 10 + "px";
      }
    });
  };

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

  // Funktion til at fremhæve søgeord i tekst
  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm || searchTerm.trim() === "") return text;

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return text.replace(regex, '<span class="highlight">$1</span>');
  };

  // Funktion til at opdatere resultattælleren
  const updateResultsHeader = count => {
    if (count > 0) {
      resultsHeader.textContent = `Fandt ${count} matchende spørgsmål.`;
    } else {
      resultsHeader.textContent = "Ingen resultater.";
    }
  };

  // Funktion til at oprette spørgsmålskortet
  const createQuestionCard = (q, index, searchTerm = "") => {
    const card = document.createElement("div");
    card.className = "question-card";

    const questionText = document.createElement("div");
    questionText.className = "question-text";
    const highlightedQuestion = highlightSearchTerm(`${index}: ${q.question}`, searchTerm);
    questionText.innerHTML = highlightedQuestion;

    // Add tooltip for question text
    addTooltipEvents(questionText, q.question);

    const answerList = document.createElement("ul");
    answerList.className = "answer-list";

    q.answers.forEach((answer, ansIndex) => {
      const li = document.createElement("li");
      const highlightedAnswer = highlightSearchTerm(answer, searchTerm);
      li.innerHTML = highlightedAnswer;
      if (ansIndex === q.correctIndex) {
        li.className = "correct-answer";
      } else {
        li.className = "incorrect-answer";
      }

      // Add tooltip for answer text
      addTooltipEvents(li, answer);

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
          const questionCard = createQuestionCard(q, originalIndex + 1, rawSearchTerm);
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

  // Scroll to top functionality
  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  const handleScroll = () => {
    // Show button when user scrolls down more than 300px
    if (window.pageYOffset > 300) {
      scrollToTopButton.classList.add("visible");
    } else {
      scrollToTopButton.classList.remove("visible");
    }
  };

  // Add scroll event listener
  window.addEventListener("scroll", handleScroll);

  // Add click event listener to scroll-to-top button
  scrollToTopButton.addEventListener("click", handleScrollToTop);

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
