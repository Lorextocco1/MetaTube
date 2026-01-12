#!/bin/bash

# Interrompi immediatamente lo script se un comando fallisce
set -e

echo "=================================================="
echo "🚀 NEBULA PLAYER - Inizio procedura di Build"
echo "=================================================="

# 1. Pulizia approfondita per rimuovere residui del vecchio progetto
echo "🧹 Pulizia installazioni e build precedenti..."
rm -rf dist dist_electron node_modules package-lock.json

# 2. Installazione delle dipendenze con flag per compatibilità React 19
echo "📦 Installazione dipendenze (Force Legacy Peer Deps)..."
# --legacy-peer-deps è necessario perché React 19 è nuovo e alcune librerie 
# non hanno ancora aggiornato le loro dichiarazioni ufficiali di compatibilità
npm install --legacy-peer-deps

# 3. Compilazione del progetto React/Vite
echo "⚛️  Compilazione Frontend (Vite Build)..."
npm run build

# 4. Creazione del pacchetto Electron AppImage
echo "🐧 Generazione pacchetto Linux AppImage..."
npx electron-builder --linux AppImage

echo "=================================================="
echo "✅ SUCCESSO! Il processo è terminato senza errori."
echo "📂 Il tuo file .AppImage si trova in: dist_electron/"
echo "=================================================="

