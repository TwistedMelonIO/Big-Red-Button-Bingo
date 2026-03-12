#!/usr/bin/env bash
#
# Big Red Button Bingo — Setup Script
#
# This script checks for Docker and Docker Compose, helps you install them
# if missing, then builds and runs the application.
#
# Usage:
#   chmod +x setup.sh
#   ./setup.sh
#

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${RED}╔══════════════════════════════════════════╗${NC}"
echo -e "${RED}║     Big Red Button Bingo — Setup         ║${NC}"
echo -e "${RED}╚══════════════════════════════════════════╝${NC}"
echo ""

# ---------- Detect OS ----------
OS="unknown"
case "$(uname -s)" in
    Darwin*)  OS="mac";;
    Linux*)   OS="linux";;
    MINGW*|MSYS*|CYGWIN*)  OS="windows";;
esac

echo -e "${BLUE}Detected OS:${NC} $(uname -s) (${OS})"
echo ""

# ---------- Check for Docker ----------
check_docker() {
    if command -v docker &> /dev/null; then
        DOCKER_VERSION=$(docker --version 2>/dev/null)
        echo -e "${GREEN}[OK]${NC} Docker is installed: ${DOCKER_VERSION}"
        return 0
    else
        echo -e "${RED}[MISSING]${NC} Docker is not installed."
        return 1
    fi
}

# ---------- Check for Docker Compose ----------
check_compose() {
    if docker compose version &> /dev/null 2>&1; then
        COMPOSE_VERSION=$(docker compose version 2>/dev/null)
        echo -e "${GREEN}[OK]${NC} Docker Compose is available: ${COMPOSE_VERSION}"
        return 0
    elif command -v docker-compose &> /dev/null; then
        COMPOSE_VERSION=$(docker-compose --version 2>/dev/null)
        echo -e "${GREEN}[OK]${NC} Docker Compose is available: ${COMPOSE_VERSION}"
        return 0
    else
        echo -e "${RED}[MISSING]${NC} Docker Compose is not available."
        return 1
    fi
}

# ---------- Check Docker is running ----------
check_docker_running() {
    if docker info &> /dev/null 2>&1; then
        echo -e "${GREEN}[OK]${NC} Docker daemon is running."
        return 0
    else
        echo -e "${YELLOW}[WARN]${NC} Docker is installed but not running."
        echo ""
        echo "    Please start Docker Desktop (or the Docker daemon) and re-run this script."
        echo ""
        return 1
    fi
}

# ---------- Install guidance ----------
install_docker() {
    echo ""
    echo -e "${YELLOW}To install Docker:${NC}"
    echo ""

    case "$OS" in
        mac)
            echo "  Option 1 (recommended): Download Docker Desktop for Mac"
            echo "    https://www.docker.com/products/docker-desktop/"
            echo ""
            echo "  Option 2: Install via Homebrew"
            echo "    brew install --cask docker"
            echo ""
            ;;
        linux)
            echo "  Option 1 (recommended): Use the official install script"
            echo "    curl -fsSL https://get.docker.com | sh"
            echo "    sudo usermod -aG docker \$USER"
            echo "    (Log out and back in after adding yourself to the docker group)"
            echo ""
            echo "  Option 2: Follow the official docs for your distro"
            echo "    https://docs.docker.com/engine/install/"
            echo ""
            ;;
        windows)
            echo "  Download Docker Desktop for Windows:"
            echo "    https://www.docker.com/products/docker-desktop/"
            echo ""
            echo "  Note: You may need to enable WSL2 or Hyper-V."
            echo ""
            ;;
        *)
            echo "  Visit: https://docs.docker.com/get-docker/"
            echo ""
            ;;
    esac

    echo "After installing Docker, re-run this script:"
    echo "  ./setup.sh"
    echo ""
}

# ---------- Main ----------

DOCKER_OK=true
COMPOSE_OK=true

check_docker  || DOCKER_OK=false
check_compose || COMPOSE_OK=false

if [ "$DOCKER_OK" = false ]; then
    install_docker
    exit 1
fi

check_docker_running || exit 1

if [ "$COMPOSE_OK" = false ]; then
    echo ""
    echo -e "${RED}Docker Compose is required but not found.${NC}"
    echo "Docker Compose is included with Docker Desktop. Make sure you have a recent version."
    echo ""
    exit 1
fi

echo ""
echo -e "${BLUE}All dependencies found. Building and starting the application...${NC}"
echo ""

# ---------- Copy .env if it doesn't exist ----------
if [ ! -f .env ]; then
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}[OK]${NC} Created .env from .env.example"
        echo -e "${YELLOW}     Edit .env to set QLAB_HOST to your QLab machine's IP address.${NC}"
        echo ""
    fi
fi

# ---------- Build and run ----------
echo -e "${BLUE}Building Docker image (this may take a few minutes the first time)...${NC}"
echo ""

docker compose up -d --build

echo ""
echo -e "${GREEN}╔══════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          Setup Complete!                 ║${NC}"
echo -e "${GREEN}╚══════════════════════════════════════════╝${NC}"
echo ""
echo -e "  Open your browser to: ${BLUE}http://localhost:3000${NC}"
echo ""
echo -e "  Useful commands:"
echo -e "    ${YELLOW}docker compose logs -f${NC}        — View live logs"
echo -e "    ${YELLOW}docker compose down${NC}           — Stop the application"
echo -e "    ${YELLOW}docker compose up -d${NC}          — Start again"
echo -e "    ${YELLOW}docker compose up -d --build${NC}  — Rebuild after code changes"
echo ""
