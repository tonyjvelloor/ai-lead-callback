# Running Dograh locally (free)

Needs about 15 GB free on the internal disk and a container runtime (Colima is already installed via Homebrew).

```bash
colima start --cpu 4 --memory 6 --disk 30
mkdir -p ~/dograh && cd ~/dograh
curl -o docker-compose.yaml https://raw.githubusercontent.com/dograh-hq/dograh/main/docker-compose.yaml
curl -o start_docker.sh https://raw.githubusercontent.com/dograh-hq/dograh/main/scripts/start_docker.sh
chmod +x start_docker.sh && ./start_docker.sh
```

First start downloads images (2-3 min). UI: http://localhost:3010. A Cloudflare tunnel is started for inbound telephony webhooks.
After creating your account set `ENABLE_SIGNUP=false` in `.env`.

## Provider keys (add in the Dograh UI, all optional for first test)
- STT/TTS: Sarvam (Indian languages)
- LLM: Gemini Flash
- Telephony: Plivo or Vobiz (needs KYC; use the browser web-call until then)

## Test order
1. Build the flow from `docs/call-script.md`.
2. Run a browser web-call in English, then Hinglish, Malayalam, Tamil. Judge the voices before anything else.
3. Only then add a phone number and call your own phone.
4. Point `LEAD_WEBHOOK_URL` (Vercel env var) at the engine's trigger so form leads get called.
