# Ozuk — Railway deployment

This package contains the complete static website, including English, Russian,
and Uzbek locales, the Privacy Policy page, and all images.

## Deploy using GitHub

1. Create a GitHub repository and upload the contents of this folder.
   Dockerfile, Caddyfile, and dist/ must be at the repository root.
   Upload the extracted files, not the ZIP itself.
2. In Railway, choose New Project → Deploy from GitHub repo, then select the repository.
3. Deploy. Railway detects the Dockerfile automatically.
   Leave Root Directory at the repository root. Leave custom Build Command and
   Start Command empty. No database, volume, or secrets are needed.
4. Open the service → Settings → Networking → Public Networking → Generate Domain.
   Caddy listens on Railway's PORT variable, with 8080 as the fallback.
   If a target port is requested, use the service's PORT value (8080 by default).
5. For your own domain, add it in the same networking section and apply the DNS
   records Railway provides.

Subsequent pushes to the connected branch can automatically redeploy the website.

## Update content

- dist/index.html: landing page structure
- dist/privacy.html: privacy page structure
- dist/locale.js: translated website and privacy copy
- dist/style.css: layout and styling
- dist/app.js: animations and interactions
- dist/assets/: product and app images

Store download buttons remain placeholders, and the Privacy Policy is draft copy.
Update these when your final links and text are ready.

## Optional local Docker preview

    docker build -t ozuk-site .
    docker run --rm -p 8080:8080 -e PORT=8080 ozuk-site

Open http://localhost:8080. Railway handles public HTTPS.

## Documentation

- https://docs.railway.com/quick-start
- https://docs.railway.com/builds/dockerfiles
- https://docs.railway.com/networking/public-networking
