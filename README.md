# AIDEL TOONS Studio — starter project

A browser-based cartoon performance studio with a procedural Three.js stage, three original placeholder characters (Kiko, Milo and Teddy), lyric editing, audio upload, simple beat-reactive mouth/body animation, and WebM recording.

## Project structure

- `index.html`, `styles.css`, `app.js`: static frontend (GitHub Pages compatible)
- `server.js`, `package.json`: small Node/Express backend for secure AI workflow requests
- `.env.example`: backend environment variable template

## What works in this starter

1. Interactive 3D stage rendered with Three.js.
2. Three original placeholder characters built from 3D shapes.
3. Character selection and stage background choices.
4. Lyrics editor and singer tag insertion.
5. Audio upload and playback.
6. Simple audio-reactive mouth and dance animation.
7. Browser recording to WebM (Chrome/Edge desktop support is generally best).

## Important limitations

- The characters are procedural prototypes, not production-ready rigged movie-quality models. Replace them later with original rigged GLB models and facial blendshapes for professional animation.
- The built-in mouth movement reacts to overall audio energy. It is not phoneme-accurate lip-sync.
- The browser renderer exports WebM, not guaranteed MP4. Convert the result to MP4 with a video editor such as DaVinci Resolve or another trusted editor.
- AI song/video buttons are backend integration hooks. They do not generate content until you connect your own AI provider workflow endpoints. This project deliberately does not include fake API credentials or expose private keys.
- Use only original or properly licensed character assets, music, voices and AI outputs. Review each provider's commercial-use terms before monetizing videos.

## Deploy the website on GitHub Pages

1. Create a GitHub repository named `aidel-toons-studio`.
2. Upload `index.html`, `styles.css`, and `app.js` to the repository root.
3. Open the repository's **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`, then Save.
6. Wait for GitHub Pages to publish. Your site URL will look like `https://YOUR-USERNAME.github.io/aidel-toons-studio/`.

The frontend loads Three.js from jsDelivr, so the visitor needs an internet connection.

## Deploy the backend

GitHub Pages cannot run Node.js server code. Deploy the backend separately on a Node hosting service such as Render:

1. Push the whole project (including `server.js` and `package.json`) to GitHub.
2. Create a new **Web Service** on your Node hosting provider and connect the repository.
3. Set the root directory to the project folder if needed.
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables from `.env.example`.
7. Set `ALLOWED_ORIGIN` to your actual GitHub Pages origin, e.g. `https://YOUR-USERNAME.github.io` (no trailing slash).
8. Deploy and copy the backend service URL, e.g. `https://your-service.onrender.com`.

## Connect the frontend to your backend

Open the deployed website, then open the browser developer console and run:

```js
localStorage.setItem("aidelBackend", "https://YOUR-SERVICE.onrender.com");
location.reload();
```

Replace the URL with your real backend URL. This setting is stored only in that browser. For a polished public release, replace this manual step with a small Settings field in the UI.

## Connect AI generation

The backend accepts two webhook URLs:

- `AI_MUSIC_WEBHOOK`: a workflow you control that accepts the song title, lyrics, character names and voice directions.
- `AI_VIDEO_WEBHOOK`: a workflow you control that accepts the video title, lyrics, visual style and character names.

A workflow can be built with an automation platform or a small private service that calls your chosen AI music/video provider. Configure provider API keys only in the private workflow/backend environment, never in frontend code or a public GitHub repository.

Expected request JSON for music:
```json
{
  "title": "The World Is Our Playground",
  "lyrics": "[KIKO] ...",
  "characters": ["Kiko", "Milo", "Teddy"],
  "voiceDirections": {
    "Kiko": "bright youthful playful cartoon pop",
    "Milo": "smooth melodic mid-range pop",
    "Teddy": "warm deeper playful cartoon pop"
  }
}
```

Expected request JSON for video:
```json
{
  "title": "The World Is Our Playground",
  "lyrics": "[KIKO] ...",
  "style": "colourful stylized cinematic 3D cartoon",
  "characters": ["Kiko", "Milo", "Teddy"]
}
```

The webhook should return JSON containing a useful status message and, when available, the generated asset URL or job ID. The starter backend forwards the response to the browser.

## Security notes

- Do not commit `.env` files, provider keys, passwords or private webhook tokens.
- Do not use wildcard CORS (`*`) for a public production backend; set `ALLOWED_ORIGIN` to your exact website origin.
- Add authentication, rate limits, usage limits and input validation before opening paid generation endpoints to the public.
- Do not promise automatic MP4 rendering or professional lip-sync until those features are implemented and tested.
