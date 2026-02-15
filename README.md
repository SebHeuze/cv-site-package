# CV Site - Docker Images

This repository contains the source code and build configuration for the CV Site application Docker images.

## Repository Structure

```
cv-site-package/
├── backend/
│   ├── binance-ingester/     # WebSocket client streaming Binance BTCUSDT trades
│   └── trading-simulator/    # REST API for trading simulator
├── frontend/                  # Angular web application
└── .github/
    └── workflows/
        └── build-and-push.yml # CI/CD pipeline
```

## Components

| Component | Description | Port | Tech Stack |
|-----------|-------------|------|------------|
| **binance-ingester** | Streams live Bitcoin trades from Binance via WebSocket and publishes to Kafka | 8080 | Java 25, Spring Boot, OkHttp3, Kafka |
| **trading-simulator** | REST API for portfolio management, trade execution, and simulation mechanics | 8080 | Java 25, Spring Boot, JPA, Kafka, WebSocket |
| **frontend** | Interactive trading simulator UI | 80 | Angular 20, lightweight-charts, STOMP/WebSocket |

## Prerequisites

### For Local Development
- **Java 21+** (Temurin recommended)
- **Maven 3.9+**
- **Node.js 20+**
- **npm** (comes with Node.js)
- **Docker** (for building images locally)

### For GitHub Actions
- A GitHub repository with Actions enabled
- Access to GitHub Container Registry (GHCR)

## Local Build

### Backend Services

```bash
# Binance Ingester
cd backend/binance-ingester
mvn clean package -DskipTests

# Trading Simulator
cd backend/trading-simulator
mvn clean package -DskipTests
```

### Frontend

```bash
cd frontend
npm ci
npm run build -- --configuration production
```

### Docker Images (Local)

```bash
# Binance Ingester
cd backend/binance-ingester
docker build -t binance-ingester:local .

# Trading Simulator
cd backend/trading-simulator
docker build -t trading-simulator:local .

# Frontend
cd frontend
docker build -t frontend:local .
```

## GitHub Actions

### Automatic Triggers

The workflow runs automatically when:
- **Push to `main` or `develop`** branches (if files changed in `backend/`, `frontend/`, or the workflow itself)
- **Pull request to `main`** branch

### Manual Trigger

1. Go to your repository on GitHub
2. Click **Actions** tab
3. Select **Build and Push Docker Images** workflow
4. Click **Run workflow**
5. Select the branch and click **Run workflow**

### GitHub Setup Required

#### 1. Enable GitHub Container Registry

GHCR is enabled by default for GitHub repositories. Images will be pushed to:
```
ghcr.io/<your-username>/cv-site/binance-ingester
ghcr.io/<your-username>/cv-site/trading-simulator
ghcr.io/<your-username>/cv-site/frontend
```

#### 2. Configure Package Visibility (Optional)

By default, packages inherit the repository visibility. To make images public:
1. Go to your profile > **Packages**
2. Select the package
3. Click **Package settings**
4. Under "Danger Zone", change visibility to **Public**

#### 3. Repository Permissions

The workflow uses `GITHUB_TOKEN` which is automatically provided. Ensure your workflow has write permissions:
1. Go to repository **Settings** > **Actions** > **General**
2. Under "Workflow permissions", select **Read and write permissions**
3. Save

### No Secrets Required

The workflow uses the built-in `GITHUB_TOKEN` secret which is automatically available. No additional secrets need to be configured.

## Environment Variables

### Build-time Variables

| Variable | Description | Set By |
|----------|-------------|--------|
| `GITHUB_TOKEN` | Authentication for GHCR | Automatic (GitHub Actions) |
| `REGISTRY` | Container registry URL | Workflow (`ghcr.io`) |
| `IMAGE_PREFIX` | Image name prefix | Workflow (`${{ github.repository_owner }}/cv-site`) |

### Runtime Variables (when deploying containers)

#### binance-ingester
| Variable | Description | Example |
|----------|-------------|---------|
| `KAFKA_BOOTSTRAP_SERVERS` | Kafka broker addresses | `kafka:9092` |
| `BINANCE_WS_URL` | Binance WebSocket endpoint | `wss://stream.binance.com:9443` |

#### trading-simulator
| Variable | Description | Example |
|----------|-------------|---------|
| `KAFKA_BOOTSTRAP_SERVERS` | Kafka broker addresses | `kafka:9092` |
| `SPRING_DATASOURCE_URL` | PostgreSQL connection URL | `jdbc:postgresql://postgres:5432/trading_db` |
| `SPRING_DATASOURCE_USERNAME` | Database username | `postgres` |
| `SPRING_DATASOURCE_PASSWORD` | Database password | `secret` |

#### frontend
| Variable | Description | Example |
|----------|-------------|---------|
| (none required) | Static files served by nginx | - |

## Image Tags

The workflow generates multiple tags for each image:

| Tag Pattern | Example | When Generated |
|-------------|---------|----------------|
| `<branch>` | `main`, `develop` | Push to branch |
| `pr-<number>` | `pr-42` | Pull request |
| `<version>` | `1.2.3` | Git tag (semver) |
| `<major>.<minor>` | `1.2` | Git tag (semver) |
| `<branch>-<sha>` | `main-a1b2c3d` | Every build |
| `latest` | `latest` | Push to default branch (main) |

## Pulling Images

```bash
# Latest from main branch
docker pull ghcr.io/<your-username>/cv-site/binance-ingester:latest
docker pull ghcr.io/<your-username>/cv-site/trading-simulator:latest
docker pull ghcr.io/<your-username>/cv-site/frontend:latest

# Specific version
docker pull ghcr.io/<your-username>/cv-site/frontend:1.0.0

# Specific commit
docker pull ghcr.io/<your-username>/cv-site/frontend:main-a1b2c3d
```

## Running Containers

```bash
# Frontend (standalone)
docker run -d -p 80:80 ghcr.io/<your-username>/cv-site/frontend:latest

# Backend services require Kafka and PostgreSQL
# See infrastructure requirements in runtime environment variables above
```

## Workflow Jobs

The workflow runs 3 parallel jobs:

1. **build-binance-ingester**: Builds Java app with Maven, creates Docker image
2. **build-trading-simulator**: Builds Java app with Maven, creates Docker image
3. **build-frontend**: Builds Angular app with npm, creates Docker image

Each job:
- Checks out code
- Sets up build environment (JDK 21 or Node.js 20)
- Builds the application
- Logs into GHCR
- Builds and pushes Docker image with appropriate tags

## Troubleshooting

### Build Failures

**Maven build fails:**
- Ensure `pom.xml` dependencies are available
- Check Java version compatibility

**npm build fails:**
- Run `npm ci` (not `npm install`) for clean installs
- Check Node.js version (requires 20+)

**Docker push fails:**
- Verify "Workflow permissions" are set to "Read and write"
- Check if GHCR is accessible for your account

### Image Pull Issues

**"denied: permission denied":**
- Package may be private; authenticate with `docker login ghcr.io`
- Or change package visibility to public

## License

Proprietary - All rights reserved
