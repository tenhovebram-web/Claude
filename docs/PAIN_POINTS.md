# PAIN_POINTS.md — Problemvalidierung SMB-Automation-Hub

**Phase 1 — Recherche & Problemvalidierung**
**Zielmarkt:** Kleine Dienstleistungsbetriebe (5–50 MA) im DACH-Raum
**Fokusbranchen:** Handwerk, Immobilienmakler, Praxen (Ärzte/Therapie), weitere Dienstleister
**Stand:** 2026-07-19

---

> ### ⚠️ Status der Datenbasis
> Diese Analyse stützt sich auf **öffentlich verfügbare Web-Recherche (Stand 2025/2026)** — Branchenstudien, Anbieter-Benchmarks und Marktberichte. Sie ist **keine Offline-Analyse**, aber:
>
> **Alle Kostenrechnungen sind Modellrechnungen auf Basis klar gekennzeichneter Annahmen (`[ANNAHME]`).** Viele der zitierten Zahlen stammen aus Blogs von Anbietern, die selbst Lösungen verkaufen (Interessenkonflikt) — sie sind als **Größenordnung, nicht als belastbarer Beweis** zu behandeln.
>
> **Vor jedem Kundeneinsatz:** Zahlen mit den echten Ist-Werten des konkreten Betriebs ersetzen (Anrufvolumen, Auftragswert, Marge, No-Show-Quote). Ein Discovery-Gespräch/Audit pro Kunde ist Pflicht — dieses Dokument liefert die Hypothesen, nicht die Wahrheit.

---

## 1. Referenzbetrieb (Kalkulationsgrundlage)

Damit die Kostenrechnungen vergleichbar sind, rechnen wir gegen einen fiktiven **Referenzbetrieb**. Alle Werte sind `[ANNAHME]` und konservativ gewählt.

| Kennzahl | Wert | Quelle / Begründung |
|---|---|---|
| Mitarbeiter | 12 | Mitte des Zielsegments (5–50) |
| Ø Auftragswert (netto) | 1.200 € | `[ANNAHME]` — unteres Ende der oft zitierten 800–2.000 € im Handwerk |
| Deckungsbeitrag/Marge je Auftrag | 35 % | `[ANNAHME]` — konservativ für Dienstleistung |
| Eingehende Anrufe / Werktag | 20 (≈ 440/Monat) | `[ANNAHME]` |
| Anteil „Neukunden-/Auftragsanrufe" | 30 % der Anrufe | `[ANNAHME]` |
| Abschlussquote auf qualifizierten Lead | 30 % | `[ANNAHME]` — konservativ |
| Interner Stundensatz Büro/Verwaltung (Vollkosten) | 35 €/h | `[ANNAHME]` |
| Monatsumsatz | ≈ 80.000 € | abgeleitet |

> Faustregel für die Interpretation: Angaben zu **„entgangenem Umsatz"** sind Bruttoumsatz. Der tatsächliche Gewinn­verlust ist Umsatz × Marge (35 %). Wo sinnvoll, ist beides ausgewiesen.

---

## 2. Die 10 größten operativen Bottlenecks

Nummerierung ≠ Priorität. Die Priorisierung folgt in Abschnitt 4.

---

### B1 — Verpasste / nicht beantwortete Anrufe während der Arbeitszeit
**Problem:** Auf der Baustelle, beim Kunden, im Behandlungszimmer geht niemand ans Telefon. Viele Kleinbetriebe haben keine Bürokraft. Der Anrufer wählt den nächsten Anbieter — der verpasste Anruf ist ein direkt verlorener Auftrag, ohne dass der Betrieb es je merkt.

**Marktdaten (Recherche):**
- 40–60 % aller Anrufe bei Handwerksbetrieben bleiben unbeantwortet (Anbieter-Quellen).
- Deutsche Telekom (zitiert): 22 % aller KMU-Anrufe unbeantwortet; bei Handwerk ≈ 35 %.
- YouGov (zitiert): 60 % der Verbraucher finden Kleinbetriebe telefonisch „oft/immer schlecht erreichbar".

**Kostenrechnung `[ANNAHME]`, bewusst konservativ (25 % verpasst):**
- 440 Anrufe/Monat × 25 % verpasst = 110 verpasste Anrufe
- davon Auftragsanrufe: 110 × 30 % = 33
- davon endgültig verloren (Rest ruft zurück / wird zurückgerufen): 40 % = **≈ 13 verlorene Leads**
- × 30 % Abschlussquote = **≈ 4 verlorene Aufträge/Monat**
- × 1.200 € = **≈ 4.700 € entgangener Umsatz/Monat** (≈ 1.650 € Marge)

> Selbst wenn man das halbiert (2 Aufträge): ~2.400 €/Monat entgangener Umsatz. Sehr schmerzhaft, sehr sichtbar für den Inhaber.

---

### B2 — Langsame Lead-Reaktionszeit (Speed-to-Lead)
**Problem:** Formular-Anfrage, Portal-Lead (ImmoScout, Anfrage über Website) oder E-Mail kommt rein — und liegt Stunden oder Tage. Der erste Anbieter, der reagiert, gewinnt meist.

**Marktdaten (Recherche):**
- Kontakt < 5 Min. → **21× höhere Qualifizierungswahrscheinlichkeit** ggü. 30 Min.
- Ø B2B-Reaktionszeit **47 Stunden**; nur 23 % antworten in < 5 Min.
- **78 % der Käufer** kaufen beim **erstantwortenden** Anbieter; 35–50 % der Abschlüsse gehen an den First Responder.
- **71 % der Leads** erhalten nie eine Antwort.

**Kostenrechnung `[ANNAHME]`:**
- 40 digitale Anfragen/Monat `[ANNAHME]`
- ohne Prozess Reaktion oft > Stunden → geschätzt 30 % gehen an schnelleren Wettbewerber = 12 Leads
- rettbar durch < 5-Min-Reaktion: konservativ 40 % davon = 5 Leads × 30 % Abschluss = **≈ 1,5 zusätzliche Aufträge/Monat**
- ≈ **1.800 € entgangener Umsatz/Monat** (≈ 630 € Marge)

> Eng verwandt mit B1. Gemeinsam bilden „nicht erreichbar" (Telefon) + „zu langsam" (digital) den größten unsichtbaren Umsatzabfluss.

---

### B3 — Fehlende Nachfassprozesse bei Angeboten
**Problem:** Angebot raus → und dann Funkstille. Kein System erinnert daran, nach 3 Tagen nachzufassen. Der Betrieb lässt bereits fast gewonnene Aufträge liegen, weil niemand nachhakt.

**Marktdaten (Recherche):**
- Handwerk konvertiert im Schnitt nur **30–40 %** der Angebote in Aufträge; profitabel wäre > 50 %.
- **≈ 80 %** der Abschlüsse erfolgen erst zwischen dem **2. und 5. Kontakt**.
- Follow-up nach 3 Tagen → **+31 %** Antwortrate.
- Angebote, die > 50 Tage offen sind: Gewinnwahrscheinlichkeit nur noch ≤ 20 %.

**Kostenrechnung `[ANNAHME]`:**
- 25 Angebote/Monat `[ANNAHME]`, Ausgangsquote 35 % → ~9 Aufträge
- systematisches Nachfassen hebt Quote konservativ auf 45 % (+10 Pp, deutlich unter dem „bis 50 %+"-Potenzial) → ~11 Aufträge
- **+2 Aufträge/Monat × 1.200 € = ≈ 2.400 € Mehrumsatz/Monat** (≈ 840 € Marge)

> Extrem hoher ROI, weil hier **kein** neuer Lead nötig ist — nur Disziplin. Ideal automatisierbar.

---

### B4 — No-Shows / Terminausfälle
**Problem:** Patient/Kunde erscheint nicht, der Slot bleibt leer, die Zeit ist unwiederbringlich verloren. Besonders relevant für Praxen, aber auch für Makler-Besichtigungen und Beratungstermine.

**Marktdaten (Recherche):**
- No-Show-Quote in dt. Arztpraxen meist **5–15 %**, bei **Neupatienten bis ~40 %**.
- SMS-Erinnerungen senken No-Shows um **bis zu 82 %** (Anbieter-Angabe, oberes Ende); seriös belastbar ist eher **„bis zu einem Drittel"**.

**Kostenrechnung `[ANNAHME]` (Praxis-nah):**
- 400 Termine/Monat `[ANNAHME]`, No-Show 8 % = 32 Ausfälle
- Wert je Slot 60 € `[ANNAHME]` → 1.920 €/Monat verlorene Kapazität
- Reduktion durch automatische Erinnerung konservativ 33 % → **≈ 630 € gerettete Kapazität/Monat**

> Wirkung stark branchenabhängig: für Praxen hoch, für reines Handwerk gering. Kein universelles Kernproblem, aber starkes Modul für die Praxen-Nische.

---

### B5 — Manuelle Terminvereinbarung (Telefon-Ping-Pong)
**Problem:** Terminfindung frisst Zeit: Rückruf, „passt Ihnen Dienstag?", besetzt, erneut anrufen. Zwischen Kalender, Telefon und Kunde entsteht Reibung und Fehlerquote (Doppelbuchung).

**Marktdaten (Recherche):**
- Teil des allgemeinen Verwaltungsblocks: europäische/deutsche Beschäftigte verbringen laut Ricoh-Studie **~16 Std./Woche** mit Verwaltung; 26 % der Büroangestellten „Großteil des Tages" mit fachfremder Admin.

**Kostenrechnung `[ANNAHME]`:**
- 1 Bürokraft, ~5 Std./Woche reine Terminkoordination `[ANNAHME]`
- automatisierbar/reduzierbar ~50 % = 2,5 Std./Woche ≈ 10,8 Std./Monat
- × 35 €/h = **≈ 380 € Zeitkosten/Monat** + schwer bezifferbarer Ärger/Fehlerkosten

> Reine Zeitersparnis, kein direkter Umsatz. Zahlungsbereitschaft mittel („nice to have"), außer bei hohem Terminvolumen.

---

### B6 — Doppelerfassung zwischen Telefon, Kalender, E-Mail & Kundendaten
**Problem:** Dieselben Daten werden 3–4× getippt: Notiz vom Telefon → Kalendereintrag → E-Mail-Bestätigung → Kundenkartei/Rechnung. Fehleranfällig, langsam, frustrierend.

**Marktdaten (Recherche):**
- Ricoh: **~16 Std./Woche** Verwaltungsaufwand je Beschäftigtem.
- Anbieter-Rechnungen: Prozess-Automatisierung spart **> 22 Std./Woche** über 10 typische Workflows (oberes, werbliches Ende).

**Kostenrechnung `[ANNAHME]`, betont konservativ:**
- 3 Personen × je 2 Std./Woche vermeidbare Doppelerfassung `[ANNAHME]` = 6 Std./Woche ≈ 26 Std./Monat
- × 35 €/h = **≈ 910 € Zeitkosten/Monat**

> Hoher realer Schmerz, aber **diffus** — schwer als eine Zahl greifbar, daher niedrigere spontane Zahlungsbereitschaft. Wird meist erst als Nebeneffekt eines Kernmoduls gelöst (ein zentrales System statt vier Insellösungen).

---

### B7 — Rechnungsstellung & Zahlungserinnerungen (Zahlungsverzug)
**Problem:** Rechnungen gehen verspätet raus; Zahlungserinnerungen werden vergessen; Geld kommt spät oder gar nicht. Liquiditätsproblem, kein reines Umsatzproblem.

**Marktdaten (Recherche):**
- Coface 2025: **81 %** der dt. Unternehmen von Zahlungsverzug betroffen (2021: 59 %); Ø Verzug **~32 Tage**.
- Bau als Schlusslicht bei Zahlungsmoral — relevant für Handwerk.

**Kostenrechnung `[ANNAHME]`:**
- Effekt ist v. a. **Liquidität + Ausfallrisiko + Mahn-Zeitaufwand**, kein neuer Umsatz.
- Zeit: ~2 Std./Woche Rechnungs-/Mahnwesen `[ANNAHME]`, ~50 % automatisierbar = 4,3 Std./Monat × 35 € = **≈ 150 €/Monat** direkte Zeitersparnis
- + schwer bezifferbarer Zins-/Ausfallvorteil durch schnelleren Geldeingang

> Wichtig, aber: berührt Buchhaltung/DATEV-Welt, viele Betriebe haben Steuerberater/Tools dafür. **Höhere Integrations-/Haftungskomplexität, geringere Differenzierung** → schlechter Startpunkt für ein White-Label-MVP.

---

### B8 — Kein Reaktivierungs-/Wiedervorlage-Prozess für Bestandskunden
**Problem:** Wartung fällig, Nachbestellung, „vor einem Jahr Interesse gezeigt" — Bestandskunden werden nicht systematisch reaktiviert. Der günstigste Umsatz (bestehende Kunden) verpufft.

**Kostenrechnung `[ANNAHME]`:**
- Bestandskunden-Reaktivierung könnte 1 Auftrag/Monat zusätzlich bringen `[ANNAHME]`
- ≈ **1.200 € Umsatz/Monat**

> Echter Hebel, aber setzt saubere, gepflegte Kundendaten voraus (Henne-Ei mit B6). Eher **Ausbaustufe** als MVP-Kern.

---

### B9 — Fragmentierte Kommunikationskanäle (Telefon, E-Mail, WhatsApp, Portale)
**Problem:** Kundenkommunikation verteilt sich auf 4–5 Kanäle ohne zentrale Übersicht. Nachrichten gehen unter, niemand weiß, wer was zugesagt hat.

**Kostenrechnung `[ANNAHME]`:**
- Teil des Verwaltungs-/Suchaufwands; ~2 Std./Woche „Wo war nochmal…?" `[ANNAHME]`
- ≈ **300 €/Monat** Zeitkosten + Risiko verlorener Chancen

> Wird großteils **als Nebenprodukt** eines zentralen Cockpits gelöst, nicht als eigenständiges verkaufbares Modul.

---

### B10 — Fehlendes Reputations-/Bewertungsmanagement (Google-Reviews)
**Problem:** Zufriedene Kunden hinterlassen keine Bewertung, weil niemand fragt. Wenige/alte Google-Bewertungen senken die Zahl neuer Anfragen — schwächt indirekt B1/B2.

**Kostenrechnung `[ANNAHME]`:**
- Mehr/bessere Reviews → mehr Sichtbarkeit → schwer isoliert messbar
- Modellwert: +0,5 Aufträge/Monat `[ANNAHME]` ≈ **600 € Umsatz/Monat**, aber niedrige Konfidenz

> Beliebtes Zusatzmodul (leicht automatisierbar: nach Auftrag SMS/E-Mail mit Bewertungslink), aber **Add-on, kein Kern**.

---

## 3. Zusammenfassende Kostenübersicht (Referenzbetrieb, `[ANNAHME]`)

| # | Bottleneck | Wirkungsart | Konservativer Monatswert |
|---|---|---|---|
| B1 | Verpasste Anrufe | Entgangener Umsatz | ~4.700 € (~1.650 € Marge) |
| B3 | Angebote nicht nachgefasst | Entgangener Umsatz | ~2.400 € (~840 € Marge) |
| B2 | Langsame Lead-Reaktion | Entgangener Umsatz | ~1.800 € (~630 € Marge) |
| B8 | Keine Reaktivierung | Entgangener Umsatz | ~1.200 € |
| B6 | Doppelerfassung | Zeitkosten | ~910 € |
| B4 | No-Shows | Verlorene Kapazität | ~630 € (Praxis-Kontext) |
| B10 | Reputationsmanagement | Umsatz (niedrige Konfidenz) | ~600 € |
| B5 | Manuelle Terminvereinbarung | Zeitkosten | ~380 € |
| B9 | Fragmentierte Kanäle | Zeitkosten | ~300 € |
| B7 | Rechnung/Zahlung | Zeit + Liquidität | ~150 € + Zinsvorteil |

> **Interpretation:** Der ganz überwiegende Teil des *bezifferbaren* Schmerzes liegt im **oberen Trichter** (Anrufe, Leads, Angebote) — also da, wo Umsatz *verloren geht*, nicht wo Zeit gespart wird. Das ist entscheidend für die Zahlungsbereitschaft: „Du verlierst 4.700 €/Monat" verkauft sich um Klassen besser als „Du sparst 3 Stunden".

---

## 4. Priorisierung: Automatisierbarkeit × Schmerzintensität × Zahlungsbereitschaft

Bewertung je Dimension **1–5** (5 = am besten für uns). Score = Produkt (max. 125).

| # | Bottleneck | Automatisierbar­keit | Schmerz­intensität | Zahlungs­bereitschaft | **Score** |
|---|---|:---:|:---:|:---:|:---:|
| **B1** | **Verpasste Anrufe** | 4 | 5 | 5 | **100** |
| **B3** | **Angebote nachfassen** | 5 | 4 | 4 | **80** |
| **B2** | **Speed-to-Lead** | 5 | 4 | 4 | **80** |
| B4 | No-Shows | 5 | 3 | 4 | 60 |
| B8 | Reaktivierung | 4 | 3 | 3 | 36 |
| B10 | Reputation | 5 | 2 | 3 | 30 |
| B6 | Doppelerfassung | 3 | 4 | 2 | 24 |
| B5 | Terminvereinbarung | 4 | 3 | 2 | 24 |
| B9 | Kanäle | 3 | 3 | 2 | 18 |
| B7 | Rechnung/Zahlung | 2 | 3 | 3 | 18 |

**Begründung der kritischen Bewertungen:**
- **B1 Automatisierbarkeit = 4 (nicht 5):** Anruf-*Übersicht/Rückrufliste* ist trivial; echte Anruf-*Annahme* braucht CTI-/Telefonie-Anbindung (Voice-Bot) — dafür bauen wir die Adapter-Schicht vor, aber Tag 1 liefern wir die Cockpit-Sicht + Rückruf-Workflow.
- **B7 Automatisierbarkeit = 2:** Buchhaltung/GoBD/DATEV, Haftung, etablierte Konkurrenz (lexoffice, sevDesk). Schlechter Startpunkt.
- **B6 Zahlungsbereitschaft = 2:** Schmerz real, aber diffus; niemand zückt dafür spontan die Kreditkarte. Wird als *Nebeneffekt* mitgeliefert.

---

## 5. Ergebnis: Die Top-3-Kernmodule

Die drei Top-Bottlenecks (B1, B3, B2) bilden zusammen eine **kohärente Geschichte** — den gesamten Umsatz-Trichter *vor* der Auftragsannahme:

> **„Kein Lead geht mehr verloren — vom ersten Klingeln bis zum unterschriebenen Angebot."**

| Modul | Deckt ab | Kern-Nutzenversprechen |
|---|---|---|
| **1. Anruf-Cockpit** | B1 (+ B9) | Jeder Anruf sichtbar, keine verpasste Rückrufliste — „Nie wieder einen Auftrag verpassen, weil keiner ranging." |
| **2. Lead- & Angebots-Pipeline** | B3 + B2 (+ B8) | Kanban Neu→Kontaktiert→Angebot→Nachgefasst→Gewonnen/Verloren mit automatischen Nachfass-Erinnerungen — „Schnell reagieren, konsequent nachfassen, mehr abschließen." |
| **3. Termin-Zentrale** | B4 + B5 | Alle Termine an einem Ort, automatische Erinnerungen gegen No-Shows — stark v. a. für die **Praxen-Nische**. |

**Warum genau diese drei:**
1. Sie treffen alle drei Priorisierungsdimensionen gleichzeitig (hoher Score).
2. Sie adressieren **Umsatz-Verlust**, nicht nur Zeitersparnis → höchste Zahlungsbereitschaft, leichteste Wertargumentation im Verkauf.
3. Sie sind **branchenübergreifend** relevant (Handwerk, Makler, Praxen) → maximale White-Label-Wiederverwendung. Modul 3 ist der Nischen-Verstärker für Praxen.
4. B6/B9 (Doppelerfassung, Kanäle) werden **automatisch als Nebeneffekt** mitgelöst, sobald diese drei Module in *einem* System laufen — ohne eigenes teures Modul.

**Bewusst NICHT im MVP:** B7 (Rechnung/Zahlung — zu komplex/reguliert/umkämpft), B8/B10 (Reaktivierung/Reviews — als spätere, leicht ergänzbare Add-ons über dieselbe Datenbasis geplant).

---

## 6. Offene Punkte vor Kundeneinsatz (Validierungs-Checkliste)

- [ ] Reale Ist-Zahlen je Pilotkunde erheben (Anrufvolumen, Auftragswert, Marge, No-Show-Quote) statt Referenzwerte.
- [ ] Zitierte Anbieter-Statistiken durch neutrale Primärquellen (Studien, Verbände: ZDH, KZBV, Bitkom) ersetzen/absichern.
- [ ] CTI-/Telefonie-Landschaft der Zielkunden prüfen (welche Anlagen? Placetel, Sipgate, 3CX, Fritzbox?) — bestimmt Machbarkeit von B1-Vollausbau.
- [ ] DSGVO: Auftragsverarbeitung, Speicherort EU/Frankfurt, Einwilligung für SMS/E-Mail-Erinnerungen (B4) klären.
- [ ] Zahlungsbereitschaft real testen: 3–5 Discovery-Gespräche mit Zielbetrieben, bevor gebaut wird.

---

## Quellen (Web-Recherche, Stand 2025/2026)

**Speed-to-Lead / Lead-Reaktionszeit (B2):**
- [Kixie — Speed to Lead Response Time Statistics](https://www.kixie.com/sales-blog/speed-to-lead-response-time-statistics-that-drive-conversions/)
- [Amplemarket — Speed to Lead Statistics](https://www.amplemarket.com/blog/how-to-win-deals-faster-speed-to-lead-statistics-you-need-to-know)
- [GreetNow — Lead Response Time Statistics 2026](https://greetnow.com/blog/lead-response-time-statistics)
- [LeadAngel — Speed to Lead Statistics](https://www.leadangel.com/blog/operations/speed-to-lead-statistics/)

**Verpasste Anrufe (B1):**
- [Agentino — Erreichbarkeit Handwerker: Verpasste Anrufe](https://agentino.de/blog/erreichbarkeit-handwerker-verpasste-anrufe-kosten-loesungen/)
- [Telfo — Kosten verpasster Anrufe realistisch berechnen](https://telfo.ai/blog/kosten-verpasster-anrufe-unternehmen/)
- [Vokaro — Jeder verpasste Anruf ist ein verlorener Auftrag](https://vokaro.net/branchen/handwerk/probleme/auftraege-verlieren)

**No-Shows / Terminerinnerung (B4):**
- [APPOYNT — No-Show-Rate senken](https://www.appoynt.de/blog/no-show-rate-senken)
- [LINK Mobility — Terminausfälle mit SMS minimieren](https://www.linkmobility.com/de/blog/automatische-terminerinnerungen-wie-aerzte-und-praxispersonal-terminausfaelle-einfach-minimieren-und-kosten-senken)
- [eTermio — No-Shows bei Ärzten verringern](https://www.etermio.com/no-shows-bei-aerzten-verringern-massnahmen/)

**Angebote nachfassen (B3):**
- [HandwerkPro — Angebote nachfassen: 7 Tipps](https://handwerkpro.com/blog/angebote-nachfassen-tipps)
- [Turboangebot — Angebot nachfassen: Timing & Tipps](https://turboangebot.de/ratgeber/angebote-nachfassen-handwerk)
- [Vertriebszeitung — Angebote richtig nachfassen](https://vertriebszeitung.de/angebote-richtig-nachfassen/)

**Zahlungsverzug (B7):**
- [Coface — Schlechte Zahlungsmoral belastet deutsche Unternehmen (2025)](https://www.coface.de/news-wirtschaftsstudien-insights/immer-mehr-verspaetete-zahlungen-schlechte-zahlungsmoral-belastet-deutsche-unternehmen)
- [Finanzierung-KMU — Zahlungsverzug bei KMU](https://finanzierung-kmu.de/zahlungsverzug-bei-kmu/)

**Verwaltungsaufwand / Doppelerfassung (B5, B6, B9):**
- [Ricoh — 16 Stunden Verwaltungsaufwand pro Woche](https://www.ricoh.de/news-events/news/ricoh-studie-fehlende-prozesse-und-automatisierung/)
- [Computerworld — 15 Stunden Verwaltungsaufwand pro Woche (EU)](https://www.computerworld.ch/themen/business-und-it-strategie/15-stunden-verwaltungsaufwand-woche-bremsen-europaeische-beschaeftigte)

> Hinweis zur Quellenqualität: Ein erheblicher Teil der Prozent- und Euro-Angaben stammt aus **Marketing-Blogs von Lösungsanbietern** und ist tendenziell nach oben verzerrt. Für die Priorisierung ausreichend (relative Größenordnungen), für Kundenpräsentationen jedoch durch neutrale Quellen zu ersetzen.
