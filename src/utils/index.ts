export function createPageUrl(pageName: string) {
    return '/' + pageName.replace(/ /g, '-');
}

/** When the backend API fails or returns a non-list, avoid calling .filter on non-arrays. */
export function ensureArray<T = unknown>(value: unknown): T[] {
    return Array.isArray(value) ? (value as T[]) : [];
}

/** Arabic month names */
const AR_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

/** Format a date string with optional Arabic locale */
export function formatDate(date: string | Date | undefined | null, isArabic: boolean, short = false): string {
    if (!date) return isArabic ? 'حديثاً' : 'Recent';
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return '';
        if (isArabic) {
            const month = AR_MONTHS[d.getMonth()];
            return short ? `${d.getDate()} ${month}` : `${d.getDate()} ${month} ${d.getFullYear()}`;
        }
        const opts: Intl.DateTimeFormatOptions = short
            ? { day: 'numeric', month: 'short' }
            : { day: 'numeric', month: 'short', year: 'numeric' };
        return d.toLocaleDateString('en-US', opts);
    } catch { return ''; }
}

/** Arabic category label map */
const CATEGORY_AR: Record<string, string> = {
    club_news:       'أخبار النادي',
    match_report:    'تقرير مباراة',
    transfers:       'الانتقالات',
    injuries:        'الإصابات',
    analysis:        'تحليل',
    global_football: 'كرة دولية',
    premier_league:  'الدوري الإنجليزي',
    la_liga:         'الدوري الإسباني',
    serie_a:         'الدوري الإيطالي',
    bundesliga:      'الدوري الألماني',
    champions_league:'دوري الأبطال',
    world_cup:       'كأس العالم',
    egyptian_league: 'الدوري المصري',
    african_football:'كرة إفريقيا',
    preview:         'معاينة',
    statistics:      'إحصائيات',
};

/** Get translated category label */
export function getCategoryLabel(category: string | undefined | null, isArabic: boolean): string {
    if (!category) return '';
    if (isArabic) return CATEGORY_AR[category] || category.replace(/_/g, ' ');
    return category.replace(/_/g, ' ').toUpperCase();
}