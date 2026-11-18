# sahilsayani.me

Personal portfolio for Sahil Sayani. It's a static HTML/CSS/JS site with no build step, served by GitHub Pages.

## Local preview

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Custom domain (Namecheap → GitHub Pages)

In Namecheap, go to **Domain List → sahilsayani.me → Manage → Advanced DNS**. Delete the default parking records (the CNAME `www` → parkingpage and the URL Redirect `@`), then add:

| Type  | Host | Value                   |
|-------|------|-------------------------|
| A     | @    | 185.199.108.153         |
| A     | @    | 185.199.109.153         |
| A     | @    | 185.199.110.153         |
| A     | @    | 185.199.111.153         |
| CNAME | www  | sahilsayani.github.io.  |

Next, open **GitHub repo → Settings → Pages**, check that the custom domain shows `sahilsayani.me`, and tick **Enforce HTTPS** once the certificate is issued. DNS changes can take up to a few hours to propagate.

## Photo

See `assets/README.md`.
