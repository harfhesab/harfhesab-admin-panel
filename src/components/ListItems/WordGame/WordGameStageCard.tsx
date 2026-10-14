import React, { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BsMusicNoteBeamed } from "react-icons/bs";
import { IoIosVideocam, IoMdEye, IoMdEyeOff } from "react-icons/io";
import { MdVerifiedUser, MdErrorOutline, MdCheckCircle } from "react-icons/md";
import { FaPlay } from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";
import { FaImage, FaPencil } from "react-icons/fa6";
import ImageComponent from "@/components/ImageComponent";
import { secondsToTime } from "@/utils/SecondToTime";
import Globals from "@/utils/Globals";

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

type MediaItem = {
  path: string;
  order?: number;
  file_type?: string;
  duration?: string;
};

type WordGameStageCardProps = {
  _id: string;
  letters: string[];
  words: string[];
  hidden_words?: string[] | null;
  stage_number: number;
  stage_number_in_season: number;
  season: {
    title: string;
    season_number: number;
  };
  rtl: boolean;
  language: string;
  media?: MediaItem[];
  voice?: MediaItem[];
  is_visible: boolean;
  is_active: boolean;
  publication_status: string;
  completion_status: string;
};

/* ------------------------------------------------------------------ */
/* Letter normalization                                                */
/* حروفی که در بررسی یکسان حساب می‌شوند. برای افزودن جفت‌حرف جدید،      */
/* فقط یک خط به این نقشه اضافه کنید.                                   */
/* ------------------------------------------------------------------ */

const EQUIVALENT_LETTERS: Record<string, string> = {
  "آ": "ا",
};

const normalizeText = (text: string): string =>
  Array.from(text ?? "")
    .map((ch) => EQUIVALENT_LETTERS[ch] ?? ch)
    .join("");

const countLetters = (chars: Iterable<string>): Map<string, number> => {
  const counts = new Map<string, number>();
  Array.from(chars).forEach((ch) => {
    counts.set(ch, (counts.get(ch) ?? 0) + 1);
  });
  return counts;
};

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

const validateStage = (
  letters?: string[] | null,
  words?: string[] | null,
  hiddenWords?: string[] | null,
) => {
  const safeLetters = letters ?? [];
  const safeWords = words ?? [];
  const safeHidden = hiddenWords ?? [];

  const errors: string[] = [];
  // کلیدهای `words-0` و `hidden-2` برای نشان‌دادن کلمهٔ مشکل‌دار در کارت
  const invalidKeys = new Set<string>();

  // 1. حداقل یک کلمه
  if (safeWords.length === 0) {
    errors.push("حداقل باید یک کلمه در آرایه words وجود داشته باشد.");
  }

  const entries = [
    ...safeWords.map((word, index) => ({ word, key: `words-${index}`, arrayName: "words" })),
    ...safeHidden.map((word, index) => ({ word, key: `hidden-${index}`, arrayName: "hidden_words" })),
  ].map((entry) => ({ ...entry, normalized: normalizeText(entry.word) }));

  // 2. کلمات تکراری (آب و اب یکسان حساب می‌شوند)
  const seen = new Map<string, typeof entries>();
  for (const entry of entries) {
    const group = seen.get(entry.normalized) ?? [];
    group.push(entry);
    seen.set(entry.normalized, group);
  }
  for (const group of seen.values()) {
    if (group.length > 1) {
      group.forEach((entry) => invalidKeys.add(entry.key));
      group.slice(1).forEach((entry) => {
        errors.push(`کلمه «${entry.word}» تکراری است.`);
      });
    }
  }

  // 3. ساخته‌شدن هر کلمه از حروف مرحله
  const available = countLetters(safeLetters.map(normalizeText));

  for (const entry of entries) {
    const needed = countLetters(Array.from(entry.normalized));
    for (const [letter, count] of needed) {
      const have = available.get(letter) ?? 0;
      if (count > have) {
        invalidKeys.add(entry.key);
        errors.push(
          `کلمه «${entry.word}» در آرایه ${entry.arrayName} به ${count} حرف «${letter}» نیاز دارد، اما فقط ${have} عدد از این حرف در آرایه letters موجود است.`,
        );
      }
    }
  }

  return {
    hasError: errors.length > 0,
    errors,
    errorCount: errors.length,
    invalidKeys,
  };
};

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                         */
/* ------------------------------------------------------------------ */

const TONES = {
  primary: {
    badge: "bg-primary/10 text-primary",
    dot: "bg-primary",
  },
  info: {
    badge: "bg-info/15 text-sky-700 dark:text-info",
    dot: "bg-info",
  },
  warning: {
    badge: "bg-warning/15 text-orange-700 dark:text-warn_end",
    dot: "bg-warning",
  },
} as const;

const Section = ({
  title,
  count,
  unit,
  tone,
  children,
}: {
  title: string;
  count: number;
  unit: string;
  tone: keyof typeof TONES;
  children: React.ReactNode;
}) => (
  <section className="min-w-0 rounded-xl border border-border/60 dark:border-border_dark/60 bg-background5 dark:bg-background5_dark p-3.5">
    <header className="mb-3 flex items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${TONES[tone].dot}`} />
        <h3 className="font-iransans-bold text-sm text-text2 dark:text-text2_dark">
          {title}
        </h3>
      </div>
      <span
        className={`rounded-md px-2 py-0.5 font-iransans-md text-xs ${TONES[tone].badge}`}
      >
        {count} {unit}
      </span>
    </header>
    {children}
  </section>
);

const StatusPill = ({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className: string;
}) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-iransans-md text-xs ${className}`}
  >
    <span className="opacity-70">{label}:</span>
    <span className="font-iransans-bold">{value}</span>
  </span>
);

const FlagBadge = ({
  on,
  onLabel,
  offLabel,
  onIcon,
  offIcon,
}: {
  on: boolean;
  onLabel: string;
  offLabel: string;
  onIcon: React.ReactNode;
  offIcon: React.ReactNode;
}) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-iransans-md text-xs ${
      on
        ? "bg-green_color/10 text-green_color"
        : "bg-text5/15 text-text6 dark:text-text5_dark"
    }`}
  >
    {on ? onIcon : offIcon}
    {on ? onLabel : offLabel}
  </span>
);

/* ------------------------------------------------------------------ */
/* Card                                                                */
/* ------------------------------------------------------------------ */

const VISIBLE_ERRORS = 3;

const WordGameStageCard = ({
  _id,
  letters,
  words,
  hidden_words,
  season,
  stage_number,
  stage_number_in_season,
  rtl,
  language,
  media,
  voice,
  is_visible,
  is_active,
  publication_status,
  completion_status,
}: WordGameStageCardProps) => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAllErrors, setShowAllErrors] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // جهت محتوای بازی (حروف و کلمات) از زبان بازی می‌آید؛ متن‌های پنل همیشه فارسی/راست‌چین‌اند
  const contentDir = rtl ? "rtl" : "ltr";

  const check = useMemo(
    () => validateStage(letters, words, hidden_words),
    [letters, words, hidden_words],
  );

  const hiddenList = hidden_words ?? [];
  const hasHidden = hiddenList.length > 0;

  const shownErrors = showAllErrors
    ? check.errors
    : check.errors.slice(0, VISIBLE_ERRORS);

  const hasMedia = (media?.length ?? 0) > 0 || (voice?.length ?? 0) > 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const goTo = (path: string) => {
    setMenuOpen(false);
    router.push(`${path}/${_id}`);
  };

  return (
    <article
      dir="rtl"
      className={`relative m-1 flex w-full flex-col overflow-hidden rounded-2xl border bg-background3 text-right shadow-bottom dark:bg-background7_dark dark:shadow-bottom-dark ${
        check.hasError
          ? "border-red_color/50"
          : "border-border/60 dark:border-border_dark/60"
      }`}
    >
      {/* نوار وضعیت بالای کارت */}
      <div
        className={`h-1.5 w-full ${
          check.hasError
            ? "bg-red_color"
            : "bg-gradient-to-l from-primary_start to-primary_end"
        }`}
      />

      {/* ---------------------------------------------------------- */}
      {/* هدر                                                          */}
      {/* ---------------------------------------------------------- */}
      <header className="flex items-start justify-between gap-3 p-4 pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary text-white shadow-bottom">
            <span className="font-iransans-md text-[10px] leading-none opacity-80">
              مرحله
            </span>
            <span className="mt-1 font-iransans-black text-xl leading-none">
              {stage_number}
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-iransans-bold text-base text-text2 dark:text-text2_dark">
                مرحله {stage_number}
              </h2>
              <span className="rounded-md bg-primary/10 px-2 py-0.5 font-iransans-md text-xs text-primary">
                {language}
              </span>
            </div>
            <p className="mt-1 truncate font-iransans-light text-xs text-text6 dark:text-text6_dark">
              فصل {season.season_number}: {season.title}
            </p>
            <p className="font-iransans-light text-xs text-text5 dark:text-text5_dark">
              مرحلهٔ {stage_number_in_season} در این فصل
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {check.hasError && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red_color/10 px-2.5 py-1 font-iransans-bold text-xs text-red_color">
              <MdErrorOutline className="text-base" />
              {check.errorCount} خطا
            </span>
          )}

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="گزینه‌های مرحله"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((prev) => !prev)}
              className="rounded-full p-1.5 text-text6 transition-colors hover:bg-rgba3 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-text6_dark"
            >
              <HiDotsVertical className="text-xl" />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute end-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-xl border border-border/60 bg-background3 py-1 shadow-lg dark:border-border_dark/60 dark:bg-background4_dark"
              >
                <button
                  role="menuitem"
                  type="button"
                  onClick={() => goTo("/dashboard/manage-word-game/stage-list/edit-stage")}
                  className="flex w-full items-center gap-3 px-4 py-3 text-right font-iransans-md text-sm text-text2 transition-colors hover:bg-rgba3 dark:text-text2_dark"
                >
                  <FaPencil className="text-base text-primary" />
                  ویرایش اطلاعات
                </button>
                <button
                  role="menuitem"
                  type="button"
                  onClick={() => goTo("/dashboard/manage-word-game/stage-list/edit-stage-media")}
                  className="flex w-full items-center gap-3 px-4 py-3 text-right font-iransans-md text-sm text-text2 transition-colors hover:bg-rgba3 dark:text-text2_dark"
                >
                  <FaImage className="text-base text-primary" />
                  ویرایش رسانه
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------- */}
      {/* محتوای مرحله                                                */}
      {/* ---------------------------------------------------------- */}
      <div className="flex flex-col gap-3 px-4 pb-4">
        {/* حروف: شبیه مهره‌های بازی */}
        <Section title="حروف مرحله" count={letters?.length ?? 0} unit="حرف" tone="primary">
          {letters?.length > 0 ? (
            <div dir={contentDir} className="flex flex-wrap gap-2">
              {letters.map((letter, index) => (
                <span
                  key={`${letter}-${index}`}
                  className="flex h-11 min-w-11 items-center justify-center rounded-lg border border-b-4 border-border/70 border-b-primary/60 bg-background3 px-2 font-iransans-black text-lg text-text2 shadow-bottom dark:border-border_dark/70 dark:border-b-primary/60 dark:bg-background4_dark dark:text-text2_dark"
                >
                  {letter}
                </span>
              ))}
            </div>
          ) : (
            <p className="font-iransans-light text-xs text-text6 dark:text-text6_dark">
              حرفی ثبت نشده است.
            </p>
          )}
        </Section>

        <div className={`grid grid-cols-1 gap-3 ${hasHidden ? "md:grid-cols-2" : ""}`}>
          {/* کلمات اصلی */}
          <Section title="کلمات اصلی" count={words?.length ?? 0} unit="کلمه" tone="info">
            {words?.length > 0 ? (
              <div dir={contentDir} className="flex flex-wrap gap-2">
                {words.map((word, index) => {
                  const invalid = check.invalidKeys.has(`words-${index}`);
                  return (
                    <span
                      key={`${word}-${index}`}
                      className={`inline-flex max-w-full items-center gap-1.5 break-words rounded-lg border px-3 py-1.5 font-iransans-md text-sm ${
                        invalid
                          ? "border-red_color/50 bg-red_color/10 text-red_color"
                          : "border-info/30 bg-info/10 text-text2 dark:text-text2_dark"
                      }`}
                    >
                      {invalid && <MdErrorOutline className="shrink-0 text-base" />}
                      {word}
                    </span>
                  );
                })}
              </div>
            ) : (
              <p className="font-iransans-md text-xs text-red_color">
                کلمه‌ای ثبت نشده است.
              </p>
            )}
          </Section>

          {/* کلمات پنهان (فقط وقتی وجود دارند) */}
          {hasHidden && (
            <Section title="کلمات پنهان" count={hiddenList.length} unit="کلمه" tone="warning">
              <div dir={contentDir} className="flex flex-wrap gap-2">
                {hiddenList.map((word, index) => {
                  const invalid = check.invalidKeys.has(`hidden-${index}`);
                  return (
                    <span
                      key={`${word}-${index}`}
                      className={`inline-flex max-w-full items-center gap-1.5 break-words rounded-lg border border-dashed px-3 py-1.5 font-iransans-md text-sm ${
                        invalid
                          ? "border-red_color/50 bg-red_color/10 text-red_color"
                          : "border-warning/50 bg-warning/10 text-text2 dark:text-text2_dark"
                      }`}
                    >
                      {invalid && <MdErrorOutline className="shrink-0 text-base" />}
                      {word}
                    </span>
                  );
                })}
              </div>
            </Section>
          )}
        </div>

        {/* خطاها */}
        {check.hasError && (
          <div
            role="alert"
            className="rounded-xl border border-red_color/40 bg-red_color/5 p-3.5"
          >
            <div className="mb-2 flex items-center gap-2 text-red_color">
              <MdErrorOutline className="text-xl" />
              <p className="font-iransans-bold text-sm">
                {check.errorCount} مشکل در این مرحله پیدا شد
              </p>
            </div>

            <ul className="flex flex-col gap-1.5">
              {shownErrors.map((error, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 font-iransans-md text-sm leading-6 text-red_error dark:text-red-300"
                >
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red_color" />
                  <span>{error}</span>
                </li>
              ))}
            </ul>

            {check.errorCount > VISIBLE_ERRORS && (
              <button
                type="button"
                onClick={() => setShowAllErrors((prev) => !prev)}
                className="mt-2 font-iransans-bold text-xs text-red_color underline-offset-4 hover:underline"
              >
                {showAllErrors
                  ? "نمایش کمتر"
                  : `نمایش ${check.errorCount - VISIBLE_ERRORS} خطای دیگر`}
              </button>
            )}
          </div>
        )}

        {/* رسانه‌ها */}
        {hasMedia && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {media?.map((item, index) =>
              item.duration ? (
                <div
                  key={`media-${index}`}
                  className="relative aspect-video overflow-hidden rounded-lg"
                >
                  <video
                    src={`${Globals.uri}${item.path}`}
                    className="h-full w-full rounded-lg object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <FaPlay className="text-2xl text-white" />
                  </div>
                  <div className="absolute bottom-1 left-1 flex items-center gap-2 rounded bg-black/60 px-2 py-0.5 font-iransans-md text-xs text-white">
                    <span>{secondsToTime(item.duration)}</span>
                    <IoIosVideocam className="text-base" />
                  </div>
                </div>
              ) : (
                <div
                  key={`media-${index}`}
                  className="aspect-video overflow-hidden rounded-lg"
                >
                  <ImageComponent
                    src={item.path}
                    alt="media_image"
                    baseURI={true}
                    parentclasses="h-full w-full object-cover rounded-lg"
                  />
                </div>
              ),
            )}

            {voice?.map((item, index) => (
              <div
                key={`voice-${index}`}
                className="relative col-span-1 flex w-full items-center gap-3 rounded-lg bg-primary/10 p-3 sm:col-span-2"
              >
                <BsMusicNoteBeamed className="shrink-0 text-xl text-primary" />
                <audio
                  src={`${Globals.uri}${item.path}`}
                  controls
                  className="w-full rounded-md"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ---------------------------------------------------------- */}
      {/* فوتر وضعیت                                                  */}
      {/* ---------------------------------------------------------- */}
      <footer className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-border/60 bg-background5 px-4 py-3 dark:border-border_dark/60 dark:bg-background5_dark">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill
            label="انتشار"
            value={publication_status}
            className="bg-warning/15 text-orange-800 dark:text-warn_end"
          />
          <StatusPill
            label="تکمیل"
            value={completion_status}
            className="bg-green_color/10 text-green_color"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FlagBadge
            on={is_visible}
            onLabel="قابل نمایش"
            offLabel="مخفی"
            onIcon={<IoMdEye className="text-base" />}
            offIcon={<IoMdEyeOff className="text-base" />}
          />
          <FlagBadge
            on={is_active}
            onLabel="فعال"
            offLabel="غیرفعال"
            onIcon={<MdVerifiedUser className="text-base" />}
            offIcon={<MdVerifiedUser className="text-base" />}
          />
          {!check.hasError && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-iransans-md text-xs text-primary">
              <MdCheckCircle className="text-base" />
              محتوا سالم است
            </span>
          )}
        </div>
      </footer>
    </article>
  );
};

export default WordGameStageCard;