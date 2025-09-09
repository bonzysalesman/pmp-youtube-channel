// PMP Dashboard JavaScript
document.addEventListener('DOMContentLoaded', () => {
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
    continueBtn.addEventListener('click', () => {
      // Redirect to current lesson
      window.location.href = '/course/current';
    });
  }
    
  // View Progress button
  const progressBtn = document.getElementById('view-progress');
  if (progressBtn) {
    progressBtn.addEventListener('click', () => {
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
      for (const entry of entries) {
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
        
    element.addEventListener('mouseleave', () => {
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
}