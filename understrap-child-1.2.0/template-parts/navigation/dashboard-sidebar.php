<?php
/**
 * Dashboard Sidebar Navigation Template Part
 * 
 * Displays the dashboard sidebar navigation for logged-in users
 *
 * @package UnderstrapChild
 */

// Exit if accessed directly.
defined( 'ABSPATH' ) || exit;

// Only show for logged-in users
if ( ! is_user_logged_in() ) {
    return;
}

// Get dashboard navigation structure
$dashboard_nav = PMP_Navigation_Config::get_dashboard_sidebar_structure();
$current_user = wp_get_current_user();

// Get user progress data
$progress_tracker = class_exists( 'PMP_Progress_Tracker' ) ? new PMP_Progress_Tracker( $current_user->ID ) : null;
?>

<aside class="pmp-dashboard-sidebar" role="complementary" aria-label="<?php esc_attr_e( 'Dashboard Navigation', 'understrap-child' ); ?>">
    
    <?php // Mobile Dashboard Toggle ?>
    <button class="pmp-mobile-dashboard-toggle d-lg-none" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#dashboardSidebar" 
            aria-expanded="false" 
            aria-controls="dashboardSidebar">
        <i class="fas fa-bars me-2"></i>
        <?php esc_html_e( 'Dashboard Menu', 'understrap-child' ); ?>
    </button>

    <div class="collapse d-lg-block" id="dashboardSidebar">
        
        <?php // User Welcome Section ?>
        <div class="pmp-dashboard-welcome mb-4 p-3 bg-light rounded">
            <div class="d-flex align-items-center">
                <div class="pmp-user-avatar me-3">
                    <?php echo get_avatar( $current_user->ID, 48, '', '', array( 'class' => 'rounded-circle' ) ); ?>
                </div>
                <div class="pmp-user-info">
                    <h6 class="mb-1"><?php echo esc_html( $current_user->display_name ); ?></h6>
                    <small class="text-muted">
                        <?php 
                        if ( $progress_tracker ) {
                            $progress = $progress_tracker->get_overall_progress();
                            printf( esc_html__( '%d%% Complete', 'understrap-child' ), $progress );
                        } else {
                            esc_html_e( 'PMP Student', 'understrap-child' );
                        }
                        ?>
                    </small>
                </div>
            </div>
        </div>

        <?php // Progress Overview ?>
        <?php if ( $progress_tracker ) : ?>
            <div class="pmp-progress-overview mb-4">
                <div class="pmp-nav-section-title">
                    <?php esc_html_e( 'Progress Overview', 'understrap-child' ); ?>
                </div>
                
                <?php
                $overall_progress = $progress_tracker->get_overall_progress();
                $completed_lessons = $progress_tracker->get_completed_lessons_count();
                $total_lessons = 91; // 13 weeks * 7 days
                ?>
                
                <div class="progress mb-2" style="height: 8px;">
                    <div class="progress-bar bg-success" 
                         role="progressbar" 
                         style="width: <?php echo esc_attr( $overall_progress ); ?>%"
                         aria-valuenow="<?php echo esc_attr( $overall_progress ); ?>" 
                         aria-valuemin="0" 
                         aria-valuemax="100">
                    </div>
                </div>
                
                <div class="d-flex justify-content-between small text-muted">
                    <span><?php printf( esc_html__( '%d of %d lessons', 'understrap-child' ), $completed_lessons, $total_lessons ); ?></span>
                    <span><?php printf( esc_html__( '%d%%', 'understrap-child' ), $overall_progress ); ?></span>
                </div>
            </div>
        <?php endif; ?>

        <?php // Main Navigation ?>
        <nav class="pmp-dashboard-navigation" role="navigation">
            <div class="pmp-nav-section-title">
                <?php esc_html_e( 'Navigation', 'understrap-child' ); ?>
            </div>
            
            <?php
            wp_nav_menu( array(
                'theme_location'  => 'dashboard-sidebar',
                'container'       => false,
                'menu_class'      => 'pmp-dashboard-nav',
                'fallback_cb'     => array( __CLASS__, 'fallback_dashboard_menu' ),
                'walker'          => new PMP_Dashboard_Nav_Walker(),
                'items_wrap'      => '<ul class="%2$s">%3$s</ul>',
            ) );
            ?>
        </nav>

        <?php // Quick Actions ?>
        <div class="pmp-quick-actions mt-4">
            <div class="pmp-nav-section-title">
                <?php esc_html_e( 'Quick Actions', 'understrap-child' ); ?>
            </div>
            
            <div class="d-grid gap-2">
                <?php if ( $progress_tracker ) : ?>
                    <?php $current_lesson = $progress_tracker->get_current_lesson(); ?>
                    <?php if ( $current_lesson ) : ?>
                        <a href="<?php echo esc_url( get_permalink( $current_lesson['id'] ) ); ?>" 
                           class="btn btn-primary btn-sm">
                            <i class="fas fa-play me-1"></i>
                            <?php esc_html_e( 'Continue Learning', 'understrap-child' ); ?>
                        </a>
                    <?php endif; ?>
                <?php endif; ?>
                
                <a href="<?php echo esc_url( home_url( '/resources/practice-exams/' ) ); ?>" 
                   class="btn btn-outline-primary btn-sm">
                    <i class="fas fa-clipboard-check me-1"></i>
                    <?php esc_html_e( 'Practice Questions', 'understrap-child' ); ?>
                </a>
                
                <a href="<?php echo esc_url( home_url( '/resources/study-guides/' ) ); ?>" 
                   class="btn btn-outline-secondary btn-sm">
                    <i class="fas fa-download me-1"></i>
                    <?php esc_html_e( 'Download Resources', 'understrap-child' ); ?>
                </a>
            </div>
        </div>

        <?php // Study Streak ?>
        <?php if ( $progress_tracker ) : ?>
            <?php $study_streak = $progress_tracker->get_study_streak(); ?>
            <?php if ( $study_streak > 0 ) : ?>
                <div class="pmp-study-streak mt-4 p-3 bg-warning bg-opacity-10 rounded">
                    <div class="text-center">
                        <i class="fas fa-fire text-warning fa-2x mb-2"></i>
                        <div class="fw-bold"><?php printf( esc_html__( '%d Day Streak!', 'understrap-child' ), $study_streak ); ?></div>
                        <small class="text-muted"><?php esc_html_e( 'Keep it up!', 'understrap-child' ); ?></small>
                    </div>
                </div>
            <?php endif; ?>
        <?php endif; ?>

    </div><!-- .collapse -->

</aside>

<?php
/**
 * Custom Dashboard Navigation Walker
 */
class PMP_Dashboard_Nav_Walker extends Walker_Nav_Menu {
    
    public function start_el( &$output, $item, $depth = 0, $args = null, $id = 0 ) {
        $indent = ( $depth ) ? str_repeat( "\t", $depth ) : '';
        
        $classes = empty( $item->classes ) ? array() : (array) $item->classes;
        $classes[] = 'menu-item-' . $item->ID;
        
        // Add current page class
        if ( $item->url === get_permalink() || $item->url === home_url( $_SERVER['REQUEST_URI'] ) ) {
            $classes[] = 'current-page';
        }
        
        $class_names = join( ' ', apply_filters( 'nav_menu_css_class', array_filter( $classes ), $item, $args ) );
        $class_names = $class_names ? ' class="' . esc_attr( $class_names ) . '"' : '';
        
        $id = apply_filters( 'nav_menu_item_id', 'menu-item-' . $item->ID, $item, $args );
        $id = $id ? ' id="' . esc_attr( $id ) . '"' : '';
        
        $output .= $indent . '<li' . $id . $class_names .'>';
        
        $attributes = ! empty( $item->attr_title ) ? ' title="'  . esc_attr( $item->attr_title ) .'"' : '';
        $attributes .= ! empty( $item->target )     ? ' target="' . esc_attr( $item->target     ) .'"' : '';
        $attributes .= ! empty( $item->xfn )        ? ' rel="'    . esc_attr( $item->xfn        ) .'"' : '';
        $attributes .= ! empty( $item->url )        ? ' href="'   . esc_attr( $item->url        ) .'"' : '';
        
        // Get icon
        $icon = get_post_meta( $item->ID, '_menu_item_icon', true );
        $icon_html = $icon ? '<i class="' . esc_attr( $icon ) . '"></i>' : '';
        
        // Get dynamic content for specific items
        $dynamic_content = '';
        if ( isset( $item->classes ) && in_array( 'dynamic', $item->classes ) ) {
            $dynamic_content = $this->get_dynamic_content( $item );
        }
        
        $item_output = isset( $args->before ) ? $args->before : '';
        $item_output .= '<a' . $attributes .'>';
        $item_output .= $icon_html;
        $item_output .= ( isset( $args->link_before ) ? $args->link_before : '' ) . apply_filters( 'the_title', $item->title, $item->ID ) . ( isset( $args->link_after ) ? $args->link_after : '' );
        $item_output .= $dynamic_content;
        $item_output .= '</a>';
        $item_output .= isset( $args->after ) ? $args->after : '';
        
        $output .= apply_filters( 'walker_nav_menu_start_el', $item_output, $item, $depth, $args );
    }
    
    private function get_dynamic_content( $item ) {
        if ( strpos( $item->url, '#current-lesson' ) !== false ) {
            // Get current lesson info
            if ( class_exists( 'PMP_Progress_Tracker' ) ) {
                $progress_tracker = new PMP_Progress_Tracker( get_current_user_id() );
                $current_lesson = $progress_tracker->get_current_lesson();
                
                if ( $current_lesson ) {
                    return '<small class="d-block text-muted">' . esc_html( $current_lesson['title'] ) . '</small>';
                }
            }
        }
        
        return '';
    }
}

/**
 * Fallback menu for dashboard sidebar
 */
function fallback_dashboard_menu() {
    $dashboard_nav = PMP_Navigation_Config::get_dashboard_sidebar_structure();
    
    echo '<ul class="pmp-dashboard-nav">';
    foreach ( $dashboard_nav as $item_key => $item_data ) {
        $current_class = ( $item_data['url'] === get_permalink() ) ? ' current-page' : '';
        
        echo '<li class="menu-item' . esc_attr( $current_class ) . '">';
        echo '<a href="' . esc_url( $item_data['url'] ) . '">';
        
        if ( isset( $item_data['icon'] ) ) {
            echo '<i class="' . esc_attr( $item_data['icon'] ) . '"></i>';
        }
        
        echo esc_html( $item_data['title'] );
        echo '</a>';
        echo '</li>';
    }
    echo '</ul>';
}
?>