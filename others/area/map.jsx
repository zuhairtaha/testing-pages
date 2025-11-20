// --- ICONS ---
const ChevronLeft = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>;
const ChevronRight = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
const Info = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>;
const Key = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 2-2 2m-7.6 7.6a6.5 6.5 0 1 1 5.3 5.3L3 21l-2-2 3-3.7z"/></svg>;

// --- MAIN COMPONENT ---
const DanishHistoryMap = () => {
    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [showLabels, setShowLabels] = React.useState(true);

    // Keyboard navigation
    React.useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') {
                setCurrentIndex(prev => Math.max(prev - 1, 0));
            } else if (e.key === 'ArrowLeft') {
                setCurrentIndex(prev => Math.min(prev + 1, timeline.length - 1));
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Historical Data Stages
    const timeline = [
        {
            year: 1397,
            title: "اتحاد كالمار (Kalmarunionen)",
            description: "توحدت الممالك الثلاث (الدنمارك، النرويج، السويد) تحت حكم الملكة مارغريت الأولى (Margrete 1.). كانت الدنمارك القوة المسيطرة.",
            examTip: "في الامتحان: ركز على اسم الملكة 'Margrete 1.' وأن الاتحاد شمل الدول الثلاث.",
            activeRegions: ['jylland', 'sjaelland_fyn', 'bornholm', 'nordslesvig', 'sydslesvig', 'holsten', 'skane_land', 'norge', 'island', 'faeroerne', 'gronland']
        },
        {
            year: 1658,
            title: "معاهدة روسكيلدة (Roskildefreden)",
            description: "خسارة مدمرة أمام السويد. تنازلت الدنمارك عن سكونة (Skåne)، هالاند وبليكينج. تحولت كوبنهاغن من مركز المملكة إلى مدينة حدودية.",
            examTip: "في الامتحان: هذا التاريخ يفسر لماذا الدنمارك صغيرة اليوم ولماذا كوبنهاغن تقع على الطرف.",
            activeRegions: ['jylland', 'sjaelland_fyn', 'bornholm', 'nordslesvig', 'sydslesvig', 'holsten', 'norge', 'island', 'faeroerne', 'gronland']
        },
        {
            year: 1814,
            title: "معاهدة كييل (Kielerfreden) - خسارة النرويج",
            description: "بسبب التحالف مع نابليون الخاسر، أُجبرت الدنمارك على التنازل عن النرويج للسويد. لكنها احتفظت بالمستعمرات (أيسلندا، جزر فارو، غرينلاند).",
            examTip: "مهم: احتفظت الدنمارك بـ 'جزر الأطلسي' (التي كانت تابعة للنرويج أصلاً) وهذا هو أساس Rigsfællesskabet اليوم.",
            activeRegions: ['jylland', 'sjaelland_fyn', 'bornholm', 'nordslesvig', 'sydslesvig', 'holsten', 'island', 'faeroerne', 'gronland']
        },
        {
            year: 1864,
            title: "معركة ديبول (Slaget ved Dybbøl)",
            description: "الهزيمة الكبرى أمام بروسيا (ألمانيا). خسارة دوقيات شليسفيغ وهولشتاين. أصبح الشعار 'ما خسرناه في الخارج، سنكسبه في الداخل' (زراعة الأرض).",
            examTip: "كلمات مفتاحية: 'Dybbøl Mølle' (طاحونة ديبول)، الهزيمة الوطنية، بداية سياسة الحياد.",
            activeRegions: ['jylland', 'sjaelland_fyn', 'bornholm', 'island', 'faeroerne', 'gronland']
        },
        {
            year: 1920,
            title: "إعادة التوحيد (Genforeningen)",
            description: "بعد استفتاء سلمي (Afstemning)، عاد شمال شليسفيغ للدنمارك. عبر الملك كريستيان العاشر الحدود على حصان أبيض.",
            examTip: "كلمات مفتاحية: 'Christian 10.'، 'Den hvide hest'، التغيير تم عبر 'Folkeafstemning' (استفتاء) وليس حرب.",
            activeRegions: ['jylland', 'sjaelland_fyn', 'bornholm', 'nordslesvig', 'island', 'faeroerne', 'gronland']
        },
        {
            year: 1944,
            title: "استقلال أيسلندا (Islands selvstændighed)",
            description: "أثناء الحرب العالمية الثانية، بينما كانت الدنمارك محتلة من ألمانيا، أعلنت أيسلندا استقلالها التام وأصبحت جمهورية.",
            examTip: "سؤال متكرر: متى استقلت أيسلندا؟ 1944. العلاقة انتهت.",
            activeRegions: ['jylland', 'sjaelland_fyn', 'bornholm', 'nordslesvig', 'faeroerne', 'gronland']
        },
        {
            year: 2025,
            title: "الدنمارك اليوم (Rigsfællesskabet)",
            description: "الحدود الحالية. غرينلاند وجزر فارو يتمتعان بالحكم الذاتي (Hjemmestyre / Selvstyre) لكنهما جزء من المملكة.",
            examTip: "كلمات مفتاحية: 'Rigsfællesskabet' (مجتمع المملكة). غرينلاند وفارو ليسا أعضاء في الاتحاد الأوروبي (EU).",
            activeRegions: ['jylland', 'sjaelland_fyn', 'bornholm', 'nordslesvig', 'faeroerne', 'gronland']
        }
    ];

    // SVG Data - Extended viewBox to include North Atlantic abstractly
    const regions = {
        gronland: {
            path: "M 20 40 L 100 30 L 120 150 L 40 180 Z", // Stylized abstract shape
            name: "Grønland",
            center: { x: 60, y: 100 }
        },
        island: {
            path: "M 150 100 L 190 90 L 200 120 L 160 130 Z",
            name: "Island",
            center: { x: 175, y: 110 }
        },
        faeroerne: {
            path: "M 220 160 L 235 160 L 235 175 L 220 175 Z",
            name: "Færøerne",
            center: { x: 228, y: 150 } // Label positioned above
        },
        norge: {
            path: "M 280 50 C 350 30, 420 20, 480 60 C 510 90, 480 220, 450 280 C 400 320, 320 310, 250 280 C 220 250, 200 150, 230 80 C 250 60, 260 55, 280 50 Z",
            name: "Norge",
            center: { x: 340, y: 160 }
        },
        skane_land: {
            path: "M 535 440 C 560 420, 590 410, 620 430 C 640 450, 660 490, 640 530 C 620 550, 580 540, 550 525 C 540 500, 530 470, 535 440 Z",
            name: "Skåne",
            center: { x: 595, y: 480 }
        },
        jylland: {
            path: "M 340 370 C 370 360, 390 380, 400 400 C 410 430, 390 460, 385 500 L 380 560 L 290 550 C 280 500, 270 450, 300 400 C 310 380, 330 375, 340 370 Z",
            name: "Jylland",
            center: { x: 345, y: 460 }
        },
        sjaelland_fyn: {
            path: "M 410 490 C 440 470, 480 460, 510 480 C 530 510, 510 550, 480 560 C 450 570, 420 550, 400 520 C 400 505, 405 495, 410 490 Z",
            name: "Sj. & Fyn",
            center: { x: 460, y: 515 }
        },
        bornholm: {
            path: "M 575 545 L 595 540 L 605 560 L 580 565 Z",
            name: "Bornholm",
            center: { x: 588, y: 552 }
        },
        nordslesvig: {
            path: "M 290 550 L 380 560 L 375 605 L 295 595 Z",
            name: "Nordslesvig",
            center: { x: 335, y: 575 }
        },
        sydslesvig: {
            path: "M 295 595 L 375 605 L 385 645 L 305 640 Z",
            name: "Sydslesvig",
            center: { x: 340, y: 620 }
        },
        holsten: {
            path: "M 305 640 L 385 645 L 400 690 L 310 685 Z",
            name: "Holsten",
            center: { x: 350, y: 665 }
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
        <div className="h-full w-full p-4 flex flex-col" dir="rtl">
            
            <div className="bg-white rounded-xl shadow-2xl w-full h-full flex flex-col md:grid md:grid-cols-3 overflow-hidden border border-slate-300">
                
                {/* LEFT COLUMN: Map (Takes 2/3 space now) */}
                <div className="relative bg-blue-100 h-full md:col-span-2 md:order-last overflow-hidden">
                    
                    {/* Toggle Labels Button */}
                    <div className="absolute top-4 right-4 z-10">
                        <button 
                            onClick={() => setShowLabels(!showLabels)}
                            className="bg-white/90 hover:bg-white text-slate-700 px-3 py-1 rounded-md shadow font-bold text-sm transition"
                        >
                            {showLabels ? "إخفاء الأسماء" : "إظهار الأسماء"}
                        </button>
                    </div>

                    {/* The Map */}
                    <svg viewBox="0 0 700 800" className="w-full h-full object-contain drop-shadow-xl" preserveAspectRatio="xMidYMid meet">
                        <defs>
                            <pattern id="water-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1.5" className="text-blue-200 fill-current" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#water-pattern)" opacity="0.6" />

                        {/* Helper Lines connecting north atlantic (optional visual cue) */}
                        <line x1="120" y1="100" x2="280" y2="150" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="5,5" opacity="0.5" />

                        {Object.keys(regions).map((regionKey) => {
                            const regionData = regions[regionKey];
                            const isActive = currentEra.activeRegions.includes(regionKey);
                            const wasActive = timeline[0].activeRegions.includes(regionKey);

                            let fillClass = "fill-gray-300";
                            let strokeClass = "stroke-gray-400";
                            let opacity = 0.3;
                            let labelColor = "fill-slate-600";

                            if (isActive) {
                                fillClass = "fill-red-600";
                                strokeClass = "stroke-white";
                                opacity = 1;
                                labelColor = "fill-white map-label-shadow";
                            } else if (wasActive) {
                                fillClass = "fill-slate-400";
                                strokeClass = "stroke-slate-500 stroke-dashed";
                                opacity = 0.5;
                                labelColor = "fill-slate-600";
                            } else {
                                opacity = 0.1; // Faded drastically if never relevant
                            }

                            return (
                                <g key={regionKey} className="transition-all duration-700 ease-in-out">
                                    <path 
                                        d={regionData.path} 
                                        className={`${fillClass} ${strokeClass} stroke-2 hover:opacity-90 cursor-pointer`}
                                        style={{ opacity }}
                                    >
                                        <title>{regionData.name}</title>
                                    </path>
                                    {showLabels && opacity > 0.2 && (
                                        <text 
                                            x={regionData.center.x} 
                                            y={regionData.center.y} 
                                            className={`text-[14px] font-bold text-center pointer-events-none select-none ${labelColor}`}
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

                    {/* Legend */}
                    <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded-lg shadow-lg text-sm backdrop-blur-sm flex flex-col gap-2" dir="rtl">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-600 border border-white shadow-sm"></div>
                            <span className="font-bold text-slate-700">مملكة الدنمارك</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-slate-400 opacity-60 border border-slate-500 border-dashed"></div>
                            <span className="text-slate-600">أراضي مفقودة/مستقلة</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Controls & Info (Takes 1/3 space) */}
                <div className="bg-slate-50 p-6 flex flex-col md:col-span-1 md:order-first border-r border-slate-200 overflow-y-auto" dir="rtl">
                    
                    {/* Timeline Slider Section */}
                    <div className="mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between items-center mb-4" dir="ltr">
                            <button onClick={prevEra} disabled={currentIndex === 0} className="p-2 hover:bg-slate-100 rounded-full disabled:opacity-30 transition active:scale-95">
                                <ChevronLeft />
                            </button>
                            <span className="text-4xl font-black text-red-700 tabular-nums tracking-tighter">{currentEra.year}</span>
                            <button onClick={nextEra} disabled={currentIndex === timeline.length - 1} className="p-2 hover:bg-slate-100 rounded-full disabled:opacity-30 transition active:scale-95">
                                <ChevronRight />
                            </button>
                        </div>
                        
                        <input 
                            type="range" 
                            min="0" 
                            max={timeline.length - 1} 
                            value={currentIndex} 
                            onChange={handleSlide}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600 mb-2"
                        />
                        <div className="flex justify-between text-xs text-slate-400 font-bold px-1">
                            <span>البداية</span>
                            <span>النهاية</span>
                        </div>
                        <div className="text-center mt-2 text-xs text-slate-400 flex items-center justify-center gap-1">
                            <span className="bg-slate-200 px-1 rounded border border-slate-300">←</span>
                            <span className="bg-slate-200 px-1 rounded border border-slate-300">→</span>
                            <span>استخدم الأسهم للتنقل</span>
                        </div>
                    </div>

                    {/* Content Section */}
                    <div className="flex-grow">
                        <h2 className="text-2xl font-extrabold text-slate-800 mb-3 leading-tight border-b pb-2 border-slate-200">
                            {currentEra.title}
                        </h2>
                        
                        {/* Main Description */}
                        <div className="text-lg text-slate-700 leading-relaxed mb-4 font-medium">
                            {currentEra.description}
                        </div>

                        {/* Exam Tip Box - Integrated immediately after text */}
                        <div className="bg-yellow-50 border-r-4 border-yellow-400 p-4 rounded-md shadow-sm my-4">
                            <div className="flex items-center gap-2 mb-2 text-yellow-800 font-bold text-sm uppercase">
                                <Key />
                                <span>نصيحة للامتحان</span>
                            </div>
                            <p className="text-slate-700 text-base italic font-semibold">
                                {currentEra.examTip}
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