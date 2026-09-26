/**
 * تبدیل یک تاریخ به عبارت زمانی نسبی به فارسی
 * مثال‌ها:
 *   5 ثانیه قبل، 1 ساعت قبل، 25 روز قبل، 6 ماه قبل، 2 سال قبل
 *   2 ساعت بعد، 20 روز بعد (برای تاریخ‌های آینده)
 */

// ---------- تایپ‌ها ----------

/** برچسب واحد زمانی به فارسی */
type TimeUnitLabel = "ثانیه" | "دقیقه" | "ساعت" | "روز" | "ماه" | "سال";

/** تعریف یک واحد زمانی برای محاسبه‌ی فاصله‌ی زمانی */
interface TimeUnit {
  /** بیشترین تعداد ثانیه‌ای که این واحد پوشش می‌دهد */
  limit: number;
  /** عددی که مقدار ثانیه‌ها بر آن تقسیم می‌شود تا مقدار نمایشی به‌دست آید */
  divisor: number;
  /** برچسب نمایشی این واحد */
  label: TimeUnitLabel;
}

/** ورودی مجاز: یک شیء Date یا رشته/عددی که قابل تبدیل به Date باشد (مثلاً چیزی که از بک‌اند می‌آید) */
type DateInput = Date | string | number;

// ---------- منطق اصلی ----------

const UNITS: TimeUnit[] = [
  { limit: 60, divisor: 1, label: "ثانیه" },
  { limit: 60 * 60, divisor: 60, label: "دقیقه" },
  { limit: 60 * 60 * 24, divisor: 60 * 60, label: "ساعت" },
  { limit: 60 * 60 * 24 * 30, divisor: 60 * 60 * 24, label: "روز" },
  { limit: 60 * 60 * 24 * 365, divisor: 60 * 60 * 24 * 30, label: "ماه" },
  { limit: Infinity, divisor: 60 * 60 * 24 * 365, label: "سال" },
];

export function formatRelativeTime(input: DateInput): string {
  // اگر ورودی از قبل Date بود همون رو استفاده کن، وگرنه (استرینگ یا عدد) تبدیلش کن
  const date = input instanceof Date ? input : new Date(input);

  if (isNaN(date.getTime())) {
    return "تاریخ نامعتبر";
  }

  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const isFuture = diffMs > 0;
  const absSeconds = Math.floor(Math.abs(diffMs) / 1000);

  // کمتر از 5 ثانیه اختلاف => "همین الان"
  if (absSeconds < 5) {
    return "همین الان";
  }

  const unit = UNITS.find((u) => absSeconds < u.limit) ?? UNITS[UNITS.length - 1];
  const value = Math.floor(absSeconds / unit.divisor);

  const suffix = isFuture ? "بعد" : "قبل";

  return `${value} ${unit.label} ${suffix}`;
}

// ---------- نمونه استفاده ----------

// مثال ۱: استفاده در یک کامپوننت (وقتی تاریخ به‌صورت استرینگ از بک‌اند می‌آید)
// export function CommentDate({ createdAt }: { createdAt: string }) {
//   return <span>{formatRelativeTime(createdAt)}</span>;
// }

// مثال ۲: فراخوانی مستقیم تابع
// formatRelativeTime("2024-05-01T12:00:00Z");                 // بسته به now، مثلاً "5 ماه قبل"
// formatRelativeTime(new Date(Date.now() - 5000));             // "5 ثانیه قبل"
// formatRelativeTime(new Date(Date.now() - 3600 * 1000));      // "1 ساعت قبل"
// formatRelativeTime(new Date(Date.now() + 3600 * 1000 * 2));  // "2 ساعت بعد"
// formatRelativeTime(new Date(Date.now() + 86400 * 1000 * 20));// "20 روز بعد"