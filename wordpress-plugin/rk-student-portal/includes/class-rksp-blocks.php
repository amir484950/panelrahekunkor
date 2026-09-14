<?php
/**
 * ثبت بلاک‌های اختصاصی ویرایشگر بومی وردپرس (گوتنبرگ)
 * سازگاری ۱۰۰٪ با وردپرس خالص بدون نیاز به المنتور یا هر صفحه‌ساز دیگر
 *
 * @package RK_Student_Portal
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( 'RKSP_Blocks' ) ) {
    class RKSP_Blocks {

        public static function init() {
            // ثبت دسته‌بندی بلاک اختصاصی در ویرایشگر گوتنبرگ
            add_filter( 'block_categories_all', array( __CLASS__, 'register_block_category' ), 10, 2 );

            // ثبت بلاک‌ها در ویرایشگر وردپرس
            add_action( 'init', array( __CLASS__, 'register_blocks' ) );

            // بارگذاری اسکریپت‌های ادیتور گوتنبرگ
            add_action( 'enqueue_block_editor_assets', array( __CLASS__, 'enqueue_editor_assets' ) );
        }

        /**
         * افزودن دسته‌بندی بلاک اختصاصی به هسته وردپرس
         */
        public static function register_block_category( $categories, $post ) {
            return array_merge(
                array(
                    array(
                        'slug'  => 'rksp-blocks',
                        'title' => 'پرتال راه کنکور (بومی وردپرس)',
                        'icon'  => 'welcome-learn-more',
                    ),
                ),
                $categories
            );
        }

        /**
         * ثبت بلاک‌های سمت سرور (Server-Side Rendered Blocks)
         */
        public static function register_blocks() {
            if ( ! function_exists( 'register_block_type' ) ) {
                return;
            }

            // ۱. بلاک پرتال دانش‌آموز
            register_block_type( 'rksp/student-portal', array(
                'render_callback' => array( 'RKSP_Shortcodes', 'render_student_portal' ),
                'category'        => 'rksp-blocks',
                'title'           => 'پرتال جامع دانش‌آموز',
                'description'     => 'نمایش داشبورد مطالعه، تکالیف و نظرات مشاور',
                'icon'            => 'id-alt',
            ) );

            // ۲. بلاک پرتال مشاور
            register_block_type( 'rksp/mentor-portal', array(
                'render_callback' => array( 'RKSP_Shortcodes', 'render_mentor_portal' ),
                'category'        => 'rksp-blocks',
                'title'           => 'پرتال مشاور تحصیلی',
                'description'     => 'مدیریت دانش‌آموزان تحت نظر، تکالیف و ثبت نظر عملکرد',
                'icon'            => 'groups',
            ) );

            // ۳. بلاک باشگاه ساعت مطالعه (لیدربورد)
            register_block_type( 'rksp/leaderboard', array(
                'render_callback' => array( 'RKSP_Shortcodes', 'render_leaderboard' ),
                'category'        => 'rksp-blocks',
                'title'           => 'باشگاه ساعت مطالعه (رتبه‌بندی)',
                'description'     => 'نمایش رتبه‌بندی دانش‌آموزان به همراه ترنزینت کش ۵ دقیقه‌ای وردپرس',
                'icon'            => 'awards',
                'attributes'      => array(
                    'period' => array(
                        'type'    => 'string',
                        'default' => 'weekly',
                    ),
                ),
            ) );

            // ۴. بلاک باشگاه پیشرفت (دستاوردها)
            register_block_type( 'rksp/achievements', array(
                'render_callback' => array( 'RKSP_Shortcodes', 'render_achievements' ),
                'category'        => 'rksp-blocks',
                'title'           => 'باشگاه پیشرفت (دستاوردها)',
                'description'     => 'فید دستاوردهای برتر و رتبه‌های اول مطالعه',
                'icon'            => 'star-filled',
            ) );
        }

        /**
         * بارگذاری فایل اسکریپت تعریف بلاک‌ها در ویرایشگر گوتنبرگ
         */
        public static function enqueue_editor_assets() {
            wp_enqueue_script(
                'rksp-gutenberg-blocks',
                RKSP_PLUGIN_URL . 'admin/js/rksp-gutenberg-blocks.js',
                array( 'wp-blocks', 'wp-element', 'wp-editor', 'wp-components', 'wp-i18n' ),
                RKSP_VERSION,
                true
            );
        }
    }
}
