"use client";

import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { FaUserLarge } from "react-icons/fa6";
import ImageComponent from "@/components/ImageComponent";
import { priceDigitSeperator } from "@/utils/PriceDigitSeparator";
import ScreenLoading from "@/components/ScreenLoading";
import { useParams } from "next/navigation";
import { getTime } from "@/utils/GetTime";
import GradientButton from "@/components/GradientButton";
import { HiOutlineEyeOff, HiOutlineTrash } from "react-icons/hi";
import moment from "moment-jalaali";
moment.locale('fa');
moment.loadPersian({ usePersianDigits: false, dialect: "persian-modern" });

const getGender = (type:string)=>{
  if(type == "male"){
    return "آقا"
  } else if(type == "female"){
    return "خانم"
  } else if( type == "not-specified"){
    return "تعیین نشده"
  }
}
const getAccessType = (type:string, numberCoinPaid?:number)=>{
  if(type == "subscription"){
    return "اشتراک"
  } else if(type == "free"){
    return "رایگان"
  } else if( type == "coin-payment"){
    return `پرداخت ${numberCoinPaid??""} سکه`
  }
}
const Page = () => {
  const { userId } = useParams();
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [getError, setGetError] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  

  useEffect(()=>{
    getData()
  }, [])
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
  const getData = async()=>{
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
                    }
                }
            }
            `,
        variables: {
          _id : userId
        },
      },
    }).then(async (response) => {
        const data = response.data.data.getUserInformationForAdmin;
        if (data) {
          setData(data)
          setLoading(false)
          
        } else {
          setGetError(true)
        }
      })
      .catch(() => {
        setGetError(true)
      });
  }
  const tryAgain = ()=>{
    setLoading(true)
    setGetError(false)
    getData()
  }
  
  return (
    loading == true?
    <div className="flex items-center justify-center w-full h-[calc(100dvh-60px)]">
      <ScreenLoading
        getError={getError}
        notItem={false}
        tryAgain={tryAgain}
      />
    </div>
    :
    <div className="flex flex-col lg:flex-row 2xl-flex-row justify-between w-full items-start pb-20">
      <div className="flex flex-col items-center justify-center w-full gap-2">

        <div className="flex flex-row w-full items-center justify-between pt-6 px-4">
          <div className="flex flex-row items-center gap-4  w-full">
              <FaUserLarge className="text-info text-[45px] 2xl:text-[60px]"/>
              <div className="flex flex-col gap-[2px]">
                  <h3 className="text-[18px] 2xl:text-[20px] font-['iransans-black-en'] text-text dark:text-text_dark line-clmp-1">
                      {`${data?.user_name}`}
                  </h3>
                  <p className="text-[12px] 2xl:text-[14px] font-['iransans-md'] text-info line-clamp-1">
                    {data?.type == "guest"?"کاربر میهمان":data?.type == "registered"?"کاربر ثبت نام شده":""}
                    {
                      data?.blocked == true&&
                      <span className="text-red_color font-['iransans-md']">{` ( حساب کاربری مسدود است )`}</span>
                    }
                  </p>
              </div>
          </div>
          <div className="flex flex-col items-end">
            <GradientButton
              buttonText={"عملیات"}
              onClickFn={() => setMenuOpen((prev) => !prev)}
              loading={false}
              classes="!text-base !flex-none !w-[180px] relative"
            />
            {menuOpen && (
              <div
                ref={menuRef}
                className={`absolute w-60 rounded-[15px] font-['iransans-md'] shadow-lg bg-background2 dark:bg-background2_dark ring-1 ring-black ring-opacity-5 focus:outline-none z-30 ml-12 mt-6`}
              >
                <div className="py-4">
                  <button
                    className="block flex flex-row items-center gap-2 w-full text-right px-2 py-4 text-sm text-text2 dark:text-text2_dark hover:bg-border dark:hover:bg-border_dark"
                    onClick={() => {
                      setMenuOpen(false);
                    }}
                  >
                    <HiOutlineTrash className="text-text4 dark:text-text4_dark text-lg"/>
                    مسدود کردن کاربر
                  </button>
                  <button
                    className="block flex flex-row items-center gap-2 w-full text-right px-2 py-4 text-sm text-text2 dark:text-text2_dark hover:bg-border dark:hover:bg-border_dark"
                    onClick={() => {
                      setMenuOpen(false);
                    }}
                  >
                    <HiOutlineEyeOff className="text-text4 dark:text-text4_dark text-lg"/>
                    پنهان کردن آیتم
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col w-full pt-6 px-4 gap-4">
          <p className="text-[16px] 2xl:text-[18px] font-['iransans-black-en'] text-warning line-clmp-1">
              <span className="text-text5 dark:text-text5_dark font-['iransans-md']">تعداد سکه : </span>
              {data?.number_coins?priceDigitSeperator(data?.number_coins):""}
          </p>
          <p className="text-[16px] 2xl:text-[18px] font-['iransans-md'] text-warning line-clmp-1">
              <span className="text-text5 dark:text-text5_dark font-['iransans-md']">اشتراک بازی : </span>
              {data?.active_subscription == true?"فعال":"غیر فعال"}
          </p>
          {
            data?.active_subscription == true&&
            <p className="text-[16px] 2xl:text-[18px] font-['iransans-md'] text-info line-clmp-1">
              <span className="text-text5 dark:text-text5_dark">تاریخ انقضای اشتراک : </span>
              {`( ${getTime(data?.subscription_expiration)}   ___  ${moment(data?.subscription_expiration).format("jYYYY/jMM/jDD")} )`}
            </p>
          }
          <p className="text-[16px] 2xl:text-[18px] font-['iransans-md'] text-info line-clmp-1">
              <span className="text-text5 dark:text-text5_dark">آخرین بازدید : </span>
              {
                data?.last_seen?
                `( ${getTime(data?.last_seen)}   ___  ${moment(data?.last_seen).format("jYYYY/jMM/jDD")} )`
                :data?.user_login_info?.length > 0&&
                `( ${getTime(data?.user_login_info[0]?.last_seen)}   ___  ${moment(data?.user_login_info[0]?.last_seen).format("jYYYY/jMM/jDD")} )`
              }
          </p>
          <p className="text-[16px] 2xl:text-[18px] font-['iransans-md'] text-info line-clmp-1">
              <span className="text-text5 dark:text-text5_dark">تاریخ عضویت در بازی : </span>
            {`( ${getTime(data?.createdAt)}   ___  ${moment(data?.createdAt).format("jYYYY/jMM/jDD")} )`}
          </p>
          {
            data?.last_seen_notifications&&
            <p className="text-[16px] 2xl:text-[18px] font-['iransans-md'] text-info line-clmp-1">
                <span className="text-text5 dark:text-text5_dark">آخرین بازدید از اعلانات : </span>
                {`( ${getTime(data?.last_seen_notifications)}   ___  ${moment(data?.last_seen_notifications).format("jYYYY/jMM/jDD")} )`}
            </p>
          }
          {
            data?.new_private_notifications > 0&&
            <p className="text-[16px] 2xl:text-[18px] font-['iransans-md'] text-text dark:text-text_dark line-clmp-1">
                <span className="text-text5 dark:text-text5_dark">تعداد اعلانات خصوصی خوانده نشده : </span>
                {data?.new_private_notifications}
            </p>
          }
          {
            data?.total_hidden_words > 0&&
            <p className="text-[16px] 2xl:text-[18px] font-['iransans-md'] text-text dark:text-text_dark line-clmp-1">
                <span className="text-text5 dark:text-text5_dark">کلمات پنهان ایجاد شده : </span>
                {data?.total_hidden_words}
            </p>
          }
          {
            data?.new_hidden_words > 0&&
            <p className="text-[16px] 2xl:text-[18px] font-['iransans-md'] text-text dark:text-text_dark line-clmp-1">
                <span className="text-text5 dark:text-text5_dark">کلمات پنهان جدید ایجاد شده : </span>
                {data?.new_hidden_words}
            </p>
          }
          {
            data?.last_logout_date&&
            <p className="text-[16px] 2xl:text-[18px] font-['iransans-md'] text-info line-clmp-1">
              <span className="text-text5 dark:text-text5_dark">آخرین خروج از حساب کاربری : </span>
              {`( ${getTime(data?.last_logout_date)}   ___  ${moment(data?.last_logout_date).format("jYYYY/jMM/jDD")} )`}
            </p>
          }
          {
            data?.number_open_app > 0&&
            <p className="text-[16px] 2xl:text-[18px] font-['iransans-md'] text-text dark:text-text_dark line-clmp-1">
                <span className="text-text5 dark:text-text5_dark">تعداد دفعات بازگشت به بازی ( با اینترنت ) : </span>
                {data?.number_open_app}
            </p>
          }
          <p className="text-[16px] 2xl:text-[18px] font-['iransans-md'] text-text dark:text-text_dark line-clmp-1 mt-6">{"اطلاعات کاربری"}</p>
          <p className="text-[16px] 2xl:text-[18px] font-['iransans-md'] text-text dark:text-text_dark line-clmp-1">
              <span className="text-text5 dark:text-text5_dark">شماره موبایل : </span>
              {data?.phone??""}
          </p>
          <p className="text-[16px] 2xl:text-[18px] font-['iransans-md'] text-text dark:text-text_dark line-clmp-1">
              <span className="text-text5 dark:text-text5_dark">نام : </span>
              {data?.first_name??""}
          </p>
          <p className="text-[16px] 2xl:text-[18px] font-['iransans-md'] text-text dark:text-text_dark line-clmp-1">
              <span className="text-text5 dark:text-text5_dark">نام خانوادگی : </span>
              {data?.last_name??""}
          </p>
          <p className="text-[16px] 2xl:text-[18px] font-['iransans-md'] text-text dark:text-text_dark line-clmp-1">
              <span className="text-text5 dark:text-text5_dark">جنسیت : </span>
              {data?.gender?getGender(data.gender):""}
          </p>
          <p className="text-[16px] 2xl:text-[18px] font-['iransans-md'] text-text dark:text-text_dark line-clmp-1">
              <span className="text-text5 dark:text-text5_dark">تاریخ تولد : </span>
            {data?.birthday?`${moment(data?.birthday).format("jYYYY/jMM/jDD")}`:""}
          </p>
          <p className="text-[16px] 2xl:text-[18px] font-['iransans-md'] text-text dark:text-text_dark line-clmp-1 mt-6">{"اطلاعات دستگاه"}</p>
          {
            data?.user_login_info?.map((item:any, index:number)=>(
              <div key={index.toString()} className="flex flex-col w-full bg-background2 dark:bg-background2_dark px-4 py-4 border border-primary rounded-md gap-2">
                <p className="text-[14px] 2xl:text-[16px] font-['iransans-md'] text-text dark:text-text_dark line-clmp-1">
                    {item?.active_session == true?"دستگاه فعال":"دستگاه غیر فعال"}
                </p>
                <p className="text-[14px] 2xl:text-[16px] font-['iransans-md-en'] text-text dark:text-text_dark line-clmp-1">
                    <span className="text-text5 dark:text-text5_dark">کد نسخه بازی : </span>
                    {item?.app_build_number??""}
                </p>
                <p className="text-[14px] 2xl:text-[16px] font-['iransans-md-en'] text-text dark:text-text_dark line-clmp-1">
                    <span className="text-text5 dark:text-text5_dark">نام نسخه بازی : </span>
                    {item?.app_version?`( ${item?.app_version} )`:""}
                </p>
                <p className="text-[14px] 2xl:text-[16px] font-['iransans-md'] text-text dark:text-text_dark line-clmp-1">
                    <span className="text-text5 dark:text-text5_dark">نوع نسخه بازی : </span>
                    {item?.build_type??""}
                </p>
                <p className="text-[14px] 2xl:text-[16px] font-['iransans-md'] text-text dark:text-text_dark line-clmp-1">
                    <span className="text-text5 dark:text-text5_dark">بازی نصب شده از : </span>
                    {item?.target_store??""}
                </p>
                <p className="text-[14px] 2xl:text-[16px] font-['iransans-md-en'] text-text dark:text-text_dark line-clmp-1">
                    <span className="text-text5 dark:text-text5_dark">برند دستگاه : </span>
                    {item?.device_brand??""}
                </p>
                <p className="text-[14px] 2xl:text-[16px] font-['iransans-md-en'] text-text dark:text-text_dark line-clmp-1">
                    <span className="text-text5 dark:text-text5_dark">مدل دستگاه : </span>
                    {item?.device_model??""}
                </p>
                <p className="text-[14px] 2xl:text-[16px] font-['iransans-md-en'] text-text dark:text-text_dark line-clmp-1">
                    <span className="text-text5 dark:text-text5_dark">نام دستگاه : </span>
                    {item?.device_name??""}
                </p>
                <p className="text-[14px] 2xl:text-[16px] font-['iransans-md-en'] text-text dark:text-text_dark line-clmp-1">
                    <span className="text-text5 dark:text-text5_dark">سیستم عامل : </span>
                    {item?.os??""}
                </p>
                <p className="text-[14px] 2xl:text-[16px] font-['iransans-md-en'] text-text dark:text-text_dark line-clmp-1">
                    <span className="text-text5 dark:text-text5_dark">نسخه سیستم عامل : </span>
                    {item?.os_version??""}
                </p>
                <p className="text-[14px] 2xl:text-[16px] font-['iransans-md'] text-text dark:text-text_dark line-clmp-1">
                    <span className="text-text5 dark:text-text5_dark">تاریخ ورود به حساب : </span>
                    {item?.login_date?`( ${getTime(item?.login_date)}   ___  ${moment(item?.login_date).format("jYYYY/jMM/jDD")} )`:""}
                </p>
                <p className="text-[14px] 2xl:text-[16px] font-['iransans-md'] text-text dark:text-text_dark line-clmp-1">
                    <span className="text-text5 dark:text-text5_dark">آخرین بازدید : </span>
                    {item?.last_seen?`( ${getTime(item?.last_seen)}   ___  ${moment(item?.last_seen).format("jYYYY/jMM/jDD")} )`:""}
                </p>
                <p className="text-[14px] 2xl:text-[16px] font-['iransans-md'] text-text dark:text-text_dark line-clmp-1">
                    <span className="text-text5 dark:text-text5_dark">تاریخ خروج از حساب : </span>
                    {item?.logout_date?`( ${getTime(item?.logout_date)}   ___  ${moment(item?.logout_date).format("jYYYY/jMM/jDD")} )`:""}
                </p>
                <p className="text-[14px] 2xl:text-[16px] font-['iransans-md-en'] text-text dark:text-text_dark line-clmp-1">
                    <span className="text-text5 dark:text-text5_dark">آی پی شبکه : </span>
                    {item?.ip_address??""}
                </p>
              </div>
            ))
          }
        </div>
      </div>
      <div className="flex flex-col w-full px-4">
        <p className="text-[16px] 2xl:text-[18px] font-['iransans-md'] text-text dark:text-text_dark line-clmp-1 mt-6">{"بازی مرحله‌ای و روند پیشرفت بازی"}</p>
        {
          data?.user_stage_game_progress?.stage_game?.length > 0&&
          <div className="flex flex-wrap items-center gap-12 mt-4">
          {data?.user_stage_game_progress?.stage_game?.map((item:any, index:number)=>(
            <div key={index.toString()} className="flex flex-row items-center gap-2">
                <ImageComponent
                  parentclasses="w-20 h-20 !rounded-xl"
                  imageClasses="!rounded-xl"
                  src={item?.language_info?.icon_image}
                />
                <div className="flex flex-col gap-2">
                  <p className="text-[16px] 2xl:text-[18px] font-['iransans-md'] text-info line-clmp-1">{`زبان ${item?.language_info?.name}`}</p>
                  <p className="text-[12px] 2xl:text-[14px] font-['iransans-md'] text-text4 dark:text-text4_dark line-clmp-1">{`فصل ${item?.last_season_number} - مرحله ${item?.last_stage_number}`}</p>
                </div>
            </div>
          ))}
          </div>
        }
        <div className="flex flex-col w-[220px] bg-background2 dark:bg-background2_dark px-4 py-2 border border-primary rounded-md gap-[2px] mt-4">
          <p className="text-[12px] 2xl:text-[14px] font-['iransans-md'] text-text dark:text-text_dark line-clmp-1">{"نسخهٔ محتوای بازی مرحله‌ای"}</p>
          <p className="text-[10px] 2xl:text-[12px] font-['iransans-md-en'] text-text4 dark:text-text4_dark line-clmp-1 text-end mt-2">{`version_created : ( ${data?.user_stage_game_progress?.version_created??""} )`}</p>
          <p className="text-[10px] 2xl:text-[12px] font-['iransans-md-en'] text-text4 dark:text-text4_dark line-clmp-1 text-end">{`version_updated : ( ${data?.user_stage_game_progress?.version_updated??""} )`}</p>
          <p className="text-[10px] 2xl:text-[12px] font-['iransans-md-en'] text-text4 dark:text-text4_dark line-clmp-1 text-end">{`version_deleted : ( ${data?.user_stage_game_progress?.version_deleted??""} )`}</p>
        </div>
          <p className="text-[16px] 2xl:text-[18px] font-['iransans-md'] text-text dark:text-text_dark line-clmp-1 mt-20">{"بسته‌های بازی و روند پیشرفت بازی"}</p>
          {
            data?.user_package_game?.length > 0&&
            <div className="flex flex-col gap-6 mt-4">
            {data?.user_package_game?.map((item:any, index:number)=>(
              <div key={index.toString()} className="flex flex-col bg-background2 dark:bg-background2_dark px-4 py-2 border border-primary rounded-md">
                <div className="flex flex-row items-center gap-2">
                  <ImageComponent
                    parentclasses="w-20 h-20 !rounded-xl"
                    imageClasses="!rounded-xl"
                    src={item?.package_info?.icon_image}
                  />
                  <div className="flex flex-col gap-2">
                    <p className="text-[16px] 2xl:text-[18px] font-['iransans-md'] text-info line-clmp-1">{`${item?.package_info?.title}`}</p>
                    <p className="text-[12px] 2xl:text-[14px] font-['iransans-md'] text-text4 dark:text-text4_dark line-clmp-1">{`نوع دسترسی : ${getAccessType(item.access_type, item?.number_coin_paid)}`}</p>
                  </div>
                </div>
                <p className="text-[14px] 2xl:text-[16px] font-['iransans-md'] text-text dark:text-text_dark line-clmp-1 mt-2">
                    <span className="text-text5 dark:text-text5_dark">تاریخ دریافت بازی : </span>
                    {item?.createdAt?`( ${getTime(item?.createdAt)}   ___  ${moment(item?.createdAt).format("jYYYY/jMM/jDD")} )`:""}
                </p>
                <p className="text-[14px] 2xl:text-[16px] font-['iransans-md'] text-text dark:text-text_dark line-clmp-1 mt-2">
                    <span className="text-text5 dark:text-text5_dark">پیشرفت بستهٔ بازی : </span>
                    {
                      item?.ended_game?`پایان بازی ( ${getTime(item?.ended_game)}   ___  ${moment(item?.ended_game).format("jYYYY/jMM/jDD")} )`:
                      (item?.last_season_number || item?.last_stage_number)?`فصل ${item?.last_season_number??""} - مرحله ${item?.last_stage_number??""}`
                      :"مرحله 1 - فصل 1"
                    }
                </p>
                <div className="flex flex-col mt-2">
                  <p className="text-[12px] 2xl:text-[14px] font-['iransans-md'] text-text dark:text-text_dark line-clmp-1">{"نسخهٔ بستهٔ بازی"}</p>
                  <p className="text-[10px] 2xl:text-[12px] font-['iransans-md-en'] text-text4 dark:text-text4_dark line-clmp-1 text-end mt-2">{`version_created : ( ${item?.version_created??""} )`}</p>
                  <p className="text-[10px] 2xl:text-[12px] font-['iransans-md-en'] text-text4 dark:text-text4_dark line-clmp-1 text-end">{`version_updated : ( ${item?.version_updated??""} )`}</p>
                  <p className="text-[10px] 2xl:text-[12px] font-['iransans-md-en'] text-text4 dark:text-text4_dark line-clmp-1 text-end">{`version_deleted : ( ${item?.version_deleted??""} )`}</p>
                </div>
              </div>
            ))}
            </div>
          }
      </div>
    </div>
  );
};

export default Page;
