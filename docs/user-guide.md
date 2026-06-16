# User guide — editing your website

No coding knowledge needed. Everything you edit lives in **`index.html`**. Open it in
any text editor. Spots you should change are marked with comments like:

```html
<!-- EDIT: ... -->
```

## 1. Your name and tagline

Near the top of the About section:

```html
<h1>Your Name</h1>
<p class="tagline">PhD Student in NeuroAI · [University / Lab]</p>
<p class="tagline">Part-time AI & Innovation Consultant / Engineer</p>
```

Replace the text. Also change the `<title>` and the `<meta>` tags in the
`<head>` so search engines and link previews show the right info.

## 2. Photo

Save a square photo as `assets/img/avatar.jpg`. If you don't add one, the page
simply hides the image — nothing breaks.

## 3. Bio and research interests

Edit the two paragraphs and the interests line in the About section.

## 4. Publications

Each paper is one `<li class="pub">` block. Copy an existing one, paste it, edit the
fields. Put the newest paper first. Remove the `<li>` blocks you don't need.

```html
<li class="pub">
  <span class="pub-title">Paper title</span>
  <span class="pub-authors">Your Name, Coauthor</span>
  <span class="pub-venue">Venue, Year</span>
  <span class="pub-links"><a href="URL">PDF</a></span>
</li>
```

## 5. Consulting

Edit the paragraphs and the bullet list under the **Consulting** section to describe
what you offer. The "Get in touch" link reuses your email — update it there.

## 6. CV

- Edit the **Education** and **Experience** timelines (each entry is one `<li>`).
- Drop your CV PDF at `assets/files/cv.pdf` (or change the link's `href`).

## 7. Contact links

In the Contact section, replace every `href` with your real links. Delete any line
for a service you don't use.

## 8. Colours

Want different colours? Open `assets/css/style.css` and change the values at the very
top under `:root`. Dark mode is automatic and follows the visitor's system setting.

## Preview before publishing

```bash
python -m http.server 8000
```

Open `http://localhost:8000` in your browser. When happy, commit and push — GitHub
Pages updates within a minute or two.
