import { useRouter } from "next/navigation";
import React from "react";
import { FiHome } from "react-icons/fi";
import { IoArrowForwardOutline } from "react-icons/io5";
import GradientButton from "./Buttons/GradientButton";
import ImageComponent from "./ImageComponent";
import { FaUserTie } from "react-icons/fa6";

const MainHeader = ({
  home,
  homeOnclickFn,
  back,
  backOnclickFn,
  title,
  avatar,
  logo,
  leftComponent,
  rightComponent,
  buttonText,
  buttonOnclick,
  btnLoading,
  btnClasses,
  titleClasses,
  mainClasses,
}: {
  home?: boolean;
  homeOnclickFn?: any;
  back?: boolean;
  backOnclickFn?: any;
  title?: string;
  avatar?: string;
  logo?: boolean;
  leftComponent?: any;
  rightComponent?: any;
  buttonText?: string;
  buttonOnclick?: any;
  btnLoading?: boolean;
  btnClasses?: string;
  titleClasses?: string;
  mainClasses?: string;
}) => {
  const router = useRouter();

  return (
    <header
      className={`${mainClasses} flex items-center justify-between bg-background2 dark:bg-background2_dark px-2 sm:px-4 border-b border-border2 dark:border-border2_dark fixed top-0 right-0 left-0 z-[900] shadow-md`}
    >
      <div className="flex items-center gap-2 w-full justify-between">
        <div className="flex gap-2 items-center shrink-0">
          {logo && (
            <div className="sm:flex sm:justify-center sm:items-center hidden font-['iransans-md'] bg-gradient-to-r primaryGradient from-primary_start to-primary_end bg-clip-text text-transparent sm:text-[1.6rem] xl:text-[1.7rem] 2xl:text-[2rem] pt-2 font-black select-none">
              Harf Hesab
            </div>
          )}
          {back && (
            <div
              className="text-3xl flex sm:hidden justify-center items-center p-2 rounded text-text6 dark:text-text6_dark cursor-pointer transition hover:bg-background6 dark:hover:bg-background6_dark w-10 h-10"
              onClick={() => {
                if (backOnclickFn) {
                  backOnclickFn();
                } else {
                  router.back();
                }
              }}
            >
              <IoArrowForwardOutline />
            </div>
          )}
          {home && (
            <div
              className="hidden sm:flex text-2xl justify-center items-center p-2.5 rounded text-text6 dark:text-text6_dark cursor-pointer transition hover:bg-background6 dark:hover:bg-background6_dark w-11 h-11 my-2"
              onClick={() => {
                if (homeOnclickFn) {
                  homeOnclickFn();
                } else {
                  router.replace("/crm/dashboard/services");
                }
              }}
            >
              <FiHome />
            </div>
          )}
          {rightComponent && rightComponent}
        </div>
        {avatar == "" ? (
          <div className="w-7 h-7 flex items-center justify-center text-lg rounded text-text4 dark:text-text4_dark bg-border dark:bg-border_dark">
            <FaUserTie />
          </div>
        ) : avatar ? (
          <div>
            <ImageComponent parentclasses="h-7 w-7" src={avatar} imageClasses="h-6 w-6" />
          </div>
        ) : (
          ""
        )}
        {title && (
          <div
            className={`${titleClasses} flex-1 text-right line-clamp-1 font-['iransans-md'] text-xs sm:text-sm text-text6 dark:text-text6_dark select-none`}
          >
            {title}
          </div>
        )}
        <div className="flex items-center shrink-0">
          {leftComponent && <div className="ml-1">{leftComponent}</div>}
          {home && (
            <div
              className="flex sm:hidden text-2xl justify-center items-center p-2.5 rounded text-text6 dark:text-text6_dark cursor-pointer transition hover:bg-background6 dark:hover:bg-background6_dark w-10 h-10 my-2"
              onClick={() => {
                if (homeOnclickFn) {
                  homeOnclickFn();
                } else {
                  router.replace("/crm/dashboard/services");
                }
              }}
            >
              <FiHome />
            </div>
          )}
          {buttonText && buttonOnclick && (
            <div>
              <GradientButton
                classes={`${btnClasses} hidden sm:block z-50 select-none my-2 !py-[.6rem]`}
                buttonText={buttonText}
                onClickFn={() => {
                  buttonOnclick();
                }}
                loading={btnLoading}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default MainHeader;
