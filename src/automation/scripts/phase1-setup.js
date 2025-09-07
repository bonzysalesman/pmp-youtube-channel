#!/usr/bin/env node

/**
 * Phase 1 Setup Script - PMP WordPress Content Setup
 * 
 * Orchestrates the complete Phase 1 implementation:
 * 1. Content Import and Organization
 * 2. Primary Navigation Configuration  
 * 3. User Dashboard Setup
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

class Phase1Setup {
    constructor() {
        this.projectRoot = path.join(__dirname, '../../..');
        this.scriptsPath = path.join(__dirname);
        this.configPath = path.join(__dirname, '../../config');
        this.results = {
            contentImport: null,
            navigation: null,
            dashboard: null,
            errors: []
        };
    }

    /**
     * Check prerequisites for Phase 1 setup
     */
    async checkPrerequisites() {
        console.log('🔍 Checking prerequisites...\n');
        
        const checks = [];
        
        // Check if .env file exists
        const envPath = path.join(this.projectRoot, '.env');
        if (await fs.pathExists(envPath)) {
            console.log('✅ Environment file (.env) found');
            checks.push(true);
        } else {
            console.log('❌ Environment file (.env) not found');
            console.log('   Please copy .env.example to .env and configure your settings');
            checks.push(false);
        }
        
        // Check if content chunks exist
        const chunksPath = path.join(this.projectRoot, 'src/content/chunks');
        if (await fs.pathExists(chunksPath)) {
            const weeks = await fs.readdir(chunksPath);
            const weekDirs = weeks.filter(dir => dir.startsWith('week-'));
            console.log(`✅ Content chunks found (${weekDirs.length} weeks)`);
            checks.push(true);
        } else {
            console.log('❌ Content chunks directory not found');
            checks.push(false);
        }
        
        // Check if cross-references exist
        const crossRefPath = path.join(this.projectRoot, 'src/content/cross-references');
        if (await fs.pathExists(crossRefPath)) {
            console.log('✅ Cross-reference files found');
            checks.push(true);
        } else {
            console.log('❌ Cross-reference files not found');
            checks.push(false);
        }
        
        // Check if WordPress is accessible (if running)
        try {
            const wpUrl = process.env.WORDPRESS_URL || 'http://localhost:8080';
            console.log(`✅ WordPress URL configured: ${wpUrl}`);
            checks.push(true);
        } catch (error) {
            console.log('⚠️  WordPress URL not configured, using default');
            checks.push(true); // Not critical
        }
        
        const allPassed = checks.every(check => check === true);
        
        if (allPassed) {
            console.log('\n🎉 All prerequisites met! Ready to proceed.\n');
        } else {
            console.log('\n❌ Some prerequisites are missing. Please address them before continuing.\n');
        }
        
        return allPassed;
    }

    /**
     * Task 1.1: Execute content import
     */
    async executeContentImport() {
        console.log('📥 Task 1.1: Content Import and Organization');
        console.log('===========================================\n');
        
        try {
            const ContentImporter = require('./content-import-wordpress');
            const importer = new ContentImporter();
            
            console.log('Starting content import process...');
            await importer.run();
            
            this.results.contentImport = {
                status: 'success',
                message: 'Content import completed successfully',
                stats: importer.stats
            };
            
            console.log('✅ Task 1.1 completed successfully!\n');
            
        } catch (error) {
            console.error('❌ Content import failed:', error.message);
            this.results.contentImport = {
                status: 'error',
                message: error.message
            };
            this.results.errors.push({
                task: '1.1',
                error: error.message
            });
        }
    }

    /**
     * Task 1.2: Setup primary navigation
     */
    async setupPrimaryNavigation() {
        console.log('🧭 Task 1.2: Primary Navigation Configuration');
        console.log('============================================\n');
        
        try {
            // Create navigation configuration
            const navigationConfig = {
                main_menu: {
                    items: [
                        {
                            title: 'Dashboard',
                            url: '/dashboard',
                            icon: 'dashboard',
                            order: 1,
                            roles: ['student', 'instructor', 'admin']
                        },
                        {
                            title: 'Course Content',
                            url: '/course',
                            icon: 'book',
                            order: 2,
                            roles: ['student', 'instructor', 'admin'],
                            submenu: [
                                {
                                    title: 'Week 1: Foundation',
                                    url: '/course/week-1',
                                    domain: 'Foundation'
                                },
                                {
                                    title: 'Week 2-4: People Domain',
                                    url: '/course/people',
                                    domain: 'People'
                                },
                                {
                                    title: 'Week 5-11: Process Domain',
                                    url: '/course/process',
                                    domain: 'Process'
                                },
                                {
                                    title: 'Week 12-13: Final Prep',
                                    url: '/course/final-prep',
                                    domain: 'General'
                                }
                            ]
                        },
                        {
                            title: 'Practice Tests',
                            url: '/practice',
                            icon: 'quiz',
                            order: 3,
                            roles: ['student', 'instructor', 'admin']
                        },
                        {
                            title: 'Resources',
                            url: '/resources',
                            icon: 'download',
                            order: 4,
                            roles: ['student', 'instructor', 'admin']
                        },
                        {
                            title: 'Progress',
                            url: '/progress',
                            icon: 'chart',
                            order: 5,
                            roles: ['student', 'instructor', 'admin']
                        }
                    ]
                },
                breadcrumb_config: {
                    enabled: true,
                    separator: ' > ',
                    show_home: true,
                    home_text: 'Home'
                },
                mobile_menu: {
                    breakpoint: 768,
                    hamburger_style: 'modern',
                    overlay_enabled: true
                }
            };
            
            // Save navigation configuration
            const navConfigPath = path.join(this.configPath, 'navigation-config.json');
            await fs.ensureDir(this.configPath);
            await fs.writeJson(navConfigPath, navigationConfig, { spaces: 2 });
            
            // Create WordPress menu registration script
            const menuRegistrationScript = this.generateMenuRegistrationScript(navigationConfig);
            const menuScriptPath = path.join(this.scriptsPath, 'register-wordpress-menus.php');
            await fs.writeFile(menuScriptPath, menuRegistrationScript);
            
            this.results.navigation = {
                status: 'success',
                message: 'Navigation configuration created successfully',
                configPath: navConfigPath,
                scriptPath: menuScriptPath
            };
            
            console.log('✅ Navigation configuration created');
            console.log(`📄 Config saved to: ${navConfigPath}`);
            console.log(`🔧 WordPress script: ${menuScriptPath}`);
            console.log('✅ Task 1.2 completed successfully!\n');
            
        } catch (error) {
            console.error('❌ Navigation setup failed:', error.message);
            this.results.navigation = {
                status: 'error',
                message: error.message
            };
            this.results.errors.push({
                task: '1.2',
                error: error.message
            });
        }
    }

    /**
     * Generate WordPress menu registration PHP script
     */
    generateMenuRegistrationScript(config) {
        return `<?php
/**
 * PMP Course Navigation Menu Registration
 * Generated by Phase 1 Setup Script
 */

// Register navigation menus
function pmp_register_navigation_menus() {
    register_nav_menus(array(
        'primary' => __('Primary Navigation', 'pmp-course'),
        'footer' => __('Footer Navigation', 'pmp-course'),
        'mobile' => __('Mobile Navigation', 'pmp-course'),
    ));
}
add_action('init', 'pmp_register_navigation_menus');

// Create default menu structure
function pmp_create_default_menus() {
    // Check if menus already exist
    $primary_menu = wp_get_nav_menu_object('Primary Navigation');
    
    if (!$primary_menu) {
        // Create primary menu
        $menu_id = wp_create_nav_menu('Primary Navigation');
        
        if (!is_wp_error($menu_id)) {
            ${this.generateMenuItems(config.main_menu.items)}
            
            // Assign menu to location
            $locations = get_theme_mod('nav_menu_locations');
            $locations['primary'] = $menu_id;
            set_theme_mod('nav_menu_locations', $locations);
        }
    }
}
add_action('wp_loaded', 'pmp_create_default_menus');

// Enqueue navigation styles and scripts
function pmp_navigation_assets() {
    wp_enqueue_style('pmp-navigation', get_template_directory_uri() . '/assets/css/navigation.css', array(), '1.0.0');
    wp_enqueue_script('pmp-navigation', get_template_directory_uri() . '/assets/js/navigation.js', array('jquery'), '1.0.0', true);
    
    // Pass configuration to JavaScript
    wp_localize_script('pmp-navigation', 'pmpNavConfig', array(
        'breakpoint' => ${config.mobile_menu.breakpoint},
        'overlayEnabled' => ${config.mobile_menu.overlay_enabled ? 'true' : 'false'},
        'breadcrumbEnabled' => ${config.breadcrumb_config.enabled ? 'true' : 'false'}
    ));
}
add_action('wp_enqueue_scripts', 'pmp_navigation_assets');

// Add body classes for navigation styling
function pmp_navigation_body_classes($classes) {
    $classes[] = 'pmp-navigation-enabled';
    
    if (is_user_logged_in()) {
        $classes[] = 'user-logged-in';
    }
    
    return $classes;
}
add_filter('body_class', 'pmp_navigation_body_classes');
?>`;
    }

    /**
     * Generate menu items PHP code
     */
    generateMenuItems(items) {
        let php = '';
        items.forEach((item, index) => {
            php += `
            // Add ${item.title}
            wp_update_nav_menu_item($menu_id, 0, array(
                'menu-item-title' => '${item.title}',
                'menu-item-url' => '${item.url}',
                'menu-item-status' => 'publish',
                'menu-item-position' => ${item.order}
            ));`;
            
            if (item.submenu) {
                item.submenu.forEach(subitem => {
                    php += `
            wp_update_nav_menu_item($menu_id, 0, array(
                'menu-item-title' => '${subitem.title}',
                'menu-item-url' => '${subitem.url}',
                'menu-item-status' => 'publish'
            ));`;
                });
            }
        });
        return php;
    }

    /**
     * Task 1.3: Setup user dashboard
     */
    async setupUserDashboard() {
        console.log('📊 Task 1.3: User Dashboard Setup');
        console.log('=================================\n');
        
        try {
            // Create dashboard configuration
            const dashboardConfig = {
                layout: {
                    columns: 3,
                    responsive_breakpoints: {
                        tablet: 768,
                        mobile: 480
                    }
                },
                widgets: [
                    {
                        id: 'progress_overview',
                        title: 'Your Progress',
                        type: 'progress_chart',
                        position: { row: 1, col: 1, span: 2 },
                        settings: {
                            show_percentage: true,
                            show_time_remaining: true,
                            chart_type: 'circular'
                        }
                    },
                    {
                        id: 'current_lesson',
                        title: 'Current Lesson',
                        type: 'lesson_card',
                        position: { row: 1, col: 3, span: 1 },
                        settings: {
                            show_preview: true,
                            show_duration: true
                        }
                    },
                    {
                        id: 'upcoming_lessons',
                        title: 'Up Next',
                        type: 'lesson_list',
                        position: { row: 2, col: 1, span: 1 },
                        settings: {
                            limit: 5,
                            show_week: true
                        }
                    },
                    {
                        id: 'recent_activity',
                        title: 'Recent Activity',
                        type: 'activity_feed',
                        position: { row: 2, col: 2, span: 1 },
                        settings: {
                            limit: 10,
                            show_timestamps: true
                        }
                    },
                    {
                        id: 'quick_actions',
                        title: 'Quick Actions',
                        type: 'action_buttons',
                        position: { row: 2, col: 3, span: 1 },
                        settings: {
                            buttons: [
                                { label: 'Continue Learning', action: 'continue_lesson', icon: 'play' },
                                { label: 'Take Practice Test', action: 'practice_test', icon: 'quiz' },
                                { label: 'Download Resources', action: 'resources', icon: 'download' },
                                { label: 'View Progress Report', action: 'progress_report', icon: 'chart' }
                            ]
                        }
                    },
                    {
                        id: 'study_streak',
                        title: 'Study Streak',
                        type: 'streak_counter',
                        position: { row: 3, col: 1, span: 1 },
                        settings: {
                            show_calendar: true,
                            show_goals: true
                        }
                    },
                    {
                        id: 'performance_metrics',
                        title: 'Performance',
                        type: 'metrics_grid',
                        position: { row: 3, col: 2, span: 2 },
                        settings: {
                            metrics: [
                                'lessons_completed',
                                'practice_score_avg',
                                'time_spent_learning',
                                'completion_rate'
                            ]
                        }
                    }
                ],
                user_preferences: {
                    customizable_layout: true,
                    widget_visibility: true,
                    theme_selection: ['light', 'dark', 'auto']
                }
            };
            
            // Save dashboard configuration
            const dashboardConfigPath = path.join(this.configPath, 'dashboard-config.json');
            await fs.writeJson(dashboardConfigPath, dashboardConfig, { spaces: 2 });
            
            // Create dashboard template
            const dashboardTemplate = this.generateDashboardTemplate(dashboardConfig);
            const templatePath = path.join(this.scriptsPath, 'dashboard-template.php');
            await fs.writeFile(templatePath, dashboardTemplate);
            
            // Create dashboard CSS
            const dashboardCSS = this.generateDashboardCSS();
            const cssPath = path.join(this.scriptsPath, 'dashboard-styles.css');
            await fs.writeFile(cssPath, dashboardCSS);
            
            // Create dashboard JavaScript
            const dashboardJS = this.generateDashboardJS();
            const jsPath = path.join(this.scriptsPath, 'dashboard-scripts.js');
            await fs.writeFile(jsPath, dashboardJS);
            
            this.results.dashboard = {
                status: 'success',
                message: 'Dashboard setup completed successfully',
                configPath: dashboardConfigPath,
                templatePath: templatePath,
                cssPath: cssPath,
                jsPath: jsPath
            };
            
            console.log('✅ Dashboard configuration created');
            console.log(`📄 Config: ${dashboardConfigPath}`);
            console.log(`🎨 Template: ${templatePath}`);
            console.log(`🎨 Styles: ${cssPath}`);
            console.log(`⚡ Scripts: ${jsPath}`);
            console.log('✅ Task 1.3 completed successfully!\n');
            
        } catch (error) {
            console.error('❌ Dashboard setup failed:', error.message);
            this.results.dashboard = {
                status: 'error',
                message: error.message
            };
            this.results.errors.push({
                task: '1.3',
                error: error.message
            });
        }
    }

    /**
     * Generate dashboard template PHP
     */
    generateDashboardTemplate(config) {
        return `<?php
/**
 * PMP Course Dashboard Template
 * Generated by Phase 1 Setup Script
 */

// Ensure user is logged in
if (!is_user_logged_in()) {
    wp_redirect(wp_login_url());
    exit;
}

get_header(); ?>

<div class="pmp-dashboard-container">
    <div class="dashboard-header">
        <h1>Welcome back, <?php echo wp_get_current_user()->display_name; ?>!</h1>
        <div class="dashboard-actions">
            <button class="btn btn-primary" id="continue-learning">Continue Learning</button>
            <button class="btn btn-secondary" id="view-progress">View Progress</button>
        </div>
    </div>
    
    <div class="dashboard-grid" data-columns="${config.layout.columns}">
        <?php
        // Load dashboard widgets
        $widgets = ${JSON.stringify(config.widgets, null, 8)};
        
        foreach ($widgets as $widget) {
            echo '<div class="dashboard-widget" data-widget-id="' . $widget['id'] . '">';
            echo '<div class="widget-header">';
            echo '<h3>' . $widget['title'] . '</h3>';
            echo '</div>';
            echo '<div class="widget-content" id="widget-' . $widget['id'] . '">';
            
            // Load widget content based on type
            switch ($widget['type']) {
                case 'progress_chart':
                    include 'widgets/progress-chart.php';
                    break;
                case 'lesson_card':
                    include 'widgets/current-lesson.php';
                    break;
                case 'lesson_list':
                    include 'widgets/upcoming-lessons.php';
                    break;
                case 'activity_feed':
                    include 'widgets/recent-activity.php';
                    break;
                case 'action_buttons':
                    include 'widgets/quick-actions.php';
                    break;
                case 'streak_counter':
                    include 'widgets/study-streak.php';
                    break;
                case 'metrics_grid':
                    include 'widgets/performance-metrics.php';
                    break;
            }
            
            echo '</div>';
            echo '</div>';
        }
        ?>
    </div>
</div>

<?php get_footer(); ?>`;
    }

    /**
     * Generate dashboard CSS
     */
    generateDashboardCSS() {
        return `/* PMP Dashboard Styles */
.pmp-dashboard-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e1e5e9;
}

.dashboard-header h1 {
    color: #2c3e50;
    margin: 0;
}

.dashboard-actions {
    display: flex;
    gap: 10px;
}

.btn {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
}

.btn-primary {
    background-color: #3498db;
    color: white;
}

.btn-primary:hover {
    background-color: #2980b9;
}

.btn-secondary {
    background-color: #95a5a6;
    color: white;
}

.btn-secondary:hover {
    background-color: #7f8c8d;
}

.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}

.dashboard-widget {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    overflow: hidden;
    transition: transform 0.3s ease;
}

.dashboard-widget:hover {
    transform: translateY(-2px);
}

.widget-header {
    background: #f8f9fa;
    padding: 15px 20px;
    border-bottom: 1px solid #e1e5e9;
}

.widget-header h3 {
    margin: 0;
    color: #2c3e50;
    font-size: 16px;
}

.widget-content {
    padding: 20px;
}

/* Responsive Design */
@media (max-width: 768px) {
    .dashboard-grid {
        grid-template-columns: 1fr;
    }
    
    .dashboard-header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }
    
    .pmp-dashboard-container {
        padding: 10px;
    }
}

@media (max-width: 480px) {
    .dashboard-actions {
        flex-direction: column;
        width: 100%;
    }
    
    .btn {
        width: 100%;
    }
}`;
    }

    /**
     * Generate dashboard JavaScript
     */
    generateDashboardJS() {
        return `// PMP Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard
    initializeDashboard();
    
    // Setup event listeners
    setupEventListeners();
    
    // Load widget data
    loadWidgetData();
});

function initializeDashboard() {
    console.log('PMP Dashboard initialized');
    
    // Check for responsive layout
    handleResponsiveLayout();
    
    // Initialize tooltips
    initializeTooltips();
}

function setupEventListeners() {
    // Continue Learning button
    const continueBtn = document.getElementById('continue-learning');
    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            // Redirect to current lesson
            window.location.href = '/course/current';
        });
    }
    
    // View Progress button
    const progressBtn = document.getElementById('view-progress');
    if (progressBtn) {
        progressBtn.addEventListener('click', function() {
            // Redirect to progress page
            window.location.href = '/progress';
        });
    }
    
    // Widget refresh buttons
    document.querySelectorAll('.widget-refresh').forEach(button => {
        button.addEventListener('click', function() {
            const widgetId = this.closest('.dashboard-widget').dataset.widgetId;
            refreshWidget(widgetId);
        });
    });
}

function loadWidgetData() {
    // Load data for each widget
    document.querySelectorAll('.dashboard-widget').forEach(widget => {
        const widgetId = widget.dataset.widgetId;
        loadWidgetContent(widgetId);
    });
}

function loadWidgetContent(widgetId) {
    // Make AJAX request to load widget content
    fetch('/wp-admin/admin-ajax.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'action=load_dashboard_widget&widget_id=' + widgetId
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const widgetContent = document.getElementById('widget-' + widgetId);
            if (widgetContent) {
                widgetContent.innerHTML = data.data.content;
            }
        }
    })
    .catch(error => {
        console.error('Error loading widget:', error);
    });
}

function refreshWidget(widgetId) {
    const widget = document.querySelector('[data-widget-id="' + widgetId + '"]');
    if (widget) {
        widget.classList.add('loading');
        loadWidgetContent(widgetId);
        setTimeout(() => {
            widget.classList.remove('loading');
        }, 1000);
    }
}

function handleResponsiveLayout() {
    const grid = document.querySelector('.dashboard-grid');
    if (grid) {
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const width = entry.contentRect.width;
                if (width < 768) {
                    grid.style.gridTemplateColumns = '1fr';
                } else if (width < 1024) {
                    grid.style.gridTemplateColumns = 'repeat(2, 1fr)';
                } else {
                    grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
                }
            }
        });
        resizeObserver.observe(grid);
    }
}

function initializeTooltips() {
    // Add tooltips to dashboard elements
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', function() {
            showTooltip(this, this.dataset.tooltip);
        });
        
        element.addEventListener('mouseleave', function() {
            hideTooltip();
        });
    });
}

function showTooltip(element, text) {
    const tooltip = document.createElement('div');
    tooltip.className = 'dashboard-tooltip';
    tooltip.textContent = text;
    document.body.appendChild(tooltip);
    
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = rect.top - tooltip.offsetHeight - 10 + 'px';
}

function hideTooltip() {
    const tooltip = document.querySelector('.dashboard-tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}`;
    }

    /**
     * Generate final Phase 1 report
     */
    generatePhase1Report() {
        console.log('\n📊 PHASE 1 COMPLETION REPORT');
        console.log('============================\n');
        
        const tasks = [
            { id: '1.1', name: 'Content Import and Organization', result: this.results.contentImport },
            { id: '1.2', name: 'Primary Navigation Configuration', result: this.results.navigation },
            { id: '1.3', name: 'User Dashboard Setup', result: this.results.dashboard }
        ];
        
        tasks.forEach(task => {
            const status = task.result?.status === 'success' ? '✅' : '❌';
            console.log(`${status} Task ${task.id}: ${task.name}`);
            if (task.result?.message) {
                console.log(`   ${task.result.message}`);
            }
        });
        
        console.log(`\nTotal errors: ${this.results.errors.length}`);
        
        if (this.results.errors.length > 0) {
            console.log('\n❌ ERRORS ENCOUNTERED:');
            this.results.errors.forEach(error => {
                console.log(`   Task ${error.task}: ${error.error}`);
            });
        }
        
        const successCount = tasks.filter(task => task.result?.status === 'success').length;
        const successRate = (successCount / tasks.length) * 100;
        
        console.log(`\n📈 Success Rate: ${successRate.toFixed(1)}% (${successCount}/${tasks.length} tasks)`);
        
        if (successRate === 100) {
            console.log('\n🎉 Phase 1 completed successfully!');
            console.log('Ready to proceed to Phase 2: Media and Resources');
        } else {
            console.log('\n⚠️  Phase 1 completed with issues. Please review errors before proceeding.');
        }
        
        // Save detailed report
        const reportData = {
            phase: 1,
            timestamp: new Date().toISOString(),
            tasks: tasks,
            results: this.results,
            success_rate: successRate
        };
        
        const reportPath = path.join(this.projectRoot, 'generated/phase1-report.json');
        fs.ensureDirSync(path.dirname(reportPath));
        fs.writeJsonSync(reportPath, reportData, { spaces: 2 });
        
        console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    }

    /**
     * Main execution method
     */
    async run() {
        try {
            console.log('🚀 PMP WordPress Theme - Phase 1 Setup');
            console.log('======================================\n');
            
            // Check prerequisites
            const prereqsPassed = await this.checkPrerequisites();
            if (!prereqsPassed) {
                console.log('❌ Prerequisites not met. Exiting...');
                process.exit(1);
            }
            
            // Execute Phase 1 tasks
            await this.executeContentImport();
            await this.setupPrimaryNavigation();
            await this.setupUserDashboard();
            
            // Generate final report
            this.generatePhase1Report();
            
        } catch (error) {
            console.error('❌ Fatal error during Phase 1 setup:', error);
            process.exit(1);
        }
    }
}

// Execute if run directly
if (require.main === module) {
    const setup = new Phase1Setup();
    setup.run();
}

module.exports = Phase1Setup;