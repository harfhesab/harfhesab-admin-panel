import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ImageComponent from "@/components/ImageComponent";
import { HiDotsVertical, HiEyeOff, HiEye, HiOutlineEyeOff, HiOutlineTrash } from "react-icons/hi";
import { IoNotificationsOff, IoNotifications, IoDiamondSharp } from "react-icons/io5";
import { FaUserLarge, FaCoins} from "react-icons/fa6";
import axios from "axios";
import { toast } from "react-toastify";
import DialogHelper from "@/components/Dialog/DialogHelper";
import { getTime } from "@/utils/GetTime";
import moment from "moment-jalaali";
moment.locale('fa');
moment.loadPersian({ usePersianDigits: false, dialect: "persian-modern" });

const NotificationItem = ({
  _id,
  type,
  admin,
  user,
  title,
  body,
  link,
  packageInfo,
  freeCoinPlan,
  freeSubscriptionPlan,
  adminNote,
  sendNotification,
  seen,
  deleteOperation,
}: {
  _id: string;
  type: "public-notification" | "private-notification" | "public-message-in-app" | "private-message-in-app";
  admin: {first_name: string, last_name: string};
  user?: {name?: string, phone?: string};
  title: string;
  body: string;
  link?: string;
  packageInfo?: {title: string; icon_image?: string;} | null;
  freeCoinPlan?: any;
  freeSubscriptionPlan?: any;
  adminNote?: string;
  sendNotification: boolean;
  seen?: boolean | null;
  deleteOperation?: any
}) => {
  const router = useRouter();
  const flexDir = "flex-row-reverse";
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const deleteItemQuery = 
    type == "public-notification"?"deletePublicNotificationByAdmin":
    type == "private-notification"?"deletePrivateNotificationByAdmin":
    type == "public-message-in-app"?"deletePublicMessageInAppByAdmin":
    type == "private-message-in-app"&&"deletePrivateMessageInAppByAdmin"


  const typeTitle = type == "public-notification"?"اعلان عمومی":type == "private-notification"?"اعلان خصوصی":type == "public-message-in-app"?"پیام عمومی":type =="private-message-in-app"?"پیام خصوصی":""


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

  const deleteNotification = async () => {
    let data = {
      query: `
          mutation ${deleteItemQuery}(
            $_id : ID!,
          ){
            ${deleteItemQuery}(
              _id : $_id,
            ) {
              status,
              message,
            }
          }
          `,
      variables: {
        _id : _id,
      },
    };
    await axios({
      url: "/",
      method: "post",
      data: data,
    })
      .then(async (response) => {
        const res = 
          type == "public-notification"?response.data?.data?.deletePublicNotificationByAdmin:
          type == "private-notification"?response.data?.data?.deletePrivateNotificationByAdmin:
          type == "public-message-in-app"?response.data?.data?.deletePublicMessageInAppByAdmin:
          type == "private-message-in-app"&&response.data?.data?.deletePrivateMessageInAppByAdmin
        if (res?.status == 200) {
            toast.success(res?.message, {
              position: "top-center",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: typeof window !== "undefined" && localStorage.getItem("theme") == "dark" ? "dark" : "light",
            });
            deleteOperation?.()
        } else {
          toast.error((response.data?.errors[0]?.data[0]?.message || "مشکلی پیش آمد دوباره تلاش کنید"), {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: typeof window !== "undefined" && localStorage.getItem("theme") == "dark" ? "dark" : "light",
          });
        }
      })
      .catch((e) => {
        toast.error("مشکلی پیش آمد دوباره تلاش کنید", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: typeof window !== "undefined" && localStorage.getItem("theme") == "dark" ? "dark" : "light",
        });
      });
  };
  return (
    <div 
      className={`relative w-full p-4 rounded-2xl shadow-bottom dark:shadow-bottom-dark m-1 bg-background7 dark:bg-background7_dark flex flex-col gap-4`}
      >
      <div
        className={`top-2 "left-2" z-20`}
      >
        <div className="mt-1 flex gap-2 w-full items-center justify-between">
          <span className="flex flex-row items-center gap-2 bg-yellow-100 dark:bg-yellow-800 px-4 py-1 rounded-full font-['iransans-md'] text-[14px]">
            {
              sendNotification == true?
              <IoNotifications className="text-[20px]"/>
              :
              <IoNotificationsOff className="text-[20px]"/>
            }
            {typeTitle}
            <span className="text-[12px] text-warning">{`${sendNotification == true?"(با نوتیفیکیشن)":"(بدون نوتیفیکیشن)"}`}</span>
          </span>
          <div
            className={`top-2 "left-2" z-20`}
          >
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="relative p-1 rounded-full text-primary hover:bg-rgba0 hover:text-white"
              >
                <HiDotsVertical className="text-xl" />
              </button>
          </div>

          {menuOpen && (
            <div
              ref={menuRef}
              className={`absolute mt-6 w-60 rounded-[15px] font-['iransans-md'] shadow-lg bg-background2 dark:bg-background2_dark ring-1 ring-black ring-opacity-5 focus:outline-none z-30 left-12`}
            >
              <div className="py-4">
                <button
                  className="block flex flex-row items-center gap-2 w-full text-right px-2 py-4 text-sm text-text2 dark:text-text2_dark hover:bg-border dark:hover:bg-border_dark"
                  onClick={() => {
                    setMenuOpen(false);
                    DialogHelper.showDialog({
                      bodyText:`آیا این آیتم ${typeTitle} حذف شود؟`,
                      buttons:[
                        {
                          onClickFn:()=>{
                            deleteNotification()
                          },
                          buttonText:"حذف آیتم",
                          type:"bold"
                        },
                        {
                          onClickFn:()=>{},
                          buttonText:"لغو",
                          type:"border"
                        }
                      ]
                    })
                  }}
                >
                  <HiOutlineTrash className="text-text4 dark:text-text4_dark text-lg"/>
                  حذف آیتم
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
      {/* اطلاعات متنی */}

      <div className={`flex flex-col sm:${flexDir} gap-4`}>
          {
            user && (
              <div className="flex flex-row items-center gap-2 mt-2 flex flex-wrap gap-2 text-xs font-['iransans-md'] text-text dark:text-text_dark">
                <FaUserLarge className="text-info text-[20px]"/>
                <span className="bg-green-100 dark:bg-green-800 px-2 py-1 rounded">
                  {user.name?`${user.name}`:""}
                  {user.phone?<span className="text-warning"> | </span>:""}
                  {user.phone?`${user.phone}`:""}
                </span>
                {
                  (seen === true || seen === false)&&
                  <span className="bg-green-100 dark:bg-green-800 px-2 py-1 rounded">
                    {
                      seen === true?
                      <HiEye className="text-info text-[17px]"/>
                      :seen === false&&
                      <HiEyeOff className="text-info text-[17px]"/>
                    }
                  </span>
                }
              </div>
            )
          }
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h2 className="text-lg font-['iransans-bold']">{title}</h2>
          </div>

          {body && (
            <p className="text-sm text-text6 dark:text-text6_dark mt-2 font-['iransans-md']">
              {body}
            </p>
          )}
          {link && (
            <p className="text-sm text-info mt-2 font-['iransans-md'] text-align-left">
              {link}
            </p>
          )}
          {
            (freeCoinPlan)&&
            <div className="flex items-center mt-4">
              <div className="flex w-full items-center justify-between">
                {
                  freeCoinPlan?.icon_image?
                  <ImageComponent
                    parentclasses="w-16 h-16 lg:h-16 lg:w-16 2xl:h-24 2xl:w-24 !rounded-xl"
                    imageClasses="!rounded-xl"
                    src={freeCoinPlan?.icon_image}
                  />
                  :
                  <div className="flex w-16 h-16 lg:h-16 lg:w-16 2xl:h-24 2xl:w-24 !rounded-xl bg-green_color items-center justify-center">
                    <FaCoins className="w-8 h-8 lg:h-12 lg:w-12 2xl:h-16 2xl:w-16"/>
                  </div>
                }
                <div className="flex-1 pr-3 flex flex-col justify-between gap-y-[4px]">
                    <p className="text-[10px] 2xl:text-[12px] font-['iransans-md'] text-text dark:text-text_dark line-clmp-1">
                      {freeCoinPlan?.title}
                    </p>
                    <p className="text-[10px] 2xl:text-[12px] font-['iransans-md'] text-text5 dark:text-text5_dark line-clamp-1">
                      {"نوع آیتم : "}
                      <span className="text-warning">{freeCoinPlan?.type == "private"?"خصوصی":freeCoinPlan?.type == "public"?"عمومی":""}</span>
                    </p>
                    <p className="text-[10px] 2xl:text-[12px] font-['iransans-md'] text-primary">
                      {`${freeCoinPlan?.number_coin} سکه`}
                      {freeCoinPlan?.is_active === false&& <span className="text-warning"> ( غیر فعال )</span>}
                    </p>
                    <p className="text-[8px] 2xl:text-[10px] font-['iransans-md'] text-text5 dark:text-text5_dark line-clamp-1">
                      {"تاریخ انقضا : "}
                      <span className="text-primary">{freeCoinPlan?.expiration?`( ${getTime(freeCoinPlan?.expiration)}   ___  ${moment(freeCoinPlan?.expiration).format("jYYYY/jMM/jDD")} )${freeCoinPlan?.expired === true?" ( منقضی شده )":""}`:"نامحدود"}</span>
                    </p>
                </div>
              </div>
            </div>
          }
          {
            (freeSubscriptionPlan)&&
            <div className="flex items-center mt-4">
              <div className="flex w-full items-center justify-between">
                {
                  freeSubscriptionPlan?.icon_image?
                  <ImageComponent
                    parentclasses="w-16 h-16 lg:h-16 lg:w-16 2xl:h-24 2xl:w-24 !rounded-xl"
                    imageClasses="!rounded-xl"
                    src={freeSubscriptionPlan.icon_image}
                  />
                  :
                  <div className="flex w-16 h-16 lg:h-16 lg:w-16 2xl:h-24 2xl:w-24 !rounded-xl bg-green_color items-center justify-center">
                    <IoDiamondSharp className="w-8 h-8 lg:h-12 lg:w-12 2xl:h-16 2xl:w-16"/>
                  </div>
                }
                <div className="flex-1 pr-3 flex flex-col justify-between gap-y-[4px]">
                    <p className="text-[10px] 2xl:text-[12px] font-['iransans-md'] text-text dark:text-text_dark line-clmp-1">
                      {freeSubscriptionPlan?.title}
                    </p>
                    <p className="text-[10px] 2xl:text-[12px] font-['iransans-md'] text-text5 dark:text-text5_dark line-clamp-1">
                      {"نوع آیتم : "}
                      <span className="text-warning">{freeSubscriptionPlan?.type == "private"?"خصوصی":freeSubscriptionPlan?.type == "public"?"عمومی":""}</span>
                    </p>
                    <p className="text-[10px] 2xl:text-[12px] font-['iransans-md'] text-primary">
                      {`${freeSubscriptionPlan?.duration} روز اشتراک`}
                      {freeSubscriptionPlan?.is_active === false&& <span className="text-warning"> ( غیر فعال )</span>}
                    </p>
                    <p className="text-[8px] 2xl:text-[10px] font-['iransans-md'] text-text5 dark:text-text5_dark line-clamp-1">
                      {"تاریخ انقضا : "}
                      <span className="text-primary">{freeSubscriptionPlan?.expiration?`( ${getTime(freeSubscriptionPlan?.expiration)}   ___  ${moment(freeSubscriptionPlan?.expiration).format("jYYYY/jMM/jDD")} )${freeSubscriptionPlan?.expired === true?" ( منقضی شده )":""}`:"نامحدود"}</span>
                    </p>
                </div>
              </div>
            </div>
          }
          {
            packageInfo && (
              <div className="flex w-full items-center justify-between mt-6">
                {
                  packageInfo?.icon_image && (
                    <ImageComponent
                      parentclasses="w-12 h-12 lg:h-18 lg:w-18 2xl:h-18 2xl:w-18 !rounded-xl"
                      imageClasses="!rounded-xl"
                      src={packageInfo.icon_image}
                    />
                  )
                }
                <div className="flex-1 pr-3 flex flex-col justify-between">
                  <div className="flex items-center">
                    <h3 className="text-sm 2xl:text-base font-['iransans-md'] text-text dark:text-text_dark line-clamp-1">
                      {packageInfo.title}
                    </h3>
                  </div>
                </div>
              </div>
            )
          }
          {
            admin && (
              <p className="text-[14px] text-text4 dark:text-text4_dark mt-12 font-['iransans-md']">
                <span className="text-warning">ادمین : </span>
                {`${admin.first_name} ${admin.last_name}`}
              </p>
            )
          }
          {adminNote && (
            <p className="text-[12px] text-text5 dark:text-text5_dark mt-2 font-['iransans-md']">
                <span className="text-warning">یادداشت ادمین : </span>
              {`${adminNote}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;