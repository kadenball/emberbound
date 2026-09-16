# Browser playtest deployment

Hosted build: https://brightmoot.com/media/emberbound/play/
Invitation and feedback: https://brightmoot.com/media/emberbound/playtest.html

Build with `npm run build -- --base=/media/emberbound/play/`. Copy only the resulting dist contents into Brightmoot's deploy/public-media/emberbound/play directory. Generated game files are not committed to the Brightmoot source repository. Caddy already serves /media from that directory; no app restart is needed.

Run `node scripts/check-built-game.mjs URL` against a static server at that path before publishing. Optional CHROMIUM_PATH selects an installed browser. The check boots the actual production bundle, enters combat at desktop and mobile landscape sizes, and rejects asset HTTP errors and audio URLs outside the deployment directory.

The production build previously deadlocked at top-level readSave(): Capacitor's lazy Preferences module imported WebPlugin from the still-awaiting entry chunk. vite.config.ts separates the Capacitor runtime to break that cycle. The old build failed the smoke check waiting for Adventure; the fixed build reaches combat. Audio, character art, and the in-game emblem now honor Vite BASE_URL. Default / builds remain supported for native packaging and local development.

This is the v0.31 prototype, not a native release or proof of gameplay quality. Local browser saves are not uploaded. Test the game and mobile interactions on actual devices before making broader compatibility claims.
