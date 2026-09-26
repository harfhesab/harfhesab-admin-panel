"use client";

import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { BiTrash } from "react-icons/bi";
import ImageComponent from "@/components/ImageComponent";
import Input from "@/components/Input";
import TextAreaInput from "@/components/TextAreaInput";
import Footer from "@/components/Footer/Footer";
import Border from "@/components/Border";
import { Switch } from "@headlessui/react";
import GradientButton from "@/components/GradientButton";
import PackageListHelper from "@/components/PackageList/PackageListHelper";
import PackageList from "@/components/PackageList/PackageList";
import FreeCoinList from "@/components/FreeCoinList/FreeCoinList";
import FreeCoinListHelper from "@/components/FreeCoinList/FreeCoinListHelper";
import { FaCoins } from "react-icons/fa6";
import FreeSubscriptionList from "@/components/FreeSubscriptionList/FreeSubscriptionList";
import FreeSubscriptionListHelper from "@/components/FreeSubscriptionList/FreeSubscriptionListHelper";
import { IoDiamondSharp } from "react-icons/io5";
import {
  MdSettingsSuggest,
  MdVolumeUp,
  MdVolumeOff,
  MdVibration,
  MdNotificationsActive,
  MdTimer,
  MdPriorityHigh,
  MdLabel,
  MdImage,
  MdCategory,
  MdSmartphone,
  MdFingerprint,
  MdGroups,
} from "react-icons/md";
import Globals from "@/utils/Globals";
import HarfAkharList from "@/components/HarfAkharList/HarfAkharList";
import HarfAkharListHelper from "@/components/HarfAkharList/HarfAkharListHelper";

type HarfAkharSelectedInfo = {
  _id: string;
  title: string;
  image: string;
}
type PackageSelectedInfo = {
  _id: string;
  title: string;
  image: string;
};
type FreeCoinSelectedInfo = {
  _id: string;
  type: string;
  title: string;
  icon_image: string;
  number_coin: string;
};
type FreeSubscriptionSelectedInfo = {
  _id: string;
  type: string;
  title: string;
  icon_image: string;
  duration: string;
};

const toastOptions = () => ({
  position: "top-center" as const,
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  theme: (typeof window !== "undefined" && localStorage.getItem("theme") == "dark" ? "dark" : "light") as "dark" | "light",
});

const TTL_OPTIONS = [
  { label: "پیش‌فرض (28 روز)", value: "" },
  { label: "1 ساعت", value: String(60 * 60) },
  { label: "2 ساعت", value: String(2 * 60 * 60) },
  { label: "3 ساعت", value: String(3 * 60 * 60) },
  { label: "4 ساعت", value: String(4 * 60 * 60) },
  { label: "5 ساعت", value: String(5 * 60 * 60) },
  { label: "6 ساعت", value: String(6 * 60 * 60) },
  { label: "12 ساعت", value: String(12 * 60 * 60) },
  { label: "1 روز", value: String(24 * 60 * 60) },
  { label: "2 روز", value: String(2 * 24 * 60 * 60) },
  { label: "3 روز", value: String(3 * 24 * 60 * 60) },
  { label: "4 روز", value: String(4 * 24 * 60 * 60) },
  { label: "5 روز", value: String(5 * 24 * 60 * 60) },
  { label: "6 روز", value: String(6 * 24 * 60 * 60) },
  { label: "7 روز", value: String(7 * 24 * 60 * 60) },
  { label: "28 روز (حداکثر)", value: String(28 * 24 * 60 * 60) },
];

const SCREEN_OPTIONS = [
  { label: "بدون صفحه", value: "" },
  { label: "چالش حرف آخر", value: "HarfAkharInformation" },
  { label: "لیست چالش‌های حرف آخر", value: "HarfAkharBottomTab" },
  { label: "اطلاعات بستهٔ داستانی", value: "PackageInformation" },
  { label: "لیست اعلانات", value: "Notification" },
  { label: "لیست پیام‌ها", value: "MessageInApp" },
];

// در حال حاضر فقط یک تاپیک وجود دارد؛ افزودن تاپیک‌های جدید فقط با اضافه کردن یک آیتم به این آرایه انجام می‌شود.
const TOPIC_OPTIONS = [{ label: "تمام کاربران", value: "all_users" }];

const Page = () => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [harfAkharSelected, setHarfAkharSelected] = useState<HarfAkharSelectedInfo | null>(null)
  const [packageSelected, setPackageSelected] = useState<PackageSelectedInfo | null>(null);
  const [link, setLink] = useState("");
  const [freeCoinSelected, setFreeCoinSelected] = useState<FreeCoinSelectedInfo | null>(null);
  const [freeSubscriptionSelected, setFreeSubscriptionSelected] = useState<FreeSubscriptionSelectedInfo | null>(null);
  const [sendNotification, setSendNotification] = useState(false);
  const [description, setDescription] = useState("");

  // ---- تنظیمات پیشرفته نوتیفیکیشن (فقط وقتی sendNotification فعال است کاربرد دارند) ----
  const [notificationTopic, setNotificationTopic] = useState<string>(TOPIC_OPTIONS[0].value);
  const [notificationSound, setNotificationSound] = useState(true); // پیش‌فرض بک‌اند: فعال
  const [notificationVibration, setNotificationVibration] = useState(true); // پیش‌فرض بک‌اند: فعال
  const [notificationBadge, setNotificationBadge] = useState(false);
  const [notificationTtlSeconds, setNotificationTtlSeconds] = useState<string>("");
  const [notificationPriority, setNotificationPriority] = useState<string>(""); // "" = پیش‌فرض (high)
  const [notificationTag, setNotificationTag] = useState("");
  const [notificationImage, setNotificationImage] = useState("");
  const [dataType, setDataType] = useState("");
  const [dataScreen, setDataScreen] = useState("");
  const [dataItemId, setDataItemId] = useState("");

  const resetAdvancedNotificationSettings = () => {
    setNotificationTopic(TOPIC_OPTIONS[0].value);
    setNotificationSound(true);
    setNotificationVibration(true);
    setNotificationBadge(false);
    setNotificationTtlSeconds("");
    setNotificationPriority("");
    setNotificationTag("");
    setNotificationImage("");
    setDataType("");
    setDataScreen("");
    setDataItemId("");
  };

  const registerAndConfirm = () => {
    if (title.length == 0 || body.length == 0) {
      toast.error("ابتدا موارد الزامی را وارد کنید.", toastOptions());
    } else if (link.length > 0 && link.length <= 7) {
      toast.error("لینک وارد شده معتبر نمیباشد.", toastOptions());
    } else {
      checkedAndRegister();
    }
  };

  const checkedAndRegister = async () => {
    setLoading(true);
    let data = {
      query: `
          mutation registerNewPublicNotificationByAdmin(
            $title : String!,
            $body : String!,
            $link : String,
            $package : ID,
            $free_coin_plan : ID,
            $free_subscription_plan : ID,
            $admin_note : String,
            $send_notification : Boolean,
            $notification_topic: String,
            $notification_sound: Boolean,
            $notification_vibration: Boolean,
            $notification_badge: Boolean,
            $notification_ttl: Int,
            $notification_priority: String,
            $notification_tag: String,
            $notification_image: String,
            $data_type: String,
            $data_screen: String,
            $data_item_id: ID,
          ){
            registerNewPublicNotificationByAdmin(
              title : $title,
              body : $body,
              link : $link,
              package : $package,
              free_coin_plan : $free_coin_plan,
              free_subscription_plan : $free_subscription_plan,
              admin_note : $admin_note,
              send_notification : $send_notification,
              notification_topic : $notification_topic,
              notification_sound : $notification_sound,
              notification_vibration : $notification_vibration,
              notification_badge : $notification_badge,
              notification_ttl : $notification_ttl,
              notification_priority : $notification_priority,
              notification_tag : $notification_tag,
              notification_image : $notification_image,
              data_type : $data_type,
              data_screen : $data_screen,
              data_item_id : $data_item_id,
            ) {
              status,
              message,
            }
          }
          `,
      variables: {
        title: title,
        body: body,
        link: link?.length > 7 ? link : undefined,
        package: packageSelected?._id ? packageSelected._id : undefined,
        free_coin_plan: freeCoinSelected?._id ? freeCoinSelected._id : undefined,
        free_subscription_plan: freeSubscriptionSelected?._id ? freeSubscriptionSelected._id : undefined,
        admin_note: description?.length > 0 ? description : undefined,
        send_notification: sendNotification,
        notification_topic: notificationTopic?.length > 0 ? notificationTopic : undefined,
        notification_sound: sendNotification && notificationSound === false ? false : undefined,
        notification_vibration: sendNotification && notificationVibration === false ? false : undefined,
        notification_badge: sendNotification && notificationBadge === true ? true : undefined,
        notification_ttl: sendNotification && notificationTtlSeconds.length > 0 ? Number(notificationTtlSeconds) : undefined,
        notification_priority: sendNotification && notificationPriority.length > 0 ? notificationPriority : undefined,
        notification_tag: sendNotification && notificationTag.length > 0 ? notificationTag : undefined,
        notification_image: sendNotification && notificationImage.length > 0 ? notificationImage : undefined,
        data_type: sendNotification && dataType.length > 0 ? dataType : undefined,
        data_screen: sendNotification && dataScreen.length > 0 ? dataScreen : undefined,
        data_item_id: sendNotification && dataItemId.length > 0 ? dataItemId : undefined,
      },
    };
    await axios({
      url: "/",
      method: "post",
      data: data,
    })
      .then(async (response) => {
        setLoading(false);
        if (response.data?.data?.registerNewPublicNotificationByAdmin?.status == 200) {
          toast.success(response.data?.data?.registerNewPublicNotificationByAdmin?.message, { ...toastOptions(), autoClose: 3000 });
          setTitle("");
          setBody("");
          setLink("");
          setFreeCoinSelected(null);
          setFreeSubscriptionSelected(null);
          setDescription("");
          setSendNotification(false);
          setPackageSelected(null);
          resetAdvancedNotificationSettings();
        } else {
          toast.error((response.data?.errors[0]?.data[0]?.message || "مشکلی پیش آمد دوباره تلاش کنید"), { ...toastOptions(), autoClose: 3000 });
        }
      })
      .catch((e) => {
        toast.error("مشکلی پیش آمد دوباره تلاش کنید", { ...toastOptions(), autoClose: 3000 });
        setLoading(false);
      });
  };
  const selectHarfAkhar = () => {
    const previousSelected = harfAkharSelected ? {
      _id: [harfAkharSelected?._id],
      title: [harfAkharSelected?.title],
      image: [harfAkharSelected?.image],
    } : undefined;
    HarfAkharListHelper.openModal({
      previousSelected: previousSelected,
      numberSelected: 1,
      buttons: [
        { buttonText: "لغو", type: "border", onClickFn: () => { HarfAkharListHelper.closeModal(); } },
        {
          buttonText: "انتخاب چالش‌ها",
          type: "bold",
          onClickFn: ({ data }: { data: any }) => {
            setHarfAkharSelected({ _id: data._id[0], title: data.title[0], image: data.image[0] })
            setNotificationImage(`${Globals.uri}${data.image[0]}`)
            setDataItemId(data._id[0])
            HarfAkharListHelper.closeModal();
          },
        },
      ],
    });
    }
  const selectPackages = () => {
    const previousSelected = packageSelected
      ? {
          _id: [packageSelected?._id],
          title: [packageSelected?.title],
          image: [packageSelected?.image],
        }
      : undefined;
    PackageListHelper.openModal({
      previousSelected: previousSelected,
      numberSelected: 1,
      buttons: [
        { buttonText: "لغو", type: "border", onClickFn: () => { PackageListHelper.closeModal(); } },
        {
          buttonText: "انتخاب بسته‌ها",
          type: "bold",
          onClickFn: ({ data }: { data: any }) => {
            setPackageSelected({ _id: data._id[0], title: data.title[0], image: data.image[0] });
            setNotificationImage(`${data.image[0] ? `${Globals.uri}${data.image[0]}` : ""}`);
            setDataItemId(data._id[0]);
            PackageListHelper.closeModal();
          },
        },
      ],
    });
  };
  const deleteHarfAkharChallengeItem = () => { setHarfAkharSelected(null); };
  const deletePackageItem = () => { setPackageSelected(null); };

  const selectFreeCoinPlan = () => {
    const previousSelected = freeCoinSelected
      ? {
          _id: [freeCoinSelected?._id],
          type: [freeCoinSelected?.type],
          title: [freeCoinSelected?.title],
          icon_image: [freeCoinSelected?.icon_image],
          number_coin: [freeCoinSelected?.number_coin],
        }
      : undefined;
    FreeCoinListHelper.openModal({
      previousSelected: previousSelected,
      numberSelected: 1,
      buttons: [
        { buttonText: "لغو", type: "border", onClickFn: () => { FreeCoinListHelper.closeModal(); } },
        {
          buttonText: "انتخاب سکه رایگان",
          type: "bold",
          onClickFn: ({ data }: { data: any }) => {
            setFreeCoinSelected({ _id: data._id[0], type: data.type[0], title: data.title[0], icon_image: data.icon_image[0], number_coin: data.number_coin[0] });
            setNotificationImage(`${data.image[0] ? `${Globals.uri}${data.image[0]}` : ""}`);
            setDataItemId(data._id[0]);
            FreeCoinListHelper.closeModal();
          },
        },
      ],
    });
  };
  const deleteFreeCoinPlan = () => { setFreeCoinSelected(null); };

  const selectFreeSubscriptionPlan = () => {
    const previousSelected = freeSubscriptionSelected
      ? {
          _id: [freeSubscriptionSelected?._id],
          type: [freeSubscriptionSelected?.type],
          title: [freeSubscriptionSelected?.title],
          icon_image: [freeSubscriptionSelected?.icon_image],
          duration: [freeSubscriptionSelected?.duration],
        }
      : undefined;
    FreeSubscriptionListHelper.openModal({
      previousSelected: previousSelected,
      numberSelected: 1,
      buttons: [
        { buttonText: "لغو", type: "border", onClickFn: () => { FreeSubscriptionListHelper.closeModal(); } },
        {
          buttonText: "انتخاب اشتراک رایگان",
          type: "bold",
          onClickFn: ({ data }: { data: any }) => {
            setFreeSubscriptionSelected({ _id: data._id[0], type: data.type[0], title: data.title[0], icon_image: data.icon_image[0], duration: data.duration[0] });
            setNotificationImage(`${data.image[0] ? `${Globals.uri}${data.image[0]}` : ""}`);
            setDataItemId(data._id[0]);
            FreeSubscriptionListHelper.closeModal();
          },
        },
      ],
    });
  };
  const deleteFreeSubscriptionPlan = () => { setFreeSubscriptionSelected(null); };

  // ---- کامپوننت کوچکِ سوییچِ تنظیمات پیشرفته (برای جلوگیری از تکرار) ----
  const AdvancedToggleRow = ({
    icon,
    label,
    description,
    checked,
    onChange,
  }: {
    icon: React.ReactNode;
    label: string;
    description: string;
    checked: boolean;
    onChange: () => void;
  }) => (
    <div
      className="flex items-center justify-between gap-3 rounded-lg border border-border dark:border-border_dark bg-background dark:bg-background_dark px-3 py-3 cursor-pointer sm:hover:border-info transition-colors"
      onClick={onChange}
    >
      <div className="flex items-center gap-2.5">
        <div className={`flex items-center justify-center w-8 h-8 rounded-md shrink-0 transition-colors ${checked ? "bg-info/15 text-info" : "bg-border2 dark:bg-border2_dark text-text5 dark:text-text5_dark"}`}>
          {icon}
        </div>
        <div>
          <p className="text-[13px] font-['iransans-md'] text-text dark:text-text_dark">{label}</p>
          <p className="text-[11px] font-['iransans-md'] text-text5 dark:text-text5_dark">{description}</p>
        </div>
      </div>
      <Switch
        checked={checked}
        onChange={onChange}
        onClick={(e) => e.stopPropagation()}
        className={`${checked ? "bg-rgba2" : "bg-border dark:bg-border_dark"}
relative h-[19px] w-[33px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out flex items-center`}
      >
        <span
          aria-hidden="true"
          className={`${checked ? "translate-x-2 bg-primary" : "-translate-x-[16px] bg-text5 dark:bg-text5_dark"}
pointer-events-none inline-block h-[22px] w-[22px] transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out`}
        />
      </Switch>
    </div>
  );

  return (
    <div className="flex flex-col justify-between w-full lg:w-[600px] 2xl:w-[750px] mt-10 mb-28 px-4 sm:mx-auto">
      <div className="mt-12">
        <label className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.85rem] sm:text-[.95rem] cursor-pointer py-3" htmlFor="notification-topic">
          <span className="flex items-center gap-1.5 mb-1.5">
            <MdGroups size={16} className="text-info" />
            گروه هدف (Topic)
          </span>
          <select
            id="notification-topic"
            value={notificationTopic}
            onChange={(e) => setNotificationTopic(e.target.value)}
            className="w-full h-[42px] px-3 rounded-md border border-border dark:border-border_dark bg-background dark:bg-background_dark text-text dark:text-text_dark text-[13px] font-['iransans-md'] outline-none focus:border-info transition-colors cursor-pointer"
          >
            {TOPIC_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-6">
        <label className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.85rem] sm:text-[.95rem] cursor-pointer py-3" htmlFor="name-stage-season">
          عنوان اعلان
          <span className="text-red-500 px-1">*</span>
          <div className={`mt-1 flex gap-2 w-full items-center justify-between`}>
            <Input id="name-stage-season" value={title} changeState={setTitle} classes="flex-1" inputStyles="!text-base" />
          </div>
        </label>
      </div>
      <div className="mt-6">
        <label className="text-right lg:w-2/3 w-5/6 xl:w-3/5 2xl:w-1/2 text-text6 dark:text-text6_dark cursor-pointer font-iransans-md text-sm" htmlFor="description-stage-season">
          متن اعلان
          <span className="text-red-500 px-1">*</span>
          <TextAreaInput id={"body-public-notification"} value={body} changeState={(e: any) => setBody(e)} textAreaStyles="!text-sm mt-1" rows={4} />
        </label>
      </div>

      {/* ---- سوییچ ارسال نوتیفیکیشن ---- */}
      <div
        className="py-4 cursor-pointer sm:hover:bg-border2 dark:sm:hover:bg-border2_dark transition select-none"
        onClick={() => setSendNotification((last) => !last)}
      >
        <div className="flex items-center justify-between w-full h-[42px] pl-2 rounded">
          <label className={`text-sm font-['iransans-md'] cursor-pointer`}>
            <h3 className="text-text dark:text-text_dark font-['iransans-md'] text-[15px]">
              نوتیفیکیشن ارسال شود
            </h3>
          </label>
          <Switch
            checked={sendNotification}
            onChange={() => setSendNotification((last) => !last)}
            onClick={(e) => e.stopPropagation()}
            className={`${sendNotification ? "bg-rgba2" : "bg-border dark:bg-border_dark"}
relative h-[19px] w-[33px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out flex items-center`}
          >
            <span
              aria-hidden="true"
              className={`${sendNotification ? "translate-x-2 bg-primary" : "-translate-x-[16px] bg-text5 dark:bg-text5_dark"}
pointer-events-none inline-block h-[22px] w-[22px] transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out`}
            />
          </Switch>
        </div>
        <p className="text-justify font-['iransans-md'] text-text5 dark:text-text5_dark text-[12px] sm:text-[14px] mb-1">
          با فعال بودن این گزینه، نوتیفیکیشن به تمام کاربران گروه انتخاب‌شده ارسال خواهد شد.
        </p>
      </div>

      {/* ---- پنل تنظیمات پیشرفته نوتیفیکیشن (فقط وقتی send_notification فعال است) ---- */}
      {sendNotification && (
        <div className="mb-2 border border-info/40 dark:border-info/40 bg-gradient-to-b from-info/[0.06] to-transparent dark:from-info/[0.08] rounded-xl p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-info/15 text-info">
              <MdSettingsSuggest size={20} />
            </div>
            <div>
              <h3 className="text-[14px] font-['iransans-md'] text-text dark:text-text_dark">تنظیمات پیشرفته نوتیفیکیشن</h3>
              <p className="text-[11px] font-['iransans-md'] text-text5 dark:text-text5_dark">در صورت خالی گذاشتن هر مورد، مقدار پیش‌فرض سیستم اعمال می‌شود</p>
            </div>
          </div>

          {/* سوییچ‌ها */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <AdvancedToggleRow
              icon={notificationSound ? <MdVolumeUp size={17} /> : <MdVolumeOff size={17} />}
              label="پخش صدا"
              description="صدای پیش‌فرض دستگاه"
              checked={notificationSound}
              onChange={() => setNotificationSound((v) => !v)}
            />
            <AdvancedToggleRow
              icon={<MdVibration size={17} />}
              label="لرزش"
              description="ویبره هنگام دریافت"
              checked={notificationVibration}
              onChange={() => setNotificationVibration((v) => !v)}
            />
            <AdvancedToggleRow
              icon={<MdNotificationsActive size={17} />}
              label="نمایش بج (Badge)"
              description="عدد روی آیکون اپلیکیشن"
              checked={notificationBadge}
              onChange={() => setNotificationBadge((v) => !v)}
            />
          </div>

          {/* اولویت و TTL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            <label className="font-['iransans-md'] text-right text-text6 dark:text-text6_dark text-[13px]">
              <span className="flex items-center gap-1.5 mb-1.5">
                <MdPriorityHigh size={15} className="text-info" />
                اولویت ارسال
              </span>
              <select
                value={notificationPriority}
                onChange={(e) => setNotificationPriority(e.target.value)}
                className="w-full h-[42px] px-3 rounded-md border border-border dark:border-border_dark bg-background dark:bg-background_dark text-text dark:text-text_dark text-[13px] font-['iransans-md'] outline-none focus:border-info transition-colors cursor-pointer"
              >
                <option value="">پیش‌فرض (بالا)</option>
                <option value="high">بالا (High)</option>
                <option value="normal">عادی (Normal)</option>
              </select>
            </label>

            <label className="font-['iransans-md'] text-right text-text6 dark:text-text6_dark text-[13px]" htmlFor="notification-ttl">
              <span className="flex items-center gap-1.5 mb-1.5">
                <MdTimer size={15} className="text-info" />
                مدت اعتبار پیام
              </span>
              <select
                id="notification-ttl"
                value={notificationTtlSeconds}
                onChange={(e) => setNotificationTtlSeconds(e.target.value)}
                className="w-full h-[42px] px-3 rounded-md border border-border dark:border-border_dark bg-background dark:bg-background_dark text-text dark:text-text_dark text-[13px] font-['iransans-md'] outline-none focus:border-info transition-colors cursor-pointer"
              >
                {TTL_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </label>
          </div>

          {/* تگ و تصویر */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <label className="font-['iransans-md'] text-right text-text6 dark:text-text6_dark text-[13px]" htmlFor="notification-tag">
              <span className="flex items-center gap-1.5 mb-1.5">
                <MdLabel size={15} className="text-info" />
                برچسب (Tag)
              </span>
              <Input
                id="notification-tag"
                value={notificationTag}
                changeState={setNotificationTag}
                classes="w-full"
                inputStyles="!text-sm !h-[42px]"
                placeholder="مثال: promo_2024"
              />
            </label>

            <label className="font-['iransans-md'] text-right text-text6 dark:text-text6_dark text-[13px]" htmlFor="notification-image">
              <span className="flex items-center gap-1.5 mb-1.5">
                <MdImage size={15} className="text-info" />
                آدرس تصویر نوتیفیکیشن
              </span>
              <div className="flex flex-row items-center gap-2">
                <Input
                  id="notification-image"
                  value={notificationImage}
                  changeState={setNotificationImage}
                  classes="w-full"
                  inputStyles="!text-sm !h-[42px]"
                  placeholder="https://..."
                />
                {
                  notificationImage?.length > 10 && (notificationImage.includes("http://") || notificationImage.includes("https://")) &&
                  <ImageComponent src={notificationImage} baseURI={false} alt={"file_photos"} parentclasses="h-[40px] w-[40px] cursor-pointer" />
                }
              </div>
            </label>
          </div>

          {/* دیتای دیپ‌لینک */}
          <div className="mt-4 pt-4 border-t border-dashed border-border dark:border-border_dark">
            <p className="text-[12px] font-['iransans-md'] text-text5 dark:text-text5_dark mb-2.5">
              مسیر هدایت کاربر پس از لمس نوتیفیکیشن (اختیاری)
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="font-['iransans-md'] text-right text-text6 dark:text-text6_dark text-[13px]" htmlFor="data-type">
                <span className="flex items-center gap-1.5 mb-1.5">
                  <MdCategory size={15} className="text-info" />
                  نوع (type)
                </span>
                <Input id="data-type" value={dataType} changeState={setDataType} classes="w-full" inputStyles="!text-sm !h-[42px]" placeholder="مثال: package" />
              </label>

              <label className="font-['iransans-md'] text-right text-text6 dark:text-text6_dark text-[13px]" htmlFor="data-screen">
                <span className="flex items-center gap-1.5 mb-1.5">
                  <MdSmartphone size={15} className="text-info" />
                  صفحه (screen)
                </span>
                <select
                  id="data-screen"
                  value={dataScreen}
                  onChange={(e) => setDataScreen(e.target.value)}
                  className="w-full h-[42px] px-3 rounded-md border border-border dark:border-border_dark bg-background dark:bg-background_dark text-text dark:text-text_dark text-[13px] font-['iransans-md'] outline-none focus:border-info transition-colors cursor-pointer"
                >
                  {SCREEN_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>

              <label className="font-['iransans-md'] text-right text-text6 dark:text-text6_dark text-[13px]" htmlFor="data-item-id">
                <span className="flex items-center gap-1.5 mb-1.5">
                  <MdFingerprint size={15} className="text-info" />
                  شناسه آیتم (ID)
                </span>
                <Input id="data-item-id" value={dataItemId} changeState={setDataItemId} classes="w-full" inputStyles="!text-sm !h-[42px]" placeholder="مثال: 64f1a2..." />
              </label>
            </div>
          </div>
        </div>
      )}

      <Border />
      <div className="mt-12">
        <GradientButton
          buttonText={"انتخاب چالش حرف آخر"}
          onClickFn={selectHarfAkhar}
          loading={false}
          classes="!text-sm !flex-none !px-8 sm:!w-[300px] !w-full"
        />
      </div>
      {harfAkharSelected && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-12 gap-x-2 sm:gap-y-12 sm:gap-x-2 mt-4 border-2 border-dashed border-primary dark:border-primary rounded-md p-4">
          <div className="flex flex-col items-center gap-2 bg-background3 dark:bg-background3_dark border border-dashed border-info dark:border-info rounded-md py-4">
            <div className="relative w-[90%] h-22 3xs:h-24 sm:h-32 cursor-pointer">
              {
                harfAkharSelected?.image&&
                <ImageComponent src={harfAkharSelected.image} alt={"file_photos"} parentclasses="h-full w-full cursor-pointer" />
              }
              <div className="absolute top-0 w-full flex justify-between px-1 pt-1">
                <div
                  onClick={(e: any) => { e.stopPropagation(); deleteHarfAkharChallengeItem(); }}
                  className="flex justify-center items-center rounded transition text-white bg-[#00000099] sm:hover:bg-[#33333370] text-lg w-6 h-6"
                >
                  <BiTrash />
                </div>
              </div>
            </div>
            <p className="text-xs text-center font-['iransans-md'] text-text dark:text-text_dark w-22 sm:w-32 3xs:w-24 h-8">{harfAkharSelected.title}</p>
          </div>
        </div>
      )}
      <div className="mt-12">
        <GradientButton
          buttonText={"انتخاب بسته و پکیج"}
          onClickFn={selectPackages}
          loading={false}
          classes="!text-sm !flex-none !px-8 sm:!w-[300px] !w-full"
        />
      </div>
      {packageSelected && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-12 gap-x-2 sm:gap-y-12 sm:gap-x-2 mt-4 border-2 border-dashed border-primary dark:border-primary rounded-md p-4">
          <div className="flex flex-col items-center gap-2 bg-background3 dark:bg-background3_dark border border-dashed border-info dark:border-info rounded-md py-4">
            <div className="relative w-[90%] h-22 3xs:h-24 sm:h-32 cursor-pointer">
              <ImageComponent src={packageSelected.image} alt={"file_photos"} parentclasses="h-full w-full cursor-pointer" />
              <div className="absolute top-0 w-full flex justify-between px-1 pt-1">
                <div
                  onClick={(e: any) => { e.stopPropagation(); deletePackageItem(); }}
                  className="flex justify-center items-center rounded transition text-white bg-[#00000099] sm:hover:bg-[#33333370] text-lg w-6 h-6"
                >
                  <BiTrash />
                </div>
              </div>
            </div>
            <p className="text-xs text-center font-['iransans-md'] text-text dark:text-text_dark w-22 sm:w-32 3xs:w-24 h-8">{packageSelected.title}</p>
          </div>
        </div>
      )}
      <div className="mt-12">
        <GradientButton
          buttonText={"دادن سکه رایگان"}
          onClickFn={selectFreeCoinPlan}
          loading={false}
          classes="!text-sm !flex-none !px-8 sm:!w-[300px] !w-full"
        />
      </div>
      {freeCoinSelected && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-12 gap-x-2 sm:gap-y-12 sm:gap-x-2 mt-4 border-2 border-dashed border-primary dark:border-primary rounded-md p-4">
          <div className="flex flex-col gap-y-4 items-center bg-background3 dark:bg-background3_dark border border-dashed border-info dark:border-info rounded-md py-2">
            <div className="relative w-[90%] h-22 3xs:h-24 sm:h-32 cursor-pointer">
              {freeCoinSelected?.icon_image ? (
                <ImageComponent src={freeCoinSelected?.icon_image} alt={"file_photos"} parentclasses="h-full w-full cursor-pointer" />
              ) : (
                <div className="p-6">
                  <FaCoins className="h-full w-full cursor-pointer text-warning" />
                </div>
              )}
              <div className="absolute top-0 w-full flex justify-between px-1 pt-1">
                <div
                  onClick={(e: any) => { e.stopPropagation(); deleteFreeCoinPlan(); }}
                  className="flex justify-center items-center rounded transition text-white bg-[#00000099] sm:hover:bg-[#33333370] text-lg w-6 h-6"
                >
                  <BiTrash />
                </div>
              </div>
            </div>
            <p className="text-xs text-center font-['iransans-md'] text-text dark:text-text_dark w-22 sm:w-32 3xs:w-24">{freeCoinSelected?.title}</p>
            <p className="text-xs text-center font-['iransans-md'] text-info w-22 sm:w-32 3xs:w-24">{freeCoinSelected?.type == "private" ? "( آیتم خصوصی )" : freeCoinSelected?.type == "public" ? "( آیتم عمومی )" : ""}</p>
            <p className="text-[18px] text-center font-['iransans-black-en'] text-warning w-22 sm:w-32 3xs:w-24">{`${freeCoinSelected?.number_coin} سکه`}</p>
          </div>
        </div>
      )}
      <div className="mt-12">
        <GradientButton
          buttonText={"دادن اشتراک رایگان"}
          onClickFn={selectFreeSubscriptionPlan}
          loading={false}
          classes="!text-sm !flex-none !px-8 sm:!w-[300px] !w-full"
        />
      </div>
      {freeSubscriptionSelected && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-12 gap-x-2 sm:gap-y-12 sm:gap-x-2 mt-4 border-2 border-dashed border-primary dark:border-primary rounded-md p-4">
          <div className="flex flex-col gap-y-4 items-center bg-background3 dark:bg-background3_dark border border-dashed border-info dark:border-info rounded-md py-2">
            <div className="relative w-[90%] h-22 3xs:h-24 sm:h-32 cursor-pointer">
              {freeSubscriptionSelected?.icon_image ? (
                <ImageComponent src={freeSubscriptionSelected?.icon_image} alt={"file_photos"} parentclasses="h-full w-full cursor-pointer" />
              ) : (
                <div className="p-6">
                  <IoDiamondSharp className="h-full w-full cursor-pointer text-info" />
                </div>
              )}
              <div className="absolute top-0 w-full flex justify-between px-1 pt-1">
                <div
                  onClick={(e: any) => { e.stopPropagation(); deleteFreeSubscriptionPlan(); }}
                  className="flex justify-center items-center rounded transition text-white bg-[#00000099] sm:hover:bg-[#33333370] text-lg w-6 h-6"
                >
                  <BiTrash />
                </div>
              </div>
            </div>
            <p className="text-xs text-center font-['iransans-md'] text-text dark:text-text_dark w-22 sm:w-32 3xs:w-24">{freeSubscriptionSelected?.title}</p>
            <p className="text-xs text-center font-['iransans-md'] text-info w-22 sm:w-32 3xs:w-24">{freeSubscriptionSelected?.type == "private" ? "( آیتم خصوصی )" : freeSubscriptionSelected?.type == "public" ? "( آیتم عمومی )" : ""}</p>
            <p className="text-[18px] text-center font-['iransans-black-en'] text-warning w-22 sm:w-32 3xs:w-24">{`${freeSubscriptionSelected?.duration} روز`}</p>
          </div>
        </div>
      )}
      <div className="mt-6">
        <label className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.85rem] sm:text-[.95rem] cursor-pointer py-3" htmlFor="collection-banner-link">
          آدرس لینک
          <div className={`mt-1 flex gap-2 w-full items-center justify-between`}>
            <Input id="collection-banner-link" value={link} changeState={setLink} classes="flex-1" inputStyles="!text-base" />
          </div>
        </label>
      </div>
      <div className="mt-6">
        <label className="text-right lg:w-2/3 w-5/6 xl:w-3/5 2xl:w-1/2 text-text6 dark:text-text6_dark cursor-pointer font-iransans-md text-sm" htmlFor="description-stage-season">
          یادداشت ادمین
          <TextAreaInput id={"description-stage-season"} value={description} changeState={(e: any) => setDescription(e)} textAreaStyles="!text-sm mt-1" rows={4} />
        </label>
      </div>
      <Footer buttonFn={registerAndConfirm} buttonText="ارسال اعلان عمومی" loadingButton={loading} classes="md:!mr-72 !justify-end" />
      <PackageList ref={(Ref) => { PackageListHelper.setRef(Ref); }} />
      <HarfAkharList ref={(Ref) => { HarfAkharListHelper.setRef(Ref); }} />
      <FreeCoinList ref={(Ref) => { FreeCoinListHelper.setRef(Ref); }} />
      <FreeSubscriptionList ref={(Ref) => { FreeSubscriptionListHelper.setRef(Ref); }} />
    </div>
  );
};

export default Page;