# National Tech Award Bangladesh

Website: https://techawardbd.com

This project was rebuilt from a production `dist` build into editable source code.
It uses React 18, Vite, Tailwind CSS, Firebase (Auth and Firestore), Framer Motion and lucide-react.

> Note: the source was recovered from minified code. Components, pages and most
> variables got meaningful names again. A few small helper variables inside
> functions may still have generic names (`items`, `data`, `index`, and so on).

## Getting started

```bash
npm install
npm run dev       # http://localhost:8080
npm run build     # production build in dist/
npm run preview   # preview the build locally
```

To deploy, upload everything inside `dist/` to your hosting (for example, cPanel `public_html`).
`public/.htaccess` is copied into `dist/` automatically, so the SPA routes
(`/about`, `/voting` and the rest) keep working.

## Folder structure

```
index.html                 SEO meta tags, schema.org data, fonts
public/                    .htaccess, robots.txt, sitemap.xml
src/
  main.jsx                 app entry point
  App.jsx                  all routes (/, /about, /voting, /admin ...)
  index.css                Tailwind, theme colors, custom CSS (.text-gradient-gold, .glass, .form-input ...)
  data/constants.js        categories, sub-categories, districts, nomination fee,
                           contact email or phone, image links, Terms and Privacy text
  lib/
    firebase.js            Firebase config, auth, db, super admin email
    email.js               email sending through Google Apps Script
    paymently.js           payment gateway (Paymently / UddoktaPay) API
    metaPixel.js           Facebook Meta Pixel helpers
    utils.js               cn() and Google Drive image link helper
  hooks/                   useSiteSettings, useCollection, useImageTone
  components/
    Layout.jsx             navbar, mobile menu, footer, social links
    SectionTitle.jsx       section heading
    FlashbackSection.jsx   "Moments Through the Years" photo grid
    MetaPixel.js           loads the pixel and tracks page views
    ui/                    shadcn/ui components (button, calendar, popover)
  pages/
    Home.jsx               homepage (hero, countdown, categories, awards, winners, gallery, sponsors)
    About.jsx              About Us page (text can also be changed from Firestore settings/about)
    Categories.jsx         category list and search
    Contact.jsx            contact page
    Winners.jsx            winners page (season-wise)
    Voting.jsx             public voting (Google login)
    Nomination.jsx         nomination form, payment, confirmation PDF, re-payment page
    Login.jsx              login for nominees and admins
    NomineeDashboard.jsx   nominee dashboard (video links, deadline, support chat)
    admin/                 admin panel and every tab (Overview, Nominees, Deadlines,
                           Winners, Sponsors, Gallery, Support, Settings, Admin Users)
```

## Common edits

| What to change | File |
| --- | --- |
| Nomination fee (1550 BDT) | `src/data/constants.js` → `NOMINATION_FEE` |
| Categories or sub-categories | `src/data/constants.js` → `CATEGORIES` |
| Contact email, WhatsApp number | `src/data/constants.js` → `CONTACT_EMAIL`, `WHATSAPP_NUMBER` |
| Hero banner image | `src/data/constants.js` → `HERO_IMAGE_DESKTOP`, `HERO_IMAGE_MOBILE` |
| Terms and Conditions or Privacy Policy | `src/data/constants.js` → `TERMS_TEXT`, `PRIVACY_TEXT` |
| Navbar menu, footer links | `src/components/Layout.jsx` → `NAV_LINKS`, `QUICK_LINKS`, `SOCIAL_LINKS` |
| Theme colors | `src/index.css` (`:root` variables) |
| Firebase project | `src/lib/firebase.js` |
| Super admin email | `src/lib/firebase.js` → `SUPER_ADMIN_EMAIL` |
| Payment gateway API key | `src/lib/paymently.js` |
| SEO title or description | `index.html` |

Event date, time, venue, nomination open or closed, and the Apps Script URL can also be changed from **Admin → Settings**.
