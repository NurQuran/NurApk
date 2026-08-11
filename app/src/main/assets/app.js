(() => {
  "use strict";

  const DATA = window.NUR_QURAN_DATA || [];
  const META = window.NUR_QURAN_META || {};
  const STORAGE_KEY = "nur-android-offline-v1";
  const FQIH_URL = "https://nur.youbianas1.workers.dev/assistant?source=android";
  const DEFAULTS = { language:"fr", theme:"dark", riwayah:"hafs", reciter:"ar.alafasy", tajweed:false, pronunciation:true, french:true, english:true, fontSize:40, memory:false, current:1, currentVerse:1, favorites:[], read:[], minutes:0, goal:10, onboarded:false };
  let state = loadState();
  let currentView = "home";
  let libraryOpen = true;
  let toastTimer = 0;
  let audioQueue = [];
  let audioIndex = -1;
  let onboardingStep = 0;
  let lastThemeToggle = 0;
  let readingObserver = null;
  let positionSaveTimer = 0;

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const audio = $("#audio");
  const copy = {
    fr:{home:"Accueil",read:"Lire",favorites:"Favoris",heroTitle:"Le Coran,<br><em>toujours avec vous.</em>",heroLead:"Lisez Hafs et Warsh, recherchez, mémorisez et retrouvez vos traductions sans aucune connexion.",chooseSurah:"Choisir une sourate",offlineReady:"Lecture entièrement hors ligne",featureRead:"Hafs & Warsh",featureReadText:"Les 114 sourates et leurs données sont intégrées à l’application.",featureStudy:"Étudier",featureStudyText:"Prononciation, traductions et couleurs de tajwīd disponibles partout.",featureKeep:"Continuer",featureKeepText:"Favoris, progression et préférences restent sur votre téléphone.",aboutLabel:"À PROPOS",aboutTitle:"Une lumière qui vous accompagne.",aboutText:"Nūr a été créé par Anas Youbi, 14 ans, comme sadaqa jariya. Les textes sont conservés localement pour rester accessibles à tout moment.",offlineLibrary:"BIBLIOTHÈQUE HORS LIGNE",searchSurah:"Rechercher une sourate",allSurahs:"Toutes les sourates",storedLocally:"Textes conservés sur cet appareil",goToVerse:"Aller au verset",addFavorite:"Mettre en favoris",removeFavorite:"Retirer des favoris",listenOnline:"Écouter en ligne",explainOnline:"Expliquer en ligne",markRead:"✓ Marquer cette sourate comme lue",markedRead:"✓ Sourate marquée comme lue",yourSpace:"VOTRE ESPACE",favoritesLead:"Vos sourates et votre progression sont conservées uniquement sur cet appareil.",personalProgress:"PROGRESSION PERSONNELLE",yourJourney:"Votre parcours",surahs:"sourates",onlineOnly:"CONNEXION REQUISE",fqihOnlineText:"Fqih utilise une intelligence artificielle en ligne. La lecture du Coran reste entièrement disponible sans connexion.",openFqih:"Ouvrir Fqih en ligne",readingPreferences:"PRÉFÉRENCES DE LECTURE",settings:"Paramètres",language:"Langue",languageText:"Choisissez la langue de toute l’interface.",recitation:"Lecture",recitationText:"Choisissez le muṣḥaf affiché hors ligne.",display:"Affichage",tajweedColors:"Couleurs de tajwīd",pronunciation:"Prononciation",frenchTranslation:"Traduction française",englishTranslation:"Traduction anglaise",arabicSize:"Taille du texte arabe",studyMode:"Mémorisation",studyText:"Masquez temporairement l’arabe pour vous exercer.",hideArabic:"Masquer le texte arabe",offlineInstalled:"Contenu hors ligne installé",resetData:"Effacer les favoris, la progression et les réglages",continueReading:"CONTINUER LA LECTURE",resume:"Reprendre",onlineAudio:"AUDIO EN LIGNE",chapter:"Sourate",verses:"versets",meccan:"Mecquoise",medinan:"Médinoise",noFavorites:"Aucune sourate favorite pour le moment.",offlineSummary:"114 sourates · Hafs & Warsh · français · anglais · prononciation · tajwīd",audioNeedsInternet:"L’audio est disponible uniquement avec une connexion Internet.",fqihNeedsInternet:"Fqih est disponible uniquement avec une connexion Internet.",audioUnavailable:"Cet audio est momentanément indisponible.",searchEmpty:"Aucune sourate ne correspond à cette recherche.",resetConfirm:"Effacer toutes les données personnelles de Nūr ?",resetDone:"Les données personnelles ont été effacées.",favoriteAdded:"Sourate ajoutée aux favoris.",favoriteRemoved:"Sourate retirée des favoris.",progressSaved:"Progression enregistrée.",versePrompt:"Numéro du verset",invalidVerse:"Ce numéro de verset n’existe pas.",focus:"Mode concentration",createImage:"Créer une image de la sourate",imageShared:"Image de la sourate créée.",imageFailed:"Impossible de partager l’image sur cet appareil.",welcome:"Bienvenue",welcomeText:"Choisissez votre langue. Vous pourrez tout modifier plus tard.",offlineWelcome:"Tout est prêt hors ligne",offlineWelcomeText:"Les textes, traductions, réglages et animations sont déjà dans l’application.",start:"Démarrer",next:"Suivant"},
    en:{home:"Home",read:"Read",favorites:"Favorites",heroTitle:"The Quran,<br><em>always with you.</em>",heroLead:"Read Hafs and Warsh, search, memorize and access translations without any connection.",chooseSurah:"Choose a surah",offlineReady:"Fully offline reading",featureRead:"Hafs & Warsh",featureReadText:"All 114 surahs and their data are built into the app.",featureStudy:"Study",featureStudyText:"Pronunciation, translations and tajweed colors are available everywhere.",featureKeep:"Continue",featureKeepText:"Favorites, progress and preferences remain on your phone.",aboutLabel:"ABOUT",aboutTitle:"A light that stays with you.",aboutText:"Nūr was created by Anas Youbi, aged 14, as a sadaqa jariya. The texts are stored locally so they remain available at all times.",offlineLibrary:"OFFLINE LIBRARY",searchSurah:"Search for a surah",allSurahs:"All surahs",storedLocally:"Texts stored on this device",goToVerse:"Go to verse",addFavorite:"Add to favorites",removeFavorite:"Remove favorite",listenOnline:"Listen online",explainOnline:"Explain online",markRead:"✓ Mark this surah as read",markedRead:"✓ Marked as read",yourSpace:"YOUR SPACE",favoritesLead:"Your surahs and progress are stored only on this device.",personalProgress:"PERSONAL PROGRESS",yourJourney:"Your journey",surahs:"surahs",onlineOnly:"CONNECTION REQUIRED",fqihOnlineText:"Fqih uses online artificial intelligence. Quran reading remains fully available offline.",openFqih:"Open Fqih online",readingPreferences:"READING PREFERENCES",settings:"Settings",language:"Language",languageText:"Choose the language of the whole interface.",recitation:"Reading",recitationText:"Choose the offline muṣḥaf.",display:"Display",tajweedColors:"Tajweed colors",pronunciation:"Pronunciation",frenchTranslation:"French translation",englishTranslation:"English translation",arabicSize:"Arabic text size",studyMode:"Memorization",studyText:"Temporarily hide Arabic to practise.",hideArabic:"Hide Arabic text",offlineInstalled:"Offline content installed",resetData:"Erase favorites, progress and settings",continueReading:"CONTINUE READING",resume:"Resume",onlineAudio:"ONLINE AUDIO",chapter:"Surah",verses:"verses",meccan:"Meccan",medinan:"Medinan",noFavorites:"No favorite surah yet.",offlineSummary:"114 surahs · Hafs & Warsh · French · English · pronunciation · tajweed",audioNeedsInternet:"Audio is available only with an Internet connection.",fqihNeedsInternet:"Fqih is available only with an Internet connection.",audioUnavailable:"This audio is temporarily unavailable.",searchEmpty:"No surah matches this search.",resetConfirm:"Erase all personal Nūr data?",resetDone:"Personal data has been erased.",favoriteAdded:"Surah added to favorites.",favoriteRemoved:"Surah removed from favorites.",progressSaved:"Progress saved.",versePrompt:"Verse number",invalidVerse:"This verse number does not exist.",focus:"Focus mode",createImage:"Create a surah image",imageShared:"Surah image created.",imageFailed:"Unable to share the image on this device.",welcome:"Welcome",welcomeText:"Choose your language. You can change everything later.",offlineWelcome:"Everything is ready offline",offlineWelcomeText:"Texts, translations, settings and animations are already in the app.",start:"Start",next:"Next"},
    ar:{home:"الرئيسية",read:"القراءة",favorites:"المفضلة",heroTitle:"القرآن،<br><em>معك دائمًا.</em>",heroLead:"اقرأ بروايتي حفص وورش، وابحث واحفظ واطّلع على الترجمات دون اتصال.",chooseSurah:"اختر سورة",offlineReady:"القراءة متاحة بالكامل دون اتصال",featureRead:"حفص وورش",featureReadText:"السور الـ114 وبياناتها مدمجة في التطبيق.",featureStudy:"التعلّم",featureStudyText:"النطق والترجمات وألوان التجويد متاحة في كل مكان.",featureKeep:"المتابعة",featureKeepText:"تبقى المفضلة والتقدم والتفضيلات على هاتفك.",aboutLabel:"حول التطبيق",aboutTitle:"نور يرافقك.",aboutText:"أنشأ أنس اليوبي تطبيق نُور في سن الرابعة عشرة كصدقة جارية. تُحفظ النصوص محليًا لتبقى متاحة في كل وقت.",offlineLibrary:"المكتبة دون اتصال",searchSurah:"ابحث عن سورة",allSurahs:"كل السور",storedLocally:"النصوص محفوظة على هذا الجهاز",goToVerse:"الانتقال إلى آية",addFavorite:"إضافة إلى المفضلة",removeFavorite:"إزالة من المفضلة",listenOnline:"الاستماع عبر الإنترنت",explainOnline:"الشرح عبر الإنترنت",markRead:"✓ تحديد السورة كمقروءة",markedRead:"✓ تم تحديد السورة كمقروءة",yourSpace:"مساحتك",favoritesLead:"تُحفظ سورك وتقدمك على هذا الجهاز فقط.",personalProgress:"التقدم الشخصي",yourJourney:"مسيرتك",surahs:"سورة",onlineOnly:"الاتصال مطلوب",fqihOnlineText:"يستخدم فقيه ذكاءً اصطناعيًا عبر الإنترنت. وتبقى قراءة القرآن متاحة بالكامل دون اتصال.",openFqih:"فتح فقيه عبر الإنترنت",readingPreferences:"تفضيلات القراءة",settings:"الإعدادات",language:"اللغة",languageText:"اختر لغة الواجهة كاملة.",recitation:"القراءة",recitationText:"اختر المصحف المتاح دون اتصال.",display:"العرض",tajweedColors:"ألوان التجويد",pronunciation:"النطق",frenchTranslation:"الترجمة الفرنسية",englishTranslation:"الترجمة الإنجليزية",arabicSize:"حجم النص العربي",studyMode:"الحفظ",studyText:"أخفِ النص العربي مؤقتًا للتدرّب.",hideArabic:"إخفاء النص العربي",offlineInstalled:"تم تثبيت المحتوى دون اتصال",resetData:"مسح المفضلة والتقدم والإعدادات",continueReading:"متابعة القراءة",resume:"متابعة",onlineAudio:"الصوت عبر الإنترنت",chapter:"سورة",verses:"آيات",meccan:"مكية",medinan:"مدنية",noFavorites:"لا توجد سورة مفضلة بعد.",offlineSummary:"114 سورة · حفص وورش · الفرنسية · الإنجليزية · النطق · التجويد",audioNeedsInternet:"الصوت متاح فقط عند الاتصال بالإنترنت.",fqihNeedsInternet:"فقيه متاح فقط عند الاتصال بالإنترنت.",audioUnavailable:"هذا الصوت غير متاح مؤقتًا.",searchEmpty:"لا توجد سورة مطابقة لهذا البحث.",resetConfirm:"هل تريد مسح جميع بيانات نُور الشخصية؟",resetDone:"تم مسح البيانات الشخصية.",favoriteAdded:"تمت إضافة السورة إلى المفضلة.",favoriteRemoved:"تمت إزالة السورة من المفضلة.",progressSaved:"تم حفظ التقدم.",versePrompt:"رقم الآية",invalidVerse:"رقم الآية غير موجود.",focus:"وضع التركيز",createImage:"إنشاء صورة للسورة",imageShared:"تم إنشاء صورة السورة.",imageFailed:"تعذر مشاركة الصورة على هذا الجهاز.",welcome:"مرحبًا",welcomeText:"اختر لغتك. يمكنك تغيير كل شيء لاحقًا.",offlineWelcome:"كل شيء جاهز دون اتصال",offlineWelcomeText:"النصوص والترجمات والإعدادات والحركات موجودة داخل التطبيق.",start:"ابدأ",next:"التالي"}
  };

  Object.assign(copy.fr,{offlineAudio:"Audio hors ligne",offlineAudioText:"Enregistrez l’audio de la sourate actuelle sur ce téléphone.",downloadCurrentAudio:"Télécharger l’audio de cette sourate",audioSaved:"Audio disponible hors ligne",audioDownloading:"Téléchargement audio",audioDownloadFailed:"Le téléchargement audio a été interrompu.",offlineNotice:"Vous êtes hors ligne · la bibliothèque intégrée est active."});
  Object.assign(copy.en,{offlineAudio:"Offline audio",offlineAudioText:"Save the current surah audio on this phone.",downloadCurrentAudio:"Download this surah audio",audioSaved:"Audio available offline",audioDownloading:"Downloading audio",audioDownloadFailed:"The audio download was interrupted.",offlineNotice:"You are offline · the built-in library is active."});
  Object.assign(copy.ar,{offlineAudio:"الصوت دون اتصال",offlineAudioText:"احفظ صوت السورة الحالية على هذا الهاتف.",downloadCurrentAudio:"تنزيل صوت هذه السورة",audioSaved:"الصوت متاح دون اتصال",audioDownloading:"جارٍ تنزيل الصوت",audioDownloadFailed:"توقف تنزيل الصوت.",offlineNotice:"أنت غير متصل · تم تشغيل المكتبة المدمجة."});

  Object.assign(copy.fr,{heroTitle:"Chaque verset,<br><em>un instant pour méditer.</em>",heroLead:"Lisez, écoutez et poursuivez votre chemin dans le Coran, avec des récitations, des voix et des traductions pensées autour de vous.",featureRead:"Plusieurs récitateurs",featureReadText:"Choisissez parmi plusieurs voix reconnues et adaptez l’écoute à votre manière d’apprendre.",featureStudy:"Tajwīd en couleurs",featureStudyText:"Affichez les repères colorés de prononciation fournis par une édition identifiée.",featureKeep:"Vos sourates",featureKeepText:"Ajoutez une sourate entière à vos favoris et retrouvez-la sur sa propre page.",aboutTitle:"Une sadaqa jariya pensée avec cœur",aboutText:"Nūr a été imaginé et créé par Anas Youbi, 14 ans, comme une sadaqa jariya : un espace gratuit pour faciliter la lecture, l’écoute et la compréhension du Coran.",listenOnline:"Lire la sourate en entier",explainOnline:"Expliquer la sourate",offlineReady:"ou reprendre votre lecture",appearance:"Votre ambiance",appearanceLead:"Choisissez le thème qui vous accompagne le mieux.",dark:"Sombre",light:"Clair",voice:"Voix",colors:"Couleurs de tajwīd"});
  Object.assign(copy.en,{heroTitle:"Every verse,<br><em>a moment to reflect.</em>",heroLead:"Read, listen and continue your journey through the Quran, with recitations, voices and translations designed around you.",featureRead:"Multiple reciters",featureReadText:"Choose from several renowned voices and tailor listening to the way you learn.",featureStudy:"Color-coded tajweed",featureStudyText:"Display pronunciation cues supplied by an identified edition.",featureKeep:"Your surahs",featureKeepText:"Favorite a complete surah and find it again on its own page.",aboutTitle:"A heartfelt ongoing charity",aboutText:"Nūr was imagined and created by Anas Youbi, aged 14, as a sadaqah jariyah: a free space that makes reading, listening to and understanding the Quran easier.",listenOnline:"Play the full surah",explainOnline:"Explain the surah",offlineReady:"or continue your reading",appearance:"Your atmosphere",appearanceLead:"Choose the theme that feels right for you.",dark:"Dark",light:"Light",voice:"Voice",colors:"Tajweed colors"});
  Object.assign(copy.ar,{heroTitle:"كل آية،<br><em>لحظة تدبّر.</em>",heroLead:"اقرأ واستمع وتابع رحلتك مع القرآن الكريم، بروايات وأصوات وترجمات ترافقك بهدوء.",featureRead:"قراء متعددون",featureReadText:"اختر من بين أصوات قراء معروفين واضبط الاستماع بما يناسب تعلمك.",featureStudy:"التجويد بالألوان",featureStudyText:"اعرض علامات النطق الملونة من نسخة محددة المصدر.",featureKeep:"سورك",featureKeepText:"أضف سورة كاملة إلى المفضلة وارجع إليها من صفحتها.",aboutTitle:"صدقة جارية صُنعت بمحبة",aboutText:"تخيّل أنس يوبي، البالغ من العمر 14 عامًا، تطبيق نُور وأنشأه صدقةً جارية: مساحة مجانية تُيسّر قراءة القرآن والاستماع إليه وفهمه.",listenOnline:"تشغيل السورة كاملة",explainOnline:"شرح السورة",offlineReady:"أو تابع قراءتك",appearance:"أجواء القراءة",appearanceLead:"اختر المظهر الأنسب لك.",dark:"داكن",light:"فاتح",voice:"الصوت",colors:"ألوان التجويد"});

  function loadState(){
    try { const local=JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}");const native=window.NurAndroid?.getState?.();return {...DEFAULTS,...local,...(native?JSON.parse(native):{})}; }
    catch { return { ...DEFAULTS }; }
  }
  function saveState(){ const value=JSON.stringify(state);localStorage.setItem(STORAGE_KEY,value);try{window.NurAndroid?.setState?.(value)}catch{} }
  function t(key){ return copy[state.language]?.[key] || copy.fr[key] || key; }
  function escapeHtml(value=""){ return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[char]); }
  function normalize(value=""){ return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[’'`´\-–—_]/g," ").replace(/[^a-zA-Z0-9\u0600-\u06ff ]/g,"").replace(/\s+/g," ").trim().toLowerCase(); }
  function surah(){ return DATA[Math.max(0, Math.min(113, state.current - 1))]; }
  function verses(){ const item=surah(); return state.riwayah === "warsh" ? item.warsh : item.hafs; }

  function applyLanguage(){
    const rtl = state.language === "ar";
    document.documentElement.lang = state.language;
    document.documentElement.dir = rtl ? "rtl" : "ltr";
    $$('[data-i18n]').forEach(node => { const value=t(node.dataset.i18n); if(value) node.innerHTML=value; });
    $$('[data-i18n-placeholder]').forEach(node => node.placeholder=t(node.dataset.i18nPlaceholder));
    $("#offlineSummary").textContent=t("offlineSummary");
    renderSurahList($("#surahSearch").value);
    renderSurah(); renderFavorites(); updateSettings(); updateNav();
  }

  function showView(view, options={}){
    currentView = view;
    $$(".view").forEach(node => node.classList.toggle("active", node.id === `view-${view}`));
    if(view === "read"){
      if(options.library !== undefined) libraryOpen = options.library;
      $("#view-read").classList.toggle("library-open", libraryOpen);
      renderSurahList($("#surahSearch").value);
      if(!libraryOpen) renderSurah();
    }
    if(view === "favorites") renderFavorites();
    updateNav();
    scrollTo({top:0,behavior:options.instant?"auto":"smooth"});
  }

  function updateNav(){
    const index={home:0,read:1,fqih:2,favorites:3}[currentView] ?? 0;
    $(".mobile-nav").dataset.index=String(index);
    $$('[data-view]').forEach(button => button.classList.toggle("active", button.dataset.view === currentView));
  }

  function renderSurahList(query=""){
    const needle=normalize(query);
    const matches=DATA.filter(item=>!needle||normalize(`${item.number} ${item.nameLatin} ${item.nameArabic}`).includes(needle));
    $("#surahList").innerHTML=matches.length?matches.map(item=>`<button class="surah-item${item.number===state.current?" active":""}" data-surah="${item.number}"><span>${String(item.number).padStart(3,"0")}</span><strong>${escapeHtml(item.nameLatin)}</strong><b lang="ar" dir="rtl">${escapeHtml(item.nameArabic)}</b></button>`).join(""):`<p class="empty-favorites">${t("searchEmpty")}</p>`;
    $$('[data-surah]').forEach(button=>button.addEventListener("click",()=>openSurah(Number(button.dataset.surah))));
  }

  function openSurah(number){
    state.current=Math.max(1,Math.min(114,number)); state.currentVerse=1; saveState(); libraryOpen=false; showView("read",{library:false});
  }

  function observeReadingPosition(){
    readingObserver?.disconnect();
    readingObserver=new IntersectionObserver(entries=>{
      const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>Math.abs(a.boundingClientRect.top-innerHeight*.45)-Math.abs(b.boundingClientRect.top-innerHeight*.45))[0];
      if(!visible)return;
      const verse=Number(visible.target.id.replace("verse-",""));
      if(!verse||verse===state.currentVerse)return;
      state.currentVerse=verse;
      clearTimeout(positionSaveTimer);
      positionSaveTimer=setTimeout(saveState,180);
    },{rootMargin:"-34% 0px -48% 0px",threshold:.01});
    $$(".verse-card").forEach(card=>readingObserver.observe(card));
  }

  function renderSurah(){
    if(!DATA.length) return;
    const item=surah(), items=verses(), isFavorite=state.favorites.includes(item.number), isRead=state.read.includes(item.number);
    $("#chapterNumber").textContent=`${t("chapter")} ${String(item.number).padStart(2,"0")}`;
    $("#surahName").textContent=item.nameLatin;
    $("#surahArabic").textContent=item.nameArabic;
    $("#surahMeta").textContent=`${item.revelation==="Meccan"?t("meccan"):t("medinan")} · ${items.length} ${t("verses")} · ${state.riwayah==="warsh"?"Warsh":"Ḥafṣ"}`;
    $("#previousSurah").disabled=item.number===1; $("#nextSurah").disabled=item.number===114;
    $("#basmala").hidden=item.number===9;
    $("#favoriteButton").classList.toggle("active",isFavorite);
    $("#favoriteButton").innerHTML=`${isFavorite?"♥":"♡"} <span>${isFavorite?t("removeFavorite"):t("addFavorite")}</span>`;
    $("#markRead").classList.toggle("done",isRead); $("#markRead").textContent=isRead?t("markedRead"):t("markRead");
    $("#verseStack").innerHTML=items.map((verse,index)=>{
      const arabic=state.riwayah==="hafs"&&state.tajweed&&verse.tajweed?verse.tajweed:escapeHtml(verse.arabic);
      const translations=[];
      if(state.french) translations.push(`<div class="translation"><small>FRANÇAIS</small><p>${escapeHtml(verse.fr)}</p></div>`);
      if(state.english) translations.push(`<div class="translation"><small>ENGLISH</small><p>${escapeHtml(verse.en)}</p></div>`);
      return `<article class="verse-card" id="verse-${verse.n}" style="--index:${index}"><div class="verse-meta"><span>${item.number}:${verse.n}</span><button data-play-verse="${index}" aria-label="${escapeHtml(t("listenOnline"))}"><img class="ui-icon" src="icons/play.png" alt=""></button></div><p class="arabic-text" lang="ar" dir="rtl" style="font-size:${state.fontSize}px">${arabic}</p>${state.pronunciation?`<p class="pronunciation">${escapeHtml(verse.pronunciation)}</p>`:""}${translations.length?`<div class="translations">${translations.join("")}</div>`:""}</article>`;
    }).join("");
    document.body.classList.toggle("memory-mode",state.memory);
    $$('[data-play-verse]').forEach(button=>button.addEventListener("click",()=>playVerse(Number(button.dataset.playVerse))));
    observeReadingPosition();
    renderSurahList($("#surahSearch").value);
  }

  function toggleFavorite(){
    const n=state.current, exists=state.favorites.includes(n);
    state.favorites=exists?state.favorites.filter(item=>item!==n):[...state.favorites,n].sort((a,b)=>a-b);
    saveState(); renderSurah(); showToast(exists?t("favoriteRemoved"):t("favoriteAdded"));
  }

  function markRead(){ if(!state.read.includes(state.current)){state.read=[...state.read,state.current].sort((a,b)=>a-b);saveState();renderSurah();renderFavorites();showToast(t("progressSaved"));} }

  function renderFavorites(){
    $("#readCount").textContent=String(state.read.length); $("#favoriteCount").textContent=String(state.favorites.length);
    $("#favoriteGrid").innerHTML=state.favorites.length?state.favorites.map(number=>{const item=DATA[number-1];return `<button class="favorite-card" data-favorite-surah="${number}"><span>${String(number).padStart(3,"0")}</span><strong>${escapeHtml(item.nameLatin)}</strong><b lang="ar" dir="rtl">${escapeHtml(item.nameArabic)}</b></button>`}).join(""):`<div class="empty-favorites">${t("noFavorites")}</div>`;
    $$('[data-favorite-surah]').forEach(button=>button.addEventListener("click",()=>openSurah(Number(button.dataset.favoriteSurah))));
  }

  function showToast(message){
    const toast=$("#toast"); toast.textContent=message; toast.hidden=false; clearTimeout(toastTimer); toastTimer=setTimeout(()=>toast.hidden=true,3400);
  }
  function haptic(kind="selection"){try{if(window.NurAndroid?.performHaptic){window.NurAndroid.performHaptic(kind);return}navigator.vibrate?.(kind==="warning"?[18,32,24]:kind==="medium"?18:8)}catch{}}

  function openFqih(){ if(!navigator.onLine){showToast(t("fqihNeedsInternet"));return;} location.href=FQIH_URL; }

  function audioDescriptor(index=0){
    if(state.riwayah==="warsh")return{key:`warsh-${state.current}`,url:`https://server16.mp3quran.net/H-Lharraz/Rewayat-Warsh-A-n-Nafi/${String(state.current).padStart(3,"0")}.mp3`,verse:0};
    const item=verses()[index],reciter=state.reciter&&state.reciter.startsWith("ar.")?state.reciter:"ar.alafasy";return item?.global?{key:`hafs-${reciter.replace(/[^a-z0-9]/gi,"-")}-${item.global}`,url:`https://cdn.islamic.network/quran/audio/128/${reciter}/${item.global}.mp3`,verse:item.n}:null;
  }
  function hasNativeAudio(key){try{return!!window.NurAndroid?.hasAudio(key)}catch{return false}}
  function playableSource(descriptor){if(hasNativeAudio(descriptor.key))return`https://offline.nur/audio/${descriptor.key}.mp3`;return navigator.onLine?descriptor.url:""}
  function playVerse(index){
    if(state.riwayah==="warsh"){playSurah();return;}
    const descriptor=audioDescriptor(index);if(!descriptor){showToast(t("audioUnavailable"));return;}if(!playableSource(descriptor)){showToast(t("audioNeedsInternet"));return;}
    audioQueue=[index];audioIndex=0;startAudio(index);
  }
  function playSurah(){
    const descriptor=audioDescriptor(0);if(!descriptor||!playableSource(descriptor)){showToast(t("audioNeedsInternet"));return;}
    audioQueue=state.riwayah==="warsh"?[0]:verses().map((_,index)=>index);audioIndex=0;startAudio(0);
  }
  function startAudio(index){
    const descriptor=audioDescriptor(index),item=verses()[index];if(!descriptor||!item)return;const source=playableSource(descriptor);if(!source){showToast(t("audioNeedsInternet"));return;}
    audio.src=source;audio.play().catch(()=>showToast(t("audioUnavailable")));
    $("#mediaPlayer").hidden=false;$("#mediaTitle").textContent=state.riwayah==="warsh"?`${surah().nameLatin} · Warsh`:`${surah().nameLatin} · ${item.n}`;
    $$(".verse-card").forEach(node=>node.classList.remove("playing"));const card=$(`#verse-${item.n}`);card?.classList.add("playing");card?.scrollIntoView({behavior:"smooth",block:"center"});
  }
  function currentAudioPack(){return state.riwayah==="warsh"?[audioDescriptor(0)].filter(Boolean):verses().map((_,index)=>audioDescriptor(index)).filter(Boolean)}
  function refreshAudioDownloadStatus(){const items=currentAudioPack(),saved=items.filter(item=>hasNativeAudio(item.key)).length;$("#audioDownloadStatus").textContent=saved===items.length&&items.length?t("audioSaved"):saved?`${saved}/${items.length}`:""}
  async function downloadCurrentAudio(){
    const items=currentAudioPack();if(!items.length)return;if(items.every(item=>hasNativeAudio(item.key))){$("#audioDownloadStatus").textContent=t("audioSaved");return}if(!navigator.onLine){showToast(t("audioNeedsInternet"));return}
    $("#audioDownloadStatus").textContent=`${t("audioDownloading")} · 0/${items.length}`;
    if(window.NurAndroid?.downloadAudioPack){window.NurAndroid.downloadAudioPack(state.current,JSON.stringify(items));return}
    try{const cache=await caches.open("nur-audio-v1");for(let index=0;index<items.length;index++){const response=await fetch(items[index].url);if(!response.ok)throw new Error("download");await cache.put(items[index].url,response);$("#audioDownloadStatus").textContent=`${t("audioDownloading")} · ${index+1}/${items.length}`}$("#audioDownloadStatus").textContent=t("audioSaved")}catch{$("#audioDownloadStatus").textContent=t("audioDownloadFailed")}
  }

  function openSettings(){ $("#settingsLayer").hidden=false;document.body.classList.add("modal-open");updateSettings(); }
  function closeSettings(){ $("#settingsLayer").hidden=true;document.body.classList.remove("modal-open"); }
  function updateSettings(){
    $$('[data-language]').forEach(button=>button.classList.toggle("active",button.dataset.language===state.language));
    $$('[data-riwayah]').forEach(button=>button.classList.toggle("active",button.dataset.riwayah===state.riwayah));
    const voices=state.riwayah==="warsh"?[["hicham-lharraz","Hicham El Harraz"]]:[["ar.alafasy","Mishary Alafasy"],["ar.husary","Mahmoud Al-Hussary"],["ar.abdurrahmaansudais","Abdurrahman As-Sudais"],["ar.mahermuaiqly","Maher Al-Muaiqly"]];$("#voiceSelect").innerHTML=voices.map(([id,name])=>`<option value="${id}"${id===state.reciter?" selected":""}>${name}</option>`).join("");
    $("#tajweedToggle").checked=state.tajweed; $("#tajweedToggle").disabled=state.riwayah==="warsh";$("#pronunciationToggle").checked=state.pronunciation; $("#frenchToggle").checked=state.french; $("#englishToggle").checked=state.english; $("#fontSize").value=String(state.fontSize); $("#memoryToggle").checked=state.memory;refreshAudioDownloadStatus();
  }
  function setOption(key,value){state[key]=value;saveState();renderSurah();updateSettings();}

  function updateThemeIcons(){$$('[data-theme-icon]').forEach(icon=>icon.src=state.theme==="dark"?"icons/sun.png":"icons/moon.png")}
  function applyTheme(theme){state.theme=theme==="light"?"light":"dark";document.documentElement.dataset.theme=state.theme;updateThemeIcons();saveState()}
  function toggleTheme(event){event?.preventDefault();event?.stopPropagation();event?.stopImmediatePropagation?.();const now=Date.now();if(now-lastThemeToggle<450)return;lastThemeToggle=now;applyTheme(document.documentElement.dataset.theme==="light"?"dark":"light")}

  function goToVerse(){
    const value=prompt(t("versePrompt"),"1"); if(value===null)return; const number=Number(value), target=$(`#verse-${number}`); if(!target){showToast(t("invalidVerse"));return;}state.currentVerse=number;saveState();target.scrollIntoView({behavior:"smooth",block:"center"});
  }

  async function createSurahImage(){
    try{
      const item=surah(), first=verses()[0]; const canvas=document.createElement("canvas");canvas.width=1080;canvas.height=1350;const ctx=canvas.getContext("2d");
      const gradient=ctx.createLinearGradient(0,0,1080,1350);gradient.addColorStop(0,"#07130f");gradient.addColorStop(1,"#10271f");ctx.fillStyle=gradient;ctx.fillRect(0,0,1080,1350);ctx.strokeStyle="#dfbf70";ctx.lineWidth=2;ctx.roundRect(60,60,960,1230,54);ctx.stroke();ctx.textAlign="center";ctx.fillStyle="#dfbf70";ctx.font="34px Georgia";ctx.fillText(`NŪR · ${String(item.number).padStart(3,"0")}`,540,150);ctx.fillStyle="#f5f1e8";ctx.font="72px Georgia";ctx.fillText(item.nameLatin,540,265);ctx.fillStyle="#dfbf70";ctx.font="74px serif";ctx.direction="rtl";wrapCanvasText(ctx,first.arabic,540,470,860,110);ctx.direction="ltr";ctx.fillStyle="#aab7b1";ctx.font="32px Georgia";wrapCanvasText(ctx,state.language==="en"?first.en:first.fr,540,890,820,48);ctx.fillStyle="#dfbf70";ctx.font="bold 38px Georgia";ctx.textAlign="right";ctx.fillText("NŪR",960,1230);
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,"image/png"));const file=new File([blob],`Nur-${item.number}.png`,{type:"image/png"});if(navigator.share&&navigator.canShare?.({files:[file]}))await navigator.share({files:[file],title:`Nūr · ${item.nameLatin}`});else{const link=document.createElement("a");link.href=URL.createObjectURL(blob);link.download=file.name;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000);}showToast(t("imageShared"));
    }catch{showToast(t("imageFailed"));}
  }
  function wrapCanvasText(ctx,text,x,y,maxWidth,lineHeight){const words=text.split(/\s+/),lines=[];let line="";for(const word of words){const trial=line?`${line} ${word}`:word;if(ctx.measureText(trial).width>maxWidth&&line){lines.push(line);line=word}else line=trial}if(line)lines.push(line);lines.slice(0,5).forEach((value,index)=>ctx.fillText(value,x,y+index*lineHeight));}

  function openOnboarding(){onboardingStep=0;$("#onboarding").hidden=false;document.body.classList.add("modal-open");renderOnboarding();}
  function renderOnboarding(){
    $$(".onboarding-progress i").forEach((node,index)=>node.classList.toggle("active",index<=onboardingStep));
    const content=$("#onboardingContent");
    if(onboardingStep===0) content.innerHTML=`<small>NŪR</small><h1>${t("welcome")}</h1><p>${t("welcomeText")}</p><div class="onboarding-grid"><button data-onboard-language="fr">Français</button><button data-onboard-language="en">English</button><button data-onboard-language="ar">العربية</button></div>`;
    else if(onboardingStep===1){const voices=state.riwayah==="warsh"?[['hicham-lharraz','Hicham El Harraz']]:[['ar.alafasy','Mishary Alafasy'],['ar.husary','Mahmoud Al-Hussary'],['ar.abdurrahmaansudais','Abdurrahman As-Sudais'],['ar.mahermuaiqly','Maher Al-Muaiqly']];content.innerHTML=`<small>02 · ${t("recitation")}</small><h1>${t("recitation")}</h1><p>${t("recitationText")}</p><div class="onboarding-setting"><label>${t("recitation")}</label><div class="onboarding-choice"><button data-onboard-riwayah="hafs"><b>Ḥafṣ</b><span>ʿan ʿĀṣim</span></button><button data-onboard-riwayah="warsh"><b>Warsh</b><span>ʿan Nāfiʿ</span></button></div></div><div class="onboarding-setting"><label for="onboardingVoice">${t("voice")}</label><select id="onboardingVoice">${voices.map(([id,name])=>`<option value="${id}"${id===state.reciter?' selected':''}>${name}</option>`).join('')}</select></div><label class="onboarding-switch"><span><b>${t("colors")}</b><small>${state.riwayah==="warsh"?'Warsh · —':'Ḥafṣ'}</small></span><input id="onboardingTajweed" type="checkbox" ${state.tajweed?'checked':''} ${state.riwayah==="warsh"?'disabled':''}></label>`}
    else content.innerHTML=`<small>03 · NŪR</small><h1>${t("appearance")}</h1><p>${t("appearanceLead")}</p><div class="theme-cards"><button data-onboard-theme="dark"><span class="theme-preview dark-preview"><i></i></span><b>${t("dark")}</b></button><button data-onboard-theme="light"><span class="theme-preview light-preview"><i></i></span><b>${t("light")}</b></button></div>`;
    $$('[data-onboard-language]').forEach(button=>{button.classList.toggle("active",button.dataset.onboardLanguage===state.language);button.onclick=()=>{state.language=button.dataset.onboardLanguage;saveState();applyLanguage();renderOnboarding();}});
    $$('[data-onboard-riwayah]').forEach(button=>{button.classList.toggle("active",button.dataset.onboardRiwayah===state.riwayah);button.onclick=()=>{state.riwayah=button.dataset.onboardRiwayah;state.reciter=state.riwayah==="warsh"?"hicham-lharraz":"ar.alafasy";if(state.riwayah==="warsh")state.tajweed=false;saveState();renderOnboarding();}});
    if($("#onboardingVoice"))$("#onboardingVoice").onchange=event=>{state.reciter=event.target.value;saveState()};
    if($("#onboardingTajweed"))$("#onboardingTajweed").onchange=event=>{state.tajweed=event.target.checked;saveState()};
    $$('[data-onboard-theme]').forEach(button=>{button.classList.toggle("active",button.dataset.onboardTheme===state.theme);button.onclick=()=>applyTheme(button.dataset.onboardTheme)});
    $("#onboardingBack").style.visibility=onboardingStep?"visible":"hidden";$("#onboardingNext span").textContent=onboardingStep===2?t("start"):t("next");
  }

  function showResume(){if(!state.onboarded||!state.current)return;$("#resumeName").textContent=DATA[state.current-1]?.nameLatin||"";$("#resumeToast").hidden=false;}

  function syncSharedState(){try{const value=window.NurAndroid?.getState?.();if(!value)return;state={...state,...JSON.parse(value)};document.documentElement.dataset.theme=state.theme;updateThemeIcons();applyLanguage();showView(currentView,{instant:true})}catch{}}

  function bind(){
    $$('[data-view]').forEach(button=>button.addEventListener("click",()=>showView(button.dataset.view,{library:button.dataset.view==="read"?true:undefined})));
    $$('[data-theme]').forEach(button=>button.addEventListener("click",toggleTheme));$$('[data-settings]').forEach(button=>button.addEventListener("click",openSettings));$$('[data-fqih]').forEach(button=>button.addEventListener("click",openFqih));
    $("#homeChoose").onclick=()=>showView("read",{library:true});$("#homeResume").onclick=()=>openSurah(state.current);$("#mobileLibrary").onclick=()=>{libraryOpen=true;$("#view-read").classList.add("library-open");scrollTo(0,0)};$("#surahSearch").oninput=event=>renderSurahList(event.target.value);
    $("#previousSurah").onclick=()=>openSurah(state.current-1);$("#nextSurah").onclick=()=>openSurah(state.current+1);$("#favoriteButton").onclick=toggleFavorite;$("#markRead").onclick=markRead;$("#jumpButton").onclick=goToVerse;$("#playSurah").onclick=playSurah;
    $("#closeSettings").onclick=closeSettings;$("#settingsLayer").onclick=event=>{if(event.target.id==="settingsLayer")closeSettings()};
    $$('[data-language]').forEach(button=>button.onclick=()=>{state.language=button.dataset.language;saveState();applyLanguage()});$$('[data-riwayah]').forEach(button=>button.onclick=()=>{state.riwayah=button.dataset.riwayah;state.reciter=state.riwayah==="warsh"?"hicham-lharraz":"ar.alafasy";if(state.riwayah==="warsh")state.tajweed=false;saveState();renderSurah();updateSettings()});
    $("#voiceSelect").onchange=event=>setOption("reciter",event.target.value);
    $("#tajweedToggle").onchange=event=>setOption("tajweed",event.target.checked);$("#pronunciationToggle").onchange=event=>setOption("pronunciation",event.target.checked);$("#frenchToggle").onchange=event=>setOption("french",event.target.checked);$("#englishToggle").onchange=event=>setOption("english",event.target.checked);$("#fontSize").oninput=event=>setOption("fontSize",Number(event.target.value));$("#memoryToggle").onchange=event=>setOption("memory",event.target.checked);
    $("#focusButton").onclick=()=>{closeSettings();showView("read",{library:false});document.body.classList.add("focus-mode")};$("#focusExit").onclick=()=>document.body.classList.remove("focus-mode");$("#imageButton").onclick=createSurahImage;$("#downloadAudio").onclick=downloadCurrentAudio;
    $("#resetData").onclick=()=>{if(confirm(t("resetConfirm"))){localStorage.removeItem(STORAGE_KEY);try{window.NurAndroid?.clearState?.();window.NurAndroid?.deleteAllAudio()}catch{}state={...DEFAULTS};saveState();closeSettings();applyLanguage();openOnboarding();showToast(t("resetDone"));}};
    $("#onboardingBack").onclick=()=>{onboardingStep=Math.max(0,onboardingStep-1);renderOnboarding()};$("#onboardingNext").onclick=()=>{if(onboardingStep<2){onboardingStep++;renderOnboarding()}else{state.onboarded=true;saveState();$("#onboarding").hidden=true;document.body.classList.remove("modal-open");showView("home")}};
    $("#resumeButton").onclick=()=>{$("#resumeToast").hidden=true;openSurah(state.current)};$("#dismissResume").onclick=()=>$("#resumeToast").hidden=true;
    $("#mediaToggle").onclick=()=>audio.paused?audio.play():audio.pause();$("#mediaClose").onclick=()=>{audio.pause();$("#mediaPlayer").hidden=true};
    audio.onplay=()=>$("#mediaToggle img").src="icons/pause.png";audio.onpause=()=>$("#mediaToggle img").src="icons/play.png";audio.ontimeupdate=()=>$("#mediaProgress").value=audio.duration?audio.currentTime/audio.duration*100:0;audio.onended=()=>{audioIndex++;if(audioIndex<audioQueue.length)startAudio(audioQueue[audioIndex]);else $("#mediaPlayer").hidden=true};audio.onerror=()=>showToast(t("audioUnavailable"));
    document.addEventListener("click",event=>{const control=event.target.closest?.("button,a[href],select,input");if(!control||control.disabled)return;haptic(control.matches(".reset-data")?"warning":control.matches(".primary,.online-action,.mark-read,.download-audio-button")?"medium":"selection")},true);
    addEventListener("offline",()=>showToast(t("offlineNotice")));
    addEventListener("online",()=>{saveState();showToast(t("onlineAudio"));setTimeout(()=>window.NurAndroid?.openOnline?.(),500)});
  }

  function init(){
    if(DATA.length!==114){document.body.innerHTML=`<div class="empty-favorites">Offline Quran data is incomplete.</div>`;return;}
    saveState();document.documentElement.dataset.theme=state.theme;bind();updateThemeIcons();applyLanguage();showView("home",{instant:true});setTimeout(()=>$("#splash").classList.add("hide"),650);setTimeout(()=>{if(!state.onboarded)openOnboarding();else showResume();if(!navigator.onLine)showToast(t("offlineNotice"))},1050);
    window.NurOffline={createSurahImage,syncSharedState,enterFocus:()=>document.body.classList.toggle("focus-mode"),meta:META,onAudioDownloadProgress:(surahNumber,done,total,finished,failed)=>{if(surahNumber!==state.current)return;const status=$("#audioDownloadStatus");status.textContent=failed?t("audioDownloadFailed"):finished?t("audioSaved"):`${t("audioDownloading")} · ${done}/${total}`;if(finished&&!failed)showToast(t("audioSaved"))}};
  }
  init();
})();
