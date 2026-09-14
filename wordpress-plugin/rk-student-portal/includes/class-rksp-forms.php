<?php
/**
 * فرم‌های اختصاصی ورود و ثبت‌نام مستقل از قالب و بدون افزونه جانبی (RKSP_Forms)
 *
 * استفاده از هسته وردپرس: wp_create_user, wp_signon, update_user_meta, set_role
 * تفکیک نقش‌های rksp_student و rksp_mentor
 * قابل استفاده از طریق شورت‌کد در هر برگه یا ابزارک
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( 'RKSP_Forms' ) ) {
    class RKSP_Forms {

        private static $errors = array();
        private static $success_message = '';

        public static function init() {
            // شورت‌کدهای اختصاصی
            add_shortcode( 'rksp_auth', array( __CLASS__, 'render_auth_shortcode' ) );
            add_shortcode( 'rksp_student_auth', array( __CLASS__, 'render_student_auth_shortcode' ) );
            add_shortcode( 'rksp_mentor_auth', array( __CLASS__, 'render_mentor_auth_shortcode' ) );

            // پردازش ارسال فرم‌ها قبل از بارگذاری هدر
            add_action( 'init', array( __CLASS__, 'handle_form_submissions' ) );
        }

        /**
         * شورتکد جامع [rksp_auth type="student|mentor"]
         */
        public static function render_auth_shortcode( $atts ) {
            $atts = shortcode_atts( array(
                'type'     => 'student', // 'student' or 'mentor'
                'default'  => 'login',   // 'login' or 'register'
                'redirect' => '',
            ), $atts, 'rksp_auth' );

            return self::build_form_html( $atts['type'], $atts['default'], $atts['redirect'] );
        }

        public static function render_student_auth_shortcode( $atts ) {
            return self::render_auth_shortcode( array(
                'type'     => 'student',
                'default'  => isset( $atts['default'] ) ? $atts['default'] : 'login',
                'redirect' => isset( $atts['redirect'] ) ? $atts['redirect'] : '',
            ) );
        }

        public static function render_mentor_auth_shortcode( $atts ) {
            return self::render_auth_shortcode( array(
                'type'     => 'mentor',
                'default'  => isset( $atts['default'] ) ? $atts['default'] : 'login',
                'redirect' => isset( $atts['redirect'] ) ? $atts['redirect'] : '',
            ) );
        }

        /**
         * پردازش ارسال فرم‌های ورود و ثبت‌نام
         */
        public static function handle_form_submissions() {
            if ( ! isset( $_POST['rksp_action'] ) ) {
                return;
            }

            // ۱. پردازش ثبت‌نام دانش‌آموز
            if ( $_POST['rksp_action'] === 'register_student' ) {
                if ( ! wp_verify_nonce( $_POST['rksp_nonce'] ?? '', 'rksp_register_student_action' ) ) {
                    self::$errors[] = 'اعتبارسنجی امنیتی با خطا مواجه شد. لطفاً صفحه را تازه‌سازی کنید.';
                    return;
                }

                $name      = sanitize_text_field( $_POST['name'] ?? '' );
                $mobile    = sanitize_text_field( $_POST['mobile'] ?? '' );
                $password  = $_POST['password'] ?? '';
                $grade     = sanitize_text_field( $_POST['grade'] ?? '' );
                $major     = sanitize_text_field( $_POST['major'] ?? '' );
                $city      = sanitize_text_field( $_POST['city'] ?? '' );
                $mentor_id = intval( $_POST['mentor_id'] ?? 0 );

                if ( empty( $name ) || empty( $mobile ) || empty( $password ) ) {
                    self::$errors[] = 'لطفاً نام، شماره موبایل و رمز عبور را به درستی وارد کنید.';
                    return;
                }

                if ( ! preg_match( '/^09[0-9]{9}$/', $mobile ) ) {
                    self::$errors[] = 'شماره موبایل وارد شده باید ۱۱ رقمی و با ۰۹ شروع شود.';
                    return;
                }

                if ( username_exists( $mobile ) ) {
                    self::$errors[] = 'این شماره موبایل قبلاً در سایت ثبت شده است. لطفاً وارد شوید.';
                    return;
                }

                // ایمیل یکتا خودکار جهت همخوانی کامل با ساختار وردپرس
                $email = $mobile . '@student.rahkonkur.local';
                if ( email_exists( $email ) ) {
                    $email = $mobile . '_' . time() . '@student.rahkonkur.local';
                }

                // ایجاد کاربر از طریق هسته بومی وردپرس
                $user_id = wp_create_user( $mobile, $password, $email );

                if ( is_wp_error( $user_id ) ) {
                    self::$errors[] = $user_id->get_error_message();
                    return;
                }

                // تنظیم نقش رسمی rksp_student
                $user = new WP_User( $user_id );
                $user->set_role( 'rksp_student' );

                // نام نمایشی
                wp_update_user( array(
                    'ID'           => $user_id,
                    'display_name' => $name,
                    'first_name'   => $name,
                ) );

                // ذخیره متادیتای اختصاصی پروفایل در جدول استاندارد wp_usermeta
                update_user_meta( $user_id, 'rksp_phone', $mobile );
                update_user_meta( $user_id, 'rksp_grade', $grade );
                update_user_meta( $user_id, 'rksp_major', $major );
                update_user_meta( $user_id, 'rksp_city', $city );
                global $wpdb;
                if ( $mentor_id <= 0 ) {
                    // اتصال خودکار به اولین مشاور فعال در صورت عدم انتخاب
                    $mentors = get_users( array( 'role' => 'rksp_mentor', 'number' => 1 ) );
                    if ( ! empty( $mentors ) ) {
                        $mentor_id = $mentors[0]->ID;
                    }
                }
                if ( $mentor_id > 0 ) {
                    update_user_meta( $user_id, 'rksp_assigned_mentor_id', $mentor_id );
                    $table_assignments = $wpdb->prefix . 'rksp_assignments';
                    $wpdb->insert(
                        $table_assignments,
                        array(
                            'student_id'  => $user_id,
                            'mentor_id'   => $mentor_id,
                            'status'      => 'active',
                            'assigned_at' => current_time( 'mysql' ),
                        )
                    );
                }

                // ورود خودکار کاربر پس از ثبت‌نام
                wp_set_current_user( $user_id );
                wp_set_auth_cookie( $user_id, true );

                $redirect = ! empty( $_POST['redirect_to'] ) ? esc_url_raw( $_POST['redirect_to'] ) : home_url( '/student-portal/' );
                wp_safe_redirect( $redirect );
                exit;
            }

            // ۲. پردازش ثبت‌نام مشاور
            if ( $_POST['rksp_action'] === 'register_mentor' ) {
                if ( ! wp_verify_nonce( $_POST['rksp_nonce'] ?? '', 'rksp_register_mentor_action' ) ) {
                    self::$errors[] = 'اعتبارسنجی امنیتی با خطا مواجه شد.';
                    return;
                }

                $name       = sanitize_text_field( $_POST['name'] ?? '' );
                $mobile     = sanitize_text_field( $_POST['mobile'] ?? '' );
                $password   = $_POST['password'] ?? '';
                $specialty  = sanitize_text_field( $_POST['specialty'] ?? '' );
                $experience = sanitize_text_field( $_POST['experience'] ?? '' );
                $bio        = sanitize_textarea_field( $_POST['bio'] ?? '' );

                if ( empty( $name ) || empty( $mobile ) || empty( $password ) ) {
                    self::$errors[] = 'تکمیل نام، شماره موبایل و رمز عبور الزامی است.';
                    return;
                }

                if ( username_exists( $mobile ) ) {
                    self::$errors[] = 'این شماره همراه قبلاً در سامانه ثبت شده است.';
                    return;
                }

                $email = $mobile . '@mentor.rahkonkur.local';
                $user_id = wp_create_user( $mobile, $password, $email );

                if ( is_wp_error( $user_id ) ) {
                    self::$errors[] = $user_id->get_error_message();
                    return;
                }

                // تنظیم نقش رسمی rksp_mentor
                $user = new WP_User( $user_id );
                $user->set_role( 'rksp_mentor' );

                wp_update_user( array(
                    'ID'           => $user_id,
                    'display_name' => $name,
                    'first_name'   => $name,
                ) );

                // متادیتای اختصاصی پروفایل مشاور
                update_user_meta( $user_id, 'rksp_phone', $mobile );
                update_user_meta( $user_id, 'rksp_specialty', $specialty );
                update_user_meta( $user_id, 'rksp_experience', $experience );
                update_user_meta( $user_id, 'rksp_bio', $bio );
                update_user_meta( $user_id, 'rksp_status', 'approved' );

                wp_set_current_user( $user_id );
                wp_set_auth_cookie( $user_id, true );

                $redirect = ! empty( $_POST['redirect_to'] ) ? esc_url_raw( $_POST['redirect_to'] ) : home_url( '/mentor-portal/' );
                wp_safe_redirect( $redirect );
                exit;
            }

            // ۳. پردازش ورود کاربر (مشترک با اعتبارسنجی نقش)
            if ( $_POST['rksp_action'] === 'login_user' ) {
                if ( ! wp_verify_nonce( $_POST['rksp_nonce'] ?? '', 'rksp_login_action' ) ) {
                    self::$errors[] = 'اعتبار امنیتی منقضی شده است.';
                    return;
                }

                $login    = sanitize_text_field( $_POST['log'] ?? '' );
                $password = $_POST['pwd'] ?? '';
                $expected = sanitize_text_field( $_POST['expected_role'] ?? '' );

                $creds = array(
                    'user_login'    => $login,
                    'user_password' => $password,
                    'remember'      => true,
                );

                $signon_user = wp_signon( $creds, is_ssl() );

                if ( is_wp_error( $signon_user ) ) {
                    self::$errors[] = 'نام کاربری (موبایل) یا رمز عبور اشتباه است.';
                    return;
                }

                // بررسی تطابق نقش جهت جلوگیری از ورود اشتباهی
                if ( ! empty( $expected ) && ! in_array( $expected, (array) $signon_user->roles ) && ! in_array( 'administrator', (array) $signon_user->roles ) ) {
                    wp_logout();
                    $role_name = ( $expected === 'rksp_student' ) ? 'دانش‌آموز' : 'مشاور';
                    self::$errors[] = "حساب کاربری شما متعلق به پنل {$role_name} نمی‌باشد.";
                    return;
                }

                // ریدایرکت بر اساس نقش
                if ( in_array( 'rksp_mentor', (array) $signon_user->roles ) ) {
                    $redirect = ! empty( $_POST['redirect_to'] ) ? esc_url_raw( $_POST['redirect_to'] ) : home_url( '/mentor-portal/' );
                } else {
                    $redirect = ! empty( $_POST['redirect_to'] ) ? esc_url_raw( $_POST['redirect_to'] ) : home_url( '/student-portal/' );
                }

                wp_safe_redirect( $redirect );
                exit;
            }
        }

        /**
         * تولید خروجی HTML فرم‌های ورود و ثبت‌نام با CSS اختصاصی و کامپکت
         */
        private static function build_form_html( $type = 'student', $default_tab = 'login', $redirect_url = '' ) {
            // اگر کاربر هم‌اکنون وارد شده است
            if ( is_user_logged_in() ) {
                $current_user = wp_get_current_user();
                $is_student   = in_array( 'rksp_student', (array) $current_user->roles );
                $is_mentor    = in_array( 'rksp_mentor', (array) $current_user->roles );
                $portal_link  = $is_mentor ? home_url( '/mentor-portal/' ) : home_url( '/student-portal/' );

                ob_start();
                ?>
                <div class="rksp-auth-box rksp-logged-in" dir="rtl">
                    <p>شما با نام کاربری <strong><?php echo esc_html( $current_user->display_name ); ?></strong> وارد سایت شده‌اید.</p>
                    <div class="rksp-btn-group">
                        <a href="<?php echo esc_url( $portal_link ); ?>" class="rksp-btn rksp-btn-primary">رفتن به پنل اختصاصی</a>
                        <a href="<?php echo esc_url( wp_logout_url( get_permalink() ) ); ?>" class="rksp-btn rksp-btn-outline">خروج از حساب</a>
                    </div>
                </div>
                <?php
                return ob_get_clean();
            }

            $current_url = get_permalink();
            if ( empty( $redirect_url ) ) {
                $redirect_url = ( $type === 'mentor' ) ? home_url( '/mentor-portal/' ) : home_url( '/student-portal/' );
            }

            $unique_id = 'rksp_auth_' . uniqid();

            ob_start();
            ?>
            <style>
                .rksp-auth-wrapper {
                    max-width: 480px;
                    margin: 24px auto;
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 24px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
                    font-family: inherit;
                    box-sizing: border-box;
                }
                .rksp-auth-wrapper * { box-sizing: border-box; }
                .rksp-auth-header { text-align: center; margin-bottom: 20px; }
                .rksp-auth-title { font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; }
                .rksp-auth-subtitle { font-size: 0.85rem; color: #64748b; margin: 0; }
                .rksp-tabs-nav {
                    display: flex;
                    background: #f1f5f9;
                    border-radius: 12px;
                    padding: 4px;
                    margin-bottom: 20px;
                    gap: 4px;
                }
                .rksp-tab-btn {
                    flex: 1;
                    padding: 10px;
                    border: none;
                    background: transparent;
                    border-radius: 8px;
                    font-weight: 700;
                    font-size: 0.85rem;
                    color: #475569;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    text-align: center;
                }
                .rksp-tab-btn.active {
                    background: #ffffff;
                    color: #ea580c;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .rksp-form-tab { display: none; }
                .rksp-form-tab.active { display: block; }
                .rksp-field-group { margin-bottom: 14px; }
                .rksp-label { display: block; font-size: 0.8rem; font-weight: 700; color: #334155; margin-bottom: 6px; }
                .rksp-input, .rksp-select, .rksp-textarea {
                    width: 100%;
                    padding: 10px 14px;
                    border: 1px solid #cbd5e1;
                    border-radius: 10px;
                    font-size: 0.9rem;
                    outline: none;
                    transition: border-color 0.2s;
                    font-family: inherit;
                }
                .rksp-input:focus, .rksp-select:focus, .rksp-textarea:focus {
                    border-color: #ea580c;
                }
                .rksp-row { display: flex; gap: 10px; }
                .rksp-col { flex: 1; }
                .rksp-btn-submit {
                    width: 100%;
                    padding: 12px;
                    background: #ea580c;
                    color: #ffffff;
                    border: none;
                    border-radius: 10px;
                    font-size: 0.95rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: background 0.2s;
                    margin-top: 8px;
                }
                .rksp-btn-submit:hover { background: #c2410c; }
                .rksp-alert-error {
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    color: #b91c1c;
                    padding: 12px;
                    border-radius: 10px;
                    font-size: 0.85rem;
                    margin-bottom: 16px;
                }
                .rksp-notice-badge {
                    display: inline-block;
                    background: #fff7ed;
                    color: #c2410c;
                    padding: 4px 10px;
                    border-radius: 9999px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    margin-bottom: 8px;
                }
            </style>

            <div class="rksp-auth-wrapper" id="<?php echo esc_attr( $unique_id ); ?>" dir="rtl">
                <div class="rksp-auth-header">
                    <span class="rksp-notice-badge">
                        <?php echo ( $type === 'mentor' ) ? 'پرتال مشاوران تحصیلی' : 'پرتال دانش‌آموزی راه کنکور'; ?>
                    </span>
                    <h3 class="rksp-auth-title">
                        <?php echo ( $type === 'mentor' ) ? 'ورود و عضویت مشاوران' : 'ورود و ثبت‌نام دانش‌آموز'; ?>
                    </h3>
                    <p class="rksp-auth-subtitle">برای ثبت ساعت مطالعه و ارتباط با مشاور، وارد حساب خود شوید</p>
                </div>

                <?php if ( ! empty( self::$errors ) ) : ?>
                    <div class="rksp-alert-error">
                        <?php foreach ( self::$errors as $err ) : ?>
                            <div>• <?php echo esc_html( $err ); ?></div>
                        <?php endforeach; ?>
                    </div>
                <?php endif; ?>

                <!-- تب‌های سوئیچ بین لاگین و ثبت‌نام -->
                <div class="rksp-tabs-nav">
                    <button type="button" class="rksp-tab-btn <?php echo ( $default_tab === 'login' ) ? 'active' : ''; ?>" onclick="rkspSwitchTab('<?php echo esc_attr( $unique_id ); ?>', 'login')">
                        ورود به حساب
                    </button>
                    <button type="button" class="rksp-tab-btn <?php echo ( $default_tab === 'register' ) ? 'active' : ''; ?>" onclick="rkspSwitchTab('<?php echo esc_attr( $unique_id ); ?>', 'register')">
                        ثبت‌نام جدید
                    </button>
                </div>

                <!-- فرم ۱: ورود به حساب -->
                <div class="rksp-form-tab rksp-tab-login <?php echo ( $default_tab === 'login' ) ? 'active' : ''; ?>">
                    <form method="post" action="">
                        <input type="hidden" name="rksp_action" value="login_user">
                        <input type="hidden" name="expected_role" value="<?php echo ( $type === 'mentor' ) ? 'rksp_mentor' : 'rksp_student'; ?>">
                        <input type="hidden" name="redirect_to" value="<?php echo esc_attr( $redirect_url ); ?>">
                        <?php wp_nonce_field( 'rksp_login_action', 'rksp_nonce' ); ?>

                        <div class="rksp-field-group">
                            <label class="rksp-label">شماره همراه یا نام کاربری</label>
                            <input type="text" name="log" dir="ltr" class="rksp-input" placeholder="0912xxxxxxx" required>
                        </div>

                        <div class="rksp-field-group">
                            <label class="rksp-label">رمز عبور</label>
                            <input type="password" name="pwd" dir="ltr" class="rksp-input" placeholder="******" required>
                        </div>

                        <button type="submit" class="rksp-btn-submit">ورود به پنل</button>
                    </form>
                </div>

                <!-- فرم ۲: ثبت‌نام بر اساس نوع کاربر -->
                <div class="rksp-form-tab rksp-tab-register <?php echo ( $default_tab === 'register' ) ? 'active' : ''; ?>">
                    <?php if ( $type === 'student' ) : ?>
                        <!-- ثبت‌نام اختصاصی دانش‌آموز -->
                        <form method="post" action="">
                            <input type="hidden" name="rksp_action" value="register_student">
                            <input type="hidden" name="redirect_to" value="<?php echo esc_attr( $redirect_url ); ?>">
                            <?php wp_nonce_field( 'rksp_register_student_action', 'rksp_nonce' ); ?>

                            <div class="rksp-field-group">
                                <label class="rksp-label">نام و نام خانوادگی دانش‌آموز <span style="color:red;">*</span></label>
                                <input type="text" name="name" class="rksp-input" placeholder="مثال: محمد امینی" required>
                            </div>

                            <div class="rksp-row">
                                <div class="rksp-col rksp-field-group">
                                    <label class="rksp-label">شماره موبایل <span style="color:red;">*</span></label>
                                    <input type="text" name="mobile" dir="ltr" class="rksp-input" placeholder="0912xxxxxxx" required>
                                </div>
                                <div class="rksp-col rksp-field-group">
                                    <label class="rksp-label">رمز عبور <span style="color:red;">*</span></label>
                                    <input type="password" name="password" dir="ltr" class="rksp-input" placeholder="حداقل ۶ رقم" required>
                                </div>
                            </div>

                            <div class="rksp-row">
                                <div class="rksp-col rksp-field-group">
                                    <label class="rksp-label">پایه تحصیلی</label>
                                    <select name="grade" class="rksp-select">
                                        <option value="دهم">پایه دهم</option>
                                        <option value="یازدهم">پایه یازدهم</option>
                                        <option value="دوازدهم" selected>پایه دوازدهم</option>
                                        <option value="فارغ‌التحصیل">فارغ‌التحصیل / پشت کنکور</option>
                                    </select>
                                </div>
                                <div class="rksp-col rksp-field-group">
                                    <label class="rksp-label">رشته تحصیلی</label>
                                    <select name="major" class="rksp-select">
                                        <option value="تجربی">تجربی</option>
                                        <option value="ریاضی">ریاضی</option>
                                        <option value="انسانی">انسانی</option>
                                        <option value="هنر">هنر / منحصراً زبان</option>
                                    </select>
                                </div>
                            </div>

                            <div class="rksp-field-group">
                                <label class="rksp-label">شهر سکونت</label>
                                <input type="text" name="city" class="rksp-input" placeholder="مثال: تهران">
                            </div>

                            <button type="submit" class="rksp-btn-submit">ثبت‌نام و ورود مستقیم به پرتال</button>
                        </form>
                    <?php else : ?>
                        <!-- ثبت‌نام اختصاصی مشاور -->
                        <form method="post" action="">
                            <input type="hidden" name="rksp_action" value="register_mentor">
                            <input type="hidden" name="redirect_to" value="<?php echo esc_attr( $redirect_url ); ?>">
                            <?php wp_nonce_field( 'rksp_register_mentor_action', 'rksp_nonce' ); ?>

                            <div class="rksp-field-group">
                                <label class="rksp-label">نام و نام خانوادگی مشاور <span style="color:red;">*</span></label>
                                <input type="text" name="name" class="rksp-input" placeholder="مثال: دکتر مهدی صابری" required>
                            </div>

                            <div class="rksp-row">
                                <div class="rksp-col rksp-field-group">
                                    <label class="rksp-label">شماره همراه مشاور <span style="color:red;">*</span></label>
                                    <input type="text" name="mobile" dir="ltr" class="rksp-input" placeholder="0912xxxxxxx" required>
                                </div>
                                <div class="rksp-col rksp-field-group">
                                    <label class="rksp-label">رمز عبور ورود <span style="color:red;">*</span></label>
                                    <input type="password" name="password" dir="ltr" class="rksp-input" placeholder="حداقل ۶ رقم" required>
                                </div>
                            </div>

                            <div class="rksp-field-group">
                                <label class="rksp-label">حوزه تخصصی مشاوره</label>
                                <input type="text" name="specialty" class="rksp-input" placeholder="مثال: کنکور سراسری، رتبه‌های برتر تجربی">
                            </div>

                            <div class="rksp-field-group">
                                <label class="rksp-label">سوابق تحصیلی و دانشگاه</label>
                                <input type="text" name="experience" class="rksp-input" placeholder="مثال: فارغ‌التحصیل دانشگاه علوم پزشکی تهران">
                            </div>

                            <div class="rksp-field-group">
                                <label class="rksp-label">معرفی کوتاه و روش برنامه‌ریزی</label>
                                <textarea name="bio" rows="2" class="rksp-textarea" placeholder="توضیح کوتاه در مورد روش پایش گزارش کار..."></textarea>
                            </div>

                            <button type="submit" class="rksp-btn-submit">ثبت مشخصات و ورود به پنل مشاوره</button>
                        </form>
                    <?php endif; ?>
                </div>
            </div>

            <script>
                function rkspSwitchTab(containerId, tabName) {
                    var container = document.getElementById(containerId);
                    if (!container) return;
                    var buttons = container.querySelectorAll('.rksp-tab-btn');
                    var tabs = container.querySelectorAll('.rksp-form-tab');

                    buttons.forEach(function(btn) { btn.classList.remove('active'); });
                    tabs.forEach(function(tab) { tab.classList.remove('active'); });

                    if (tabName === 'login') {
                        buttons[0].classList.add('active');
                        container.querySelector('.rksp-tab-login').classList.add('active');
                    } else {
                        buttons[1].classList.add('active');
                        container.querySelector('.rksp-tab-register').classList.add('active');
                    }
                }
            </script>
            <?php
            return ob_get_clean();
        }
    }
}
RKSP_Forms::init();
