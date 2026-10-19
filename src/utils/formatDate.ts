const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function formatIndonesianDate(isoDate: string | null | undefined): string {
  if (!isoDate) return '-';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  const year = Number(parts[0]);
  const monthIdx = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  if (
    Number.isNaN(year) ||
    Number.isNaN(monthIdx) ||
    Number.isNaN(day) ||
    !INDONESIAN_MONTHS[monthIdx]
  ) {
    return isoDate;
  }
  return `${day} ${INDONESIAN_MONTHS[monthIdx]} ${year}`;
}

export const formatDateId = formatIndonesianDate;
