/**
 * Vaste structuur uit GPB-Principes.md: 6 pijlers, elk met 3 stellingen,
 * afgestemd per afdeling en functieniveau. Elke stelling is een { tekst,
 * voorbeeld } object: tekst is de hoofdstelling, voorbeeld de cursieve
 * toelichting/verduidelijking eronder (kan leeg zijn zolang de echte
 * content nog niet is aangeleverd). Sales/Recruitment bevatten nog
 * placeholder-tekst — vervang zodra de echte 108 stellingen bekend zijn,
 * de rest van de tool hoeft dan niet te wijzigen.
 *
 * Voor Corporate is 'functieniveau' geen carrièreniveau maar een selector
 * voor de drie afzonderlijke functies binnen het team (Finance, HR-Corporate
 * Recruitment Officer, Marketing & AI Officer) — zie GPB_corporate.md.
 */
export const PIJLERS = [
  'Organisatie & internationale schaalbaarheid',
  'Mensen, leiderschap & cultuur',
  'Vakmanschap, processen & kwaliteit',
  'Automatisering, efficiëntie & werkplezier',
  'Marktspecialisatie & reputatie',
  'Financiële stabiliteit & verantwoorde groei',
]

export const AFDELINGEN = ['Sales', 'Recruitment', 'Corporate']

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
  Corporate: [
    { niveau: 1, titel: 'Finance Medewerker', tagline: '' },
    { niveau: 2, titel: 'HR-Corporate Recruitment Officer', tagline: '' },
    { niveau: 3, titel: 'Marketing & AI Officer', tagline: '' },
  ],
}

function placeholderStellingen(afdeling, niveau) {
  return PIJLERS.map((pijler) => [
    { tekst: `[placeholder] ${afdeling} niveau ${niveau} — ${pijler} — stelling 1`, voorbeeld: '' },
    { tekst: `[placeholder] ${afdeling} niveau ${niveau} — ${pijler} — stelling 2`, voorbeeld: '' },
    { tekst: `[placeholder] ${afdeling} niveau ${niveau} — ${pijler} — stelling 3`, voorbeeld: '' },
  ])
}

/** Bouwt de 6x3 stellingen-array uit platte [tekst, voorbeeld] paren, pijler na pijler. */
function bouwStellingen(...pijlerParen) {
  return pijlerParen.map((paren) => paren.map(([tekst, voorbeeld]) => ({ tekst, voorbeeld })))
}

/** STELLINGEN[afdeling][niveau] = array van 6 pijlers, elk een array van 3 { tekst, voorbeeld }. */
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
  Corporate: {
    // 1 = Finance Medewerker
    1: bouwStellingen(
      [
        [
          'Ik verwerk inkomende en uitgaande facturen, betalingen en boekingen correct en tijdig in het financiële systeem.',
          'Mijn verwerking is volledig en foutloos — afwijkingen signaleer ik direct en los ik niet stilzwijgend op.',
        ],
        [
          'Ik houd mijn werkoverzicht bij en zorg dat openstaande posten, betalingstermijnen en deadlines altijd actueel zijn.',
          "Collega's en leidinggevende kunnen zonder extra uitleg zien waar zaken staan en wat er nog open staat.",
        ],
        [
          'Ik werk op een gestructureerde en consistente manier, zodat mijn werkzaamheden overdraagbaar zijn.',
          'Mijn werkwijze is gedocumenteerd en herhaalbaar — ook een collega kan mijn deel van de administratie overnemen zonder dat er informatie ontbreekt.',
        ],
      ],
      [
        [
          "Ik stem mijn werkzaamheden actief af met collega's en draag bij aan een soepele samenwerking binnen Team Corporate.",
          'Ik communiceer open over deadlines, verwachtingen en knelpunten die effect hebben op het werk van anderen.',
        ],
        [
          'Ik sta open voor feedback en onderneem zichtbaar actie op verbeterpunten in mijn werk.',
          'Ik luister, stel vragen en laat in mijn werk concreet zien dat ik feedback heb toegepast — niet alleen dat ik het gehoord heb.',
        ],
        [
          'Ik werk actief aan mijn professionele ontwikkeling en stel concrete leerdoelen via mijn POP.',
          'Ik weet wat ik wil verbeteren en onderneem hier gerichte, aantoonbare stappen in.',
        ],
      ],
      [
        [
          'Ik verwerk financiële data nauwkeurig en controleer mijn werk systematisch voordat ik het aanlever.',
          'Ik lever niets aan waar twijfels over zijn — bij onzekerheid vraag ik tijdig afstemming in plaats van te gissen.',
        ],
        [
          'Ik beheers de financiële processen die bij mijn rol horen en weet wat ik wel en niet zelfstandig mag afhandelen.',
          'Ik handeel binnen de kaders van mijn functie en escaleer tijdig wanneer iets buiten mijn bevoegdheid of kennis valt.',
        ],
        [
          "Ik signaleer onregelmatigheden, afwijkingen of risico's in de administratie proactief en meld dit direct.",
          'Ik wacht niet tot een fout groter wordt — ik benoem het zodra ik het zie, bij de juiste persoon.',
        ],
      ],
      [
        [
          'Ik gebruik de financiële systemen zoals afgesproken en benut beschikbare functionaliteiten om handmatig werk te minimaliseren.',
          'Ik maak gebruik van sjablonen, koppelingen en vaste workflows om dubbele invoer en onnodige handelingen te voorkomen.',
        ],
        [
          'Ik signaleer als een proces onnodig tijdrovend of foutgevoelig is en kom met een concreet voorstel voor verbetering.',
          'Ik wacht niet op instructie, maar denk actief mee over hoe de administratie slimmer kan worden ingericht.',
        ],
        [
          'Ik sta open voor nieuwe tools en geautomatiseerde werkwijzen en pas me aan wanneer processen worden aangepast.',
          'Ik draag een positieve houding ten aanzien van digitalisering en optimalisatie binnen Team Corporate.',
        ],
      ],
      [
        [
          'Ik behandel alle financiële informatie strikt vertrouwelijk en ga professioneel om met gevoelige data.',
          'Ik deel geen financiële informatie buiten de daarvoor bestemde kanalen — ook niet informeel of tussen neus en lippen door.',
        ],
        [
          'Ik communiceer professioneel met leveranciers, interne stakeholders en andere contacten over financiële zaken.',
          'Mijn toon en aanpak zijn helder, consistent en representatief voor BURG QHSSE — ook bij discussies over facturen of betalingstermijnen.',
        ],
        [
          'Ik draag bij aan een betrouwbaar financieel imago van de organisatie door nauwkeurig en integer te werken.',
          'Leveranciers en interne stakeholders ervaren onze financiële administratie als professioneel en betrouwbaar — mijn werk draagt daar dagelijks aan bij.',
        ],
      ],
      [
        [
          'Ik lever mijn werk tijdig aan en zorg dat financiële verplichtingen worden nagekomen binnen de gestelde termijnen.',
          'Factuurverwerking, betalingsruns en reconciliaties zijn altijd tijdig afgerond — vertragingen meld ik proactief, niet achteraf.',
        ],
        [
          'Ik denk bij mijn werkzaamheden na over wat ze opleveren en wat ze kosten — ook intern.',
          'Ik besteed mijn tijd aan taken die waarde toevoegen en stel vragen wanneer een werkwijze onnodig complex, tijdrovend of kostbaar lijkt.',
        ],
        [
          'Ik draag bij aan kostenbeheersing door nauwkeurig te werken en fouten, dubbele betalingen en onnodige correctierondes actief te voorkomen.',
          'Eén fout in de administratie kan directe financiële of reputatieschade opleveren — ik neem die verantwoordelijkheid serieus.',
        ],
      ],
    ),
    // 2 = HR-Corporate Recruitment Officer
    2: bouwStellingen(
      [
        [
          'Ik houd HR-dossiers, recruitmentstatussen en procesinformatie actueel en volledig in de juiste systemen.',
          "Collega's en leidinggevende kunnen altijd op mijn data voortbouwen — er zijn geen blinde vlekken in mijn deel van het HR-systeem.",
        ],
        [
          'Ik bewaar het overzicht over lopende wervingstrajecten, onboarding- en preboardingprocessen en ondersteunende HR-taken tegelijkertijd.',
          'Ik werk gestructureerd en escaleer tijdig wanneer zaken dreigen te stagneren of met elkaar te conflicteren.',
        ],
        [
          'Ik documenteer HR-processen en wervingsworkflows zodat ze herhaalbaar en overdraagbaar zijn.',
          'Mijn werkwijze is vastgelegd en niet afhankelijk van mondelinge overdracht — ook een collega kan mijn processen overnemen.',
        ],
      ],
      [
        [
          'Ik draag actief bij aan een positieve kandidaat- en medewerkersbeleving bij BURG QHSSE.',
          'Van eerste contactmoment tot preboarding: ik zorg dat mensen zich welkom en goed geïnformeerd voelen — op elk moment in het proces.',
        ],
        [
          'Ik sta open voor feedback op mijn aanpak en gebruik dit aantoonbaar om HR- en recruitmentprocessen te verbeteren.',
          'Ik luister, stel vragen en laat concreet zien wat ik met feedback heb gedaan — ook wanneer het gaat over onze eigen HR-processen.',
        ],
        [
          'Ik werk actief aan mijn ontwikkeling als HR- en recruitmentprofessional via mijn POP.',
          'Ik weet wat mijn leerdoelen zijn en onderneem gerichte stappen om te groeien in kennis en impact binnen de functie.',
        ],
      ],
      [
        [
          'Ik beheers de volledige werving-en-selectiecyclus voor interne vacatures, van functieprofiel tot contractaanbod.',
          'Mijn trajecten zijn goed gedocumenteerd, tijdig afgerond en voldoen structureel aan de kwaliteitsnormen.',
        ],
        [
          'Ik ondersteun leidinggevenden proactief bij HR-taken zoals contractbeheer, onboarding, GPB-administratie en lopende HR-vraagstukken.',
          'Ik wacht niet tot leidinggevenden naar mij toe komen — ik anticipeer op deadlines en behoeften en zorg dat zaken op tijd geregeld zijn.',
        ],
        [
          'Ik bouw en onderhoud actief de employer branding van BURG QHSSE via de juiste kanalen.',
          'Mijn bijdrage aan employer branding is zichtbaar, consistent en aansluitend op onze doelgroep en positionering in de QHSSE-markt.',
        ],
      ],
      [
        [
          'Ik gebruik HR- en recruitmenttools zoals afgesproken en benut beschikbare functionaliteiten volledig.',
          'Ik maak gebruik van sjablonen, workflows en digitale processen om handmatig of dubbel werk te voorkomen.',
        ],
        [
          'Ik signaleer verbeterkansen in HR- en recruitmentprocessen en kom proactief met concrete voorstellen.',
          'Ik denk actief mee over hoe preboarding, onboarding, werving of HR-administratie slimmer kan worden ingericht.',
        ],
        [
          'Ik sta open voor AI-ondersteunde werkwijzen en nieuwe tools en pas ze toe wanneer ze aantoonbare meerwaarde bieden.',
          'Ik experimenteer verantwoord met nieuwe mogelijkheden en draag positief bij aan de digitalisering van Team Corporate.',
        ],
      ],
      [
        [
          'Ik vertegenwoordig BURG QHSSE professioneel in alle kandidaatcontacten en op externe kanalen.',
          'Mijn communicatie naar kandidaten is helder, tijdig en representatief — ook bij afwijzingen of vertragingen in het proces.',
        ],
        [
          'Ik draag actief bij aan een consistente en aantrekkelijke employer brand voor BURG QHSSE.',
          'Mijn uitingen op LinkedIn en andere kanalen sluiten aan op onze positionering en doelgroep.',
        ],
        [
          'Ik bouw een relevant netwerk op in de arbeidsmarkt dat aansluit op onze wervingsbehoefte.',
          'Ik onderhoud contacten actief en ben als herkenbaar gezicht namens BURG QHSSE zichtbaar in de markt.',
        ],
      ],
      [
        [
          'Ik denk bij elke wervingsinspanning na over wat het concreet oplevert — snellere plaatsing, lagere wervingskosten, betere match.',
          'Ik houd bij welke kanalen renderen en welke niet, en bespreek dit proactief met mijn leidinggevende.',
        ],
        [
          'Ik maak bewuste keuzes over de inzet van wervingskanalen op basis van kosten en bereik.',
          'Ik kies niet voor de duurste of meest voor de hand liggende oplossing, maar voor de aanpak met de beste prijs-kwaliteitverhouding.',
        ],
        [
          'Ik draag bij aan personeelsbehoud door onboarding- en preboardingprocessen kwalitatief goed uit te voeren.',
          'Een medewerker die goed start, is een investering die zich terugbetaalt — ik neem die eerste indruk serieus en meet of het werkt.',
        ],
      ],
    ),
    // 3 = Marketing & AI Officer
    3: bouwStellingen(
      [
        [
          'Ik houd marketingdata, campagneresultaten en projectstatussen actueel en inzichtelijk voor het team.',
          "Collega's en leidinggevende kunnen altijd zien wat er loopt, wat de actuele cijfers zijn en waar we staan ten opzichte van de doelen.",
        ],
        [
          'Ik documenteer mijn werkwijzen, tools en gebouwde applicaties zodat ze overdraagbaar en herhaalbaar zijn.',
          'Mijn werk is niet afhankelijk van mondelinge kennisoverdracht — ook anderen kunnen ermee verder zonder dat ik er bij hoef te zijn.',
        ],
        [
          'Ik bouw marketing- en AI-toepassingen op een manier die schaalbaarheid ondersteunt.',
          'Wat ik maak is gestructureerd, gedocumenteerd en ontworpen om mee te groeien met de organisatie.',
        ],
      ],
      [
        [
          'Ik maak data, analyses en AI-toepassingen begrijpelijk voor collega\'s zonder technische achtergrond.',
          'Ik vertaal resultaten en tools naar heldere inzichten die anderen direct kunnen gebruiken in hun werk.',
        ],
        [
          'Ik sta open voor feedback op mijn werk — zowel op de inhoud als op de toepasbaarheid — en gebruik dit om te verbeteren.',
          'Ik test mijn applicaties en analyses samen met de eindgebruikers en pas ze aan op basis van hun praktijkervaring.',
        ],
        [
          'Ik werk actief aan mijn ontwikkeling als Marketing- en AI-professional via mijn POP.',
          'Ik volg relevante ontwikkelingen op het snijvlak van marketing, data en AI en vertaal dit naar concrete toepassingen voor BURG QHSSE.',
        ],
      ],
      [
        [
          'Ik beheer en analyseer marketingdata nauwkeurig en lever betrouwbare inzichten op aan de juiste stakeholders.',
          'Mijn analyses zijn reproduceerbaar, goed gedocumenteerd en vrij van fouten of ongetoetste aannames.',
        ],
        [
          'Ik bouw functionele AI-toepassingen die een aantoonbaar werkend doel dienen voor BURG QHSSE.',
          'Wat ik bouw is stabiel, gedocumenteerd en afgestemd op de behoefte van de gebruiker — geen prototype dat niemand gebruikt.',
        ],
        [
          'Ik bewaak de kwaliteit van mijn marketinguitingen en AI-output en toets deze aan de organisatiedoelen.',
          'Ik lever geen werk aan dat niet gecontroleerd, getest of afgestemd is — ook niet onder tijdsdruk.',
        ],
      ],
      [
        [
          'Ik zet AI-tools en automatiseringsoplossingen in om repetitieve of tijdrovende marketing- en datataken te vereenvoudigen.',
          'Ik identificeer processen die geautomatiseerd kunnen worden en bouw of implementeer hier gericht oplossingen voor.',
        ],
        [
          'Ik signaleer kansen voor verdere automatisering of AI-inzet en vertaal deze naar concrete voorstellen.',
          'Ik kom niet alleen met ideeën, maar werk ze uit tot een werkbaar plan of werkend prototype.',
        ],
        [
          'Ik help collega\'s bij het begrijpen en gebruiken van AI-tools en marketingdashboards.',
          'Ik fungeer als interne kennisbron op het snijvlak van marketing en technologie binnen Team Corporate.',
        ],
      ],
      [
        [
          'Ik monitor de marketingprestaties van BURG QHSSE structureel en vertaal dit naar concrete inzichten.',
          'Ik houd bij hoe onze kanalen presteren, signaleer trends en bespreek bevindingen actief met mijn leidinggevende.',
        ],
        [
          'Ik zorg dat marketingkeuzes data-gedreven zijn en aansluiten op onze doelgroep en positionering.',
          'Ik onderbouw keuzes met cijfers — niet alleen met gevoel — en stel bij op basis van wat de data laat zien.',
        ],
        [
          'Ik draag bij aan een professionele en consistente digitale aanwezigheid van BURG QHSSE.',
          'Mijn bijdrage versterkt onze reputatie als specialist in de QHSSE-sector — zowel in content als in de technische laag daaronder.',
        ],
      ],
      [
        [
          'Ik benoem bij elk nieuw project of elke tool de verwachte baten voordat ik begin — niet achteraf.',
          'Ik maak concreet wat het oplevert (tijdsbesparing, bereik, conversie, kostenverlaging) en maak dit bespreekbaar met mijn leidinggevende vóór de uitvoering.',
        ],
        [
          'Ik maak bewuste keuzes over welke tools en platformen we inzetten, op basis van prijs en toegevoegde waarde.',
          'Ik vergelijk opties, houd rekening met licentiekosten en verdedig mijn keuze met een concreet kosten-batenplaatje.',
        ],
        [
          'Ik lever marketinginspanningen en AI-toepassingen die bijdragen aan meetbare organisatiedoelen.',
          'Mijn werk heeft aantoonbaar effect — ik meet de uitkomsten, rapporteer hierover en stuur bij wanneer het resultaat tegenvalt.',
        ],
      ],
    ),
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
