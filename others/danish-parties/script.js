// Data for political parties
const partyData = [
  {
    logo: "https://placehold.co/100x50/F6433F/FFFFFF?text=A",
    nameDa: "Socialdemokratiet",
    nameAr: "الحزب الاشتراكي الديمقراطي",
    description:
      "حزب يسار وسط، وهو أكبر حزب في الدنمارك تاريخياً. يركز على دولة الرفاهية والعدالة الاجتماعية والاقتصاد المختلط.",
    leader: "ميتي فريدريكسن (Mette Frederiksen)",
    founded: 1871,
    members: 41500,
    seats: 50,
    govYears: "1924-26, 1929-40, 1945, 1947-50, 1953-68, 1971, 1972-73, 1975-82, 1993-2001, 2011-2015, 2019-الآن",
    keywords: [
      "Socialdemokratiet",
      "الاشتراكي الديمقراطي",
      "Mette Frederiksen",
      "Thorvald Stauning",
      "Poul Nyrup Rasmussen",
      "Helle Thorning-Schmidt",
      "Nina Bang",
      "Anker Jørgensen",
      "Jens Otto Krag"
    ]
  },
  {
    logo: "https://placehold.co/100x50/004470/FFFFFF?text=V",
    nameDa: "Venstre",
    nameAr: "الحزب الليبرالي (فينسترا)",
    description: "حزب يمين وسط ليبرالي محافظ. يدعم اقتصاد السوق الحر، تخفيض الضرائب، واللامركزية.",
    leader: "ترويلز لوند بولسن (Troels Lund Poulsen)",
    founded: 1870,
    members: 28000,
    seats: 23,
    govYears: "1901-09, 1910-13, 1920-24, 1926-29, 1945, 1950-53, 1968-71, 1973-75, 1982-93, 2001-2011, 2015-2019",
    keywords: ["Venstre", "فينسترا", "الليبرالي", "Lars Løkke Rasmussen", "Anders Fogh Rasmussen"]
  },
  {
    logo: "https://placehold.co/100x50/00554E/FFFFFF?text=C",
    nameDa: "Det Konservative Folkeparti",
    nameAr: "حزب الشعب المحافظ",
    description: "حزب يمين وسط محافظ، يركز على الدفاع عن التقاليد الوطنية، تعزيز الدفاع، ودعم الأعمال التجارية.",
    leader: "سورين بابه بولسن (Søren Pape Poulsen)",
    founded: 1916,
    members: 18500,
    seats: 10,
    govYears: "1909-10, 1940-45 (حكومة وحدة), 1950-53, 1968-71, 1982-93",
    keywords: ["Konservative", "المحافظ", "Poul Schlüter"]
  },
  {
    logo: "https://placehold.co/100x50/990000/FFFFFF?text=F",
    nameDa: "Socialistisk Folkeparti (SF)",
    nameAr: "حزب الشعب الاشتراكي",
    description: "حزب يسار يركز على الاشتراكية الشعبية، حماية البيئة، والنسوية. يدعم دولة رفاهية قوية.",
    leader: "بيا أولسن ديور (Pia Olsen Dyhr)",
    founded: 1959,
    members: 17800,
    seats: 15,
    govYears: "لم يترأس الحكومة قط",
    keywords: ["SF ", "Socialistisk Folkeparti", "الشعب الاشتراكي", "Pia Olsen Dyhr"]
  },
  {
    logo: "https://placehold.co/100x50/EB008B/FFFFFF?text=B",
    nameDa: "Radikale Venstre",
    nameAr: "الحزب الليبرالي الاجتماعي",
    description:
      "حزب وسط ليبرالي اجتماعي. يدعم التعاون الدولي، الحقوق المدنية، اقتصاد السوق الاجتماعي، والإصلاحات التعليمية.",
    leader: "مارتن ليديجارد (Martin Lidegaard)",
    founded: 1905,
    members: 13000,
    seats: 7,
    govYears: "1909-10, 1913-20, 1968-71, 2011-2015 (كجزء من ائتلاف)",
    keywords: ["Radikale Venstre", "اليسار الراديكالي", "الليبرالي الاجتماعي", "Margrethe Vestager"]
  },
  {
    logo: "https://placehold.co/100x50/FF0000/FFFFFF?text=Ø",
    nameDa: "Enhedslisten",
    nameAr: "القائمة الموحدة",
    description:
      "تحالف يساري راديكالي يجمع بين الشيوعيين والاشتراكيين. يركز على مكافحة عدم المساواة، والبيئة، وحقوق العمال.",
    leader: "قيادة جماعية",
    founded: 1989,
    members: 9500,
    seats: 9,
    govYears: "لم يترأس الحكومة قط",
    keywords: ["Enhedslisten", "القائمة الموحدة"]
  },
  {
    logo: "https://placehold.co/100x50/063161/FFFFFF?text=I",
    nameDa: "Liberal Alliance",
    nameAr: "التحالف الليبرالي",
    description:
      "حزب ليبرالي كلاسيكي (يميني)، يدعو إلى تخفيضات ضريبية كبيرة، وتقليص دور الدولة، وزيادة الحريات الفردية.",
    leader: "أليكس فاندوبسلاغ (Alex Vanopslagh)",
    founded: 2007,
    members: 8500,
    seats: 14,
    govYears: "لم يترأس الحكومة قط",
    keywords: ["Liberal Alliance", "التحالف الليبرالي"]
  },
  {
    logo: "https://placehold.co/100x50/FFD400/000000?text=O",
    nameDa: "Dansk Folkeparti (DF)",
    nameAr: "حزب الشعب الدنماركي",
    description:
      "حزب يميني وطني محافظ وشعبي. يركز بشكل كبير على تقييد الهجرة، الحفاظ على الثقافة الدنماركية، ودعم كبار السن.",
    leader: "مورتن ميسيرشميت (Morten Messerschmidt)",
    founded: 1995,
    members: 7800,
    seats: 5,
    govYears: "لم يترأس الحكومة قط",
    keywords: ["Dansk Folkeparti", "DF", "الشعب الدنماركي", "Pia Kjærsgaard"]
  },
  {
    logo: "https://placehold.co/100x50/6633FF/FFFFFF?text=M",
    nameDa: "Moderaterne",
    nameAr: "المعتدلون",
    description: "حزب وسطي براغماتي، يهدف إلى التعاون بين كتل اليسار واليمين التقليدية وإجراء إصلاحات هيكلية.",
    leader: "لارس لوكه راسموسن (Lars Løkke Rasmussen)",
    founded: 2022,
    members: 5000,
    seats: 16,
    govYears: "لم يترأس الحكومة قط",
    keywords: ["Moderaterne", "المعتدلون"]
  },
  {
    logo: "https://placehold.co/100x50/41B08F/FFFFFF?text=Å",
    nameDa: "Alternativet",
    nameAr: "البديل",
    description: "حزب يسار أخضر تقدمي، يركز بشكل أساسي على الاستدامة البيئية والاجتماعية والثقافية.",
    leader: "فرانسيسكا روزنكيلده (Franciska Rosenkilde)",
    founded: 2013,
    members: 4200,
    seats: 6,
    govYears: "لم يترأس الحكومة قط",
    keywords: ["Alternativet", "البديل"]
  },
  {
    logo: "https://placehold.co/100x50/002E54/FFFFFF?text=Æ",
    nameDa: "Danmarksdemokraterne",
    nameAr: "ديمقراطيو الدنمارك",
    description: "حزب يميني شعبي، يركز على مصالح المناطق خارج المدن الكبرى، وتقييد الهجرة، وخفض الضرائب على السيارات.",
    leader: "إنغر ستويبرغ (Inger Støjberg)",
    founded: 2022,
    members: 3500,
    seats: 14,
    govYears: "لم يترأس الحكومة قط",
    keywords: ["Danmarksdemokraterne", "ديمقراطيو الدنمارك", "Inger Støjberg"]
  },
  {
    logo: "https://placehold.co/100x50/1C385B/FFFFFF?text=D",
    nameDa: "Nye Borgerlige",
    nameAr: "اليمين الجديد",
    description:
      "حزب يميني قومي محافظ متشدد، يجمع بين سياسات اقتصادية ليبرالية وموقف صارم جداً تجاه الهجرة والاتحاد الأوروبي.",
    leader: "تم حله",
    founded: 2015,
    members: 2500,
    seats: 0,
    govYears: "لم يترأس الحكومة قط",
    keywords: ["Nye Borgerlige", "اليمين الجديد"]
  }
];

// Citizenship test questions from the provided file
const questions = [
  {
    question: "Hvilket år blev Margrethe den 2. dronning af Danmark?",
    question_ar: "في أي عام أصبحت مارجريت الثانية ملكة الدنمارك؟",
    answers: ["1972", "1982", "1962"],
    answers_ar: ["1972", "1982", "1962"],
    correctIndex: 0
  },
  {
    question:
      "I 1959 dannede en gruppe personer, der forlod Danmarks Kommunistiske Parti (DKP), et nyt politisk parti. Hvilket parti var det?",
    question_ar:
      "في عام 1959، شكلت مجموعة من الأشخاص الذين تركوا الحزب الشيوعي الدنماركي (DKP) حزبًا سياسيًا جديدًا. أي حزب كان هذا؟",
    answers: ["SF - Socialistisk Folkeparti", "Retsforbundet", "VS - Venstresocialisterne"],
    answers_ar: ["SF - حزب الشعب الاشتراكي", "حزب العدالة", "VS - الاشتراكيون اليساريون"],
    correctIndex: 0
  },
  {
    question: "Hvilket af følgende partier er nyest?",
    question_ar: "أي من الأحزاب التالية هو الأحدث؟",
    answers: ["Det Konservative Folkeparti", "Liberal Alliance", "Enhedslisten"],
    answers_ar: ["حزب الشعب المحافظ", "التحالف الليبرالي", "القائمة الموحدة"],
    correctIndex: 1
  },
  {
    question: "Hvordan har de politiske partiers medlemstal overordnet udviklet sig siden 1950?",
    question_ar: "كيف تطور إجمالي عدد أعضاء الأحزاب السياسية منذ عام 1950؟",
    answers: ["Det er faldet", "Det er steget"],
    answers_ar: ["لقد انخفض", "لقد ارتفع"],
    correctIndex: 0
  },
  {
    question: "Hvilket parti stemte arbejderne typisk på i midten af det 20. århundrede?",
    question_ar: "ما هو الحزب الذي كان العمال يصوتون له عادة في منتصف القرن العشرين؟",
    answers: ["Socialistisk Folkeparti", "Socialdemokratiet", "Venstresocialisterne"],
    answers_ar: ["حزب الشعب الاشتراكي", "الحزب الاشتراكي الديمقراطي", "الاشتراكيون اليساريون"],
    correctIndex: 1
  },
  {
    question: "Hvilket af følgende partier har aldrig været med i en regering?",
    question_ar: "أي من الأحزاب التالية لم يشارك قط في حكومة؟",
    answers: ["Enhedslisten", "Radikale Venstre", "Socialistisk Folkeparti"],
    answers_ar: ["القائمة الموحدة", "حزب اليسار الراديكالي", "حزب الشعب الاشتراكي"],
    correctIndex: 0,
    relativeText_ar:
      "ثلاثة أحزاب، المعتدلون، حزب الشعب الاشتراكي، والتحالف الليبرالي، كانت جميعها في الحكومة لفترة قصيرة (جميعها أقل من أربع سنوات)، بينما أربعة أحزاب - ديمقراطيو الدنمارك، القائمة الموحدة، البديل، وحزب الشعب الدنماركي - لم تكن جزءًا من حكومة قط."
  },
  {
    question: "Hvad hedder formanden for Socialdemokratiet?",
    question_ar: "ما اسم رئيس الحزب الاشتراكي الديمقراطي؟",
    answers: ["Mette Frederiksen", "Pernille Skipper", "Pia Olsen Dyhr"],
    answers_ar: ["ميته فريدريكسن", "بيرنيل سكيبر", "بيا أولسن دير"],
    correctIndex: 0
  },
  {
    question: "Hvornår fik Danmark sin første socialdemokratiske statsminister?",
    question_ar: "متى حصلت الدنمارك على أول رئيس وزراء اشتراكي ديمقراطي؟",
    answers: ["1871", "1966", "1924"],
    answers_ar: ["1871", "1966", "1924"],
    correctIndex: 2
  },
  {
    question:
      "Hvilket af følgende partier har haft statsministerposten i sammenlagt flest år siden Systemskiftet i 1901?",
    question_ar: "أي من الأحزاب التالية شغل منصب رئيس الوزراء لأطول فترة إجمالية منذ تغيير النظام في عام 1901؟",
    answers: ["Venstre", "Det Konservative Folkeparti"],
    answers_ar: ["حزب اليسار (فينسترا)", "حزب الشعب المحافظ"],
    correctIndex: 0,
    relativeText_ar:
      "حزب فينسترا، أقدم حزب في الدنمارك، شغل منصب رئيس الوزراء لأطول فترة زمنية مجتمعة منذ تغيير النظام في عام 1901."
  },
  {
    question: "Hvilket af følgende danske politiske partier er ældst?",
    question_ar: "أي من الأحزاب السياسية الدنماركية التالية هو الأقدم؟",
    answers: ["Venstre", "Dansk Folkeparti", "Enhedslisten"],
    answers_ar: ["حزب اليسار (فينسترا)", "حزب الشعب الدنماركي", "القائمة الموحدة"],
    correctIndex: 0
  },
  {
    question: "Hvornår blev Enhedslisten valgt til Folketinget første gang?",
    question_ar: "متى تم انتخاب القائمة الموحدة للبرلمان الدنماركي لأول مرة؟",
    answers: ["2011", "1973", "1994"],
    answers_ar: ["2011", "1973", "1994"],
    correctIndex: 2
  },
  {
    question: "Hvilket parti tilhørte Lars Løkke Rasmussen, da han var statsminister i perioderne 2009-11 og 2015-19?",
    question_ar: "إلى أي حزب انتمى لارس لوكه راسموسن عندما كان رئيسًا للوزراء في الفترتين 2009-11 و 2015-19؟",
    answers: ["Det Konservative Folkeparti", "Socialdemokratiet", "Venstre"],
    answers_ar: ["حزب الشعب المحافظ", "الحزب الاشتراكي الديمقراطي", "حزب اليسار (فينسترا)"],
    correctIndex: 2
  },
  {
    question: "Hvornår blev Moderaterne valgt til Folketinget første gang?",
    question_ar: "متى تم انتخاب حزب المعتدلين للبرلمان الدنماركي لأول مرة؟",
    answers: ["2015", "2022", "2007"],
    answers_ar: ["2015", "2022", "2007"],
    correctIndex: 1,
    relativeText_ar:
      "بالإضافة إلى ذلك، ظهر حزبان - ديمقراطيو الدنمارك والمعتدلون - قبل فترة وجيزة من انتخابات البرلمان في عام 2022. تم تشكيلهما من قبل سياسيين كانوا في السابق أعضاء بارزين في حزب فينسترا."
  },
  {
    question: "Hvilket politisk parti opstod i 1870'erne som en del af arbejderbevægelsen?",
    question_ar: "أي حزب سياسي نشأ في سبعينيات القرن التاسع عشر كجزء من الحركة العمالية؟",
    answers: ["Venstre", "Det Radikale Venstre", "Socialdemokratiet"],
    answers_ar: ["حزب اليسار (فينسترا)", "حزب اليسار الراديكالي", "الحزب الاشتراكي الديمقراطي"],
    correctIndex: 2
  },
  {
    question: "Hvilket af følgende partier har flest borgmesterposter i Danmark?",
    question_ar: "أي من الأحزاب التالية لديه أكبر عدد من مناصب رؤساء البلديات في الدنمارك؟",
    answers: ["Venstre", "Dansk Folkeparti", "Det Konservative Folkeparti"],
    answers_ar: ["حزب اليسار (فينسترا)", "حزب الشعب الدنماركي", "حزب الشعب المحافظ"],
    correctIndex: 0,
    relativeText_ar:
      "نتيجة لهذه الانتخابات، يتم توزيع مناصب رؤساء البلديات في 98 بلدية في البلاد على النحو التالي بين الأحزاب المختلفة: الحزب الاشتراكي الديمقراطي 44، حزب فينسترا 34، حزب الشعب المحافظ 14..."
  },
  {
    question: "Hvilket af følgende politiske partier er ældst?",
    question_ar: "أي من الأحزاب السياسية التالية هو الأقدم؟",
    answers: ["Socialistisk Folkeparti", "Dansk Folkeparti", "Det Konservative Folkeparti"],
    answers_ar: ["حزب الشعب الاشتراكي", "حزب الشعب الدنماركي", "حزب الشعب المحافظ"],
    correctIndex: 2
  },
  {
    question: "Hvilket parti var Poul Nyrup Rasmussen formand for, da han var statsminister 1993-2001?",
    question_ar: "ما هو الحزب الذي كان بول نيروب راسموسن رئيسًا له عندما كان رئيسًا للوزراء 1993-2001؟",
    answers: ["Venstre", "Det Konservative Folkeparti", "Socialdemokratiet"],
    answers_ar: ["فينستره (اليسار)", "حزب الشعب المحافظ", "الحزب الاشتراكي الديمقراطي"],
    correctIndex: 2
  },
  {
    question: "Hvilket år blev Dansk Folkeparti valgt til Folketinget første gang?",
    question_ar: "في أي عام تم انتخاب حزب الشعب الدنماركي للبرلمان لأول مرة؟",
    answers: ["1978", "1998", "1958"],
    answers_ar: ["1978", "1998", "1958"],
    correctIndex: 1
  },
  {
    question: "Hvilket parti stemte landmænd typisk på i midten af 1900-tallet?",
    question_ar: "ما هو الحزب الذي كان المزارعون يصوتون له عادة في منتصف القرن العشرين؟",
    answers: ["Det Konservative Folkeparti", "Dansk Folkeparti", "Venstre"],
    answers_ar: ["حزب الشعب المحافظ", "حزب الشعب الدنماركي", "فينستره (اليسار)"],
    correctIndex: 2
  },
  {
    question:
      "Hvilken af følgende befolkningsgrupper fik partiet Venstre flest stemmer fra i slutningen af 1800-tallet?",
    question_ar:
      "أي من الفئات السكانية التالية حصل حزب فينسترا (اليسار) على أكبر عدد من أصواتها في أواخر القرن التاسع عشر؟",
    answers: ["Arbejdere", "Bønder", "Godsejere"],
    answers_ar: ["العمال", "الفلاحون", "ملاك الأراضي"],
    correctIndex: 1
  },
  {
    question: "Hvilket af følgende partier er det nyeste?",
    question_ar: "أي من الأحزاب السياسية التالية هو الأحدث؟",
    answers: ["Socialistisk Folkeparti", "Alternativet", "Enhedslisten"],
    answers_ar: ["حزب الشعب الاشتراكي", "البديل", "القائمة الموحدة"],
    correctIndex: 1
  },
  {
    question: "Hvilket parti har Inger Støjberg tidligere været medlem af?",
    question_ar: "أي حزب كانت إنغر ستويبرغ عضوة فيه سابقًا؟",
    answers: ["Socialdemokratiet", "Det Konservative Folkeparti", "Venstre"],
    answers_ar: ["الحزب الاشتراكي الديمقراطي", "حزب الشعب المحافظ", "فينستره (الحزب الليبرالي)"],
    correctIndex: 2
  },
  {
    question:
      "Hvilket politisk parti blev dannet i slutningen af 1950'erne af en gruppe tidligere medlemmer af Danmarks Kommunistiske Parti (DKP)?",
    question_ar:
      "ما هو الحزب السياسي الذي تم تشكيله في أواخر الخمسينيات من قبل مجموعة من الأعضاء السابقين في الحزب الشيوعي الدنماركي (DKP)؟",
    answers: ["Socialistisk Folkeparti", "Alternativet", "Radikale Venstre"],
    answers_ar: ["حزب الشعب الاشتراكي", "البديل", "حزب اليسار الراديكالي"],
    correctIndex: 0
  },
  {
    question: "Hvem var Danmarks første kvindelige statsminister?",
    question_ar: "من كانت أول رئيسة وزراء للدنمارك؟",
    answers: ["Margrethe Vestager", "Helle Thorning-Schmidt", "Mette Frederiksen"],
    answers_ar: ["مارغريت فيستاغر", "هيلا تورنينغ شميت", "ميته فريدريكسن"],
    correctIndex: 1
  },
  {
    question: "Hvor har Margrethe Vestager arbejdet i perioden 2014-24?",
    question_ar: "أين عملت مارغريت فيستاغر في الفترة 2014-24؟",
    answers: ["NATO", "FN", "EU"],
    answers_ar: ["حلف شمال الأطلسي (الناتو)", "الأمم المتحدة (UN)", "الاتحاد الأوروبي (EU)"],
    correctIndex: 2,
    relativeText_ar:
      "في الفترة 2014-24، كانت الوزيرة الدنماركية السابقة مارغريت فيستاغر من الحزب الليبرالي الراديكالي نائبة الرئيس التنفيذي في المفوضية الأوروبية مسؤولة عن المنافسة والرقمنة."
  },
  {
    question: "Hvilket parti fik flest stemmer ved valget til Europa-Parlamentet i Danmark i juni 2024?",
    question_ar: "أي حزب حصل على أكبر عدد من الأصوات في انتخابات البرلمان الأوروبي في الدنمارك في يونيو 2024؟",
    answers: ["Radikale Venstre", "Socialistisk Folkeparti", "Danmarksdemokraterne"],
    answers_ar: ["حزب اليسار الراديكالي", "حزب الشعب الاشتراكي", "ديمقراطيو الدنمارك"],
    correctIndex: 1
  },
  {
    question: "Hvilket parti tilhørte Poul Schlüter, som var statsminister i perioden 1982-93?",
    question_ar: "إلى أي حزب كان ينتمي بول شلوتر، الذي كان رئيسًا للوزراء في الفترة 1982-93؟",
    answers: ["Socialdemokratiet", "Radikale Venstre", "Det Konservative Folkeparti"],
    answers_ar: ["الحزب الاشتراكي الديمقراطي", "حزب اليسار الراديكالي", "حزب الشعب المحافظ"],
    correctIndex: 2
  },
  {
    question: "Ved Jordskredsvalget i 1973 blev 3 nye partier valgt til Folketinget. Hvilke?",
    question_ar: "في الانتخابات الساحقة عام 1973، تم انتخاب 3 أحزاب جديدة في البرلمان. أيها؟",
    answers: [
      "Alternativet, Nye Borgerlige og Venstresocialisterne.",
      "Kristeligt Folkeparti, Fremskridtspartiet og Centrumdemokraterne.",
      "Dansk Folkeparti, Enhedslisten og Liberal Alliance."
    ],
    answers_ar: [
      "البديل، اليمين الجديد والاشتراكيون اليساريون.",
      "حزب الشعب المسيحي، حزب التقدم وديمقراطيو الوسط.",
      "حزب الشعب الدنماركي، القائمة الموحدة والتحالف الليبرالي."
    ],
    correctIndex: 1
  },
  {
    question: "Hvem er statsminister i Danmark?",
    question_ar: "من هو رئيس وزراء الدنمارك؟",
    answers: ["Helle Thorning-Schmidt", "Mette Frederiksen", "Pia Kjærsgaard"],
    answers_ar: ["هيلا تورنينغ شميت", "ميته فريدريكسن", "بيا كيرسغارد"],
    correctIndex: 1
  }
  // ... all other questions from the file can be added here
];

document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.querySelector("#partiesTable tbody");
  const headers = document.querySelectorAll("#partiesTable .sortable");
  const modal = document.getElementById("questionsModal");
  const closeModalBtn = document.getElementById("closeModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalBody = document.getElementById("modalBody");

  let currentSort = { column: "members", direction: "desc" };

  // 1. Associate questions with parties
  partyData.forEach(party => {
    party.relatedQuestions = questions.filter(q => {
      const textToSearch = `${q.question_ar} ${q.relativeText_ar || ""}`.toLowerCase();
      return party.keywords.some(keyword => textToSearch.includes(keyword.toLowerCase()));
    });
  });

  // 2. Render Table Function
  const renderTable = data => {
    tableBody.innerHTML = "";
    data.forEach((party, index) => {
      const row = document.createElement("tr");
      row.className = "bg-white border-b hover:bg-gray-50";
      row.innerHTML = `
                        <td class="px-2 py-3"><img src="${party.logo}" alt="شعار ${
        party.nameAr
      }" class="h-10 w-20 object-contain mx-auto"></td>
                        <td class="px-2 py-3 text-center">
                            <button data-party-index="${index}" class="question-btn text-2xl hover:text-blue-600 transition-colors duration-200" title="عرض الأسئلة المتعلقة">❓</button>
                        </td>
                        <td class="px-4 py-4 font-medium text-gray-900 whitespace-nowrap">${party.nameDa}</td>
                        <td class="px-4 py-4">${party.nameAr}</td>
                        <td class="px-4 py-4 max-w-xs">${party.description}</td>
                        <td class="px-4 py-4">${party.leader}</td>
                        <td class="px-4 py-4">${party.founded}</td>
                        <td class="px-4 py-4">${party.members.toLocaleString("ar-EG")}</td>
                        <td class="px-4 py-4">${party.seats}</td>
                        <td class="px-4 py-4 text-xs">${party.govYears}</td>
                    `;
      tableBody.appendChild(row);
    });
  };

  // 3. Sorting Logic (unchanged)
  const sortData = (data, column, direction, type) => {
    data.sort((a, b) => {
      const keyMap = {
        "name-da": "nameDa",
        "name-ar": "nameAr",
        "leader": "leader",
        "founded": "founded",
        "members": "members",
        "seats": "seats"
      };
      const key = keyMap[column];
      let valA = type === "string" ? a[key].toLowerCase() : a[key];
      let valB = type === "string" ? b[key].toLowerCase() : b[key];
      if (valA < valB) return direction === "asc" ? -1 : 1;
      if (valA > valB) return direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const updateHeaderStyles = () => {
    headers.forEach(header => {
      const column = header.dataset.column;
      const indicator = header.querySelector(".sort-indicator");
      if (column === currentSort.column) {
        header.setAttribute("aria-sort", currentSort.direction === "asc" ? "ascending" : "descending");
        indicator.textContent = currentSort.direction === "asc" ? "▲" : "▼";
      } else {
        header.removeAttribute("aria-sort");
        indicator.textContent = "↕";
      }
    });
  };

  headers.forEach(header => {
    header.addEventListener("click", () => {
      const column = header.dataset.column;
      const type = header.dataset.type;
      let direction = currentSort.column === column && currentSort.direction === "asc" ? "desc" : "asc";
      currentSort = { column, direction };
      sortData(partyData, column, direction, type);
      renderTable(partyData);
      updateHeaderStyles();
    });
  });

  // 4. Modal Logic
  const openModal = partyIndex => {
    const party = partyData[partyIndex];
    modalTitle.textContent = `أسئلة متعلقة بـ: ${party.nameAr}`;
    modalBody.innerHTML = "";

    if (party.relatedQuestions.length > 0) {
      party.relatedQuestions.forEach(q => {
        const questionDiv = document.createElement("div");
        questionDiv.className = "border-b pb-4";

        const questionP = document.createElement("p");
        questionP.className = "font-bold text-lg mb-2";
        questionP.textContent = q.question_ar;
        questionDiv.appendChild(questionP);

        const answersUl = document.createElement("ul");
        answersUl.className = "list-none space-y-1";
        q.answers_ar.forEach((ans, i) => {
          const answerLi = document.createElement("li");
          answerLi.textContent = `- ${ans}`;
          answerLi.className = "p-2 rounded";
          if (i === q.correctIndex) {
            answerLi.classList.add("correct-answer");
          }
          answersUl.appendChild(answerLi);
        });
        questionDiv.appendChild(answersUl);

        modalBody.appendChild(questionDiv);
      });
    } else {
      modalBody.innerHTML = '<p class="text-center text-gray-500">لا توجد أسئلة متعلقة بهذا الحزب في الملف المرفق.</p>';
    }
    modal.classList.add("active");
  };

  const closeModal = () => {
    modal.classList.remove("active");
  };

  // Event listener for question buttons (using event delegation)
  tableBody.addEventListener("click", e => {
    if (e.target.classList.contains("question-btn")) {
      const partyIndex = e.target.dataset.partyIndex;
      openModal(partyIndex);
    }
  });

  closeModalBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", e => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Initial render
  sortData(partyData, currentSort.column, currentSort.direction, "number");
  renderTable(partyData);
  updateHeaderStyles();
});
