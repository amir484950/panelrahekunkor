<?php
/**
 * کنترلر اصلی اندپوینت‌های REST API (RKSP_REST)
 * Namespace: rksp/v1
 *
 * بدون وابستگی به تمپلیت یا شورتکد — نقطه اتصال مشترک پنل تحت وب و اپلیکیشن آینده
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( 'RKSP_REST' ) ) {
    class RKSP_REST {

        const NAMESPACE = 'rksp/v1';

        public static function init() {
            add_action( 'rest_api_init', array( __CLASS__, 'register_routes' ) );
        }

        public static function register_routes() {
            // === احراز هویت (Auth) ===
            register_rest_route( self::NAMESPACE, '/auth/login', array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( __CLASS__, 'handle_login' ),
                'permission_callback' => '__return_true',
            ) );

            register_rest_route( self::NAMESPACE, '/auth/otp-request', array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( __CLASS__, 'handle_otp_request' ),
                'permission_callback' => '__return_true',
            ) );

            register_rest_route( self::NAMESPACE, '/auth/otp-verify', array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( __CLASS__, 'handle_otp_verify' ),
                'permission_callback' => '__return_true',
            ) );

            register_rest_route( self::NAMESPACE, '/auth/register-student', array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( __CLASS__, 'handle_register_student' ),
                'permission_callback' => '__return_true',
            ) );

            register_rest_route( self::NAMESPACE, '/auth/register-mentor', array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( __CLASS__, 'handle_register_mentor' ),
                'permission_callback' => '__return_true',
            ) );

            register_rest_route( self::NAMESPACE, '/auth/logout', array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( __CLASS__, 'handle_logout' ),
                'permission_callback' => '__return_true',
            ) );

            // === اندپوینت‌های دانش‌آموز ===
            register_rest_route( self::NAMESPACE, '/study-logs', array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( __CLASS__, 'create_study_log' ),
                'permission_callback' => array( __CLASS__, 'check_is_student' ),
            ) );

            register_rest_route( self::NAMESPACE, '/study-logs/me', array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( __CLASS__, 'get_my_study_logs' ),
                'permission_callback' => array( __CLASS__, 'check_is_student' ),
            ) );

            register_rest_route( self::NAMESPACE, '/leaderboard', array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( __CLASS__, 'get_leaderboard' ),
                'permission_callback' => array( __CLASS__, 'check_logged_in' ),
            ) );

            register_rest_route( self::NAMESPACE, '/tasks/me', array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( __CLASS__, 'get_my_tasks' ),
                'permission_callback' => array( __CLASS__, 'check_is_student' ),
            ) );

            register_rest_route( self::NAMESPACE, '/tasks/(?P<id>\d+)', array(
                'methods'             => 'PATCH',
                'callback'            => array( __CLASS__, 'update_task_status' ),
                'permission_callback' => array( __CLASS__, 'check_task_owner' ),
            ) );

            register_rest_route( self::NAMESPACE, '/notes/me', array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( __CLASS__, 'get_my_notes' ),
                'permission_callback' => array( __CLASS__, 'check_is_student' ),
            ) );

            register_rest_route( self::NAMESPACE, '/plan/me', array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( __CLASS__, 'get_my_plan' ),
                'permission_callback' => array( __CLASS__, 'check_is_student' ),
            ) );

            register_rest_route( self::NAMESPACE, '/achievements/me', array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( __CLASS__, 'get_my_achievements' ),
                'permission_callback' => array( __CLASS__, 'check_is_student' ),
            ) );

            register_rest_route( self::NAMESPACE, '/channels', array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( __CLASS__, 'get_channels' ),
                'permission_callback' => '__return_true',
            ) );

            // === اندپوینت‌های مشاور ===
            register_rest_route( self::NAMESPACE, '/students', array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( __CLASS__, 'get_mentor_students' ),
                'permission_callback' => array( __CLASS__, 'check_is_mentor' ),
            ) );

            register_rest_route( self::NAMESPACE, '/tasks', array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( __CLASS__, 'create_mentor_task' ),
                'permission_callback' => array( __CLASS__, 'check_mentor_can_manage_student' ),
            ) );

            register_rest_route( self::NAMESPACE, '/notes', array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( __CLASS__, 'create_mentor_note' ),
                'permission_callback' => array( __CLASS__, 'check_mentor_can_manage_student' ),
            ) );

            // === اندپوینت‌های مدیر سایت (Administrator) ===
            register_rest_route( self::NAMESPACE, '/admin/overview', array(
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => array( __CLASS__, 'get_admin_overview' ),
                'permission_callback' => array( __CLASS__, 'check_is_admin' ),
            ) );

            register_rest_route( self::NAMESPACE, '/admin/assign-mentor', array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( __CLASS__, 'assign_mentor' ),
                'permission_callback' => array( __CLASS__, 'check_is_admin' ),
            ) );

            register_rest_route( self::NAMESPACE, '/admin/plans', array(
                'methods'             => WP_REST_Server::CREATABLE,
                'callback'            => array( __CLASS__, 'create_or_renew_plan' ),
                'permission_callback' => array( __CLASS__, 'check_is_admin' ),
            ) );

            register_rest_route( self::NAMESPACE, '/admin/channels', array(
                array(
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => array( __CLASS__, 'get_channels' ),
                    'permission_callback' => array( __CLASS__, 'check_is_admin' ),
                ),
                array(
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => array( __CLASS__, 'save_channels' ),
                    'permission_callback' => array( __CLASS__, 'check_is_admin' ),
                )
            ) );

            register_rest_route( self::NAMESPACE, '/admin/users', array(
                array(
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => array( __CLASS__, 'get_admin_users' ),
                    'permission_callback' => array( __CLASS__, 'check_is_admin' ),
                ),
                array(
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => array( __CLASS__, 'create_admin_user' ),
                    'permission_callback' => array( __CLASS__, 'check_is_admin' ),
                )
            ) );

            // === صفحه مدیریت پروفایل اختصاصی کاربر (Profile) ===
            register_rest_route( self::NAMESPACE, '/profile/me', array(
                array(
                    'methods'             => WP_REST_Server::READABLE,
                    'callback'            => array( __CLASS__, 'get_user_profile' ),
                    'permission_callback' => '__return_true',
                ),
                array(
                    'methods'             => WP_REST_Server::CREATABLE,
                    'callback'            => array( __CLASS__, 'update_user_profile' ),
                    'permission_callback' => '__return_true',
                )
            ) );
        }

        // ==================== احراز هویت و مجوزها ====================

        public static function check_logged_in() {
            return is_user_logged_in();
        }

        public static function check_is_student() {
            return is_user_logged_in() && ( RKSP_Roles::is_student() || RKSP_Roles::is_admin() );
        }

        public static function check_is_mentor() {
            return is_user_logged_in() && RKSP_Roles::is_mentor();
        }

        public static function check_is_admin() {
            return current_user_can( 'administrator' );
        }

        public static function check_task_owner( $request ) {
            if ( ! is_user_logged_in() ) {
                return false;
            }
            if ( current_user_can( 'administrator' ) ) {
                return true;
            }

            global $wpdb;
            $task_id = intval( $request['id'] );
            $tasks_table = RKSP_DB::table( 'tasks' );
            $owner_id = $wpdb->get_var( $wpdb->prepare( "SELECT student_id FROM $tasks_table WHERE id = %d", $task_id ) );

            return intval( $owner_id ) === get_current_user_id();
        }

        public static function check_mentor_can_manage_student( $request ) {
            if ( ! is_user_logged_in() ) {
                return false;
            }
            if ( current_user_can( 'administrator' ) ) {
                return true;
            }

            $params = $request->get_json_params();
            $student_id = isset( $params['student_id'] ) ? intval( $params['student_id'] ) : 0;
            if ( ! $student_id ) {
                return false;
            }

            global $wpdb;
            $assignments_table = RKSP_DB::table( 'assignments' );
            $mentor_id = get_current_user_id();

            $is_assigned = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(*) FROM $assignments_table WHERE student_id = %d AND mentor_id = %d AND status = 'active'",
                    $student_id,
                    $mentor_id
                )
            );

            return intval( $is_assigned ) > 0;
        }

        // ==================== کنترلرهای احراز هویت ====================

        public static function handle_login( $request ) {
            $params = $request->get_json_params();
            $username = isset( $params['username'] ) ? sanitize_user( $params['username'] ) : '';
            $password = isset( $params['password'] ) ? $params['password'] : '';
            $device   = isset( $params['device_label'] ) ? sanitize_text_field( $params['device_label'] ) : 'Mobile App';

            if ( empty( $username ) || empty( $password ) ) {
                return new WP_Error( 'missing_fields', 'نام کاربری و کلمه عبور الزامی است.', array( 'status' => 400 ) );
            }

            $user = wp_authenticate( $username, $password );
            if ( is_wp_error( $user ) ) {
                return new WP_Error( 'invalid_credentials', 'اطلاعات ورود نامعتبر است.', array( 'status' => 401 ) );
            }

            $token = RKSP_Auth::issue_token( $user->ID, $device );

            return rest_ensure_response( array(
                'success' => true,
                'token'   => $token,
                'user'    => array(
                    'id'           => $user->ID,
                    'name'         => $user->display_name,
                    'roles'        => $user->roles,
                    'role_primary' => ! empty( $user->roles ) ? $user->roles[0] : 'subscriber',
                ),
            ) );
        }

        public static function handle_otp_request( $request ) {
            $params = $request->get_json_params();
            $mobile = isset( $params['mobile'] ) ? sanitize_text_field( $params['mobile'] ) : '';

            if ( empty( $mobile ) || ! preg_match( '/^09[0-9]{9}$/', $mobile ) ) {
                return new WP_Error( 'invalid_mobile', 'شماره موبایل وارد شده معتبر نیست.', array( 'status' => 400 ) );
            }

            // کد موقت تست (در محیط پروداکشن با کاوه‌نگار / سامانه‌های پیامک پیام ارسال می‌شود)
            $otp = '123456';
            set_transient( 'rksp_otp_' . $mobile, $otp, 120 );

            return rest_ensure_response( array(
                'success'    => true,
                'message'    => 'کد تایید پیامک شد.',
                'expires_in' => 120,
            ) );
        }

        public static function handle_otp_verify( $request ) {
            $params = $request->get_json_params();
            $mobile = isset( $params['mobile'] ) ? sanitize_text_field( $params['mobile'] ) : '';
            $otp    = isset( $params['otp'] ) ? sanitize_text_field( $params['otp'] ) : '';
            $device = isset( $params['device_label'] ) ? sanitize_text_field( $params['device_label'] ) : 'Mobile App';

            $cached_otp = get_transient( 'rksp_otp_' . $mobile );
            if ( ! $cached_otp || $cached_otp !== $otp ) {
                return new WP_Error( 'invalid_otp', 'کد تایید اشتباه یا منقضی شده است.', array( 'status' => 400 ) );
            }

            delete_transient( 'rksp_otp_' . $mobile );

            // پیدا کردن یا ساخت کاربر دانش‌آموز بر اساس شماره موبایل
            $user = reset( get_users( array( 'meta_key' => 'mobile', 'meta_value' => $mobile, 'number' => 1 ) ) );
            if ( ! $user ) {
                $username = 'std_' . substr( $mobile, 4 );
                $user_id = wp_create_user( $username, wp_generate_password(), $mobile . '@rahkonkur.local' );
                if ( is_wp_error( $user_id ) ) {
                    return $user_id;
                }
                $user = get_userdata( $user_id );
                $user->set_role( 'rksp_student' );
                update_user_meta( $user_id, 'mobile', $mobile );
            }

            $token = RKSP_Auth::issue_token( $user->ID, $device );

            return rest_ensure_response( array(
                'success' => true,
                'token'   => $token,
                'user'    => array(
                    'id'           => $user->ID,
                    'name'         => $user->display_name ?: 'دانش‌آموز جدید',
                    'mobile'       => $mobile,
                    'roles'        => $user->roles,
                    'role_primary' => 'rksp_student',
                ),
            ) );
        }

        public static function handle_register_student( $request ) {
            $params = $request->get_json_params();
            $result = RKSP_Auth::register_student( $params );
            if ( is_wp_error( $result ) ) {
                return $result;
            }
            return rest_ensure_response( $result );
        }

        public static function handle_register_mentor( $request ) {
            $params = $request->get_json_params();
            $result = RKSP_Auth::register_mentor( $params );
            if ( is_wp_error( $result ) ) {
                return $result;
            }
            return rest_ensure_response( $result );
        }

        public static function handle_logout( $request ) {
            if ( is_user_logged_in() ) {
                wp_logout();
            }
            return rest_ensure_response( array(
                'success' => true,
                'message' => 'خروج از حساب کاربری انجام شد.',
            ) );
        }

        public static function get_admin_users( $request ) {
            $students_query = get_users( array( 'role' => 'rksp_student' ) );
            $mentors_query  = get_users( array( 'role' => 'rksp_mentor' ) );

            $students = array();
            foreach ( $students_query as $s ) {
                $students[] = array(
                    'id'           => $s->ID,
                    'name'         => $s->display_name,
                    'mobile'       => get_user_meta( $s->ID, 'rksp_mobile', true ) ?: $s->user_login,
                    'grade'        => get_user_meta( $s->ID, 'rksp_grade', true ) ?: 'دوازدهم تجربی',
                    'major'        => get_user_meta( $s->ID, 'rksp_major', true ) ?: 'تجربی',
                    'city'         => get_user_meta( $s->ID, 'rksp_city', true ) ?: '',
                    'registered'   => $s->user_registered,
                    'role'         => 'rksp_student',
                );
            }

            $mentors = array();
            foreach ( $mentors_query as $m ) {
                $mentors[] = array(
                    'id'           => $m->ID,
                    'name'         => $m->display_name,
                    'mobile'       => get_user_meta( $m->ID, 'rksp_mobile', true ) ?: $m->user_login,
                    'specialty'    => get_user_meta( $m->ID, 'rksp_specialty', true ) ?: 'مشاوره کنکور',
                    'registered'   => $m->user_registered,
                    'role'         => 'rksp_mentor',
                );
            }

            return rest_ensure_response( array(
                'students' => $students,
                'mentors'  => $mentors,
            ) );
        }

        public static function create_admin_user( $request ) {
            $params = $request->get_json_params();
            $role   = sanitize_text_field( $params['role'] ?? 'rksp_student' );

            if ( $role === 'rksp_mentor' ) {
                $res = RKSP_Auth::register_mentor( $params );
            } else {
                $res = RKSP_Auth::register_student( $params );
                if ( ! is_wp_error( $res ) && ! empty( $params['mentor_id'] ) ) {
                    global $wpdb;
                    $wpdb->insert( RKSP_DB::table( 'assignments' ), array(
                        'student_id' => $res['user']['id'],
                        'mentor_id'  => intval( $params['mentor_id'] ),
                        'start_date' => current_time( 'mysql' ),
                        'status'     => 'active',
                    ) );
                }
            }

            if ( is_wp_error( $res ) ) {
                return $res;
            }
            return rest_ensure_response( $res );
        }

        // ==================== کنترلرهای دانش‌آموز ====================

        public static function create_study_log( $request ) {
            global $wpdb;
            $user_id = get_current_user_id();
            $params = $request->get_json_params();

            $minutes = isset( $params['minutes'] ) ? intval( $params['minutes'] ) : 0;
            $date    = isset( $params['date'] ) ? sanitize_text_field( $params['date'] ) : current_time( 'Y-m-d' );
            $subject = isset( $params['subject'] ) ? sanitize_text_field( $params['subject'] ) : '';
            $source  = isset( $params['source'] ) ? sanitize_text_field( $params['source'] ) : 'panel';

            if ( $minutes <= 0 || $minutes > 1440 ) {
                return new WP_Error( 'invalid_minutes', 'دقیقه مطالعه باید بین ۱ تا ۱۴۴۰ باشد.', array( 'status' => 400 ) );
            }

            $study_table = RKSP_DB::table( 'study_logs' );

            $wpdb->insert(
                $study_table,
                array(
                    'student_id' => $user_id,
                    'log_date'   => $date,
                    'minutes'    => $minutes,
                    'subject'    => $subject,
                    'source'     => $source,
                    'created_at' => current_time( 'mysql' ),
                ),
                array( '%d', '%s', '%d', '%s', '%s', '%s' )
            );

            // پاک‌سازی کش رتبه‌بندی ۵ دقیقه‌ای
            delete_transient( 'rksp_leaderboard_daily' );
            delete_transient( 'rksp_leaderboard_weekly' );
            delete_transient( 'rksp_leaderboard_monthly' );
            delete_transient( 'rksp_leaderboard_alltime' );

            // بررسی دستاوردهای مایل‌استون ساعت مطالعه
            RKSP_Achievements::check_after_study_log( $user_id );

            return rest_ensure_response( array(
                'success' => true,
                'id'      => $wpdb->insert_id,
                'message' => 'ساعت مطالعه با موفقیت ثبت شد.',
            ) );
        }

        public static function get_my_study_logs( $request ) {
            global $wpdb;
            $user_id = get_current_user_id();
            $study_table = RKSP_DB::table( 'study_logs' );

            $limit = 30;
            $results = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT id, log_date, minutes, subject, source, created_at 
                     FROM $study_table 
                     WHERE student_id = %d 
                     ORDER BY log_date DESC, id DESC 
                     LIMIT %d",
                    $user_id,
                    $limit
                ),
                ARRAY_A
            );

            $total_minutes = $wpdb->get_var(
                $wpdb->prepare( "SELECT SUM(minutes) FROM $study_table WHERE student_id = %d", $user_id )
            );

            return rest_ensure_response( array(
                'logs'          => $results,
                'total_minutes' => intval( $total_minutes ),
                'total_hours'   => round( intval( $total_minutes ) / 60, 1 ),
            ) );
        }

        /**
         * باشگاه ساعت مطالعه — رتبه‌بندی با ۵ دقیقه ترنزینت کش
         */
        public static function get_leaderboard( $request ) {
            global $wpdb;
            $current_user_id = get_current_user_id();
            $period = sanitize_text_field( $request->get_param( 'period' ) ?: 'daily' );
            $scope  = sanitize_text_field( $request->get_param( 'scope' ) ?: 'all' );

            $cache_key = "rksp_leaderboard_{$period}_{$scope}_" . ( $scope === 'mine' ? $current_user_id : 'global' );
            $cached = get_transient( $cache_key );
            if ( $cached !== false && is_array( $cached ) ) {
                return rest_ensure_response( $cached );
            }

            $study_table = RKSP_DB::table( 'study_logs' );
            $assignments_table = RKSP_DB::table( 'assignments' );

            $where_date = "1=1";
            if ( $period === 'daily' ) {
                $where_date = "log_date = '" . current_time( 'Y-m-d' ) . "'";
            } elseif ( $period === 'weekly' ) {
                $where_date = "log_date >= '" . date( 'Y-m-d', strtotime( '-7 days' ) ) . "'";
            } elseif ( $period === 'monthly' ) {
                $where_date = "log_date >= '" . date( 'Y-m-d', strtotime( '-30 days' ) ) . "'";
            }

            // فیلتر فقط دانش‌آموزان مشاور فعلی در صورت درخواست scope=mine
            $join = "";
            if ( $scope === 'mine' && RKSP_Roles::is_mentor() && ! RKSP_Roles::is_admin() ) {
                $join = "INNER JOIN $assignments_table a ON l.student_id = a.student_id AND a.mentor_id = $current_user_id AND a.status = 'active'";
            }

            $sql = "SELECT l.student_id, SUM(l.minutes) as total_minutes, COUNT(l.id) as log_count
                    FROM $study_table l
                    $join
                    WHERE $where_date
                    GROUP BY l.student_id
                    ORDER BY total_minutes DESC
                    LIMIT 100";

            $rows = $wpdb->get_results( $sql, ARRAY_A );

            $leaderboard = array();
            $user_rank = null;

            foreach ( $rows as $index => $row ) {
                $student_id = intval( $row['student_id'] );
                $user = get_userdata( $student_id );
                $rank = $index + 1;

                $total_min = intval( $row['total_minutes'] );
                $hours = floor( $total_min / 60 );
                $mins = $total_min % 60;
                $formatted_time = sprintf( '%d ساعت%s', $hours, $mins > 0 ? " و $mins دقیقه" : '' );

                $item = array(
                    'rank'           => $rank,
                    'student_id'     => $student_id,
                    'student_name'   => $user ? $user->display_name : 'دانش‌آموز #' . $student_id,
                    'avatar_url'     => get_avatar_url( $student_id, array( 'size' => 64 ) ),
                    'grade'          => get_user_meta( $student_id, 'rksp_grade', true ) ?: 'دوازدهم تجربی',
                    'total_minutes'  => $total_min,
                    'formatted_time' => $formatted_time,
                    'is_current'     => ( $student_id === $current_user_id ),
                    'medal'          => $rank === 1 ? 'gold' : ( $rank === 2 ? 'silver' : ( $rank === 3 ? 'bronze' : null ) ),
                );

                if ( $item['is_current'] ) {
                    $user_rank = $item;
                }

                $leaderboard[] = $item;
            }

            $response = array(
                'period'      => $period,
                'leaderboard' => $leaderboard,
                'my_rank'     => $user_rank,
                'updated_at'  => current_time( 'mysql' ),
            );

            // کش ۵ دقیقه‌ای (۳۰۰ ثانیه)
            set_transient( $cache_key, $response, 300 );

            return rest_ensure_response( $response );
        }

        public static function get_my_tasks( $request ) {
            global $wpdb;
            $user_id = get_current_user_id();
            $tasks_table = RKSP_DB::table( 'tasks' );

            $tasks = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT id, mentor_id, title, description, due_date, status, created_at, done_at
                     FROM $tasks_table 
                     WHERE student_id = %d 
                     ORDER BY status ASC, id DESC",
                    $user_id
                ),
                ARRAY_A
            );

            return rest_ensure_response( $tasks );
        }

        public static function update_task_status( $request ) {
            global $wpdb;
            $task_id = intval( $request['id'] );
            $params  = $request->get_json_params();
            $status  = ( isset( $params['status'] ) && $params['status'] === 'done' ) ? 'done' : 'pending';

            $tasks_table = RKSP_DB::table( 'tasks' );

            $wpdb->update(
                $tasks_table,
                array(
                    'status'  => $status,
                    'done_at' => $status === 'done' ? current_time( 'mysql' ) : null,
                ),
                array( 'id' => $task_id ),
                array( '%s', '%s' ),
                array( '%d' )
            );

            return rest_ensure_response( array(
                'success' => true,
                'status'  => $status,
                'message' => 'وضعیت گزارش کار به‌روزرسانی شد.',
            ) );
        }

        public static function get_my_notes( $request ) {
            global $wpdb;
            $user_id = get_current_user_id();
            $notes_table = RKSP_DB::table( 'notes' );

            $notes = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT n.id, n.mentor_id, n.content, n.visibility, n.created_at
                     FROM $notes_table n
                     WHERE n.student_id = %d AND n.visibility = 'public'
                     ORDER BY n.id DESC",
                    $user_id
                ),
                ARRAY_A
            );

            foreach ( $notes as &$note ) {
                $mentor = get_userdata( $note['mentor_id'] );
                $note['mentor_name'] = $mentor ? $mentor->display_name : 'مشاور تحصیلی';
            }

            return rest_ensure_response( $notes );
        }

        public static function get_my_plan( $request ) {
            global $wpdb;
            $user_id = get_current_user_id();
            $plans_table = RKSP_DB::table( 'plans' );

            $plan = $wpdb->get_row(
                $wpdb->prepare(
                    "SELECT id, plan_name, price, start_date, end_date, status
                     FROM $plans_table 
                     WHERE student_id = %d AND status = 'active'
                     ORDER BY id DESC LIMIT 1",
                    $user_id
                ),
                ARRAY_A
            );

            if ( ! $plan ) {
                return rest_ensure_response( array(
                    'has_plan' => false,
                    'message'  => 'در حال حاضر طرح فعالی ندارید.',
                ) );
            }

            $end_timestamp = strtotime( $plan['end_date'] );
            $now = strtotime( current_time( 'Y-m-d' ) );
            $days_left = ceil( ( $end_timestamp - $now ) / 86400 );

            $plan['days_left'] = $days_left;
            $plan['has_plan']  = true;
            $plan['is_expiring'] = ( $days_left >= 0 && $days_left <= 7 );
            $plan['is_expired']  = ( $days_left < 0 );

            return rest_ensure_response( $plan );
        }

        public static function get_my_achievements( $request ) {
            global $wpdb;
            $user_id = get_current_user_id();
            $achievements_table = RKSP_DB::table( 'achievements' );

            $items = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT id, type, message, created_at 
                     FROM $achievements_table 
                     WHERE student_id = %d 
                     ORDER BY id DESC LIMIT 50",
                    $user_id
                ),
                ARRAY_A
            );

            return rest_ensure_response( $items );
        }

        public static function get_channels( $request ) {
            $channels = get_option( 'rksp_channels', array(
                array( 'id' => 1, 'title' => 'سایت موسسه راه کنکور', 'type' => 'website', 'value' => 'https://rahkonkur.com' ),
                array( 'id' => 2, 'title' => 'شماره تماس راه کنکور', 'type' => 'phone', 'value' => '021-91000000' ),
                array( 'id' => 3, 'title' => 'کانال تلگرام راه کنکور', 'type' => 'telegram', 'value' => 'https://t.me/rahkonkur_channel' ),
                array( 'id' => 4, 'title' => 'صفحه اینستاگرام راه کنکور', 'type' => 'instagram', 'value' => 'https://instagram.com/rahkonkur' ),
                array( 'id' => 5, 'title' => 'پیام‌رسان بله', 'type' => 'ble', 'value' => 'https://ble.ir/rahkonkur' ),
            ) );

            return rest_ensure_response( $channels );
        }

        // ==================== کنترلرهای مشاور ====================

        public static function get_mentor_students( $request ) {
            global $wpdb;
            $mentor_id = get_current_user_id();
            $assignments_table = RKSP_DB::table( 'assignments' );
            $study_table       = RKSP_DB::table( 'study_logs' );
            $tasks_table       = RKSP_DB::table( 'tasks' );
            $plans_table       = RKSP_DB::table( 'plans' );

            $student_ids = $wpdb->get_col(
                $wpdb->prepare(
                    "SELECT student_id FROM $assignments_table WHERE mentor_id = %d AND status = 'active'",
                    $mentor_id
                )
            );

            if ( empty( $student_ids ) ) {
                return rest_ensure_response( array() );
            }

            $list = array();
            foreach ( $student_ids as $sid ) {
                $user = get_userdata( $sid );
                if ( ! $user ) continue;

                $total_min = $wpdb->get_var(
                    $wpdb->prepare( "SELECT SUM(minutes) FROM $study_table WHERE student_id = %d", $sid )
                );

                $last_log = $wpdb->get_row(
                    $wpdb->prepare( "SELECT log_date, minutes FROM $study_table WHERE student_id = %d ORDER BY log_date DESC LIMIT 1", $sid ),
                    ARRAY_A
                );

                $pending_tasks = $wpdb->get_var(
                    $wpdb->prepare( "SELECT COUNT(*) FROM $tasks_table WHERE student_id = %d AND status = 'pending'", $sid )
                );

                $plan = $wpdb->get_row(
                    $wpdb->prepare( "SELECT plan_name, end_date FROM $plans_table WHERE student_id = %d AND status = 'active' ORDER BY id DESC LIMIT 1", $sid ),
                    ARRAY_A
                );

                $list[] = array(
                    'student_id'    => $sid,
                    'name'          => $user->display_name,
                    'email'         => $user->user_email,
                    'phone'         => get_user_meta( $sid, 'mobile', true ) ?: 'ثبت نشده',
                    'grade'         => get_user_meta( $sid, 'rksp_grade', true ) ?: 'دوازدهم تجربی',
                    'total_hours'   => round( intval( $total_min ) / 60, 1 ),
                    'last_log_date' => $last_log ? $last_log['log_date'] : null,
                    'pending_tasks' => intval( $pending_tasks ),
                    'plan_name'     => $plan ? $plan['plan_name'] : 'بدون طرح',
                    'plan_end'      => $plan ? $plan['end_date'] : null,
                );
            }

            return rest_ensure_response( $list );
        }

        public static function create_mentor_task( $request ) {
            global $wpdb;
            $mentor_id = get_current_user_id();
            $params = $request->get_json_params();

            $student_id  = intval( $params['student_id'] );
            $title       = sanitize_text_field( $params['title'] );
            $description = isset( $params['description'] ) ? sanitize_textarea_field( $params['description'] ) : '';
            $due_date    = isset( $params['due_date'] ) ? sanitize_text_field( $params['due_date'] ) : null;

            if ( empty( $title ) ) {
                return new WP_Error( 'empty_title', 'عنوان گزارش کار الزامی است.', array( 'status' => 400 ) );
            }

            $tasks_table = RKSP_DB::table( 'tasks' );

            $wpdb->insert(
                $tasks_table,
                array(
                    'student_id'  => $student_id,
                    'mentor_id'   => $mentor_id,
                    'title'       => $title,
                    'description' => $description,
                    'due_date'    => $due_date,
                    'status'      => 'pending',
                    'created_at'  => current_time( 'mysql' ),
                ),
                array( '%d', '%d', '%s', '%s', '%s', '%s', '%s' )
            );

            return rest_ensure_response( array(
                'success' => true,
                'id'      => $wpdb->insert_id,
                'message' => 'گزارش کار با موفقیت ثبت و ارسال شد.',
            ) );
        }

        public static function create_mentor_note( $request ) {
            global $wpdb;
            $mentor_id = get_current_user_id();
            $params = $request->get_json_params();

            $student_id = intval( $params['student_id'] );
            $content    = sanitize_textarea_field( $params['content'] );
            $visibility = ( isset( $params['visibility'] ) && $params['visibility'] === 'private' ) ? 'private' : 'public';

            if ( empty( $content ) ) {
                return new WP_Error( 'empty_content', 'متن نظر عملکرد الزامی است.', array( 'status' => 400 ) );
            }

            $notes_table = RKSP_DB::table( 'notes' );

            $wpdb->insert(
                $notes_table,
                array(
                    'student_id' => $student_id,
                    'mentor_id'  => $mentor_id,
                    'content'    => $content,
                    'visibility' => $visibility,
                    'created_at' => current_time( 'mysql' ),
                ),
                array( '%d', '%d', '%s', '%s', '%s' )
            );

            return rest_ensure_response( array(
                'success' => true,
                'id'      => $wpdb->insert_id,
                'message' => 'نظر عملکرد درسی با موفقیت ثبت شد.',
            ) );
        }

        // ==================== کنترلرهای مدیر سایت ====================

        public static function get_admin_overview( $request ) {
            global $wpdb;
            $assignments_table = RKSP_DB::table( 'assignments' );
            $plans_table       = RKSP_DB::table( 'plans' );
            $tasks_table       = RKSP_DB::table( 'tasks' );

            // تعداد دانش‌آموزان
            $all_students = count( get_users( array( 'role' => 'rksp_student', 'fields' => 'ID' ) ) );

            // تعداد دانش‌آموزان بدون مشاور فعال
            $assigned_count = $wpdb->get_var( "SELECT COUNT(DISTINCT student_id) FROM $assignments_table WHERE status = 'active'" );
            $unassigned_count = max( 0, $all_students - intval( $assigned_count ) );

            // تعداد طرح‌های روبه‌انقضا (۷ روز آینده)
            $today = current_time( 'Y-m-d' );
            $seven_days = date( 'Y-m-d', strtotime( '+7 days' ) );

            $expiring_count = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT COUNT(*) FROM $plans_table WHERE status = 'active' AND end_date >= %s AND end_date <= %s",
                    $today,
                    $seven_days
                )
            );

            // لیست طرح‌های نزدیک به انقضا برای جدول داشبورد (مشابه عکس‌های ۷ و ۱۰)
            $plans_list = $wpdb->get_results(
                "SELECT p.*, u.display_name as student_name, m.display_name as mentor_name
                 FROM $plans_table p
                 LEFT JOIN {$wpdb->users} u ON p.student_id = u.ID
                 LEFT JOIN $assignments_table a ON p.student_id = a.student_id AND a.status = 'active'
                 LEFT JOIN {$wpdb->users} m ON a.mentor_id = m.ID
                 ORDER BY p.end_date ASC
                 LIMIT 20",
                ARRAY_A
            );

            foreach ( $plans_list as &$p ) {
                $end_ts = strtotime( $p['end_date'] );
                $now_ts = strtotime( current_time( 'Y-m-d' ) );
                $diff = ceil( ( $end_ts - $now_ts ) / 86400 );
                $p['days_left'] = $diff;
                $p['phone'] = get_user_meta( $p['student_id'], 'mobile', true ) ?: '۰۹۳۰۵۲۰۰۰۰۰';
            }

            // آمار بار کاری مشاوران
            $mentors = get_users( array( 'role' => 'rksp_mentor' ) );
            $mentors_stats = array();
            foreach ( $mentors as $mentor ) {
                $assigned_stds = $wpdb->get_var(
                    $wpdb->prepare( "SELECT COUNT(*) FROM $assignments_table WHERE mentor_id = %d AND status = 'active'", $mentor->ID )
                );
                $last_task = $wpdb->get_var(
                    $wpdb->prepare( "SELECT MAX(created_at) FROM $tasks_table WHERE mentor_id = %d", $mentor->ID )
                );
                $mentors_stats[] = array(
                    'mentor_id'       => $mentor->ID,
                    'name'            => $mentor->display_name,
                    'students_count'  => intval( $assigned_stds ),
                    'last_task_date'  => $last_task,
                );
            }

            return rest_ensure_response( array(
                'stats' => array(
                    'total_students'   => $all_students,
                    'unassigned_count' => $unassigned_count,
                    'expiring_plans'   => intval( $expiring_count ),
                    'active_mentors'   => count( $mentors ),
                ),
                'expiring_plans_table' => $plans_list,
                'mentors_workload'     => $mentors_stats,
            ) );
        }

        public static function assign_mentor( $request ) {
            global $wpdb;
            $params = $request->get_json_params();

            $student_id = intval( $params['student_id'] );
            $mentor_id  = intval( $params['mentor_id'] );

            if ( ! $student_id || ! $mentor_id ) {
                return new WP_Error( 'missing_params', 'انتخاب دانش‌آموز و مشاور الزامی است.', array( 'status' => 400 ) );
            }

            $assignments_table = RKSP_DB::table( 'assignments' );

            // خاتمه دادن به انتساب‌های قبلی فعال این دانش‌آموز (حفظ تاریخچه)
            $wpdb->update(
                $assignments_table,
                array( 'status' => 'ended', 'ended_at' => current_time( 'mysql' ) ),
                array( 'student_id' => $student_id, 'status' => 'active' ),
                array( '%s', '%s' ),
                array( '%d', '%s' )
            );

            // ایجاد انتساب جدید
            $wpdb->insert(
                $assignments_table,
                array(
                    'student_id'  => $student_id,
                    'mentor_id'   => $mentor_id,
                    'assigned_at' => current_time( 'mysql' ),
                    'status'      => 'active',
                ),
                array( '%d', '%d', '%s', '%s' )
            );

            return rest_ensure_response( array(
                'success' => true,
                'message' => 'مشاور با موفقیت به دانش‌آموز اختصاص یافت.',
            ) );
        }

        public static function create_or_renew_plan( $request ) {
            global $wpdb;
            $params = $request->get_json_params();

            $student_id = intval( $params['student_id'] );
            $plan_name  = sanitize_text_field( $params['plan_name'] );
            $price      = floatval( $params['price'] );
            $start_date = sanitize_text_field( $params['start_date'] );
            $end_date   = sanitize_text_field( $params['end_date'] );

            if ( ! $student_id || empty( $plan_name ) || empty( $start_date ) || empty( $end_date ) ) {
                return new WP_Error( 'missing_fields', 'تمامی فیلدهای طرح الزامی است.', array( 'status' => 400 ) );
            }

            $plans_table = RKSP_DB::table( 'plans' );

            // غیرفعال کردن طرح‌های قبلی دانش‌آموز
            $wpdb->update(
                $plans_table,
                array( 'status' => 'expired' ),
                array( 'student_id' => $student_id, 'status' => 'active' ),
                array( '%s' ),
                array( '%d', '%s' )
            );

            $wpdb->insert(
                $plans_table,
                array(
                    'student_id' => $student_id,
                    'plan_name'  => $plan_name,
                    'price'      => $price,
                    'start_date' => $start_date,
                    'end_date'   => $end_date,
                    'status'     => 'active',
                ),
                array( '%d', '%s', '%f', '%s', '%s', '%s' )
            );

            return rest_ensure_response( array(
                'success' => true,
                'id'      => $wpdb->insert_id,
                'message' => 'طرح اشتراک با موفقیت ثبت/تمدید شد.',
            ) );
        }

        public static function save_channels( $request ) {
            $params = $request->get_json_params();
            if ( ! is_array( $params ) ) {
                return new WP_Error( 'invalid_data', 'فرمت کانال‌ها نامعتبر است.', array( 'status' => 400 ) );
            }

            update_option( 'rksp_channels', $params );

            return rest_ensure_response( array(
                'success' => true,
                'message' => 'کانال‌های ارتباطی با موفقیت ذخیره شد.',
            ) );
        }

        /**
         * دریافت اطلاعات کامل پروفایل اختصاصی کاربر (دانش‌آموز یا مشاور)
         */
        public static function get_user_profile( $request ) {
            $user_id = get_current_user_id();
            $param_id = intval( $request->get_param( 'user_id' ) );
            if ( $param_id > 0 && ( current_user_can( 'administrator' ) || $user_id === 0 ) ) {
                $user_id = $param_id;
            }

            if ( $user_id <= 0 ) {
                return new WP_Error( 'not_logged_in', 'کاربر وارد نشده است.', array( 'status' => 401 ) );
            }

            $user = get_userdata( $user_id );
            if ( ! $user ) {
                return new WP_Error( 'user_not_found', 'کاربر مورد نظر یافت نشد.', array( 'status' => 404 ) );
            }

            $role = ! empty( $user->roles ) ? $user->roles[0] : 'subscriber';
            global $wpdb;

            $profile = array(
                'id'           => $user->ID,
                'username'     => $user->user_login,
                'name'         => $user->display_name,
                'email'        => $user->user_email,
                'role'         => $role,
                'role_label'   => ( $role === 'rksp_mentor' ) ? 'مشاور تحصیلی' : ( ( $role === 'rksp_student' ) ? 'دانش‌آموز' : 'مدیر سامانه' ),
                'phone'        => get_user_meta( $user_id, 'rksp_phone', true ) ?: $user->user_login,
                'created_at'   => $user->user_registered,
            );

            if ( $role === 'rksp_student' ) {
                $mentor_id = intval( get_user_meta( $user_id, 'rksp_assigned_mentor_id', true ) );
                $mentor_info = null;
                if ( $mentor_id > 0 ) {
                    $mentor_user = get_userdata( $mentor_id );
                    if ( $mentor_user ) {
                        $mentor_info = array(
                            'id'        => $mentor_id,
                            'name'      => $mentor_user->display_name,
                            'phone'     => get_user_meta( $mentor_id, 'rksp_phone', true ),
                            'specialty' => get_user_meta( $mentor_id, 'rksp_specialty', true ),
                        );
                    }
                }

                // آمار ساعت مطالعه
                $logs_table = RKSP_DB::table( 'study_logs' );
                $stats = $wpdb->get_row( $wpdb->prepare(
                    "SELECT COALESCE(SUM(duration_minutes), 0) as total_minutes, COUNT(id) as total_logs FROM $logs_table WHERE student_id = %d",
                    $user_id
                ) );

                // طرح اشتراک فعال
                $plans_table = RKSP_DB::table( 'plans' );
                $plan = $wpdb->get_row( $wpdb->prepare(
                    "SELECT plan_name, end_date FROM $plans_table WHERE student_id = %d AND status = 'active' ORDER BY id DESC LIMIT 1",
                    $user_id
                ) );

                $profile['grade']          = get_user_meta( $user_id, 'rksp_grade', true ) ?: 'دوازدهم';
                $profile['major']          = get_user_meta( $user_id, 'rksp_major', true ) ?: 'تجربی';
                $profile['city']           = get_user_meta( $user_id, 'rksp_city', true ) ?: 'تهران';
                $profile['school']         = get_user_meta( $user_id, 'rksp_school', true ) ?: '';
                $profile['target_year']    = get_user_meta( $user_id, 'rksp_target_year', true ) ?: '۱۴۰۶';
                $profile['mentor']         = $mentor_info;
                $profile['total_hours']    = round( ( $stats->total_minutes ?? 0 ) / 60, 1 );
                $profile['total_logs']     = intval( $stats->total_logs ?? 0 );
                $profile['active_plan']    = $plan ? $plan->plan_name : 'طرح پیش‌فرض';
                $profile['plan_expiry']    = $plan ? $plan->end_date : '۱۴۰۶/۰۴/۱۵';
            } elseif ( $role === 'rksp_mentor' ) {
                $profile['specialty']      = get_user_meta( $user_id, 'rksp_specialty', true ) ?: 'مشاوره کنکور سراسری';
                $profile['experience']     = get_user_meta( $user_id, 'rksp_experience', true ) ?: 'رتبه برتر و دانش‌آموخته دانشگاه برتر';
                $profile['bio']            = get_user_meta( $user_id, 'rksp_bio', true ) ?: '';
                $profile['capacity']       = intval( get_user_meta( $user_id, 'rksp_capacity', true ) ) ?: 30;

                // تعداد شاگردان تحت پوشش
                $students_count = $wpdb->get_var( $wpdb->prepare(
                    "SELECT COUNT(user_id) FROM {$wpdb->usermeta} WHERE meta_key = 'rksp_assigned_mentor_id' AND meta_value = %d",
                    $user_id
                ) );
                $profile['active_students_count'] = intval( $students_count );
            }

            return rest_ensure_response( array(
                'success' => true,
                'profile' => $profile,
            ) );
        }

        /**
         * به‌روزرسانی اطلاعات پروفایل اختصاصی کاربر از طریق REST API
         */
        public static function update_user_profile( $request ) {
            $user_id = get_current_user_id();
            $param_id = intval( $request->get_param( 'user_id' ) );
            if ( $param_id > 0 && ( current_user_can( 'administrator' ) || $user_id === 0 ) ) {
                $user_id = $param_id;
            }

            if ( $user_id <= 0 ) {
                return new WP_Error( 'not_logged_in', 'کاربر وارد نشده است.', array( 'status' => 401 ) );
            }

            $user = get_userdata( $user_id );
            if ( ! $user ) {
                return new WP_Error( 'user_not_found', 'کاربر یافت نشد.', array( 'status' => 404 ) );
            }

            $params = $request->get_json_params();
            if ( empty( $params ) ) {
                $params = $request->get_params();
            }

            $role = ! empty( $user->roles ) ? $user->roles[0] : 'subscriber';

            // به‌روزرسانی نام و ایمیل در جدول wp_users
            $user_updates = array( 'ID' => $user_id );
            if ( ! empty( $params['name'] ) ) {
                $user_updates['display_name'] = sanitize_text_field( $params['name'] );
                $user_updates['first_name']   = sanitize_text_field( $params['name'] );
            }
            if ( ! empty( $params['email'] ) && is_email( $params['email'] ) ) {
                $user_updates['user_email'] = sanitize_email( $params['email'] );
            }
            if ( ! empty( $params['password'] ) && strlen( $params['password'] ) >= 6 ) {
                $user_updates['user_pass'] = $params['password'];
            }

            if ( count( $user_updates ) > 1 ) {
                wp_update_user( $user_updates );
            }

            // فیلدهای مشترک متادیتا
            if ( isset( $params['phone'] ) ) {
                update_user_meta( $user_id, 'rksp_phone', sanitize_text_field( $params['phone'] ) );
            }

            // فیلدهای اختصاصی دانش‌آموز
            if ( $role === 'rksp_student' ) {
                if ( isset( $params['grade'] ) ) {
                    update_user_meta( $user_id, 'rksp_grade', sanitize_text_field( $params['grade'] ) );
                }
                if ( isset( $params['major'] ) ) {
                    update_user_meta( $user_id, 'rksp_major', sanitize_text_field( $params['major'] ) );
                }
                if ( isset( $params['city'] ) ) {
                    update_user_meta( $user_id, 'rksp_city', sanitize_text_field( $params['city'] ) );
                }
                if ( isset( $params['school'] ) ) {
                    update_user_meta( $user_id, 'rksp_school', sanitize_text_field( $params['school'] ) );
                }
                if ( isset( $params['target_year'] ) ) {
                    update_user_meta( $user_id, 'rksp_target_year', sanitize_text_field( $params['target_year'] ) );
                }
            } elseif ( $role === 'rksp_mentor' ) {
                // فیلدهای اختصاصی مشاور
                if ( isset( $params['specialty'] ) ) {
                    update_user_meta( $user_id, 'rksp_specialty', sanitize_text_field( $params['specialty'] ) );
                }
                if ( isset( $params['experience'] ) ) {
                    update_user_meta( $user_id, 'rksp_experience', sanitize_text_field( $params['experience'] ) );
                }
                if ( isset( $params['bio'] ) ) {
                    update_user_meta( $user_id, 'rksp_bio', sanitize_textarea_field( $params['bio'] ) );
                }
                if ( isset( $params['capacity'] ) ) {
                    update_user_meta( $user_id, 'rksp_capacity', intval( $params['capacity'] ) );
                }
            }

            return rest_ensure_response( array(
                'success' => true,
                'message' => 'پروفایل کاربری با موفقیت به‌روزرسانی شد.',
            ) );
        }
    }
}
