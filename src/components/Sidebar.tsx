"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import SideBarItem from "./SideBarItem";
import { AiFillDashboard } from "react-icons/ai";
import { RiApps2Fill, RiBook2Fill } from "react-icons/ri";
import { TbCoins, TbDiaboloPlus, TbHexagonalPrismPlus, TbBellPlus, TbMessagePlus, TbListSearch, TbSettings, TbDropletPlus, TbTagPlus, TbSearch, TbListDetails  } from "react-icons/tb";
import { FaCoins, FaDiceD6, FaUsers } from "react-icons/fa6";
import { BsCloudPlus, BsCloudPlusFill } from "react-icons/bs";
import { LuClipboardList } from "react-icons/lu";
import { MdListAlt, MdPayments } from "react-icons/md";
import { IoDiamondOutline, IoDiamondSharp, IoTrailSign, IoTrailSignOutline, IoNotifications, IoMail } from "react-icons/io5";

const navigation: any = [
  {
    name: "داشبورد",
    href: "/dashboard/home",
    icon: (
      <div className="text-xl">
        <AiFillDashboard />
      </div>
    ),
    head:true
  },
  {
    name: "مدیریت کاربران",
    href: "/dashboard/users",
    icon: (
      <div className="text-xl">
        <FaUsers />
      </div>
    ),
    head:true,
    children: [
      {
        name: "لیست کاربران",
        href: "/user-list",
      },
    ],
  },
  {
    name: "مدیریت اعلانات",
    href: "/dashboard/notification-management",
    icon: (
      <div className="text-xl">
        <IoNotifications />
      </div>
    ),
    head:true,
    children: [
      {
        name: "ارسال اعلان عمومی",
        href: "/send-public-notification",
        icon: (
          <div className="text-xl">
            <TbBellPlus />
          </div>
        ),
      },
      {
        name: "لیست اعلان‌های عمومی",
        href: "/public-notification-list",
        icon: (
          <div className="text-xl">
            <TbListSearch />
          </div>
        ),
      },
      {
        name: "ارسال اعلان خصوصی",
        href: "/send-private-notification",
        icon: (
          <div className="text-xl">
            <TbBellPlus />
          </div>
        ),
      },
      {
        name: "لیست اعلان‌های خصوصی",
        href: "/private-notification-list",
        icon: (
          <div className="text-xl">
            <TbListSearch />
          </div>
        ),
      },
    ],
  },
  {
    name: "مدیریت پیام‌ها",
    href: "/dashboard/message-management",
    icon: (
      <div className="text-xl">
        <IoMail />
      </div>
    ),
    head:true,
    children: [
      {
        name: "ارسال پیام عمومی",
        href: "/send-public-message",
        icon: (
          <div className="text-xl">
            <TbMessagePlus />
          </div>
        ),
      },
      {
        name: "لیست پیام‌های عمومی",
        href: "/public-message-list",
        icon: (
          <div className="text-xl">
            <TbListSearch />
          </div>
        ),
      },
      {
        name: "ارسال پیام خصوصی",
        href: "/send-private-message",
        icon: (
          <div className="text-xl">
            <TbMessagePlus />
          </div>
        ),
      },
      {
        name: "لیست پیام‌های خصوصی",
        href: "/private-message-list",
        icon: (
          <div className="text-xl">
            <TbListSearch />
          </div>
        ),
      },
    ],
  },
  {
    name: "ثبت محتوای بازی مرحله‌ای",
    href: "/dashboard/stage-game",
    icon: (
      <div className="text-xl">
        <FaDiceD6 />
      </div>
    ),
    head:true,
    children: [
      {
        name: "تنظیمات بازی مرحله‌ای",
        href: "/setting",
        icon: (
          <div className="text-xl">
            <TbSettings />
          </div>
        ),
      },
      {
        name: "ثبت فصل جدید",
        href: "/register-new-season",
        icon: (
          <div className="text-xl">
            <TbHexagonalPrismPlus />
          </div>
        ),
      },
      {
        name: "ثبت مرحله جدید",
        href: "/register-new-stage",
        icon: (
          <div className="text-xl">
            <TbHexagonalPrismPlus />
          </div>
        ),
      },
    ],
  },
  {
    name: "مدیریت محتوای بازی مرحله‌ای",
    href: "/dashboard/manage-stage-game",
    icon: (
      <div className="text-xl">
        <FaDiceD6 />
      </div>
    ),
    head:true,
    children: [
      {
        name: "لیست فصل‌ها",
        href: "/season-list",
        icon: (
          <div className="text-xl">
            <LuClipboardList />
          </div>
        ),
      },
      {
        name: "لیست مراحل",
        href: "/stage-list",
        icon: (
          <div className="text-xl">
            <LuClipboardList />
          </div>
        ),
      },
    ],
  },
  {
    name: "ثبت محتوای پکیج‌های بازی",
    href: "/dashboard/package-game",
    icon: (
      <div className="text-xl">
        <RiApps2Fill />
      </div>
    ),
    head:true,
    children: [
      {
        name: "ثبت پکیج بازی جدید",
        href: "/register-new-package-game",
        icon: (
          <div className="text-xl">
            <TbDiaboloPlus />
          </div>
        ),
      },
      {
        name: "ثبت فصل جدید",
        href: "/register-new-season",
        icon: (
          <div className="text-xl">
            <TbDiaboloPlus />
          </div>
        ),
      },
      {
        name: "ثبت مرحله جدید",
        href: "/register-new-stage",
        icon: (
          <div className="text-xl">
            <TbDiaboloPlus />
          </div>
        ),
      },
      {
        name: "افزودن کالکشن جدید",
        href: "/add-collection",
        icon: (
          <div className="text-xl">
            <TbDiaboloPlus />
          </div>
        ),
      },
      {
        name: "افزودن بنر جدید",
        href: "/add-banner-to-collection",
        icon: (
          <div className="text-xl">
            <TbDiaboloPlus />
          </div>
        ),
      },
    ],
  },
  {
    name: "مدیریت محتوای پکیج‌های بازی",
    href: "/dashboard/manage-package-game",
    icon: (
      <div className="text-xl">
        <RiApps2Fill />
      </div>
    ),
    head:true,
    children: [
      {
        name: "لیست پکیج‌ها",
        href: "/package-list",
        icon: (
          <div className="text-xl">
            <LuClipboardList />
          </div>
        ),
      },
      {
        name: "لیست فصل‌ها",
        href: "/season-list",
        icon: (
          <div className="text-xl">
            <LuClipboardList />
          </div>
        ),
      },
      {
        name: "لیست مراحل",
        href: "/stage-list",
        icon: (
          <div className="text-xl">
            <LuClipboardList />
          </div>
        ),
      },
      {
        name: "لیست کالکش‌ها",
        href: "/collection-list",
        icon: (
          <div className="text-xl">
            <LuClipboardList />
          </div>
        ),
      },
    ],
  },
  {
    name: "ثبت محتوای عمومی",
    href: "/dashboard/general",
    icon: (
      <div className="text-xl">
        <BsCloudPlusFill />
      </div>
    ),
    head:true,
    children: [
      {
        name: "تعریف زبان",
        href: "/add-language",
        icon: (
          <div className="text-xl">
            <BsCloudPlus />
          </div>
        ),
      },
      {
        name: "تعریف دسته‌بندی موضوع",
        href: "/add-topic-category",
        icon: (
          <div className="text-xl">
            <BsCloudPlus />
          </div>
        ),
      },
    ],
  },
  {
    name: "مدیریت سکه",
    href: "/dashboard/coin",
    icon: (
      <div className="text-xl">
        <FaCoins />
      </div>
    ),
    head:true,
    children: [
      {
        name: "تعریف آیتم جدید سکه",
        href: "/coin-plan-definition",
        icon: (
          <div className="text-xl">
            <TbCoins />
          </div>
        ),
      },
      {
        name: "تعریف آیتم جدید سکه رایگان",
        href: "/free-coin-plan-definition",
        icon: (
          <div className="text-xl">
            <TbCoins />
          </div>
        ),
      },
      {
        name: "لیست آیتم‌های سکه",
        href: "/coin-plan-list",
        icon: (
          <div className="text-xl">
            <MdListAlt />
          </div>
        ),
      },
      {
        name: "پرداخت‌های خرید سکه",
        href: "/coin-purchase-payment-list",
        icon: (
          <div className="text-xl">
            <MdPayments />
          </div>
        ),
      },
    ],
  },
  {
    name: "مدیریت اشتراک",
    href: "/dashboard/subscription",
    icon: (
      <div className="text-xl">
        <IoDiamondSharp />
      </div>
    ),
    head:true,
    children: [
      {
        name: "تعریف آیتم جدید اشتراک",
        href: "/subscription-plan-definition",
        icon: (
          <div className="text-xl">
            <IoDiamondOutline />
          </div>
        ),
      },
      {
        name: "تعریف آیتم جدید اشتراک رایگان",
        href: "/free-subscription-plan-definition",
        icon: (
          <div className="text-xl">
            <IoDiamondOutline />
          </div>
        ),
      },
      {
        name: "لیست آیتم‌های اشتراک",
        href: "/subscription-plan-list",
        icon: (
          <div className="text-xl">
            <MdListAlt />
          </div>
        ),
      },
      {
        name: "پرداخت‌های اشتراک",
        href: "/subscription-payment-list",
        icon: (
          <div className="text-xl">
            <MdPayments />
          </div>
        ),
      },
      {
        name: "لیست اشتراک‌های کاربران",
        href: "/user-subscription-list",
        icon: (
          <div className="text-xl">
            <LuClipboardList />
          </div>
        ),
      },
    ],
  },
  {
    name: "بازی آنلاین",
    href: "/dashboard/online-game",
    icon: (
      <div className="text-xl">
        <IoTrailSign />
      </div>
    ),
    head:true,
    children: [
      {
        name: "تعریف بازی جدید",
        href: "/online-game-definition",
        icon: (
          <div className="text-xl">
            <IoTrailSignOutline />
          </div>
        ),
      },
    ],
  },
  {
    name: "حرف آخر",
    href: "/dashboard/harf-akhar",
    icon: (
      <div className="text-xl">
        <IoTrailSign />
      </div>
    ),
    head:true,
    children: [
      {
        name: "ثبت چالش جدید",
        href: "/register-harf-akhar-challenge",
        icon: (
          <div className="text-xl">
            <TbDropletPlus />
          </div>
        ),
      },
      {
        name: "لیست چالش‌ها",
        href: "/harf-akhar-challenges-list",
        icon: (
          <div className="text-xl">
            <TbListDetails />
          </div>
        ),
      },
    ],
  },
  {
    name: "سرویس دیکشنری",
    href: "/dashboard/dictionary",
    icon: (
      <div className="text-xl">
        <RiBook2Fill />
      </div>
    ),
    head:true,
    children: [
      {
        name: "یافتن کلمات",
        href: "/find-word",
        icon: (
          <div className="text-xl">
            <TbSearch />
          </div>
        ),
      },
      {
        name: "افزودن کلمات جدید",
        href: "/add-new-word",
        icon: (
          <div className="text-xl">
            <TbTagPlus />
          </div>
        ),
      },
    ],
  },
];
const dark = typeof window !== "undefined" && localStorage.getItem("theme");
const Sidebar = () => {
  const pathName = usePathname();
  const [path, setPath] = useState(pathName);

  useEffect(() => {
    if (pathName) {
      setPath(pathName);
    }
  }, [pathName]);

  return (
    <div
      className={`select-none w-72 transition-all duration-300 ease-in-out hidden md:fixed md:inset-y-0 md:z-[100] md:flex sm:flex-col border-l border-border dark:border-border_dark font-['iransans-light']`}
    >
      <div
        className={`flex grow flex-col gap-y-5 border-r border-border dark:border-border_dark bg-background2 dark:bg-background2_dark px-4 pb-4  overflow-y-auto`}
      >
        <div className="flex justify-center h-16 shrink-0 items-center">
          <h1
            className={`bg-gradient-to-r primaryGradient from-primary_start to-primary_end bg-clip-text text-transparent text-[2rem] mt-4 font-black items-center text-center font-['iransans-black']`}
          >
            Harf Hesab
          </h1>
        </div>
        <nav className={`w-full flex self-center flex-1 flex-col`}>
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="flex flex-col gap-1 font-iransans-md">
                {navigation.map((item: any, index: number) => (
                  <SideBarItem
                    key={`${item}${index}`}
                    name={item?.name}
                    href={item?.href}
                    child={item?.children?.length > 0 ? item?.children : []}
                    active={path.includes(item?.href) ? true : false}
                    icon={item?.icon}
                    head={item?.head == true?true:false}
                  />
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
};
export default Sidebar;
