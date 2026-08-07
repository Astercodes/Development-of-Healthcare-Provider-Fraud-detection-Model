# Placeholders and decisions — /about page

## No placeholders in the published content

Every fact on this page — degrees, institutions, dates, supervisors, the May 2024 start date
for the AARP work — is transcribed verbatim from your brief. Nothing was invented or filled in.

## Contact email: a discrepancy worth flagging

Your brief for this page gives the contact address as `ayeniayomide5@gmail.com` (no zero). The
email on file for this session is `ayeniayomide05@gmail.com` (with a zero). I published exactly
what you typed in the brief rather than silently "correcting" it to the on-file address, since I
can't tell from here which one is the typo. If `ayeniayomide5@gmail.com` isn't the address you
want live on the site, say the word and I'll swap it — it's one line in `content/about.json`.

## Two pre-existing dead anchors on the home page, out of scope for this page

While fixing the `#curricula` and `#about` footer links (same bug class as earlier
pages — a hand-authored anchor pointing nowhere until the real page existed), I noticed the home
page's hero and "Access" section both link to `#verification` / `#verify`, and neither id exists
anywhere in `index.html`. That predates this page and wasn't part of the `/about` brief, so I
left it alone rather than scope-creeping a fix in — flagging it here in case it's next.
