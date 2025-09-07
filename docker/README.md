# Docker Environment for PMP WordPress Integration

This directory contains Docker configuration files for the PMP WordPress integration environment.

## Quick Start

1. **Copy environment file:**

   ```bash
   cp .env.docker .env
   ```

2. **Update environment variables:**
   Edit `.env` file with your actual API keys and configuration values.

3. **Start the development environment:**

   ```bash
   docker-compose up -d
   ```

4. **Access the services:**
   - WordPress: http://localhost:8080
   - Analytics API: http://localhost:3000
   - phpMyAdmin: http://localhost:8081
   - Adminer: http://localhost:8082 (development profile)
   - MailHog: http://localhost:8025 (development profile)

## Services Overview

### Core Services

- **WordPress** (port 8080): Main website with Understrap child theme
- **MySQL** (port 3306): Database for WordPress and analytics
- **Redis** (port 6379): Caching and session storage
- **Analytics API** (port 3000): Node.js service for data integration

### Development Tools

- **phpMyAdmin** (port 8081): Database administration
- **Adminer** (port 8082): Alternative database tool
- **MailHog** (port 8025): Email testing
- **Traefik** (port 8080): Reverse proxy with dashboard

## Directory Structure

```
docker/
├── analytics/
│   └── Dockerfile          # Analytics API container
├── mysql/
│   ├── init/              # Database initialization scripts
│   │   ├── 01-create-databases.sql
│   │   └── 02-migrate-existing-data.sql
│   └── my.cnf             # MySQL configuration
├── nginx/
│   ├── nginx.conf         # Main Nginx configuration
│   └── sites/
│       └── default.conf   # Site-specific configuration
├── redis/
│   └── redis.conf         # Redis configuration
├── wordpress/
│   └── php.ini            # PHP configuration
└── README.md              # This file
```

## Volume Mounts

### WordPress Volumes

- `./understrap-child-1.2.0` → `/var/www/html/wp-content/themes/understrap-child-1.2.0`
- `./wordpress/plugins` → `/var/www/html/wp-content/plugins/custom`
- `wordpress_uploads` → `/var/www/html/wp-content/uploads`
- `wordpress_data` → `/var/www/html`

### Analytics Volumes

- `./src` → `/app/src` (source code)
- `./data` → `/app/data` (data files)
- `analytics_data` → `/app/data/analytics`

## Database Setup

The MySQL container automatically creates:

1. **WordPress Database** (`pmp_wordpress`)

   - User: `wordpress` / Password: `wordpress_password`
   - Full access to WordPress tables

2. **Analytics Database** (`pmp_analytics`)

   - User: `analytics` / Password: `analytics_password`
   - Contains integration tables for user tracking, events, purchases, etc.

3. **Cross-Database Access**
   - WordPress user has SELECT/INSERT/UPDATE access to analytics database
   - Enables real-time data integration

## Environment Profiles

### Development Profile

```bash
docker-compose --profile development up -d
```

Includes: MailHog, Adminer, Traefik dashboard

### Production Profile

```bash
docker-compose --profile production up -d
```

Includes: Nginx reverse proxy, SSL termination

## Common Commands

### Start Services

```bash
# All core services
docker-compose up -d

# With development tools
docker-compose --profile development up -d

# Specific service
docker-compose up -d wordpress mysql
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f wordpress
docker-compose logs -f analytics_api
```

### Execute Commands

```bash
# WordPress CLI
docker-compose exec wordpress wp --info

# MySQL CLI
docker-compose exec mysql mysql -u root -p

# Analytics API shell
docker-compose exec analytics_api sh
```

### Database Operations

```bash
# Import SQL file
docker-compose exec -T mysql mysql -u root -p pmp_wordpress < backup.sql

# Export database
docker-compose exec mysql mysqldump -u root -p pmp_wordpress > backup.sql

# Reset databases
docker-compose down -v
docker-compose up -d
```

## Troubleshooting

### WordPress Issues

1. **Theme not loading:**

   ```bash
   # Check theme mount
   docker-compose exec wordpress ls -la /var/www/html/wp-content/themes/

   # Fix permissions
   docker-compose exec wordpress chown -R www-data:www-data /var/www/html/wp-content/
   ```

2. **Database connection errors:**

   ```bash
   # Check MySQL status
   docker-compose exec mysql mysqladmin -u root -p status

   # Verify WordPress can connect
   docker-compose exec wordpress wp db check
   ```

### Analytics API Issues

1. **API not responding:**

   ```bash
   # Check service status
   docker-compose ps analytics_api

   # View logs
   docker-compose logs analytics_api

   # Test health endpoint
   curl http://localhost:3000/health
   ```

2. **Database connection issues:**
   ```bash
   # Test MySQL connection from API container
   docker-compose exec analytics_api node -e "
   const mysql = require('mysql2');
   const conn = mysql.createConnection({
     host: 'mysql',
     user: 'analytics',
     password: 'analytics_password',
     database: 'pmp_analytics'
   });
   conn.connect(err => console.log(err ? 'Error: ' + err.message : 'Connected!'));
   "
   ```

### Performance Issues

1. **Slow startup:**

   - Increase Docker memory allocation
   - Use `docker-compose up` without `-d` to see startup logs

2. **High resource usage:**

   ```bash
   # Monitor resource usage
   docker stats

   # Adjust MySQL memory settings in docker/mysql/my.cnf
   # Adjust Redis memory in docker/redis/redis.conf
   ```

## Security Considerations

### Development Environment

- Default passwords are used for convenience
- Debug mode is enabled
- All ports are exposed

### Production Environment

- Change all default passwords in `.env`
- Disable debug modes
- Use proper SSL certificates
- Implement proper firewall rules
- Regular security updates

## Backup and Recovery

### Database Backup

```bash
# Create backup
./scripts/backup-database.sh

# Restore backup
./scripts/restore-database.sh backup-file.sql
```

### Volume Backup

```bash
# Backup WordPress uploads
docker run --rm -v pmp_wordpress_uploads:/data -v $(pwd):/backup alpine tar czf /backup/uploads-backup.tar.gz -C /data .

# Restore WordPress uploads
docker run --rm -v pmp_wordpress_uploads:/data -v $(pwd):/backup alpine tar xzf /backup/uploads-backup.tar.gz -C /data
```

## Integration Testing

### WordPress-Analytics Integration

```bash
# Test event tracking
curl -X POST http://localhost:3000/api/v1/events/track \
  -H "Content-Type: application/json" \
  -d '{"event_type":"page_view","page_url":"http://localhost:8080/test"}'

# Test user registration sync
# Register user in WordPress, then check analytics database
docker-compose exec mysql mysql -u analytics -p pmp_analytics -e "SELECT * FROM users ORDER BY created_at DESC LIMIT 1;"
```

### Performance Testing

```bash
# Load test WordPress
ab -n 100 -c 10 http://localhost:8080/

# Load test Analytics API
ab -n 100 -c 10 http://localhost:3000/health
```

## Monitoring

### Health Checks

All services include health checks that can be monitored:

```bash
# Check all service health
docker-compose ps

# Individual health check
docker-compose exec wordpress curl -f http://localhost/
docker-compose exec analytics_api curl -f http://localhost:3000/health
```

### Log Aggregation

Logs are available through Docker Compose:

```bash
# Follow all logs
docker-compose logs -f

# Filter by service
docker-compose logs -f wordpress | grep ERROR
```

For production, consider using log aggregation tools like ELK stack or Fluentd.
