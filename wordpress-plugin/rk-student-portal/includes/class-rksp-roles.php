<?php
/**
 * مدیریت نقش‌های کاربری (RKSP_Roles)
 *
 * تعریف ۳ نقش روی کاربران پیش‌فرض وردپرس (بدون جدول کاربر جداگانه)
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( 'RKSP_Roles' ) ) {
    class RKSP_Roles {

        /**
         * ثبت نقش‌های سفارشی وردپرس
         */
        public static function register_roles() {
            // ۱. نقش دانش‌آموز (rksp_student)
            if ( ! get_role( 'rksp_student' ) ) {
                add_role(
                    'rksp_student',
                    __( 'دانش‌آموز راه کنکور', 'rk-student-portal' ),
                    array(
                        'read'              => true,
                        'rksp_is_student'   => true,
                    )
                );
            }

            // ۲. نقش مشاور (rksp_mentor)
            if ( ! get_role( 'rksp_mentor' ) ) {
                add_role(
                    'rksp_mentor',
                    __( 'مشاور راه کنکور', 'rk-student-portal' ),
                    array(
                        'read'              => true,
                        'rksp_is_mentor'    => true,
                    )
                );
            }

            // اطمینان از دسترسی کامل مدیر (administrator) به تمام بخش‌های rksp
            $admin = get_role( 'administrator' );
            if ( $admin ) {
                $admin->add_cap( 'rksp_manage_portal' );
                $admin->add_cap( 'rksp_is_mentor' );
            }
        }

        /**
         * بررسی نقش کاربر فعلی یا آی‌دی مشخص
         */
        public static function is_student( $user_id = null ) {
            $user = $user_id ? get_userdata( $user_id ) : wp_get_current_user();
            return $user && in_array( 'rksp_student', (array) $user->roles, true );
        }

        public static function is_mentor( $user_id = null ) {
            $user = $user_id ? get_userdata( $user_id ) : wp_get_current_user();
            return $user && ( in_array( 'rksp_mentor', (array) $user->roles, true ) || in_array( 'administrator', (array) $user->roles, true ) );
        }

        public static function is_admin( $user_id = null ) {
            $user = $user_id ? get_userdata( $user_id ) : wp_get_current_user();
            return $user && in_array( 'administrator', (array) $user->roles, true );
        }

        /**
         * هدایت خودکار دانش‌آموز و مشاور به پنل اختصاصی پس از ورود در وردپرس
         */
        public static function redirect_after_login( $redirect_to, $request, $user ) {
            if ( isset( $user->roles ) && is_array( $user->roles ) ) {
                if ( in_array( 'rksp_student', $user->roles, true ) ) {
                    $student_page_id = get_option( 'rksp_page_student_portal', 0 );
                    return $student_page_id ? get_permalink( $student_page_id ) : home_url( '/student-portal/' );
                }
                if ( in_array( 'rksp_mentor', $user->roles, true ) ) {
                    $mentor_page_id = get_option( 'rksp_page_mentor_portal', 0 );
                    return $mentor_page_id ? get_permalink( $mentor_page_id ) : home_url( '/mentor-portal/' );
                }
            }
            return $redirect_to;
        }
    }

    add_filter( 'login_redirect', array( 'RKSP_Roles', 'redirect_after_login' ), 10, 3 );
}
