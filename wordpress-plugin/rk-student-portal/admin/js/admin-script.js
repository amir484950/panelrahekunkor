/**
 * اسکریپت پیشخوان وردپرس پرتال راه کنکور
 * ارتباط مستقیم با REST API بدون کوئری‌های پراکنده
 */
(function($) {
    'use strict';

    $(document).ready(function() {
        const root = (window.rkspAdminSettings && window.rkspAdminSettings.root) ? window.rkspAdminSettings.root : '/wp-json/';
        const nonce = (window.rkspAdminSettings && window.rkspAdminSettings.nonce) ? window.rkspAdminSettings.nonce : '';

        // بارگذاری داشبورد در صفحه مربوطه
        if ($('#rksp-admin-app').length) {
            loadDashboard();
        }

        // بارگذاری کانال‌های ارتباطی
        if ($('#rksp-channels-app').length) {
            loadChannels();
        }

        function loadDashboard() {
            $.ajax({
                url: root + 'rksp/v1/admin/overview',
                method: 'GET',
                beforeSend: function(xhr) {
                    if (nonce) xhr.setRequestHeader('X-WP-Nonce', nonce);
                },
                success: function(data) {
                    renderDashboard(data);
                },
                error: function(err) {
                    $('#rksp-admin-app').html(
                        '<div class="notice notice-error"><p>خطا در بارگذاری اطلاعات از REST API: ' + (err.responseJSON ? err.responseJSON.message : 'خطای سرور') + '</p></div>'
                    );
                }
            });
        }

        function renderDashboard(data) {
            const stats = data.stats || {};
            const plans = data.expiring_plans_table || [];
            const mentors = data.mentors_workload || [];

            let html = `
                <div class="rksp-stats-grid">
                    <div class="rksp-stat-card">
                        <span class="rksp-stat-title">دانش‌آموزان فعال</span>
                        <span class="rksp-stat-value">${stats.total_students || 0}</span>
                    </div>
                    <div class="rksp-stat-card ${stats.unassigned_count > 0 ? 'alert' : ''}">
                        <span class="rksp-stat-title">دانش‌آموزان بدون مشاور</span>
                        <span class="rksp-stat-value">${stats.unassigned_count || 0}</span>
                    </div>
                    <div class="rksp-stat-card ${stats.expiring_plans > 0 ? 'alert' : ''}">
                        <span class="rksp-stat-title">طرح‌های روبه‌انقضا (۷ روز آینده)</span>
                        <span class="rksp-stat-value">${stats.expiring_plans || 0}</span>
                    </div>
                    <div class="rksp-stat-card">
                        <span class="rksp-stat-title">تعداد مشاوران</span>
                        <span class="rksp-stat-value">${stats.active_mentors || 0}</span>
                    </div>
                </div>

                <div class="rksp-card">
                    <h2>طرح‌های مشاوره نزدیک به انقضا (داشبورد نظارتی)</h2>
                    <table class="rksp-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>دانش‌آموز</th>
                                <th>شماره موبایل</th>
                                <th>طرح مشاوره</th>
                                <th>مشاور اختصاصی</th>
                                <th>تاریخ پایان</th>
                                <th>روزهای باقیمانده</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            if (plans.length === 0) {
                html += `<tr><td colspan="7" style="text-align:center; color:#94a3b8; padding:20px;">هیچ طرح روبه‌انقضایی یافت نشد.</td></tr>`;
            } else {
                plans.forEach((p, idx) => {
                    let badgeClass = 'rksp-badge-active';
                    let label = p.days_left + ' روز';
                    if (p.days_left < 0) {
                        badgeClass = 'rksp-badge-expired';
                        label = 'منقضی شده';
                    } else if (p.days_left <= 7) {
                        badgeClass = 'rksp-badge-expiring';
                    }

                    html += `
                        <tr>
                            <td>${idx + 1}</td>
                            <td><strong>${p.student_name || '—'}</strong></td>
                            <td dir="ltr" style="text-align:right;">${p.phone || '—'}</td>
                            <td>${p.plan_name || '—'}</td>
                            <td>${p.mentor_name || '<span style="color:#ef4444;">بدون مشاور</span>'}</td>
                            <td>${p.end_date || '—'}</td>
                            <td><span class="${badgeClass}">${label}</span></td>
                        </tr>
                    `;
                });
            }

            html += `
                        </tbody>
                    </table>
                </div>

                <div class="rksp-card">
                    <h2>بار کاری و وضعیت مشاوران تحصیلی</h2>
                    <table class="rksp-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>نام مشاور</th>
                                <th>تعداد دانش‌آموزان تحت پوشش</th>
                                <th>آخرین گزارش کار ثبت شده</th>
                            </tr>
                        </thead>
                        <tbody>
            `;

            if (mentors.length === 0) {
                html += `<tr><td colspan="4" style="text-align:center; color:#94a3b8; padding:20px;">هیچ مشاوری تعریف نشده است.</td></tr>`;
            } else {
                mentors.forEach((m, idx) => {
                    html += `
                        <tr>
                            <td>${idx + 1}</td>
                            <td><strong>${m.name}</strong></td>
                            <td><span class="rksp-badge-active">${m.students_count} دانش‌آموز</span></td>
                            <td>${m.last_task_date || '<span style="color:#f59e0b;">هنوز گزارشی ثبت نشده</span>'}</td>
                        </tr>
                    `;
                });
            }

            html += `
                        </tbody>
                    </table>
                </div>
            `;

            $('#rksp-admin-app').html(html);
        }

        function loadChannels() {
            $.ajax({
                url: root + 'rksp/v1/channels',
                method: 'GET',
                success: function(channels) {
                    renderChannels(channels);
                }
            });
        }

        function renderChannels(channels) {
            let rows = '';
            channels.forEach((c, i) => {
                rows += `
                    <tr>
                        <td>${i + 1}</td>
                        <td><input type="text" class="regular-text channel-title" value="${c.title || ''}" /></td>
                        <td>
                            <select class="channel-type">
                                <option value="website" ${c.type === 'website' ? 'selected' : ''}>وب‌سایت</option>
                                <option value="phone" ${c.type === 'phone' ? 'selected' : ''}>تلفن تماس</option>
                                <option value="telegram" ${c.type === 'telegram' ? 'selected' : ''}>تلگرام</option>
                                <option value="instagram" ${c.type === 'instagram' ? 'selected' : ''}>اینستاگرام</option>
                                <option value="ble" ${c.type === 'ble' ? 'selected' : ''}>بله</option>
                            </select>
                        </td>
                        <td><input type="text" class="regular-text channel-value" dir="ltr" value="${c.value || ''}" /></td>
                    </tr>
                `;
            });

            let html = `
                <div class="rksp-card">
                    <h2>لیست کانال‌های ارتباطی فعال</h2>
                    <table class="rksp-table" id="rksp-channels-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>عنوان کانال</th>
                                <th>نوع کانال</th>
                                <th>آدرس یا شماره تماس</th>
                            </tr>
                        </thead>
                        <tbody>${rows}</tbody>
                    </table>
                    <div style="margin-top:16px;">
                        <button type="button" class="rksp-btn-primary" id="rksp-save-channels">ذخیره تغییرات</button>
                    </div>
                </div>
            `;

            $('#rksp-channels-app').html(html);

            $('#rksp-save-channels').on('click', function() {
                const updated = [];
                $('#rksp-channels-table tbody tr').each(function(idx) {
                    updated.push({
                        id: idx + 1,
                        title: $(this).find('.channel-title').val(),
                        type: $(this).find('.channel-type').val(),
                        value: $(this).find('.channel-value').val()
                    });
                });

                $.ajax({
                    url: root + 'rksp/v1/admin/channels',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(updated),
                    beforeSend: function(xhr) {
                        if (nonce) xhr.setRequestHeader('X-WP-Nonce', nonce);
                    },
                    success: function() {
                        alert('کانال‌های ارتباطی با موفقیت به‌روزرسانی شدند.');
                    },
                    error: function() {
                        alert('خطا در ذخیره‌سازی اطلاعات.');
                    }
                });
            });
        }
    });
})(jQuery);
