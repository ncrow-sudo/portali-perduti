# Portali Perduti: mettere il gioco online

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/ncrow-sudo/portali-perduti)

Il modo più veloce: premi il pulsante qui sopra, entra su Render con GitHub e premi **Apply**.

Con questi file il gioco ha un indirizzo suo (per esempio `https://portali-perduti.onrender.com`).
Chi lo apre gioca subito, senza account. Il gioco è in italiano, inglese e danese: la lingua si sceglie nella schermata iniziale (all'inizio segue quella del telefono). Per giocare insieme: uno crea la stanza, appare un QR code, gli amici lo inquadrano con il telefono ed entrano direttamente nella stessa partita.

Servono due account gratuiti: **GitHub** (dove stanno i file) e **Render** (che fa girare il gioco). Tempo: circa 15 minuti, una volta sola.

## Cosa c'è nella cartella

- `server.js`: il piccolo server delle stanze.
- `package.json`: dice a Render come avviarlo.
- `public/index.html`: il gioco.

## Passo 1: GitHub

1. Vai su **github.com** e premi **Sign up**. Crea l'account e conferma l'email.
2. In alto a destra premi **+**, poi **New repository**.
3. In **Repository name** scrivi `portali-perduti`. Lascia **Public** oppure scegli **Private**: funzionano tutti e due. Premi **Create repository**.
4. Nella pagina che si apre premi il link **uploading an existing file**.
5. Apri la cartella che hai estratto dallo zip e trascina nella pagina **server.js**, **package.json** e la cartella **public** (con dentro index.html).
6. In fondo premi **Commit changes**.

## Passo 2: Render

1. Vai su **render.com** e premi **Get Started**, poi **GitHub** per entrare con l'account appena creato. Autorizza Render.
2. Premi **New +** (o **Add new**), poi **Web Service**.
3. Scegli il repository **portali-perduti** e premi **Connect**. Se non lo vedi, premi **Configure GitHub** e dai accesso al repository.
4. Compila così:
   - **Name**: `portali-perduti` (diventa parte dell'indirizzo).
   - **Region**: **Frankfurt (EU Central)**.
   - **Runtime / Language**: **Node**.
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Instance Type**: **Free**.
5. Premi **Deploy Web Service** (o **Create Web Service**). Aspetta 2-3 minuti finché compare **Live**.
6. In alto trovi l'indirizzo, tipo `https://portali-perduti.onrender.com`. Quello è il gioco.

## Come si gioca insieme

1. Apri l'indirizzo, premi **Gioca con amici**, crea o carica il personaggio.
2. Premi **Crea una stanza**: compare il QR code (lo riapri quando vuoi con **Invita (QR)** o toccando la scritta della stanza).
3. Gli amici inquadrano il QR con la fotocamera del telefono, creano il loro personaggio e finiscono nella stessa stanza, all'accampamento.
4. Chi ha creato la stanza (l'admin) entra nel portale e sceglie la strada sulla mappa: tutti partono insieme.

## Da sapere

- **Piano gratuito di Render**: se per 15 minuti nessuno gioca, il server si addormenta. La prima persona che apre il gioco aspetta circa un minuto, poi va veloce. Il piano **Starter** (circa 7 dollari al mese) lo tiene sempre sveglio.
- **Aggiornamenti**: chiedi le modifiche a Claude indicando il repository `ncrow-sudo/portali-perduti`. Claude cambia i sorgenti in `src/`, ricostruisce il gioco e carica tutto su GitHub; Render lo rimette online da solo in 2-3 minuti. I salvataggi dei giocatori restano sul loro telefono.
- **Bambini e privacy**: non ci sono account, chat o dati personali. Ognuno sceglie solo un nome (meglio un soprannome). Le stanze si vedono solo con il codice o il QR, nessuno vede chi altro è online, e il server non salva niente: quando tutti escono, la stanza sparisce. I salvataggi del personaggio restano sul telefono di ciascuno.
- **Scuola**: verificate prima le regole della scuola sull'uso dei telefoni e della rete Wi-Fi. Se la rete della scuola blocca il sito, il gioco funziona anche con i dati del telefono.
