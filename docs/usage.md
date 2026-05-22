# xPoster Usage Guide

This guide is written for someone who has never loaded a Chrome extension before.

## 1. Install xPoster

1. Download or clone xPoster.
2. Open Chrome.
3. Type `chrome://extensions` in the address bar.
4. Turn on **Developer mode** in the top right.
5. Click **Load unpacked**.
6. Pick the xPoster folder. It is the folder with `manifest.json`.

If Chrome lists xPoster after that, installation worked.

## 2. Prepare Your Markdown

Use any Markdown editor. A simple draft can look like this:

```markdown
---
title: My first X Article
---

# This heading becomes body text if the title above exists

Here is a paragraph with **bold text** and [a link](https://example.com).

- One point
- Another point

![image alt](image.png)
```

The safest starting point is the included example file:

```text
fixtures/live-x-smoke.md
```

## 3. Open The X Article Editor

1. Sign in to X in Chrome.
2. Open `https://x.com/compose/articles`.
3. Create a new article draft or open the draft you want to fill.

xPoster needs an open X Article tab because it fills the editor that is already on the page.

## 4. Open xPoster

Open the xPoster side panel from the Chrome toolbar or side panel button.

You should see:

- A Markdown draft box.
- A preview tab.
- A **Check article** button.
- An **Import** button.
- A checklist showing what is ready and what is missing.

## 5. Load Your Draft

Choose one:

- Paste Markdown into the draft box.
- Click the file button and select a `.md` file.
- Click **Example** to load the built-in demo draft.

After the draft is loaded, xPoster previews the structure and shows warnings for anything it cannot handle yet.

## 6. Check Before Import

Click **Check article**.

xPoster checks:

- Is the active tab X or Twitter?
- Is it an X Articles page?
- Can the content script talk to the page?
- Can xPoster find the Draft.js editor?
- Can xPoster find X's media upload handler?
- Does the editor already contain text?
- Are local image folder permissions ready?

If something is missing, follow the next action shown near the top of the side panel.

## 7. Import

Click **Import** only after the checklist is ready.

xPoster will:

1. Parse the Markdown.
2. Prepare images and rendered table images.
3. Paste supported text into the X editor.
4. Replace xPoster markers with images, tables, tweets, code blocks, or dividers.
5. Save a result record in the side panel.

## 8. Review In X

Before publishing, inspect the article in X:

- Title is correct.
- Text formatting looks right.
- Images are present.
- Tables are readable.
- Tweet embeds are correct.
- Code blocks and dividers look acceptable.
- No `__XPOSTER_` marker text remains.

xPoster never clicks Publish. You publish manually only after review.

## Troubleshooting

### Chrome says the extension is unpacked

That is normal. You installed it directly from source instead of the Chrome Web Store.

### Check article says the editor is missing

Open or create an actual X Article draft. The Articles list page is not enough for import.

### Chrome asks for image website permission

Click allow if you trust the image host. xPoster needs the file bytes so it can upload the image into X.

### Local images do not import

Choose the folder that contains those image files. Relative paths like `./images/photo.png` only work after xPoster can read the matching local folder.

### Import partially worked

Do not publish yet. Use the saved record and diagnostics popup to understand which step failed, then retry from a clean X Article draft.
