<?php
/**
 * PHPUnit bootstrap file for PMP WordPress Frontend Tests
 */

// Define test environment constants
define('WP_TESTS_PHPUNIT_POLYFILLS_PATH', __DIR__ . '/../vendor/yoast/phpunit-polyfills/phpunitpolyfills-autoload.php');

// Load WordPress test environment if available
if (file_exists('/tmp/wordpress-tests-lib/includes/functions.php')) {
    require_once '/tmp/wordpress-tests-lib/includes/functions.php';
} else {
    // Mock WordPress functions for testing without full WordPress installation
    require_once __DIR__ . '/mocks/wordpress-functions.php';
}

// Load the classes being tested
require_once __DIR__ . '/../includes/class-pmp-course-navigation.php';
require_once __DIR__ . '/../includes/class-pmp-dashboard.php';
require_once __DIR__ . '/../includes/class-pmp-progress-tracker.php';

// Load test utilities
require_once __DIR__ . '/utilities/test-data-provider.php';
require_once __DIR__ . '/utilities/mock-user-helper.php';

// Set up test database if needed
function _manually_load_plugin() {
    // Any plugin setup code would go here
}

// Hook into WordPress test setup if available
if (function_exists('tests_add_filter')) {
    tests_add_filter('muplugins_loaded', '_manually_load_plugin');
}

// Initialize WordPress test environment if available
if (file_exists('/tmp/wordpress-tests-lib/includes/bootstrap.php')) {
    require '/tmp/wordpress-tests-lib/includes/bootstrap.php';
}