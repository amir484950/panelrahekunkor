<?php
/**
 * سیستم احراز هویت توکن برای REST API و اپلیکیشن موبایل (RKSP_Auth)
 *
 * بدون وابستگی به افزونه‌های خارجی JWT - سبک، سریع و فوق‌العاده امن با قابلیت ابطال توکن
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( 'RKSP_Auth' ) ) {
    class RKSP_Auth {

        public static function init() {
            // قلاب به فیلتر determine_current_user جهت شناسایی کاربر بر اساس Bearer Token
            add_filter( 'determine_current_user', array( __CLASS__, 'authenticate_token' ), 20 );

            // ثبت زمان آخرین استفاده از توکن
            add_action( 'rest_api_init', array( __CLASS__, 'track_token_usage' ) );
        }

        /**
         * بررسی و شناسایی کاربر از روی هدر Authorization: Bearer <token>
         */
        public static function authenticate_token( $user_id ) {
            // اگر کاربر قبلاً شناسایی شده، نیازی به بازنویسی نیست مگر اینکه هدر Bearer وجود داشته باشد
            $auth_header = self::get_auth_header();
            if ( empty( $auth_header ) || ! preg_match( '/Bearer\s+(.*)$/i', $auth_header, $matches ) ) {
                return $user_id;
            }

            $raw_token = trim( $matches[1] );
            if ( empty( $raw_token ) ) {
                return $user_id;
            }

            $token_hash = hash( 'sha256', $raw_token );

            global $wpdb;
            $tokens_table = RKSP_DB::table( 'tokens' );

            $token_row = $wpdb->get_row(
                $wpdb->prepare(
                    "SELECT user_id, revoked FROM $tokens_table WHERE token_hash = %s LIMIT 1",
                    $token_hash
                )
            );

            if ( $token_row && intval( $token_row->revoked ) === 0 ) {
                // به‌روزرسانی زمان آخرین استفاده
                $wpdb->query(
                    $wpdb->prepare(
                        "UPDATE $tokens_table SET last_used_at = NOW() WHERE token_hash = %s",
                        $token_hash
                    )
                );

                return intval( $token_row->user_id );
            }

            return $user_id;
        }

        /**
         * دریافت هدر Authorization با پشتیبانی از سرورهای مختلف Apache/Nginx
         */
        private static function get_auth_header() {
            if ( isset( $_SERVER['HTTP_AUTHORIZATION'] ) ) {
                return sanitize_text_field( wp_unslash( $_SERVER['HTTP_AUTHORIZATION'] ) );
            }
            if ( isset( $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ) ) {
                return sanitize_text_field( wp_unslash( $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ) );
            }
            if ( function_exists( 'apache_request_headers' ) ) {
                $headers = apache_request_headers();
                if ( isset( $headers['Authorization'] ) ) {
                    return sanitize_text_field( $headers['Authorization'] );
                }
                if ( isset( $headers['authorization'] ) ) {
                    return sanitize_text_field( $headers['authorization'] );
                }
            }
            return '';
        }

        /**
         * ایجاد یک توکن احراز هویت جدید برای کاربر
         * مقدار خام توکن تنها یک‌بار برگردانده می‌شود؛ فقط هش sha256 در دیتابیس ذخیره می‌گردد.
         */
        public static function issue_token( $user_id, $device_label = 'Mobile App' ) {
            global $wpdb;
            $tokens_table = RKSP_DB::table( 'tokens' );

            $raw_token = wp_generate_password( 48, false, false ) . bin2hex( random_bytes( 16 ) );
            $token_hash = hash( 'sha256', $raw_token );

            $wpdb->insert(
                $tokens_table,
                array(
                    'user_id'      => $user_id,
                    'token_hash'   => $token_hash,
                    'device_label' => sanitize_text_field( $device_label ),
                    'created_at'   => current_time( 'mysql' ),
                    'last_used_at' => current_time( 'mysql' ),
                    'revoked'      => 0,
                ),
                array( '%d', '%s', '%s', '%s', '%s', '%d' )
            );

            return $raw_token;
        }

        /**
         * ابطال توکن کاربر (توسط کاربر یا مدیر)
         */
        public static function revoke_token( $token_id, $user_id = null ) {
            global $wpdb;
            $tokens_table = RKSP_DB::table( 'tokens' );

            $where = array( 'id' => intval( $token_id ) );
            $format = array( '%d' );

            if ( $user_id && ! current_user_can( 'administrator' ) ) {
                $where['user_id'] = intval( $user_id );
                $format[] = '%d';
            }

            return $wpdb->update(
                $tokens_table,
                array( 'revoked' => 1 ),
                $where,
                array( '%d' ),
                $format
            );
        }

        public static function track_token_usage() {
            // هوک برای اطمینان از مقداردهی اولیه REST
        }

        /**
         * ثبت‌نام دانش‌آموز جدید در هسته وردپرس با نقش rksp_student
         */
        public static function register_student( $data ) {
            $name     = sanitize_text_field( $data['name'] ?? '' );
            $mobile   = sanitize_text_field( $data['mobile'] ?? '' );
            $grade    = sanitize_text_field( $data['grade'] ?? 'دوازدهم' );
            $major    = sanitize_text_field( $data['major'] ?? 'تجربی' );
            $city     = sanitize_text_field( $data['city'] ?? '' );
            $password = $data['password'] ?? '';

            if ( empty( $name ) || empty( $mobile ) || empty( $password ) ) {
                return new WP_Error( 'missing_fields', 'لطفاً نام، شماره موبایل و رمز عبور را وارد نمایید.', array( 'status' => 400 ) );
            }

            if ( ! preg_match( '/^09\d{9}$/', $mobile ) ) {
                return new WP_Error( 'invalid_mobile', 'فرمت شماره موبایل باید ۱۱ رقم و با ۰۹ شروع شود.', array( 'status' => 400 ) );
            }

            if ( username_exists( $mobile ) || email_exists( $mobile . '@rahkonkur.local' ) ) {
                return new WP_Error( 'user_exists', 'کاربری با این شماره موبایل قبلاً در سایت ثبت‌نام کرده است.', array( 'status' => 409 ) );
            }

            $user_id = wp_insert_user( array(
                'user_login'   => $mobile,
                'user_pass'    => $password,
                'display_name' => $name,
                'first_name'   => $name,
                'user_email'   => $mobile . '@rahkonkur.local',
                'role'         => 'rksp_student',
            ) );

            if ( is_wp_error( $user_id ) ) {
                return $user_id;
            }

            update_user_meta( $user_id, 'rksp_mobile', $mobile );
            update_user_meta( $user_id, 'rksp_grade', $grade );
            update_user_meta( $user_id, 'rksp_major', $major );
            update_user_meta( $user_id, 'rksp_city', $city );

            // ورود به سشن کوکی وردپرس برای کلاینت وب
            if ( ! is_admin() && function_exists( 'wp_set_auth_cookie' ) ) {
                wp_set_current_user( $user_id );
                wp_set_auth_cookie( $user_id, true );
            }

            $token = self::issue_token( $user_id, 'Web/StudentPortal' );

            return array(
                'success' => true,
                'message' => 'ثبت‌نام دانش‌آموز با موفقیت انجام شد.',
                'token'   => $token,
                'user'    => array(
                    'id'           => $user_id,
                    'name'         => $name,
                    'mobile'       => $mobile,
                    'role_primary' => 'rksp_student',
                    'grade'        => $grade,
                    'major'        => $major,
                    'city'         => $city,
                ),
            );
        }

        /**
         * ثبت‌نام و ثبت مشخصات مشاور تحصیلی جدید با نقش rksp_mentor
         */
        public static function register_mentor( $data ) {
            $name       = sanitize_text_field( $data['name'] ?? '' );
            $mobile     = sanitize_text_field( $data['mobile'] ?? '' );
            $specialty  = sanitize_text_field( $data['specialty'] ?? 'مشاوره کنکور سراسری' );
            $experience = sanitize_text_field( $data['experience'] ?? '' );
            $bio        = sanitize_textarea_field( $data['bio'] ?? '' );
            $password   = $data['password'] ?? '';

            if ( empty( $name ) || empty( $mobile ) || empty( $password ) ) {
                return new WP_Error( 'missing_fields', 'لطفاً نام، شماره موبایل و رمز عبور مشاور را وارد نمایید.', array( 'status' => 400 ) );
            }

            if ( ! preg_match( '/^09\d{9}$/', $mobile ) ) {
                return new WP_Error( 'invalid_mobile', 'فرمت شماره موبایل نامعتبر است.', array( 'status' => 400 ) );
            }

            if ( username_exists( $mobile ) ) {
                return new WP_Error( 'user_exists', 'مشاوری با این شماره همراه قبلاً در سیستم ثبت شده است.', array( 'status' => 409 ) );
            }

            $user_id = wp_insert_user( array(
                'user_login'   => $mobile,
                'user_pass'    => $password,
                'display_name' => $name,
                'first_name'   => $name,
                'user_email'   => $mobile . '@mentor.rahkonkur.local',
                'role'         => 'rksp_mentor',
            ) );

            if ( is_wp_error( $user_id ) ) {
                return $user_id;
            }

            update_user_meta( $user_id, 'rksp_mobile', $mobile );
            update_user_meta( $user_id, 'rksp_specialty', $specialty );
            update_user_meta( $user_id, 'rksp_experience', $experience );
            update_user_meta( $user_id, 'rksp_bio', $bio );

            if ( ! is_admin() && function_exists( 'wp_set_auth_cookie' ) ) {
                wp_set_current_user( $user_id );
                wp_set_auth_cookie( $user_id, true );
            }

            $token = self::issue_token( $user_id, 'Web/MentorPortal' );

            return array(
                'success' => true,
                'message' => 'مشخصات مشاور تحصیلی با موفقیت ثبت شد.',
                'token'   => $token,
                'user'    => array(
                    'id'           => $user_id,
                    'name'         => $name,
                    'mobile'       => $mobile,
                    'role_primary' => 'rksp_mentor',
                    'specialty'    => $specialty,
                    'experience'   => $experience,
                ),
            );
        }
    }
}
