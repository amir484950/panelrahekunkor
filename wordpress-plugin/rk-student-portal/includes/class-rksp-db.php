<?php
/**
 * مدیریت دیتابیس اختصاصی افزونه (RKSP_DB)
 *
 * بدون ACF یا CPT UI - جداول اختصاصی با dbDelta برای بیشترین کارایی
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( 'RKSP_DB' ) ) {
    class RKSP_DB {

        /**
         * ایجاد کلیه جداول دیتابیس هنگام فعال‌سازی افزونه
         */
        public static function create_tables() {
            global $wpdb;

            require_once ABSPATH . 'wp-admin/includes/upgrade.php';

            $charset_collate = $wpdb->get_charset_collate();

            // ۱. جدول رابطه‌ی مشاور و دانش‌آموز (با ثبت تاریخچه و ایندکس‌های کوئری سریع)
            $table_assignments = $wpdb->prefix . 'rksp_assignments';
            $sql_assignments = "CREATE TABLE $table_assignments (
                id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                student_id bigint(20) unsigned NOT NULL,
                mentor_id bigint(20) unsigned NOT NULL,
                assigned_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
                ended_at datetime DEFAULT NULL,
                status varchar(20) DEFAULT 'active' NOT NULL,
                PRIMARY KEY  (id),
                KEY student_id (student_id),
                KEY mentor_id (mentor_id),
                KEY status (status),
                KEY student_status (student_id, status),
                KEY mentor_status (mentor_id, status)
            ) $charset_collate;";
            dbDelta( $sql_assignments );

            // ۲. جدول لاگ ساعت مطالعه — پرتکرارترین جدول با ایندکس‌های ترکیبی و پوششی برای لیدربورد و پایش زمانی
            $table_study_logs = $wpdb->prefix . 'rksp_study_logs';
            $sql_study_logs = "CREATE TABLE $table_study_logs (
                id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                student_id bigint(20) unsigned NOT NULL,
                log_date date NOT NULL,
                minutes int(11) unsigned NOT NULL,
                tests_count int(11) unsigned DEFAULT 0 NOT NULL,
                subject varchar(191) DEFAULT NULL,
                source varchar(20) DEFAULT 'panel' NOT NULL,
                created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
                PRIMARY KEY  (id),
                KEY student_id (student_id),
                KEY log_date (log_date),
                KEY student_date (student_id, log_date),
                KEY student_subject (student_id, subject),
                KEY leaderboard_idx (log_date, student_id, minutes)
            ) $charset_collate;";
            dbDelta( $sql_study_logs );

            // ۳. جدول گزارش کار / تسک — با ایندکس ترکیبی وضعیت، مهلت تحویل و دانش‌آموز
            $table_tasks = $wpdb->prefix . 'rksp_tasks';
            $sql_tasks = "CREATE TABLE $table_tasks (
                id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                student_id bigint(20) unsigned NOT NULL,
                mentor_id bigint(20) unsigned NOT NULL,
                title varchar(255) NOT NULL,
                description text DEFAULT NULL,
                due_date date DEFAULT NULL,
                status varchar(20) DEFAULT 'pending' NOT NULL,
                created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
                done_at datetime DEFAULT NULL,
                PRIMARY KEY  (id),
                KEY student_id (student_id),
                KEY mentor_id (mentor_id),
                KEY status (status),
                KEY student_status_due (student_id, status, due_date),
                KEY mentor_student (mentor_id, student_id),
                KEY status_due (status, due_date)
            ) $charset_collate;";
            dbDelta( $sql_tasks );

            // ۴. جدول نظر عملکرد درسی مشاور — با ایندکس اختصاصی قابلیت مشاهده و مرتب‌سازی زمانی
            $table_notes = $wpdb->prefix . 'rksp_notes';
            $sql_notes = "CREATE TABLE $table_notes (
                id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                student_id bigint(20) unsigned NOT NULL,
                mentor_id bigint(20) unsigned NOT NULL,
                content text NOT NULL,
                visibility varchar(20) DEFAULT 'public' NOT NULL,
                created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
                PRIMARY KEY  (id),
                KEY student_id (student_id),
                KEY mentor_id (mentor_id),
                KEY visibility (visibility),
                KEY student_vis_created (student_id, visibility, created_at),
                KEY mentor_student (mentor_id, student_id)
            ) $charset_collate;";
            dbDelta( $sql_notes );

            // ۵. جدول طرح / اشتراک دانش‌آموز
            $table_plans = $wpdb->prefix . 'rksp_plans';
            $sql_plans = "CREATE TABLE $table_plans (
                id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                student_id bigint(20) unsigned NOT NULL,
                plan_name varchar(191) NOT NULL,
                price decimal(12,2) DEFAULT '0.00' NOT NULL,
                start_date date NOT NULL,
                end_date date NOT NULL,
                status varchar(20) DEFAULT 'active' NOT NULL,
                PRIMARY KEY  (id),
                KEY student_id (student_id),
                KEY end_date (end_date),
                KEY status (status)
            ) $charset_collate;";
            dbDelta( $sql_plans );

            // ۶. جدول باشگاه پیشرفت — دستاوردهای خودکار
            $table_achievements = $wpdb->prefix . 'rksp_achievements';
            $sql_achievements = "CREATE TABLE $table_achievements (
                id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                student_id bigint(20) unsigned NOT NULL,
                type varchar(50) NOT NULL,
                message text NOT NULL,
                created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
                PRIMARY KEY  (id),
                KEY student_id (student_id),
                KEY type (type)
            ) $charset_collate;";
            dbDelta( $sql_achievements );

            // ۷. جدول توکن API برای اپلیکیشن موبایل — ایندکس‌های حیاتی احراز هویت میکروثانیه‌ای
            $table_tokens = $wpdb->prefix . 'rksp_tokens';
            $sql_tokens = "CREATE TABLE $table_tokens (
                id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
                user_id bigint(20) unsigned NOT NULL,
                token_hash varchar(64) NOT NULL,
                device_label varchar(191) DEFAULT 'Unknown Device' NOT NULL,
                created_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
                last_used_at datetime DEFAULT CURRENT_TIMESTAMP NOT NULL,
                revoked tinyint(1) DEFAULT 0 NOT NULL,
                PRIMARY KEY  (id),
                KEY user_id (user_id),
                KEY token_hash (token_hash),
                KEY revoked (revoked),
                KEY token_auth_idx (token_hash, revoked),
                KEY user_active_tokens (user_id, revoked),
                KEY last_used_at (last_used_at)
            ) $charset_collate;";
            dbDelta( $sql_tokens );

            // ذخیره نسخه ساختار دیتابیس در آپشن‌های وردپرس
            update_option( 'rksp_db_version', RKSP_VERSION );
        }

        /**
         * نام جداول با در نظر گرفتن پیشوند وردپرس
         */
        public static function table( $name ) {
            global $wpdb;
            return $wpdb->prefix . 'rksp_' . $name;
        }
    }
}
