"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import ShowVideoModalHelper from "@/components/ShowMediaModal/ShowVideoModalHelper";
import ShowImageModalHelper from "@/components/ShowMediaModal/ShowImageModalHelper";
import ModalInputHelper from "@/components/ModalInput/ModalInputHelper";
import ShowVideoModal from "@/components/ShowMediaModal/ShowVideoModal";
import ShowImageModal from "@/components/ShowMediaModal/ShowImageModal";
import ModalInput from "@/components/ModalInput/ModalInput";
import Input from "@/components/Input";
import TextAreaInput from "@/components/TextAreaInput";
import Footer from "@/components/Footer/Footer";
import Border from "@/components/Border";
import { Switch } from "@headlessui/react";
import SelectInput from "@/components/SelectInput";
import ScreenLoading from "@/components/ScreenLoading";
import { useParams } from "next/navigation";


type SelectedOption = {
  value: any;
  label: string;
};
const PublicationStatus:SelectedOption[] = [
  {value:null, label:"انتخاب وضعیت انتشار محتوا"},
  {value:"draft", label:"پیشنویس"},
  {value:"ready", label:"آماده انتشار"},
  {value:"published", label:"منتشر شده"},
  {value:"archived", label:"آرشیو شده، غیرفعال"},
  {value:"rejected", label:"رد شده"},
]
const CompletionStatus:SelectedOption[] = [
  {value:null, label:"انتخاب وضعیت کامل بودن محتوا"},
  {value:"incomplete", label:"ناقص (نیاز به بخش‌هایی بیشتر)"},
  {value:"in_progress", label:"در حال کار و بازبینی"},
  {value:"complete", label:"کامل‌شده ولی قابل به‌روزرسانی"},
  {value:"finalized", label:"نهایی‌شده، بدون نیاز به تغییر"},
]
type ContentSourceType = {
  selected: string | null;
  list:SelectedOption[]
}
type languageListType = {
  label: any;
  value: any;
};
const Page = () => {
  const { seasonId } = useParams();
  const [oldData, setOldData] = useState<any>(null)
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [changeVersionUpdated, setChangeVersionUpdated] = useState(false);
  const [badge, setBadge] = useState("");
  const [language, setLanguage] = useState<string | null>(null)
  const [languageList, setLanguageList] = useState<languageListType[]>([])
  const [loading, setLoading] = useState(false);
  const [seasonNumber, setSeasonNumber] = useState("")
  const [stageNumberFrom, setStageNumberFrom] = useState("")
  const [stageNumberTo, setStageNumberTo] = useState("")
  const [numberStage, setNumberStage] = useState("")
  const [publicationStatus, setPublicationStatus] = useState<string | null>(null)
  const [completionStatus, setCompletionStatus] = useState<string | null>(null)
  const [loading2, setLoading2] = useState(true)
  const [getError, setGetError] = useState(false)
  

  useEffect(()=>{
    getData()
  }, [])
  const getData = async()=>{
    await axios({
      url: "/",
      method: "post",
      data: {
        query: `
            query getWordGameSeasonInformation(
              $_id : ID!,
            ){
                getWordGameSeasonInformation(
                  _id : $_id,
                ) {
                    _id,
                    title,
                    description,
                    language_info{_id, name, rtl},
                    badge,
                    season_number,
                    stage_number_from,
                    stage_number_to,
                    number_stage,
                    is_visible,
                    is_active,
                    publication_status,
                    completion_status,
                    version_created,
                    version_updated,
                    version_deleted,
                }
            }
            `,
        variables: {
          _id : seasonId
        },
      },
    }).then(async (response) => {
        const data = response.data.data.getWordGameSeasonInformation;
        if (data) {
          const deepCopy = structuredClone(data);
          setOldData(deepCopy);
          setTitle(data?.title)
          setDescription(data?.description??"")
          setLanguage(data?.language_info?._id)
          setBadge(data?.badge??"")
          setSeasonNumber(data?.season_number??"")
          setStageNumberFrom(data?.stage_number_from??"")
          setStageNumberTo(data?.stage_number_to??"")
          setNumberStage(data?.number_stage??"")
          setVisible(data?.is_visible)
          setActive(data?.is_active)
          setPublicationStatus(data?.publication_status)
          setCompletionStatus(data?.completion_status)
          const languages = [{
            label: data?.language_info?.name,
            value: data?.language_info?._id,
          }]
          setLanguageList(languages)
          setLoading2(false)
        } else {
          setGetError(true)
        }
      })
      .catch(() => {
        setGetError(true)
      });
  }
  const tryAgain = ()=>{
    setLoading2(true)
    setGetError(false)
    getData()
  }
  const registerAndConfirm = ()=>{
    if(title.length == 0 || seasonNumber.length == 0 || stageNumberFrom.length == 0 || stageNumberTo.length == 0 || numberStage.length == 0 || !completionStatus || !publicationStatus){
      toast.error("ابتدا موارد الزامی را وارد کنید", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: typeof window !== "undefined" && localStorage.getItem("theme") == "dark" ? "dark" : "light",
      });
    } else {
      checkedAndRegister()
    }
  }
  const checkedAndRegister = async()=>{
    setLoading(true)
    let data = {
      query: `
          mutation editWordGameSeasonInformation(
            $_id : ID!,
            $title : String,
            $description : String,
            $badge : String,
            $season_number : Int,
            $stage_number_from : Int,
            $stage_number_to : Int,
            $number_stage : Int,
            $is_visible : Boolean,
            $is_active : Boolean,
            $publication_status : String,
            $completion_status : String,
            $change_version_updated : Boolean!
          ){
            editWordGameSeasonInformation(
              _id : $_id,
              title : $title,
              description : $description,
              badge : $badge,
              season_number : $season_number,
              stage_number_from : $stage_number_from,
              stage_number_to : $stage_number_to,
              number_stage : $number_stage,
              is_visible : $is_visible,
              is_active : $is_active,
              publication_status : $publication_status,
              completion_status : $completion_status,
              change_version_updated : $change_version_updated
            ) {
              status,
              message,
            }
          }
          `,
      variables: {
        _id : seasonId,
        title : (title !== oldData?.title && title?.length > 0)?title:undefined,
        description : ((oldData?.description && description !== oldData?.description) || (!oldData?.description && description?.length >0))?description:undefined,
        badge: ((oldData?.badge && badge !== oldData?.badge) || (!oldData?.badge && badge?.length >0))?badge:undefined,
        season_number: (oldData?.season_number !== Number(seasonNumber) && Number(seasonNumber) > 0)?Number(seasonNumber):undefined,
        stage_number_from : (oldData?.stage_number_from !== Number(stageNumberFrom) && Number(stageNumberFrom) > 0)?Number(stageNumberFrom):undefined,
        stage_number_to : (oldData?.stage_number_to !== Number(stageNumberTo) && Number(stageNumberTo) > 0)?Number(stageNumberTo):undefined,
        number_stage: (oldData?.number_stage !== Number(numberStage) && Number(numberStage) > 0)?Number(numberStage):undefined,
        is_visible : (oldData?.is_visible !== visible)?visible:undefined,
        is_active : (oldData?.is_active !== active)?active:undefined,
        publication_status : (oldData?.publication_status !== publicationStatus)?publicationStatus:undefined,
        completion_status : (oldData?.completion_status !== completionStatus)?completionStatus:undefined,
        change_version_updated : changeVersionUpdated
      },
    };
    await axios({
      url: "/",
      method: "post",
      data: data,
    })
      .then(async (response) => {
        setLoading(false);
        if (response.data?.data?.editWordGameSeasonInformation?.status == 200) {
            toast.success(response.data?.data?.editWordGameSeasonInformation?.message, {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: typeof window !== "undefined" && localStorage.getItem("theme") == "dark" ? "dark" : "light",
            });
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
      .catch(() => {
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
        setLoading(false);
      });
  }

  return (
    loading2 == true?
    <div className="flex items-center justify-center w-full h-[calc(100dvh-60px)]">
      <ScreenLoading
        getError={getError}
        notItem={false}
        tryAgain={tryAgain}
      />
    </div>
    :
    <div className="flex flex-col justify-between w-full lg:w-[600px] 2xl:w-[750px] mt-10 mb-28 px-4 sm:mx-auto">
      <div className="mt-6">
        <label
          className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.85rem] sm:text-[.95rem] cursor-pointer py-3"
          htmlFor="name"
        >
          زبان فصل
          <span className="text-red-500 px-1">*</span>
          <div className={`mt-1 flex-1 gap-2 w-full items-center justify-between`}>
            <SelectInput
              disabled={true}
              value={language}
              name="word-game-language"
              options={languageList}
              onChange={(value) => setLanguage(value || null)}
            />
          </div>
        </label>
      </div>
      <div className="mt-6">
        <label
          className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.85rem] sm:text-[.95rem] cursor-pointer py-3"
          htmlFor="name-word-game-season"
        >
          عنوان فصل
          <span className="text-red-500 px-1">*</span>
          <div className={`mt-1 flex gap-2 w-full items-center justify-between`}>
            <Input id="name-word-game-season" value={title} changeState={setTitle} classes="flex-1" inputStyles="!text-base" />
          </div>
        </label>
      </div>
      <div className="mt-6">
        <label
          className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.85rem] sm:text-[.95rem] cursor-pointer py-3"
          htmlFor="number-season-word-game-season"
        >
          شماره فصل
          <span className="text-red-500 px-1">*</span>
          <div className={`mt-1 flex gap-2 w-full items-center justify-between`}>
            <Input type="number" id="number-season-word-game-season" value={seasonNumber} changeState={setSeasonNumber} classes="flex-1" inputStyles="!text-base" />
          </div>
        </label>
      </div>
      <div className="mt-6">
        <label
          className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.85rem] sm:text-[.95rem] cursor-pointer py-3"
          htmlFor="number-word-game-season"
        >
          تعداد مراحل فصل
          <span className="text-red-500 px-1">*</span>
          <div className={`mt-1 flex gap-2 w-full items-center justify-between`}>
            <Input type="number" id="number-word-game-season" value={numberStage} changeState={setNumberStage} classes="flex-1" inputStyles="!text-base" />
          </div>
        </label>
      </div>
      <div className="mt-6">
        <label
          className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.85rem] sm:text-[.95rem] cursor-pointer py-3"
          htmlFor="stage_number_from"
        >
          شروع مرحله از
          <span className="text-red-500 px-1">*</span>
          <div className={`mt-1 flex gap-2 w-full items-center justify-between`}>
            <Input type="number" id="stage_number_from" value={stageNumberFrom} changeState={setStageNumberFrom} classes="flex-1" inputStyles="!text-base" />
          </div>
        </label>
      </div>
      <div className="mt-6">
        <label
          className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.85rem] sm:text-[.95rem] cursor-pointer py-3"
          htmlFor="stage_number_to"
        >
          پایان مرحله تا
          <span className="text-red-500 px-1">*</span>
          <div className={`mt-1 flex gap-2 w-full items-center justify-between`}>
            <Input type="number" id="stage_number_to" value={stageNumberTo} changeState={setStageNumberTo} classes="flex-1" inputStyles="!text-base" />
          </div>
        </label>
      </div>
      <div className="mt-6">
        <label
          className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.85rem] sm:text-[.95rem] cursor-pointer py-3"
          htmlFor="badge-word-game-season"
        >
          نشان ( مثل جدید یا به‌زودی )
          <div className={`mt-1 flex gap-2 w-full items-center justify-between`}>
            <Input id="badge-word-game-season" value={badge} changeState={setBadge} classes="flex-1" inputStyles="!text-base" />
          </div>
        </label>
      </div>
      <div className="mt-6">
        <label
          className="text-right lg:w-2/3 w-5/6 xl:w-3/5 2xl:w-1/2 text-text6 dark:text-text6_dark cursor-pointer font-iransans-md text-sm"
          htmlFor="description-word-game-season"
        >
          دربارهٔ فصل
          <TextAreaInput
            id={"description-word-game-season"}
            value={description}
            changeState={(e: any) => setDescription(e)}
            textAreaStyles="!text-sm mt-1"
            rows={4}
          />
        </label>
      </div>
      <div className="mt-6">
        <label
          className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.85rem] sm:text-[.95rem] cursor-pointer py-3"
          htmlFor="name"
        >
          وضعیت انتشار فصل
          <span className="text-red-500 px-1">*</span>
          <div className={`mt-1 flex-1 gap-2 w-full items-center justify-between`}>
            <SelectInput
              value={publicationStatus}
              name="word-game-game-status"
              options={PublicationStatus}
              onChange={(value) => setPublicationStatus(value)}
            />
          </div>
        </label>
      </div>
      <div className="mt-6">
        <label
          className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.85rem] sm:text-[.95rem] cursor-pointer py-3"
          htmlFor="name"
        >
          وضعیت کامل بودن فصل
          <span className="text-red-500 px-1">*</span>
          <div className={`mt-1 flex-1 gap-2 w-full items-center justify-between`}>
            <SelectInput
              value={completionStatus}
              name="word-game-game-completion"
              options={CompletionStatus}
              onChange={(value) => setCompletionStatus(value)}
            />
          </div>
        </label>
      </div>
      <div
        className="py-4 cursor-pointer sm:hover:bg-border2 dark:sm:hover:bg-border2_dark transition select-none"
        onClick={() => setVisible((last) => !last)}
      >
        <div className="flex items-center justify-between w-full h-[42px] pl-2 rounded">
          <label className={`text-sm font-['iransans-md'] cursor-pointer`}>
            <h3 className="text-text dark:text-text_dark font-['iransans-md'] text-[15px]">
              قابل نمایش شود
            </h3>
          </label>
          <Switch
            checked={visible}
            onChange={() => setVisible((last) => !last)}
            onClick={(e) => e.stopPropagation()}
            className={`${visible ? "bg-rgba2" : "bg-border dark:bg-border_dark"}
relative h-[19px] w-[33px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out flex items-center`}
          >
            <span
              aria-hidden="true"
              className={`${
                visible
                  ? "translate-x-2 bg-primary"
                  : "-translate-x-[16px] bg-text5 dark:bg-text5_dark"
              }
pointer-events-none inline-block h-[22px] w-[22px] transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out`}
            />
          </Switch>
        </div>
        <p className="text-justify font-['iransans-md'] text-text5 dark:text-text5_dark text-[12px] sm:text-[14px] mb-1">
          با فعال بودن این گزینه، آیتم قابل نمایش برای کاربران ثبت خواهد شد.
        </p>
      </div>
      <Border />
      <div
        className="py-4 cursor-pointer sm:hover:bg-border2 dark:sm:hover:bg-border2_dark transition select-none"
        onClick={() => setActive((last) => !last)}
      >
        <div className="flex items-center justify-between w-full h-[42px] pl-2 rounded">
          <label className={`text-sm font-['iransans-md'] cursor-pointer`}>
            <h3 className="text-text dark:text-text_dark font-['iransans-md'] text-[15px]">
              فعال شود
            </h3>
          </label>
          <Switch
            checked={active}
            onChange={() => setActive((last) => !last)}
            onClick={(e) => e.stopPropagation()}
            className={`${active ? "bg-rgba2" : "bg-border dark:bg-border_dark"}
relative h-[19px] w-[33px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out flex items-center`}
          >
            <span
              aria-hidden="true"
              className={`${
                active
                  ? "translate-x-2 bg-primary"
                  : "-translate-x-[16px] bg-text5 dark:bg-text5_dark"
              }
pointer-events-none inline-block h-[22px] w-[22px] transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out`}
            />
          </Switch>
        </div>
        <p className="text-justify font-['iransans-md'] text-text5 dark:text-text5_dark text-[12px] sm:text-[14px] mb-1">
          با فعال بودن این گزینه، آیتم به عنوان فعال شده ثبت خواهد شد.
        </p>
      </div>
      <Border />
      <div
        className="py-4 cursor-pointer sm:hover:bg-border2 dark:sm:hover:bg-border2_dark transition select-none"
        onClick={() => setChangeVersionUpdated((last) => !last)}
      >
        <div className="flex items-center justify-between w-full h-[42px] pl-2 rounded">
          <label className={`text-sm font-['iransans-md'] cursor-pointer`}>
            <h3 className="text-text dark:text-text_dark font-['iransans-md'] text-[15px]">
              ورژن آپدیت ارتقا یابد
            </h3>
          </label>
          <Switch
            checked={changeVersionUpdated}
            onChange={() => setChangeVersionUpdated((last) => !last)}
            onClick={(e) => e.stopPropagation()}
            className={`${changeVersionUpdated ? "bg-rgba2" : "bg-border dark:bg-border_dark"}
relative h-[19px] w-[33px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out flex items-center`}
          >
            <span
              aria-hidden="true"
              className={`${
                changeVersionUpdated
                  ? "translate-x-2 bg-primary"
                  : "-translate-x-[16px] bg-text5 dark:bg-text5_dark"
              }
pointer-events-none inline-block h-[22px] w-[22px] transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out`}
            />
          </Switch>
        </div>
        <p className="text-justify font-['iransans-md'] text-text5 dark:text-text5_dark text-[12px] sm:text-[14px] mb-1">
          با فعال بودن این گزینه، بعد از ویرایش، ورژن آپدیت سند (version_updated) افزایش میابد.
        </p>
      </div>
      <Border />
      <Footer buttonFn={registerAndConfirm} buttonText="ویرایش فصل" loadingButton={loading} classes="md:!mr-72 !justify-end" />
     
      
      <ShowVideoModal
        ref={(Ref) => {
          ShowVideoModalHelper.setRef(Ref);
        }}
      />
      <ShowImageModal
        ref={(Ref) => {
          ShowImageModalHelper.setRef(Ref);
        }}
      />
      <ModalInput
        ref={(Ref) => {
          ModalInputHelper.setRef(Ref);
        }}
      />
    </div>
  );
};

export default Page;
