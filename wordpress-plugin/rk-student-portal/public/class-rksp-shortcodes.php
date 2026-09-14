<?php
/**
 * مدیریت شورتکدهای اختصاصی بدون وابستگی به قالب (RKSP_Shortcodes)
 *
 * هیچ منطق دیتابیسی در شورتکد نیست؛ صرفاً کانتینر HTML و بارگذاری اسکریپت جاوااسکریپت
 * که مستقیماً همان REST API اپ موبایل را صدا می‌زند.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( 'RKSP_Shortcodes' ) ) {
    class RKSP_Shortcodes {

        public static function init() {
            add_shortcode( 'rksp_student_portal', array( __CLASS__, 'render_student_portal' ) );
            add_shortcode( 'rksp_mentor_portal', array( __CLASS__, 'render_mentor_portal' ) );
            add_shortcode( 'rksp_student_register', array( __CLASS__, 'render_student_register' ) );
            add_shortcode( 'rksp_auth', array( __CLASS__, 'render_auth' ) );
            add_shortcode( 'rksp_leaderboard', array( __CLASS__, 'render_leaderboard' ) );
            add_shortcode( 'rksp_achievements', array( __CLASS__, 'render_achievements' ) );
            add_shortcode( 'rksp_profile', array( __CLASS__, 'render_profile' ) );

            add_action( 'wp_enqueue_scripts', array( __CLASS__, 'register_assets' ) );
        }

        /**
         * شورتکد اختصاصی صرفاً ثبت‌نام دانش‌آموز: [rksp_student_register]
         */
        public static function render_student_register( $atts ) {
            self::enqueue_needed_assets();
            if ( is_user_logged_in() && RKSP_Roles::is_student() ) {
                return '<div class="rksp-portal-container" dir="rtl">
                    <div class="rksp-notice" style="padding:20px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;text-align:center;">
                        <h4 style="color:#166534;margin-top:0;">شما با موفقیت ثبت‌نام کرده و وارد شده‌اید.</h4>
                        <p style="color:#15803d;font-size:13px;">برای ثبت ساعت مطالعه و مشاهده تکالیف مشاور به پرتال خود مراجعه کنید:</p>
                        <a href="' . esc_url( home_url( '/student-portal/' ) ) . '" class="rksp-submit-btn" style="display:inline-block;width:auto;padding:10px 24px;text-decoration:none;">ورود به پرتال دانش‌آموزی</a>
                    </div>
                </div>';
            }
            if ( class_exists( 'RKSP_Forms' ) ) {
                return '<div class="rksp-portal-container" dir="rtl">' . RKSP_Forms::render_auth_shortcode( array(
                    'type'     => 'student',
                    'default'  => 'register',
                    'redirect' => home_url( '/student-portal/' ),
                ) ) . '</div>';
            }
            return '<div class="rksp-portal-card" style="text-align:center;">فرم ثبت‌نام در دسترس نیست.</div>';
        }

        /**
         * شورتکد عمومی احراز هویت: [rksp_auth type="student" default="register"]
         */
        public static function render_auth( $atts ) {
            self::enqueue_needed_assets();
            $atts = shortcode_atts( array(
                'type'     => 'student',
                'default'  => 'login',
                'redirect' => home_url( '/student-portal/' ),
            ), $atts );

            if ( class_exists( 'RKSP_Forms' ) ) {
                return '<div class="rksp-portal-container" dir="rtl">' . RKSP_Forms::render_auth_shortcode( $atts ) . '</div>';
            }
            return '';
        }

        public static function register_assets() {
            wp_register_style( 'rksp-portal-style', RKSP_PLUGIN_URL . 'public/css/portal-style.css', array(), RKSP_VERSION );
            wp_register_script( 'rksp-portal-script', RKSP_PLUGIN_URL . 'public/js/portal-script.js', array( 'jquery' ), RKSP_VERSION, true );

            wp_localize_script( 'rksp-portal-script', 'rkspPortalConfig', array(
                'root'         => esc_url_raw( rest_url() ),
                'nonce'        => wp_create_nonce( 'wp_rest' ),
                'isLoggedIn'   => is_user_logged_in(),
                'currentUserId'=> get_current_user_id(),
                'isStudent'    => RKSP_Roles::is_student(),
                'isMentor'     => RKSP_Roles::is_mentor(),
                'isAdmin'      => current_user_can( 'administrator' ),
            ) );
        }

        private static function enqueue_needed_assets() {
            wp_enqueue_style( 'rksp-portal-style' );
            wp_enqueue_script( 'rksp-portal-script' );
        }

        public static function render_student_portal( $atts ) {
            self::enqueue_needed_assets();
            
            $is_logged_in = is_user_logged_in();
            $is_student   = RKSP_Roles::is_student();
            $is_admin     = current_user_can( 'administrator' );

            // ۱. اگر کاربر لاگین نکرده باشد، فرم اختصاصی ورود و ثبت‌نام دانش‌آموز بی‌درنگ بارگذاری می‌شود
            if ( ! $is_logged_in ) {
                $auth_html = '';
                if ( class_exists( 'RKSP_Forms' ) ) {
                    $auth_html = RKSP_Forms::render_auth_shortcode( array(
                        'type'     => 'student',
                        'default'  => 'login',
                        'redirect' => home_url( '/student-portal/' ),
                    ) );
                } else {
                    $auth_html = '<div class="rksp-portal-card" style="text-align:center;padding:32px;">
                        <h3 style="margin-top:0;font-size:1.2rem;">ورود به پرتال دانش‌آموزی</h3>
                        <p style="color:#64748b;font-size:0.9rem;">برای مشاهده پرتال و ثبت ساعت مطالعه، لطفاً ابتدا وارد حساب کاربری خود شوید یا ثبت‌نام کنید.</p>
                        <a href="' . esc_url( wp_login_url( home_url( '/student-portal/' ) ) ) . '" class="rksp-submit-btn" style="display:inline-block;width:auto;padding:10px 24px;text-decoration:none;">ورود به حساب</a>
                    </div>';
                }

                return '<div id="rksp-student-portal-root" class="rksp-portal-container" dir="rtl" data-component="student-portal" data-auth-state="unauthenticated" data-target-role="student">' . $auth_html . '</div>';
            }

            // ۲. اگر با نقش غیردانش‌آموزی (مثلاً مشاور) لاگین کرده باشد
            if ( ! $is_student && ! $is_admin ) {
                return '<div class="rksp-portal-container" dir="rtl">
                    <div class="rksp-notice rksp-notice-warning" style="padding:24px;background:#fff8e6;border:1px solid #ffe08a;border-radius:14px;margin:20px 0;font-family:inherit;">
                        <h3 style="margin-top:0;color:#946c00;font-size:1.15rem;">عدم دسترسی به پرتال دانش‌آموزی</h3>
                        <p style="color:#78350f;font-size:0.9rem;line-height:1.7;">شما در حال حاضر با حساب کاربری مشاور تحصیلی وارد سامانه شده‌اید. برای مدیریت و پایش شاگردان خود، لطفاً به پرتال اختصاصی مشاوران مراجعه فرمایید.</p>
                        <div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap;align-items:center;">
                            <a href="' . esc_url( home_url( '/mentor-portal/' ) ) . '" class="rksp-submit-btn" style="display:inline-block;width:auto;padding:10px 20px;text-decoration:none;">رفتن به پرتال مشاوران</a>
                            <a href="' . esc_url( wp_logout_url( get_permalink() ) ) . '" style="display:inline-block;padding:10px 16px;color:#dc2626;font-weight:700;text-decoration:none;font-size:0.9rem;">خروج از حساب</a>
                        </div>
                    </div>
                </div>';
            }

            // ۳. کاربر احراز هویت شده (دانش‌آموز یا مدیر): رندر بی‌درنگ کل محتوای پرتال در سرور
            $current_user_id = get_current_user_id();
            $portal_html = self::build_student_dashboard_html( $current_user_id );

            return '<div id="rksp-student-portal-root" class="rksp-portal-container" dir="rtl" data-component="student-portal" data-auth-state="authenticated" data-user-id="' . esc_attr( $current_user_id ) . '">' . $portal_html . '</div>';
        }

        public static function render_mentor_portal( $atts ) {
            self::enqueue_needed_assets();

            $is_logged_in = is_user_logged_in();
            $is_mentor    = RKSP_Roles::is_mentor();
            $is_admin     = current_user_can( 'administrator' );

            // ۱. اگر کاربر لاگین نکرده باشد، فرم ورود و عضویت مشاوران نمایش داده می‌شود
            if ( ! $is_logged_in ) {
                $auth_html = '';
                if ( class_exists( 'RKSP_Forms' ) ) {
                    $auth_html = RKSP_Forms::render_auth_shortcode( array(
                        'type'     => 'mentor',
                        'default'  => 'login',
                        'redirect' => home_url( '/mentor-portal/' ),
                    ) );
                } else {
                    $auth_html = '<div class="rksp-portal-card" style="text-align:center;padding:32px;">
                        <h3 style="margin-top:0;font-size:1.2rem;">ورود به پرتال مشاوران</h3>
                        <p style="color:#64748b;font-size:0.9rem;">برای دسترسی به پنل مشاوران، لطفاً وارد حساب خود شوید یا ثبت‌نام فرمایید.</p>
                        <a href="' . esc_url( wp_login_url( home_url( '/mentor-portal/' ) ) ) . '" class="rksp-submit-btn" style="display:inline-block;width:auto;padding:10px 24px;text-decoration:none;">ورود مشاور</a>
                    </div>';
                }

                return '<div id="rksp-mentor-portal-root" class="rksp-portal-container" dir="rtl" data-component="mentor-portal" data-auth-state="unauthenticated" data-target-role="mentor">' . $auth_html . '</div>';
            }

            // ۲. اگر با نقش دانش‌آموز وارد شده باشد
            if ( ! $is_mentor && ! $is_admin ) {
                return '<div class="rksp-portal-container" dir="rtl">
                    <div class="rksp-notice rksp-notice-warning" style="padding:24px;background:#fff8e6;border:1px solid #ffe08a;border-radius:14px;margin:20px 0;font-family:inherit;">
                        <h3 style="margin-top:0;color:#946c00;font-size:1.15rem;">دسترسی به پرتال مشاوران محدود است</h3>
                        <p style="color:#78350f;font-size:0.9rem;line-height:1.7;">این پرتال مختص مشاوران تحصیلی ثبت‌شده در سامانه است. شما در حال حاضر به عنوان دانش‌آموز وارد شده‌اید.</p>
                        <div style="display:flex;gap:12px;margin-top:16px;flex-wrap:wrap;align-items:center;">
                            <a href="' . esc_url( home_url( '/student-portal/' ) ) . '" class="rksp-submit-btn" style="display:inline-block;width:auto;padding:10px 20px;text-decoration:none;">رفتن به پرتال دانش‌آموز</a>
                            <a href="' . esc_url( wp_logout_url( get_permalink() ) ) . '" style="display:inline-block;padding:10px 16px;color:#dc2626;font-weight:700;text-decoration:none;font-size:0.9rem;">خروج از حساب</a>
                        </div>
                    </div>
                </div>';
            }

            $current_user_id = get_current_user_id();
            $portal_html = self::build_mentor_dashboard_html( $current_user_id );

            return '<div id="rksp-mentor-portal-root" class="rksp-portal-container" dir="rtl" data-component="mentor-portal" data-auth-state="authenticated" data-user-id="' . esc_attr( $current_user_id ) . '">' . $portal_html . '</div>';
        }

        /**
         * تولید مستقیم HTML کامل پرتال دانش‌آموز (SSR)
         * تضمین رندرینگ ۱۰۰٪ حتی بدون وابستگی به اجرای جاوااسکریپت
         */
        public static function build_student_dashboard_html( $user_id ) {
            global $wpdb;
            $user = get_userdata( $user_id );
            if ( ! $user ) {
                return '<div class="rksp-portal-card" style="text-align:center;">کاربر معتبر یافت نشد.</div>';
            }

            $display_name = ! empty( $user->display_name ) ? $user->display_name : ( ! empty( $user->first_name ) ? $user->first_name : $user->user_login );
            $mobile       = get_user_meta( $user_id, 'rksp_phone', true ) ?: $user->user_login;
            $grade        = get_user_meta( $user_id, 'rksp_grade', true ) ?: 'دوازدهم تجربی';
            $major        = get_user_meta( $user_id, 'rksp_major', true ) ?: 'علوم تجربی';
            $city         = get_user_meta( $user_id, 'rksp_city', true ) ?: 'تهران';
            
            // دریافت نام مشاور متصل
            $mentor_id = (int) get_user_meta( $user_id, 'rksp_assigned_mentor_id', true );
            $mentor_name = 'مشاور تخصصی راه کنکور';
            $mentor_phone = '09121112233';
            if ( $mentor_id > 0 ) {
                $mentor_user = get_userdata( $mentor_id );
                if ( $mentor_user ) {
                    $mentor_name = $mentor_user->display_name ?: $mentor_user->user_login;
                    $mentor_phone = get_user_meta( $mentor_id, 'rksp_phone', true ) ?: '09121112233';
                }
            }

            // آمار ساعات مطالعه
            $table_logs = $wpdb->prefix . 'rksp_study_logs';
            $total_minutes = 0;
            $today_minutes = 0;
            if ( $wpdb->get_var( "SHOW TABLES LIKE '$table_logs'" ) === $table_logs ) {
                $total_minutes = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COALESCE(SUM(minutes), 0) FROM $table_logs WHERE student_id = %d", $user_id ) );
                $today_minutes = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COALESCE(SUM(minutes), 0) FROM $table_logs WHERE student_id = %d AND log_date = CURDATE()", $user_id ) );
            }
            $total_hours = round( $total_minutes / 60, 1 );
            $today_hours = round( $today_minutes / 60, 1 );

            // واکشی تسک‌ها / گزارش کارهای محول‌شده
            $table_tasks = $wpdb->prefix . 'rksp_tasks';
            $tasks = array();
            $pending_count = 0;
            if ( $wpdb->get_var( "SHOW TABLES LIKE '$table_tasks'" ) === $table_tasks ) {
                $tasks = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $table_tasks WHERE student_id = %d ORDER BY id DESC LIMIT 8", $user_id ) );
                $pending_count = (int) $wpdb->get_var( $wpdb->prepare( "SELECT COUNT(*) FROM $table_tasks WHERE student_id = %d AND status = 'pending'", $user_id ) );
            }

            // واکشی نظرات و بازخوردهای مشاور
            $table_notes = $wpdb->prefix . 'rksp_notes';
            $notes = array();
            if ( $wpdb->get_var( "SHOW TABLES LIKE '$table_notes'" ) === $table_notes ) {
                $notes = $wpdb->get_results( $wpdb->prepare( "SELECT * FROM $table_notes WHERE student_id = %d AND visibility = 'public' ORDER BY id DESC LIMIT 5", $user_id ) );
            }

            // واکشی ۵ رتبه برتر باشگاه ساعت مطالعه
            $top_students = array();
            if ( $wpdb->get_var( "SHOW TABLES LIKE '$table_logs'" ) === $table_logs ) {
                $top_students = $wpdb->get_results(
                    "SELECT student_id, SUM(minutes) as total_min 
                     FROM $table_logs 
                     WHERE log_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) 
                     GROUP BY student_id 
                     ORDER BY total_min DESC 
                     LIMIT 5"
                );
            }

            ob_start();
            ?>
            <!-- هدر و پروفایل دانش‌آموز -->
            <div class="rksp-profile-banner" style="background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%);color:#fff;border-radius:18px;padding:24px;margin-bottom:20px;box-shadow:0 10px 25px -5px rgba(15,23,42,0.15);">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;">
                    <div>
                        <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;flex-wrap:wrap;">
                            <span style="background:#ea580c;color:#fff;font-size:11.5px;font-weight:800;padding:4px 10px;border-radius:8px;">پرتال اختصاصی دانش‌آموز</span>
                            <span style="background:rgba(255,255,255,0.12);color:#fdba74;font-size:12px;font-family:monospace;font-weight:700;padding:3px 8px;border-radius:6px;">شناسه: #<?php echo esc_html( $user_id ); ?></span>
                            <span style="background:rgba(255,255,255,0.08);color:#cbd5e1;font-size:12px;padding:3px 8px;border-radius:6px;"><?php echo esc_html( $grade ); ?> - <?php echo esc_html( $major ); ?></span>
                        </div>
                        <h2 style="margin:0 0 6px 0;font-size:1.4rem;font-weight:900;color:#ffffff;">سلام، <?php echo esc_html( $display_name ); ?>! 🌸</h2>
                        <div style="font-size:13px;color:#94a3b8;display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
                            <span>📱 شماره موبایل: <strong style="color:#e2e8f0;"><?php echo esc_html( $mobile ); ?></strong></span>
                            <span>📍 شهر: <strong style="color:#e2e8f0;"><?php echo esc_html( $city ); ?></strong></span>
                            <span>👨‍🏫 مشاور شما: <strong style="color:#fdba74;"><?php echo esc_html( $mentor_name ); ?></strong></span>
                        </div>
                    </div>
                    <div>
                        <a href="<?php echo esc_url( wp_logout_url( get_permalink() ) ); ?>" class="rksp-btn-outline" style="color:#fca5a5;border-color:rgba(239,68,68,0.3);background:rgba(239,68,68,0.08);padding:8px 16px;border-radius:8px;font-size:12.5px;text-decoration:none;font-weight:700;display:inline-block;">خروج از حساب</a>
                    </div>
                </div>

                <!-- کارت‌های خلاصه آمار -->
                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:12px;margin-top:20px;">
                    <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);padding:12px 14px;border-radius:12px;text-align:center;">
                        <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;">مطالعه امروز</div>
                        <div style="font-size:1.4rem;font-weight:900;color:#fdba74;" id="rksp-stat-today-hours"><?php echo esc_html( $today_hours ); ?> <span style="font-size:11px;font-weight:600;color:#cbd5e1;">ساعت</span></div>
                    </div>
                    <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);padding:12px 14px;border-radius:12px;text-align:center;">
                        <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;">مجموع ساعات ثبت‌شده</div>
                        <div style="font-size:1.4rem;font-weight:900;color:#ffffff;" id="rksp-stat-total-hours"><?php echo esc_html( $total_hours ); ?> <span style="font-size:11px;font-weight:600;color:#cbd5e1;">ساعت</span></div>
                    </div>
                    <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);padding:12px 14px;border-radius:12px;text-align:center;">
                        <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;">تکالیف در انتظار انجام</div>
                        <div style="font-size:1.4rem;font-weight:900;color:#fca5a5;" id="rksp-stat-pending-tasks"><?php echo esc_html( $pending_count ); ?> <span style="font-size:11px;font-weight:600;color:#cbd5e1;">مورد</span></div>
                    </div>
                </div>
            </div>

            <!-- بخش ۱: ثبت ساعت مطالعه روزانه -->
            <div class="rksp-portal-card">
                <div class="rksp-portal-title">
                    <span style="display:flex;align-items:center;gap:8px;">
                        <span style="font-size:1.2rem;">⏱️</span>
                        <span>ثبت ساعت مطالعه روزانه (باشگاه ساعت مطالعه)</span>
                    </span>
                    <span style="font-size:12px;color:#ea580c;font-weight:700;">امتیاز پیشرفت در باشگاه</span>
                </div>
                <form id="rksp-form-study-log">
                    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:14px;">
                        <div class="rksp-form-group">
                            <label>مدت زمان مطالعه (دقیقه) <span style="color:#ef4444;">*</span></label>
                            <input type="number" id="rksp-minutes" class="rksp-form-input" min="15" max="1440" step="15" placeholder="مثال: 90" required />
                            <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
                                <button type="button" class="rksp-preset-btn" data-min="45" style="padding:4px 9px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;font-size:11.5px;font-weight:700;color:#475569;cursor:pointer;">۴۵ دقیقه</button>
                                <button type="button" class="rksp-preset-btn" data-min="60" style="padding:4px 9px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;font-size:11.5px;font-weight:700;color:#475569;cursor:pointer;">۶۰ دقیقه</button>
                                <button type="button" class="rksp-preset-btn" data-min="90" style="padding:4px 9px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;font-size:11.5px;font-weight:700;color:#475569;cursor:pointer;">۹۰ دقیقه</button>
                                <button type="button" class="rksp-preset-btn" data-min="120" style="padding:4px 9px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;font-size:11.5px;font-weight:700;color:#475569;cursor:pointer;">۲ ساعت</button>
                                <button type="button" class="rksp-preset-btn" data-min="150" style="padding:4px 9px;background:#f1f5f9;border:1px solid #cbd5e1;border-radius:6px;font-size:11.5px;font-weight:700;color:#475569;cursor:pointer;">۲.۵ ساعت</button>
                            </div>
                        </div>

                        <div class="rksp-form-group">
                            <label>درس و مبحث مطالعه شده</label>
                            <select id="rksp-subject" class="rksp-form-select">
                                <option value="زیست‌شناسی">زیست‌شناسی کنکور</option>
                                <option value="ریاضیات و حسابان">ریاضیات و حسابان</option>
                                <option value="شیمی">شیمی کنکور</option>
                                <option value="فیزیک">فیزیک کنکور</option>
                                <option value="زمین‌شناسی">زمین‌شناسی</option>
                                <option value="ادبیات فارسی">فارسی و علوم و فنون</option>
                                <option value="عربی">عربی کنکور</option>
                                <option value="زبان انگلیسی">زبان انگلیسی</option>
                                <option value="دین و زندگی">دین و زندگی</option>
                                <option value="فلسفه و منطق">فلسفه و منطق</option>
                                <option value="جامعه‌شناسی">جامعه‌شناسی و روانشناسی</option>
                                <option value="مرور جامع و جمع‌بندی">مرور جامع و جمع‌بندی</option>
                            </select>
                        </div>

                        <div class="rksp-form-group">
                            <label>تعداد تست‌های حل شده</label>
                            <input type="number" id="rksp-tests-count" class="rksp-form-input" min="0" placeholder="مثال: ۳۵ تست" />
                        </div>
                    </div>

                    <button type="submit" id="rksp-btn-submit-log" class="rksp-submit-btn" style="margin-top:10px;">
                        ثبت مستقیم در باشگاه ساعت مطالعه 🚀
                    </button>
                </form>
                <div id="rksp-study-msg" style="margin-top:12px;font-size:13.5px;text-align:center;font-weight:600;"></div>
            </div>

            <!-- بخش ۲: گزارش‌کارها و تکالیف محول‌شده مشاور -->
            <div class="rksp-portal-card">
                <div class="rksp-portal-title">
                    <span style="display:flex;align-items:center;gap:8px;">
                        <span style="font-size:1.2rem;">📋</span>
                        <span>تکالیف و برنامه‌های محول‌شده توسط مشاور</span>
                    </span>
                    <span style="font-size:12px;color:#64748b;">(به‌روزرسانی آنلاین)</span>
                </div>
                <div id="rksp-my-tasks-list">
                    <?php if ( empty( $tasks ) ) : ?>
                        <div style="text-align:center;padding:24px;background:#f8fafc;border-radius:12px;border:1px dashed #cbd5e1;color:#64748b;font-size:13px;">
                            در حال حاضر تکلیف معوقه‌ای ثبت نشده است. مشاور شما تکالیف جدید را از طریق پنل اختصاصی ابلاغ خواهد کرد.
                        </div>
                    <?php else : ?>
                        <div class="space-y-2">
                            <?php foreach ( $tasks as $t ) : 
                                $is_done = ( $t->status === 'done' );
                            ?>
                                <div class="rksp-task-row <?php echo $is_done ? 'done' : ''; ?>" id="rksp-task-row-<?php echo esc_attr( $t->id ); ?>" style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;background:<?php echo $is_done ? '#f0fdf4' : '#f8fafc'; ?>;border:1px solid <?php echo $is_done ? '#bbf7d0' : '#e2e8f0'; ?>;border-radius:12px;margin-bottom:8px;">
                                    <div>
                                        <strong style="color:#0f172a;font-size:14px;"><?php echo esc_html( $t->title ); ?></strong>
                                        <?php if ( ! empty( $t->description ) ) : ?>
                                            <div style="font-size:12.5px;color:#64748b;margin-top:3px;"><?php echo esc_html( $t->description ); ?></div>
                                        <?php endif; ?>
                                        <?php if ( ! empty( $t->due_date ) ) : ?>
                                            <div style="font-size:11px;color:#ea580c;margin-top:4px;">مهلت انجام: <?php echo esc_html( $t->due_date ); ?></div>
                                        <?php endif; ?>
                                    </div>
                                    <div class="rksp-task-action">
                                        <?php if ( $is_done ) : ?>
                                            <span style="color:#16a34a;font-size:12.5px;font-weight:700;background:#dcfce7;padding:4px 10px;border-radius:8px;">انجام شد ✓</span>
                                        <?php else : ?>
                                            <button type="button" class="rksp-done-task-btn" data-id="<?php echo esc_attr( $t->id ); ?>" style="background:#10b981;color:#fff;border:none;padding:6px 14px;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer;">ثبت انجام شد</button>
                                        <?php endif; ?>
                                    </div>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>
            </div>

            <!-- بخش ۳: نظرات و بازخوردهای عملکرد درسی مشاور -->
            <div class="rksp-portal-card">
                <div class="rksp-portal-title">
                    <span style="display:flex;align-items:center;gap:8px;">
                        <span style="font-size:1.2rem;">💬</span>
                        <span>بازخوردها و توصیه‌های آموزشی مشاور تحصیلی</span>
                    </span>
                </div>
                <div id="rksp-my-notes-list">
                    <?php if ( empty( $notes ) ) : ?>
                        <div style="text-align:center;padding:20px;color:#94a3b8;font-size:13px;background:#f8fafc;border-radius:12px;">
                            هنوز یادداشتی از طرف مشاور ثبت نشده است. پس از بررسی ساعات مطالعه، نکات تحلیلی در اینجا نمایش داده خواهد شد.
                        </div>
                    <?php else : ?>
                        <?php foreach ( $notes as $n ) : ?>
                            <div style="padding:14px 18px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:10px;">
                                <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:12px;color:#64748b;">
                                    <span style="font-weight:700;color:#0f172a;">مشاور: <?php echo esc_html( $mentor_name ); ?></span>
                                    <span><?php echo esc_html( $n->created_at ); ?></span>
                                </div>
                                <div style="font-size:13.5px;line-height:1.7;color:#334155;"><?php echo nl2br( esc_html( $n->content ) ); ?></div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>

            <!-- بخش ۴: راه‌های ارتباط مستقیم با مشاور تحصیلی -->
            <div class="rksp-portal-card" style="background:#fff7ed;border-color:#ffedd5;">
                <div class="rksp-portal-title" style="color:#9a3412;">
                    <span>ارتباط مستقیم با مشاور تحصیلی (<?php echo esc_html( $mentor_name ); ?>)</span>
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:10px;margin-top:12px;">
                    <a href="tel:<?php echo esc_attr( $mentor_phone ); ?>" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;background:#fff;border:1px solid #fed7aa;border-radius:10px;text-decoration:none;color:#c2410c;font-weight:700;font-size:13px;">
                        <span>📞</span> تماس تلفنی / پیامک
                    </a>
                    <a href="https://t.me/rahkonkur" target="_blank" rel="noreferrer" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;background:#fff;border:1px solid #fed7aa;border-radius:10px;text-decoration:none;color:#c2410c;font-weight:700;font-size:13px;">
                        <span>✈️</span> پشتیبانی تلگرام
                    </a>
                    <a href="https://eitaa.com/rahkonkur" target="_blank" rel="noreferrer" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:12px;background:#fff;border:1px solid #fed7aa;border-radius:10px;text-decoration:none;color:#c2410c;font-weight:700;font-size:13px;">
                        <span>💬</span> پیام‌رسان ایتا
                    </a>
                </div>
            </div>
            <?php
            return ob_get_clean();
        }

        /**
         * تولید مستقیم HTML پرتال مشاور (SSR)
         */
        public static function build_mentor_dashboard_html( $mentor_id ) {
            global $wpdb;
            $user = get_userdata( $mentor_id );
            $name = $user ? ( $user->display_name ?: $user->user_login ) : 'مشاور تحصیلی';

            $table_assignments = $wpdb->prefix . 'rksp_assignments';
            $assigned_students = array();
            if ( $wpdb->get_var( "SHOW TABLES LIKE '$table_assignments'" ) === $table_assignments ) {
                $assigned_students = $wpdb->get_results( $wpdb->prepare(
                    "SELECT student_id FROM $table_assignments WHERE mentor_id = %d AND status = 'active'",
                    $mentor_id
                ) );
            }

            ob_start();
            ?>
            <div class="rksp-profile-banner" style="background:linear-gradient(135deg, #0f766e 0%, #115e59 100%);color:#fff;border-radius:18px;padding:24px;margin-bottom:20px;">
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;">
                    <div>
                        <span style="background:rgba(255,255,255,0.2);color:#fff;font-size:11.5px;font-weight:800;padding:4px 10px;border-radius:8px;">پنل مدیریت مشاوران</span>
                        <h2 style="margin:8px 0 4px 0;font-size:1.4rem;font-weight:900;color:#fff;">سلام، استاد <?php echo esc_html( $name ); ?></h2>
                        <div style="font-size:13px;color:#ccfbf1;">تعداد دانش‌آموزان تحت پوشش: <strong><?php echo count( $assigned_students ); ?> نفر</strong></div>
                    </div>
                    <div>
                        <a href="<?php echo esc_url( wp_logout_url( get_permalink() ) ); ?>" class="rksp-btn-outline" style="color:#fff;border-color:rgba(255,255,255,0.3);padding:8px 16px;border-radius:8px;font-size:12.5px;text-decoration:none;font-weight:700;">خروج از پنل</a>
                    </div>
                </div>
            </div>

            <div class="rksp-portal-card">
                <div class="rksp-portal-title">دانش‌آموزان اختصاصی شما</div>
                <?php if ( empty( $assigned_students ) ) : ?>
                    <p style="color:#64748b;font-size:13px;">هنوز دانش‌آموزی به شما تخصیص داده نشده است. دانش‌آموزان جدید پس از ثبت‌نام به لیست اضافه می‌شوند.</p>
                <?php else : ?>
                    <div style="display:grid;gap:10px;">
                        <?php foreach ( $assigned_students as $as ) : 
                            $stu = get_userdata( $as->student_id );
                            if ( ! $stu ) continue;
                            $s_grade = get_user_meta( $as->student_id, 'rksp_grade', true ) ?: 'دوازدهم تجربی';
                            $s_phone = get_user_meta( $as->student_id, 'rksp_phone', true ) ?: $stu->user_login;
                        ?>
                            <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
                                <div>
                                    <strong style="color:#0f172a;"><?php echo esc_html( $stu->display_name ?: $stu->user_login ); ?></strong>
                                    <span style="font-size:12px;color:#64748b;margin-right:8px;">(<?php echo esc_html( $s_grade ); ?> - <?php echo esc_html( $s_phone ); ?>)</span>
                                </div>
                                <span style="font-size:12px;color:#0f766e;font-weight:700;">شناسه: #<?php echo esc_html( $as->student_id ); ?></span>
                            </div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>
            </div>
            <?php
            return ob_get_clean();
        }

        public static function render_leaderboard( $atts ) {
            self::enqueue_needed_assets();
            $atts = shortcode_atts( array(
                'period' => 'weekly',
            ), $atts );

            return sprintf(
                '<div id="rksp-leaderboard-root" class="rksp-portal-container" dir="rtl" data-component="leaderboard" data-period="%s"></div>',
                esc_attr( $atts['period'] )
            );
        }

        public static function render_achievements( $atts ) {
            self::enqueue_needed_assets();
            return '<div id="rksp-achievements-root" class="rksp-portal-container" dir="rtl" data-component="achievements"></div>';
        }

        /**
         * رندر صفحه مدیریت پروفایل اختصاصی کاربر از طریق REST API
         */
        public static function render_profile( $atts ) {
            self::enqueue_needed_assets();

            if ( ! is_user_logged_in() ) {
                return '<div class="rksp-auth-wrapper" dir="rtl" style="max-width:500px;margin:30px auto;text-align:center;padding:32px;background:#fff;border-radius:16px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);border:1px solid #e2e8f0;">
                    <div style="font-size:2.5rem;margin-bottom:12px;">🔒</div>
                    <h3 style="margin:0 0 8px;font-size:1.25rem;color:#0f172a;">ورود به حساب کاربری</h3>
                    <p style="color:#64748b;font-size:0.9rem;margin-bottom:20px;">برای مشاهده و ویرایش مشخصات پروفایل اختصاصی خود، لطفاً ابتدا وارد سامانه شوید.</p>
                    <a href="' . esc_url( home_url( '/student-portal/' ) ) . '" style="display:inline-block;padding:12px 24px;background:#ea580c;color:#fff;border-radius:10px;text-decoration:none;font-weight:700;font-size:0.9rem;">ورود یا ثبت‌نام</a>
                </div>';
            }

            $current_user_id = get_current_user_id();

            return sprintf(
                '<div id="rksp-profile-root" class="rksp-portal-container" dir="rtl" data-component="user-profile" data-user-id="%d"></div>',
                esc_attr( $current_user_id )
            );
        }
    }
}
