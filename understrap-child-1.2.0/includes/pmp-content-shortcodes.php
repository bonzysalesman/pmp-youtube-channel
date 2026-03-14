<?php

/**
 * PMP Content Shortcodes
 * 
 * Shortcodes for ECO references and practice questions in lesson content
 */

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

/**
 * ECO Reference Shortcode
 * Usage: [eco_reference ref="1.1.1" title="Build a Team" domain="people"]Content here[/eco_reference]
 */
function pmp_eco_reference_shortcode($atts, $content = null)
{
    $atts = shortcode_atts([
        'ref' => '',
        'title' => '',
        'domain' => 'mixed'
    ], $atts, 'eco_reference');

    if (empty($atts['ref']) || empty($content)) {
        return '';
    }

    $domain_class = sanitize_html_class($atts['domain']);
    $eco_ref = esc_html($atts['ref']);
    $title = esc_html($atts['title']);
    $content = do_shortcode($content);

    ob_start();
?>
    <div class="eco-reference-block domain-<?php echo $domain_class; ?>" data-eco-ref="<?php echo $eco_ref; ?>">
        <div class="eco-reference-header">
            <div class="eco-reference-number"><?php echo $eco_ref; ?></div>
            <?php if ($title): ?>
                <h4 class="eco-reference-title"><?php echo $title; ?></h4>
            <?php endif; ?>
        </div>
        <div class="eco-reference-content">
            <?php echo $content; ?>
        </div>
    </div>
<?php
    return ob_get_clean();
}
add_shortcode('eco_reference', 'pmp_eco_reference_shortcode');

/**
 * Practice Question Shortcode
 * Usage: [practice_question id="q1" number="1" difficulty="medium" eco_ref="1.1.1" correct="A"]
 * Question text here
 * [option letter="A"]Option A text[/option]
 * [option letter="B"]Option B text[/option]
 * [option letter="C"]Option C text[/option]
 * [option letter="D"]Option D text[/option]
 * [explanation]Explanation text here[/explanation]
 * [/practice_question]
 */
function pmp_practice_question_shortcode($atts, $content = null)
{
    $atts = shortcode_atts([
        'id' => '',
        'number' => '1',
        'difficulty' => 'medium',
        'eco_ref' => '',
        'correct' => 'A'
    ], $atts, 'practice_question');

    if (empty($atts['id']) || empty($content)) {
        return '';
    }

    // Parse the content to extract question, options, and explanation
    $parsed_content = pmp_parse_question_content($content);

    if (empty($parsed_content['question']) || empty($parsed_content['options'])) {
        return '';
    }

    $question_id = sanitize_html_class($atts['id']);
    $number = esc_html($atts['number']);
    $difficulty = sanitize_html_class($atts['difficulty']);
    $eco_ref = esc_html($atts['eco_ref']);
    $correct_answer = esc_html($atts['correct']);

    ob_start();
?>
    <div class="practice-question-block" data-question-id="<?php echo $question_id; ?>" data-correct-answer="<?php echo $correct_answer; ?>">
        <div class="practice-question-header">
            <div class="practice-question-meta">
                <div class="question-number">Question <?php echo $number; ?></div>
                <div class="question-difficulty difficulty-<?php echo $difficulty; ?>"><?php echo ucfirst($difficulty); ?></div>
                <?php if ($eco_ref): ?>
                    <div class="question-eco-ref">ECO: <?php echo $eco_ref; ?></div>
                <?php endif; ?>
            </div>
            <p class="practice-question-text"><?php echo $parsed_content['question']; ?></p>
        </div>
        <div class="practice-question-content">
            <div class="answer-options">
                <?php foreach ($parsed_content['options'] as $letter => $option_text): ?>
                    <div class="answer-option" data-answer="<?php echo esc_attr($letter); ?>" tabindex="0" role="button" aria-label="Answer option <?php echo esc_attr($letter); ?>">
                        <div class="answer-letter"><?php echo esc_html($letter); ?></div>
                        <div class="answer-text"><?php echo $option_text; ?></div>
                    </div>
                <?php endforeach; ?>
            </div>
        </div>
        <?php if (!empty($parsed_content['explanation'])): ?>
            <div class="answer-explanation">
                <div class="explanation-header">
                    <div class="explanation-icon">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0a8 8 0 100 16A8 8 0 008 0zM7 3a1 1 0 012 0v5a1 1 0 01-2 0V3zm2 8a1 1 0 11-2 0 1 1 0 012 0z" />
                        </svg>
                    </div>
                    <h5 class="explanation-title">Explanation</h5>
                </div>
                <div class="explanation-content">
                    <?php echo $parsed_content['explanation']; ?>
                </div>
            </div>
        <?php endif; ?>
        <div class="question-actions">
            <button class="question-submit-btn" disabled>Submit Answer</button>
            <div class="question-feedback"></div>
            <button class="question-reset-btn" style="display: none;">Try Again</button>
        </div>
    </div>
<?php
    return ob_get_clean();
}
add_shortcode('practice_question', 'pmp_practice_question_shortcode');

/**
 * Option Shortcode (used within practice_question)
 * Usage: [option letter="A"]Option text[/option]
 */
function pmp_option_shortcode($atts, $content = null)
{
    $atts = shortcode_atts([
        'letter' => 'A'
    ], $atts, 'option');

    // This shortcode is processed by pmp_parse_question_content
    // We return a placeholder that will be replaced
    return '[OPTION_' . $atts['letter'] . ']' . do_shortcode($content) . '[/OPTION_' . $atts['letter'] . ']';
}
add_shortcode('option', 'pmp_option_shortcode');

/**
 * Explanation Shortcode (used within practice_question)
 * Usage: [explanation]Explanation text[/explanation]
 */
function pmp_explanation_shortcode($atts, $content = null)
{
    // This shortcode is processed by pmp_parse_question_content
    // We return a placeholder that will be replaced
    return '[EXPLANATION]' . do_shortcode($content) . '[/EXPLANATION]';
}
add_shortcode('explanation', 'pmp_explanation_shortcode');

/**
 * Parse practice question content to extract question, options, and explanation
 */
function pmp_parse_question_content($content)
{
    $content = do_shortcode($content);

    $result = [
        'question' => '',
        'options' => [],
        'explanation' => ''
    ];

    // Extract explanation
    if (preg_match('/\[EXPLANATION\](.*?)\[\/EXPLANATION\]/s', $content, $matches)) {
        $result['explanation'] = trim($matches[1]);
        $content = str_replace($matches[0], '', $content);
    }

    // Extract options
    if (preg_match_all('/\[OPTION_([A-Z])\](.*?)\[\/OPTION_\1\]/s', $content, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $match) {
            $letter = $match[1];
            $option_text = trim($match[2]);
            $result['options'][$letter] = $option_text;
            $content = str_replace($match[0], '', $content);
        }
    }

    // The remaining content is the question
    $result['question'] = trim($content);

    return $result;
}

/**
 * Key Concept Shortcode
 * Usage: [key_concept title="Risk Management"]Content here[/key_concept]
 */
function pmp_key_concept_shortcode($atts, $content = null)
{
    $atts = shortcode_atts([
        'title' => 'Key Concept'
    ], $atts, 'key_concept');

    if (empty($content)) {
        return '';
    }

    $title = esc_html($atts['title']);
    $content = do_shortcode($content);

    ob_start();
?>
    <div class="key-concept-block">
        <div class="key-concept-header">
            <div class="key-concept-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h4 class="key-concept-title"><?php echo $title; ?></h4>
        </div>
        <div class="key-concept-content">
            <?php echo $content; ?>
        </div>
    </div>
<?php
    return ob_get_clean();
}
add_shortcode('key_concept', 'pmp_key_concept_shortcode');

/**
 * Important Note Shortcode
 * Usage: [important_note]Content here[/important_note]
 */
function pmp_important_note_shortcode($atts, $content = null)
{
    if (empty($content)) {
        return '';
    }

    $content = do_shortcode($content);

    ob_start();
?>
    <div class="important-note-block">
        <div class="important-note-header">
            <div class="important-note-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                </svg>
            </div>
            <h4 class="important-note-title">Important</h4>
        </div>
        <div class="important-note-content">
            <?php echo $content; ?>
        </div>
    </div>
<?php
    return ob_get_clean();
}
add_shortcode('important_note', 'pmp_important_note_shortcode');

/**
 * Exam Tip Shortcode
 * Usage: [exam_tip]Content here[/exam_tip]
 */
function pmp_exam_tip_shortcode($atts, $content = null)
{
    if (empty($content)) {
        return '';
    }

    $content = do_shortcode($content);

    ob_start();
?>
    <div class="exam-tip-block">
        <div class="exam-tip-header">
            <div class="exam-tip-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            </div>
            <h4 class="exam-tip-title">Exam Tip</h4>
        </div>
        <div class="exam-tip-content">
            <?php echo $content; ?>
        </div>
    </div>
<?php
    return ob_get_clean();
}
add_shortcode('exam_tip', 'pmp_exam_tip_shortcode');
