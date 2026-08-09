---
status: accepted
---

# Interfaccia classica a comandi modernizzata

Fondale adotta un'interfaccia a comandi ispirata al modello di Monkey Island 2
e modernizzata secondo Thimbleweed Park: verbi sempre visibili, frase composta,
inventario permanente, nomi dei bersagli al passaggio del mouse e un verbo
preferito per l'esecuzione rapida. Questa decisione sostituisce l'interazione
contestuale di ADR-0001, perché una sola azione primaria nasconde le possibilità
del mondo e rende poco leggibili sia i passaggi fra Scene sia il ciclo di vita
degli Object.

La somiglianza riguarda il modello d'interazione, non la copia di contenuti,
grafica o interfacce proprietarie. Fondale conserva il proprio dominio e lascia
ai Game Project identità artistica, scrittura e regole degli enigmi originali.

I nove Verb visibili sono Give, Talk To, Pick Up, Look At, Open, Close, Push,
Pull e Use; Walk To resta implicito per terreno e Scene Passage. Il passaggio
del puntatore presenta il Noun e il Verb preferito, il click sinistro costruisce
il Command o cammina sul terreno e il click destro esegue il Verb preferito.
Il HUD occupa una regione permanente della Logical Resolution 426×240 invece di
sovrapporsi alla Scene; la proporzione esatta viene validata con un prototipo.

Il modello contestuale non rimane come Game Setting alternativo: la modifica è
incompatibile, introduce Fondale 2.0 e richiede la migrazione dei Game Project.
Character Switching e Inventory separati per Character non appartengono a
questa decisione e richiederanno una futura Engine Capability motivata da un
Game Project concreto.
