# CV Site

Interactive portfolio website featuring a real-time BTC/USDT trading simulator powered by live Binance market data.

## Architecture

```
Binance WebSocket  -->  binance-ingester  -->  Kafka  -->  trading-simulator  -->  PostgreSQL
                                                                  |
                                                            WebSocket (STOMP)
                                                                  |
                                                              frontend
```

| Component | Stack | Description |
|---|---|---|
| **binance-ingester** | Java 25, Spring Boot, Kafka | Streams live BTC/USDT trades from Binance |
| **trading-simulator** | Java 25, Spring Boot, JPA, WebSocket | REST API for trade execution and portfolio management |
| **frontend** | Angular 20, lightweight-charts, STOMP | Interactive trading UI with real-time charts |

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Java 25+ (Temurin)
- Maven 3.9+
- Node.js 20+

### 1. Start infrastructure

```bash
docker compose up -d
```

This starts PostgreSQL, Kafka, and Kafka UI.

### 2. Run backend services

```bash
# Terminal 1 - Binance Ingester
cd backend/binance-ingester
mvn spring-boot:run

# Terminal 2 - Trading Simulator
cd backend/trading-simulator
mvn spring-boot:run
```

### 3. Run frontend

```bash
cd frontend
npm ci
npm start
```

Open http://localhost:4200

## CI/CD

GitHub Actions builds and pushes Docker images to GHCR on push to `main`/`develop`. See [.github/workflows/build-and-push.yml](.github/workflows/build-and-push.yml).

Images are published to `ghcr.io/<owner>/cv-site/{binance-ingester,trading-simulator,frontend}`.

## Deployment

Production deployment is managed via GitOps with Flux CD. See the companion [cv-site-gitops](https://github.com/sebheuze/cv-site-gitops) repository.

## License

MIT
