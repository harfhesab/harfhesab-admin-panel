
"use client";

import React, { useEffect, useRef, useState } from "react";
import FooterPaginate from "@/components/FooterPaginate";
import ScreenLoading from "@/components/ScreenLoading";
import InfiniteScroll from "react-infinite-scroll-component";
import axios from "axios";
import Input from "@/components/Input";
import SelectInput from "@/components/SelectInput";
import FilterFooter from "@/components/Footer/FilterFooter";
import GradientButton from "@/components/GradientButton";
import { IoSearch } from "react-icons/io5";
import { RiFilter2Fill } from "react-icons/ri";
import UserItem from "@/components/ListItems/User/UserItem";

// ============================================================
// گزینه‌های مرتب‌سازی کاربران
// ============================================================

const UserSortOptions = [
  { value: null, label: "بدون مرتب‌سازی" },
  { value: "last_seen", label: "جدیدترین بازدیدها ابتدا" },
  { value: "number_open_app", label: "بیشترین دفعات ورود ابتدا" },
];

// ============================================================
// کوئری GraphQL
// ============================================================

const GET_ALL_USER_QUERY = `
  query getAllUserForAdmin(
    $page: Int,
    $limit: Int,
    $search: String,
    $filter_last_seen: Boolean,
    $filter_number_open_app: Boolean,
  ) {
    getAllUserForAdmin(
      page: $page,
      limit: $limit,
      search: $search,
      filter_last_seen: $filter_last_seen,
      filter_number_open_app: $filter_number_open_app,
    ) {
      list {
        _id,
        type,
        phone,
        user_name,
        first_name,
        last_name,
        number_coins,
        last_seen,
        number_open_app,
        createdAt
      },
      hasNextPage,
      nextPage
    }
  }
`;

const Page = () => {
  // ============================================================
  // State ها
  // ============================================================

  const [search, setSearch] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [getError, setGetError] = useState(false);
  const [noItem, setNoItem] = useState(false);

  const [footerTry, setFooterTry] = useState(false);
  const [footerLoading, setFooterLoading] = useState(false);

  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // مرتب‌سازی کاربران
  const [userSort, setUserSort] = useState<string | null>(null);

  // مدیریت تایمر جستجو
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ============================================================
  // دریافت اطلاعات اولیه
  // ============================================================

  useEffect(() => {
    getDataForFirst();

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  // ============================================================
  // متغیرهای مشترک درخواست GraphQL
  // ============================================================

  const getQueryVariables = (
    currentPage: number,
    searchText: string
  ) => {
    return {
      page: currentPage,
      search: searchText?.length > 1 ? searchText : undefined,

      filter_last_seen:
        userSort === "last_seen" ? true : undefined,

      filter_number_open_app:
        userSort === "number_open_app" ? true : undefined,
    };
  };

  // ============================================================
  // دریافت اطلاعات صفحه اول
  // ============================================================

  const getDataForFirst = async (txt?: string) => {
    const searchText = txt ?? "";

    try {
      const response = await axios({
        url: "/",
        method: "post",
        data: {
          query: GET_ALL_USER_QUERY,
          variables: getQueryVariables(1, searchText),
        },
      });

      const riciveData = response.data.data.getAllUserForAdmin;

      if (riciveData.hasNextPage === true) {
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
          setPage(1);
          setLoading(true);
          setData([]);
          setNoItem(true);
        }
      }
    } catch (err) {
      setFooterLoading(false);
      setLoading(true);
      setFooterTry(false);
      setGetError(true);
      setData([]);
    }
  };

  // ============================================================
  // دریافت صفحات بعدی
  // ============================================================

  const getDataForMore = async () => {
    try {
      const response = await axios({
        url: "/",
        method: "post",
        data: {
          query: GET_ALL_USER_QUERY,
          variables: getQueryVariables(page, search),
        },
      });

      const riciveData = response.data.data.getAllUserForAdmin;

      if (riciveData.hasNextPage === true) {
        setData((prev) => [...prev, ...riciveData.list]);
        setPage(riciveData.nextPage);
        setFooterLoading(true);
      } else {
        if (riciveData.list.length > 0) {
          setFooterLoading(false);
          setPage(page);
          setData((prev) => [...prev, ...riciveData.list]);
        } else {
          setFooterLoading(false);
          setNoItem(data.length > 0 ? false : true);
          setLoading(data.length > 0 ? false : true);
        }
      }
    } catch (err) {
      setLoading(data.length > 0 ? false : true);
      setFooterTry(data.length > 0 ? true : false);
      setGetError(data.length > 0 ? false : true);
    }
  };

  // ============================================================
  // جستجوی کاربران
  // ============================================================

  const handleSearch = (e: string) => {
    setSearch(e);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      setPage(1);
      setLoading(true);
      setFooterLoading(false);
      setGetError(false);
      setNoItem(false);
      setFooterTry(false);
      setData([]);

      getDataForFirst(e);

      searchTimeout.current = null;
    }, 1500);
  };

  // ============================================================
  // ثبت جستجو
  // ============================================================

  const submitSearch = () => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
      searchTimeout.current = null;
    }

    setPage(1);
    setLoading(true);
    setFooterLoading(false);
    setGetError(false);
    setNoItem(false);
    setFooterTry(false);
    setData([]);

    getDataForFirst(search);
  };

  // ============================================================
  // پاک کردن جستجو
  // ============================================================

  const clearSearchFn = () => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
      searchTimeout.current = null;
    }

    setSearch("");

    setPage(1);
    setLoading(true);
    setFooterLoading(false);
    setGetError(false);
    setNoItem(false);
    setFooterTry(false);
    setData([]);

    getDataForFirst("");
  };

  // ============================================================
  // تغییر مرتب‌سازی
  // ============================================================

  const changeUserSort = (value: string | null) => {
    setUserSort(value);
  };

  // ============================================================
  // اعمال فیلترها و تلاش مجدد
  // ============================================================

  const tryAgain = () => {
    setFooterLoading(false);
    setLoading(true);
    setGetError(false);
    setNoItem(false);
    setPage(1);
    setFooterTry(false);
    setData([]);

    getDataForFirst(search);
  };

  // ============================================================
  // محتوای فیلترها
  // ============================================================

  const filterContent = () => {
    return (
      <div>

        {/* جستجوی کاربران */}

        <div>
          <label
            className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.75rem] cursor-pointer py-3"
            htmlFor="search-user"
          >
            <div className="flex flex-row items-center gap-2">
              <IoSearch className="text-text5 dark:text-text5_dark text-[20px]" />
              جستجوی کاربر
            </div>

            <div className="mt-1 flex gap-2 w-full items-center justify-between">
              <Input
                type="search"
                id="search-user"
                value={search}
                classes="flex-1"
                onKeyDownFn={submitSearch}
                changeState={(e: string) => handleSearch(e)}
                SearchLoading={
                  loading &&
                  search.length > 0 &&
                  getError == false &&
                  noItem == false
                    ? true
                    : false
                }
                placeholder="جستجوی کاربر"
                inputStyles="!text-[14px] lg:!h-[35px] placeholder:!text-[11px]"
                searchIconStyle="!hidden"
                clearSearchIconStyles="!text-base"
                clearFn={clearSearchFn}
              />
            </div>
          </label>
        </div>

        <div className="mt-4 w-full border-2 border-dashed border-text5 dark:border-text5_dark" />

        {/* مرتب‌سازی کاربران */}

        <div className="mt-6">
          <label
            className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.75rem] cursor-pointer py-3"
          >
            <div className="flex flex-row items-center gap-2">
              <RiFilter2Fill className="text-text5 dark:text-text5_dark text-[20px]" />
              مرتب‌سازی کاربران
            </div>

            <div className="mt-1 flex-1 gap-2 w-full items-center justify-between">
              <SelectInput
                name="user-sort"
                options={UserSortOptions}
                onChange={(value) => changeUserSort(value)}
                classes="!text-[.75rem]"
              />
            </div>
          </label>
        </div>

      </div>
    );
  };

  // ============================================================
  // تلاش مجدد برای دریافت صفحات بعدی
  // ============================================================

  const footertryAgain = () => {
    setFooterLoading(true);
    setFooterTry(false);
    getDataForMore();
  };

  // ============================================================
  // نمایش اطلاعات کاربران
  // ============================================================

  const dataContent = () => {
    return (
      <div id="scrollableDiv" className="w-full h-full overflow-y-auto">

        {loading ? (
          <div className="flex justify-center items-center w-full h-full">
            <ScreenLoading
              notItem={noItem}
              getError={getError}
              tryAgain={tryAgain}
            />
          </div>
        ) : (
          <InfiniteScroll
            dataLength={data?.length}
            next={() => getDataForMore()}
            hasMore={!loading && footerLoading ? true : false}
            loader={
              !loading && data?.length > 0 ? (
                <FooterPaginate
                  loading={footerLoading}
                  footerTry={footerTry}
                  tryOperation={footertryAgain}
                />
              ) : (
                ""
              )
            }
            scrollableTarget="scrollableDiv"
          >
            <ul
              role="list"
              className="grid gap-4 sm:mx-auto sm:gap-6 grid-cols-1 mt-8 sm:mt-10 xl:grid-cols-2 2xl:grid-cols-3 px-4"
            >
              {data?.map((item: any, index: number) => (
                <li
                  key={item?._id ?? index.toString()}
                  className="flex"
                >
                  <UserItem
                    _id={item._id}
                    type={item?.type}
                    user_name={item?.user_name}
                    first_name={item?.first_name}
                    last_name={item?.last_name}
                    phone={item?.phone}
                    number_coins={item?.number_coins}
                    last_seen={item?.last_seen}
                    number_open_app={item?.number_open_app}
                    createdAt={item?.createdAt}
                  />
                </li>
              ))}
            </ul>
          </InfiniteScroll>
        )}

      </div>
    );
  };

  // ============================================================
  // رندر صفحه
  // ============================================================

  return (
    <div className="h-[calc(100vh-60px)]">
      <div className="w-full h-full flex overflow-hidden">

        <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden">

          {/* دکمه نمایش فیلترها در موبایل */}

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

            {/* فوتر فیلتر */}

            <div className="sticky bottom-0 w-full">
              <FilterFooter
                buttonText="اعمال فیلتر"
                buttonFn={tryAgain}
                loadingButton={
                  loading == true &&
                  getError == false &&
                  noItem == false
                    ? true
                    : false
                }
                classes="w-full"
              />
            </div>

          </div>

          {/* ستون نمایش کاربران */}

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

          {/* فیلتر کشویی موبایل */}

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

            {/* فوتر فیلتر موبایل */}

            <div className="sticky bottom-0 w-full">
              <FilterFooter
                buttonText="اعمال فیلتر"
                buttonFn={() => {
                  setShowMobileFilter(false);
                  tryAgain();
                }}
                loadingButton={
                  loading == true &&
                  getError == false &&
                  noItem == false
                    ? true
                    : false
                }
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
