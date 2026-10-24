"use client";

import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { FaUserLarge } from "react-icons/fa6";
import ImageComponent from "@/components/ImageComponent";
import { priceDigitSeperator } from "@/utils/PriceDigitSeparator";
import ScreenLoading from "@/components/ScreenLoading";
import { useParams } from "next/navigation";
import { getTime } from "@/utils/GetTime";
import { formatRelativeTime } from "@/utils/relativeTime";
import GradientButton from "@/components/GradientButton";
import { HiOutlineEyeOff, HiOutlineTrash } from "react-icons/hi";
import moment from "moment-jalaali";
moment.locale("fa");
moment.loadPersian({ usePersianDigits: false, dialect: "persian-modern" });

/* ------------------------------------------------------------------ */
/*  Design tokens                                                      */
/*  Ink   #0F1015  | Graphite #17181F | Gold #C9A24B | Champagne #EBDDB0 */
/*  Ivory #FAF7EF  | Sand #E8E0CC     | Muted #8F8873                    */
/* ------------------------------------------------------------------ */

const surface =
  "rounded-3xl border border-[#E8E0CC] bg-white dark:border-[#272832] dark:bg-[#15161C]";
const subSurface =
  "rounded-2xl border border-[#EFE8D6] transition-colors duration-200 hover:border-[#C9A24B]/50 dark:hover:border-[#C9A24B]/40 bg-[#FBF9F3] dark:border-[#2A2B35] dark:bg-[#1B1C24]";
const muted = "text-[#8F8873] dark:text-[#8D8A7E]";
const strong = "text-[#17181F] dark:text-[#F4EFE2]";

/* ------------------------------ helpers ---------------------------- */

const getGender = (type: string) => {
  if (type == "male") return "آقا";
  if (type == "female") return "خانم";
  if (type == "not-specified") return "تعیین نشده";
  return "";
};

const getAccessType = (type: string, numberCoinPaid?: number) => {
  if (type == "subscription") return "اشتراک";
  if (type == "free") return "رایگان";
  if (type == "coin-payment") return `پرداخت ${numberCoinPaid ?? ""} سکه`;
  return "";
};

const accessBadgeClass = (type: string) => {
  if (type == "subscription")
    return "bg-[#C9A24B]/15 text-[#8A6A1F] dark:text-[#E3C777]";
  if (type == "coin-payment")
    return "bg-[#D98E2B]/15 text-[#9A5B0C] dark:text-[#F0B35A]";
  return "bg-[#8F8873]/15 text-[#6D6753] dark:text-[#B5B09E]";
};

/** زمان نسبی (مثلاً «۲ ساعت قبل») + تاریخ شمسی و ساعت */
const DateValue = ({
  value,
  relative = true,
}: {
  value?: string | number | Date | null;
  relative?: boolean;
}) => {
  if (!value) return <span className={muted}>—</span>;
  const date = new Date(value); // getTime فقط Date می‌پذیرد
  return (
    <span className="inline-flex flex-col items-end gap-0.5">
      {relative && (
        <span className="text-[13px] 2xl:text-[14px] font-['iransans-black-en'] text-[#8A6A1F] dark:text-[#E3C777]">
          {formatRelativeTime(date)}
        </span>
      )}
      <span className="inline-flex flex-wrap items-baseline justify-end gap-x-2">
        <span className="font-['iransans-md-en']" dir="ltr">
          {moment(date).format("jYYYY/jMM/jDD")}
        </span>
        <span className={`text-[11px] 2xl:text-[12px] ${muted}`}>{getTime(date)}</span>
      </span>
    </span>
  );
};

/** نسخهٔ بزرگ برای شاخص‌های هدر (زمینهٔ تیره) */
const HeroTime = ({ value }: { value?: string | number | Date | null }) => {
  if (!value) return <span className="text-[22px] font-['iransans-black-en'] text-white/40">—</span>;
  const date = new Date(value);
  return (
    <span className="flex flex-col gap-2">
      <span className="text-[22px] leading-none font-['iransans-black-en'] text-[#FAF7EF] 2xl:text-[30px]">
        {formatRelativeTime(date)}
      </span>
      <span className="inline-flex flex-wrap items-baseline gap-x-2 text-[11px] 2xl:text-[12px] font-['iransans-md'] text-white/55">
        <span className="font-['iransans-md-en']" dir="ltr">
          {moment(date).format("jYYYY/jMM/jDD")}
        </span>
        <span>{getTime(date)}</span>
      </span>
    </span>
  );
};

const daysLeft = (value?: string | number | Date | null) => {
  if (!value) return 0;
  const diff = new Date(value).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86400000));
};

/** دکمهٔ کپی با بازخورد کوتاه */
const CopyButton = ({ text, light = false }: { text?: string | null; light?: boolean }) => {
  const [copied, setCopied] = useState(false);
  if (!text) return null;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(String(text));
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };
  return (
    <button
      type="button"
      onClick={copy}
      aria-label="کپی"
      className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-['iransans-md'] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C9A24B] ${
        copied
          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300"
          : light
          ? "bg-white/10 text-white/70 hover:bg-white/20"
          : "bg-[#C9A24B]/10 text-[#8A6A1F] hover:bg-[#C9A24B]/20 dark:text-[#E3C777]"
      }`}
    >
      {copied ? "کپی شد" : "کپی"}
    </button>
  );
};

/* --------------------------- small components ---------------------- */

const InfoRow = ({
  label,
  children,
  ltr = false,
}: {
  label: string;
  children: React.ReactNode;
  ltr?: boolean;
}) => (
  <div className="flex items-start justify-between gap-6 border-b border-dashed border-[#E8E0CC] py-3 last:border-b-0 dark:border-[#2C2D38]">
    <span className={`shrink-0 text-[13px] 2xl:text-[14px] font-['iransans-md'] ${muted}`}>
      {label}
    </span>
    <span
      dir={ltr ? "ltr" : undefined}
      className={`min-w-0 break-words text-end text-[13px] 2xl:text-[15px] font-['iransans-md'] ${strong} ${
        ltr ? "font-['iransans-md-en']" : ""
      }`}
    >
      {children === "" || children === undefined || children === null ? (
        <span className={muted}>—</span>
      ) : (
        children
      )}
    </span>
  </div>
);

const Section = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <section className={`${surface} p-5 2xl:p-7`}>
    <header className="mb-3 flex items-start gap-3">
      <span className="mt-1 h-6 w-[3px] shrink-0 rounded-full bg-gradient-to-b from-[#EBDDB0] to-[#B58A2E]" />
      <div className="flex flex-col gap-1">
        <h2 className={`text-[16px] 2xl:text-[18px] font-['iransans-black-en'] ${strong}`}>{title}</h2>
        {description && (
          <p className={`text-[12px] 2xl:text-[13px] font-['iransans-md'] ${muted}`}>{description}</p>
        )}
      </div>
    </header>
    {children}
  </section>
);

const EmptyState = ({ text }: { text: string }) => (
  <div
    className={`${subSurface} flex items-center justify-center px-4 py-8 text-[13px] font-['iransans-md'] ${muted}`}
  >
    {text}
  </div>
);

const VersionBlock = ({
  title,
  created,
  updated,
  deleted,
}: {
  title: string;
  created?: any;
  updated?: any;
  deleted?: any;
}) => (
  <details className="group mt-4 rounded-2xl border border-[#EFE8D6] bg-[#FBF9F3] open:bg-white dark:border-[#2A2B35] dark:bg-[#1B1C24] dark:open:bg-[#1B1C24]">
    <summary
      className={`flex cursor-pointer list-none items-center justify-between px-4 py-3 text-[12px] 2xl:text-[13px] font-['iransans-md'] ${strong} [&::-webkit-details-marker]:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C9A24B] rounded-2xl`}
    >
      {title}
      <svg
        className="h-4 w-4 text-[#C9A24B] transition-transform duration-200 group-open:rotate-180"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M5 8l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </summary>
    <div
      dir="ltr"
      className={`grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 border-t border-dashed border-[#E8E0CC] px-4 py-3 text-[11px] 2xl:text-[12px] font-['iransans-md-en'] dark:border-[#2C2D38] ${muted}`}
    >
      <span>version_created</span>
      <span className={strong}>{created ?? "—"}</span>
      <span>version_updated</span>
      <span className={strong}>{updated ?? "—"}</span>
      <span>version_deleted</span>
      <span className={strong}>{deleted ?? "—"}</span>
    </div>
  </details>
);

const LanguageProgressGrid = ({ items }: { items?: any[] }) => {
  if (!items || items.length === 0) return <EmptyState text="هنوز زبانی شروع نشده است" />;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item: any, index: number) => (
        <div key={index.toString()} className={`${subSurface} flex items-center gap-4 p-3`}>
          <ImageComponent
            parentclasses="w-16 h-16 !rounded-2xl shrink-0"
            imageClasses="!rounded-2xl"
            src={item?.language_info?.icon_image}
          />
          <div className="flex min-w-0 flex-col gap-2">
            <p className={`line-clamp-1 text-[15px] 2xl:text-[16px] font-['iransans-black-en'] ${strong}`}>
              {`زبان ${item?.language_info?.name ?? ""}`}
            </p>
            <span className="w-fit rounded-full bg-[#C9A24B]/15 px-3 py-1 text-[11px] 2xl:text-[12px] font-['iransans-md'] text-[#8A6A1F] dark:text-[#E3C777]">
              {`فصل ${item?.last_season_number ?? "-"} - مرحله ${item?.last_stage_number ?? "-"}`}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

/* -------------------------------- page ----------------------------- */

const Page = () => {
  const { userId } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [getError, setGetError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const getData = async () => {
    await axios({
      url: "/",
      method: "post",
      data: {
        query: `
            query getUserInformationForAdmin(
              $_id : ID!,
            ){
                getUserInformationForAdmin(
                  _id : $_id,
                ) {
                    _id,
                    type,
                    phone,
                    user_name,
                    user_login_info{
                      _id,
                      active_session,
                      login_date,
                      logout_date,
                      last_seen,
                      ip_address,
                      app_version,
                      app_build_number,
                      os,
                      os_version,
                      device_brand,
                      device_name,
                      device_model,
                      target_store,
                      build_type,
                    },
                    last_logout_date,
                    first_name,
                    last_name,
                    name,
                    gender,
                    birthday,
                    last_seen,
                    number_coins,
                    active_subscription,
                    subscription_expiration,
                    completed_account_info,
                    total_hidden_words,
                    new_hidden_words,
                    new_private_notifications,
                    last_seen_notifications,
                    blocked,
                    createdAt,
                    number_open_app,
                    user_package_game{
                        package_info{
                          title,
                          icon_image
                        },
                        access_type,
                        number_coin_paid,
                        last_season_number,
                        last_stage_number,
                        ended_game,
                        version_created,
                        version_updated,
                        version_deleted,
                        createdAt,
                    },
                    user_stage_game_progress{
                        stage_game{
                          language_info{
                            name,
                            icon_image
                          },
                          last_season_number,
                          last_stage_number,
                        },
                        version_created,
                        version_updated,
                        version_deleted,
                    },
                    user_word_game_progress{
                        word_game{
                          language_info{
                            name,
                            icon_image
                          },
                          last_season_number,
                          last_stage_number,
                        },
                        version_created,
                        version_updated,
                        version_deleted,
                    }
                }
            }
            `,
        variables: {
          _id: userId,
        },
      },
    })
      .then(async (response) => {
        const data = response.data.data.getUserInformationForAdmin;
        if (data) {
          setData(data);
          setLoading(false);
        } else {
          setGetError(true);
        }
      })
      .catch(() => {
        setGetError(true);
      });
  };

  const tryAgain = () => {
    setLoading(true);
    setGetError(false);
    getData();
  };

  if (loading == true) {
    return (
      <div className="flex h-[calc(100dvh-60px)] w-full items-center justify-center">
        <ScreenLoading getError={getError} notItem={false} tryAgain={tryAgain} />
      </div>
    );
  }

  const lastSeen = data?.last_seen ?? data?.user_login_info?.[0]?.last_seen;
  const userTypeLabel =
    data?.type == "guest" ? "کاربر میهمان" : data?.type == "registered" ? "کاربر ثبت نام شده" : "";

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-4 pb-24 pt-6 2xl:px-8">
      <style>{`
        @media (prefers-reduced-motion: no-preference) {
          .lux-hero { animation: luxHero .9s cubic-bezier(.2,.7,.2,1) both; }
          .lux-hero .lux-line { animation: luxLine 1.4s .3s cubic-bezier(.2,.7,.2,1) both; }
        }
        @keyframes luxHero { from { opacity:0; transform: translateY(14px) scale(.985);} to { opacity:1; transform:none; } }
        @keyframes luxLine { from { transform: scaleX(0); opacity:0;} to { transform: scaleX(1); opacity:1; } }
      `}</style>
      {/* ============================ HERO ============================ */}
      <header className="lux-hero relative rounded-[28px] bg-gradient-to-br from-[#0F1015] via-[#15161D] to-[#1E1A10] p-[1px] shadow-[0_30px_60px_-30px_rgba(15,16,21,0.7)]">
        <div className="relative rounded-[27px] bg-[#0F1015] px-5 py-6 2xl:px-8 2xl:py-8">
          {/* gold hairline */}
          <div className="lux-line pointer-events-none absolute inset-x-10 top-0 h-px origin-center bg-gradient-to-r from-transparent via-[#C9A24B] to-transparent" />
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[27px]">
            <div className="absolute -top-24 start-0 h-64 w-64 rounded-full bg-[#C9A24B]/10 blur-3xl" />
          </div>

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 2xl:gap-5">
              <div className="rounded-full bg-gradient-to-br from-[#EBDDB0] via-[#C9A24B] to-[#8A6A1F] p-[2px]">
                <div className="flex h-[64px] w-[64px] items-center justify-center rounded-full bg-[#15161D] 2xl:h-[80px] 2xl:w-[80px]">
                  <FaUserLarge className="text-[26px] text-[#EBDDB0] 2xl:text-[32px]" />
                </div>
              </div>
              <div className="flex min-w-0 flex-col gap-2">
                <h1
                  dir="ltr"
                  className="line-clamp-1 text-start text-[20px] 2xl:text-[26px] font-['iransans-black-en'] text-[#FAF7EF]"
                >
                  {`${data?.user_name ?? ""}`}
                </h1>
                <div className="flex items-center gap-2" dir="ltr">
                  <span className="max-w-[220px] truncate text-[11px] font-['iransans-md-en'] text-white/45">
                    {data?._id}
                  </span>
                  <CopyButton text={data?._id} light />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {userTypeLabel && (
                    <span className="rounded-full border border-[#C9A24B]/40 px-3 py-1 text-[11px] 2xl:text-[12px] font-['iransans-md'] text-[#EBDDB0]">
                      {userTypeLabel}
                    </span>
                  )}
                  {data?.blocked == true && (
                    <span className="rounded-full bg-red-500/15 px-3 py-1 text-[11px] 2xl:text-[12px] font-['iransans-md'] text-red-300">
                      حساب کاربری مسدود است
                    </span>
                  )}
                  {data?.completed_account_info == false && (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] 2xl:text-[12px] font-['iransans-md'] text-white/70">
                      اطلاعات حساب تکمیل نشده
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* actions */}
            <div ref={menuRef} className="relative self-start sm:self-center">
              <GradientButton
                buttonText={"عملیات"}
                onClickFn={() => setMenuOpen((prev) => !prev)}
                loading={false}
                classes="!text-base !flex-none !w-[180px]"
              />
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute end-0 top-full z-30 mt-3 w-64 overflow-hidden rounded-2xl border border-[#E8E0CC] bg-white font-['iransans-md'] shadow-[0_24px_48px_-16px_rgba(0,0,0,0.45)] dark:border-[#2C2D38] dark:bg-[#1B1C24]"
                >
                  <button
                    role="menuitem"
                    className="flex w-full items-center gap-3 px-4 py-3.5 text-start text-sm text-red-600 transition-colors hover:bg-red-500/10 focus-visible:bg-red-500/10 focus-visible:outline-none dark:text-red-400"
                    onClick={() => {
                      setMenuOpen(false);
                    }}
                  >
                    <HiOutlineTrash className="text-lg" />
                    مسدود کردن کاربر
                  </button>
                  <div className="h-px bg-[#E8E0CC] dark:bg-[#2C2D38]" />
                  <button
                    role="menuitem"
                    className={`flex w-full items-center gap-3 px-4 py-3.5 text-start text-sm transition-colors hover:bg-[#C9A24B]/10 focus-visible:bg-[#C9A24B]/10 focus-visible:outline-none ${strong}`}
                    onClick={() => {
                      setMenuOpen(false);
                    }}
                  >
                    <HiOutlineEyeOff className="text-lg text-[#C9A24B]" />
                    پنهان کردن آیتم
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* key metrics */}
          <dl className="relative mt-7 grid grid-cols-2 divide-white/10 border-t border-white/10 pt-6 lg:grid-cols-4 lg:divide-x lg:divide-x-reverse">
            <div className="flex flex-col gap-2 pb-5 lg:pb-0 lg:pe-6">
              <dt className="text-[12px] 2xl:text-[13px] font-['iransans-md'] text-white/55">موجودی سکه</dt>
              <dd className="bg-gradient-to-b from-[#F6EBC5] via-[#E3C777] to-[#B58A2E] bg-clip-text font-['iransans-black-en'] text-[30px] leading-none text-transparent 2xl:text-[40px]">
                {data?.number_coins ? priceDigitSeperator(data.number_coins) : "0"}
              </dd>
            </div>
            <div className="flex flex-col gap-2 pb-5 ps-6 lg:px-6 lg:pb-0">
              <dt className="text-[12px] 2xl:text-[13px] font-['iransans-md'] text-white/55">اشتراک بازی</dt>
              <dd className="flex flex-col gap-1">
                <span className="flex items-center gap-2 text-[16px] 2xl:text-[18px] font-['iransans-black-en'] text-[#FAF7EF]">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      data?.active_subscription == true ? "bg-emerald-400" : "bg-white/30"
                    }`}
                  />
                  {data?.active_subscription == true ? "فعال" : "غیر فعال"}
                </span>
                {data?.active_subscription == true && (
                  <>
                    <span className="text-[11px] 2xl:text-[12px] font-['iransans-md'] text-white/55">
                      تا <DateValue value={data?.subscription_expiration} relative={false} />
                    </span>
                    <span className="mt-1 flex flex-col gap-1.5">
                      <span className="h-1 w-full max-w-[180px] overflow-hidden rounded-full bg-white/10">
                        <span
                          className="block h-full rounded-full bg-gradient-to-l from-[#B58A2E] to-[#F6EBC5]"
                          style={{ width: `${Math.min(100, (daysLeft(data?.subscription_expiration) / 30) * 100)}%` }}
                        />
                      </span>
                      <span className="text-[11px] font-['iransans-md'] text-[#EBDDB0]">
                        {`${daysLeft(data?.subscription_expiration)} روز مانده`}
                      </span>
                    </span>
                  </>
                )}
              </dd>
            </div>
            <div className="flex flex-col gap-2 pt-5 lg:px-6 lg:pt-0">
              <dt className="text-[12px] 2xl:text-[13px] font-['iransans-md'] text-white/55">آخرین بازدید</dt>
              <dd>
                <HeroTime value={lastSeen} />
              </dd>
            </div>
            <div className="flex flex-col gap-2 pt-5 ps-6 lg:ps-6 lg:pt-0">
              <dt className="text-[12px] 2xl:text-[13px] font-['iransans-md'] text-white/55">عضویت در بازی</dt>
              <dd>
                <HeroTime value={data?.createdAt} />
              </dd>
            </div>
          </dl>
        </div>
      </header>

      {/* ============================ BODY ============================ */}
      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        {/* ---- column: profile + activity ---- */}
        <div className="flex flex-col gap-6">
          <Section title="اطلاعات کاربری">
            <InfoRow label="شماره موبایل" ltr>
              <span className="inline-flex items-center gap-2">
                {data?.phone ?? ""}
                <CopyButton text={data?.phone} />
              </span>
            </InfoRow>
            <InfoRow label="نام">{data?.first_name ?? ""}</InfoRow>
            <InfoRow label="نام خانوادگی">{data?.last_name ?? ""}</InfoRow>
            <InfoRow label="جنسیت">{data?.gender ? getGender(data.gender) : ""}</InfoRow>
            <InfoRow label="تاریخ تولد">
              {data?.birthday ? (
                <span className="font-['iransans-md-en']" dir="ltr">
                  {moment(data.birthday).format("jYYYY/jMM/jDD")}
                </span>
              ) : (
                ""
              )}
            </InfoRow>
          </Section>

          <Section title="فعالیت کاربر" description="رفتار کاربر در بازی و اعلانات">
            {data?.number_open_app > 0 && (
              <InfoRow label="دفعات بازگشت به بازی (با اینترنت)">{data.number_open_app}</InfoRow>
            )}
            {data?.last_seen_notifications && (
              <InfoRow label="آخرین بازدید از اعلانات">
                <DateValue value={data.last_seen_notifications} />
              </InfoRow>
            )}
            <InfoRow label="اعلانات خصوصی خوانده نشده">{data?.new_private_notifications ?? 0}</InfoRow>
            <InfoRow label="کلمات پنهان ایجاد شده">{data?.total_hidden_words ?? 0}</InfoRow>
            <InfoRow label="کلمات پنهان جدید">{data?.new_hidden_words ?? 0}</InfoRow>
            {data?.last_logout_date && (
              <InfoRow label="آخرین خروج از حساب">
                <DateValue value={data.last_logout_date} />
              </InfoRow>
            )}
          </Section>

          <Section title="اطلاعات دستگاه" description="نشست‌های ورود این کاربر">
            {data?.user_login_info?.length > 0 ? (
              <div className="flex flex-col gap-4">
                {data.user_login_info.map((item: any, index: number) => (
                  <article key={index.toString()} className={`${subSurface} overflow-hidden`}>
                    <div className="flex items-center justify-between gap-3 border-b border-dashed border-[#E8E0CC] px-4 py-3 dark:border-[#2C2D38]">
                      <div className="flex min-w-0 flex-col gap-1">
                        <span
                          dir="ltr"
                          className={`line-clamp-1 text-start text-[14px] 2xl:text-[15px] font-['iransans-black-en'] ${strong}`}
                        >
                          {[item?.device_brand, item?.device_model].filter(Boolean).join(" ") || "—"}
                        </span>
                        <span dir="ltr" className={`text-start text-[11px] 2xl:text-[12px] font-['iransans-md-en'] ${muted}`}>
                          {[item?.os, item?.os_version].filter(Boolean).join(" ")}
                        </span>
                      </div>
                      <span
                        className={`flex shrink-0 items-center gap-2 rounded-full px-3 py-1 text-[11px] 2xl:text-[12px] font-['iransans-md'] ${
                          item?.active_session == true
                            ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                            : "bg-[#8F8873]/15 text-[#6D6753] dark:text-[#B5B09E]"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item?.active_session == true ? "bg-emerald-500" : "bg-[#8F8873]"
                          }`}
                        />
                        {item?.active_session == true ? "دستگاه فعال" : "دستگاه غیر فعال"}
                      </span>
                    </div>
                    <div className="px-4 py-1">
                      <InfoRow label="کد نسخه بازی" ltr>
                        {item?.app_build_number ?? ""}
                      </InfoRow>
                      <InfoRow label="نام نسخه بازی" ltr>
                        {item?.app_version ?? ""}
                      </InfoRow>
                      <InfoRow label="نوع نسخه بازی">{item?.build_type ?? ""}</InfoRow>
                      <InfoRow label="بازی نصب شده از">{item?.target_store ?? ""}</InfoRow>
                      <InfoRow label="نام دستگاه" ltr>
                        {item?.device_name ?? ""}
                      </InfoRow>
                      <InfoRow label="آی پی شبکه" ltr>
                        <span className="inline-flex items-center gap-2">
                          {item?.ip_address ?? ""}
                          <CopyButton text={item?.ip_address} />
                        </span>
                      </InfoRow>
                      <InfoRow label="تاریخ ورود به حساب">
                        <DateValue value={item?.login_date} />
                      </InfoRow>
                      <InfoRow label="آخرین بازدید">
                        <DateValue value={item?.last_seen} />
                      </InfoRow>
                      <InfoRow label="تاریخ خروج از حساب">
                        <DateValue value={item?.logout_date} />
                      </InfoRow>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState text="هنوز نشستی برای این کاربر ثبت نشده است" />
            )}
          </Section>
        </div>

        {/* ---- column: game progress ---- */}
        <div className="flex flex-col gap-6">
          <Section title="بازی «جمله‌چین»" description="آخرین مرحلهٔ هر زبان">
            <LanguageProgressGrid items={data?.user_stage_game_progress?.stage_game} />
            <VersionBlock
              title="نسخهٔ محتوای بازی «جمله‌چین»"
              created={data?.user_stage_game_progress?.version_created}
              updated={data?.user_stage_game_progress?.version_updated}
              deleted={data?.user_stage_game_progress?.version_deleted}
            />
          </Section>

          <Section title="بازی «خان کلمات»" description="آخرین مرحلهٔ هر زبان">
            <LanguageProgressGrid items={data?.user_word_game_progress?.word_game} />
            <VersionBlock
              title="نسخهٔ محتوای بازی «خان کلمات»"
              created={data?.user_word_game_progress?.version_created}
              updated={data?.user_word_game_progress?.version_updated}
              deleted={data?.user_word_game_progress?.version_deleted}
            />
          </Section>

          <Section title="بسته‌های بازی" description="بسته‌هایی که کاربر دریافت کرده و پیشرفت او در هر کدام">
            {data?.user_package_game?.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
                {data.user_package_game.map((item: any, index: number) => (
                  <article key={index.toString()} className={`${subSurface} flex flex-col p-4`}>
                    <div className="flex items-center gap-4">
                      <ImageComponent
                        parentclasses="w-16 h-16 !rounded-2xl shrink-0"
                        imageClasses="!rounded-2xl"
                        src={item?.package_info?.icon_image}
                      />
                      <div className="flex min-w-0 flex-col gap-2">
                        <h3 className={`line-clamp-1 text-[15px] 2xl:text-[16px] font-['iransans-black-en'] ${strong}`}>
                          {`${item?.package_info?.title ?? ""}`}
                        </h3>
                        <span
                          className={`w-fit rounded-full px-3 py-1 text-[11px] 2xl:text-[12px] font-['iransans-md'] ${accessBadgeClass(
                            item?.access_type
                          )}`}
                        >
                          {getAccessType(item?.access_type, item?.number_coin_paid)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <InfoRow label="تاریخ دریافت بازی">
                        <DateValue value={item?.createdAt} />
                      </InfoRow>
                      <InfoRow label="پیشرفت بسته">
                        {item?.ended_game ? (
                          <span className="inline-flex flex-wrap items-baseline justify-end gap-2">
                            <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] text-emerald-700 dark:text-emerald-300">
                              پایان بازی
                            </span>
                            <DateValue value={item.ended_game} />
                          </span>
                        ) : item?.last_season_number || item?.last_stage_number ? (
                          `فصل ${item?.last_season_number ?? ""} - مرحله ${item?.last_stage_number ?? ""}`
                        ) : (
                          "فصل 1 - مرحله 1"
                        )}
                      </InfoRow>
                    </div>

                    <VersionBlock
                      title="نسخهٔ بستهٔ بازی"
                      created={item?.version_created}
                      updated={item?.version_updated}
                      deleted={item?.version_deleted}
                    />
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState text="این کاربر هنوز بسته‌ای دریافت نکرده است" />
            )}
          </Section>
        </div>
      </div>
    </div>
  );
};

export default Page;