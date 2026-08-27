# FL Esports

Komplette statische FL-Esports-League-Plattform mit 1. Liga, 2. Liga, Spielplan, Ergebnissen, Teamseiten, Tabellen, Form, Statistiken, News und Admin-CMS.

## Funktionen

- 1. Liga und 2. Liga
- Automatische Tabelle aus gespeicherten Ergebnissen
- Punkte, Tore, Gegentore und Tordifferenz
- Form W/D/L aus den letzten fünf gespielten Begegnungen
- Spielplan und Match-Center
- Teamübersicht und individuelle Teamseiten
- Liga- und Teamstatistiken
- Newsverwaltung
- Admin-CMS mit Code `Stikeli`
- Teamverwaltung inklusive Name, Kürzel, Logo/Emoji und Farbe
- Ergebnisverwaltung mit Spielstatus
- Änderbares Punktesystem für Sieg, Unentschieden und Niederlage
- Branding- und Saison-Einstellungen
- Datenexport/-import über JSON
- Responsive Design für Desktop und Smartphone

## Deployment

Die Seite ist eine statische Website und benötigt für die aktuelle Version keinen Build-Schritt. `index.html`, `styles.css` und `app.js` können direkt über GitHub Pages, Netlify, Vercel oder einen normalen Webserver ausgeliefert werden.

## Admin

Im Menü `Admin` den Code `Stikeli` eingeben.

Hinweis: Die aktuelle Version speichert Daten im Browser via `localStorage`. Für einen echten Mehrbenutzer-Livebetrieb mit serverseitig geschützten Adminrechten sollte als nächster Architektur-Schritt ein Backend mit Datenbank und echter Authentifizierung ergänzt werden.
