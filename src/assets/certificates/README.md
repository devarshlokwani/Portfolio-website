# Certificate files

Each row in `src/data/certificates.json` looks for files named after its `id`.
Nothing else needs editing, and an id with no file simply renders without a
preview rather than showing an empty frame.

    aws-cloud-practitioner-essentials.pdf   <- what opens when it is clicked
    aws-cloud-practitioner-essentials.png   <- what the card shows

## Why both

The PDF is the real document, so that is what a click opens. The PNG is a
render of its first page, used for the preview.

The wall puts ten certificates on screen at once, and ten PDFs there means ten
instances of the browser's own PDF viewer. That was measured: most of them
never painted at all, leaving grey rectangles where the certificates should be.
An image has none of that cost.

Either file works alone. A row with only a PDF previews in an `<object>`, which
is fine in the quick view where one is open at a time.

## Regenerating the PNGs

They were rendered from the PDFs with `pdfjs-dist` plus `@napi-rs/canvas` at
1100px wide. If you add or replace a PDF, render its first page to a PNG of the
same basename at a similar width.

## logos/

Issuer logos, named after the issuer with everything non-alphanumeric turned
into a dash. These override the brand marks built into `certificateData.ts`,
and they are the only way to give an issuer a logo where react-icons has none.

    logos/citi.png
    logos/deloitte-australia.png
    logos/lloyds-banking-group.png
    logos/cbre.png

All eight were cropped out of the certificates themselves, so they are black
ink on transparency, whichever way round they started: LangChain's is white on
navy on its own certificate and was inverted on the way in. `IssuerLine` flips
them back for the dark theme through the `--logo-filter` token in `theme.css`,
which means **a logo added here has to be black on transparency too**, or it
will invert into something wrong. A full-colour logo needs that filter skipped.

These are wordmarks carrying the issuer's name, so the name is not printed
beside them; it stays in the image's alt text. A symbol-only logo would need
`IssuerLine` changed to show the name again.

The same file is what the cursor turns into over that certificate: hovering one
swaps the arrow for a "VIEW MORE" badge with this logo in the middle, so each
card carries its own issuer's mark.

## logos/marks/

The badge's centre is a circle about sixty pixels across, so a wordmark much
wider than it is tall shrinks to a fraction of that height inside it. A square
symbol dropped in here is used for the badge instead, while the wordmark keeps
its place on the card. Named the same way as the wordmarks.

    logos/marks/anthropic-education.png   <- the Claude mark

Anthropic is the only one so far. LangChain's wordmark is the next widest at
roughly eight to one, so it reads small in the badge; a square LangChain symbol
here would fix it the same way.
