# i-damale.github.io — DevOps-themed portfolio site

This static site automatically fetches your public GitHub profile and repositories for the username `i-damale`. It is designed for GitHub Pages.

Files included:
- index.html
- assets/styles.css
- assets/app.js
- README.md

Quick local preview:
1. Serve locally (very simple):
   - Python 3: `python -m http.server 8000`
   - Open http://localhost:8000

How to create a ZIP locally:
- macOS / Linux:
  - From the project root: `zip -r i-damale-portfolio.zip .`
- Windows (PowerShell):
  - `Compress-Archive -Path * -DestinationPath i-damale-portfolio.zip`

How to push to your GitHub Pages repository (initial commit)
1. Clone/create locally or in an empty folder:
   git init
   git checkout -b main
   git add .
   git commit -m "Initial DevOps portfolio site"
   git remote add origin git@github.com:i-damale/i-damale.github.io.git
   git push -u origin main

   If you prefer HTTPS:
   git remote add origin https://github.com/i-damale/i-damale.github.io.git
   git push -u origin main

If your repository is empty and you want me to push these files, either:
- Create an initial branch (main) with a commit and then tell me to push a feature branch, or
- Grant a push permission and I can create an initial commit on your behalf (I will attempt this when you confirm).

Notes
- The site fetches data from the GitHub public API and can be rate-limited. For higher rate limits consider adding a server-side token or a small serverless function that proxies authenticated requests.
- To show pinned repos or richer metadata I can add GitHub GraphQL usage (requires auth token).
