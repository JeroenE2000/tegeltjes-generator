# Tegeltjes-generator

Maak je eigen Delfts blauwe tegeltjeswijsheid en deel hem als foto of gif.

Typ een spreuk en zie die meteen op een geglazuurd tegeltje verschijnen, met craquelé, hoekornamenten en een lijstje. Alles draait in de browser: geen server, geen build-stap, geen dependencies.

## Mogelijkheden

- Eigen tekst, of een willekeurige klassieke tegeltjeswijsheid via ‘Verras me’
- Kleine regel onderaan (bijv. “Voor oma, 2026”)
- Lettertypes: klassiek, sierlijk, handschrift en gotisch
- Verfkleuren: Delfts blauw, mangaan, groen en rood
- Plaatjes: molen, scheepje, tulp of hartje
- Hoekjes: ossenkop of spinnetje, met of zonder lijstje
- Exporteren als PNG (1200 × 1200) of als bewegende gif (wordt geschreven, glimt of wiebelt)
- Delen via het deelmenu van je telefoon, als de browser dat ondersteunt

## Lokaal draaien

De code gebruikt ES-modules, dus open `index.html` via een webserver (niet als `file://`):

```bash
python3 -m http.server 8000
# of
npx serve .
```

Ga daarna naar http://localhost:8000.

## Online zetten

Settings → Pages → Deploy from branch → `main`, map `/ (root)`. Let op: voor GitHub Pages op een privé-repo heb je een betaald GitHub-abonnement nodig.

## Structuur

```
index.html                 opmaak van de pagina
css/styles.css             stijlen, met licht en donker thema
js/
  main.js                  koppelt formulier, voorbeeld en knoppen
  config.js                kleuren, lettertypes, spreuken, animaties
  fonts.js                 wacht tot de webfonts geladen zijn
  preview.js               live voorbeeld en animatie-loop
  utils.js                 kleine hulpfuncties
  tile/
    render.js              tekent de complete tegel
    glaze.js               glazuur, craquelé en rand (gecachet)
    corners.js             hoekornamenten
    motifs.js              molen, scheepje, tulp, hartje
    text.js                lettergrootte bepalen en regels verdelen
    animation.js           animatiestand per tijdstip
  export/
    exporters.js           ontwerp naar PNG of GIF
    gif-encoder.js         eigen GIF-encoder (median cut, LZW, frame-diffing)
    share.js               opslaan en delen
```

## Uitbreiden

- **Nieuw plaatje:** voeg een tekenfunctie toe in `js/tile/motifs.js`, registreer hem in `MOTIFS` en zet een keuzeknop in `index.html`.
- **Nieuwe kleur:** voeg hem toe aan `INKS` in `js/config.js` en aan de verfkeuze in `index.html`.
- **Nieuwe animatie:** voeg een type toe aan `ANIMATIONS` in `js/config.js` en een `case` in `js/tile/animation.js`.
