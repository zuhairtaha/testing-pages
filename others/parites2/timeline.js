// --- DATA: الأحزاب الحاكمة في الدنمارك (1945 - الآن) ---
// يتضمن الحزب القائد، الاختصار (الشعار)، ورئيس الوزراء، وشركاء الائتلاف، والكلمات المفتاحية (بالدنماركية والعربية)
const partyData = [
    // 1945 - 1971
    { startYear: 1945, endYear: 1947, party: "Venstre", abbreviation: "V", leader: "Knud Kristensen", coalition: "حكومة أقلية (Venstre) — دون شركاء", color: "#005E35", keywords: "Liberalisme (الليبرالية)، Landmænd/Bønder (الفلاحون)" },
    { startYear: 1947, endYear: 1950, party: "Socialdemokratiet", abbreviation: "A", leader: "Hans Hedtoft", coalition: "حكومة أقلية (Socialdemokratiet) — دون شركاء", color: "#E4002B", keywords: "Arbejderbevægelsen (الحركة العمالية)، Velfærdsstaten (دولة الرفاهية)" },
    { startYear: 1950, endYear: 1953, party: "Venstre", abbreviation: "V", leader: "Erik Eriksen", coalition: "Venstre, Det Konservative Folkeparti", color: "#005E35", keywords: "Landbrug (الزراعة)، Liberalisme (الليبرالية)" },
    { startYear: 1953, endYear: 1960, party: "Socialdemokratiet", abbreviation: "A", leader: "Hans Hedtoft, H. C. Hansen, Viggo Kampmann", coalition: "حكومة أقلية (Socialdemokratiet) — دون شركاء", color: "#E4002B", keywords: "Økonomisk ekspansion (التوسع الاقتصادي)، Social boligbyggeri (السكن الاجتماعي)" },
    { startYear: 1960, endYear: 1964, party: "Socialdemokratiet", abbreviation: "A", leader: "Viggo Kampmann, Jens Otto Krag", coalition: "Socialdemokratiet, Radikale Venstre", color: "#E4002B", keywords: "Samarbejde med B (التعاون مع Radikale)، Offentlig sygesikring (التأمين الصحي العام)" },
    { startYear: 1964, endYear: 1968, party: "Socialdemokratiet", abbreviation: "A", leader: "Jens Otto Krag", coalition: "حكومة أقلية (Socialdemokratiet) — دون شركاء", color: "#E4002B", keywords: "Største parti (الحزب الأكبر)، Uddannelsesreform (إصلاح التعليم)" },
    { startYear: 1968, endYear: 1971, party: "Radikale Venstre", abbreviation: "B", leader: "Hilmar Baunsgaard", coalition: "Radikale Venstre, Det Konservative Folkeparti, Venstre", color: "#0090B4", keywords: "Midterparti (حزب الوسط)، Borgerlig koalition (ائتلاف يميني)" },
    // 1971 - 2001
    { startYear: 1971, endYear: 1973, party: "Socialdemokratiet", abbreviation: "A", leader: "Jens Otto Krag, Anker Jørgensen", coalition: "حكومة أقلية (Socialdemokratiet) — دون شركاء", color: "#E4002B", keywords: "Oliekrise (أزمة النفط)، Udvidelse af velfærd (توسيع الرفاهية)" },
    { startYear: 1973, endYear: 1975, party: "Venstre", abbreviation: "V", leader: "Poul Hartling", coalition: "حكومة أقلية (Venstre) — دون شركاء", color: "#005E35", keywords: "Mindretalsregering (حكومة أقلية)، Liberalisme (الليبرالية)" },
    { startYear: 1975, endYear: 1982, party: "Socialdemokratiet", abbreviation: "A", leader: "Anker Jørgensen", coalition: "ائتلافات متغيرة، بقيادة Socialdemokratiet", color: "#E4002B", keywords: "Anker Jørgensen، Økonomisk krise (أزمة اقتصادية)، Arbejdsløshed (البطالة)" },
    { startYear: 1982, endYear: 1993, party: "Det Konservative Folkeparti", abbreviation: "C", leader: "Poul Schlüter", coalition: "Det Konservative Folkeparti, Venstre, Kristeligt Folkeparti, Centrum-Demokraterne (Firkløverregeringen)", color: "#006A4E", keywords: "Poul Schlüter، Firkløverregeringen (الائتلاف الرباعي)، Retssikkerhed (سيادة القانون)" },
    { startYear: 1993, endYear: 2001, party: "Socialdemokratiet", abbreviation: "A", leader: "Poul Nyrup Rasmussen", coalition: "Socialdemokratiet, Radikale Venstre, Centrum-Demokraterne, Kristeligt Folkeparti (حتى 1994)", color: "#E4002B", keywords: "EU-afstemninger (استفتاءات الاتحاد الأوروبي)، Finanspolitik (السياسة المالية)" },
    // 2001 - 2024 (الآن)
    { startYear: 2001, endYear: 2009, party: "Venstre", abbreviation: "V", leader: "Anders Fogh Rasmussen", coalition: "Venstre, Det Konservative Folkeparti (بدعم من Dansk Folkeparti)", color: "#005E35", keywords: "Skattelettelser (تخفيضات ضريبية)، Grænsekontrol (الرقابة على الحدود)، Irak-krig (حرب العراق)" },
    { startYear: 2009, endYear: 2011, party: "Venstre", abbreviation: "V", leader: "Lars Løkke Rasmussen", coalition: "Venstre, Det Konservative Folkeparti (بدعم من Dansk Folkeparti)", color: "#005E35", keywords: "Pensionsreformer (إصلاحات التقاعد)، Finanskrise (الأزمة المالية)" },
    { startYear: 2011, endYear: 2015, party: "Socialdemokratiet", abbreviation: "A", leader: "Helle Thorning-Schmidt", coalition: "Socialdemokratiet, Radikale Venstre, Socialistisk Folkeparti (حتى 2014)", color: "#E4002B", keywords: "Helle Thorning-Schmidt، Rød blok (الكتلة الحمراء)، Skat (الضرائب)" },
    { startYear: 2015, endYear: 2019, party: "Venstre", abbreviation: "V", leader: "Lars Løkke Rasmussen", coalition: "ائتلافات متغيرة، بقيادة Venstre (شملت Liberal Alliance و Det Konservative Folkeparti)", color: "#005E35", keywords: "Indvandring (الهجرة)، Sundhedsreformer (إصلاحات الرعاية الصحية)" },
    { startYear: 2019, endYear: 2022, party: "Socialdemokratiet", abbreviation: "A", leader: "Mette Frederiksen", coalition: "حكومة أقلية (Socialdemokratiet) — بدعم من اليسار", color: "#E4002B", keywords: "Coronakrise (أزمة كورونا)، Klimamål (أهداف المناخ)" },
    { startYear: 2022, endYear: new Date().getFullYear(), party: "Socialdemokratiet", abbreviation: "A", leader: "Mette Frederiksen", coalition: "Socialdemokratiet, Venstre, Moderaterne (الائتلاف الواسع - Over midten)", color: "#E4002B", keywords: "Over midten (عبور الوسط)، Samarbejde (التعاون)، Forsvar (الدفاع)" }
];

/**
 * Helper function to dynamically load external JavaScript libraries (D3 and Tailwind)
 * Since Web Components need their dependencies, we load them before rendering.
 * @param {string} src
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        // Check if script is already loaded to prevent duplicates
        if (document.querySelector(`script[src="${src}"]`)) {
            return resolve(void 0);
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

class DanishParties extends HTMLElement {
    constructor() {
        super();
        // Attach Shadow DOM for style and markup encapsulation
        this.shadow = this.attachShadow({ mode: 'open' });
        this.partyData = partyData;
        this.activeBar = null;
    }

    connectedCallback() {
        // 1. Load Tailwind and D3.js scripts
        Promise.all([
            loadScript("https://cdn.tailwindcss.com"),
            loadScript("https://d3js.org/d3.v7.min.js")
        ]).then(() => {
            // 2. Render the initial HTML structure and style
            this.render();
            // 3. Draw the D3 chart and set up responsiveness
            this.drawChart();
            // Bind 'this' to maintain component context inside the event listener
            window.addEventListener('resize', this.drawChart.bind(this));
        }).catch(error => {
            this.shadow.innerHTML = `<p style="color:red; text-align: center;">خطأ في تحميل المكونات اللازمة (D3.js / Tailwind CSS).</p>`;
            console.error("Error loading scripts for DanishParties component:", error);
        });
    }

    disconnectedCallback() {
        // Clean up the event listener when the component is removed from the DOM
        window.removeEventListener('resize', this.drawChart.bind(this));
    }

    /**
     * Sets up the static HTML structure and encapsulated CSS inside the Shadow DOM.
     */
    render() {
        this.shadow.innerHTML = `
            <style>
                /* Encapsulated Custom Styles */
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap');
                
                :host {
                    display: block;
                    font-family: 'Inter', sans-serif;
                    direction: rtl; 
                }
                .timeline-container {
                    width: 95%;
                    max-width: 1200px;
                    margin: 2rem auto;
                    padding: 2rem;
                    background: #ffffff;
                    border-radius: 1rem;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
                }
                .chart-svg {
                    display: block;
                    margin: 0 auto;
                }
                #details-panel {
                    min-height: 100px;
                    padding: 1.5rem;
                    border-radius: 0.75rem;
                    background-color: #eef2ff;
                    border: 2px solid #a5b4fc;
                    transition: opacity 0.5s ease-in-out;
                }
                .party-bar {
                    cursor: pointer;
                    transition: opacity 0.2s, stroke 0.2s;
                }
                .party-bar:hover {
                    opacity: 0.9;
                }
                .party-label {
                    font-weight: bold;
                    font-size: 14px;
                    text-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
                }
            </style>
            
            <div class="timeline-container bg-white">
                <h1 class="text-3xl font-extrabold text-gray-900 mb-6 text-center border-b pb-3">الجدول الزمني للأحزاب الحاكمة في الدنمارك (1945 - الآن)</h1>
                <p class="text-gray-600 mb-8 text-center">يمثل كل شريط فترة حكم الائتلاف بقيادة الحزب. **اضغط** على أي شريط لرؤية تفاصيل الحكومة والكلمات المفتاحية من أسئلة الجنسية.</p>

                <!-- مكان عرض الرسم البياني -->
                <div id="timeline-chart" class="chart-svg"></div>

                <!-- لوحة عرض التفاصيل (تحت الرسم البياني) -->
                <div id="details-panel" class="mt-8 opacity-0">
                    <div id="details-content" class="text-center text-gray-700">
                        <p class="text-lg font-medium">الرجاء النقر على شريط زمني لعرض تفاصيل الحكومة</p>
                    </div>
                </div>
            </div>
        `;

        // Store references to chart elements for D3.js manipulation
        this.chartDiv = this.shadow.getElementById('timeline-chart');
        this.detailsPanel = window.d3.select(this.shadow.getElementById('details-panel'));
        this.detailsContent = window.d3.select(this.shadow.getElementById('details-content'));
    }

    /**
     * Handles the click interaction on the D3 rect element.
     * @param {Event} event The click event
     * @param {Object} d The data object for the clicked bar
     */
    handleClick(event, d) {
        const d3 = window.d3;
        
        // Clear previous active state
        if (this.activeBar) {
            d3.select(this.activeBar)
                .attr("stroke", "#fff")
                .attr("stroke-width", 2);
        }

        // Set new active state
        this.activeBar = event.currentTarget;
        d3.select(this.activeBar)
            .attr("stroke", "#1E40AF")
            .attr("stroke-width", 4);

        // Update details panel content
        this.detailsContent.html(`
            <p class="text-xl font-extrabold" style="color: ${d.color};">${d.party} (${d.startYear} - ${d.endYear})</p>
            <p class="text-2xl font-bold text-gray-900 mt-2">${d.leader}</p>
            <p class="text-sm font-light text-gray-500">رئيس الوزراء</p>
            
            <div class="mt-4 pt-3 border-t border-indigo-300 mx-auto w-11/12">
                <p class="text-lg font-semibold text-indigo-700 mb-2">الأحزاب المتحالفة/الائتلاف:</p>
                <p class="text-base font-medium text-gray-800">${d.coalition}</p>
            </div>

            <div class="mt-4 pt-3 border-t border-indigo-300 mx-auto w-11/12">
                <p class="text-lg font-semibold text-red-600 mb-2">كلمات مفتاحية (من أسئلة الجنسية):</p>
                <p class="text-base font-medium text-gray-800">${d.keywords}</p>
            </div>
        `);

        // Show the panel
        this.detailsPanel.style("opacity", 1);
    }

    /**
     * Draws the D3 chart dynamically based on container size.
     */
    drawChart() {
        const d3 = window.d3;
        if (!d3 || !this.chartDiv) return;

        // Reset the chart before redrawing
        d3.select(this.chartDiv).select("svg").remove();

        // Dimensions setup
        const containerWidth = this.chartDiv.clientWidth;
        const margin = { top: 20, right: 30, bottom: 40, left: 50 };
        const width = containerWidth - margin.left - margin.right;
        const height = 150;
        const barHeight = 50;

        const minYear = 1945;
        const maxYear = new Date().getFullYear() + 1;

        // Scale setup
        const xScale = d3.scaleLinear()
            .domain([minYear, maxYear])
            .range([0, width]);

        // SVG container creation
        const svg = d3.select(this.chartDiv)
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .attr("class", "chart-svg")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // X-Axis
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale).tickFormat(d3.format("d")).ticks(Math.min(10, maxYear - minYear)))
            .selectAll("text")
            .attr("fill", "#6B7280");

        // Drawing the bars
        svg.selectAll(".party-bar")
            .data(this.partyData)
            .enter()
            .append("rect")
            .attr("class", "party-bar")
            .attr("x", (/** @type {{ startYear: any; }} */ d) => xScale(d.startYear))
            .attr("width", (/** @type {{ endYear: any; startYear: any; }} */ d) => xScale(d.endYear) - xScale(d.startYear))
            .attr("y", height / 2 - barHeight / 2)
            .attr("height", barHeight)
            .attr("fill", (/** @type {{ color: any; }} */ d) => d.color)
            .attr("rx", 8)
            .attr("ry", 8)
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            // Use .bind(this) to pass the component instance context to the handler
            .on("click", this.handleClick.bind(this));

        // Adding labels (abbreviation/shorthand)
        svg.selectAll(".party-label")
            .data(this.partyData)
            .enter()
            .append("text")
            .attr("class", "party-label")
            .attr("x", (/** @type {{ startYear: any; endYear: any; }} */ d) => xScale(d.startYear) + (xScale(d.endYear) - xScale(d.startYear)) / 2)
            .attr("y", height / 2 + 7)
            .attr("text-anchor", "middle")
            .text((/** @type {{ abbreviation: any; }} */ d) => d.abbreviation)
            .attr("fill", "#ffffff")
            .attr("font-size", (/** @type {{ endYear: any; startYear: any; }} */ d) => (xScale(d.endYear) - xScale(d.startYear) > 40 ? "14px" : "0px"))
            .style("pointer-events", "none");
    }
}

// Define the custom element so it can be used in HTML
customElements.define('danish-parties', DanishParties);