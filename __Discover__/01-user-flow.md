# User Flow

## Oeffentlicher Flow
1. User oeffnet den Link.
2. Ein Couvert erscheint als Hero-Element.
3. Das Couvert oeffnet sich per Animation.
4. Die Karte faehrt sichtbar aus dem Couvert.
5. Die Einladungskarte zeigt sofort die wichtigsten Informationen.
6. Unterhalb der Karte erscheint der Button `Request access`.
7. Klick auf `Request access` oeffnet das Formular.
8. User fuellt das Formular aus und sendet es ab.
9. Erfolgsstatus wird angezeigt:

```text
Submission received.
You will be contacted via WhatsApp regarding your status.
```

## Admin Flow
1. Admin meldet sich in einem internen Bereich an.
2. Admin sieht Liste aller Registrierungen.
3. Jede Registrierung hat mindestens den Status `Pending`.
4. Admin kann `Accept` oder `Reject` waehlen.
5. System speichert die Entscheidung.
6. Bei aktiver Integration wird automatisch eine WhatsApp-Nachricht ausgeloest.

## Optionaler Zukunfts-Flow
1. User registriert sich mit Begleitpersonen.
2. Admin sieht Anzahl der zusaetzlichen Gaeste.
3. System prueft Duplikate per Telefonnummer oder Instagram.
4. Check-in am Eventabend erfolgt ueber Statusliste.
