/**
 * PMP Resource Manager JavaScript
 * Handles resource downloads, tracking, and user interactions
 */

(function($) {
    'use strict';
    
    class ResourceManager {
        constructor() {
            this.downloadQueue = [];
            this.analytics = {
                downloads: [],
                views: [],
                searches: []
            };
            this.init();
        }
        
        init() {
            this.setupEventHandlers();
            this.setupDownloadTracking();
            this.setupSearchFiltering();
            this.setupAnalytics();
        }
        
        setupEventHandlers() {
            // Download link clicks
            $(document).on('click', '.pmp-download-link', (e) => {
                this.handleDownloadClick(e);
            });
            
            // Resource category filtering
            $(document).on('change', '.resource-category-filter', (e) => {
                this.filterByCategory($(e.target).val());
            });
            
            // Resource search
            $(document).on('input', '.resource-search', (e) => {
                this.searchResources($(e.target).val());
            });
            
            // Resource preview
            $(document).on('click', '.resource-preview', (e) => {
                e.preventDefault();
                this.previewResource($(e.target).data('resource-id'));
            });
            
            // Bulk download
            $(document).on('click', '.bulk-download', (e) => {
                e.preventDefault();
                this.handleBulkDownload();
            });
        }
        
        handleDownloadClick(e) {
            const $link = $(e.currentTarget);
            const resourceId = $link.data('resource-id');
            
            if (!resourceId) return;
            
            // Track download attempt
            this.trackDownloadAttempt(resourceId);
            
            // Show download progress
            this.showDownloadProgress($link);
            
            // Add to download queue
            this.addToDownloadQueue(resourceId);
            
            // Don't prevent default - let the download proceed
        }
        
        trackDownloadAttempt(resourceId) {
            $.ajax({
                url: pmpResources.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'pmp_track_resource_download',
                    nonce: pmpResources.nonce,
                    resource_id: resourceId,
                    user_id: pmpResources.userId,
                    event_type: 'download_attempt'
                },
                success: (response) => {
                    if (response.success) {
                        console.log('Download tracked:', resourceId);
                        this.updateDownloadCount(resourceId);
                    }
                },
                error: (xhr, status, error) => {
                    console.error('Failed to track download:', error);
                }
            });
        }
        
        showDownloadProgress($link) {
            const originalText = $link.text();
            const $icon = $link.find('.dashicons');
            
            // Change to loading state
            $link.addClass('downloading').prop('disabled', true);
            $icon.removeClass().addClass('dashicons dashicons-update-alt spinning');
            $link.find('span:not(.dashicons)').text('Downloading...');
            
            // Reset after 3 seconds
            setTimeout(() => {
                $link.removeClass('downloading').prop('disabled', false);
                $icon.removeClass().addClass('dashicons dashicons-yes-alt');
                $link.find('span:not(.dashicons)').text('Downloaded');
                
                // Reset to original after another 2 seconds
                setTimeout(() => {
                    $icon.removeClass().addClass('dashicons dashicons-download');
                    $link.find('span:not(.dashicons)').text(originalText);
                }, 2000);
            }, 3000);
        }
        
        addToDownloadQueue(resourceId) {
            this.downloadQueue.push({
                resourceId: resourceId,
                timestamp: Date.now(),
                status: 'pending'
            });
            
            this.processDownloadQueue();
        }
        
        processDownloadQueue() {
            // Process downloads with rate limiting
            const pendingDownloads = this.downloadQueue.filter(d => d.status === 'pending');
            
            if (pendingDownloads.length > 0) {
                const download = pendingDownloads[0];
                download.status = 'processing';
                
                // Simulate download processing
                setTimeout(() => {
                    download.status = 'completed';
                    this.analytics.downloads.push(download);
                    
                    // Process next download
                    if (pendingDownloads.length > 1) {
                        setTimeout(() => this.processDownloadQueue(), 1000);
                    }
                }, 2000);
            }
        }
        
        updateDownloadCount(resourceId) {
            const $counter = $(`.resource-item[data-resource-id="${resourceId}"] .download-count`);
            
            if ($counter.length) {
                const currentCount = parseInt($counter.text()) || 0;
                $counter.text((currentCount + 1) + ' downloads');
            }
        }
        
        filterByCategory(category) {
            const $resources = $('.resource-item');
            
            if (!category || category === 'all') {
                $resources.show();
            } else {
                $resources.each(function() {
                    const $item = $(this);
                    const itemCategory = $item.data('category');
                    
                    if (itemCategory === category) {
                        $item.show();
                    } else {
                        $item.hide();
                    }
                });
            }
            
            this.updateResultsCount();
        }
        
        searchResources(query) {
            const $resources = $('.resource-item');
            const searchTerm = query.toLowerCase().trim();
            
            if (!searchTerm) {
                $resources.show();
            } else {
                $resources.each(function() {
                    const $item = $(this);
                    const title = $item.find('h4').text().toLowerCase();
                    const description = $item.find('.resource-description').text().toLowerCase();
                    
                    if (title.includes(searchTerm) || description.includes(searchTerm)) {
                        $item.show();
                    } else {
                        $item.hide();
                    }
                });
            }
            
            this.updateResultsCount();
            this.trackSearch(query);
        }
        
        trackSearch(query) {
            if (query.length >= 3) {
                this.analytics.searches.push({
                    query: query,
                    timestamp: Date.now(),
                    results: $('.resource-item:visible').length
                });
            }
        }
        
        updateResultsCount() {
            const visibleCount = $('.resource-item:visible').length;
            const totalCount = $('.resource-item').length;
            
            $('.results-count').text(`Showing ${visibleCount} of ${totalCount} resources`);
        }
        
        previewResource(resourceId) {
            // Show resource preview modal
            const $modal = this.createPreviewModal(resourceId);
            $('body').append($modal);
            $modal.modal('show');
            
            // Load resource details
            this.loadResourcePreview(resourceId, $modal);
        }
        
        createPreviewModal(resourceId) {
            return $(`
                <div class="modal fade" id="resource-preview-${resourceId}" tabindex="-1">
                    <div class="modal-dialog modal-lg">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title">Resource Preview</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>
                            <div class="modal-body">
                                <div class="loading-spinner">
                                    <div class="spinner-border" role="status">
                                        <span class="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <a href="#" class="btn btn-primary download-from-preview" data-resource-id="${resourceId}">
                                    Download Resource
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        }
        
        loadResourcePreview(resourceId, $modal) {
            $.ajax({
                url: pmpResources.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'pmp_get_resource_preview',
                    nonce: pmpResources.nonce,
                    resource_id: resourceId
                },
                success: (response) => {
                    if (response.success) {
                        $modal.find('.modal-body').html(response.data.preview);
                        $modal.find('.modal-title').text(response.data.title);
                        $modal.find('.download-from-preview').attr('href', response.data.download_url);
                    } else {
                        $modal.find('.modal-body').html('<p>Failed to load resource preview.</p>');
                    }
                },
                error: () => {
                    $modal.find('.modal-body').html('<p>Error loading resource preview.</p>');
                }
            });
        }
        
        handleBulkDownload() {
            const selectedResources = $('.resource-checkbox:checked').map(function() {
                return $(this).val();
            }).get();
            
            if (selectedResources.length === 0) {
                alert('Please select resources to download.');
                return;
            }
            
            // Create bulk download
            this.createBulkDownload(selectedResources);
        }
        
        createBulkDownload(resourceIds) {
            $.ajax({
                url: pmpResources.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'pmp_create_bulk_download',
                    nonce: pmpResources.nonce,
                    resource_ids: resourceIds
                },
                success: (response) => {
                    if (response.success) {
                        // Download the bulk archive
                        window.location.href = response.data.download_url;
                        
                        // Track bulk download
                        this.trackBulkDownload(resourceIds);
                    } else {
                        alert('Failed to create bulk download: ' + response.data.message);
                    }
                },
                error: () => {
                    alert('Error creating bulk download.');
                }
            });
        }
        
        trackBulkDownload(resourceIds) {
            $.ajax({
                url: pmpResources.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'pmp_track_bulk_download',
                    nonce: pmpResources.nonce,
                    resource_ids: resourceIds,
                    user_id: pmpResources.userId
                }
            });
        }
        
        setupDownloadTracking() {
            // Track download completion
            $(window).on('focus', () => {
                // Check if any downloads completed while window was not focused
                this.checkDownloadCompletion();
            });
        }
        
        checkDownloadCompletion() {
            const recentDownloads = this.downloadQueue.filter(d => 
                d.status === 'processing' && 
                Date.now() - d.timestamp > 5000
            );
            
            recentDownloads.forEach(download => {
                download.status = 'completed';
                this.showDownloadNotification(download.resourceId);
            });
        }
        
        showDownloadNotification(resourceId) {
            // Show toast notification
            const $toast = $(`
                <div class="toast" role="alert">
                    <div class="toast-header">
                        <strong class="me-auto">Download Complete</strong>
                        <button type="button" class="btn-close" data-bs-dismiss="toast"></button>
                    </div>
                    <div class="toast-body">
                        Resource downloaded successfully!
                    </div>
                </div>
            `);
            
            $('.toast-container').append($toast);
            $toast.toast('show');
            
            // Remove after shown
            $toast.on('hidden.bs.toast', function() {
                $(this).remove();
            });
        }
        
        setupAnalytics() {
            // Track page views
            this.trackResourcePageView();
            
            // Send analytics data periodically
            setInterval(() => {
                this.sendAnalytics();
            }, 30000); // Every 30 seconds
            
            // Send analytics on page unload
            $(window).on('beforeunload', () => {
                this.sendAnalytics();
            });
        }
        
        trackResourcePageView() {
            const resourceId = $('body').data('resource-id');
            
            if (resourceId) {
                this.analytics.views.push({
                    resourceId: resourceId,
                    timestamp: Date.now(),
                    duration: 0
                });
            }
        }
        
        sendAnalytics() {
            if (this.analytics.downloads.length === 0 && 
                this.analytics.views.length === 0 && 
                this.analytics.searches.length === 0) {
                return;
            }
            
            $.ajax({
                url: pmpResources.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'pmp_send_resource_analytics',
                    nonce: pmpResources.nonce,
                    analytics: JSON.stringify(this.analytics)
                },
                success: () => {
                    // Clear sent analytics
                    this.analytics = {
                        downloads: [],
                        views: [],
                        searches: []
                    };
                }
            });
        }
        
        // Public methods for external use
        getDownloadStats() {
            return {
                totalDownloads: this.analytics.downloads.length,
                recentDownloads: this.analytics.downloads.filter(d => 
                    Date.now() - d.timestamp < 3600000 // Last hour
                ).length,
                queueLength: this.downloadQueue.filter(d => d.status === 'pending').length
            };
        }
        
        refreshResources() {
            location.reload();
        }
    }
    
    // Resource Category Manager
    class ResourceCategoryManager {
        constructor() {
            this.categories = {};
            this.init();
        }
        
        init() {
            this.loadCategories();
            this.setupCategoryHandlers();
        }
        
        loadCategories() {
            $.ajax({
                url: pmpResources.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'pmp_get_resource_categories',
                    nonce: pmpResources.nonce
                },
                success: (response) => {
                    if (response.success) {
                        this.categories = response.data;
                        this.renderCategoryFilter();
                    }
                }
            });
        }
        
        setupCategoryHandlers() {
            $(document).on('click', '.category-tab', (e) => {
                e.preventDefault();
                const category = $(e.target).data('category');
                this.switchCategory(category);
            });
        }
        
        switchCategory(category) {
            $('.category-tab').removeClass('active');
            $(`.category-tab[data-category="${category}"]`).addClass('active');
            
            window.pmpResourceManager.filterByCategory(category);
        }
        
        renderCategoryFilter() {
            const $container = $('.resource-category-tabs');
            
            if ($container.length === 0) return;
            
            let html = '<div class="nav nav-tabs" role="tablist">';
            html += '<button class="nav-link category-tab active" data-category="all">All Resources</button>';
            
            Object.keys(this.categories).forEach(categoryKey => {
                const category = this.categories[categoryKey];
                html += `
                    <button class="nav-link category-tab" data-category="${categoryKey}">
                        <span class="dashicons ${category.icon}"></span>
                        ${category.name}
                    </button>
                `;
            });
            
            html += '</div>';
            $container.html(html);
        }
    }
    
    // Initialize when DOM is ready
    $(document).ready(() => {
        window.pmpResourceManager = new ResourceManager();
        window.pmpCategoryManager = new ResourceCategoryManager();
        
        // Add toast container if it doesn't exist
        if ($('.toast-container').length === 0) {
            $('body').append('<div class="toast-container position-fixed top-0 end-0 p-3"></div>');
        }
    });
    
})(jQuery);