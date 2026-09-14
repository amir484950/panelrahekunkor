<?php
/**
 * مدیریت پنل ادمین و پیشخوان وردپرس
 * سازگار ۱۰۰٪ با وردپرس بومی بدون نیاز به المنتور یا هیچ صفحه‌ساز جانبی
 *
 * @package RK_Student_Portal
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( 'RKSP_Admin' ) ) {
    class RKSP_Admin {

        public static function init() {
            add_action( 'admin_menu', array( __CLASS__, 'add_admin_menu' ) );
            add_action( 'admin_enqueue_scripts', array( __CLASS__, 'enqueue_admin_assets' ) );
            add_action( 'wp_dashboard_setup', array( __CLASS__, 'add_dashboard_widget' ) );
        }

        public static function add_admin_menu() {
            add_menu_page(
                __( 'پرتال راه کنکور', 'rk-student-portal' ),
                __( 'پرتال راه کنکور', 'rk-student-portal' ),
                'manage_options',
                'rk-student-portal',
                array( __CLASS__, 'render_admin_dashboard' ),
                'dashicons-welcome-learn-more',
                25
            );

            add_submenu_page(
                'rk-student-portal',
                __( 'داشبورد نظارتی', 'rk-student-portal' ),
                __( 'داشبورد نظارتی', 'rk-student-portal' ),
                'manage_options',
                'rk-student-portal',
                array( __CLASS__, 'render_admin_dashboard' )
            );

            add_submenu_page(
                'rk-student-portal',
                __( 'برگه‌های پرتال در وردپرس', 'rk-student-portal' ),
                __( 'برگه‌های پرتال وردپرس', 'rk-student-portal' ),
                'manage_options',
                'rksp-pages',
                array( __CLASS__, 'render_pages_page' )
            );

            add_submenu_page(
                'rk-student-portal',
                __( 'مدیریت و ثبت‌نام کاربران', 'rk-student-portal' ),
                __( 'مدیریت کاربران (دانش‌آموز/مشاور)', 'rk-student-portal' ),
                'manage_options',
                'rksp-users',
                array( __CLASS__, 'render_users_page' )
            );

            add_submenu_page(
                'rk-student-portal',
                __( 'کانال‌های ارتباطی', 'rk-student-portal' ),
                __( 'کانال‌های ارتباطی', 'rk-student-portal' ),
                'manage_options',
                'rksp-channels',
                array( __CLASS__, 'render_channels_page' )
            );

            add_submenu_page(
                'rk-student-portal',
                __( 'مستندات گوتنبرگ و REST API', 'rk-student-portal' ),
                __( 'گوتنبرگ و REST API', 'rk-student-portal' ),
                'manage_options',
                'rksp-docs',
                array( __CLASS__, 'render_docs_page' )
            );
        }

        public static function enqueue_admin_assets( $hook ) {
            if ( strpos( $hook, 'rk-student-portal' ) === false && strpos( $hook, 'rksp-' ) === false && $hook !== 'index.php' ) {
                return;
            }

            wp_enqueue_style(
                'rksp-admin-style',
                RKSP_PLUGIN_URL . 'admin/css/admin-style.css',
                array(),
                RKSP_VERSION
            );

            wp_enqueue_script(
                'rksp-admin-script',
                RKSP_PLUGIN_URL . 'admin/js/admin-script.js',
                array( 'jquery' ),
                RKSP_VERSION,
                true
            );

            wp_localize_script( 'rksp-admin-script', 'rkspAdminSettings', array(
                'root'  => esc_url_raw( rest_url( 'rksp/v1/' ) ),
                'nonce' => wp_create_nonce( 'wp_rest' ),
            ) );
        }

        /**
         * ویجت اختصاصی در صفحه اصلی پیشخوان وردپرس (wp-admin/index.php)
         */
        public static function add_dashboard_widget() {
            wp_add_dashboard_widget(
                'rksp_dashboard_widget',
                '🎓 وضعیت پرتال راه کنکور (بومی وردپرس)',
                array( __CLASS__, 'render_dashboard_widget' )
            );
        }

        public static function render_dashboard_widget() {
            $links = RKSP_Pages::get_portal_links();
            ?>
            <div style="direction: rtl; font-family: Tahoma, sans-serif; font-size: 13px;">
                <p style="margin-bottom: 12px; color: #475569;">
                    پرتال دانش‌آموز و مشاور به صورت ۱۰۰٪ بومی روی هسته وردپرس فعال است و نیازی به هیچ افزونه صفحه‌ساز ندارد.
                </p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px;">
                    <a href="<?php echo esc_url( $links['student'] ); ?>" target="_blank" class="button button-primary" style="text-align: center;">
                        مشاهده پرتال دانش‌آموز ↗
                    </a>
                    <a href="<?php echo esc_url( $links['mentor'] ); ?>" target="_blank" class="button" style="text-align: center;">
                        مشاهده پرتال مشاور ↗
                    </a>
                    <a href="<?php echo esc_url( $links['leaderboard'] ); ?>" target="_blank" class="button" style="text-align: center;">
                        باشگاه ساعت مطالعه ↗
                    </a>
                    <a href="<?php echo esc_url( $links['achievements'] ); ?>" target="_blank" class="button" style="text-align: center;">
                        باشگاه پیشرفت ↗
                    </a>
                </div>
                <div style="border-top: 1px solid #e2e8f0; padding-top: 8px; color: #64748b; font-size: 12px;">
                    مدیریت و نظارت: <a href="<?php echo esc_url( admin_url( 'admin.php?page=rk-student-portal' ) ); ?>">ورود به داشبورد نظارتی راه کنکور</a>
                </div>
            </div>
            <?php
        }

        public static function render_admin_dashboard() {
            ?>
            <div class="wrap rksp-admin-wrap" dir="rtl">
                <div class="rksp-admin-header">
                    <h1>داشبورد نظارتی و مدیریت پرتال راه کنکور</h1>
                    <span class="rksp-badge">هسته استاندارد وردپرس (بدون نیاز به المنتور)</span>
                </div>

                <!-- باکس‌های شاخص‌های کلیدی عملکرد (KPIs) -->
                <div class="rksp-kpi-grid">
                    <div class="rksp-kpi-card">
                        <div class="rksp-kpi-value" id="kpi-total-students">-</div>
                        <div class="rksp-kpi-label">تعداد کل دانش‌آموزان</div>
                    </div>
                    <div class="rksp-kpi-card">
                        <div class="rksp-kpi-value" id="kpi-active-mentors">-</div>
                        <div class="rksp-kpi-label">مشاوران فعال</div>
                    </div>
                    <div class="rksp-kpi-card">
                        <div class="rksp-kpi-value" id="kpi-today-hours">-</div>
                        <div class="rksp-kpi-label">ساعت مطالعه ثبت‌شده امروز</div>
                    </div>
                    <div class="rksp-kpi-card warning">
                        <div class="rksp-kpi-value" id="kpi-expiring-plans">-</div>
                        <div class="rksp-kpi-label">طرح‌های در آستانه انقضا (&lt; ۷ روز)</div>
                    </div>
                </div>

                <!-- فرم‌های عملیاتی مدیر: تخصیص مشاور و تمدید طرح -->
                <div class="rksp-actions-grid">
                    <div class="rksp-card">
                        <h2>تخصیص یا تغییر مشاور دانش‌آموز</h2>
                        <form id="rksp-assign-mentor-form">
                            <div class="rksp-form-group">
                                <label for="assign-student-id">شناسه یا شماره موبایل دانش‌آموز:</label>
                                <input type="number" id="assign-student-id" required class="regular-text" />
                            </div>
                            <div class="rksp-form-group">
                                <label for="assign-mentor-id">شناسه مشاور تحصیلی:</label>
                                <input type="number" id="assign-mentor-id" required class="regular-text" />
                            </div>
                            <button type="submit" class="button button-primary">ثبت تخصیص مشاور</button>
                            <span class="rksp-form-status" id="assign-status"></span>
                        </form>
                    </div>

                    <div class="rksp-card">
                        <h2>تمدید یا ثبت اشتراک طرح مشاوره</h2>
                        <form id="rksp-renew-plan-form">
                            <div class="rksp-form-group">
                                <label for="plan-student-id">شناسه دانش‌آموز:</label>
                                <input type="number" id="plan-student-id" required class="regular-text" />
                            </div>
                            <div class="rksp-form-group">
                                <label for="plan-name">عنوان طرح:</label>
                                <input type="text" id="plan-name" value="طرح ۱ ماهه مشاوره VIP" required class="regular-text" />
                            </div>
                            <div class="rksp-form-group">
                                <label for="plan-days">مدت زمان اعتبار (روز):</label>
                                <input type="number" id="plan-days" value="30" required class="small-text" />
                            </div>
                            <button type="submit" class="button button-primary">ثبت و تمدید طرح</button>
                            <span class="rksp-form-status" id="plan-status"></span>
                        </form>
                    </div>
                </div>

                <!-- جدول مانیتورینگ طرح‌های در آستانه انقضا -->
                <div class="rksp-card">
                    <h2>پایش طرح‌های مشاوره در آستانه انقضا یا منقضی‌شده</h2>
                    <div id="rksp-expiring-plans-table-container">
                        <div class="rksp-loading-skeleton">در حال فراخوانی داده‌های زنده از REST API...</div>
                    </div>
                </div>
            </div>
            <?php
        }

        /**
         * صفحه اختصاصی مدیریت برگه‌های استاندارد وردپرس
         */
        public static function render_pages_page() {
            if ( isset( $_POST['rksp_regenerate_pages'] ) && check_admin_referer( 'rksp_regenerate_pages_action' ) ) {
                RKSP_Pages::create_default_pages();
                echo '<div class="notice notice-success is-dismissible"><p>برگه‌های استاندارد وردپرس با موفقیت بررسی و بازتولید شدند.</p></div>';
            }

            $links = RKSP_Pages::get_portal_links();
            $pages_config = array(
                array(
                    'title'       => 'پرتال جامع دانش‌آموز',
                    'slug'        => 'student-portal',
                    'opt'         => 'rksp_page_student_portal',
                    'url'         => $links['student'],
                    'desc'        => 'ثبت ساعت مطالعه، گزارش کارها، نظرات مشاور و اطلاعات اشتراک',
                    'gutenberg'   => 'بلاک rksp/student-portal یا شورتکد [rksp_student_portal]',
                ),
                array(
                    'title'       => 'پرتال مشاور تحصیلی',
                    'slug'        => 'mentor-portal',
                    'opt'         => 'rksp_page_mentor_portal',
                    'url'         => $links['mentor'],
                    'desc'        => 'مدیریت پرونده دانش‌آموزان اختصاصی، تخصیص تسک و ثبت نظر عملکرد',
                    'gutenberg'   => 'بلاک rksp/mentor-portal یا شورتکد [rksp_mentor_portal]',
                ),
                array(
                    'title'       => 'باشگاه ساعت مطالعه',
                    'slug'        => 'study-leaderboard',
                    'opt'         => 'rksp_page_leaderboard',
                    'url'         => $links['leaderboard'],
                    'desc'        => 'جدول رتبه‌بندی دانش‌آموزان با ترنزینت کش ۵ دقیقه‌ای وردپرس',
                    'gutenberg'   => 'بلاک rksp/leaderboard یا شورتکد [rksp_leaderboard]',
                ),
                array(
                    'title'       => 'باشگاه پیشرفت',
                    'slug'        => 'study-achievements',
                    'opt'         => 'rksp_page_achievements',
                    'url'         => $links['achievements'],
                    'desc'        => 'فید افتخارات و رکوردهای برتر ساعت مطالعه',
                    'gutenberg'   => 'بلاک rksp/achievements یا شورتکد [rksp_achievements]',
                ),
            );
            ?>
            <div class="wrap rksp-admin-wrap" dir="rtl">
                <div class="rksp-admin-header">
                    <h1>برگه‌های اختصاصی پرتال در هسته وردپرس</h1>
                    <span class="rksp-badge">۱۰۰٪ سازگار با هسته وردپرس و ویرایشگر گوتنبرگ</span>
                </div>

                <div class="rksp-card">
                    <p style="font-size: 14px; line-height: 1.8; color: #334155;">
                        این برگه‌ها در زمان فعال‌سازی افزونه به صورت <strong>کاملاً خودکار در جدول برگه‌های وردپرس</strong> ساخته شده‌اند. سایت شما بدون هیچ وابستگی به المنتور، ویژوال کامپوزر یا فرم‌ساز کار می‌کند. شما می‌توانید این برگه‌ها را مستقیماً در منوهای وردپرس (فهرست‌ها) قرار دهید یا در ویرایشگر گوتنبرگ ویرایش نمایید.
                    </p>

                    <table class="wp-list-table widefat fixed striped" style="margin-top: 15px;">
                        <thead>
                            <tr>
                                <th style="width: 22%;">عنوان برگه در وردپرس</th>
                                <th style="width: 28%;">توضیحات و کارکرد</th>
                                <th style="width: 28%;">بلاک گوتنبرگ / شورتکد</th>
                                <th style="width: 22%;">عملیات</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ( $pages_config as $p ) : 
                                $page_id = get_option( $p['opt'] );
                                $edit_url = $page_id ? get_edit_post_link( $page_id ) : '#';
                            ?>
                                <tr>
                                    <td><strong><?php echo esc_html( $p['title'] ); ?></strong></td>
                                    <td><span style="color: #64748b; font-size: 12px;"><?php echo esc_html( $p['desc'] ); ?></span></td>
                                    <td><code><?php echo esc_html( $p['gutenberg'] ); ?></code></td>
                                    <td>
                                        <a href="<?php echo esc_url( $p['url'] ); ?>" target="_blank" class="button button-small button-primary">
                                            مشاهده برگه ↗
                                        </a>
                                        <?php if ( $page_id ) : ?>
                                            <a href="<?php echo esc_url( $edit_url ); ?>" class="button button-small">
                                                ویرایش در گوتنبرگ
                                            </a>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>

                    <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
                        <form method="post">
                            <?php wp_nonce_field( 'rksp_regenerate_pages_action' ); ?>
                            <button type="submit" name="rksp_regenerate_pages" class="button">
                                🔄 بازتولید و بررسی سلامت برگه‌های استاندارد وردپرس
                            </button>
                            <span style="color: #64748b; font-size: 12px; margin-right: 10px;">
                                در صورت حذف تصادفی هر برگه، با کلیک روی این دکمه مجدداً ایجاد می‌گردد.
                            </span>
                        </form>
                    </div>
                </div>
            </div>
            <?php
        }

        /**
         * صفحه اختصاصی مدیریت و ثبت‌نام دانش‌آموزان و مشاوران توسط مدیر
         */
        public static function render_users_page() {
            $msg = '';
            $msg_type = 'success';

            // پردازش فرم ایجاد مستقیم کاربر
            if ( isset( $_POST['rksp_create_user_nonce'] ) && check_admin_referer( 'rksp_create_user_action', 'rksp_create_user_nonce' ) ) {
                $role = sanitize_text_field( $_POST['user_role'] ?? 'rksp_student' );
                $data = array(
                    'name'       => sanitize_text_field( $_POST['user_name'] ?? '' ),
                    'mobile'     => sanitize_text_field( $_POST['user_mobile'] ?? '' ),
                    'password'   => sanitize_text_field( $_POST['user_password'] ?? '' ),
                    'grade'      => sanitize_text_field( $_POST['user_grade'] ?? 'دوازدهم' ),
                    'major'      => sanitize_text_field( $_POST['user_major'] ?? 'تجربی' ),
                    'city'       => sanitize_text_field( $_POST['user_city'] ?? '' ),
                    'specialty'  => sanitize_text_field( $_POST['mentor_specialty'] ?? '' ),
                    'experience' => sanitize_text_field( $_POST['mentor_experience'] ?? '' ),
                );

                if ( $role === 'rksp_mentor' ) {
                    $res = RKSP_Auth::register_mentor( $data );
                } else {
                    $res = RKSP_Auth::register_student( $data );
                    if ( ! is_wp_error( $res ) && ! empty( $_POST['assigned_mentor_id'] ) ) {
                        global $wpdb;
                        $wpdb->insert( RKSP_DB::table( 'assignments' ), array(
                            'student_id' => $res['user']['id'],
                            'mentor_id'  => intval( $_POST['assigned_mentor_id'] ),
                            'start_date' => current_time( 'mysql' ),
                            'status'     => 'active',
                        ) );
                    }
                }

                if ( is_wp_error( $res ) ) {
                    $msg = $res->get_error_message();
                    $msg_type = 'error';
                } else {
                    $msg = $res['message'] ?? 'کاربر با موفقیت در سامانه وردپرس ثبت شد.';
                }
            }

            $students = get_users( array( 'role' => 'rksp_student', 'number' => 100 ) );
            $mentors  = get_users( array( 'role' => 'rksp_mentor', 'number' => 100 ) );
            ?>
            <div class="wrap rksp-admin-wrap" dir="rtl">
                <div class="rksp-admin-header">
                    <h1>مدیریت و ثبت‌نام کاربران پرتال</h1>
                    <span class="rksp-badge">دانش‌آموزان و مشاوران</span>
                </div>

                <?php if ( ! empty( $msg ) ) : ?>
                    <div class="notice notice-<?php echo esc_attr( $msg_type ); ?> is-dismissible">
                        <p><?php echo esc_html( $msg ); ?></p>
                    </div>
                <?php endif; ?>

                <!-- آمار سریع کاربران -->
                <div class="rksp-stats-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px;">
                    <div class="rksp-card" style="margin-bottom:0;">
                        <span style="font-size:12px; color:#64748b;">کل دانش‌آموزان</span>
                        <h2 style="font-size:28px; margin:4px 0; color:#0f172a;"><?php echo count( $students ); ?> نفر</h2>
                    </div>
                    <div class="rksp-card" style="margin-bottom:0;">
                        <span style="font-size:12px; color:#64748b;">کل مشاوران تحصیلی</span>
                        <h2 style="font-size:28px; margin:4px 0; color:#ea580c;"><?php echo count( $mentors ); ?> نفر</h2>
                    </div>
                </div>

                <!-- فرم ثبت مستقیم کاربر توسط مدیر -->
                <div class="rksp-card" style="margin-bottom: 24px;">
                    <h2>➕ ثبت مستقیم کاربر جدید توسط مدیر</h2>
                    <p style="color:#64748b; font-size:13px; margin-top:-5px;">
                        می‌توانید دانش‌آموزان یا مشاوران را مستقیماً از این بخش وارد کرده و به آن‌ها نام‌کاربری و رمز عبور اختصاص دهید.
                    </p>
                    <form method="post" action="">
                        <?php wp_nonce_field( 'rksp_create_user_action', 'rksp_create_user_nonce' ); ?>
                        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom:16px;">
                            <div class="rksp-form-group">
                                <label>نوع حساب کاربری:</label>
                                <select name="user_role" id="rksp-role-select" class="regular-text" style="width:100%;" required>
                                    <option value="rksp_student">دانش‌آموز (دسترسی به پرتال دانش‌آموزی)</option>
                                    <option value="rksp_mentor">مشاور تحصیلی (دسترسی به پنل مشاوران)</option>
                                </select>
                            </div>
                            <div class="rksp-form-group">
                                <label>نام و نام خانوادگی:</label>
                                <input type="text" name="user_name" required class="regular-text" style="width:100%;" placeholder="مثال: علی رضایی" />
                            </div>
                            <div class="rksp-form-group">
                                <label>شماره موبایل (نام کاربری ورود):</label>
                                <input type="text" name="user_mobile" required class="regular-text" style="width:100%; direction:ltr; text-align:right;" placeholder="09xxxxxxxxx" />
                            </div>
                            <div class="rksp-form-group">
                                <label>رمز عبور اولیه:</label>
                                <input type="password" name="user_password" required class="regular-text" style="width:100%; direction:ltr;" placeholder="حداقل ۶ کاراکتر" />
                            </div>
                        </div>

                        <!-- فیلدهای اختصاصی دانش‌آموز -->
                        <div id="rksp-student-fields" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; padding:16px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; margin-bottom:16px;">
                            <div class="rksp-form-group">
                                <label>پایه تحصیلی:</label>
                                <select name="user_grade" class="regular-text" style="width:100%;">
                                    <option value="دهم">پایه دهم</option>
                                    <option value="یازدهم">پایه یازدهم</option>
                                    <option value="دوازدهم" selected>پایه دوازدهم</option>
                                    <option value="فارغ‌التحصیل">فارغ‌التحصیل / پشت کنکور</option>
                                </select>
                            </div>
                            <div class="rksp-form-group">
                                <label>رشته تحصیلی:</label>
                                <select name="user_major" class="regular-text" style="width:100%;">
                                    <option value="تجربی">علوم تجربی</option>
                                    <option value="ریاضی">ریاضی و فیزیک</option>
                                    <option value="انسانی">علوم انسانی</option>
                                    <option value="هنر">هنر / منحصراً زبان</option>
                                </select>
                            </div>
                            <div class="rksp-form-group">
                                <label>شهر سکونت:</label>
                                <input type="text" name="user_city" class="regular-text" style="width:100%;" placeholder="تهران، اصفهان، ..." />
                            </div>
                            <div class="rksp-form-group">
                                <label>انتساب به مشاور (اختیاری):</label>
                                <select name="assigned_mentor_id" class="regular-text" style="width:100%;">
                                    <option value="">-- بدون انتساب اولیه --</option>
                                    <?php foreach ( $mentors as $m ) : ?>
                                        <option value="<?php echo esc_attr( $m->ID ); ?>"><?php echo esc_html( $m->display_name ); ?> (<?php echo esc_html( $m->user_login ); ?>)</option>
                                    <?php endforeach; ?>
                                </select>
                            </div>
                        </div>

                        <!-- فیلدهای اختصاصی مشاور -->
                        <div id="rksp-mentor-fields" style="display:none; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; padding:16px; background:#fff7ed; border:1px solid #fed7aa; border-radius:8px; margin-bottom:16px;">
                            <div class="rksp-form-group">
                                <label>تخصص مشاوره:</label>
                                <input type="text" name="mentor_specialty" class="regular-text" style="width:100%;" placeholder="مثال: مشاور ارشد کنکور تجربی" />
                            </div>
                            <div class="rksp-form-group">
                                <label>دانشگاه و سوابق:</label>
                                <input type="text" name="mentor_experience" class="regular-text" style="width:100%;" placeholder="مثال: رتبه برتر کنکور ۹۸، دانشگاه تهران" />
                            </div>
                        </div>

                        <button type="submit" class="button button-primary button-hero">ثبت و ایجاد کاربر در سامانه</button>
                    </form>
                    <script>
                        document.addEventListener('DOMContentLoaded', function() {
                            var select = document.getElementById('rksp-role-select');
                            var stdFields = document.getElementById('rksp-student-fields');
                            var mntFields = document.getElementById('rksp-mentor-fields');
                            if (select) {
                                select.addEventListener('change', function() {
                                    if (this.value === 'rksp_mentor') {
                                        stdFields.style.display = 'none';
                                        mntFields.style.display = 'grid';
                                    } else {
                                        stdFields.style.display = 'grid';
                                        mntFields.style.display = 'none';
                                    }
                                });
                            }
                        });
                    </script>
                </div>

                <!-- جدول دانش‌آموزان ثبت‌شده -->
                <div class="rksp-card" style="margin-bottom: 24px;">
                    <h2>🎓 لیست دانش‌آموزان عضو پرتال</h2>
                    <table class="wp-list-table widefat fixed striped">
                        <thead>
                            <tr>
                                <th style="width:60px;">شناسه</th>
                                <th>نام دانش‌آموز</th>
                                <th>شماره همراه</th>
                                <th>پایه و رشته</th>
                                <th>مشاور منتسب</th>
                                <th>تاریخ عضویت</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if ( empty( $students ) ) : ?>
                                <tr><td colspan="6" style="text-align:center; padding:20px; color:#94a3b8;">هنوز دانش‌آموزی در سایت ثبت‌نام نکرده است.</td></tr>
                            <?php else : ?>
                                <?php foreach ( $students as $std ) : 
                                    global $wpdb;
                                    $assign = $wpdb->get_row( $wpdb->prepare(
                                        "SELECT a.mentor_id, u.display_name as mentor_name FROM " . RKSP_DB::table( 'assignments' ) . " a 
                                         LEFT JOIN {$wpdb->users} u ON a.mentor_id = u.ID 
                                         WHERE a.student_id = %d AND a.status = 'active' LIMIT 1",
                                        $std->ID
                                    ) );
                                    $grade = get_user_meta( $std->ID, 'rksp_grade', true ) ?: 'دوازدهم';
                                    $major = get_user_meta( $std->ID, 'rksp_major', true ) ?: 'تجربی';
                                ?>
                                    <tr>
                                        <td>#<?php echo esc_html( $std->ID ); ?></td>
                                        <td><strong><?php echo esc_html( $std->display_name ); ?></strong></td>
                                        <td style="direction:ltr; text-align:right; font-family:monospace;"><?php echo esc_html( $std->user_login ); ?></td>
                                        <td><?php echo esc_html( $grade . ' ' . $major ); ?></td>
                                        <td>
                                            <?php if ( $assign && $assign->mentor_name ) : ?>
                                                <span class="rksp-badge" style="background:#dbeafe; color:#1e40af;"><?php echo esc_html( $assign->mentor_name ); ?></span>
                                            <?php else : ?>
                                                <span style="color:#ef4444; font-size:12px;">بدون مشاور</span>
                                            <?php endif; ?>
                                        </td>
                                        <td><?php echo esc_html( substr( $std->user_registered, 0, 10 ) ); ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>

                <!-- جدول مشاوران تحصیلی -->
                <div class="rksp-card">
                    <h2>👨‍🏫 لیست مشاوران تحصیلی</h2>
                    <table class="wp-list-table widefat fixed striped">
                        <thead>
                            <tr>
                                <th style="width:60px;">شناسه</th>
                                <th>نام مشاور</th>
                                <th>شماره همراه</th>
                                <th>تخصص / سوابق</th>
                                <th>تعداد دانش‌آموزان</th>
                                <th>تاریخ عضویت</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php if ( empty( $mentors ) ) : ?>
                                <tr><td colspan="6" style="text-align:center; padding:20px; color:#94a3b8;">هنوز مشاوری در سایت ثبت‌نام نکرده است.</td></tr>
                            <?php else : ?>
                                <?php foreach ( $mentors as $mnt ) : 
                                    global $wpdb;
                                    $count = $wpdb->get_var( $wpdb->prepare(
                                        "SELECT COUNT(*) FROM " . RKSP_DB::table( 'assignments' ) . " WHERE mentor_id = %d AND status = 'active'",
                                        $mnt->ID
                                    ) );
                                    $spec = get_user_meta( $mnt->ID, 'rksp_specialty', true ) ?: 'مشاوره کنکور';
                                ?>
                                    <tr>
                                        <td>#<?php echo esc_html( $mnt->ID ); ?></td>
                                        <td><strong><?php echo esc_html( $mnt->display_name ); ?></strong></td>
                                        <td style="direction:ltr; text-align:right; font-family:monospace;"><?php echo esc_html( $mnt->user_login ); ?></td>
                                        <td><?php echo esc_html( $spec ); ?></td>
                                        <td><span class="rksp-badge" style="background:#fef3c7; color:#92400e;"><?php echo intval( $count ); ?> دانش‌آموز</span></td>
                                        <td><?php echo esc_html( substr( $mnt->user_registered, 0, 10 ) ); ?></td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>
                </div>
            </div>
            <?php
        }

        public static function render_channels_page() {
            ?>
            <div class="wrap rksp-admin-wrap" dir="rtl">
                <div class="rksp-admin-header">
                    <h1>کانال‌های ارتباطی پرتال راه کنکور</h1>
                    <span class="rksp-badge">تنظیمات مرکزی</span>
                </div>

                <div class="rksp-card">
                    <h2>لیست کانال‌های فعال در پرتال و اپلیکیشن</h2>
                    <p>این کانال‌ها مستقیماً از طریق اندپوینت <code>/wp-json/rksp/v1/channels</code> در وب و اپلیکیشن موبایل نمایش داده می‌شوند.</p>
                    <div id="rksp-channels-container">
                        <div class="rksp-loading-skeleton">در حال بارگذاری کانال‌ها...</div>
                    </div>
                </div>
            </div>
            <?php
        }

        public static function render_docs_page() {
            ?>
            <div class="wrap rksp-admin-wrap" dir="rtl">
                <div class="rksp-admin-header">
                    <h1>مستندات ویرایشگر گوتنبرگ و REST API</h1>
                    <span class="rksp-badge">بدون نیاز به المنتور</span>
                </div>

                <div class="rksp-card">
                    <h2>۱. بلاک‌های بومی ویرایشگر گوتنبرگ (Gutenberg Block Editor):</h2>
                    <p>در هر برگه یا نوشته وردپرس، کافیست علامت <strong>+</strong> را بزنید و در دسته‌بندی <strong>«پرتال راه کنکور»</strong> هر یک از بلاک‌های زیر را درج نمایید:</p>
                    <ul class="rksp-docs-list">
                        <li><code>rksp/student-portal</code> : بلاک جامع پرتال دانش‌آموز</li>
                        <li><code>rksp/mentor-portal</code> : بلاک پرتال مشاور تحصیلی</li>
                        <li><code>rksp/leaderboard</code> : بلاک باشگاه ساعت مطالعه (همراه با ترنزینت کش ۵ دقیقه‌ای وردپرس)</li>
                        <li><code>rksp/achievements</code> : بلاک باشگاه پیشرفت و افتخارات</li>
                    </ul>

                    <hr style="margin: 20px 0; border: 0; border-top: 1px solid #e2e8f0;" />

                    <h2>۲. شورتکدهای استاندارد هسته وردپرس:</h2>
                    <ul class="rksp-docs-list">
                        <li><code>[rksp_student_portal]</code> : نمایش پنل کامل دانش‌آموز</li>
                        <li><code>[rksp_mentor_portal]</code> : نمایش پنل مشاور</li>
                        <li><code>[rksp_leaderboard period="weekly"]</code> : جدول رتبه‌بندی (دوره‌ها: daily, weekly, monthly, alltime)</li>
                        <li><code>[rksp_achievements]</code> : فید دستاوردهای باشگاه پیشرفت</li>
                    </ul>

                    <hr style="margin: 20px 0; border: 0; border-top: 1px solid #e2e8f0;" />

                    <h2>۳. اندپوینت‌های REST API (هسته مشترک وب و موبایل):</h2>
                    <p>تمام درخواست‌ها از موبایل یا فرانت‌اند می‌توانند با هدر <code>Authorization: Bearer &lt;token&gt;</code> ارسال شوند:</p>
                    <pre style="direction: ltr; text-align: left; background: #0f172a; color: #38bdf8; padding: 15px; border-radius: 8px;">
POST /wp-json/rksp/v1/auth/login
POST /wp-json/rksp/v1/auth/otp-request
POST /wp-json/rksp/v1/auth/otp-verify
POST /wp-json/rksp/v1/study-logs
GET  /wp-json/rksp/v1/study-logs/me
GET  /wp-json/rksp/v1/leaderboard?period=daily|weekly|monthly|alltime
GET  /wp-json/rksp/v1/tasks/me
PATCH /wp-json/rksp/v1/tasks/{id}
GET  /wp-json/rksp/v1/notes/me
GET  /wp-json/rksp/v1/plan/me
GET  /wp-json/rksp/v1/achievements/me
GET  /wp-json/rksp/v1/channels
                    </pre>
                </div>
            </div>
            <?php
        }
    }
}
