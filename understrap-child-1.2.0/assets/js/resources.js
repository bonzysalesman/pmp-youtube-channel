/**
 * PMP Resources Page JavaScript
 * 
 * Handles interactions for the resources page including
 * filtering, searching, view toggling, and usage tracking.
 */

class PMPResourcesManager {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupViewToggle();
        this.setupResourceTracking();
        this.setupSearchEnhancements();
        this.setupFilterEnhancements();
        this.setupResourceInteractions();
    }
    
    /**
     * Setup view toggle functionality (grid/list)
     */
    setupViewToggle() {
        const viewButtons = document.querySelectorAll('[data-view]');
        const resourcesGrid = document.querySelector('.resources-grid');
        
        if (!viewButtons.length || !resourcesGrid) return;
        
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const view = button.dataset.view;
                
                // Update active button
                viewButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update grid class
                resourcesGrid.classList.remove('grid-view', 'list-view');
                resourcesGrid.classList.add(view + '-view');
                
                // Store preference
                localStorage.setItem('pmp_resources_view', view);
                
                // Animate transition
                resourcesGrid.style.opacity = '0.7';
                setTimeout(() => {
                    resourcesGrid.style.opacity = '1';
                }, 150);
            });
        });
        
        // Restore saved view preference
        const savedView = localStorage.getItem('pmp_resources_view');
        if (savedView && resourcesGrid) {
            const viewButton = document.querySelector(`[data-view="${savedView}"]`);
            if (viewButton) {
                viewButton.click();
            }
        }
    }
    
    /**
     * Setup resource usage tracking
     */
    setupResourceTracking() {
        const resourceLinks = document.querySelectorAll('.resource-download, .resource-watch, .resource-use');
        
        resourceLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const resourceCard = link.closest('.resource-card');
                const resourceId = resourceCard?.dataset.resourceId;
                
                if (resourceId && typeof pmpData !== 'undefined') {
                    this.trackResourceUsage(resourceId, link.classList.contains('resource-download') ? 'download' : 
                                          link.classList.contains('resource-watch') ? 'watch' : 'use');
                }
                
                // Add visual feedback
                this.addClickFeedback(link);
            });
        });
    }
    
    /**
     * Track resource usage via AJAX
     */
    trackResourceUsage(resourceId, actionType) {
        if (typeof pmpData === 'undefined') return;
        
        fetch(pmpData.ajaxUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                action: 'pmp_track_resource_usage',
                resource_id: resourceId,
                action_type: actionType,
                user_id: pmpData.userId,
                nonce: pmpData.nonce
            })
        }).catch(error => {
            console.log('Resource tracking failed:', error);
        });
    }
    
    /**
     * Add visual feedback for button clicks
     */
    addClickFeedback(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);
    }
    
    /**
     * Setup search enhancements
     */
    setupSearchEnhancements() {
        const searchForm = document.querySelector('.search-form');
        const searchInput = searchForm?.querySelector('input[name="search"]');
        
        if (!searchInput) return;
        
        // Add clear button if there's a search value
        if (searchInput.value.trim()) {
            this.addClearButton(searchInput);
        }
        
        // Auto-submit on enter
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchForm.submit();
            }
        });
        
        // Real-time search suggestions (if implemented)
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.handleSearchInput(e.target.value);
            }, 300);
        });
    }
    
    /**
     * Add clear button to search input
     */
    addClearButton(searchInput) {
        const inputGroup = searchInput.parentElement;
        const clearButton = document.createElement('button');
        clearButton.type = 'button';
        clearButton.className = 'btn btn-outline-secondary clear-search';
        clearButton.innerHTML = '<i class="fas fa-times"></i>';
        clearButton.title = 'Clear search';
        
        clearButton.addEventListener('click', () => {
            searchInput.value = '';
            searchInput.closest('form').submit();
        });
        
        // Insert before the search button
        const searchButton = inputGroup.querySelector('button[type="submit"]');
        inputGroup.insertBefore(clearButton, searchButton);
    }
    
    /**
     * Handle search input for suggestions
     */
    handleSearchInput(query) {
        // This could be enhanced to show search suggestions
        // For now, just update the placeholder
        const searchInput = document.querySelector('.search-form input[name="search"]');
        if (searchInput && query.length > 2) {
            searchInput.setAttribute('data-searching', 'true');
        } else if (searchInput) {
            searchInput.removeAttribute('data-searching');
        }
    }
    
    /**
     * Setup filter enhancements
     */
    setupFilterEnhancements() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                // Add loading state
                button.style.opacity = '0.7';
                button.innerHTML += ' <i class="fas fa-spinner fa-spin"></i>';
            });
        });
        
        // Setup filter removal
        const removeFilters = document.querySelectorAll('.remove-filter');
        removeFilters.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = link.href;
            });
        });
    }
    
    /**
     * Setup enhanced resource interactions
     */
    setupResourceInteractions() {
        const resourceCards = document.querySelectorAll('.resource-card');
        
        resourceCards.forEach(card => {
            // Add hover effects for better UX
            card.addEventListener('mouseenter', () => {
                this.handleCardHover(card, true);
            });
            
            card.addEventListener('mouseleave', () => {
                this.handleCardHover(card, false);
            });
            
            // Setup keyboard navigation
            const actionButton = card.querySelector('.resource-download, .resource-watch, .resource-use');
            if (actionButton) {
                actionButton.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        actionButton.click();
                    }
                });
            }
        });
        
        // Setup video preview on hover (for video cards)
        this.setupVideoPreview();
        
        // Setup PDF preview modal (for PDF cards)
        this.setupPDFPreview();
        
        // Setup tool feature expansion
        this.setupToolFeatures();
    }
    
    /**
     * Handle card hover effects
     */
    handleCardHover(card, isHovering) {
        const thumbnail = card.querySelector('.resource-thumbnail');
        const playOverlay = card.querySelector('.video-play-overlay');
        
        if (isHovering) {
            card.style.transform = 'translateY(-2px)';
            if (playOverlay) {
                playOverlay.style.opacity = '1';
                playOverlay.style.transform = 'translate(-50%, -50%) scale(1.1)';
            }
        } else {
            card.style.transform = 'translateY(0)';
            if (playOverlay) {
                playOverlay.style.opacity = '0.8';
                playOverlay.style.transform = 'translate(-50%, -50%) scale(1)';
            }
        }
    }
    
    /**
     * Setup video preview functionality
     */
    setupVideoPreview() {
        const videoCards = document.querySelectorAll('.resource-card.resource-type-video');
        
        videoCards.forEach(card => {
            const thumbnail = card.querySelector('.video-thumbnail');
            if (!thumbnail) return;
            
            thumbnail.addEventListener('click', (e) => {
                e.preventDefault();
                const videoUrl = card.querySelector('.resource-watch')?.href;
                if (videoUrl) {
                    // Could open in modal or navigate directly
                    window.open(videoUrl, '_blank');
                }
            });
            
            // Add cursor pointer
            thumbnail.style.cursor = 'pointer';
        });
    }
    
    /**
     * Setup PDF preview functionality
     */
    setupPDFPreview() {
        const pdfCards = document.querySelectorAll('.resource-card.resource-type-pdf');
        
        pdfCards.forEach(card => {
            const thumbnail = card.querySelector('.pdf-thumbnail');
            if (!thumbnail) return;
            
            thumbnail.addEventListener('click', (e) => {
                e.preventDefault();
                // Could show PDF preview modal
                const downloadLink = card.querySelector('.pdf-download');
                if (downloadLink) {
                    downloadLink.click();
                }
            });
            
            // Add cursor pointer
            thumbnail.style.cursor = 'pointer';
        });
    }
    
    /**
     * Setup tool features expansion
     */
    setupToolFeatures() {
        const toolCards = document.querySelectorAll('.resource-card.resource-type-tool');
        
        toolCards.forEach(card => {
            const featuresList = card.querySelector('.features-list');
            if (!featuresList) return;
            
            const features = featuresList.querySelectorAll('li');
            if (features.length > 3) {
                // Hide extra features initially
                features.forEach((feature, index) => {
                    if (index >= 3) {
                        feature.style.display = 'none';
                    }
                });
                
                // Add show more button
                const showMoreBtn = document.createElement('button');
                showMoreBtn.className = 'btn btn-sm btn-outline-secondary show-more-features';
                showMoreBtn.innerHTML = `<i class="fas fa-chevron-down"></i> Show ${features.length - 3} more`;
                showMoreBtn.type = 'button';
                
                showMoreBtn.addEventListener('click', () => {
                    const isExpanded = showMoreBtn.classList.contains('expanded');
                    
                    features.forEach((feature, index) => {
                        if (index >= 3) {
                            feature.style.display = isExpanded ? 'none' : 'flex';
                        }
                    });
                    
                    if (isExpanded) {
                        showMoreBtn.innerHTML = `<i class="fas fa-chevron-down"></i> Show ${features.length - 3} more`;
                        showMoreBtn.classList.remove('expanded');
                    } else {
                        showMoreBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Show less';
                        showMoreBtn.classList.add('expanded');
                    }
                });
                
                featuresList.parentElement.appendChild(showMoreBtn);
            }
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new PMPResourcesManager();
});

// Export for potential external use
window.PMPResourcesManager = PMPResourcesManager;