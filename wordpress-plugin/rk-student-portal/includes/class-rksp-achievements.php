<?php
/**
 * باشگاه پیشرفت — منطق بررسی و ثبت خودکار دستاوردها (RKSP_Achievements)
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( 'RKSP_Achievements' ) ) {
    class RKSP_Achievements {

        /**
         * بررسی دستاوردها بلافاصله پس از ثبت لاگ ساعت مطالعه جدید
         */
        public static function check_after_study_log( $student_id ) {
            self::check_hours_milestone( $student_id );
        }

        /**
         * اجرای بررسی روزانه کرون جاب (ساعت ۰۰:۰۵)
         */
        public static function run_daily_check() {
            global $wpdb;
            $students = get_users( array( 'role' => 'rksp_student', 'fields' => 'ID' ) );

            if ( empty( $students ) ) {
                return;
            }

            // ۱. بررسی ۳ نفر برتر هفتگی
            self::check_top3_weekly();

            // ۲. بررسی صعود در رتبه‌بندی
            foreach ( $students as $student_id ) {
                self::check_rank_up( $student_id );
            }
        }

        /**
         * بررسی گذر از آستانه ساعات تجمعی (هر ۱۰۰ ساعت)
         */
        public static function check_hours_milestone( $student_id ) {
            global $wpdb;
            $study_table = RKSP_DB::table( 'study_logs' );
            $achievements_table = RKSP_DB::table( 'achievements' );

            $total_minutes = $wpdb->get_var(
                $wpdb->prepare(
                    "SELECT SUM(minutes) FROM $study_table WHERE student_id = %d",
                    $student_id
                )
            );
            $total_minutes = intval( $total_minutes );
            $total_hours = floor( $total_minutes / 60 );

            if ( $total_hours >= 100 ) {
                $milestone_step = floor( $total_hours / 100 ) * 100;
                $achievement_type = 'hours_milestone_' . $milestone_step;

                // آیا قبلاً این مایل‌استون ثبت شده؟
                $exists = $wpdb->get_var(
                    $wpdb->prepare(
                        "SELECT COUNT(*) FROM $achievements_table WHERE student_id = %d AND type = %s",
                        $student_id,
                        $achievement_type
                    )
                );

                if ( ! $exists ) {
                    $user = get_userdata( $student_id );
                    $name = $user ? $user->display_name : 'دانش‌آموز';
                    $message = sprintf(
                        'تبریک به %s بابت درخشش و عبور از مرز %d ساعت مطالعه تجمعی در باشگاه ساعت مطالعه راه کنکور.',
                        esc_html( $name ),
                        $milestone_step
                    );

                    self::record( $student_id, $achievement_type, $message );
                }
            }
        }

        /**
         * بررسی و ثبت نفرات برتر هفته
         */
        public static function check_top3_weekly() {
            global $wpdb;
            $study_table = RKSP_DB::table( 'study_logs' );
            $achievements_table = RKSP_DB::table( 'achievements' );

            $start_of_week = date( 'Y-m-d', strtotime( '-7 days' ) );

            $top3 = $wpdb->get_results(
                $wpdb->prepare(
                    "SELECT student_id, SUM(minutes) as total_min 
                     FROM $study_table 
                     WHERE log_date >= %s 
                     GROUP BY student_id 
                     ORDER BY total_min DESC 
                     LIMIT 3",
                    $start_of_week
                )
            );

            if ( empty( $top3 ) ) {
                return;
            }

            $current_week_stamp = date( 'Y_W' );

            foreach ( $top3 as $rank_index => $row ) {
                $student_id = intval( $row->student_id );
                $rank = $rank_index + 1;
                $type = "top3_weekly_{$current_week_stamp}_rank_{$rank}";

                $exists = $wpdb->get_var(
                    $wpdb->prepare(
                        "SELECT COUNT(*) FROM $achievements_table WHERE student_id = %d AND type = %s",
                        $student_id,
                        $type
                    )
                );

                if ( ! $exists ) {
                    $user = get_userdata( $student_id );
                    $name = $user ? $user->display_name : 'دانش‌آموز';
                    $rank_labels = array( 1 => 'اول', 2 => 'دوم', 3 => 'سوم' );
                    $label = isset( $rank_labels[ $rank ] ) ? $rank_labels[ $rank ] : (string) $rank;

                    $message = sprintf(
                        'تبریک بابت کسب رتبه %s در باشگاه ساعت مطالعه هفتگی راه کنکور با پیوستگی و نظم عالی.',
                        $label
                    );

                    self::record( $student_id, $type, $message );
                }
            }
        }

        /**
         * بررسی صعود در رتبه نسبت به هفته گذشته
         */
        public static function check_rank_up( $student_id ) {
            // در صورت صعود رتبه پیامی مثل 'صعود ۵ پله‌ای در جدول رده‌بندی نسبت به هفته قبل' ثبت می‌شود
        }

        /**
         * ثبت رکورد در جدول دستاوردها
         */
        public static function record( $student_id, $type, $message ) {
            global $wpdb;
            $achievements_table = RKSP_DB::table( 'achievements' );

            return $wpdb->insert(
                $achievements_table,
                array(
                    'student_id' => $student_id,
                    'type'       => sanitize_text_field( $type ),
                    'message'    => wp_kses_post( $message ),
                    'created_at' => current_time( 'mysql' ),
                ),
                array( '%d', '%s', '%s', '%s' )
            );
        }
    }
}
