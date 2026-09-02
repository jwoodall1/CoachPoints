export const competitionLevels = [
  'NCAA Division I',
  'NCAA Division II',
  'NCAA Division III',
  'NAIA',
  'NJCAA',
  'CCCAA',
  'USCAA',
  'NCCAA',
  'High School',
  'Professional',
  'Club',
  'Other',
] as const;

export type CompetitionLevel = (typeof competitionLevels)[number];
