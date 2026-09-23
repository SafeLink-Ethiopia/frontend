import type { Language } from "../context/LanguageContext";

export const translations = {
  en: {
    // Landing
    privateSafeSupportive: "Private • Safe • Supportive",
    youreNotAlone: "You're not alone. SafeLink is here.",
    landingDescription:
      "A private way to find the support and services you need.",
    iNeedHelp: "I Need Help",
    imHelping: "I'm Helping",
    continueExistingSession: "Continue Existing Session",
    privacyNote: "No name, phone number, or email is required.",
    quickExit: "Quick Exit",

    // Create session
    privateSession: "PRIVATE SESSION",
    createPrivateSpace: "Create your private space.",
    chooseLanguage: "Language",
    optionalPin: "Optional PIN",
    createPin: "Create a PIN",
    createPrivateSession: "Create Private Session",
    back: "Back",

    // Session created
    sessionCreated: "PRIVATE SESSION CREATED",
    yourSafeLinkId: "Your SafeLink ID",
    copySafeLinkId: "Copy SafeLink ID",
    copied: "Copied",
    continueToSupport: "Continue to Private Support",

    // Login
    welcomeBack: "Welcome back",
    enterSafeLinkId:
      "Enter your SafeLink ID to return to your private session.",
    safeLinkId: "SafeLink ID",
    pin: "PIN",
    continueToPrivateSupport: "Continue to Private Support",

    // Support
    howCanWeHelp: "How can we help you today?",
    chooseSupport: "Choose the type of support you need.",
    medicalHelp: "I need medical help",
    medicalHelpDescription: "Connect me with appropriate medical support.",
    yourPrivateSession: "Your private session",

    // Helping
    thankYouForHelping: "Thank you for helping.",
    supporterAccess: "SUPPORTER ACCESS",
    medicalSupport: "Medical Support",
    generalSupport: "General Support",
    comingSoon: "Coming soon",

    // Quick Exit
    communityUpdates: "Community Updates",
    dailyUpdates: "Daily Updates",
    whatsHappening: "What's happening today?",
    weather: "Weather",
    localUpdates: "Local Updates",
    events: "Events",
    private: "Private",
    privateDescription: "No personal information required.",
    trustedSupport: "Trusted Support",
    trustedSupportDescription: "Guidance when you need it.",
    yourLanguage: "Your Language",
    yourLanguageDescription: "English, Amharic & Afaan Oromoo.",
    youMatter: "You Matter",
    youMatterDescription: "Your well-being comes first.",
  },

  am: {
    // Landing
    privateSafeSupportive: "የግል • ደህንነቱ የተጠበቀ • ድጋፍ",
    youreNotAlone: "ብቻዎን አይደሉም። SafeLink እዚህ አለ።",
    landingDescription: "የሚፈልጉትን ድጋፍ እና አገልግሎት በግል ለማግኘት የሚያግዝ መንገድ።",
    iNeedHelp: "እርዳታ እፈልጋለሁ",
    imHelping: "እረዳለሁ",
    continueExistingSession: "ያለውን ክፍለ ጊዜ ቀጥል",
    privacyNote: "ስም፣ ስልክ ቁጥር ወይም ኢሜይል አያስፈልግም።",
    quickExit: "ፈጣን መውጫ",
    private: "የግል",
    privateDescription: "የግል መረጃ አያስፈልግም።",
    trustedSupport: "የታመነ ድጋፍ",
    trustedSupportDescription: "በሚፈልጉበት ጊዜ መመሪያ ያግኙ።",
    yourLanguage: "ቋንቋዎ",
    yourLanguageDescription: "እንግሊዝኛ፣ አማርኛ እና Afaan Oromoo።",
    youMatter: "እርስዎ ዋጋ አለዎት",
    youMatterDescription: "ደህንነትዎ ቅድሚያ ይሰጠዋል።",

    // Create session
    privateSession: "የግል ክፍለ ጊዜ",
    createPrivateSpace: "የግል ቦታዎን ይፍጠሩ።",
    chooseLanguage: "ቋንቋ",
    optionalPin: "አማራጭ PIN",
    createPin: "PIN ይፍጠሩ",
    createPrivateSession: "የግል ክፍለ ጊዜ ይፍጠሩ",
    back: "ተመለስ",

    // Session created
    sessionCreated: "የግል ክፍለ ጊዜ ተፈጥሯል",
    yourSafeLinkId: "የSafeLink መለያዎ",
    copySafeLinkId: "የSafeLink መለያን ቅዳ",
    copied: "ተቀድቷል",
    continueToSupport: "ወደ የግል ድጋፍ ይቀጥሉ",

    // Login
    welcomeBack: "እንኳን ደህና መጡ",
    enterSafeLinkId: "ወደ የግል ክፍለ ጊዜዎ ለመመለስ የSafeLink መለያዎን ያስገቡ።",
    safeLinkId: "የSafeLink መለያ",
    pin: "PIN",
    continueToPrivateSupport: "ወደ የግል ድጋፍ ይቀጥሉ",

    // Support
    howCanWeHelp: "ዛሬ እንዴት ልንረዳዎት እንችላለን?",
    chooseSupport: "የሚፈልጉትን የድጋፍ አይነት ይምረጡ።",
    medicalHelp: "የሕክምና እርዳታ እፈልጋለሁ",
    medicalHelpDescription: "ከተገቢው የሕክምና ድጋፍ ጋር ያገናኙኝ።",
    yourPrivateSession: "የግል ክፍለ ጊዜዎ",

    // Helping
    thankYouForHelping: "ስለሚረዱ እናመሰግናለን።",
    supporterAccess: "የድጋፍ ሰጪ መዳረሻ",
    medicalSupport: "የሕክምና ድጋፍ",
    generalSupport: "አጠቃላይ ድጋፍ",
    comingSoon: "በቅርቡ ይገኛል",

    // Quick Exit
    communityUpdates: "የማህበረሰብ ዝመናዎች",
    dailyUpdates: "የዕለት ዝመናዎች",
    whatsHappening: "ዛሬ ምን እየተከናወነ ነው?",
    weather: "የአየር ሁኔታ",
    localUpdates: "የአካባቢ ዝመናዎች",
    events: "ዝግጅቶች",
  },

  om: {
    // Landing
    privateSafeSupportive: "Dhuunfaa • Nageenya • Deeggarsa",
    youreNotAlone: "Qofti keessan miti. SafeLink as jira.",
    landingDescription:
      "Deeggarsaa fi tajaajila isin barbaaddan karaa dhuunfaa ta'een argachuuf.",
    iNeedHelp: "Gargaarsa Nan Barbaada",
    imHelping: "Nan Gargaara",
    continueExistingSession: "Seensa Duraanii Itti Fufi",
    privacyNote: "Maqaan, lakkoofsi bilbilaa ykn imeeyiliin hin barbaachisu.",
    quickExit: "Ba'iinsaa Saffisaa",
    private: "Dhuunfaa",
    privateDescription: "Odeeffannoon dhuunfaa hin barbaachisu.",
    trustedSupport: "Deeggarsa Amanamaa",
    trustedSupportDescription: "Yeroo isin barbaaddan qajeelfama argadhaa.",
    yourLanguage: "Afaan Keessan",
    yourLanguageDescription: "English, Amharic fi Afaan Oromoo.",
    youMatter: "Isin Murteessoodha",
    youMatterDescription: "Nageenyi fi fayyaan keessan dursa qaba.",

    // Create session
    privateSession: "SEENSA DHUUNFAA",
    createPrivateSpace: "Iddoo dhuunfaa keessan uumaa.",
    chooseLanguage: "Afaan",
    optionalPin: "PIN Filannoo",
    createPin: "PIN Uumaa",
    createPrivateSession: "Seensa Dhuunfaa Uumaa",
    back: "Duubatti",

    // Session created
    sessionCreated: "SEENSI DHUUNFAA UUMAMEERA",
    yourSafeLinkId: "SafeLink ID Keessan",
    copySafeLinkId: "SafeLink ID Kophaa",
    copied: "Kophaa'eera",
    continueToSupport: "Gara Deeggarsa Dhuunfaatti Itti Fufi",

    // Login
    welcomeBack: "Baga Deebitan",
    enterSafeLinkId:
      "Gara seensa dhuunfaa keessanitti deebi'uuf SafeLink ID keessan galchaa.",
    safeLinkId: "SafeLink ID",
    pin: "PIN",
    continueToPrivateSupport: "Gara Deeggarsa Dhuunfaatti Itti Fufi",

    // Support
    howCanWeHelp: "Har'a akkamitti isin gargaaruu dandeenya?",
    chooseSupport: "Gosa deeggarsa isin barbaaddan filadhaa.",
    medicalHelp: "Gargaarsa Yaalaa Nan Barbaada",
    medicalHelpDescription: "Deeggarsa yaalaa sirrii wajjin na qunnamsiisaa.",
    yourPrivateSession: "Seensa dhuunfaa keessan",

    // Helping
    thankYouForHelping: "Gargaarsa gootaniif galatoomaa.",
    supporterAccess: "SEENSA DEEGGARTOOTAA",
    medicalSupport: "Deeggarsa Yaalaa",
    generalSupport: "Deeggarsa Waliigalaa",
    comingSoon: "Dhiyootti ni argama",

    // Quick Exit
    communityUpdates: "Oduu Hawaasaa",
    dailyUpdates: "Oduu Guyyaa",
    whatsHappening: "Har'a maaltu raawwatamaa jira?",
    weather: "Haala Qilleensaa",
    localUpdates: "Oduu Naannoo",
    events: "Taateewwan",
  },
} as const;

export function getTranslations(language: Language) {
  return translations[language];
}
