# Technischer Plan

## Benötigte Bausteine
- Frontend fuer Einladung, Animation und Formular
- Backend fuer Formularverarbeitung und Admin-Aktionen
- Datenbank fuer Registrierungen und Status
- Admin-Authentifizierung
- Messaging-Integration fuer WhatsApp

## Datenmodell fuer Registrierung
- Full Name
- Phone Number
- Date of Birth
- Instagram Name
- Status
- Created At
- Updated At

## Statusmodell
- `pending`
- `accepted`
- `rejected`

## WhatsApp-Logik
Saubere Automatisierung ist realistisch ueber WhatsApp Business API oder einen Provider wie Twilio. Ein privater Standard-WhatsApp-Account ist dafuer technisch und operativ keine gute Grundlage.

## Nachricht bei Accept
```text
KELLER PARTY
You have been selected.
We look forward to welcoming you to the Icon Club Zurich on June 27.
Please arrive promptly at 23:00.
The dress code is Elegant and will be strictly enforced.
Photography and filming are prohibited throughout the evening.
This is a private event. Your invitation is personal and non-transferable.
```

## Nachricht bei Reject
Noch offen. Es muss entschieden werden, ob bei Ablehnung ueberhaupt aktiv eine Nachricht verschickt werden soll.

## Empfohlene Delivery-Reihenfolge
1. Landingpage und Formular
2. Speicherung der Anmeldungen
3. Admin-Liste mit Statuswechsel
4. Manuelle WhatsApp-Ausloesung
5. Echte WhatsApp-Automation
