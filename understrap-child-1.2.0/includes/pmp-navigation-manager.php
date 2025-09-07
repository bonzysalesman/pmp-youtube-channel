<?php

/**
 * PMP Navigation Manager
 * 
 * Handles the creation and management of navigation menus
 * for the PMP WordPress theme
 *
 * @package UnderstrapChild
 */

// Exit if accessed directly.
defined('ABSPATH') || exit;

/**
 * PMP Navigation Manager Class
 */
class PMP_Navigation_Manager
{

    /**
     * Constructor
     */
    public function __construct()
    {
        add_action('init', array($this, 'register_navigation_menus'));
        add_action('after_setup_theme', array($this, 'setup_navigation_support'));
        add_filter('wp_nav_menu_args', array($this, 'modify_nav_menu_args'));
        add_filter('nav_menu_css_class', array($this, 'add_custom_nav_classes'), 10, 4);
        add_filter('nav_menu_link_attributes', array($this, 'add_nav_link_attributes'), 10, 4);
    }

    /**
     * Register navigation menu locations
     */
    public function register_navigation_menus()
    {
        register_nav_menus(array(
            'primary' => __('Primary Navigation', 'understrap-child'),
            'dashboard-sidebar' => __('Dashboard Sidebar', 'understrap-child'),
            'footer-quick-links' => __('Footer Quick Links', 'understrap-child'),
            'footer-resources' => __('Footer Resources', 'understrap-child'),
            'mobile-menu' => __('Mobile Menu', 'understrap-child'),
            'breadcrumb' => __('Breadcrumb Navigation', 'understrap-child')
        ));
    }

    /**
     * Setup navigation theme support
     */
    public function setup_navigation_support()
    {
        // Add theme support for menus
        add_theme_support('menus');

        // Add theme support for custom navigation walker
        add_theme_support('bootstrap-nav-walker');
    }

    /**
     * Create navigation menus programmatically
     */
    public function create_navigation_menus()
    {
        $menu_structure = PMP_Navigation_Config::get_main_menu_structure();

        // Create primary navigation menu
        $primary_menu_id = $this->create_menu_from_structure(
            'PMP Primary Navigation',
            $menu_structure
        );

        if ($primary_menu_id) {
            // Assign to primary location
            $locations = get_theme_mod('nav_menu_locations');
            $locations['primary'] = $primary_menu_id;
            set_theme_mod('nav_menu_locations', $locations);
        }

        // Create dashboard sidebar menu
        $dashboard_structure = PMP_Navigation_Config::get_dashboard_sidebar_structure();
        $dashboard_menu_id = $this->create_menu_from_structure(
            'PMP Dashboard Sidebar',
            $dashboard_structure
        );

        if ($dashboard_menu_id) {
            $locations = get_theme_mod('nav_menu_locations');
            $locations['dashboard-sidebar'] = $dashboard_menu_id;
            set_theme_mod('nav_menu_locations', $locations);
        }

        // Create footer menus
        $footer_structure = PMP_Navigation_Config::get_footer_navigation_structure();

        foreach ($footer_structure as $column_key => $column_data) {
            $menu_name = 'PMP Footer - ' . $column_data['title'];
            $menu_id = $this->create_menu_from_structure($menu_name, $column_data['items']);

            if ($menu_id) {
                $location_key = str_replace('column-', 'footer-', $column_key);
                $locations = get_theme_mod('nav_menu_locations');
                $locations[$location_key] = $menu_id;
                set_theme_mod('nav_menu_locations', $locations);
            }
        }
    }

    /**
     * Create a WordPress menu from structure array
     * 
     * @param string $menu_name Menu name
     * @param array $structure Menu structure
     * @return int|false Menu ID or false on failure
     */
    private function create_menu_from_structure($menu_name, $structure)
    {
        // Check if menu already exists
        $menu_exists = wp_get_nav_menu_object($menu_name);
        if ($menu_exists) {
            return $menu_exists->term_id;
        }

        // Create new menu
        $menu_id = wp_create_nav_menu($menu_name);
        if (is_wp_error($menu_id)) {
            return false;
        }

        // Add menu items
        $this->add_menu_items_recursive($menu_id, $structure);

        return $menu_id;
    }

    /**
     * Add menu items recursively
     * 
     * @param int $menu_id Menu ID
     * @param array $items Menu items
     * @param int $parent_id Parent menu item ID
     */
    private function add_menu_items_recursive($menu_id, $items, $parent_id = 0)
    {
        foreach ($items as $item_key => $item_data) {
            // Skip items that should only show when logged in
            if (
                isset($item_data['show_when_logged_in']) &&
                $item_data['show_when_logged_in'] &&
                ! is_user_logged_in()
            ) {
                continue;
            }

            $menu_item_data = array(
                'menu-item-title' => $item_data['title'],
                'menu-item-url' => $item_data['url'],
                'menu-item-status' => 'publish',
                'menu-item-parent-id' => $parent_id
            );

            // Add custom classes if specified
            if (isset($item_data['icon'])) {
                $menu_item_data['menu-item-classes'] = 'nav-item-with-icon';
            }

            if (isset($item_data['color'])) {
                $menu_item_data['menu-item-attr-title'] = $item_data['color'];
            }

            $menu_item_id = wp_update_nav_menu_item($menu_id, 0, $menu_item_data);

            // Add custom meta data
            if (isset($item_data['icon'])) {
                update_post_meta($menu_item_id, '_menu_item_icon', $item_data['icon']);
            }

            if (isset($item_data['description'])) {
                update_post_meta($menu_item_id, '_menu_item_description', $item_data['description']);
            }

            if (isset($item_data['color'])) {
                update_post_meta($menu_item_id, '_menu_item_color', $item_data['color']);
            }

            // Add child items if they exist
            if (isset($item_data['children']) && is_array($item_data['children'])) {
                $this->add_menu_items_recursive($menu_id, $item_data['children'], $menu_item_id);
            }
        }
    }

    /**
     * Modify navigation menu arguments
     * 
     * @param array $args Menu arguments
     * @return array Modified arguments
     */
    public function modify_nav_menu_args($args)
    {
        // Add custom walker for primary menu
        if (isset($args['theme_location']) && $args['theme_location'] === 'primary') {
            if (class_exists('Understrap_WP_Bootstrap_Navwalker')) {
                $args['walker'] = new Understrap_WP_Bootstrap_Navwalker();
            }

            // Add custom menu classes
            $args['menu_class'] = isset($args['menu_class'])
                ? $args['menu_class'] . ' pmp-primary-nav'
                : 'pmp-primary-nav';
        }

        // Dashboard sidebar menu modifications
        if (isset($args['theme_location']) && $args['theme_location'] === 'dashboard-sidebar') {
            $args['menu_class'] = 'pmp-dashboard-nav list-unstyled';
            $args['container'] = false;
        }

        return $args;
    }

    /**
     * Add custom CSS classes to navigation items
     * 
     * @param array $classes CSS classes
     * @param object $item Menu item
     * @param object $args Menu arguments
     * @param int $depth Menu depth
     * @return array Modified classes
     */
    public function add_custom_nav_classes($classes, $item, $args, $depth)
    {
        // Add icon class if item has icon
        $icon = get_post_meta($item->ID, '_menu_item_icon', true);
        if ($icon) {
            $classes[] = 'has-icon';
        }

        // Add color class if item has color
        $color = get_post_meta($item->ID, '_menu_item_color', true);
        if ($color) {
            $classes[] = 'has-color';
        }

        // Add depth class
        $classes[] = 'menu-depth-' . $depth;

        // Add current page class
        if ($item->url === get_permalink()) {
            $classes[] = 'current-page';
        }

        return $classes;
    }

    /**
     * Add custom attributes to navigation links
     * 
     * @param array $atts Link attributes
     * @param object $item Menu item
     * @param object $args Menu arguments
     * @param int $depth Menu depth
     * @return array Modified attributes
     */
    public function add_nav_link_attributes($atts, $item, $args, $depth)
    {
        // Add data attributes for tracking
        $atts['data-menu-item'] = $item->ID;
        $atts['data-menu-depth'] = $depth;

        // Add color style if specified
        $color = get_post_meta($item->ID, '_menu_item_color', true);
        if ($color) {
            $atts['data-color'] = $color;
        }

        // Add description as title attribute
        $description = get_post_meta($item->ID, '_menu_item_description', true);
        if ($description) {
            $atts['title'] = $description;
        }

        return $atts;
    }

    /**
     * Get navigation menu HTML with icons
     * 
     * @param string $theme_location Menu location
     * @param array $args Additional arguments
     * @return string Menu HTML
     */
    public function get_nav_menu_with_icons($theme_location, $args = array())
    {
        $defaults = array(
            'theme_location' => $theme_location,
            'container' => false,
            'echo' => false,
            'items_wrap' => '<ul class="%2$s">%3$s</ul>',
            'walker' => new PMP_Icon_Nav_Walker()
        );

        $args = wp_parse_args($args, $defaults);

        return wp_nav_menu($args);
    }

    /**
     * Display breadcrumb navigation
     * 
     * @param array $args Breadcrumb arguments
     */
    public function display_breadcrumbs($args = array())
    {
        $config = PMP_Navigation_Config::get_breadcrumb_config();
        $args = wp_parse_args($args, $config);

        if (is_front_page() && ! $args['show_on_front']) {
            return;
        }

        $breadcrumbs = array();

        // Add home link
        $breadcrumbs[] = array(
            'title' => $args['home_text'],
            'url' => home_url('/'),
            'current' => false
        );

        // Add page-specific breadcrumbs
        if (is_singular()) {
            global $post;

            // Check for custom page templates
            $page_template = get_page_template_slug($post->ID);

            // Handle specific page templates
            if ($page_template === 'page-dashboard.php') {
                // Dashboard page
                if ($args['show_current']) {
                    $breadcrumbs[] = array(
                        'title' => __('Dashboard', 'understrap-child'),
                        'url' => get_permalink(),
                        'current' => true
                    );
                }
            } elseif ($page_template === 'page-resources.php') {
                // Resources page
                if ($args['show_current']) {
                    $breadcrumbs[] = array(
                        'title' => __('Resources', 'understrap-child'),
                        'url' => get_permalink(),
                        'current' => true
                    );
                }
            } else {
                // Add custom post type archive if applicable
                if (isset($args['custom_post_types'][$post->post_type])) {
                    $cpt_config = $args['custom_post_types'][$post->post_type];
                    $breadcrumbs[] = array(
                        'title' => $cpt_config['archive_text'],
                        'url' => $cpt_config['archive_url'],
                        'current' => false
                    );
                }

                // Add lesson week/domain hierarchy for lessons
                if ($post->post_type === 'lesson') {
                    $lesson_week = get_post_meta($post->ID, '_lesson_week_number', true);
                    $lesson_domain = get_post_meta($post->ID, '_lesson_domain', true);

                    if ($lesson_domain) {
                        $domain_names = array(
                            'people' => __('People Domain', 'understrap-child'),
                            'process' => __('Process Domain', 'understrap-child'),
                            'business' => __('Business Environment', 'understrap-child'),
                            'foundation' => __('Foundation', 'understrap-child'),
                            'review' => __('Review', 'understrap-child'),
                            'final' => __('Final Preparation', 'understrap-child')
                        );

                        if (isset($domain_names[$lesson_domain])) {
                            $breadcrumbs[] = array(
                                'title' => $domain_names[$lesson_domain],
                                'url' => home_url('/lessons/' . $lesson_domain . '-domain/'),
                                'current' => false
                            );
                        }
                    }

                    if ($lesson_week) {
                        $breadcrumbs[] = array(
                            'title' => sprintf(__('Week %d', 'understrap-child'), $lesson_week),
                            'url' => home_url('/lessons/week-' . $lesson_week . '/'),
                            'current' => false
                        );
                    }
                }

                // Add current page
                if ($args['show_current']) {
                    $breadcrumbs[] = array(
                        'title' => get_the_title(),
                        'url' => get_permalink(),
                        'current' => true
                    );
                }
            }
        } elseif (is_archive()) {
            // Handle archive pages
            if (is_category()) {
                $breadcrumbs[] = array(
                    'title' => single_cat_title('', false),
                    'url' => get_category_link(get_queried_object_id()),
                    'current' => true
                );
            } elseif (is_tag()) {
                $breadcrumbs[] = array(
                    'title' => single_tag_title('', false),
                    'url' => get_tag_link(get_queried_object_id()),
                    'current' => true
                );
            } elseif (is_post_type_archive()) {
                $post_type = get_query_var('post_type');
                $post_type_obj = get_post_type_object($post_type);

                if ($post_type_obj) {
                    $breadcrumbs[] = array(
                        'title' => $post_type_obj->labels->name,
                        'url' => get_post_type_archive_link($post_type),
                        'current' => true
                    );
                }
            }
        } elseif (is_search()) {
            $breadcrumbs[] = array(
                'title' => sprintf(__('Search Results for "%s"', 'understrap-child'), get_search_query()),
                'url' => '',
                'current' => true
            );
        } elseif (is_404()) {
            $breadcrumbs[] = array(
                'title' => __('Page Not Found', 'understrap-child'),
                'url' => '',
                'current' => true
            );
        }

        // Output breadcrumbs
        if (! empty($breadcrumbs) && count($breadcrumbs) > 1) {
            echo '<nav class="pmp-breadcrumbs" aria-label="' . esc_attr__('Breadcrumb Navigation', 'understrap-child') . '">';
            echo '<ol class="breadcrumb">';

            foreach ($breadcrumbs as $index => $crumb) {
                $is_last = ($index === count($breadcrumbs) - 1);

                echo '<li class="breadcrumb-item' . ($crumb['current'] ? ' active' : '') . '">';

                if (! $crumb['current'] && ! $is_last && ! empty($crumb['url'])) {
                    echo '<a href="' . esc_url($crumb['url']) . '">' . esc_html($crumb['title']) . '</a>';
                } else {
                    echo esc_html($crumb['title']);
                }

                echo '</li>';
            }

            echo '</ol>';
            echo '</nav>';
        }
    }
}

/**
 * Custom Navigation Walker with Icon Support
 */
class PMP_Icon_Nav_Walker extends Walker_Nav_Menu
{

    /**
     * Start the element output
     */
    public function start_el(&$output, $item, $depth = 0, $args = null, $id = 0)
    {
        $indent = ($depth) ? str_repeat("\t", $depth) : '';

        $classes = empty($item->classes) ? array() : (array) $item->classes;
        $classes[] = 'menu-item-' . $item->ID;

        $class_names = join(' ', apply_filters('nav_menu_css_class', array_filter($classes), $item, $args));
        $class_names = $class_names ? ' class="' . esc_attr($class_names) . '"' : '';

        $id = apply_filters('nav_menu_item_id', 'menu-item-' . $item->ID, $item, $args);
        $id = $id ? ' id="' . esc_attr($id) . '"' : '';

        $output .= $indent . '<li' . $id . $class_names . '>';

        $attributes = ! empty($item->attr_title) ? ' title="'  . esc_attr($item->attr_title) . '"' : '';
        $attributes .= ! empty($item->target)     ? ' target="' . esc_attr($item->target) . '"' : '';
        $attributes .= ! empty($item->xfn)        ? ' rel="'    . esc_attr($item->xfn) . '"' : '';
        $attributes .= ! empty($item->url)        ? ' href="'   . esc_attr($item->url) . '"' : '';

        // Get icon
        $icon = get_post_meta($item->ID, '_menu_item_icon', true);
        $icon_html = $icon ? '<i class="' . esc_attr($icon) . ' me-2"></i>' : '';

        // Get description
        $description = get_post_meta($item->ID, '_menu_item_description', true);
        $description_html = $description ? '<small class="d-block text-muted">' . esc_html($description) . '</small>' : '';

        $item_output = isset($args->before) ? $args->before : '';
        $item_output .= '<a' . $attributes . '>';
        $item_output .= $icon_html;
        $item_output .= (isset($args->link_before) ? $args->link_before : '') . apply_filters('the_title', $item->title, $item->ID) . (isset($args->link_after) ? $args->link_after : '');
        $item_output .= $description_html;
        $item_output .= '</a>';
        $item_output .= isset($args->after) ? $args->after : '';

        $output .= apply_filters('walker_nav_menu_start_el', $item_output, $item, $depth, $args);
    }
}

// Initialize the navigation manager
new PMP_Navigation_Manager();
