# Birthday Website (Dashboard only)

A single-page Node.js (Express) birthday site: animated greeting, photo, wish, cake with candles, teddies, balloons, confetti and four colour themes. No password, no database, no extra pages.

## Run it

```bash
npm install
npm start
```
Open http://localhost:3001

## Edit the content (data/config.json)

- `name`, `title`, `wish` (typed out letter by letter on Home), `from`, `photo`
- `surprise`: the message that appears when she opens the gift
- `scratch`: `emoji`, `title`, `text` shown under the scratch card
- `reasons`: the list on the Reasons page (each has `e` emoji, `t` short title, `m` message). Add, remove or reword freely.
- `public/img/her.jpg`: add her photo here. Until it exists, a placeholder is shown.

## Pages (bottom tab bar, built for phones)

- **Home**: typewriter wish, cake, gift, balloons, party popper, song
- **Reasons**: tap or swipe cards of reasons she is awesome (random order)
- **Scratch**: scratch-off card with the prize underneath
- **Wish**: type a wish, a lantern floats up, a star lands in the jar (wishes are saved only in her phone's browser)

## Animations and things to try

Bunting flags, twinkling stars, rising balloons, a mouse sparkle trail, confetti, party poppers, fireworks (click anywhere), poppable teddy balloons, candles that blow out with smoke and a wish, an openable gift (text from `surprise` in `data/config.json`) and a "Play the song" button (Happy Birthday melody, synthesised in the browser).

## Deploy to Vercel

Push the folder to GitHub and import it on vercel.com, or run `vercel --prod` with the CLI. No environment variables needed.

## Themes

Aurora, Sunset, Ocean, Citrus. Switch with the dots in the top bar; the choice is remembered. To add one, copy a `[data-theme=...]` block at the top of `public/style.css`, change the colours, and add a dot in `index.html` plus a matching `.themes [data-t=...]` rule.
