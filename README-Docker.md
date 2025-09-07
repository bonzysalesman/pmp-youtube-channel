# PMP WordPress Docker Environment

This Docker setup provides a complete development environment for the PMP WordPress frontend with all necessary services and tools.

## 🚀 Quick Start

1. **Start the environment:**
   ```bash
   ./docker-start.sh
   ```

2. **Access your site:**
   - WordPress: http://localhost:8080
   - Admin: http://localhost:8080/wp-admin (admin/admin123)
   - phpMyAdmin: http://localhost:8081
   - Mailhog: http://localhost:8025
   - Browser Testing: http://localhost:8080/wp-content/themes/understrap-child/tests/browser-testing.html

3. **Stop the environment:**
   ```bash
   ./docker-stop.sh
   ```

## 📋 Services Included

### WordPress (Port 8080)
- **Image:** WordPress 6.4 with PHP 8.2-FPM
- **Features:** 
  - Understrap parent theme pre-installed
  - PMP child theme activated
  - Essential plugins installed
  - Sample content created
  - WP-CLI available

### MySQL Database (Port 3306)
- **Image:** MySQL 8.0
- **Database:** pmp_wordpress
- **User:** pmp_user / pmp_password
- **Features:**
  - Custom PMP tables pre-created
  - Sample course structure data
  - Optimized for WordPress

### Nginx Web Server (Port 8080)
- **Image:** Nginx 1.25 Alpine
- **Features:**
  - FastCGI caching enabled
  - Gzip compression
  - Security headers
  - Static file optimization
  - WordPress-specific rules

### phpMyAdmin (Port 8081)
- **Image:** phpMyAdmin 5.2
- **Access:** pmp_user / pmp_password
- **Features:**
  - Database management interface
  - Import/export capabilities
  - Query execution

### Redis Cache (Port 6379)
- **Image:** Redis 7 Alpine
- **Purpose:** Object caching for WordPress
- **Features:**
  - Persistent data storage
  - Performance optimization

### Mailhog (Ports 8025/1025)
- **Image:** Mailhog v1.0.1
- **Purpose:** Email testing and debugging
- **Features:**
  - Web interface for viewing emails
  - SMTP server for WordPress

## 🛠️ Development Tools

### WP-CLI Commands
```bash
# Access WordPress container
docker-compose exec wordpress bash

# Run WP-CLI commands
docker-compose exec wordpress wp --allow-root [command]

# Examples:
docker-compose exec wordpress wp --allow-root plugin list
docker-compose exec wordpress wp --allow-root theme list
docker-compose exec wordpress wp --allow-root user list
```

### Database Access
```bash
# MySQL CLI access
docker-compose exec db mysql -u pmp_user -p pmp_wordpress

# Backup database
docker-compose exec db mysqldump -u pmp_user -p pmp_wordpress > backup.sql

# Restore database
docker-compose exec -T db mysql -u pmp_user -p pmp_wordpress < backup.sql
```

### Log Monitoring
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f wordpress
docker-compose logs -f nginx
docker-compose logs -f db
```

## 🧪 Testing Features

### Browser Compatibility Testing
Access the comprehensive browser testing suite at:
http://localhost:8080/wp-content/themes/understrap-child/tests/browser-testing.html

**Features:**
- Real-time browser detection
- Feature support analysis
- Cross-browser compatibility testing
- Performance validation
- Accessibility testing

### Validation Suite
The validation suite automatically runs and provides:
- HTML structure validation
- CSS standards compliance
- JavaScript error detection
- Accessibility compliance
- Performance optimization checks

## 📁 Directory Structure

```
├── docker-compose.yml          # Main Docker configuration
├── Dockerfile.wordpress        # Custom WordPress image
├── docker/
│   ├── nginx/                 # Nginx configuration
│   ├── mysql/                 # MySQL initialization
│   └── wordpress/             # WordPress setup scripts
├── understrap-child-1.2.0/    # PMP WordPress theme
├── uploads/                   # WordPress uploads (persistent)
├── plugins/                   # Additional plugins (persistent)
└── .env                       # Environment configuration
```

## ⚙️ Configuration

### Environment Variables (.env)
Copy `.env.example` to `.env` and customize:

```bash
# Database settings
MYSQL_DATABASE=pmp_wordpress
MYSQL_USER=pmp_user
MYSQL_PASSWORD=pmp_password

# WordPress settings
WORDPRESS_DEBUG=1
PHP_MEMORY_LIMIT=512M

# Port configuration
WORDPRESS_PORT=8080
PHPMYADMIN_PORT=8081
```

### Performance Tuning

**PHP Configuration:**
- Memory limit: 512M
- Upload max size: 64M
- Execution time: 300s
- OPcache enabled

**Nginx Configuration:**
- FastCGI caching
- Gzip compression
- Static file caching
- Security headers

**MySQL Configuration:**
- Optimized for WordPress
- UTF8MB4 charset
- Custom PMP tables

## 🔧 Troubleshooting

### Common Issues

**Port conflicts:**
```bash
# Check what's using port 8080
lsof -i :8080

# Change ports in .env file
WORDPRESS_PORT=8081
```

**Permission issues:**
```bash
# Fix file permissions
docker-compose exec wordpress chown -R www-data:www-data /var/www/html
```

**Database connection issues:**
```bash
# Check database status
docker-compose exec db mysqladmin ping

# Restart database
docker-compose restart db
```

**WordPress not loading:**
```bash
# Check WordPress logs
docker-compose logs wordpress

# Restart WordPress
docker-compose restart wordpress
```

### Reset Environment

**Soft reset (keep data):**
```bash
docker-compose restart
```

**Hard reset (remove all data):**
```bash
docker-compose down -v
./docker-start.sh
```

**Complete cleanup:**
```bash
docker-compose down -v --rmi all
docker system prune -a
./docker-start.sh
```

## 🚀 Production Deployment

This Docker setup is designed for development. For production:

1. **Security:**
   - Change default passwords
   - Use environment-specific secrets
   - Enable SSL/TLS
   - Configure firewall rules

2. **Performance:**
   - Use production-optimized images
   - Configure external caching (Redis/Memcached)
   - Set up CDN
   - Enable monitoring

3. **Backup:**
   - Automated database backups
   - File system backups
   - Disaster recovery plan

## 📚 Additional Resources

- [WordPress Docker Documentation](https://hub.docker.com/_/wordpress)
- [Nginx Configuration Guide](https://nginx.org/en/docs/)
- [MySQL Docker Documentation](https://hub.docker.com/_/mysql)
- [Docker Compose Reference](https://docs.docker.com/compose/)

## 🆘 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify services are running: `docker-compose ps`
3. Check port availability: `netstat -tulpn | grep :8080`
4. Review configuration files
5. Try a clean restart: `docker-compose down && docker-compose up -d`