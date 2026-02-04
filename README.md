# POS System

A complete Point of Sale system with Stripe payment integration, SMS payment links via Africa's Talking, and receipt generation.

## Features

- **Card Payments** - Process payments via Stripe PaymentIntents
- **SMS Payment Links** - Send payment links to customers via SMS
- **Receipt Generation** - Generate and deliver receipts (SMS, PDF)
- **Secure by Design** - Webhook signature verification, no card data storage
- **Transaction History** - Full transaction tracking and reporting
- **Refunds** - Full and partial refund support

## Tech Stack

- **Backend**: FastAPI (Python 3.11+)
- **Database**: PostgreSQL (SQLite for development)
- **ORM**: SQLAlchemy 2.0
- **Migrations**: Alembic
- **Payments**: Stripe API
- **SMS**: Africa's Talking
- **Caching**: Redis

## Quick Start

### Prerequisites

- Python 3.11+
- pip

### 1. Clone and Setup

```bash
# Clone the repository
git clone https://github.com/Markjohns1/pos.git
cd pos

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
# Copy example environment file
copy .env.example .env  # Windows
# cp .env.example .env  # macOS/Linux

# Edit .env and add your API keys:
# - STRIPE_SECRET_KEY
# - STRIPE_WEBHOOK_SECRET
# - AT_API_KEY (Africa's Talking)
```

### 3. Run the Server

```bash
# Development mode with auto-reload
uvicorn app.main:app --reload

# Server will start at http://localhost:8000
```

### 4. Access API Documentation

Open your browser to:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### Health Check
- `GET /api/v1/health` - Check API health

### Transactions
- `POST /api/v1/transactions/pay` - Create a payment
- `GET /api/v1/transactions` - List transactions
- `GET /api/v1/transactions/{id}` - Get transaction details
- `POST /api/v1/transactions/{id}/refund` - Refund a transaction

### Payment Links
- `POST /api/v1/payment-links` - Create payment link (+ SMS)
- `GET /api/v1/payment-links/{id}` - Get payment link status
- `POST /api/v1/payment-links/{id}/resend-sms` - Resend SMS

### Receipts
- `POST /api/v1/receipts` - Generate receipt
- `GET /api/v1/receipts/{id}` - Get receipt

### Webhooks
- `POST /api/v1/webhooks/stripe` - Stripe webhook handler

## Docker Setup

```bash
# Start all services (API, PostgreSQL, Redis)
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### With Stripe CLI (for webhook testing)

```bash
docker-compose --profile stripe up -d
```

## Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

## Project Structure

```
pos/
├── app/
│   ├── main.py           # FastAPI entry point
│   ├── config.py         # Configuration
│   ├── database.py       # Database connection
│   ├── dependencies.py   # FastAPI dependencies
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── routes/           # API endpoints
│   ├── services/         # Business logic
│   ├── utils/            # Helper functions
│   └── middleware/       # Middleware
├── alembic/              # Database migrations
├── tests/                # Test files
├── requirements.txt      # Python dependencies
├── Dockerfile            # Production container
├── docker-compose.yml    # Development environment
└── README.md
```

## Security Notes

**NEVER** commit your `.env` file  
**NEVER** store full card numbers - only last 4 digits  
**ALWAYS** verify Stripe webhook signatures  
**ALWAYS** use HTTPS in production

## License

MIT License
