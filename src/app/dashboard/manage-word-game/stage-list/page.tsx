"use client";

import React, { useEffect, useState } from "react";
import FooterPaginate from "@/components/FooterPaginate";
import ScreenLoading from "@/components/ScreenLoading";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import SelectInput from "@/components/SelectInput";
import Input from "@/components/Input";
import FilterFooter from "@/components/Footer/FilterFooter";
import GradientButton from "@/components/GradientButton";
import { IoSearch } from "react-icons/io5";
import { RiFilter2Fill } from "react-icons/ri";
import WordGameStageCard from "@/components/ListItems/WordGame/WordGameStageCard";


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
const VisibleStatus:SelectedOption[] = [
  {value:null, label:"انتخاب وضعیت قابل مشاهده بودن"},
  {value:true, label:"فقط موارد قابل مشاهده"},
  {value:false, label:"فقط موارد غیر قابل مشاهده"},
]
const ActiveStatus:SelectedOption[] = [
  {value:null, label:"انتخاب وضعیت فعال بودن"},
  {value:true, label:"فقط موارد فعال"},
  {value:false, label:"فقط موارد غیر فعال"},
]
const Page = () => {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [getError, setGetError] = useState(false);
  const [noItem, setNoItem] = useState(false);
  const [footerTry, setFooterTry] = useState(false);
  const [footerLoading, setFooterLoading] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<any>(null);
  const [publicationStatus, setPublicationStatus] = useState<string | null>(null)
  const [completionStatus, setCompletionStatus] = useState<string | null>(null)
  const [visible, setVisible] = useState<any>(null);
  const [active, setActive] = useState<any>(null);
  const [language, setLanguage] = useState<string | null>(null)
  const [languageList, setLanguageList] = useState([])
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [season, setSeason] = useState<string | null>(null)
  const [seasonList, setSeasonList] = useState([])

  useEffect(()=>{
    getAllLanguage()
    getDataForFirst()
  }, [])
  const getAllLanguage = async()=>{
    const data = {
      query: `
        query getAllLanguageForAdmin($filter_visible : Boolean, $filter_active : Boolean){
          getAllLanguageForAdmin(filter_visible : $filter_visible, filter_active : $filter_active) {
            _id,
            name,
          }
        }
        `,
      variables: {
        filter_visible: false,
        filter_active: false,
      },
    };
    await axios({
      url: "/",
      method: "post",
      data: data,
    }).then(async (response) => {
        const data = response.data.data.getAllLanguageForAdmin;
        if (data.length > 0) {
          const items = data.map((item: any) => ({
            label: item.name,
            value: item._id,
          }));
          items.unshift({
            label: "انتخاب زبان",
            value: null,
          })
          setLanguageList(items);
        }
      })
      .catch(() => {
        setLanguageList([])
      });
  }
  const getAllSeason = async(value : string)=>{
    const data = {
      query: `
        query getAllWordGameSeasonForAdmin($language_ref : ID, $filter_visible : Boolean, $filter_active : Boolean){
          getAllWordGameSeasonForAdmin(language_ref : $language_ref, filter_visible : $filter_visible, filter_active : $filter_active) {
            _id,
            title,
          }
        }
        `,
      variables: {
        language_ref: value,
        filter_visible: false,
        filter_active: false,
      },
    };
    await axios({
      url: "/",
      method: "post",
      data: data,
    }).then(async (response) => {
        const data = response.data.data.getAllWordGameSeasonForAdmin;
        if (data.length > 0) {
          const items = data.map((item: any) => ({
            label: item.title,
            value: item._id,
          }));
          items.unshift({
            label: "انتخاب فصل",
            value: null,
          })
          setSeasonList(items);
        } else {
          setSeasonList([])
        }
      })
      .catch(() => {
        setSeasonList([])
      });
  }

  const getDataForFirst = async (txt?: any) => {
    await axios({
      url: "/",
      method: "post",
      data: {
        query: `
            query paginateWordGameStagesForAdmin(
              $page : Int,
              $limit : Int,
              $language_ref : ID,
              $search : String,
              $filter_publication_status : String,
              $filter_completion_status : String,
              $filter_visible : Boolean,
              $filter_active : Boolean,
              $season : ID,
            ){
                paginateWordGameStagesForAdmin(
                  page : $page,
                  limit : $limit,
                  language_ref : $language_ref,
                  search : $search,
                  filter_publication_status : $filter_publication_status,
                  filter_completion_status : $filter_completion_status,
                  filter_visible : $filter_visible,
                  filter_active : $filter_active,
                  season : $season,
                ) {
                    list{
                      _id,
                      letters,
                      words,
                      hidden_words,
                      language_info{name, rtl},
                      season_info{title, season_number},
                      media{path, file_type, duration},
                      voice{path, file_type, duration},
                      stage_number_in_language,
                      stage_number_in_season,
                      is_visible,
                      is_active,
                      publication_status_label,
                      completion_status_label,
                    },
                    hasNextPage,
                    nextPage
                }
            }
            `,
        variables: {
          page : 1,
          language_ref : language??undefined,
          search : txt?.length>0?txt:undefined,
          filter_publication_status : publicationStatus??undefined,
          filter_completion_status : completionStatus??undefined,
          filter_visible : (visible === true || visible === false)?visible:undefined,
          filter_active : (active === true || active === false)?active:undefined,
          season : season?season:undefined,
        },
      },
    })
      .then((response) => {
        const riciveData = response.data.data.paginateWordGameStagesForAdmin;
        if (riciveData.hasNextPage == true) {
          setLoading(false);
          setData(riciveData.list);
          setPage(riciveData.nextPage);
          setFooterLoading(true);
        } else {
          if (riciveData.list.length > 0) {
            setFooterLoading(false);
            setPage(1);
            setLoading(false);
            setData(riciveData.list);
          } else {
            setFooterLoading(false);
            setLoading(true);
            setData([]);
            setNoItem(true);
          }
        }
      })
      .catch((err) => {
        setFooterLoading(false);
        setLoading(true);
        setFooterTry(false);
        setGetError(true);
        setData([]);
      });
  };

  const getDataForMore = async () => {
    await axios({
      url: "/",
      method: "post",
      data: {
        query: `
            query paginateWordGameStagesForAdmin(
              $page : Int,
              $limit : Int,
              $language_ref : ID,
              $search : String,
              $filter_publication_status : String,
              $filter_completion_status : String,
              $filter_visible : Boolean,
              $filter_active : Boolean,
              $season : ID,
            ){
                paginateWordGameStagesForAdmin(
                  page : $page,
                  limit : $limit,
                  language_ref : $language_ref,
                  search : $search,
                  filter_publication_status : $filter_publication_status,
                  filter_completion_status : $filter_completion_status,
                  filter_visible : $filter_visible,
                  filter_active : $filter_active,
                  season : $season,
                ) {
                    list{
                      _id,
                      letters,
                      words,
                      hidden_words,
                      language_info{name, rtl},
                      season_info{title, season_number},
                      media{path, file_type, duration},
                      voice{path, file_type, duration},
                      stage_number_in_language,
                      stage_number_in_season,
                      is_visible,
                      is_active,
                      publication_status_label,
                      completion_status_label,
                    },
                    hasNextPage,
                    nextPage
                }
            }
            `,
        variables: {
          page : page,
          language_ref : language??undefined,
          search : search?.length>0?search:undefined,
          filter_publication_status : publicationStatus??undefined,
          filter_completion_status : completionStatus??undefined,
          filter_visible : (visible === true || visible === false)?visible:undefined,
          filter_active : (active === true || active === false)?active:undefined,
          season : season?season:undefined,
        },
      },
    })
      .then((response) => {
        const riciveData = response.data.data.paginateWordGameStagesForAdmin;
        if (riciveData.hasNextPage == true) {
          setData([...data, ...riciveData.list]);
          setPage(riciveData.nextPage);
          setFooterLoading(true);
        } else {
          if (riciveData.list.length > 0) {
            setFooterLoading(false);
            setPage(page);
            setData([...data, ...riciveData.list]);
          } else {
            setFooterLoading(false);
            setNoItem(data.length > 0 ? false : true);
            setLoading(data.length > 0 ? false : true);
          }
        }
      })
      .catch((e) => {
        setLoading(data.length > 0 ? false : true);
        setFooterTry(data.length > 0 ? true : false);
        setGetError(data.length > 0 ? false : true);
      });
  };

  const handleSearch = (e: string) => {
    setSearch(e);
    clearTimeout(searchTimeout);
    setSearchTimeout(
      setTimeout(() => {
        setPage(1);
        setLoading(true);
        setFooterLoading(false);
        setGetError(false);
        setNoItem(false);
        setFooterTry(false);
        setData([]);

        getDataForFirst(e);
        clearTimeout(searchTimeout);
      }, 1500)
    );
  };

  const submitSearch = () => {
    getDataForFirst(search);
    clearTimeout(searchTimeout);
  };

  const clearSearchFn = () => {
    setSearch("");
    getDataForFirst();
    clearTimeout(searchTimeout);
  };

  const tryAgain = () => {
    setFooterLoading(false);
    setLoading(true);
    setGetError(false);
    setNoItem(false);
    setPage(1);
    setFooterTry(false);
    const txt = search == "" ? null : search;
    getDataForFirst(txt);
  };

  const filterContent = () =>{
    return(
      <div>
          <div>
              <label
                className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.75rem] cursor-pointer py-3"
                htmlFor="search-stage"
              >
                <div className="flex flex-row items-center gap-2">
                  <IoSearch className="text-text5 dark:text-text5_dark text-[20px]"/>
                  جستجوی مرحله
                </div>
                <div className={`mt-1 flex gap-2 w-full items-center justify-between`}>
                  <Input
                    type="number"
                    id="search-stage"
                    value={search}
                    classes="flex-1"
                    onKeyDownFn={submitSearch}
                    changeState={(e: string) => handleSearch(e)}
                    SearchLoading={loading && search.length > 0 && getError == false && noItem == false ? true : false}
                    placeholder="شماره مرحله در فصل یا زبان"
                    inputStyles="!text-[14px] lg:!h-[35px] placeholder:!text-[11px]"
                    searchIconStyle="!hidden"
                    clearSearchIconStyles="!text-base"
                    clearFn={clearSearchFn}
                  />
                </div>
              </label>
            </div>
            <div className="mt-4 w-full border-2 border-dashed border-text5 dark:border-text5_dark"/>
            <div className="mt-6">
              <label
                className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.75rem] cursor-pointer py-3"
                htmlFor="name"
              >
                <div className="flex flex-row items-center gap-2">
                  <RiFilter2Fill className="text-text5 dark:text-text5_dark text-[20px]"/>
                  فیلتر زبان مرحله
                </div>
                <div className={`mt-1 flex-1 gap-2 w-full items-center justify-between`}>
                  <SelectInput
                    name="stage-game-language-filter"
                    options={languageList}
                    onChange={(value) => {
                      setLanguage(value)
                      if(value){
                        getAllSeason(value)
                      }
                    }}
                    classes={"!text-[.75rem]"}
                  />
                </div>
              </label>
            </div>
            <div className="mt-6">
              <label
                className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.75rem] cursor-pointer py-3"
                htmlFor="name"
              >
                <div className="flex flex-row items-center gap-2">
                  <RiFilter2Fill className="text-text5 dark:text-text5_dark text-[20px]"/>
                  فیلتر فصل مرحله
                </div>
                <div className={`mt-1 flex-1 gap-2 w-full items-center justify-between`}>
                  <SelectInput
                    name="stage-game-language-filter"
                    options={seasonList}
                    onChange={(value) => setSeason(value)}
                    classes={"!text-[.75rem]"}
                  />
                </div>
              </label>
            </div>
            <div className="mt-6">
              <label
                className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.75rem] cursor-pointer py-3"
                htmlFor="name"
              >
                <div className="flex flex-row items-center gap-2">
                  <RiFilter2Fill className="text-text5 dark:text-text5_dark text-[20px]"/>
                  فیلتر وضعیت انتشار مرحله
                </div>
                <div className={`mt-1 flex-1 gap-2 w-full items-center justify-between`}>
                  <SelectInput
                    name="stage-game-publication-filter"
                    options={PublicationStatus}
                    onChange={(value) => setPublicationStatus(value)}
                    classes={"!text-[.75rem]"}
                  />
                </div>
              </label>
            </div>
            <div className="mt-6">
              <label
                className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.75rem] cursor-pointer py-3"
                htmlFor="name"
              >
                <div className="flex flex-row items-center gap-2">
                  <RiFilter2Fill className="text-text5 dark:text-text5_dark text-[20px]"/>
                  فیلتر وضعیت کامل بودن مرحله
                </div>
                <div className={`mt-1 flex-1 gap-2 w-full items-center justify-between`}>
                  <SelectInput
                    name="stage-game-completion-filter"
                    options={CompletionStatus}
                    onChange={(value) => setCompletionStatus(value)}
                    classes={"!text-[.75rem]"}
                  />
                </div>
              </label>
            </div>
            <div className="mt-6">
              <label
                className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.75rem] cursor-pointer py-3"
                htmlFor="name"
              >
                <div className="flex flex-row items-center gap-2">
                  <RiFilter2Fill className="text-text5 dark:text-text5_dark text-[20px]"/>
                  فیلتر وضعیت قابل مشاهده بودن
                </div>
                <div className={`mt-1 flex-1 gap-2 w-full items-center justify-between`}>
                  <SelectInput
                    name="stage-game-is-visible-filter"
                    options={VisibleStatus}
                    onChange={(value) => setVisible(value)}
                    classes={"!text-[.75rem]"}
                  />
                </div>
              </label>
            </div>
            <div className="mt-6">
              <label
                className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.75rem] cursor-pointer py-3"
                htmlFor="name"
              >
                <div className="flex flex-row items-center gap-2">
                  <RiFilter2Fill className="text-text5 dark:text-text5_dark text-[20px]"/>
                  فیلتر وضعیت فعال بودن
                </div>
                <div className={`mt-1 flex-1 gap-2 w-full items-center justify-between`}>
                  <SelectInput
                    name="stage-game-is-active-filter"
                    options={ActiveStatus}
                    onChange={(value) => setActive(value)}
                    classes={"!text-[.75rem]"}
                  />
                </div>
              </label>
            </div>
      </div>
    )
  }
  const footertryAgain = () => {
    setFooterLoading(true);
    setFooterTry(false);
    getDataForMore();
  };
  const dataContent = ()=>{
    return(
      <div id="scrollableDiv" className="w-full h-full overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center w-full h-full">
            <ScreenLoading notItem={noItem} getError={getError} tryAgain={tryAgain} />
          </div>
        ) : (
          <InfiniteScroll
            dataLength={data?.length}
            next={() => getDataForMore()}
            hasMore={!loading && footerLoading ? true : false}
            loader={
              !loading && data?.length > 0 ? (
                <FooterPaginate loading={footerLoading} footerTry={footerTry} tryOperation={footertryAgain} />
              ) : (
                ""
              )
            }
            scrollableTarget="scrollableDiv"
          >
            <ul
              role="list"
              className={`grid gap-4 sm:mx-auto sm:gap-6 grid-cols-1 mt-8 sm:mt-10 xl:grid-cols-2 2xl:grid-cols-3 px-4`}  // حذف auto-rows-fr
            >
              {data?.map((item: any, index: number) => (
                <li key={index.toString()} className="flex"> 
                  <WordGameStageCard
                    _id={item?._id}
                    letters={item.letters}
                    words={item.words}
                    hidden_words={item.hidden_words}
                    season={item?.season_info}
                    stage_number={item.stage_number_in_language}
                    stage_number_in_season={item.stage_number_in_season}
                    rtl={item?.language_info?.rtl}
                    language={item?.language_info?.name}
                    media={item?.media}
                    voice={item?.voice}
                    is_visible={item?.is_visible}
                    is_active={item?.is_active}
                    publication_status={item?.publication_status_label}
                    completion_status={item?.completion_status_label}
                  />
                </li>
              ))}
            </ul>
          </InfiniteScroll>
        )}

      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-60px)]">
      <div className="w-full h-full flex overflow-hidden">
        {/* محتوای اصلی همراه با سایدبار (در دسکتاپ) */}
        <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden">
          <div className="lg:hidden p-4">
            <GradientButton
              buttonText={"نمایش فیلترها"}
              onClickFn={() => setShowMobileFilter(true)}
              loading={false}
              classes="!text-base !flex-none !px-8 !w-full"
            />
          </div>
          {/* ستون فیلتر در دسکتاپ */}
          <div className="hidden lg:flex lg:flex-col lg:w-[280px] lg:shrink-0 bg-background2 dark:bg-background2_dark border-l border-border dark:border-border_dark shadow-lg z-10">
            <div className="flex-1 overflow-y-auto p-4">
              {filterContent()}
            </div>
            {/* فوتر */}
            <div className="sticky bottom-0 w-full">
              <FilterFooter
                buttonText="اعمال فیلتر"
                buttonFn={tryAgain}
                loadingButton={(loading == true && getError == false && noItem == false)?true:false}
                classes="w-full"
              />
            </div>
          </div>
          {/* ستون دیتا */}
          <div className="w-full lg:w-[calc(100%-290px)] overflow-y-auto h-full p-4 z-0">
            {dataContent()}
          </div>
          {/* لایه شفاف پشت فیلتر موبایل */}
          {showMobileFilter && (
            <div
              className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setShowMobileFilter(false)}
            />
          )}
          {/* فیلتر دراور کشویی در موبایل */}
          <div
            className={`
              fixed top-0 right-0 h-[calc(100%-150px)] z-50
              bg-background2 dark:bg-background2_dark
              transition-transform duration-300 ease-in-out
              ${showMobileFilter ? "translate-y-0" : "-translate-y-full"}
              rounded-b-2xl shadow-lg flex flex-col
              lg:hidden
              w-full sm:right-0 sm:left-0
              md:w-[calc(100%-288px)] md:right-auto md:left-0
            `}
          >
              <div className="overflow-y-auto p-4 flex-1 pt-[70px]">
                {filterContent()}
              </div>
              <div className="sticky bottom-0 w-full">
                <FilterFooter
                  buttonText="اعمال فیلتر"
                  buttonFn={() => {
                    setShowMobileFilter(false)
                    tryAgain()
                  }}
                  loadingButton={(loading == true && getError == false && noItem == false)?true:false}
                  classes="w-full"
                />
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
