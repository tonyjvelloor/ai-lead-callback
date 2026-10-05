# AI Lead Callback

Landing page and lead intake for the AI calling product (The Brand Maniacs).

- `index.html` static landing page with the demo-request form
- `api/lead.js` Vercel function that validates a lead and forwards it to `LEAD_WEBHOOK_URL`

The calling engine (Dograh) runs separately; Vercel cannot host it. Point `LEAD_WEBHOOK_URL` at it once it is up.

## Deploy

Push to Git, import the repo in Vercel (Hobby is fine while testing), then add the domain `calleragent.thebrandmaniacs.online`.
Move off Hobby (non-commercial only) once you charge a client.
