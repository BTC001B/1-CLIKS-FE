import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const normalizeKey = (k) => {
    if (!k || typeof k !== 'string') return '';
    const keyMap = {
        'Dashboard': 'dashboard',
        'Generate Invoice': 'generateInvoice',
        '+ Generate Invoice': 'generateInvoice',
        'Finance': 'finance',
        'Accounting': 'accounting',
        'Expenses': 'expenses',
        'Tax': 'tax',
        'Sales': 'sales',
        'Sales Invoice': 'salesInvoice',
        'Customers': 'customers',
        'Purchases': 'purchases',
        'Purchase Invoice': 'purchaseInvoice',
        'Suppliers': 'suppliers',
        'Inventory': 'inventory',
        'Products': 'products',
        'Stock': 'stockItems',
        'Warehouse': 'warehouses',
        'Warehouses / Godowns': 'warehouses',
        'HR': 'hr',
        'Staff': 'staff',
        'Attendance': 'attendance',
        'Payroll': 'payroll',
        'POS Billing': 'posBilling',
        'Reports': 'reports',
        'Barcode Gen': 'barcodeGen',
        'Marketing': 'marketing',
        'Settings': 'settings',
        'Help & Support': 'helpSupport',
        'Storage': 'storage',
        'Refer & Earn': 'referEarn',
        'Manage Plan': 'managePlan',
        'People': 'people',
        'Wallet': 'wallet',
        'Transaction': 'transaction',
        'Segregation': 'segregation',
        'Split & Collect': 'splitCollect',
        'Planner': 'planner',
        'Rewards & Offers': 'rewardsOffers',
        'BETA Club': 'betaClub',
        'Trading docs': 'tradingDocs',
        'Add Money': 'addMoney',
        'Books': 'books',
        'Payments': 'payments',
        'Social': 'social'
    };
    if (keyMap[k]) return keyMap[k];
    return k.trim()
        .replace(/[^a-zA-Z0-9 ]/g, '')
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => index === 0 ? word.toLowerCase() : word.toUpperCase())
        .replace(/\s+/g, '');
};

const translations = {
    'EN-US': {
        books: 'Books',
        payments: 'Payments',
        social: 'Social',
        dashboard: 'Dashboard',
        generateInvoice: 'Generate Invoice',
        finance: 'Finance',
        accounting: 'Accounting',
        expenses: 'Expenses',
        tax: 'Tax',
        sales: 'Sales',
        salesInvoice: 'Sales Invoice',
        customers: 'Customers',
        purchases: 'Purchases',
        purchaseInvoice: 'Purchase Invoice',
        suppliers: 'Suppliers',
        inventory: 'Inventory',
        products: 'Products',
        stockItems: 'Stock Items',
        warehouses: 'Warehouses',
        hr: 'HR',
        staff: 'Staff',
        attendance: 'Attendance',
        payroll: 'Payroll',
        posBilling: 'POS Billing',
        reports: 'Reports',
        barcodeGen: 'Barcode Gen',
        marketing: 'Marketing',
        settings: 'Settings',
        helpSupport: 'Help & Support',
        storage: 'Storage',
        referEarn: 'Refer & Earn',
        managePlan: 'Manage Plan',
        people: 'People',
        wallet: 'Wallet',
        transaction: 'Transaction',
        segregation: 'Segregation',
        splitCollect: 'Split & Collect',
        planner: 'Planner',
        rewardsOffers: 'Rewards & Offers',
        addMoney: 'Add Money',
        betaClub: 'BETA Club',
        tradingDocs: 'Trading Docs'
    },
    'HI-IN': {
        books: 'बुक्स (Books)',
        payments: 'भुगतान (Payments)',
        social: 'सोशल (Social)',
        dashboard: 'डैशबोर्ड (Dashboard)',
        generateInvoice: '+ नया बिल बनाएं',
        finance: 'वित्त (Finance)',
        accounting: 'लेखांकन (Accounting)',
        expenses: 'खर्चे (Expenses)',
        tax: 'कर एवं टैक्स (Tax)',
        sales: 'बिक्री (Sales)',
        salesInvoice: 'बिक्री बिल',
        customers: 'ग्राहक (Customers)',
        purchases: 'खरीद (Purchases)',
        purchaseInvoice: 'खरीद बिल',
        suppliers: 'आपूर्तिकर्ता (Suppliers)',
        inventory: 'इन्वेंटरी और स्टॉक',
        products: 'उत्पाद (Products)',
        stockItems: 'स्टॉक आइटम',
        warehouses: 'गोदाम (Godowns)',
        hr: 'एचआर और कर्मचारी',
        staff: 'कर्मचारी (Staff)',
        attendance: 'उपस्थिति (Attendance)',
        payroll: 'वेतन (Payroll)',
        posBilling: 'पीओएस बिलिंग (POS)',
        reports: 'रिपोर्ट (Reports)',
        barcodeGen: 'बारकोड जनरेटर',
        marketing: 'मार्केटिंग एवं प्रचार',
        settings: 'सेटिंग्स (Settings)',
        helpSupport: 'सहायता एवं सपोर्ट',
        storage: 'स्टोरेज (Storage)',
        referEarn: 'रेफर करें और कमाएं',
        managePlan: 'प्लान प्रबंधित करें',
        people: 'लोग (People)',
        wallet: 'वॉलेट (Wallet)',
        transaction: 'लेन-देन (Transaction)',
        segregation: 'पृथक्करण (Segregation)',
        splitCollect: 'स्प्लिट और कलेक्ट',
        planner: 'प्लानर (Planner)',
        rewardsOffers: 'पुरस्कार और ऑफ़र',
        addMoney: '+ पैसे जोड़ें',
        betaClub: 'बीटा क्लब',
        tradingDocs: 'ट्रेडिंग दस्तावेज'
    },
    'TE-IN': {
        books: 'బుక్స్ (Books)',
        payments: 'చెల్లింపులు (Payments)',
        social: 'సోషల్ (Social)',
        dashboard: 'డాష్‌బోర్డ్ (Dashboard)',
        generateInvoice: '+ కొత్త ఇన్వాయిస్',
        finance: 'ఫైనాన్స్ (Finance)',
        accounting: 'అకౌంటింగ్',
        expenses: 'ఖర్చులు (Expenses)',
        tax: 'పన్ను & జిఎస్‌టి (Tax)',
        sales: 'సేల్స్ (Sales)',
        salesInvoice: 'సేల్స్ ఇన్వాయిస్',
        customers: 'వినియోగదారులు',
        purchases: 'కొనుగోళ్లు (Purchases)',
        purchaseInvoice: 'కొనుగోలు బిల్లు',
        suppliers: 'సరఫరాదారులు',
        inventory: 'ఇన్వెంటరీ & స్టాక్',
        products: 'ఉత్పత్తులు (Products)',
        stockItems: 'స్టాక్ ఐటమ్స్',
        warehouses: 'గోదాములు (Godowns)',
        hr: 'హెచ్.ఆర్ & సిబ్బంది (HR)',
        staff: 'సిబ్బంది (Staff)',
        attendance: 'హాజరు (Attendance)',
        payroll: 'పేరోల్ (Payroll)',
        posBilling: 'పిఒఎస్ బిల్లింగ్ (POS)',
        reports: 'నివేదికలు (Reports)',
        barcodeGen: 'బార్‌కోడ్ జనరేటర్',
        marketing: 'మార్కెటింగ్',
        settings: 'సెట్టింగ్‌లు (Settings)',
        helpSupport: 'సహాయం & మద్దతు',
        storage: 'స్టోరేజ్ (Storage)',
        referEarn: 'రెఫర్ & సంపాదించండి',
        managePlan: 'ప్లాన్ నిర్వహించండి',
        people: 'ప్రజలు (People)',
        wallet: 'వాలెట్ (Wallet)',
        transaction: 'లావాదేవీ (Transaction)',
        segregation: 'పృథక్కరణ',
        splitCollect: 'స్ప్లిట్ & కలెక్ట్',
        planner: 'ప్లానర్ (Planner)',
        rewardsOffers: 'రివార్డులు & ఆఫర్లు',
        addMoney: '+ డబ్బు జోడించండి',
        betaClub: 'బీటా క్లబ్',
        tradingDocs: 'ట్రేడింగ్ పత్రాలు'
    },
    'TA-IN': {
        books: 'புத்தகங்கள் (Books)',
        payments: 'செலுத்துதல்கள் (Payments)',
        social: 'சமூக (Social)',
        dashboard: 'டேஷ்போர்டு (Dashboard)',
        generateInvoice: '+ புதிய இன்வாய்ஸ் உருவாக்கு',
        finance: 'நிதி (Finance)',
        accounting: 'கணக்கியல் (Accounting)',
        expenses: 'செலவுகள் (Expenses)',
        tax: 'வரி & ஜிஎஸ்டி (Tax)',
        sales: 'விற்பனை (Sales)',
        salesInvoice: 'விற்பனை பில்',
        customers: 'வாடிக்கையாளர்கள்',
        purchases: 'கொள்முதல் (Purchases)',
        purchaseInvoice: 'கொள்முதல் பில்',
        suppliers: 'விநியோகஸ்தர்கள்',
        inventory: 'சரக்கு & இருப்பு (Inventory)',
        products: 'சரக்கு பொருட்கள்',
        stockItems: 'இருப்பு பொருட்கள்',
        warehouses: 'கிடங்குகள் (Godowns)',
        hr: 'ஊழியர்கள் மேலாண்மை (HR)',
        staff: 'ஊழியர்கள்',
        attendance: 'வருகை',
        payroll: 'சம்பளம்',
        posBilling: 'POS பில்லிங்',
        reports: 'அறிக்கைகள் (Reports)',
        barcodeGen: 'பார்கோடு ஜெனரேட்டர்',
        marketing: 'சந்தைப்படுத்தல்',
        settings: 'அமைப்புகள் (Settings)',
        helpSupport: 'உதவி & ஆதரவு',
        storage: 'சேமிப்பகம் (Storage)',
        referEarn: 'பரிந்துரைத்து சம்பாதிக்கவும்',
        managePlan: 'திட்டத்தை நிர்வகிக்கவும்',
        people: 'மக்கள் (People)',
        wallet: 'வாலட் (Wallet)',
        transaction: 'பரிவர்த்தனை (Transaction)',
        segregation: 'பிரிப்பு (Segregation)',
        splitCollect: 'பிரித்து சேகரி',
        planner: 'திட்டமிடுபவர் (Planner)',
        rewardsOffers: 'பரிசுகள் & சலுகைகள்',
        addMoney: '+ பணம் சேர்க்க',
        betaClub: 'பீட்டா கிளப்',
        tradingDocs: 'வர்த்தக ஆவணங்கள்'
    },
    'MR-IN': {
        books: 'बुक्स (Books)',
        payments: 'पेमेंट्स (Payments)',
        social: 'सोशल (Social)',
        dashboard: 'डॅशबोर्ड (Dashboard)',
        generateInvoice: '+ नवीन बिल बनवा',
        finance: 'वित्त (Finance)',
        accounting: 'अकाउंटिंग',
        expenses: 'खर्च (Expenses)',
        tax: 'कर व जीएसटी (Tax)',
        sales: 'विक्री (Sales)',
        salesInvoice: 'विक्री बिल',
        customers: 'ग्राहक (Customers)',
        purchases: 'खरेदी (Purchases)',
        purchaseInvoice: 'खरेदी बिल',
        suppliers: 'पुरवठादार (Suppliers)',
        inventory: 'इन्व्हेंटरी व साठा',
        products: 'उत्पादने (Products)',
        stockItems: 'स्टॉक आयटम्स',
        warehouses: 'गोदाम (Godowns)',
        hr: 'एचआर व कर्मचारी',
        staff: 'कर्मचारी (Staff)',
        attendance: 'हजेरी (Attendance)',
        payroll: 'पेरोल (Payroll)',
        posBilling: 'POS बिलिंग',
        reports: 'अहवाल (Reports)',
        barcodeGen: 'बारकोड जनरेटर',
        marketing: 'मार्केटिंग',
        settings: 'सेटिंग्ज (Settings)',
        helpSupport: 'मदत व पाठिंबा',
        storage: 'स्टोरेज (Storage)',
        referEarn: 'रेफर करा व कमवा',
        managePlan: 'प्लॅन व्यवस्थापित करा',
        people: 'लोक (People)',
        wallet: 'वॉलेट (Wallet)',
        transaction: 'व्यवहार (Transaction)',
        segregation: 'विभक्तीकरण',
        splitCollect: 'स्प्लिट आणि कलेक्ट',
        planner: 'प्लॅनर (Planner)',
        rewardsOffers: 'बक्षिसे व ऑफर्स',
        addMoney: '+ पैसे जोडा',
        betaClub: 'बीटा क्लब',
        tradingDocs: 'ट्रेडिंग दस्तऐवज'
    },
    'GU-IN': {
        books: 'બુક્સ (Books)',
        payments: 'ચુકવણીઓ (Payments)',
        social: 'સોશિયલ (Social)',
        dashboard: 'ડેશબોર્ડ (Dashboard)',
        generateInvoice: '+ નવું બિલ બનાવો',
        finance: 'નાણાકીય (Finance)',
        accounting: 'એકાઉન્ટિંગ',
        expenses: 'ખર્ચ (Expenses)',
        tax: 'ટેક્સ અને જીએસટી (Tax)',
        sales: 'વેચાણ (Sales)',
        salesInvoice: 'વેચાણ બિલ',
        customers: 'ગ્રાહકો (Customers)',
        purchases: 'ખરીદી (Purchases)',
        purchaseInvoice: 'ખરીદી બિલ',
        suppliers: 'સપ્લાયર્સ (Suppliers)',
        inventory: 'ઇન્વેન્ટરી સ્ટોક',
        products: 'પ્રોડક્ટ્સ (Products)',
        stockItems: 'સ્ટોક વસ્તુઓ',
        warehouses: 'ગોડાઉન (Godowns)',
        hr: 'એચઆર અને સ્ટાફ',
        staff: 'સ્ટાફ (Staff)',
        attendance: 'હાજરી (Attendance)',
        payroll: 'પગાર (Payroll)',
        posBilling: 'POS બિલિંગ',
        reports: 'રિપોર્ટ્સ (Reports)',
        barcodeGen: 'બારકોડ જનરેટર',
        marketing: 'માર્કેટિંગ',
        settings: 'સેટિંગ્સ (Settings)',
        helpSupport: 'મદદ અને સપોર્ટ',
        storage: 'સ્ટોરેજ (Storage)',
        referEarn: 'રેફર કરો અને કમાઓ',
        managePlan: 'પ્લાન મેનેજ કરો',
        people: 'લોકો (People)',
        wallet: 'વોલેટ (Wallet)',
        transaction: 'વ્યવહાર (Transaction)',
        segregation: 'વર્ગીકરણ',
        splitCollect: 'સ્પ્લિટ અને કલેક્ટ',
        planner: 'પ્લાનર (Planner)',
        rewardsOffers: 'રિવોર્ડ્સ અને ઑફર્સ',
        addMoney: '+ પૈસા ઉમેરો',
        betaClub: 'બીટા ક્લબ',
        tradingDocs: 'ટ્રેડિંગ દસ્તાવેજો'
    }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    const [language, setLanguageState] = useState(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('cliks_language');
            if (stored) return stored;
            const storedConfigRaw = localStorage.getItem('cliks_business_config') || localStorage.getItem('cliks_active_config');
            if (storedConfigRaw) {
                try {
                    const parsed = JSON.parse(storedConfigRaw);
                    if (parsed && parsed.language) return parsed.language;
                } catch (e) {}
            }
        }
        return 'EN-US';
    });

    const setLanguage = useCallback((langCode) => {
        if (!langCode) return;
        setLanguageState(langCode);
        localStorage.setItem('cliks_language', langCode);
        if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('lang', langCode);
        }
        try {
            const currentConfigRaw = localStorage.getItem('cliks_business_config') || '{}';
            const currentConfig = JSON.parse(currentConfigRaw);
            currentConfig.language = langCode;
            localStorage.setItem('cliks_business_config', JSON.stringify(currentConfig));
            localStorage.setItem('cliks_active_config', JSON.stringify(currentConfig));
        } catch (e) {}
        window.dispatchEvent(new CustomEvent('cliksConfigUpdated', { detail: { language: langCode } }));
    }, []);

    useEffect(() => {
        const handleSync = (e) => {
            let stored = localStorage.getItem('cliks_language');
            if (e && e.detail && e.detail.language) {
                stored = e.detail.language;
            }
            if (stored && stored !== language) {
                setLanguageState(stored);
            }
        };
        window.addEventListener('cliksConfigUpdated', handleSync);
        window.addEventListener('storage', handleSync);
        return () => {
            window.removeEventListener('cliksConfigUpdated', handleSync);
            window.removeEventListener('storage', handleSync);
        };
    }, [language]);

    const t = useCallback((key, fallback) => {
        const normKey = normalizeKey(key);
        const currentDict = translations[language] || translations['EN-US'];
        if (currentDict && currentDict[normKey]) return currentDict[normKey];
        if (currentDict && currentDict[key]) return currentDict[key];

        const defaultDict = translations['EN-US'];
        if (defaultDict && defaultDict[normKey]) return defaultDict[normKey];
        if (defaultDict && defaultDict[key]) return defaultDict[key];
        return fallback || key;
    }, [language]);

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, translations }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const ctx = useContext(LanguageContext);
    if (!ctx) {
        return {
            language: 'EN-US',
            setLanguage: () => {},
            t: (key, fallback) => {
                const normKey = normalizeKey(key);
                const defaultDict = translations['EN-US'];
                return defaultDict[normKey] || defaultDict[key] || fallback || key;
            },
            translations
        };
    }
    return ctx;
};
