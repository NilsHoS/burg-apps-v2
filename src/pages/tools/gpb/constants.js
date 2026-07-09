/**
 * Vaste structuur uit GPB-Principes.md: 6 pijlers, elk met 3 stellingen,
 * afgestemd per afdeling en functieniveau. STELLINGEN bevat nu placeholder-
 * tekst — vervang de teksten hieronder zodra de echte 108 stellingen zijn
 * aangeleverd, de rest van de tool hoeft dan niet te wijzigen.
 */
export const PIJLERS = [
  'Organisatie & internationale schaalbaarheid',
  'Mensen, leiderschap & cultuur',
  'Vakmanschap, processen & kwaliteit',
  'Automatisering, efficiëntie & werkplezier',
  'Marktspecialisatie & reputatie',
  'Financiële stabiliteit & verantwoorde groei',
]

export const AFDELINGEN = ['Sales', 'Recruitment']

export const NIVEAUS = {
  Sales: [
    { niveau: 1, titel: 'Associate Sales Consultant', tagline: 'Ik leer' },
    { niveau: 2, titel: 'Sales Consultant', tagline: 'Ik presteer' },
    { niveau: 3, titel: 'Senior Sales Consultant', tagline: 'Top performer' },
  ],
  Recruitment: [
    { niveau: 1, titel: 'Associate Recruitment Consultant', tagline: 'Ik leer' },
    { niveau: 2, titel: 'Recruitment Consultant', tagline: 'Ik presteer' },
    { niveau: 3, titel: 'Senior Recruitment Consultant', tagline: 'Top performer' },
  ],
}

function placeholderStellingen(afdeling, niveau) {
  return PIJLERS.map((pijler) => [
    `[placeholder] ${afdeling} niveau ${niveau} — ${pijler} — stelling 1`,
    `[placeholder] ${afdeling} niveau ${niveau} — ${pijler} — stelling 2`,
    `[placeholder] ${afdeling} niveau ${niveau} — ${pijler} — stelling 3`,
  ])
}

/** STELLINGEN[afdeling][niveau] = array van 6 pijlers, elk een array van 3 stelling-teksten. */
export const STELLINGEN = {
  Sales: {
    1: placeholderStellingen('Sales', 1),
    2: placeholderStellingen('Sales', 2),
    3: placeholderStellingen('Sales', 3),
  },
  Recruitment: {
    1: placeholderStellingen('Recruitment', 1),
    2: placeholderStellingen('Recruitment', 2),
    3: placeholderStellingen('Recruitment', 3),
  },
}

/** 1 t/m 5 met halve stappen — 9 mogelijke waarden, zie GPB-Principes.md. */
export const SCORE_OPTIES = [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]

export function scoreBetekenis(score) {
  if (score >= 4.5) return 'Uitzonderlijk'
  if (score >= 3.5) return 'Goed'
  if (score === 3) return 'Op niveau'
  if (score >= 2) return 'Ontwikkelpunt'
  return 'Onder niveau'
}

export function eindscoreKwalificatie(eindscore) {
  if (eindscore >= 4) return 'Promotie bespreekbaar'
  if (eindscore >= 3.5) return 'Richting promotie'
  return 'Op of onder niveau'
}

export const STATUS_LABELS = {
  concept: 'Concept',
  goedgekeurd: 'Goedgekeurd',
  definitief: 'Definitief',
}
