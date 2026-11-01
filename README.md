# KaamHisab – Your Daily Work & Payment Tracker

**काम हिसाब | Track Your Work. Calculate Your Earnings. Manage Your Payments.**

KaamHisab is a multilingual work and payment tracking application designed for daily-wage workers, contractors, and labourers. It helps workers record their daily work using voice or text, calculate earnings, track payments, and monitor pending dues — all in one place.

## Problem Statement

Many daily-wage workers maintain their work and payment records manually or depend on contractors to remember their working hours and payments. This can lead to calculation errors, forgotten work records, and confusion about pending wages.

KaamHisab provides a simple digital ledger that makes work and payment tracking easier and more transparent.

## Key Features

### 1. Worker Profile
- Store worker name and mobile number.
- Select trade or work category.
- Set daily wage, shift hours, and overtime rate.
- Add contractor and worksite details.

### 2. Voice & Text Work Entry
- Record daily work using voice or text.
- Supports Hindi, Marathi, Hinglish, and English input.
- Uses browser speech recognition where supported.
- Extracts work details such as date, hours, wage, and overtime.
- Review and edit extracted details before saving.

### 3. AI-Powered Work Understanding
- Integrates with **Sarvam AI** for multilingual text understanding.
- Uses the `sarvam-105b-conversations` model.
- Helps interpret natural-language work descriptions.
- Includes a heuristic fallback when AI services are unavailable.

### 4. Automatic Wage Calculation
- Calculates daily earnings.
- Calculates overtime payments.
- Tracks total working hours.
- Helps reduce manual calculation errors.

### 5. Payment Tracking
- Record payments through:
  - Cash
  - UPI
  - Bank transfer
- Track total received amount.
- Calculate pending payments automatically.

### 6. Dashboard
- Total working days.
- Total working hours.
- Total earnings.
- Amount received.
- Pending balance.

### 7. WhatsApp Ledger
- Generate a work and payment summary.
- Copy or share the ledger through WhatsApp.

### 8. Multilingual Experience
- Hindi and English interface options.
- Browser text-to-speech support for spoken output.

### 9. Data Persistence
- Stores application data in browser localStorage.
- Data remains available after refreshing the page in the same browser.

## Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend UI |
| TypeScript | Type safety |
| Vite | Development and build |
| Node.js | Backend runtime |
| Express | Backend API |
| Sarvam AI | Multilingual AI processing |
| Browser Speech API | Voice input and speech output |
| localStorage | Local data persistence |

## Project Structure

```text
kaamHisab/
├── src/
│   ├── components/
│   ├── ...
├── server.ts
├── sarvam_chat.py
├── package.json
├── package-lock.json
├── bun.lock
├── tsconfig.json
├── vite.config.ts
├── .env.example
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js and npm
- Python 3.12 or compatible version (for the standalone Sarvam test script)
- Sarvam AI API key

### 1. Clone the repository

```bash
git clone https://github.com/agrawalmilin9/kaamHisab.git
cd kaamHisab
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root.

```env
SARVAM_API_KEY=your_sarvam_api_key
```

Never commit your actual `.env` file or expose your API key.

### 4. Start the application

```bash
node_modules/.bin/tsx server.ts
```

Open:

```text
http://localhost:3000
```

### 5. Test Sarvam AI separately

Install the Python SDK:

```bash
pip install sarvamai
```

Run:

```bash
python sarvam_chat.py
```

The script tests the Sarvam chat API using the configured environment variable.

## Environment Variables

| Variable | Description |
|---|---|
| `SARVAM_API_KEY` | API key used for Sarvam AI authentication |

## Current Limitations

- Application data is stored locally in the browser; it is not synchronized across devices.
- Live microphone transcription depends on browser support and has not been fully verified.
- Sarvam chat API has been tested successfully, but live voice transcription and text-to-speech integrations are not yet verified.
- A backend database and user authentication are not currently implemented.

## Future Improvements

- Cloud database and secure user authentication.
- Synchronization across multiple devices.
- Complete voice-to-text integration using Sarvam Saaras.
- Text-to-speech integration using Sarvam Bulbul.
- Export work and payment records as PDF or Excel.
- Contractor dashboard and worker management.
- Offline support and improved mobile experience.

## Security

- API keys are stored in environment variables.
- `.env` is excluded from Git using `.gitignore`.
- Do not expose API credentials in frontend code or public repositories.

## Contributing

Contributions, suggestions, and bug reports are welcome.

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Submit a pull request.

## License

This project is currently available for hackathon demonstration and development. Add a license before distributing it for reuse.

---

**KaamHisab – Every Workday Counts. Every Rupee Matters.**

*Built to make daily work and wage tracking simpler, smarter, and more transparent.*
