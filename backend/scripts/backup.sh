#!/usr/bin/env bash
# Nightly Postgres backup for the Hetzner box.
# Cron example (as root):
#   0 3 * * *  cd /opt/arena/backend && ./scripts/backup.sh >> /var/log/arena-backup.log 2>&1
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/opt/arena/backups}"
RETAIN_DAYS="${RETAIN_DAYS:-7}"
COMPOSE="${COMPOSE:-docker compose -f docker-compose.prod.yml}"

mkdir -p "$BACKUP_DIR"
TS="$(date +%Y%m%d-%H%M%S)"
FILE="$BACKUP_DIR/arena-$TS.sql.gz"

$COMPOSE exec -T postgres pg_dump -U arena arena | gzip > "$FILE"
echo "Backup written: $FILE"

# Prune backups older than RETAIN_DAYS.
find "$BACKUP_DIR" -name 'arena-*.sql.gz' -mtime +"$RETAIN_DAYS" -delete
echo "Pruned backups older than ${RETAIN_DAYS} days."
