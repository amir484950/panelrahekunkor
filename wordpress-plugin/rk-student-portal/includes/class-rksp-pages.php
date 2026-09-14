<?php
/**
 * مدیریت خودکار برگه‌های استاندارد وردپرس
 * ایجاد خودکار برگه‌ها در فعال‌سازی بدون نیاز به هیچ صفحه‌ساز جانبی
 *
 * @package RK_Student_Portal
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( 'RKSP_Pages' ) ) {
    class RKSP_Pages {

        /**
         * ایجاد خودکار ۴ برگه استاندارد وردپرس در صورت عدم وجود
         */
        public static function create_default_pages() {
            $pages = array(
                'rksp_page_student_portal' => array(
                    'title'   => 'پرتال دانش‌آموز',
                    'slug'    => 'student-portal',
                    'content' => "<!-- wp:rksp/student-portal -->\n[rksp_student_portal]\n<!-- /wp:rksp/student-portal -->",
                ),
                'rksp_page_student_register' => array(
                    'title'   => 'ثبت‌نام دانش‌آموز',
                    'slug'    => 'student-register',
                    'content' => "<!-- wp:rksp/student-register -->\n[rksp_student_register]\n<!-- /wp:rksp/student-register -->",
                ),
                'rksp_page_mentor_portal'  => array(
                    'title'   => 'پرتال مشاور',
                    'slug'    => 'mentor-portal',
                    'content' => "<!-- wp:rksp/mentor-portal -->\n[rksp_mentor_portal]\n<!-- /wp:rksp/mentor-portal -->",
                ),
                'rksp_page_leaderboard'    => array(
                    'title'   => 'باشگاه ساعت مطالعه',
                    'slug'    => 'study-leaderboard',
                    'content' => "<!-- wp:rksp/leaderboard {\"period\":\"weekly\"} -->\n[rksp_leaderboard period=\"weekly\"]\n<!-- /wp:rksp/leaderboard -->",
                ),
                'rksp_page_achievements'   => array(
                    'title'   => 'باشگاه پیشرفت',
                    'slug'    => 'study-achievements',
                    'content' => "<!-- wp:rksp/achievements -->\n[rksp_achievements]\n<!-- /wp:rksp/achievements -->",
                ),
                'rksp_page_profile'        => array(
                    'title'   => 'پروفایل کاربری اختصاصی',
                    'slug'    => 'user-profile',
                    'content' => "<!-- wp:rksp/profile -->\n[rksp_profile]\n<!-- /wp:rksp/profile -->",
                ),
            );

            foreach ( $pages as $opt_key => $page_data ) {
                $existing_page_id = get_option( $opt_key, 0 );
                $post = $existing_page_id ? get_post( $existing_page_id ) : null;

                // اگر برگه وجود نداشت یا حذف شده بود، یک برگه جدید بساز
                if ( ! $post || $post->post_status === 'trash' ) {
                    $new_page_id = wp_insert_post( array(
                        'post_title'     => $page_data['title'],
                        'post_name'      => $page_data['slug'],
                        'post_content'   => $page_data['content'],
                        'post_status'    => 'publish',
                        'post_type'      => 'page',
                        'comment_status' => 'closed',
                        'ping_status'    => 'closed',
                    ) );

                    if ( ! is_wp_error( $new_page_id ) && $new_page_id > 0 ) {
                        update_option( $opt_key, $new_page_id );
                    }
                }
            }
        }

        /**
         * دریافت آدرس برگه‌های پرتال برای نمایش در پیشخوان
         */
        public static function get_portal_links() {
            return array(
                'student'      => get_permalink( get_option( 'rksp_page_student_portal' ) ) ?: home_url( '/student-portal/' ),
                'mentor'       => get_permalink( get_option( 'rksp_page_mentor_portal' ) ) ?: home_url( '/mentor-portal/' ),
                'leaderboard'  => get_permalink( get_option( 'rksp_page_leaderboard' ) ) ?: home_url( '/study-leaderboard/' ),
                'achievements' => get_permalink( get_option( 'rksp_page_achievements' ) ) ?: home_url( '/study-achievements/' ),
            );
        }
    }
}
