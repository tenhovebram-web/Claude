# BA Prompt Generator: Architektur-Review (v16.7 → v17)

Grundlage: `original_v16_7.html` (eine Datei, 2.967 Zeilen, 324 KB, davon ca. 390 Zeilen CSS,
780 Zeilen HTML mit zweisprachigem Handbuch und 1.800 Zeilen JavaScript).
Die überarbeitete Fassung ist `BA_Prompt_Generator.html`.

## 1. Gesamtbild

Fachlich ist das Tool stark: abhängige Felder je Anwendungsfall, eine regelbasierte
Quality Engine mit Reifegrad, eine Definition of Done im Prompt, eine Ergebnisprüfung und ein
vollständiges Handbuch in zwei Sprachen. Technisch ist es über mehrere Versionen gewachsen
(v11 → v14 → v16.1 → v16.7), und jede Version wurde **angebaut statt eingebaut**. Das sieht man
an diesen Stellen:

| Symptom | Stelle | Folge |
|---|---|---|
| Parallele Bewertungssysteme | `assess()` delegiert an `assessV14()`, zusätzlich `review()` im AI-Modul | Drei Wege, denselben Score zu berechnen |
| Toter Code | Geführter Modus: `setMode()` erzwingt `guided=false`, der Rest (~80 Zeilen) bleibt aktiv verdrahtet | Wartungslast, irreführend |
| CSS in Schichten | v14-Regeln stehen **vor** den Design-Tokens, AI-CSS danach, Annahmen-CSS ganz am Ende | Reihenfolgeabhängig, schwer zu überblicken |
| Keine zentrale Zustandsquelle | Zustand liegt verteilt im DOM (`$(id).value`), in `dynamicStore`, `assumptionState` und `documents` | Jede Funktion liest das DOM neu aus |
| Globale Event-Kaskade | 6 globale `input`-Listener: `saveState`, `renderLiveHelp` (ohne Debounce), `renderQA` (160 ms), `deriveAssumptions` (250 ms, speichert erneut), AI-`render` (240 ms) | Pro Tastendruck laufen `evaluateRules()` 3–4× und `JSON.stringify` des Gesamtzustands 2×, bei gespeicherten Dokumenten bis 50.000 Zeichen je Datei |

## 2. Schwachstellen nach Priorität

### Kritisch (Sicherheit)

1. **pdf.js 3.11.174 ist von CVE-2024-4367 betroffen.** Eine präparierte PDF kann über
   Schriftart-Daten beliebiges JavaScript im Seitenkontext ausführen. Dieser Kontext hat
   Zugriff auf alle Eingaben und auf das Bearbeitungs-Token. **Behoben** durch
   `isEvalSupported:false` (offizielle Mitigation). Mittelfristig auf pdf.js ≥ 4.2.67 aktualisieren.
2. **SheetJS `xlsx` 0.18.5** hat bekannte Lücken: Prototype Pollution (CVE-2023-30533) und
   ReDoS (CVE-2024-22363). Die cdnjs-Version wird nicht mehr gepflegt; aktuelle Versionen gibt es
   nur über `cdn.sheetjs.com`. **Offen:** Version aktualisieren oder Excel-Import serverseitig
   durchführen.
3. **CDN-Skripte ohne Subresource Integrity.** Alle vier Bibliotheken werden ohne
   `integrity`-Hash geladen. **Offen:** SRI-Hashes ergänzen, sobald die Versionen feststehen.
4. **Backend-Aufruf an frei eingetippte URL mit `credentials:'include'`.** Die Formulardaten
   gingen an jede eingegebene Adresse, bei Cookie-Auth mit Firmen-Cookies. **Teilweise behoben:**
   Endpunkte müssen jetzt relativ oder `https` sein. Besser wäre eine fest verdrahtete
   Liste zulässiger Endpunkte.

### Hoch (Architektur und Korrektheit)

5. **`deriveAssumptions()` ist auf das Demo-Beispiel zugeschnitten.** Die Regeln erkennen
   „Premiumkunde“, „Excel“, „Kundensegment“, „Fallerstellung“ und „Geschäftsregeln nicht final“,
   also genau die Begriffe aus dem BA-Beispiel. Bei jedem anderen Projekt liefert die Ableitung
   fast nichts. Die neue Funktion **„Mit KI ableiten“** löst das inhaltlich; die Regelheuristik
   bleibt als lokaler Fallback erhalten.
6. **Zustand hängt an Listenpositionen.** Anwendungsfall, Priorisierung und alle Auswahlfelder
   werden als `selectedIndex` gespeichert und ausgewertet (`c.pm===1`, `USE_CASE_FIELDS[idx]`,
   `showIf:{index:0}`). Eine neue Option in der Mitte einer Liste verschiebt alle gespeicherten
   Stände und Regeln. Das Handbuch dokumentiert das sogar als FAQ („Alte Auswahl ist weg“).
   **Empfehlung:** stabile Schlüssel (`value="moscow"`) statt Positionen und ein Versionsfeld mit
   Migration im gespeicherten Zustand.
7. **Ergebnisprüfung (Schritt 6) arbeitet nur mit Schlüsselwörtern.** Beispiele: „Jede
   Priorisierung ist begründet“ gilt als erfüllt, sobald irgendwo „weil“ steht, und „Governor
   Limits berücksichtigt“, sobald „limit“ vorkommt. Das Handbuch nennt diese Grenze selbst.
   **Neu:** „Mit KI prüfen“ bewertet jeden DoD-Punkt inhaltlich mit Begründung. Die Begründungen
   fließen in den Nachbesserungs-Prompt ein.
8. **Die Aussage „100 % lokal“ stimmt nicht mehr, sobald KI aktiv ist.** **Behoben:** Chip und
   Panel zeigen jetzt an, wohin Daten gehen, und der Statuspunkt wechselt auf Orange.

### Mittel (Wartbarkeit und Performance)

9. Übersetzungen liegen an drei Orten: `I18N`, `QA_T` und `TX` im AI-Modul, dazu Inline-`de ? … : …` an Dutzenden Stellen.
10. `setLanguage()` übersetzt über 40 Elemente einzeln per ID. Ein `data-i18n`-Attribut und eine einzige Schleife würden reichen.
11. `innerHTML`-Rendering wird konsequent mit `escapeHtml` abgesichert. Das ist gut, aber fehleranfällig; eine Stelle ohne Escape reicht für XSS über hochgeladene Dokumente.
12. Beim Sprachwechsel bleiben Freitexte und KI-Annahmen in der alten Sprache.
13. Die Monolith-Datei ist kaum testbar. Es gibt keine Unit-Tests für `RULES`, `dodList` oder `buildPrompt`.

## 3. Empfohlene Zielarchitektur

```
src/
  core/          reine Funktionen, ohne DOM, unit-testbar
    state.ts       ein Store {form, dynamic, assumptions, docs, ui} + Versionierung/Migration
    rules.ts       RULES, evaluate(state) -> issues/score/level
    prompt.ts      buildPrompt(state) -> string
    dod.ts         dodList(state), checkLocal(text)
    assumptions.ts deriveLocal(state)
  ai/
    provider.ts    interface AIProvider { improve, analyze, assumptions, check, health }
    local.ts       Heuristiken (heutiger Fallback)
    claude.ts      Artifact-Capability "sample" (Test)
    backend.ts     POST /api/ba-ai (Produktion, Server hält API-Key)
  ui/            dünne Render-Schicht, abonniert den Store
  i18n/de.json, en.json
  docs/          Extraktoren (pdf, docx, xlsx, pptx) in einem Web Worker
```

Die Kernideen:

- **Ein Store, ein Render-Durchlauf.** Eingaben schreiben in den Store. Danach laufen *einmal*
  (per `requestAnimationFrame` gebündelt) Regeln, Annahmen, Live-Hilfe, Panel und
  Speichern. Das ersetzt die sechs globalen Listener.
- **KI als austauschbarer Provider.** Die UI kennt nur Operationen und normalisierte
  Antworten. v17 setzt das innerhalb der Einzeldatei bereits um (`ask(op, payload)`).
- **Produktion über ein eigenes Backend.** Der API-Key liegt auf dem Server, SSO kommt aus dem
  Firmen-Login, dazu Logging, DSGVO-Filter (Pseudonymisierung vor dem Versand) und ein
  Rate-Limit. Der Browser spricht nur noch mit dem eigenen Backend.
- **Build mit Vite**, am Ende wieder als eine Datei ausgeliefert (`vite-plugin-singlefile`),
  damit der einfache Weitergabeweg erhalten bleibt.

## 4. Was v17 konkret ändert

| Bereich | Änderung |
|---|---|
| KI-Schicht | Provider-Abstraktion `local`, `claude` und `api` hinter einem `ask(op, payload)`. Ohne gespeicherte Wahl wird Claude automatisch genutzt, wenn verfügbar, sonst lokal. |
| Claude-Test | Im veröffentlichten Artifact über die `sample`-Capability: Aufruf über das claude.ai-Konto des Nutzers, ohne API-Key. Die erste Anfrage fragt einmal nach Erlaubnis. |
| Feld verbessern | Echter KI-Vorschlag mit Streaming. Die Regelbefunde des Felds gehen mit in den Prompt. Schließen oder Esc bricht die Anfrage ab. Bei Fehler greift der lokale Fallback mit Hinweis. |
| KI-Tiefenanalyse | Neu im Panel: Zusammenfassung, Stärken, Lücken mit Sprung zum Feld, Risiken und Rückfragen. Läuft nur per Klick und wird als veraltet markiert, sobald sich Eingaben ändern. |
| Annahmen | „Mit KI ableiten“ liefert Fakten, Annahmen und offene Punkte, auch aus hochgeladenen Dokumenten. Die Ergebnisse werden in die bestehende Liste gemischt, Häkchen bleiben stabil, und der Stand übersteht einen Reload. |
| Ergebnisprüfung | „Mit KI prüfen“ bewertet jeden DoD-Punkt inhaltlich mit Begründung und erzeugt daraus einen Nachbesserungs-Prompt. |
| Prompt-Hygiene | Nutzerdaten stehen immer in `<ba_inputs>` bzw. `<ai_result>` und sind ausdrücklich als Daten gekennzeichnet (Schutz vor Prompt-Injection aus Dokumenten). |
| Sicherheit | pdf.js-Mitigation, Endpunkt-Validierung, sichtbare Kennzeichnung des Datenabflusses |
| Export | Im Artifact über die `downloads`-Capability, außerhalb weiterhin per Download-Link |
| Barrierefreiheit | Das Modal schließt mit Esc, der Fokus kehrt ins Feld zurück, und Konfigurationsfelder haben `label for`. |

### Backend-Vertrag (für `/api/ba-ai`)

`POST {operation, language, input, prompt}`. Das Feld `prompt` enthält den fertigen Prompt;
ein Backend, das nur ein LLM-Relay ist, kann ihn direkt weiterreichen. Antworten:

- `health` → beliebiges JSON mit Status 200
- `improve` → `{"proposal": string}`
- `analyze` → `{"summary", "strengths":[], "gaps":[{"field","text"}], "risks":[], "questions":[]}`
- `assumptions` → `{"facts":[], "assumptions":[{"text","source"}], "openPoints":[]}`
- `check` → `{"items":[{"index","ok","reason"}], "summary"}`

## 5. Test

Getestet mit Playwright (Chromium), einmal im lokalen Modus und einmal mit simulierter
`sample`-Runtime. Alle Flows liefen ohne Konsolenfehler: Verbesserung übernehmen,
Tiefenanalyse mit Veraltet-Hinweis, KI-Annahmen (Häkchen bleiben nach Bearbeitung erhalten,
Annahme landet im Prompt, Stand übersteht Reload), KI-Ergebnisprüfung mit Nachbesserungs-Prompt
und Verbindungstest. Modellstufen: `quick` für Feldverbesserung und Health-Check, `default` für
Analyse, Annahmen und Prüfung. Das Caching ist abgeschaltet, damit „Neu analysieren“ wirklich neu
fragt.
