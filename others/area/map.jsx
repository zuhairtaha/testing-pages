
        // --- ICON DEFINITIONS ---
        // Since we cannot "import" lucide-react in a simple HTML file easily,
        // we define the icons here as simple components.
        const ChevronLeft = () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        );

        const ChevronRight = () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
        );

        const Info = () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        );

        const BookOpen = () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        );

        const MapIcon = () => (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" x2="9" y1="3" y2="18"/><line x1="15" x2="15" y1="6" y2="21"/></svg>
        );

        // --- MAIN COMPONENT ---
        const DanishHistoryMap = () => {
            const [currentIndex, setCurrentIndex] = React.useState(0); // Note: React.useState
            const [showLabels, setShowLabels] = React.useState(true);

            // Historical Data Stages
            const timeline = [
                {
                    year: 1397,
                    title: "اتحاد كالمار (Kalmarunionen)",
                    description: "توحدت الدنمارك والنرويج والسويد تحت حكم ملك واحد (الملكة Margrete I). كانت الدنمارك قوة عظمى في إسكندنافيا. يمثل هذا 'أقصى اتساع' لغرض هذا التصور.",
                    activeRegions: ['jylland', 'sjaelland_fyn', 'bornholm', 'nordslesvig', 'sydslesvig', 'holsten', 'skane_land', 'norge']
                },
                {
                    year: 1658,
                    title: "معاهدة روسكيلدة (Roskildefreden) - خسارة الشرق",
                    description: "خسارة مدمرة. تنازلت الدنمارك عن Skåne و Halland و Blekinge للسويد. فقدت الدنمارك ثلث أراضيها وسكانها. أصبح مضيق Øresund حدوداً بحرية، وليس نهراً دنماركياً داخلياً.",
                    activeRegions: ['jylland', 'sjaelland_fyn', 'bornholm', 'nordslesvig', 'sydslesvig', 'holsten', 'norge']
                },
                {
                    year: 1814,
                    title: "معاهدة كييل (Kielerfreden) - خسارة النرويج",
                    description: "نتيجة للحروب النابليونية (حيث وقفت الدنمارك بجانب نابليون)، أُجبرت الدنمارك على التنازل عن Norge (النرويج) للسويد. انتهى الاتحاد الذي دام أكثر من 400 عام.",
                    activeRegions: ['jylland', 'sjaelland_fyn', 'bornholm', 'nordslesvig', 'sydslesvig', 'holsten']
                },
                {
                    year: 1864,
                    title: "حرب شليسفيغ الثانية (Slaget ved Dybbøl) - الكارثة",
                    description: "خسرت الدنمارك الحرب ضد بروسيا والنمسا. فقدت الدنمارك دوقيات Slesvig (شليسفيغ) و Holsten (هولشتاين) و Lauenburg. كانت هذه أدنى نقطة من حيث المساحة في تاريخ الدنمارك.",
                    activeRegions: ['jylland', 'sjaelland_fyn', 'bornholm']
                },
                {
                    year: 1920,
                    title: "إعادة التوحيد (Genforeningen)",
                    description: "بعد الحرب العالمية الأولى، تم إجراء استفتاء. صوت شمال Slesvig للعودة إلى الدنمارك (أصبح Nordslesvig). صوت جنوب Slesvig للبقاء مع ألمانيا. أسس هذا الحدود الدنماركية الألمانية الحالية.",
                    activeRegions: ['jylland', 'sjaelland_fyn', 'bornholm', 'nordslesvig']
                }
            ];

            // SVG Path Definitions
            const regions = {
                norge: {
                path: "M 180 50 C 250 30, 320 20, 380 60 C 410 90, 380 220, 350 280 C 300 320, 220 310, 150 280 C 120 250, 100 150, 130 80 C 150 60, 160 55, 180 50 Z",
                name: "Norge (النرويج)",
                center: { x: 240, y: 160 }
                },
                skane_land: {
                path: "M 435 440 C 460 420, 490 410, 520 430 C 540 450, 560 490, 540 530 C 520 550, 480 540, 450 525 C 440 500, 430 470, 435 440 Z",
                name: "Skåne, Halland & Blekinge",
                center: { x: 495, y: 480 }
                },
                jylland: {
                path: "M 240 370 C 270 360, 290 380, 300 400 C 310 430, 290 460, 285 500 L 280 560 L 190 550 C 180 500, 170 450, 200 400 C 210 380, 230 375, 240 370 Z",
                name: "Jylland (يوتلاند)",
                center: { x: 245, y: 460 }
                },
                sjaelland_fyn: {
                path: "M 310 490 C 340 470, 380 460, 410 480 C 430 510, 410 550, 380 560 C 350 570, 320 550, 300 520 C 300 505, 305 495, 310 490 Z",
                name: "Sjælland & Fyn (زيلاند وفون)",
                center: { x: 360, y: 515 }
                },
                bornholm: {
                path: "M 475 545 L 495 540 L 505 560 L 480 565 Z",
                name: "Bornholm",
                center: { x: 488, y: 552 }
                },
                nordslesvig: {
                path: "M 190 550 L 280 560 L 275 605 L 195 595 Z",
                name: "Nordslesvig (شمال شليسفيغ)",
                center: { x: 235, y: 575 }
                },
                sydslesvig: {
                path: "M 195 595 L 275 605 L 285 645 L 205 640 Z",
                name: "Sydslesvig (جنوب شليسفيغ)",
                center: { x: 240, y: 620 }
                },
                holsten: {
                path: "M 205 640 L 285 645 L 300 690 L 210 685 Z",
                name: "Holsten (هولشتاين)",
                center: { x: 250, y: 665 }
                }
            };

            const currentEra = timeline[currentIndex];

            const handleSlide = (e) => {
                setCurrentIndex(parseInt(e.target.value));
            };

            const nextEra = () => {
                if (currentIndex < timeline.length - 1) setCurrentIndex(currentIndex + 1);
            };

            const prevEra = () => {
                if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
            };

            return (
                <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-4 md:p-8 flex flex-col items-center" dir="rtl">
                
                {/* Header */}
                <header className="max-w-3xl w-full mb-6 text-center">
                    <h1 className="text-3xl font-bold text-red-700 mb-2 flex items-center justify-center gap-2">
                    <MapIcon />
                    خريطة الدنمارك التاريخية
                    </h1>
                    <p className="text-slate-600 text-lg">
                    تخيل التغيرات الإقليمية استعداداً لاختبار الجنسية (Indfødsretsprøve).
                    </p>
                </header>

                <div className="bg-white rounded-xl shadow-xl p-4 max-w-6xl w-full grid md:grid-cols-2 gap-8 border border-slate-200">
                    
                    {/* Left Column (Visual): The Map */}
                    <div className="relative w-full aspect-[3/4] bg-blue-50 rounded-lg overflow-hidden border-2 border-blue-100 md:order-last">
                    <div className="absolute top-2 left-2 z-10">
                        <button 
                        onClick={() => setShowLabels(!showLabels)}
                        className="bg-white/80 backdrop-blur p-2 rounded-full shadow hover:bg-white transition text-xs font-bold text-slate-600"
                        >
                        {showLabels ? "إخفاء الأسماء" : "إظهار الأسماء"}
                        </button>
                    </div>

                    <svg viewBox="0 0 600 800" className="w-full h-full drop-shadow-lg">
                        <defs>
                        <pattern id="pattern-dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1" className="text-blue-200 fill-current" />
                        </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#pattern-dots)" opacity="0.5" />

                        {Object.keys(regions).map((regionKey) => {
                        const regionData = regions[regionKey];
                        const isActive = currentEra.activeRegions.includes(regionKey);
                        const wasActive = timeline[0].activeRegions.includes(regionKey);

                        let fillClass = "fill-gray-300";
                        let strokeClass = "stroke-gray-400";
                        let opacity = 0.3;

                        if (isActive) {
                            fillClass = "fill-red-600";
                            strokeClass = "stroke-white";
                            opacity = 1;
                        } else if (wasActive) {
                            fillClass = "fill-slate-400";
                            strokeClass = "stroke-slate-500 stroke-dashed";
                            opacity = 0.4;
                        } else {
                            opacity = 0;
                        }

                        return (
                            <g key={regionKey} className="transition-all duration-700 ease-in-out">
                            <path 
                                d={regionData.path} 
                                className={`${fillClass} ${strokeClass} stroke-2 hover:opacity-80`}
                                style={{ opacity }}
                            />
                            {showLabels && opacity > 0.1 && (
                                <text
                                style={{ textShadow: '0 0 2px rgba(0, 0, 0, 1)' }}
                                x={regionData.center.x} 
                                y={regionData.center.y} 
                                className={`text-[14px] font-semibold text-center pointer-events-none select-none ${isActive ? 'fill-white' : 'fill-slate-800'}`}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                >
                                {regionData.name}
                                </text>
                            )}
                            </g>
                        );
                        })}
                    </svg>
                    
                    <div className="absolute bottom-4 right-4 bg-white/90 p-3 rounded-lg shadow text-xs space-y-2 backdrop-blur-sm text-right">
                        <div className="flex items-center gap-2 justify-end">
                        <span>Danmark (الدنمارك)</span>
                        <div className="w-4 h-4 bg-red-600 border border-white"></div>
                        </div>
                        <div className="flex items-center gap-2 justify-end">
                        <span>أراضي مفقودة</span>
                        <div className="w-4 h-4 bg-slate-400 opacity-50 border border-slate-500 border-dashed"></div>
                        </div>
                    </div>
                    </div>

                    {/* Right Column (Controls & Info) */}
                    <div className="flex flex-col justify-center space-y-6 md:order-first">
                    
                    <div className="bg-slate-100 p-6 rounded-xl border border-slate-200" dir="ltr">
                        <div className="flex justify-between items-center mb-4">
                        <button onClick={prevEra} disabled={currentIndex === 0} className="p-2 rounded-full hover:bg-white disabled:opacity-30 transition">
                            <ChevronLeft />
                        </button>
                        <span className="text-4xl font-black text-slate-700">{currentEra.year}</span>
                        <button onClick={nextEra} disabled={currentIndex === timeline.length - 1} className="p-2 rounded-full hover:bg-white disabled:opacity-30 transition">
                            <ChevronRight />
                        </button>
                        </div>
                        
                        <input 
                        type="range" 
                        min="0" 
                        max={timeline.length - 1} 
                        value={currentIndex} 
                        onChange={handleSlide}
                        className="w-full h-2 bg-slate-300 rounded-lg appearance-none cursor-pointer accent-red-600"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-2 font-mono font-bold">
                        <span>1397</span>
                        <span>اليوم</span>
                        </div>
                    </div>

                    <div className="flex-grow flex flex-col text-right">
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">{currentEra.title}</h2>
                        
                        <div className="bg-red-50 border-r-4 border-red-500 p-4 rounded-l-lg mb-4">
                        <div className="flex items-start gap-3 flex-row-reverse">
                            <div className="text-red-500 w-6 h-6 flex-shrink-0 mt-1"><Info /></div>
                            <p className="text-slate-700 leading-relaxed font-medium">
                            {currentEra.description}
                            </p>
                        </div>
                        </div>

                        <div className="mt-auto bg-white border border-yellow-200 rounded-lg p-4 shadow-sm text-right">
                        <div className="flex items-center justify-end gap-2 mb-2 text-yellow-700 font-bold text-sm uppercase tracking-wide">
                            <span>نصيحة للامتحان</span>
                            <div className="w-4 h-4"><BookOpen /></div>
                        </div>
                        <p className="text-sm text-slate-600 italic" dir="rtl">
                            {currentIndex === 1 && "تذكر عام 1658! خسارة Skåne هي السبب في أن København (كوبنهاغن) تقع على 'حافة' الدنمارك اليوم، بدلاً من الوسط."}
                            {currentIndex === 3 && "عام 1864 هو صدمة وطنية. خسارة Slesvig حددت السياسة الخارجية الدنماركية (سياسة الحياد) حتى الحرب العالمية الثانية."}
                            {currentIndex === 4 && "Genforeningen (إعادة التوحيد) لعام 1920 هي المرة الوحيدة التي تغيرت فيها الحدود سلمياً عن طريق تصويت ديمقراطي (استفتاء)."}
                            {currentIndex === 0 && "اتحاد كالمار (Kalmarunionen) تمحور حول الملكية المشتركة، وتحديداً تحت حكم الملكة Margrete I."}
                            {currentIndex === 2 && "خسارة Norge (النرويج) قلصت الدنمارك من قوة إقليمية إلى دولة أوروبية صغيرة."}
                        </p>
                        </div>
                    </div>

                    </div>
                </div>
                </div>
            );
        };

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(<DanishHistoryMap />);