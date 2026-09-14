<?php
/**
 * Plugin Name: RK Student Portal (پرتال دانش‌آموز و مشاور راه کنکور)
 * Plugin URI:  https://rahkonkur.com
 * Description: پرتال جامع دانش‌آموز، مشاور و مدیر بر پایه معماری REST API مستقل، با پشتیبانی کامل از وب و اپلیکیشن موبایل، ثبت ساعت مطالعه، باشگاه پیشرفت، گزارش کار و نظرات عملکرد.
 * Version:     1.0.0
 * Author:      تیم فنی راه کنکور
 * Author URI:  https://rahkonkur.com
 * Text Domain: rk-student-portal
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 *
 * پیشوند توابع و کلاس‌ها: rksp_
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // Exit if accessed directly
}

// تعریف ثابت‌های عمومی افزونه
if ( ! defined( 'RKSP_VERSION' ) ) {
    define( 'RKSP_VERSION', '1.0.0' );
}
if ( ! defined( 'RKSP_PLUGIN_DIR' ) ) {
    define( 'RKSP_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
}
if ( ! defined( 'RKSP_PLUGIN_URL' ) ) {
    define( 'RKSP_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
}
if ( ! defined( 'RKSP_PLUGIN_BASENAME' ) ) {
    define( 'RKSP_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );
}

/**
 * بارگذاری فایل‌های اصلی افزونه
 */
require_once RKSP_PLUGIN_DIR . 'includes/class-rksp-db.php';
require_once RKSP_PLUGIN_DIR . 'includes/class-rksp-roles.php';
require_once RKSP_PLUGIN_DIR . 'includes/class-rksp-auth.php';
require_once RKSP_PLUGIN_DIR . 'includes/class-rksp-pages.php';
require_once RKSP_PLUGIN_DIR . 'includes/class-rksp-blocks.php';
require_once RKSP_PLUGIN_DIR . 'includes/class-rksp-achievements.php';
require_once RKSP_PLUGIN_DIR . 'includes/class-rksp-rest.php';
require_once RKSP_PLUGIN_DIR . 'includes/class-rksp-forms.php';
require_once RKSP_PLUGIN_DIR . 'admin/class-rksp-admin.php';
require_once RKSP_PLUGIN_DIR . 'public/class-rksp-shortcodes.php';

/**
 * هوک فعال‌سازی افزونه
 */
if ( ! function_exists( 'rksp_activate_plugin' ) ) {
    function rksp_activate_plugin() {
        // ایجاد جداول دیتابیس با dbDelta
        RKSP_DB::create_tables();

        // تعریف و ایجاد نقش‌های کاربری (دانش‌آموز و مشاور)
        RKSP_Roles::register_roles();

        // ایجاد خودکار برگه‌های استاندارد وردپرس (بدون نیاز به المنتور یا فرم‌ساز)
        RKSP_Pages::create_default_pages();

        // زمان‌بندی کرون جاب روزانه باشگاه پیشرفت (ساعت ۰۰:۰۵)
        if ( ! wp_next_scheduled( 'rksp_daily_achievements_cron' ) ) {
            wp_schedule_event( strtotime( 'tomorrow 00:05:00' ), 'daily', 'rksp_daily_achievements_cron' );
        }

        // تازه‌سازی قوانین rewrite
        flush_rewrite_rules();
    }
}
register_activation_hook( __FILE__, 'rksp_activate_plugin' );

/**
 * هوک غیرفعال‌سازی افزونه
 */
if ( ! function_exists( 'rksp_deactivate_plugin' ) ) {
    function rksp_deactivate_plugin() {
        // حذف رویداد کرون
        $timestamp = wp_next_scheduled( 'rksp_daily_achievements_cron' );
        if ( $timestamp ) {
            wp_unschedule_event( $timestamp, 'rksp_daily_achievements_cron' );
        }

        flush_rewrite_rules();
    }
}
register_deactivation_hook( __FILE__, 'rksp_deactivate_plugin' );

/**
 * راه‌اندازی اولیه سرویس‌ها
 */
if ( ! function_exists( 'rksp_init_plugin' ) ) {
    function rksp_init_plugin() {
        // راه‌اندازی احراز هویت با توکن برای موبایل و REST
        RKSP_Auth::init();

        // ثبت مسیرهای REST API
        RKSP_REST::init();

        // ثبت پنل مدیریت
        if ( is_admin() ) {
            RKSP_Admin::init();
        }

        // ثبت شورتکدها و اسکریپت‌های فرانت‌اند
        RKSP_Shortcodes::init();

        // ثبت بلاک‌های گوتنبرگ برای وردپرس بومی
        RKSP_Blocks::init();

        // اتصال رویداد کرون باشگاه پیشرفت
        add_action( 'rksp_daily_achievements_cron', array( 'RKSP_Achievements', 'run_daily_check' ) );
    }
}
add_action( 'init', 'rksp_init_plugin' );

