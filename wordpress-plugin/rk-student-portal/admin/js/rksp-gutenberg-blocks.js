/**
 * ثبت بلاک‌های بومی ویرایشگر گوتنبرگ وردپرس
 * سازگاری ۱۰۰٪ با ادیتور هسته وردپرس بدون نیاز به المنتور یا کامپوزر
 */
(function (wp) {
    if (!wp || !wp.blocks || !wp.element) {
        return;
    }

    var el = wp.element.createElement;
    var registerBlockType = wp.blocks.registerBlockType;

    // ۱. بلاک پرتال دانش‌آموز
    registerBlockType('rksp/student-portal', {
        title: 'پرتال دانش‌آموز (راه کنکور)',
        icon: 'id-alt',
        category: 'rksp-blocks',
        keywords: ['دانش‌آموز', 'پرتال', 'مطالعه', 'student'],
        edit: function () {
            return el(
                'div',
                {
                    style: {
                        padding: '20px',
                        border: '2px dashed #f97316',
                        borderRadius: '12px',
                        background: '#fff7ed',
                        textAlign: 'center',
                        direction: 'rtl',
                        fontFamily: 'Vazirmatn, Tahoma, sans-serif'
                    }
                },
                el('h4', { style: { margin: '0 0 8px', color: '#c2410c' } }, '🎓 پرتال جامع دانش‌آموز راه کنکور'),
                el('p', { style: { margin: 0, fontSize: '13px', color: '#4b5563' } },
                    'این بلاک در فرانت‌اند سایت، داشبورد کامل دانش‌آموز، ثبت ساعت مطالعه، تکالیف و نظرات مشاور را نمایش می‌دهد.'
                )
            );
        },
        save: function () {
            return null; // رندر سمت سرور (Server-Side Render)
        }
    });

    // ۲. بلاک پرتال مشاور
    registerBlockType('rksp/mentor-portal', {
        title: 'پرتال مشاور تحصیلی (راه کنکور)',
        icon: 'groups',
        category: 'rksp-blocks',
        keywords: ['مشاور', 'پرتال', 'mentor'],
        edit: function () {
            return el(
                'div',
                {
                    style: {
                        padding: '20px',
                        border: '2px dashed #3b82f6',
                        borderRadius: '12px',
                        background: '#eff6ff',
                        textAlign: 'center',
                        direction: 'rtl',
                        fontFamily: 'Vazirmatn, Tahoma, sans-serif'
                    }
                },
                el('h4', { style: { margin: '0 0 8px', color: '#1d4ed8' } }, '💼 پرتال مشاور تحصیلی راه کنکور'),
                el('p', { style: { margin: 0, fontSize: '13px', color: '#4b5563' } },
                    'این بلاک در فرانت‌اند سایت، پنل مدیریت دانش‌آموزان تحت نظر، تعیین گزارش کار و ثبت نظر عملکرد را رندر می‌کند.'
                )
            );
        },
        save: function () {
            return null;
        }
    });

    // ۳. بلاک باشگاه ساعت مطالعه
    registerBlockType('rksp/leaderboard', {
        title: 'باشگاه ساعت مطالعه (راه کنکور)',
        icon: 'awards',
        category: 'rksp-blocks',
        keywords: ['لیدربورد', 'رتبه‌بندی', 'ساعت مطالعه', 'leaderboard'],
        attributes: {
            period: {
                type: 'string',
                default: 'weekly'
            }
        },
        edit: function () {
            return el(
                'div',
                {
                    style: {
                        padding: '20px',
                        border: '2px dashed #10b981',
                        borderRadius: '12px',
                        background: '#f0fdf4',
                        textAlign: 'center',
                        direction: 'rtl',
                        fontFamily: 'Vazirmatn, Tahoma, sans-serif'
                    }
                },
                el('h4', { style: { margin: '0 0 8px', color: '#047857' } }, '🏆 جدول رتبه‌بندی باشگاه ساعت مطالعه'),
                el('p', { style: { margin: 0, fontSize: '13px', color: '#4b5563' } },
                    'جدول زنده ساعت مطالعه با ترنزینت کش ۵ دقیقه‌ای وردپرس در این بخش نمایش داده خواهد شد.'
                )
            );
        },
        save: function () {
            return null;
        }
    });

    // ۴. بلاک باشگاه پیشرفت
    registerBlockType('rksp/achievements', {
        title: 'باشگاه پیشرفت (دستاوردهای راه کنکور)',
        icon: 'star-filled',
        category: 'rksp-blocks',
        keywords: ['پیشرفت', 'دستاورد', 'مدال', 'achievements'],
        edit: function () {
            return el(
                'div',
                {
                    style: {
                        padding: '20px',
                        border: '2px dashed #8b5cf6',
                        borderRadius: '12px',
                        background: '#f5f3ff',
                        textAlign: 'center',
                        direction: 'rtl',
                        fontFamily: 'Vazirmatn, Tahoma, sans-serif'
                    }
                },
                el('h4', { style: { margin: '0 0 8px', color: '#6d28d9' } }, '🌟 فید دستاوردهای باشگاه پیشرفت'),
                el('p', { style: { margin: 0, fontSize: '13px', color: '#4b5563' } },
                    'نمایش افتخارات، رتبه‌های برتر و رکوردهای ساعت مطالعه در این بخش قرار می‌گیرد.'
                )
            );
        },
        save: function () {
            return null;
        }
    });
})(window.wp);
