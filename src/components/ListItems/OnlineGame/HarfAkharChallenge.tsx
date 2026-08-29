import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BsMusicNoteBeamed } from "react-icons/bs";
import { IoIosVideocam, IoMdEye, IoMdEyeOff } from "react-icons/io";
import { MdVerifiedUser } from "react-icons/md";
import { FaPlay } from "react-icons/fa";
import ImageComponent from "@/components/ImageComponent";
import { secondsToTime } from "@/utils/SecondToTime";
import { HiDotsVertical } from "react-icons/hi";
import { FaImage, FaPencil } from "react-icons/fa6";
import { FaUserLarge, FaCoins } from "react-icons/fa6";
import { IoDiamondSharp, IoTimeOutline, IoCalendarOutline } from "react-icons/io5";
import Globals from "@/utils/Globals";

// اضافه کردن Moment Jalaali و تنظیمات آن
import moment from "moment-jalaali";
moment.locale('fa');
moment.loadPersian({ usePersianDigits: false, dialect: "persian-modern" });

const HarfAkharChallenge = ({
    _id,
    title,
    description,
    time_limit,
    entry_fee_coins,
    subscription_required,
    reward_coins,
    reward_subscription,
    start_date,
    end_date,
    parts,
    stage_hint,
    rtl,
    language,
    media,
    voice,
    is_visible,
    is_active,
    publication_status,
    completion_status,
    started_users_count,
    completed_users_count,
}: {
    _id: string;
    title: string;
    description?: string;
    time_limit?: number;
    entry_fee_coins?: number;
    subscription_required?: boolean;
    reward_coins?: number;
    reward_subscription?: number;
    start_date?: Date;
    end_date?: Date;
    parts: {
        sentence: string;
        sentence_hint?: string;
        sentence_display?: string;
        words:{
        word: string;
        unknown_word: boolean;
        letters: string[];
        additional_words: string[];
        hidden_words: string[];
        }[]
    }[];
    stage_hint?: string;
    rtl: boolean;
    language: string;
    media?: {
        path: string;
        order?: number;
        file_type?: string;
        duration?: string;
    }[];
    voice?: {
        path: string;
        order?: number;
        file_type?: string;
        duration?: string;
    }[];
    is_visible: boolean;
    is_active: boolean;
    publication_status: string;
    completion_status: string;
    started_users_count?: number;
    completed_users_count?: number;
}) => {
  const router = useRouter();
  const direction = rtl ? "rtl" : "ltr";
  const textAlign = rtl ? "text-right" : "text-left";
  const flexDir = rtl ? "flex-row-reverse" : "flex-row";
  const itemAlign = rtl ? "items-end sm:items-start" : "items-start sm:items-end";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const challengeId = _id;

  const duplicateWordsInfo = React.useMemo(() => {
      const duplicates: {
        duplicateWord: string;
        partIndex: number;
        unknownWord: string;
      }[] = [];
  
      parts.forEach((part, partIndex) => {
        part.words.forEach((wordItem) => {
          if (!wordItem.unknown_word) return;
  
          const usedWords = new Set<string>();
  
          const allWords = [
            wordItem.word,
            ...(wordItem.additional_words || []),
            ...(wordItem.hidden_words || []),
          ]
            .filter(Boolean)
            .map((item) => item.trim().toLowerCase());
  
          allWords.forEach((item) => {
            if (usedWords.has(item)) {
              duplicates.push({
                duplicateWord: item,
                partIndex,
                unknownWord: wordItem.word,
              });
            } else {
              usedWords.add(item);
            }
          });
        });
      });
  
      return {
        hasError: duplicates.length > 0,
        words: duplicates,
        count: duplicates.length,
      };
    }, [parts]);

  // تابع تبدیل ثانیه به فرمت 00:00
  const formatTimeLimit = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // تابع دریافت ساعت برای قسمت انقضا
  const getTime = (date: Date | string) => moment(date).format("HH:mm");

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // بررسی وضعیت وجود داشتن هر کدام از بخش‌های اطلاعاتی برای رندر بهینه تمیز
  const hasEntryOrRewardInfo = (entry_fee_coins && entry_fee_coins > 0) || (reward_coins && reward_coins > 0);
  const hasSubscriptionInfo = subscription_required || (reward_subscription && reward_subscription > 0);
  const hasStartOrEndDate = start_date || end_date;
  const hasUsersStats = started_users_count !== undefined || completed_users_count !== undefined;
  const hasTimeLimit = (time_limit && time_limit > 0)

  return (
    <div 
      dir={direction} 
      className={`relative
        w-full
        p-4
        rounded-2xl
        shadow-bottom
        dark:shadow-bottom-dark
        m-1
        bg-background7
        dark:bg-background7_dark
        flex
        flex-col
        justify-between
        gap-4
        ${textAlign}

        ${
          duplicateWordsInfo.hasError
            ? "ring-4 ring-red-500 shadow-red-500/40 shadow-xl"
            : ""
        }
      `}
    >
        <div className="flex flex-col gap-6">
            {/* منوی تنظیمات (سه نقطه) */}
            <div
            className={`absolute top-4 ${rtl ? "left-4" : "right-4"} z-20`}
            ref={menuRef}
            >
            <div className="relative inline-block text-left">
                <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="p-1 rounded-full text-primary hover:bg-rgba0 hover:text-white transition-colors"
                >
                <HiDotsVertical className="text-2xl" />
                </button>
                {menuOpen && (
                <div
                    ref={menuRef}
                    className={`absolute mt-2 w-60 rounded-[15px] font-['iransans-md'] shadow-lg bg-background2 dark:bg-background2_dark ring-1 ring-black ring-opacity-5 focus:outline-none z-30 left-6 overflow-hidden`}
                >
                    <div className="py-2">
                    <button
                        className="block flex flex-row items-center gap-3 w-full text-right px-4 py-3 text-sm text-text2 dark:text-text2_dark hover:bg-border dark:hover:bg-border_dark transition-colors"
                        onClick={() => {
                        router.push(`/dashboard/harf-akhar/harf-akhar-challenges-list/edit-challenge/${challengeId}`)
                        }}
                    >
                        <FaPencil className="text-text4 dark:text-text4_dark text-lg"/>
                        ویرایش اطلاعات
                    </button>
                    <button
                        className="block flex flex-row items-center gap-3 w-full text-right px-4 py-3 text-sm text-text2 dark:text-text2_dark hover:bg-border dark:hover:bg-border_dark transition-colors"
                        onClick={() => {
                            router.push(`/dashboard/harf-akhar/harf-akhar-challenges-list/edit-challenge-media/${challengeId}`)
                        }}
                    >
                        <FaImage className="text-text4 dark:text-text4_dark text-lg"/>
                        ویرایش رسانه
                    </button>
                    </div>
                </div>
                )}
            </div>
            </div>
            {
            duplicateWordsInfo.hasError && (
                <div className="absolute top-4 left-12 z-30">
                <div className="relative">
                    <div className="text-[60px] animate-bounce">
                    ⚠️
                    </div>

                    <span className="absolute -top-1 -right-1 bg-red-700 text-white text-xs rounded-full min-w-[24px] h-6 flex items-center justify-center px-1">
                    {duplicateWordsInfo.count}
                    </span>
                </div>
                </div>
            )
            }

            {/* بخش تایتل و اطلاعات اولیه */}
            <div className="flex flex-col gap-3 pr-2">
                <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-xl font-['iransans-bold'] text-text dark:text-text_dark">{title}</h2>
                    <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-['iransans-bold']">
                        زبان {language}
                    </span>
                </div>
                {description && <p className="text-text6 dark:text-text6_dark text-sm font-['iransans-md'] leading-relaxed">{description}</p>}
                
                {/* استاتوس بار */}
                <div className="flex flex-wrap gap-2 text-xs font-['iransans-md'] mt-1">
                    <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 px-3 py-1.5 rounded-md flex items-center gap-1">
                        انتشار: {publication_status}
                    </span>
                    <span className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 px-3 py-1.5 rounded-md flex items-center gap-1">
                        تکمیل: {completion_status}
                    </span>
                    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-md ${is_visible ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"}`}>
                        {is_visible ? <IoMdEye className="text-lg" /> : <IoMdEyeOff className="text-lg" />}
                        <span>{is_visible ? "قابل نمایش" : "مخفی"}</span>
                    </div>
                    <div className={`flex items-center gap-1 px-3 py-1.5 rounded-md ${is_active ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300"}`}>
                        <MdVerifiedUser className="text-lg" />
                        <span>{is_active ? "فعال" : "غیرفعال"}</span>
                    </div>
                </div>
            </div>

            {/* بخش اطلاعات و آمار چالش (به صورت لیست تمیز و دو ستونه متناسب با عرض‌های مختلف) */}
            {(hasEntryOrRewardInfo || hasSubscriptionInfo || hasStartOrEndDate || hasUsersStats) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/20 border border-border dark:border-border_dark font-['iransans-md'] text-sm">
                    
                    {/* باکس سکه ورودی و جایزه */}
                    {hasEntryOrRewardInfo && (
                        <div className="flex flex-col gap-2.5 p-3 rounded-lg bg-amber-50/60 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                            {entry_fee_coins !== undefined && entry_fee_coins > 0 && (
                                <div className="flex items-center justify-between text-amber-800 dark:text-amber-400">
                                    <div className="flex items-center gap-2"><FaCoins className="text-amber-500" /><span>تعداد سکه برای ورودی:</span></div>
                                    <span className="font-['iransans-bold']">{entry_fee_coins}</span>
                                </div>
                            )}
                            {reward_coins !== undefined && reward_coins > 0 && (
                                <div className="flex items-center justify-between text-amber-800 dark:text-amber-400">
                                    <div className="flex items-center gap-2"><FaCoins className="text-amber-500" /><span>تعداد سکه جایزه:</span></div>
                                    <span className="font-['iransans-bold']">{reward_coins}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* باکس وضعیت اشتراک */}
                    {hasSubscriptionInfo && (
                        <div className="flex flex-col justify-center gap-2.5 p-3 rounded-lg bg-blue-50/60 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                            {subscription_required === true && (
                                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-400 font-['iransans-bold']">
                                    <IoDiamondSharp className="text-base text-blue-500" />
                                    <span>داشتن اشتراک الزامی</span>
                                </div>
                            )}
                            {reward_subscription !== undefined && reward_subscription > 0 && (
                                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-400 font-['iransans-bold']">
                                    <IoDiamondSharp className="text-base text-blue-500" />
                                    <span>{reward_subscription} روز اشتراک جایزه</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* باکس محدودیت زمان و تاریخ انقضا */}
                    {hasStartOrEndDate && (
                        <div className="flex flex-col justify-center gap-2.5 p-3 rounded-lg bg-rose-50/60 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30">
                            {start_date && (
                                <div className="flex items-center justify-between text-rose-800 dark:text-rose-400 flex-wrap gap-1">
                                    <div className="flex items-center gap-2"><IoCalendarOutline className="text-base text-rose-500" /><span>شروع:</span></div>
                                    <span className="font-['iransans-bold'] text-xs" dir="ltr">
                                        {`( ${getTime(start_date)}   ___  ${moment(start_date).format("jYYYY/jMM/jDD")} )`}
                                    </span>
                                </div>
                            )}
                            {end_date && (
                                <div className="flex items-center justify-between text-rose-800 dark:text-rose-400 flex-wrap gap-1">
                                    <div className="flex items-center gap-2"><IoCalendarOutline className="text-base text-rose-500" /><span>پایان:</span></div>
                                    <span className="font-['iransans-bold'] text-xs" dir="ltr">
                                        {`( ${getTime(end_date)}   ___  ${moment(end_date).format("jYYYY/jMM/jDD")} )`}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* باکس آمار کاربران (حتی با مقدار 0 نمایش داده می‌شوند) */}
                    {hasUsersStats && (
                        <div className="flex flex-col gap-2.5 p-3 rounded-lg bg-slate-100/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                            {started_users_count !== undefined && (
                                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                                    <div className="flex items-center gap-2"><FaUserLarge className="text-slate-400 text-xs" /><span>کاربرانی که شروع کردند:</span></div>
                                    <span className="font-['iransans-bold']">{started_users_count}</span>
                                </div>
                            )}
                            {completed_users_count !== undefined && (
                                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                                    <div className="flex items-center gap-2"><FaUserLarge className="text-emerald-500 text-xs" /><span>کاربرانی که به اتمام رساندند:</span></div>
                                    <span className="font-['iransans-bold']">{completed_users_count}</span>
                                </div>
                            )}
                        </div>
                    )}
                    {hasTimeLimit && (
                        <div className="flex flex-col justify-center gap-2.5 p-3 rounded-lg bg-green-50/60 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30">
                            {time_limit !== undefined && time_limit > 0 && (
                                <div className="flex items-center justify-between text-green-800 dark:text-green-400">
                                    <div className="flex items-center gap-2"><IoTimeOutline className="text-base text-green-500" /><span>محدودیت زمانی:</span></div>
                                    <span className="font-['iransans-bold']" dir="ltr">{formatTimeLimit(time_limit)}</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* بخش Parts که دقیقا دست نخورده باقی ماند */}
            <div className="flex flex-col gap-6 mt-2">
                {
                    parts.map((item, index)=>(
                    <div key={index.toString()} className="flex flex-col gap-2 bg-background6 dark:bg-background5_dark px-2 py-6 rounded w-full border border-dashed border-text5 dark:border-text5_dark">
                        <p className="text-info text-[16px] font-['iransans-bold']">{item.sentence}</p>
                        {item?.sentence_display&&<p className="text-text5 dark:text-text5_dark text-[12px] font-['iransans-md']">{item.sentence_display}</p>}
                        {item?.sentence_hint&&<p className="text-text5 dark:text-text5_dark text-[12px] font-['iransans-md']">{item.sentence_hint}</p>}
                        <div className="flex flex-wrap gap-2 mt-4">
                        {
                            item?.words.map((item2, index2)=>(
                            <div key={index2.toString()} className={`${item2.unknown_word == true?"bg-warning":"bg-info"} rounded w-fit px-4 py-2 h-fit`}>
                                <p className={`text-white text-[16px] font-['iransans-md']`}>{item2.word}</p>
                                {
                                item2.unknown_word&&
                                <div className="flex flex-col gap-2 mt-2">
                                    {
                                    item2?.letters?.length > 0&&(
                                        <div className="flex flex-wrap gap-2">
                                        {
                                        item2?.letters?.map((item3, index3)=>(
                                            <p key={index3.toString()} className={`text-white text-[16px] font-['iransans-bold']`}>{item3}{index3+1 < item2.letters.length&&<span className="text-white"> - </span>}</p>
                                        ))
                                        }
                                        </div>
                                    )
                                    }
                                    {
                                    item2?.additional_words?.length > 0&&(
                                        <div className="flex flex-wrap gap-2">
                                        {
                                        item2?.additional_words?.map((item3, index3)=>(
                                            <p key={index3.toString()} className={`text-black text-[12px] font-['iransans-md']`}>{item3.length>1?item3:"#NO#"}{index3+1 < item2.additional_words.length&&<span className="text-white"> - </span>}</p>
                                        ))
                                        }
                                        </div>
                                    )
                                    }
                                    {
                                    item2?.hidden_words?.length > 0&&(
                                        <div className="flex flex-wrap gap-2">
                                        {
                                        item2?.hidden_words?.map((item3, index3)=>(
                                            <p key={index3.toString()} className={`text-red_error text-[12px] font-['iransans-md']`}>{item3.length>1?item3:"#NO#"}{index3+1 < item2.hidden_words.length&&<span className="text-white"> - </span>}</p>
                                        ))
                                        }
                                        </div>
                                    )
                                    }
                                </div>
                                }
                            </div>
                            ))
                        }
                        </div>
                    </div>
                    ))
                }
            {
                duplicateWordsInfo.hasError && (
                <div className="border border-red-500 bg-red-50 dark:bg-red-950/30 rounded-xl p-4">
                    <p className="font-['iransans-bold'] text-red-600 mb-3">
                    کلمات تکراری شناسایی شده
                    </p>

                    <div className="flex flex-col gap-2">
                    {
                        duplicateWordsInfo.words.map((item, index) => (
                        <div
                            key={`${item.duplicateWord}-${index}`}
                            className="bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
                        >
                            <span className="font-['iransans-bold']">
                            {item.duplicateWord}
                            </span>

                            <span className="mx-2">←</span>

                            <span>
                            پارت {item.partIndex + 1}
                            </span>

                            <span className="mx-2">|</span>

                            <span>
                            کلمه اصلی: {item.unknownWord}
                            </span>
                        </div>
                        ))
                    }
                    </div>
                </div>
                )
            }
            {stage_hint&&<p className="text-text5 dark:text-text5_dark text-[12px] font-['iransans-md'] mt-2">{stage_hint}</p>}
            </div>
        </div>
        {
            duplicateWordsInfo.hasError && (
            <div className="rounded-xl bg-red-600 text-white p-4 flex items-center gap-4 animate-pulse">
                <div className="text-5xl">⚠️</div>

                <div>
                <p className="font-['iransans-bold'] text-lg">
                    خطای محتوایی در مرحله
                </p>

                <p className="text-sm">
                    {duplicateWordsInfo.count} کلمه تکراری پیدا شد
                </p>
                </div>
            </div>
            )
        }
        <div className="flex flex-col gap-4 mt-2">
            {/* رسانه‌ها */}
            {((media && media?.length > 0) || (voice && voice?.length > 0)) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-border dark:border-border_dark">
                {media?.map((item, index) =>
                item.duration ? (
                    <div
                    key={index.toString()}
                    className="relative aspect-video overflow-hidden rounded-xl shadow-sm"
                    >
                    <video
                        src={`${Globals.uri}${item.path}`}
                        className="w-full h-full object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 flex justify-center items-center bg-black/40 hover:bg-black/20 transition-colors cursor-pointer">
                        <FaPlay className="text-white text-3xl" />
                    </div>
                    <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-black/70 text-white text-xs px-2.5 py-1 rounded-md backdrop-blur-sm">
                        <span>{secondsToTime(item.duration)}</span>
                        <IoIosVideocam className="text-base" />
                    </div>
                    </div>
                ) : (
                    <div key={index} className="aspect-video overflow-hidden rounded-xl shadow-sm">
                    <ImageComponent
                        src={item.path}
                        alt="media_image"
                        baseURI={true}
                        parentclasses="h-full w-full object-cover rounded-xl hover:scale-105 transition-transform duration-500"
                    />
                    </div>
                )
                )}
                {voice?.map((item, index) =>
                    <div key={index.toString()} className="relative bg-primary/10 border border-primary/20 rounded-xl p-4 w-full col-span-1 sm:col-span-2 lg:col-span-3 flex items-center shadow-sm">
                        <BsMusicNoteBeamed className="text-primary text-2xl ml-4" />
                        <audio src={`${Globals.uri}${item.path}`} controls className="w-full h-10 outline-none" />
                    </div>
                )}
            </div>
            )}
        </div>
    </div>
  );
};

export default HarfAkharChallenge;