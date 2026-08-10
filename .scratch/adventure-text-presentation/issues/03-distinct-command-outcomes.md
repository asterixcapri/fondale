# 03 — Esiti dei Command semanticamente distinti

**What to build:** Permettere a un `Command Case` di produrre una singola
reazione parlata come `Line` diretta oppure una `Command Response` neutra che
spiega l'esito. L'Author non deve più usare attributi di presentazione per
trasformare una risposta in dialogo o narrazione.

**Blocked by:** 02 — Line visivamente legata al Character.

**Status:** ready-for-human

- [x] Un `Command Case` può produrre direttamente una `Line` valida senza
  richiedere una `Sequence` composta da un solo passo.
- [x] Una `Command Response` contiene soltanto testo esplicativo non vuoto e
  non accetta speaker o modalità di presentazione.
- [x] La validazione impedisce a un `Command Case` di dichiarare più di un
  esito testuale fra `Line`, `Command Response` e `Sequence`, pur consentendo
  le Game Operations ammesse insieme all'esito scelto.
- [x] Il Player vede la `Command Response` in testo bianco dentro un pannello
  scuro, compatto e traslucido al margine inferiore.
- [x] L'esecuzione nasconde immediatamente il `Command Preview`; la risposta
  rispetta la preferenza di velocità del testo e può essere congedata con gli
  input di skip documentati.
- [x] Documentazione, consumer pubblici e Capri Example usano i nuovi esiti
  senza conservare speaker o presentazione nelle `Command Response`.
