# Landing Page Images

Place your landing page assets here. Use the subfolders below so the app can reference them consistently.

## Folder structure

| Folder | Purpose | Suggested files |
|--------|---------|-----------------|
| **hero/** | Header / hero section | Phone mockup (app on phone, transparent background), optional hero background |
| **app-stores/** | App download badges | `google-play.svg` (or .png), `apple-store.svg` (or .png) — small logos for “Download on the App Store” / “Get it on Google Play” |
| **partners/** | Partner logos strip | Partner logo images (e.g. `partner-1.png`, `partner-2.png`) — will scroll in a sliding line |
| **services/** | Services carousel | One image per service: `renting.png`, `buying.png`, `selling.png` (or .webp) for Renting houses, Buying houses, Selling homes |

## How to reference in code

Files in `public/` are served from the site root. Examples:

- `public/images/landing/hero/phone.png` → use path: **`/images/landing/hero/phone.png`**
- `public/images/landing/app-stores/google-play.png` → **`/images/landing/app-stores/google-play.png`**
- `public/images/landing/partners/partner-1.png` → **`/images/landing/partners/partner-1.png`**
- `public/images/landing/services/renting.png` → **`/images/landing/services/renting.png`**

## Tips

- Use **PNG** for the phone mockup if you need transparency; **WebP** or **PNG** for photos.
- Keep **app store** badges small (e.g. height 40–48px) so they fit under the hero text.
- **Partner** logos: similar height (e.g. 32–48px) for a even strip; SVG or PNG.
- **Services**: landscape or square images work well for the carousel (e.g. 400×300px or 600×400px).
