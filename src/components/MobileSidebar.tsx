import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import SideBarItem from "./SideBarItem";
import { usePathname } from "next/navigation";
import { AiFillDashboard } from "react-icons/ai";
import { RiApps2Fill, RiBook2Fill } from "react-icons/ri";
import { TbCoins, TbDiaboloPlus, TbHexagonalPrismPlus, TbBellPlus, TbMessagePlus, TbListSearch, TbSettings, TbDropletPlus, TbTagPlus, TbSearch, TbListDetails  } from "react-icons/tb";
import { FaCoins, FaDiceD6, FaUsers } from "react-icons/fa6";
import { BsCloudPlus, BsCloudPlusFill } from "react-icons/bs";
import { LuClipboardList } from "react-icons/lu";
import { MdListAlt, MdPayments } from "react-icons/md";
import { IoDiamondOutline, IoDiamondSharp, IoTrailSign, IoTrailSignOutline, IoNotifications, IoMail } from "react-icons/io5";

export default function MobileSidebar({ isOpenSidebar, closeSidebarFn }: { isOpenSidebar: boolean; closeSidebarFn: any }) {
  const dark = typeof window !== "undefined" && localStorage.getItem("theme");

  const pathName = usePathname();
  const [path, setPath] = useState(pathName);

  useEffect(() => {
    if (pathName) {
      setPath(pathName);
    }
  }, [pathName]);

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

  return (
    <>
      <Transition show={isOpenSidebar} as={Fragment}>
        <Dialog as="div" className="relative z-[1500]" onClose={closeSidebarFn}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-background6_dark bg-opacity-70 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="h-full min-h-full max-w-xs w-3/4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="translate-x-full opacity-0"
                enterTo="translate-y-0 opacity-100"
                leave="ease-in duration-200"
                leaveFrom="translate-x-0 opacity-100"
                leaveTo="translate-x-full opacity-0"
              >
                <Dialog.Panel className="h-full w-full max-w-md transform overflow-hidden text-left align-middle shadow-xl transition-all">
                  <div
                    className={`h-full flex grow flex-col gap-y-5 border-border dark:border-border_dark bg-background2 dark:bg-background2_dark px-6 pb-4 font-iransans-md overflow-y-auto
                    }`}
                  >
                    <div className="flex justify-start h-16 shrink-0 items-center">
                      <h1
                        className={`bg-gradient-to-r primaryGradient from-primary_start to-primary_end bg-clip-text text-transparent text-3xl 2xs:text-[2rem] mt-4 font-black items-center text-center font-['iransans-black'] select-none`}
                      >
                        Harf Hesab
                      </h1>
                    </div>

                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex justify-between flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list" className="flex flex-col gap-2 select-none">
                            {navigation.map((item: any, index: number) => (
                              <SideBarItem
                                key={`${item}${index}`}
                                name={item?.name}
                                href={item?.href}
                                child={item?.children?.length > 0 ? item?.children : []}
                                active={path.includes(item?.href) ? true : false}
                                closeDrawer={closeSidebarFn}
                                icon={item?.icon}
                                head={item?.head == true?true:false}
                              />
                            ))}
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
