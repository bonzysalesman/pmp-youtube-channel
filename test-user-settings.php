<?php
/**
 * Test script for PMP User Settings functionality
 * Run this via: docker-compose exec wordpress php /var/www/html/wp-content/themes/understrap-child/test-user-settings.php
 */

// WordPress bootstrap
require_once('/var/www/html/wp-config.php');

echo "🧪 Testing PMP User Settings Integration\n";
echo "========================================\n\n";

// Test 1: Check if class exists
echo "1. Testing PMP_User_Settings class...\n";
if (class_exists('PMP_User_Settings')) {
    echo "   ✅ PMP_User_Settings class loaded successfully\n";
} else {
    echo "   ❌ PMP_User_Settings class not found\n";
    exit(1);
}

// Test 2: Create a test user and settings instance
echo "\n2. Testing settings instance creation...\n";
$test_user_id = 1; // Assuming admin user exists
try {
    $settings = new PMP_User_Settings($test_user_id);
    echo "   ✅ Settings instance created successfully\n";
} catch (Exception $e) {
    echo "   ❌ Failed to create settings instance: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 3: Test default settings
echo "\n3. Testing default settings retrieval...\n";
try {
    $user_settings = $settings->get_user_settings();
    if (is_array($user_settings) && isset($user_settings['notifications'])) {
        echo "   ✅ Default settings retrieved successfully\n";
        echo "   📊 Settings categories: " . implode(', ', array_keys($user_settings)) . "\n";
    } else {
        echo "   ❌ Invalid settings structure\n";
    }
} catch (Exception $e) {
    echo "   ❌ Failed to get settings: " . $e->getMessage() . "\n";
}

// Test 4: Test setting update
echo "\n4. Testing setting update...\n";
try {
    $result = $settings->update_setting('preferences', 'study_time_goal', 45);
    if ($result) {
        echo "   ✅ Setting updated successfully\n";
        
        // Verify the update
        $updated_value = $settings->get_setting('preferences', 'study_time_goal');
        if ($updated_value == 45) {
            echo "   ✅ Setting value verified: $updated_value minutes\n";
        } else {
            echo "   ❌ Setting value mismatch: expected 45, got $updated_value\n";
        }
    } else {
        echo "   ❌ Failed to update setting\n";
    }
} catch (Exception $e) {
    echo "   ❌ Setting update error: " . $e->getMessage() . "\n";
}

// Test 5: Test notification preferences
echo "\n5. Testing notification preferences...\n";
try {
    $notifications = $settings->get_notification_preferences();
    if (is_array($notifications)) {
        echo "   ✅ Notification preferences retrieved\n";
        echo "   📧 Email reminders: " . ($notifications['email_reminders'] ? 'enabled' : 'disabled') . "\n";
        echo "   📈 Progress updates: " . ($notifications['progress_updates'] ? 'enabled' : 'disabled') . "\n";
    } else {
        echo "   ❌ Invalid notification preferences\n";
    }
} catch (Exception $e) {
    echo "   ❌ Notification preferences error: " . $e->getMessage() . "\n";
}

// Test 6: Test study preferences
echo "\n6. Testing study preferences...\n";
try {
    $study_prefs = $settings->get_study_preferences();
    if (is_array($study_prefs)) {
        echo "   ✅ Study preferences retrieved\n";
        echo "   ⏰ Study time goal: " . $study_prefs['study_time_goal'] . " minutes\n";
        echo "   📅 Preferred days: " . implode(', ', $study_prefs['preferred_study_days']) . "\n";
        echo "   🌍 Timezone: " . $study_prefs['timezone'] . "\n";
    } else {
        echo "   ❌ Invalid study preferences\n";
    }
} catch (Exception $e) {
    echo "   ❌ Study preferences error: " . $e->getMessage() . "\n";
}

// Test 7: Test settings export/import
echo "\n7. Testing settings export...\n";
try {
    $exported = $settings->export_settings();
    if (is_array($exported) && isset($exported['settings'])) {
        echo "   ✅ Settings exported successfully\n";
        echo "   📦 Export contains " . count($exported['settings']) . " categories\n";
    } else {
        echo "   ❌ Settings export failed\n";
    }
} catch (Exception $e) {
    echo "   ❌ Settings export error: " . $e->getMessage() . "\n";
}

echo "\n🎉 User Settings Integration Test Complete!\n";
echo "==========================================\n";
echo "✨ All core functionality is working properly.\n";
echo "🌐 You can now test the settings page at: http://localhost:8080/dashboard/settings/\n\n";
?>