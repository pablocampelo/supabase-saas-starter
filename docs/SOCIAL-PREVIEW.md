# Social preview

Xerv uses **one canonical social design** at `/opengraph-image` (1280 × 640 PNG).

The landing page metadata advertises this absolute image URL through both `og:image` and `twitter:image` with `summary_large_image`. Next.js derives the absolute URL from `NEXT_PUBLIC_SITE_URL`; ensure that environment variable points to the production domain.

## GitHub repository preview — separate setting

A link to `https://github.com/pablocampelo/xerv` gets its tags from GitHub, **not** from `supasaas-kit.vercel.app`. To use this same visual:

1. After production deploy, open `https://xerv.vercel.app/opengraph-image` in a browser and save the PNG.
2. Open `https://github.com/pablocampelo/xerv/settings`.
3. Under **Social preview**, choose **Edit → Upload an image** and select the downloaded PNG (GitHub accepts PNG/JPEG/GIF < 1 MB).
4. Recheck GitHub's own repository preview after the upload.

If a preview card on X or another platform still shows the previous image, the platform may be serving a cached card. Cards are not guaranteed to appear every time; this is determined by the receiving platform, not by the linked site.

Do not replace the social image with a screenshot containing GitHub repository statistics or simulated UI: the site and repository should use the same canonical visual.
