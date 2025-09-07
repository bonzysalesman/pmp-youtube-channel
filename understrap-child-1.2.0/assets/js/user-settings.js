/**
 * PMP User Settings JavaScript
 * Handles settings form interactions, auto-save, and real-time updates
 */

(function($) {
    'use strict';

    class PMPUserSettings {
        constructor() {
            this.form = $('#pmp-settings-form');
            this.saveButton = $('#save-settings');
            this.resetButton = $('#reset-settings');
            this.statusElement = $('#settings-status');
            this.autoSaveTimeout = null;
            this.hasUnsavedChanges = false;
            
            this.init();
        }

        init() {
            this.bindEvents();
            this.initializeTooltips();
            this.setupAutoSave();
            this.loadUserPreferences();
        }

        bindEvents() {
            // Form submission
            this.form.on('submit', this.handleFormSubmit.bind(this));
            
            // Reset button
            this.resetButton.on('click', this.handleReset.bind(this));
            
            // Input changes for auto-save
            this.form.on('change', 'input, select, textarea', this.handleInputChange.bind(this));
            
            // Tab navigation
            $('.settings-nav .nav-link').on('click', this.handleTabChange.bind(this));
            
            // Theme preference change
            $('#theme_preference').on('change', this.handleThemeChange.bind(this));
            
            // Compact mode toggle
            $('#compact_mode').on('change', this.handleCompactModeChange.bind(this));
            
            // Study time goal slider
            $('#study_time_goal').on('input', this.handleStudyTimeGoalChange.bind(this));
            
            // Notification toggles
            $('.form-check-input[name^="notifications"]').on('change', this.handleNotificationChange.bind(this));
            
            // Before unload warning
            $(window).on('beforeunload', this.handleBeforeUnload.bind(this));
        }

        initializeTooltips() {
            // Initialize Bootstrap tooltips for help text
            $('[data-bs-toggle="tooltip"]').tooltip();
            
            // Add help tooltips to complex settings
            this.addHelpTooltips();
        }

        addHelpTooltips() {
            const tooltips = {
                'difficulty_preference': 'Adaptive mode adjusts question difficulty based on your performance',
                'study_time_goal': 'Recommended: 30-45 minutes per day for optimal retention',
                'timezone': 'Used for scheduling reminders and progress tracking',
                'theme_preference': 'Auto mode follows your system preference'
            };

            Object.keys(tooltips).forEach(id => {
                const element = $(`#${id}`);
                if (element.length) {
                    element.attr('title', tooltips[id])
                           .attr('data-bs-toggle', 'tooltip')
                           .tooltip();
                }
            });
        }

        setupAutoSave() {
            // Auto-save every 30 seconds if there are changes
            setInterval(() => {
                if (this.hasUnsavedChanges) {
                    this.autoSaveSettings();
                }
            }, 30000);
        }

        loadUserPreferences() {
            // Apply saved theme preference immediately
            const themePreference = $('#theme_preference').val();
            this.applyThemePreference(themePreference);
            
            // Apply compact mode if enabled
            const compactMode = $('#compact_mode').is(':checked');
            this.applyCompactMode(compactMode);
            
            // Update study time goal display
            this.updateStudyTimeGoalDisplay();
        }

        handleFormSubmit(event) {
            event.preventDefault();
            this.saveSettings();
        }

        handleReset(event) {
            event.preventDefault();
            
            if (confirm('Are you sure you want to reset all settings to their default values? This action cannot be undone.')) {
                this.resetSettings();
            }
        }

        handleInputChange(event) {
            this.hasUnsavedChanges = true;
            this.updateSaveStatus('unsaved');
            
            // Clear auto-save timeout and set new one
            if (this.autoSaveTimeout) {
                clearTimeout(this.autoSaveTimeout);
            }
            
            this.autoSaveTimeout = setTimeout(() => {
                this.autoSaveSettings();
            }, 2000);
        }

        handleTabChange(event) {
            const targetTab = $(event.target).attr('href');
            
            // Update URL hash without scrolling
            if (history.pushState) {
                history.pushState(null, null, targetTab);
            }
            
            // Track tab usage for analytics
            this.trackSettingsInteraction('tab_change', {
                tab: targetTab.replace('#', '')
            });
        }

        handleThemeChange(event) {
            const theme = $(event.target).val();
            this.applyThemePreference(theme);
            this.trackSettingsInteraction('theme_change', { theme });
        }

        handleCompactModeChange(event) {
            const compactMode = $(event.target).is(':checked');
            this.applyCompactMode(compactMode);
            this.trackSettingsInteraction('compact_mode_change', { enabled: compactMode });
        }

        handleStudyTimeGoalChange(event) {
            this.updateStudyTimeGoalDisplay();
            
            const goal = parseInt($(event.target).val());
            this.trackSettingsInteraction('study_goal_change', { minutes: goal });
        }

        handleNotificationChange(event) {
            const notificationType = $(event.target).attr('name');
            const enabled = $(event.target).is(':checked');
            
            this.trackSettingsInteraction('notification_change', {
                type: notificationType,
                enabled: enabled
            });
        }

        handleBeforeUnload(event) {
            if (this.hasUnsavedChanges) {
                const message = 'You have unsaved changes. Are you sure you want to leave?';
                event.returnValue = message;
                return message;
            }
        }

        async saveSettings() {
            this.updateSaveStatus('saving');
            this.saveButton.prop('disabled', true);

            try {
                const formData = new FormData(this.form[0]);
                formData.append('action', 'pmp_save_user_settings');
                formData.append('nonce', pmpSettingsData.nonce);

                const response = await fetch(pmpSettingsData.ajaxUrl, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    this.updateSaveStatus('saved');
                    this.hasUnsavedChanges = false;
                    this.showNotification('Settings saved successfully!', 'success');
                    
                    // Apply settings immediately
                    this.applySettingsToInterface();
                } else {
                    this.updateSaveStatus('error');
                    this.showNotification('Failed to save settings. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Settings save error:', error);
                this.updateSaveStatus('error');
                this.showNotification('An error occurred while saving settings.', 'error');
            } finally {
                this.saveButton.prop('disabled', false);
            }
        }

        async autoSaveSettings() {
            if (!this.hasUnsavedChanges) return;

            try {
                const formData = new FormData(this.form[0]);
                formData.append('action', 'pmp_save_user_settings');
                formData.append('nonce', pmpSettingsData.nonce);

                const response = await fetch(pmpSettingsData.ajaxUrl, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (result.success) {
                    this.hasUnsavedChanges = false;
                    this.updateSaveStatus('auto_saved');
                    
                    // Apply settings immediately
                    this.applySettingsToInterface();
                }
            } catch (error) {
                console.warn('Auto-save failed:', error);
            }
        }

        async resetSettings() {
            this.updateSaveStatus('resetting');
            this.resetButton.prop('disabled', true);

            try {
                const response = await fetch(pmpSettingsData.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'pmp_reset_user_settings',
                        nonce: pmpSettingsData.nonce
                    })
                });

                const result = await response.json();

                if (result.success) {
                    this.updateSaveStatus('reset');
                    this.hasUnsavedChanges = false;
                    this.showNotification('Settings reset to defaults successfully!', 'success');
                    
                    // Reload the page to show default values
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    this.updateSaveStatus('error');
                    this.showNotification('Failed to reset settings. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Settings reset error:', error);
                this.updateSaveStatus('error');
                this.showNotification('An error occurred while resetting settings.', 'error');
            } finally {
                this.resetButton.prop('disabled', false);
            }
        }

        updateSaveStatus(status) {
            const statusMessages = {
                'unsaved': '<i class="fas fa-exclamation-triangle text-warning me-1"></i>You have unsaved changes',
                'saving': '<i class="fas fa-spinner fa-spin text-primary me-1"></i>Saving settings...',
                'saved': '<i class="fas fa-check-circle text-success me-1"></i>Settings saved successfully',
                'auto_saved': '<i class="fas fa-check text-success me-1"></i>Auto-saved',
                'error': '<i class="fas fa-exclamation-circle text-danger me-1"></i>Error saving settings',
                'resetting': '<i class="fas fa-spinner fa-spin text-primary me-1"></i>Resetting to defaults...',
                'reset': '<i class="fas fa-undo text-success me-1"></i>Settings reset to defaults'
            };

            this.statusElement.html(statusMessages[status] || statusMessages['unsaved']);
        }

        applyThemePreference(theme) {
            const body = $('body');
            
            // Remove existing theme classes
            body.removeClass('theme-light theme-dark theme-auto');
            
            // Apply new theme
            if (theme === 'dark') {
                body.addClass('theme-dark');
            } else if (theme === 'auto') {
                body.addClass('theme-auto');
                // Check system preference
                if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    body.addClass('theme-dark');
                }
            } else {
                body.addClass('theme-light');
            }
        }

        applyCompactMode(enabled) {
            const body = $('body');
            
            if (enabled) {
                body.addClass('compact-mode');
            } else {
                body.removeClass('compact-mode');
            }
        }

        updateStudyTimeGoalDisplay() {
            const goalInput = $('#study_time_goal');
            const goalValue = parseInt(goalInput.val());
            
            // Update display text
            const displayText = `${goalValue} minutes`;
            goalInput.siblings('.goal-display').text(displayText);
            
            // Add visual feedback for goal ranges
            goalInput.removeClass('goal-low goal-medium goal-high');
            
            if (goalValue < 30) {
                goalInput.addClass('goal-low');
            } else if (goalValue <= 60) {
                goalInput.addClass('goal-medium');
            } else {
                goalInput.addClass('goal-high');
            }
        }

        applySettingsToInterface() {
            // Apply theme preference
            const themePreference = $('#theme_preference').val();
            this.applyThemePreference(themePreference);
            
            // Apply compact mode
            const compactMode = $('#compact_mode').is(':checked');
            this.applyCompactMode(compactMode);
            
            // Trigger custom event for other components to listen to
            $(document).trigger('pmp:settingsUpdated', {
                theme: themePreference,
                compactMode: compactMode
            });
        }

        showNotification(message, type = 'info') {
            const alertClass = type === 'success' ? 'alert-success' : 
                              type === 'error' ? 'alert-danger' : 'alert-info';
            
            const notification = $(`
                <div class="alert ${alertClass} alert-dismissible fade show settings-notification" role="alert">
                    ${message}
                    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
                </div>
            `);
            
            // Insert at top of settings content
            $('.settings-content .container').prepend(notification);
            
            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                notification.alert('close');
            }, 5000);
        }

        trackSettingsInteraction(action, data = {}) {
            // Track settings interactions for analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'settings_interaction', {
                    action: action,
                    ...data
                });
            }
            
            // Also send to WordPress for internal analytics
            $.post(pmpSettingsData.ajaxUrl, {
                action: 'pmp_track_settings_interaction',
                interaction_type: action,
                data: JSON.stringify(data),
                nonce: pmpSettingsData.nonce
            });
        }

        // Public method to update a single setting
        async updateSingleSetting(category, key, value) {
            try {
                const response = await fetch(pmpSettingsData.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'pmp_update_setting',
                        category: category,
                        key: key,
                        value: value,
                        nonce: pmpSettingsData.nonce
                    })
                });

                const result = await response.json();
                return result.success;
            } catch (error) {
                console.error('Single setting update error:', error);
                return false;
            }
        }

        // Public method to get current settings
        async getCurrentSettings() {
            try {
                const response = await fetch(pmpSettingsData.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        action: 'pmp_get_user_settings',
                        nonce: pmpSettingsData.nonce
                    })
                });

                const result = await response.json();
                return result.success ? result.data : null;
            } catch (error) {
                console.error('Get settings error:', error);
                return null;
            }
        }
    }

    // Initialize settings when DOM is ready
    $(document).ready(function() {
        if ($('#pmp-settings-form').length) {
            window.pmpUserSettings = new PMPUserSettings();
        }
    });

    // Expose class globally for external access
    window.PMPUserSettings = PMPUserSettings;

})(jQuery);