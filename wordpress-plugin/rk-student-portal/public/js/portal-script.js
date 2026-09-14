/**
 * اسکریپت شورتکدهای فرانت‌اند پرتال راه کنکور
 * کلیه عملیات صرفاً از طریق REST API انجام می‌شود.
 */
(function($) {
    'use strict';

    $(document).ready(function() {
        const config = window.rkspPortalConfig || {};
        const root = config.root ? config.root : '/wp-json/';
        const nonce = config.nonce || '';

        // ۱. رندر پرتال دانش‌آموز
        const $studentRoot = $('#rksp-student-portal-root');
        if ($studentRoot.length) {
            initStudentPortal($studentRoot);
        }

        // ۲. رندر جدول رتبه‌بندی
        const $leaderboardRoot = $('#rksp-leaderboard-root');
        if ($leaderboardRoot.length) {
            const period = $leaderboardRoot.data('period') || 'weekly';
            initLeaderboard($leaderboardRoot, period);
        }

        // ۳. رندر باشگاه پیشرفت
        const $achievementsRoot = $('#rksp-achievements-root');
        if ($achievementsRoot.length) {
            initAchievements($achievementsRoot);
        }

        function initStudentPortal($container) {
            const authState = $container.data('auth-state');
            
            // اگر کاربر هنوز وارد نشده باشد، فرم ورود و ثبت‌نام سرور حفظ می‌شود
            if (authState === 'unauthenticated') {
                return;
            }

            // اتصال کلیک دکمه‌های مقادیر پیش‌فرض دقایق
            $container.on('click', '.rksp-preset-btn', function(e) {
                e.preventDefault();
                const min = $(this).data('min');
                $('#rksp-minutes').val(min);
                $('.rksp-preset-btn').css({ background: '#f1f5f9', color: '#475569', borderColor: '#cbd5e1' });
                $(this).css({ background: '#ea580c', color: '#ffffff', borderColor: '#ea580c' });
            });

            // ارسال فرم ساعت مطالعه با ایجکس
            $container.on('submit', '#rksp-form-study-log', function(e) {
                e.preventDefault();
                const $btn = $('#rksp-btn-submit-log');
                const minutes = parseInt($('#rksp-minutes').val(), 10);
                const subject = $('#rksp-subject').val();
                const testsCount = parseInt($('#rksp-tests-count').val() || '0', 10);

                if (!minutes || minutes < 15) {
                    $('#rksp-study-msg').html('<span style="color:#dc2626;">لطفاً حداقل ۱۵ دقیقه زمان وارد کنید.</span>');
                    return;
                }

                $btn.prop('disabled', true).text('در حال ثبت در باشگاه ساعت مطالعه...');

                $.ajax({
                    url: root + 'rksp/v1/study-logs',
                    method: 'POST',
                    contentType: 'application/json',
                    beforeSend: function(xhr) {
                        if (nonce) xhr.setRequestHeader('X-WP-Nonce', nonce);
                    },
                    data: JSON.stringify({
                        minutes: minutes,
                        subject: subject,
                        tests_count: testsCount,
                        source: 'panel'
                    }),
                    success: function(res) {
                        $btn.prop('disabled', false).text('ثبت مستقیم در باشگاه ساعت مطالعه 🚀');
                        $('#rksp-study-msg').html('<span style="color:#16a34a; font-weight:700;">✅ ' + (res.message || 'ساعت مطالعه با موفقیت ثبت شد!') + '</span>');
                        $('#rksp-minutes').val('');
                        $('#rksp-tests-count').val('');

                        // به‌روزرسانی زنده نمایشگرهای ساعات
                        const $today = $('#rksp-stat-today-hours');
                        const $total = $('#rksp-stat-total-hours');
                        if ($today.length) {
                            const curToday = parseFloat($today.text()) || 0;
                            $today.html((curToday + (minutes / 60)).toFixed(1) + ' <span style="font-size:11px;font-weight:600;color:#cbd5e1;">ساعت</span>');
                        }
                        if ($total.length) {
                            const curTotal = parseFloat($total.text()) || 0;
                            $total.html((curTotal + (minutes / 60)).toFixed(1) + ' <span style="font-size:11px;font-weight:600;color:#cbd5e1;">ساعت</span>');
                        }
                    },
                    error: function(err) {
                        $btn.prop('disabled', false).text('ثبت مستقیم در باشگاه ساعت مطالعه 🚀');
                        const msg = (err.responseJSON && err.responseJSON.message) ? err.responseJSON.message : 'خطا در ثبت ساعت مطالعه';
                        $('#rksp-study-msg').html('<span style="color:#dc2626; font-weight:700;">❌ ' + msg + '</span>');
                    }
                });
            });

            // ثبت انجام شد برای تکالیف
            $container.on('click', '.rksp-done-task-btn', function() {
                const taskId = $(this).data('id');
                const $btn = $(this);
                $btn.prop('disabled', true).text('در حال ثبت...');

                $.ajax({
                    url: root + 'rksp/v1/tasks/' + taskId,
                    method: 'PATCH',
                    contentType: 'application/json',
                    data: JSON.stringify({ status: 'done' }),
                    beforeSend: function(xhr) {
                        if (nonce) xhr.setRequestHeader('X-WP-Nonce', nonce);
                    },
                    success: function() {
                        const $row = $('#rksp-task-row-' + taskId);
                        if ($row.length) {
                            $row.addClass('done').css({ background: '#f0fdf4', borderColor: '#bbf7d0' });
                        }
                        $btn.parent().html('<span style="color:#16a34a; font-size:12.5px; font-weight:700; background:#dcfce7; padding:4px 10px; border-radius:8px;">انجام شد ✓</span>');

                        const $pending = $('#rksp-stat-pending-tasks');
                        if ($pending.length) {
                            const count = Math.max(0, (parseInt($pending.text(), 10) || 1) - 1);
                            $pending.html(count + ' <span style="font-size:11px;font-weight:600;color:#cbd5e1;">مورد</span>');
                        }
                    },
                    error: function() {
                        $btn.prop('disabled', false).text('ثبت انجام شد');
                    }
                });
            });
        }

        function initLeaderboard($container, period) {
            $container.html('<div style="text-align:center; padding:20px; color:#64748b;">در حال دریافت رتبه‌بندی باشگاه ساعت مطالعه...</div>');

            $.ajax({
                url: root + 'rksp/v1/leaderboard?period=' + period,
                method: 'GET',
                beforeSend: function(xhr) {
                    if (nonce) xhr.setRequestHeader('X-WP-Nonce', nonce);
                },
                success: function(res) {
                    const list = res.leaderboard || [];
                    if (list.length === 0) {
                        $container.html('<div class="rksp-portal-card" style="text-align:center;">هنوز ساعتی در این بازه ثبت نشده است.</div>');
                        return;
                    }

                    let items = '';
                    list.forEach(item => {
                        const rankClass = item.rank <= 3 ? `rank-${item.rank}` : '';
                        const meClass = item.is_current ? 'highlight-me' : '';
                        items += `
                            <div class="rksp-leaderboard-item ${rankClass} ${meClass}">
                                <div style="display:flex; align-items:center;">
                                    <span class="rksp-rank-num">${item.rank}</span>
                                    <div>
                                        <div style="font-weight:700; font-size:14px;">${item.student_name} ${item.is_current ? '(شما)' : ''}</div>
                                        <div style="font-size:12px; color:#64748b;">${item.grade || ''}</div>
                                    </div>
                                </div>
                                <div style="text-align:left;">
                                    <div style="font-weight:800; color:#ea580c; font-size:14px;">${item.formatted_time}</div>
                                </div>
                            </div>
                        `;
                    });

                    $container.html(`
                        <div class="rksp-portal-card">
                            <div class="rksp-portal-title">باشگاه ساعت مطالعه (${period === 'weekly' ? 'هفتگی' : (period === 'monthly' ? 'ماهانه' : 'امروز')})</div>
                            <div>${items}</div>
                        </div>
                    `);
                }
            });
        }

        function initAchievements($container) {
            $container.html('<div style="text-align:center; padding:20px; color:#64748b;">در حال بارگذاری دستاوردها...</div>');
            $.ajax({
                url: root + 'rksp/v1/achievements/me',
                method: 'GET',
                beforeSend: function(xhr) {
                    if (nonce) xhr.setRequestHeader('X-WP-Nonce', nonce);
                },
                success: function(items) {
                    if (!items || items.length === 0) {
                        $container.html('<div class="rksp-portal-card" style="text-align:center;">هنوز دستاوردی ثبت نشده است. با ثبت ساعات مطالعه به باشگاه پیشرفت بپیوندید!</div>');
                        return;
                    }
                    let feed = '';
                    items.forEach(ach => {
                        feed += `
                            <div style="padding:14px 18px; border-radius:12px; background:#fffbeb; border:1px solid #fef3c7; margin-bottom:10px; display:flex; align-items:center; gap:12px;">
                                <span style="font-size:22px;">🏆</span>
                                <div style="font-size:13.5px; color:#92400e; font-weight:500;">${ach.message}</div>
                            </div>
                        `;
                    });
                    $container.html(`
                        <div class="rksp-portal-card">
                            <div class="rksp-portal-title">باشگاه پیشرفت — دستاوردهای شما</div>
                            <div>${feed}</div>
                        </div>
                    `);
                }
            });
        }
    });
})(jQuery);
