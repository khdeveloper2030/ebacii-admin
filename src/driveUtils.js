export function normalizeDriveFileId(value) {
  if (!value) return '';

  const trimmed = String(value).trim();
  if (!trimmed) return '';

  const patterns = [
    /[?&]id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
    /^([a-zA-Z0-9_-]+)$/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1];
  }

  return trimmed;
}

export function formatDriveDownloadUrl(value) {
  const fileId = normalizeDriveFileId(value);
  if (!fileId) return '';
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}
