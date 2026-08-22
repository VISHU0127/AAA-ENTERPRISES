# AAA Internationals Website

Multi-page B2B agricultural export website for AAA Internationals.

## Easiest way to open it

1. Open the `codes` folder.
2. Double-click `index.html`.

The homepage will open in your browser. Use the navigation menu to view the other pages.

## Recommended way to test locally

Opening the file directly is enough for a quick preview. For the most reliable local preview, use Python's built-in web server:

```bash
cd codes
python3 -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000) in a browser. Keep the terminal window open while viewing the site. Press `Control + C` in that terminal to stop the server.

If `python3` is not available, install Python from [python.org](https://www.python.org/downloads/) or open the folder in VS Code and use the **Live Server** extension.

## Project contents

- `index.html` - Homepage
- `products.html` - Product catalogue
- `about.html` - About the company
- `why_choose_us.html` - Company strengths and sourcing information
- `contact.html` - Contact and quote request page
- Product detail pages - Individual product information
- `styles.css` - Website styling
- `script.js` - Navigation and interactive behavior
- `assets/` - Logos, product images, and media

## Important before launch

- The contact form is frontend-only. Connect it to an email, CRM, or API endpoint before production.
- Review all contact details, product information, pricing, and legal content before publishing.

## Design

The visual language uses gold, cream, black, and deep agricultural green, with Cormorant Garamond and DM Sans typography.
