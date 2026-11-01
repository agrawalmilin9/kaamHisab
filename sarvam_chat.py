import os
from pathlib import Path

from sarvamai import SarvamAI
from sarvamai.core.api_error import ApiError


def load_env_file() -> None:
    for line in Path(".env").read_text().splitlines():
        key, separator, value = line.partition("=")
        if separator and key.strip() == "SARVAM_API_KEY":
            os.environ.setdefault(key.strip(), value.strip().strip('"\''))


load_env_file()
api_key = os.environ.get("SARVAM_API_KEY")
if not api_key:
    raise SystemExit("Paste your Sarvam API key into .env first.")

client = SarvamAI(api_subscription_key=api_key)
try:
    response = client.chat.completions(
        messages=[{"role": "user", "content": "Reply with: Sarvam API is working."}],
        model="sarvam-105b-conversations",
    )
    print(response.choices[0].message.content)
except ApiError as error:
    print(f"Sarvam API request failed ({error.status_code}): {error.body}")
    raise SystemExit(1)
