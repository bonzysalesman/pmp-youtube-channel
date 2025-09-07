<?php
/**
 * Template Name: Resources Page
 * 
 * The template for displaying the PMP resources page with categorized study materials.
 *
 * @package UnderstrapChild
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

get_header();

// Initialize resources manager
$resources_manager = new PMP_Resources_Manager();
$categories = $resources_manager->get_categories();
$stats = $resources_manager->get_resource_stats();

// Get current filter
$current_category = isset($_GET['category']) ? sanitize_text_field($_GET['category']) : 'all';
$search_query = isset($_GET['search']) ? sanitize_text_field($_GET['search']) : '';

// Get filtered resources
$resources = $resources_manager->get_resources_by_category($current_category);

// Apply search filter if provided
if (!empty($search_query)) {
    $resources = array_filter($resources, function($resource) use ($search_query) {
        return stripos($resource['title'], $search_query) !== false || 
               stripos($resource['description'], $search_query) !== false ||
               in_array(strtolower($search_query), array_map('strtolower', $resource['tags']));
    });
}
?>

<div class="wrapper" id="page-wrapper">
    <div class="container-fluid" id="content" tabindex="-1">
        <div class="row">
            
            <!-- Main Content -->
            <main class="site-main col-12" id="main">
                
                <?php
                // Display breadcrumb navigation
                if ( class_exists( 'PMP_Navigation_Manager' ) ) {
                    $nav_manager = new PMP_Navigation_Manager();
                    $nav_manager->display_breadcrumbs();
                }
                ?>
                
                <!-- Page Header -->
                <div class="resources-header py-5 mb-5">
                    <div class="container">
                        <div class="row align-items-center">
                            <div class="col-lg-8">
                                <h1 class="page-title mb-3">Study Resources</h1>
                                <p class="page-description lead">
                                    Access comprehensive study materials, practice tools, and video content to support your PMP certification journey.
                                </p>
                                
                                <!-- Resource Statistics -->
                                <div class="resource-stats d-flex flex-wrap gap-4 mt-4">
                                    <div class="stat-item">
                                        <span class="stat-number"><?php echo $stats['total']; ?></span>
                                        <span class="stat-label">Total Resources</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-number"><?php echo $stats['by_category']['study_guides']; ?></span>
                                        <span class="stat-label">Study Guides</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-number"><?php echo $stats['by_category']['videos']; ?></span>
                                        <span class="stat-label">Videos</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-number"><?php echo $stats['by_category']['practice_tools']; ?></span>
                                        <span class="stat-label">Practice Tools</span>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4 text-center">
                                <div class="resources-hero-icon">
                                    <i class="fas fa-graduation-cap fa-5x text-primary"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="container">
                    
                    <!-- Filters and Search -->
                    <div class="resources-filters mb-5">
                        <div class="row">
                            <div class="col-lg-8">
                                <!-- Category Filters -->
                                <div class="category-filters mb-3">
                                    <h5 class="filter-title mb-3">Browse by Category</h5>
                                    <div class="filter-buttons d-flex flex-wrap gap-2">
                                        <?php foreach ($categories as $cat_key => $category): ?>
                                            <a href="<?php echo add_query_arg(['category' => $cat_key, 'search' => $search_query]); ?>" 
                                               class="btn filter-btn <?php echo $current_category === $cat_key ? 'active' : ''; ?>">
                                                <i class="<?php echo $category['icon']; ?> me-2"></i>
                                                <?php echo $category['name']; ?>
                                                <?php if ($cat_key !== 'all'): ?>
                                                    <span class="badge ms-2"><?php echo $stats['by_category'][$cat_key]; ?></span>
                                                <?php else: ?>
                                                    <span class="badge ms-2"><?php echo $stats['total']; ?></span>
                                                <?php endif; ?>
                                            </a>
                                        <?php endforeach; ?>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4">
                                <!-- Search -->
                                <div class="search-resources">
                                    <h5 class="filter-title mb-3">Search Resources</h5>
                                    <form method="GET" class="search-form">
                                        <div class="input-group">
                                            <input type="text" 
                                                   name="search" 
                                                   class="form-control" 
                                                   placeholder="Search resources..." 
                                                   value="<?php echo esc_attr($search_query); ?>">
                                            <input type="hidden" name="category" value="<?php echo esc_attr($current_category); ?>">
                                            <button class="btn btn-outline-primary" type="submit">
                                                <i class="fas fa-search"></i>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Active Filters Display -->
                        <?php if ($current_category !== 'all' || !empty($search_query)): ?>
                            <div class="active-filters mt-3">
                                <span class="filter-label">Active filters:</span>
                                <?php if ($current_category !== 'all'): ?>
                                    <span class="active-filter">
                                        Category: <?php echo $categories[$current_category]['name']; ?>
                                        <a href="<?php echo add_query_arg(['category' => 'all', 'search' => $search_query]); ?>" class="remove-filter">×</a>
                                    </span>
                                <?php endif; ?>
                                <?php if (!empty($search_query)): ?>
                                    <span class="active-filter">
                                        Search: "<?php echo esc_html($search_query); ?>"
                                        <a href="<?php echo add_query_arg(['category' => $current_category, 'search' => '']); ?>" class="remove-filter">×</a>
                                    </span>
                                <?php endif; ?>
                                <a href="<?php echo remove_query_arg(['category', 'search']); ?>" class="clear-all-filters">Clear all</a>
                            </div>
                        <?php endif; ?>
                    </div>
                    
                    <!-- Results Header -->
                    <div class="results-header mb-4">
                        <div class="row align-items-center">
                            <div class="col-md-6">
                                <h4 class="results-title">
                                    <?php if ($current_category !== 'all'): ?>
                                        <?php echo $categories[$current_category]['name']; ?>
                                    <?php else: ?>
                                        All Resources
                                    <?php endif; ?>
                                    <span class="results-count">(<?php echo count($resources); ?> <?php echo count($resources) === 1 ? 'resource' : 'resources'; ?>)</span>
                                </h4>
                                <?php if ($current_category !== 'all'): ?>
                                    <p class="category-description text-muted">
                                        <?php echo $categories[$current_category]['description']; ?>
                                    </p>
                                <?php endif; ?>
                            </div>
                            <div class="col-md-6 text-md-end">
                                <div class="view-options">
                                    <span class="view-label">View:</span>
                                    <button class="btn btn-sm btn-outline-secondary active" data-view="grid">
                                        <i class="fas fa-th"></i> Grid
                                    </button>
                                    <button class="btn btn-sm btn-outline-secondary" data-view="list">
                                        <i class="fas fa-list"></i> List
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Resources Grid -->
                    <div class="resources-content">
                        <?php if (!empty($resources)): ?>
                            <?php echo $resources_manager->render_resource_grid($resources); ?>
                        <?php else: ?>
                            <div class="no-resources-found text-center py-5">
                                <div class="no-results-icon mb-4">
                                    <i class="fas fa-search fa-3x text-muted"></i>
                                </div>
                                <h4>No resources found</h4>
                                <p class="text-muted">
                                    <?php if (!empty($search_query)): ?>
                                        No resources match your search for "<?php echo esc_html($search_query); ?>".
                                    <?php else: ?>
                                        No resources are available in this category.
                                    <?php endif; ?>
                                </p>
                                <div class="mt-4">
                                    <a href="<?php echo remove_query_arg(['category', 'search']); ?>" class="btn btn-primary">
                                        Browse All Resources
                                    </a>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>
                    
                    <!-- Popular Resources Section -->
                    <?php if ($current_category === 'all' && empty($search_query)): ?>
                        <div class="popular-resources mt-5 pt-5 border-top">
                            <h3 class="section-title mb-4">
                                <i class="fas fa-star text-warning me-2"></i>
                                Most Popular Resources
                            </h3>
                            <div class="popular-resources-grid">
                                <?php 
                                $popular_resources = $resources_manager->get_popular_resources(3);
                                echo $resources_manager->render_resource_grid($popular_resources);
                                ?>
                            </div>
                        </div>
                    <?php endif; ?>
                    
                    <!-- Help Section -->
                    <div class="resources-help mt-5 pt-5 border-top">
                        <div class="row">
                            <div class="col-lg-8">
                                <h3 class="help-title mb-3">Need Help Finding Resources?</h3>
                                <p class="help-description">
                                    Our study resources are organized by the three main PMP exam domains. Use the category filters above to find materials specific to your study needs, or search for specific topics using the search box.
                                </p>
                                <div class="domain-guide mt-4">
                                    <div class="row">
                                        <div class="col-md-4">
                                            <div class="domain-item domain-people">
                                                <h5><i class="fas fa-users me-2"></i>People (42%)</h5>
                                                <p class="small">Leadership, team building, conflict management</p>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="domain-item domain-process">
                                                <h5><i class="fas fa-cogs me-2"></i>Process (50%)</h5>
                                                <p class="small">Planning, execution, monitoring, closing</p>
                                            </div>
                                        </div>
                                        <div class="col-md-4">
                                            <div class="domain-item domain-business">
                                                <h5><i class="fas fa-building me-2"></i>Business (8%)</h5>
                                                <p class="small">Organizational factors, compliance</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-lg-4">
                                <div class="help-contact">
                                    <h5>Still Need Help?</h5>
                                    <p>Contact our support team for personalized assistance with your study plan.</p>
                                    <a href="/contact" class="btn btn-outline-primary">
                                        <i class="fas fa-envelope me-2"></i>Contact Support
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </div> <!-- .container -->
                
            </main><!-- #main -->
            
        </div><!-- .row -->
    </div><!-- #content -->
</div><!-- #page-wrapper -->

<script>
document.addEventListener('DOMContentLoaded', function() {
    // View toggle functionality
    const viewButtons = document.querySelectorAll('[data-view]');
    const resourcesGrid = document.querySelector('.resources-grid');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const view = this.dataset.view;
            
            // Update active button
            viewButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update grid class
            if (resourcesGrid) {
                resourcesGrid.classList.remove('grid-view', 'list-view');
                resourcesGrid.classList.add(view + '-view');
            }
        });
    });
    
    // Resource usage tracking
    const resourceLinks = document.querySelectorAll('.resource-download, .resource-watch, .resource-use');
    
    resourceLinks.forEach(link => {
        link.addEventListener('click', function() {
            const resourceCard = this.closest('.resource-card');
            const resourceId = resourceCard.dataset.resourceId;
            
            if (resourceId && typeof pmpData !== 'undefined') {
                // Track resource usage via AJAX
                fetch(pmpData.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'pmp_track_resource_usage',
                        resource_id: resourceId,
                        user_id: pmpData.userId,
                        nonce: pmpData.nonce
                    })
                }).catch(error => {
                    console.log('Resource tracking failed:', error);
                });
            }
        });
    });
    
    // Search form enhancement
    const searchForm = document.querySelector('.search-form');
    const searchInput = searchForm?.querySelector('input[name="search"]');
    
    if (searchInput) {
        // Clear search button
        if (searchInput.value) {
            const clearButton = document.createElement('button');
            clearButton.type = 'button';
            clearButton.className = 'btn btn-outline-secondary';
            clearButton.innerHTML = '<i class="fas fa-times"></i>';
            clearButton.addEventListener('click', function() {
                searchInput.value = '';
                searchForm.submit();
            });
            
            const inputGroup = searchInput.parentElement;
            inputGroup.appendChild(clearButton);
        }
        
        // Auto-submit on enter
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchForm.submit();
            }
        });
    }
});
</script>

<?php
get_footer();
?>