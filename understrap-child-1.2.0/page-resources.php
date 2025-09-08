<?php
/**
 * Template Name: PMP Resources Page
 * 
 * Displays downloadable resources organized by category
 */

// Exit if accessed directly.
defined('ABSPATH') || exit;

get_header();
?>

<div class="wrapper" id="page-wrapper">
    <div class="container-fluid" id="content" tabindex="-1">
        <div class="row">
            <div class="col-md-12 content-area" id="primary">
                <main class="site-main" id="main">
                    
                    <?php while (have_posts()) : the_post(); ?>
                        
                        <article <?php post_class(); ?> id="post-<?php the_ID(); ?>">
                            
                            <header class="entry-header">
                                <div class="row">
                                    <div class="col-md-8">
                                        <?php the_title('<h1 class="entry-title">', '</h1>'); ?>
                                        <div class="entry-meta">
                                            <p class="lead">Download study guides, templates, checklists, and practice materials to support your PMP certification journey.</p>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="resource-stats">
                                            <div class="stat-item">
                                                <span class="stat-number"><?php echo wp_count_posts('pmp_resource')->publish; ?></span>
                                                <span class="stat-label">Total Resources</span>
                                            </div>
                                            <div class="stat-item">
                                                <span class="stat-number"><?php echo get_user_meta(get_current_user_id(), 'pmp_resource_downloads', true) ? count(get_user_meta(get_current_user_id(), 'pmp_resource_downloads', true)) : 0; ?></span>
                                                <span class="stat-label">Your Downloads</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </header>
                            
                            <div class="entry-content">
                                
                                <?php the_content(); ?>
                                
                                <!-- Resource Filters -->
                                <div class="resource-filters">
                                    <input type="text" class="resource-search" placeholder="Search resources...">
                                    <select class="resource-category-filter">
                                        <option value="">All Categories</option>
                                        <option value="study-guides">Study Guides</option>
                                        <option value="templates">Templates</option>
                                        <option value="checklists">Checklists</option>
                                        <option value="reference-materials">Reference Materials</option>
                                        <option value="practice-exams">Practice Exams</option>
                                    </select>
                                    <div class="results-count">Loading resources...</div>
                                </div>
                                
                                <!-- Category Tabs -->
                                <div class="resource-category-tabs">
                                    <!-- Tabs will be populated by JavaScript -->
                                </div>
                                
                                <!-- Bulk Actions -->
                                <?php if (is_user_logged_in()): ?>
                                <div class="bulk-actions" style="display: none;">
                                    <label class="bulk-select-all">
                                        <input type="checkbox" id="select-all-resources"> Select All
                                    </label>
                                    <button class="bulk-download btn btn-success">
                                        <span class="dashicons dashicons-download"></span>
                                        Download Selected
                                    </button>
                                    <span class="selected-count">0 selected</span>
                                </div>
                                <?php endif; ?>
                                
                                <!-- Resources Display -->
                                <div class="resources-container">
                                    <?php
                                    // Display resources using shortcode
                                    echo do_shortcode('[pmp_resources limit="50" layout="grid"]');
                                    ?>
                                </div>
                                
                                <!-- Additional Content -->
                                <div class="resource-help mt-5">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <div class="help-section">
                                                <h3>How to Use These Resources</h3>
                                                <ul>
                                                    <li><strong>Study Guides</strong>: Comprehensive materials for each week of study</li>
                                                    <li><strong>Templates</strong>: Ready-to-use project management documents</li>
                                                    <li><strong>Checklists</strong>: Quick reference guides for processes and tasks</li>
                                                    <li><strong>Reference Materials</strong>: ECO mappings and additional reading</li>
                                                    <li><strong>Practice Exams</strong>: Mock tests to assess your readiness</li>
                                                </ul>
                                            </div>
                                        </div>
                                        <div class="col-md-6">
                                            <div class="help-section">
                                                <h3>Study Tips</h3>
                                                <ul>
                                                    <li>Download resources at the beginning of each week</li>
                                                    <li>Print checklists for easy reference during study</li>
                                                    <li>Use templates to practice real-world application</li>
                                                    <li>Review study guides before and after video lessons</li>
                                                    <li>Take practice exams regularly to track progress</li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <?php if (!is_user_logged_in()): ?>
                                <div class="login-prompt mt-4 p-4 bg-light rounded">
                                    <h4>Access More Resources</h4>
                                    <p>Log in to access premium study materials, practice exams, and track your download history.</p>
                                    <a href="<?php echo wp_login_url(get_permalink()); ?>" class="btn btn-primary">
                                        Login to Access Premium Resources
                                    </a>
                                </div>
                                <?php endif; ?>
                                
                            </div>
                            
                        </article>
                        
                    <?php endwhile; ?>
                    
                </main>
            </div>
        </div>
    </div>
</div>

<!-- Download Progress Tracker -->
<div class="download-progress" style="display: none;">
    <div class="download-progress-header">
        <h5>Downloads</h5>
        <button class="btn-close" onclick="$(this).closest('.download-progress').hide()"></button>
    </div>
    <div class="download-progress-list">
        <!-- Progress items will be added here -->
    </div>
</div>

<style>
.resource-stats {
    display: flex;
    gap: 2rem;
    justify-content: center;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
}

.stat-item {
    text-align: center;
}

.stat-number {
    display: block;
    font-size: 2rem;
    font-weight: bold;
    color: #007cba;
}

.stat-label {
    display: block;
    font-size: 0.9rem;
    color: #666;
}

.help-section {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 8px;
    height: 100%;
}

.help-section h3 {
    color: #007cba;
    margin-bottom: 1rem;
}

.help-section ul {
    margin: 0;
    padding-left: 1.5rem;
}

.help-section li {
    margin-bottom: 0.5rem;
}

.login-prompt {
    text-align: center;
    border: 2px dashed #007cba;
}

@media (max-width: 768px) {
    .resource-stats {
        flex-direction: column;
        gap: 1rem;
    }
    
    .help-section {
        margin-bottom: 1rem;
    }
}
</style>

<script>
jQuery(document).ready(function($) {
    // Show bulk actions when resources are selected
    $(document).on('change', '.resource-checkbox', function() {
        const selectedCount = $('.resource-checkbox:checked').length;
        $('.selected-count').text(selectedCount + ' selected');
        
        if (selectedCount > 0) {
            $('.bulk-actions').show();
        } else {
            $('.bulk-actions').hide();
        }
    });
    
    // Select all functionality
    $('#select-all-resources').on('change', function() {
        const isChecked = $(this).is(':checked');
        $('.resource-checkbox').prop('checked', isChecked).trigger('change');
    });
    
    // Update results count after filtering
    function updateResultsCount() {
        const visibleCount = $('.resource-item:visible').length;
        const totalCount = $('.resource-item').length;
        $('.results-count').text(`Showing ${visibleCount} of ${totalCount} resources`);
    }
    
    // Initial count update
    setTimeout(updateResultsCount, 1000);
});
</script>

<?php
get_footer();
?>