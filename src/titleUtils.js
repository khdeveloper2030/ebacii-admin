export function getDisplayTitle(paper, language) {
  if (!paper) return '';

  const khmerTitle = paper.title || '';
  const translated = paper.translated_title || '';

  if (language === 'en' && translated) {
    return translated;
  }

  return khmerTitle;
}
