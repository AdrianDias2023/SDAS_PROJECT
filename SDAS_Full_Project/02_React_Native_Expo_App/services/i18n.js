import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LANGUAGE_KEY = '@sdas_selected_language';

export const translations = {
  en: {
    appName: "SDAS",
    appFullName: "Smart Dam Alert System",
    tagline: "Safe Today, Secure Tomorrow",
    
    // Tabs & Navigation
    tabHome: "Home",
    tabAlerts: "Alerts",
    tabPredict: "AI Forecast",
    tabAbout: "About",
    tabOperator: "Operator",
    
    // Home Screen
    liveWaterLevel: "Live Water Level",
    currentStatus: "System Status",
    damName: "Puttalam District Dam",
    statusNormal: "NORMAL",
    statusPreWarning: "PRE-WARNING",
    statusClearArea: "CLEAR AREA",
    statusDanger: "DANGER",
    gateOpen: "Gate Open",
    temperature: "Temperature",
    humidity: "Humidity",
    rainfall: "Rainfall",
    lastUpdated: "Last Updated",
    quickStats: "Live Dam Telemetry",
    dualSensorHealth: "Sensor Health",
    sensorOptimal: "Dual Redundancy Active (Optimal)",
    tapToRefresh: "Pull down to refresh",
    operatorLoginPrompt: "Operator Access",
    operatorLoginBtn: "Login as Dam Operator",
    
    // Weather & Rainfall Forecast API
    liveWeatherTitle: "Satellite Weather & Rain Radar",
    forecast6h: "Next 6-Hour Rainfall Forecast",
    precipProb: "Precipitation Probability",
    rainAlertIncoming: "⛈️ Heavy rain forecast (>30mm). Pre-warning threshold activated earlier for proactive safety.",
    rainNormal: "🌤️ Stable meteorological conditions in Puttalam basin.",
    
    // Alerts Screen
    alertsTitle: "Active & Past Alerts",
    noAlerts: "No active alerts. Dam levels are within normal range.",
    severity: "Severity",
    level: "Alert Level",
    message: "Message",
    time: "Time",
    acknowledged: "Acknowledged",
    unacknowledged: "Needs Attention",
    
    // Prediction Screen (Hybrid Model: LSTM + Random Forest + Autoencoder)
    mlTitle: "Hybrid AI Hydrological Pipeline",
    mlSubtitle: "LSTM Regression + Random Forest Ensemble Risk Model",
    forecast1h: "Next 1-Hour Water Level",
    forecastDesc: "Stage 1: 2-Layer LSTM forecasting water depth from 24h meteorological & sensor sequences.",
    floodProbTitle: "Flood / Overtopping Probability",
    floodProbDesc: "Stage 2: Calibrated Random Forest ensemble predicting spill risk based on 6h forecast rain & LSTM prediction.",
    predictedLevel: "Predicted Level",
    currentLevel: "Current Level",
    floodProbability: "Flood Probability",
    riskClassification: "Operational Risk Tier",
    recommendedAction: "Recommended Gate Action",
    riskLow: "LOW RISK (Normal)",
    riskMedium: "MEDIUM RISK (Monitor Inflow)",
    riskHigh: "HIGH RISK (Prepare Downstream)",
    riskCritical: "CRITICAL RISK (Emergency Spill)",
    anomalyDetection: "Sensor Integrity Guardian",
    anomalyDesc: "Deep Autoencoder verifies telemetry consistency to prevent false flood triggers.",
    anomalyStatusNormal: "Sensors Verified (No Drift)",
    anomalyDetected: "Sensor Discrepancy / Drift Detected",
    
    // About Screen (Proposal Content)
    aboutTitle: "About SDAS",
    aboutProject: "Project Overview",
    aboutProjectDesc: "Floods in the Puttalam region of Sri Lanka frequently cause devastation due to the lack of automated early warning and dam gate response. Manual gate operations historically take 30+ minutes. SDAS automates the entire loop with dual ultrasonic sensing, intelligent early warnings, automated gate actuation, and cloud-assisted AI forecasting.",
    aboutObjectives: "Key Innovations",
    aboutObj1: "• Dual JSN-SR04T waterproof ultrasonic sensors with speed-of-sound temperature compensation for ±2 cm precision.",
    aboutObj2: "• 4-tier safety threshold controller (Normal <70%, Pre-Warning 70-85%, Clear Area 70-85% rising, Danger >85%).",
    aboutObj3: "• Automated MG996R servo gate control and SIM800L emergency GSM SMS broadcast.",
    aboutObj4: "• Real-time cloud synchronization via Supabase PostgreSQL & Row-Level Security.",
    aboutObj5: "• Real-time Satellite Weather API + Hybrid AI pipeline (LSTM + Random Forest Ensemble).",
    aboutTeam: "Project Team",
    teamRole1: "Dias Adrian — Cyber Security",
    teamRole2: "AAA Aadhil — Data Science",
    teamRole3: "JMRA Dilshan — Software Engineering",
    aboutSupervisors: "Supervisors",
    supervisor1: "Dr. Sanika Wijayasekara (Data Science & Cyber Security)",
    supervisor2: "Mr. Kavinda Tharindu (Data Science)",
    institution: "Faculty of Computing and IT\nSLTC Research University, Sri Lanka",
    
    // Operator Screens
    operatorDashboard: "Operator Control Center",
    gateControl: "Gate Actuator Control",
    gateMode: "Gate Mode",
    modeAuto: "AUTOMATIC (AI & Sensor-driven)",
    modeManual: "MANUAL OVERRIDE",
    setGatePercentage: "Set Gate Opening Percentage",
    applyGateCommand: "Transmit Gate Command",
    contactsTitle: "Emergency Contacts",
    addContact: "Add Emergency Contact",
    contactName: "Contact Name",
    contactPhone: "Phone Number (+94...)",
    contactRole: "Role / Authority",
    saveContact: "Save Contact",
    deleteContact: "Delete",
    loginTitle: "Operator Portal",
    loginSubtitle: "Sign in with your authorized credentials",
    email: "Email Address",
    password: "Password",
    signIn: "Sign In",
    signOut: "Sign Out",
    
    // Language Switcher
    language: "Language",
    selectLanguage: "Select Language"
  },
  
  si: {
    appName: "SDAS",
    appFullName: "ස්මාර්ට් වේලි අනතුරු ඇඟවීමේ පද්ධතිය",
    tagline: "අද සුරක්ෂිතයි, හෙට තහවුරුයි",
    
    // Tabs & Navigation
    tabHome: "ප්‍රධාන පිටුව",
    tabAlerts: "අනතුරු ඇඟවීම්",
    tabPredict: "AI පුරෝකථන",
    tabAbout: "තොරතුරු",
    tabOperator: "ක්‍රියාකරු",
    
    // Home Screen
    liveWaterLevel: "සජීවී ජල මට්ටම",
    currentStatus: "පද්ධති තත්ත්වය",
    damName: "පුත්තලම දිස්ත්‍රික් වේල්ල",
    statusNormal: "සාමාන්‍ය (NORMAL)",
    statusPreWarning: "පෙර අනතුරු ඇඟවීම (PRE-WARNING)",
    statusClearArea: "ප්‍රදේශය ඉවත් කරන්න (CLEAR AREA)",
    statusDanger: "අන්තරායකරයි (DANGER)",
    gateOpen: "දොරටු විවෘත කිරීම",
    temperature: "උෂ්ණත්වය",
    humidity: "ආර්ද්‍රතාව",
    rainfall: "වර්ෂාපතනය",
    lastUpdated: "අවසන් යාවත්කාලීනය",
    quickStats: "වේලි තොරතුරු සජීවී දත්ත",
    dualSensorHealth: "සංවේදක තත්ත්වය",
    sensorOptimal: "ද්විත්ව සංවේදක සක්‍රියයි (විශිෂ්ටයි)",
    tapToRefresh: "යාවත්කාලීන කිරීමට පහළට අදින්න",
    operatorLoginPrompt: "ක්‍රියාකරු පිවිසුම",
    operatorLoginBtn: "ක්‍රියාකරු ලෙස පිවිසෙන්න",
    
    // Weather & Rainfall Forecast API
    liveWeatherTitle: "සැටලයිට් කාලගුණ සහ වර්ෂාපතන රේඩාර්",
    forecast6h: "ඉදිරි පැය 6 ක වර්ෂාපතන පුරෝකථනය",
    precipProb: "වර්ෂාපතන සම්භාවිතාව",
    rainAlertIncoming: "⛈️ අධික වර්ෂාවක් පුරෝකථනය කර ඇත (>30mm). පෙර අනතුරු ඇඟවීමේ මට්ටම කල්තියා ක්‍රියාත්මක විය.",
    rainNormal: "🌤️ පුත්තලම ද්‍රෝණියේ කාලගුණය සාමාන්‍ය මට්ටමේ පවතී.",
    
    // Alerts Screen
    alertsTitle: "අනතුරු ඇඟවීම් ඉතිහාසය",
    noAlerts: "සක්‍රිය අනතුරු ඇඟවීම් නොමැත. ජල මට්ටම සාමාන්‍ය මට්ටමේ පවතී.",
    severity: "බරපතලකම",
    level: "අනතුරු ඇඟවීමේ මට්ටම",
    message: "පණිවිඩය",
    time: "වේලාව",
    acknowledged: "තහවුරු කරන ලදී",
    unacknowledged: "අවධානය අවශ්‍යයි",
    
    // Prediction Screen
    mlTitle: "සංයුක්ත AI ජලවිද්‍යාත්මක ආකෘතිය (Hybrid AI)",
    mlSubtitle: "LSTM පුරෝකථනය + Random Forest ගංවතුර අවදානම් සම්භාවිතාව",
    forecast1h: "පැය 1 කට පසු ජල මට්ටම",
    forecastDesc: "1 වන අදියර: 24-පැය කාලගුණ දත්ත මඟින් පුරෝකථනය කරන ලද 2-Layer LSTM ආකෘතිය.",
    floodProbTitle: "ගංවතුර / පිටාර ගැලීමේ සම්භාවිතාව",
    floodProbDesc: "2 වන අදියර: පැය 6 ක වර්ෂාපතන පුරෝකථනය සහ LSTM ප්‍රතිදානය මත පදනම් වූ Random Forest අවදානම් තක්සේරුව.",
    predictedLevel: "පුරෝකථනය කළ මට්ටම",
    currentLevel: "වත්මන් ජල මට්ටම",
    floodProbability: "ගංවතුර සම්භාවිතාව",
    riskClassification: "ක්‍රියාකාරී අවදානම් මට්ටම",
    recommendedAction: "නිර්දේශිත දොරටු පියවර",
    riskLow: "අඩු අවදානම (සාමාන්‍ය)",
    riskMedium: "මධ්‍යම අවදානම (නිරීක්ෂණය කරන්න)",
    riskHigh: "ඉහළ අවදානම (පහළ ප්‍රදේශ සූදානම් කරන්න)",
    riskCritical: "අතිශය අන්තරායකරයි (හදිසි දොරටු විවෘත කිරීම)",
    anomalyDetection: "සංවේදක නිරවද්‍යතා ආරක්ෂකයා",
    anomalyDesc: "Autoencoder මඟින් සංවේදක දෝෂ පරීක්ෂා කර ව්‍යාජ අනතුරු ඇඟවීම් වළක්වයි.",
    anomalyStatusNormal: "සංවේදක තහවුරුයි (දෝෂ නොමැත)",
    anomalyDetected: "සංවේදක දෝෂයක් / විෂමතාවයක් හඳුනා ගන්නා ලදී",
    
    // About Screen
    aboutTitle: "SDAS පද්ධතිය පිළිබඳව",
    aboutProject: "ව්‍යාපෘති දළ විශ්ලේෂණය",
    aboutProjectDesc: "ශ්‍රී ලංකාවේ පුත්තලම ප්‍රදේශයේ ස්වයංක්‍රීය වේලි නිරීක්ෂණ පද්ධතියක් නොමැතිකම නිසා ගංවතුරින් විශාල හානි සිදුවේ. අතින් ක්‍රියාත්මක වන දොරටු සඳහා මිනිත්තු 30+ ගතවේ. SDAS පද්ධතිය මඟින් ස්වයංක්‍රීය සංවේදක, ක්ෂණික අනතුරු ඇඟවීම්, ස්වයංක්‍රීය දොරටු පාලනය සහ AI මඟින් ජල මට්ටම පුරෝකථනය සිදු කරයි.",
    aboutObjectives: "ප්‍රධාන විශේෂාංග",
    aboutObj1: "• ±2 cm නිරවද්‍යතාවයක් සහිත ද්විත්ව JSN-SR04T ජල ආරක්ෂිත අතිධ්වනි සංවේදක සහ උෂ්ණත්ව වන්දි පද්ධතිය.",
    aboutObj2: "• සිව්-මට්ටමේ ආරක්ෂිත එළිපත්ත පාලකය (සාමාන්‍ය <70%, පූර්ව අනතුරු ඇඟවීම 70-85%, ඉවත් කිරීමේ 70-85% වේගයෙන් ඉහළ යන, අන්තරාය >85%).",
    aboutObj3: "• MG996R මඟින් ස්වයංක්‍රීය දොරටු පාලනය සහ SIM800L මඟින් හදිසි SMS යැවීම.",
    aboutObj4: "• Supabase PostgreSQL ක්ලවුඩ් දත්ත සමුදාය සහ තත්‍ය කාලීන ආරක්ෂණ ප්‍රතිපත්ති.",
    aboutObj5: "• කාලගුණ API සහ LSTM, Random Forest සංයුක්ත AI ආකෘති මඟින් ගංවතුර පුරෝකථනය.",
    aboutTeam: "ව්‍යාපෘති කණ්ඩායම",
    teamRole1: "ඩයස් ඒඩ්‍රියන් — සයිබර් ආරක්ෂාව (Cyber Security)",
    teamRole2: "ඒ.ඒ.ඒ. ආදිල් — දත්ත විද්‍යාව (Data Science)",
    teamRole3: "ජේ.එම්.ආර්.ඒ. දිල්ශාන් — මෘදුකාංග ඉංජිනේරු (Software Engineering)",
    aboutSupervisors: "උපදේශක මණ්ඩලය",
    supervisor1: "ආචාර්ය සනිකා විජයසේකර (දත්ත විද්‍යාව සහ සයිබර් ආරක්ෂාව)",
    supervisor2: "කාවින්ද තරිඳු මහතා (දත්ත විද්‍යාව)",
    institution: "පරිගණක හා තොරතුරු තාක්ෂණ පීඨය\nSLTC පර්යේෂණ විශ්වවිද්‍යාලය, ශ්‍රී ලංකාව",
    
    // Operator Screens
    operatorDashboard: "ක්‍රියාකරු පාලන මධ්‍යස්ථානය",
    gateControl: "වේලි දොරටු පාලනය",
    gateMode: "දොරටු මාදිලිය",
    modeAuto: "ස්වයංක්‍රීය (AI සහ සංවේදක මඟින්)",
    modeManual: "අතින් පාලනය (MANUAL)",
    setGatePercentage: "දොරටුව විවෘත කිරීමේ ප්‍රතිශතය",
    applyGateCommand: "විධානය යවන්න",
    contactsTitle: "හදිසි සම්බන්ධතා",
    addContact: "නව සම්බන්ධතාවයක් එක් කරන්න",
    contactName: "නම",
    contactPhone: "දුරකථන අංකය (+94...)",
    contactRole: "තනතුර / අධිකාරිය",
    saveContact: "සුරකින්න",
    deleteContact: "මකන්න",
    loginTitle: "ක්‍රියාකරු පිවිසුම",
    loginSubtitle: "ඔබගේ බලයලත් ගිණුමෙන් පිවිසෙන්න",
    email: "විද්‍යුත් තැපෑල",
    password: "මුරපදය",
    signIn: "ඇතුල් වන්න",
    signOut: "ඉවත් වන්න",
    
    // Language Switcher
    language: "භාෂාව",
    selectLanguage: "භාෂාව තෝරන්න"
  },
  
  ta: {
    appName: "SDAS",
    appFullName: "ஸ்மார்ட் அணை எச்சரிக்கை அமைப்பு",
    tagline: "இன்று பாதுகாப்பானது, நாளை உறுதியானது",
    
    // Tabs & Navigation
    tabHome: "முகப்பு",
    tabAlerts: "எச்சரிக்கைகள்",
    tabPredict: "AI கணிப்பு",
    tabAbout: "விவரம்",
    tabOperator: "இயக்குநர்",
    
    // Home Screen
    liveWaterLevel: "நேரடி நீர் மட்டம்",
    currentStatus: "கணினி நிலை",
    damName: "புத்தளம் மாவட்ட அணை",
    statusNormal: "சாதாரண நிலை (NORMAL)",
    statusPreWarning: "முன் எச்சரிக்கை (PRE-WARNING)",
    statusClearArea: "பகுதியை வெளியேற்று (CLEAR AREA)",
    statusDanger: "ஆபத்து (DANGER)",
    gateOpen: "கதவு திறப்பு",
    temperature: "வெப்பநிலை",
    humidity: "ஈரப்பதம்",
    rainfall: "மழைவீழ்ச்சி",
    lastUpdated: "கடைசி புதுப்பிப்பு",
    quickStats: "நேரடி அணை அளவீடுகள்",
    dualSensorHealth: "சென்சார் நிலை",
    sensorOptimal: "இரட்டை சென்சார் செயலில் உள்ளது (சிறந்தது)",
    tapToRefresh: "புதுப்பிக்க கீழே இழுக்கவும்",
    operatorLoginPrompt: "இயக்குநர் அணுகல்",
    operatorLoginBtn: "இயக்குநராக உள்நுழையவும்",
    
    // Weather & Rainfall Forecast API
    liveWeatherTitle: "செயற்கைக்கோள் வானிலை மற்றும் மழை ரேடார்",
    forecast6h: "அடுத்த 6 மணி நேர மழை முன்னறிவிப்பு",
    precipProb: "மழை பெய்யும் நிகழ்தகவு",
    rainAlertIncoming: "⛈️ அதிக மழை பெய்ய வாய்ப்புள்ளது (>30mm). பாதுகாப்பு கருதி முன் எச்சரிக்கை முன்கூட்டியே தூண்டப்பட்டுள்ளது.",
    rainNormal: "🌤️ புத்தளம் பகுதியில் வானிலை சாதாரணமாக உள்ளது.",
    
    // Alerts Screen
    alertsTitle: "எச்சரிக்கை வரலாறு",
    noAlerts: "செயலில் எச்சரிக்கைகள் இல்லை. நீர் மட்டம் சாதாரணமாக உள்ளது.",
    severity: "தீவிரம்",
    level: "எச்சரிக்கை நிலை",
    message: "செய்தி",
    time: "நேரம்",
    acknowledged: "ஏற்றுக்கொள்ளப்பட்டது",
    unacknowledged: "கவனம் தேவை",
    
    // Prediction Screen
    mlTitle: "கலப்பு AI நீரியல் மாதிரி (Hybrid AI Pipeline)",
    mlSubtitle: "LSTM முன்னறிவிப்பு + Random Forest வெள்ள அபாய நிகழ்தகவு",
    forecast1h: "அடுத்த 1 மணி நேர நீர் மட்டம்",
    forecastDesc: "நிலை 1: 24 மணி நேர தரவுகளிலிருந்து கணிக்கப்பட்ட 2-Layer LSTM மாதிரி.",
    floodProbTitle: "வெள்ளம் / நிரம்பி வழியும் நிகழ்தகவு",
    floodProbDesc: "நிலை 2: அடுத்த 6 மணி நேர மழை கணிப்பு மற்றும் LSTM முடிவுகளின் அடிப்படையிலான Random Forest அபாய மதிப்பீடு.",
    predictedLevel: "கணிக்கப்பட்ட நீர் மட்டம்",
    currentLevel: "தற்போதைய நீர் மட்டம்",
    floodProbability: "வெள்ள நிகழ்தகவு",
    riskClassification: "செயல்பாட்டு அபாய நிலை",
    recommendedAction: "பரிந்துரைக்கப்பட்ட கதவு நடவடிக்கை",
    riskLow: "குறைந்த ஆபத்து (இயல்பு)",
    riskMedium: "நடுத்தர ஆபத்து (கண்காணிக்கவும்)",
    riskHigh: "அதிக ஆபத்து (வெளியேற்ற தயார்)",
    riskCritical: "மிக ஆபத்தானது (அவசர மதகு திறப்பு)",
    anomalyDetection: "சென்சார் துல்லிய காப்பாளர்",
    anomalyDesc: "Autoencoder சென்சார் பிழைகளை சரிபார்த்து தவறான எச்சரிக்கைகளைத் தடுக்கிறது.",
    anomalyStatusNormal: "சென்சார்கள் சரிபார்க்கப்பட்டன (பிழைகள் இல்லை)",
    anomalyDetected: "சென்சார் பிழை / முரண்பாடு கண்டறியப்பட்டது",
    
    // About Screen
    aboutTitle: "SDAS திட்டம் பற்றி",
    aboutProject: "திட்டத்தின் கண்ணோட்டம்",
    aboutProjectDesc: "இலங்கையின் புத்தளம் பகுதியில் தானியங்கி அணை கண்காணிப்பு இல்லாததால் வெள்ளப்பெருக்கு அடிக்கடி ஏற்படுகிறது. கைமுறையாக மதகுகளை திறக்க 30+ நிமிடங்கள் ஆகும். SDAS அமைப்பு தானியங்கி சென்சார்கள், உடனடி எச்சரிக்கைகள், தானியங்கி கதவு கட்டுப்பாடு மற்றும் AI முன்னறிவிப்பு மூலம் வெள்ள அபாயத்தை குறைக்கிறது.",
    aboutObjectives: "முக்கிய சிறப்பம்சங்கள்",
    aboutObj1: "• ±2 செ.மீ துல்லியத்துடன் இரட்டை JSN-SR04T நீர் புகா மீயොலி சென்சார்கள் மற்றும் வெப்பநிலை இழப்பீட்டு அமைப்பு.",
    aboutObj2: "• 4-நிலை பாதுகாப்பு வரம்பு கட்டுப்படுத்தி (சாதாரண <70%, முன் எச்சரிக்கை 70-85%, வெளியேற்றம் 70-85%, ஆபத்து >85%).",
    aboutObj3: "• MG996R மோட்டார் மூலம் தானியங்கி கதவு கட்டுப்பாடு மற்றும் SIM800L மூலம் அவசர SMS அனுப்புதல்.",
    aboutObj4: "• Supabase PostgreSQL கிளவுட் தரவுத்தளம் மற்றும் நேரடி பாதுகாப்பு கொள்கைகள்.",
    aboutObj5: "• நேரடி வானிலை API மற்றும் LSTM, Random Forest கலப்பு AI மாதிரிகள் மூலம் வெள்ள முன்னறிவிப்பு.",
    aboutTeam: "திட்டக் குழு",
    teamRole1: "டயஸ் ஏட்ரியன் — சைபர் பாதுகாப்பு (Cyber Security)",
    teamRole2: "ஏ.ඒ.ஏ. ஆதில் — தரவு அறிவியல் (Data Science)",
    teamRole3: "ஜே.எம்.ஆர்.ඒ. தில்ஷான் — மென்பொருள் பொறியியல் (Software Engineering)",
    aboutSupervisors: "மேற்பார்வையாளர்கள்",
    supervisor1: "டாக்டர் சனிகா விஜேசேகர (தரவு அறிவியல் & சைபர் பாதுகாப்பு)",
    supervisor2: "திரு. கவிந்த தரிந்து (தரவு அறிவியல்)",
    institution: "கணினியியல் மற்றும் தகவல் தொழில்நுட்ப பீடம்\nSLTC ஆராய்ச்சி பல்கலைக்கழகம், இலங்கை",
    
    // Operator Screens
    operatorDashboard: "இயக்குநர் கட்டுப்பாட்டு மையம்",
    gateControl: "அணை கதவு கட்டுப்பாடு",
    gateMode: "கதவு பயன்முறை",
    modeAuto: "தானியங்கி (AI & சென்சார் மூலம்)",
    modeManual: "கைமுறை கட்டுப்பாடு (MANUAL)",
    setGatePercentage: "கதவு திறக்கும் சதவீதம்",
    applyGateCommand: "கட்டளையை அனுப்பு",
    contactsTitle: "அவசர தொடர்புகள்",
    addContact: "அவசர தொடர்பை சேர்க்கவும்",
    contactName: "பெயர்",
    contactPhone: "தொலைபேசி எண் (+94...)",
    contactRole: "பதவி / அதிகாரம்",
    saveContact: "சேமிக்கவும்",
    deleteContact: "நீக்குக",
    loginTitle: "இயக்குநர் உள்நுழைவு",
    loginSubtitle: "உங்கள் அங்கீகரிக்கப்பட்ட கணக்கில் உள்நுழையவும்",
    email: "மின்னஞ்சல் முகவரி",
    password: "கடவுச்சொல்",
    signIn: "உள்நுழையவும்",
    signOut: "வெளியேறவும்",
    
    // Language Switcher
    language: "மொழி",
    selectLanguage: "மொழியைத் தேர்ந்தெடுக்கவும்"
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY).then(savedLang => {
      if (savedLang && (savedLang === 'en' || savedLang === 'si' || savedLang === 'ta')) {
        setLang(savedLang);
      }
    }).catch(() => {});
  }, []);

  const changeLanguage = async (newLang) => {
    if (translations[newLang]) {
      setLang(newLang);
      try {
        await AsyncStorage.setItem(LANGUAGE_KEY, newLang);
      } catch (e) {
        console.error('Failed to save language preference', e);
      }
    }
  };

  const t = translations[lang] || translations.en;

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
