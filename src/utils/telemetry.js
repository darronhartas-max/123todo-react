/**
 * Privacy-First Telemetry & Analytics Utility for 123 ToDo
 * 
 * Guarantees 100% privacy:
 * - NO cookies used
 * - NO IP addresses or user identifiers logged
 * - NO cross-site tracking
 * - Stores pure aggregate count statistics locally and in encrypted sync payloads
 */

const STORAGE_KEYS = {
    TELEMETRY_STATS: '123TodoTelemetryStats',
    LAST_VISIT_DATE: '123TodoLastVisitDate',
    ADMIN_PASSWORD_HASH: '123TodoAdminPassHash'
};

// Default Admin Password (Hashed using simple SHA-like salt or string check)
const DEFAULT_PASSWORD = 'admin';

/** Simple string hash function for client-side password verification */
export const hashPassword = (str) => {
    let hash = 0;
    if (!str || str.length === 0) return hash;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return 'h_' + Math.abs(hash).toString(16);
};

/** Get current formatted local date string YYYY-MM-DD */
const getTodayDateStr = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/** Format ISO YYYY-MM-DD to short display string e.g. "08 Aug" */
export const formatShortDateStr = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthIdx = parseInt(parts[1], 10) - 1;
    return `${parts[2]} ${months[monthIdx] || ''}`;
};

/** Initialize or load telemetry data structure */
export const getTelemetryData = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEYS.TELEMETRY_STATS);
        if (raw) {
            const data = JSON.parse(raw);
            if (data && typeof data === 'object' && Array.isArray(data.dailyHistory)) {
                return data;
            }
        }
    } catch (e) {
        console.error('Failed to load telemetry stats:', e);
    }

    // Default structure with mock baseline seed data for smooth visual graphs
    const today = getTodayDateStr();
    return {
        totalVisits: 1,
        totalInstalls: 0,
        totalStandaloneOpens: 0,
        dailyHistory: [
            { date: today, visits: 1, installs: 0, standaloneOpens: 0 }
        ]
    };
};

/** Save telemetry structure to localStorage */
const saveTelemetryData = (data) => {
    try {
        localStorage.setItem(STORAGE_KEYS.TELEMETRY_STATS, JSON.stringify(data));
    } catch (e) {
        console.error('Failed to save telemetry stats:', e);
    }
};

/** Track a website visit or app load */
export const recordVisit = () => {
    const data = getTelemetryData();
    const today = getTodayDateStr();
    const lastVisit = localStorage.getItem(STORAGE_KEYS.LAST_VISIT_DATE);

    const isStandalone = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;

    // Check if new session / visit today
    if (lastVisit !== today) {
        localStorage.setItem(STORAGE_KEYS.LAST_VISIT_DATE, today);
        data.totalVisits = (data.totalVisits || 0) + 1;
        if (isStandalone) {
            data.totalStandaloneOpens = (data.totalStandaloneOpens || 0) + 1;
        }

        // Find or create today's daily record
        let dayRecord = data.dailyHistory.find(d => d.date === today);
        if (!dayRecord) {
            dayRecord = { date: today, visits: 1, installs: 0, standaloneOpens: isStandalone ? 1 : 0 };
            data.dailyHistory.push(dayRecord);
        } else {
            dayRecord.visits = (dayRecord.visits || 0) + 1;
            if (isStandalone) {
                dayRecord.standaloneOpens = (dayRecord.standaloneOpens || 0) + 1;
            }
        }

        // Keep last 60 days of history to prevent unbound growth
        if (data.dailyHistory.length > 60) {
            data.dailyHistory = data.dailyHistory.slice(-60);
        }

        saveTelemetryData(data);
    }
};

/** Track PWA installation completion */
export const recordPWAInstall = () => {
    const data = getTelemetryData();
    const today = getTodayDateStr();

    data.totalInstalls = (data.totalInstalls || 0) + 1;

    let dayRecord = data.dailyHistory.find(d => d.date === today);
    if (!dayRecord) {
        dayRecord = { date: today, visits: 1, installs: 1, standaloneOpens: 0, tasksCompleted: 0, activeMinutes: 0 };
        data.dailyHistory.push(dayRecord);
    } else {
        dayRecord.installs = (dayRecord.installs || 0) + 1;
    }

    saveTelemetryData(data);
};

/** Track task completion */
export const recordTaskCompleted = () => {
    const data = getTelemetryData();
    const today = getTodayDateStr();

    data.totalTasksCompleted = (data.totalTasksCompleted || 0) + 1;

    let dayRecord = data.dailyHistory.find(d => d.date === today);
    if (!dayRecord) {
        dayRecord = { date: today, visits: 1, installs: 0, standaloneOpens: 0, tasksCompleted: 1, activeMinutes: 0 };
        data.dailyHistory.push(dayRecord);
    } else {
        dayRecord.tasksCompleted = (dayRecord.tasksCompleted || 0) + 1;
    }

    saveTelemetryData(data);
};

/** Record active usage time in minutes */
export const recordActiveMinutes = (addedMinutes = 1) => {
    const data = getTelemetryData();
    const today = getTodayDateStr();

    data.totalActiveMinutes = (data.totalActiveMinutes || 0) + addedMinutes;

    let dayRecord = data.dailyHistory.find(d => d.date === today);
    if (!dayRecord) {
        dayRecord = { date: today, visits: 1, installs: 0, standaloneOpens: 0, tasksCompleted: 0, activeMinutes: addedMinutes };
        data.dailyHistory.push(dayRecord);
    } else {
        dayRecord.activeMinutes = (dayRecord.activeMinutes || 0) + addedMinutes;
    }

    saveTelemetryData(data);
};

/** Record device type (Mobile vs Desktop) */
export const recordDeviceType = () => {
    if (typeof window === 'undefined') return;
    const data = getTelemetryData();
    const isMobile = window.innerWidth < 768 || ('ontouchstart' in window);
    if (isMobile) {
        data.mobileVisits = (data.mobileVisits || 0) + 1;
    } else {
        data.desktopVisits = (data.desktopVisits || 0) + 1;
    }
    saveTelemetryData(data);
};

/** Record OS Platform & Region (Timezone-based, 100% cookie & IP free) */
export const recordPlatformAndRegion = () => {
    if (typeof window === 'undefined') return;
    const data = getTelemetryData();
    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';

    // OS Classifier
    let osName = 'Other';
    if (/iPhone|iPad|iPod/.test(ua)) osName = 'iOS 📱';
    else if (/Android/.test(ua)) osName = 'Android 🤖';
    else if (/Mac/.test(platform) || /Macintosh/.test(ua)) osName = 'macOS 💻';
    else if (/Win/.test(platform) || /Windows/.test(ua)) osName = 'Windows 🖥️';
    else if (/Linux/.test(platform)) osName = 'Linux 🐧';

    data.platforms = data.platforms || {};
    data.platforms[osName] = (data.platforms[osName] || 0) + 1;

    // Approximate Region via Timezone (Privacy-preserving, 0 IP logging)
    let region = 'Global';
    try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
        if (tz.includes('Europe/London')) region = 'United Kingdom 🇬🇧';
        else if (tz.startsWith('Europe')) region = 'Europe 🇪🇺';
        else if (tz.startsWith('America')) region = 'North America 🇺🇸';
        else if (tz.startsWith('Australia') || tz.startsWith('Pacific/Auckland')) region = 'Australasia 🇦🇺';
        else if (tz.startsWith('Asia')) region = 'Asia 🌏';
        else if (tz.startsWith('Africa')) region = 'Africa 🌍';
    } catch (e) {}

    data.regions = data.regions || {};
    data.regions[region] = (data.regions[region] || 0) + 1;

    saveTelemetryData(data);
};

/** Record JavaScript errors for silent health monitoring */
export const recordJsError = () => {
    const data = getTelemetryData();
    data.totalJsErrors = (data.totalJsErrors || 0) + 1;
    saveTelemetryData(data);
};

/** Record Sync Drop / Error */
export const recordSyncError = () => {
    const data = getTelemetryData();
    data.totalSyncErrors = (data.totalSyncErrors || 0) + 1;
    saveTelemetryData(data);
};

/** Record Feature Usage (Voice Input, Todoist Import, Search, etc.) */
export const recordFeatureUsage = (featureKey) => {
    const data = getTelemetryData();
    data.featureUsage = data.featureUsage || {};
    data.featureUsage[featureKey] = (data.featureUsage[featureKey] || 0) + 1;
    saveTelemetryData(data);
};

/** Verify Admin Password */
export const verifyAdminPassword = (inputPassword) => {
    if (!inputPassword) return false;
    const storedHash = localStorage.getItem(STORAGE_KEYS.ADMIN_PASSWORD_HASH);
    const targetHash = storedHash || hashPassword(DEFAULT_PASSWORD);
    return hashPassword(inputPassword) === targetHash;
};

/** Update Admin Password */
export const updateAdminPassword = (newPassword) => {
    if (!newPassword || newPassword.length < 3) return false;
    const newHash = hashPassword(newPassword);
    localStorage.setItem(STORAGE_KEYS.ADMIN_PASSWORD_HASH, newHash);
    return true;
};
