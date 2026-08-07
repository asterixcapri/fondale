# 10 — Banco di verifica di giocabilità nel browser

Type: task
Status: resolved

## Question

L'infrastruttura che rende autonomo tutto il resto, e per questo va costruita presto: pilotare il gioco vero in Chromium via Playwright, cliccare dove serve, aspettare, fotografare, e confrontare.

Deve permettere all'agente di:

- avviare il gioco e caricare una scena a comando;
- simulare click e sequenze di gioco, non solo caricare la pagina;
- catturare screenshot in momenti precisi, che l'agente poi *guarda*;
- rilevare le regressioni visive tra una modifica e la successiva;
- raccogliere errori di console e di rete come guasti espliciti.

Chromium è preinstallato con Playwright già configurato (`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`): non va scaricato.

Nota sul perché conta: il vincolo di autonomia della mappa dice che un ticket non è risolto finché l'agente non ha visto funzionare la cosa. Senza questo banco, quella frase non è applicabile e ogni altro ticket resta verificabile solo a parole.

Risolto quando un comando solo avvia il gioco, fa attraversare il vicolo a Michele con dei click, e produce screenshot che mostrano l'attraversamento.

## Answer

Status: resolved

`playwright.config.ts` + `test/harness.ts`. Un comando — `npm run verify` — avvia Vite, apre il gioco in Chromium, aspetta che il primo fotogramma sia disegnato e salva gli screenshot in `test/shots/`, che l'agente poi apre e guarda.

Dettaglio d'ambiente che costava un fallimento a ogni esecuzione: il Chromium preinstallato è la build 1194, più vecchia di quella che questo Playwright si aspetta. Risolto puntando a `/opt/pw-browsers/chromium` con `launchOptions.executablePath`, invece di scaricarne un altro.

Il banco raccoglie errori di console, eccezioni di pagina e risorse mancanti, e li fa fallire come test. Ha già dimostrato di servire: alla prima esecuzione ha intercettato un 404 sulla favicon, sistemato alla radice invece di allentare il controllo. In una lavorazione autonoma un errore che compare solo nella console del browser è un errore che non viene trovato mai.
