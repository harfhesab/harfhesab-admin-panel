"use client";

import { Dialog, Transition } from "@headlessui/react";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import ScreenLoading from "../ScreenLoading";
import axios from "axios";
import Io5Icons from "@/utils/Icons/Io5Icons";
import { IoArrowForwardOutline } from "react-icons/io5";
import Input from "../Input";
import InfiniteScroll from "react-infinite-scroll-component";
import FooterPaginate from "../FooterPaginate";
import Border from "../Border";
import { useTheme } from "next-themes";
import { HarfAkharListModalInterface } from "@/interfaces/ModalInterface";
import { toast } from "react-toastify";
import HarfAkharSelectItem from "./HarfAkharSelectItem";

const HarfAkharList = forwardRef((_, ref) => {
  const { theme } = useTheme();
  const [numberSelected, setNumberSelected] = useState(1);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [getError, setGetError] = useState(false);
  const [noItem, setNoItem] = useState(false);
  const [footerTry, setFooterTry] = useState(false);
  const [buttons, setButtons] = useState<any>([]);
  const [footerLoading, setFooterLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<any>(null);
  const [extendedState, setExtendedState] = useState<any>({
    _id: [],
    title: [],
    image: []
  });
  const handleBackBrowserBtn = () => {
    const back = true;
    closeModal(back);
  };
  const handleHistoryPopState: any = () => {
    window.history.back();
  };

  const openModal = (options: HarfAkharListModalInterface) => {
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handleBackBrowserBtn);
    setIsOpen(true);
    setButtons(options?.buttons ? options.buttons : []);
    getDataForFirst(null);
    setNumberSelected(options?.numberSelected ? options.numberSelected : 1);
    if (options.previousSelected) {
      setExtendedState({
        _id: options?.previousSelected._id,
        title: options?.previousSelected.title,
        image: options?.previousSelected.image,
      });
    }
  };

  const closeModal = (back?: boolean) => {
    if (!back) {
      window.dispatchEvent(new PopStateEvent("popstate", handleHistoryPopState()));
    }
    window.removeEventListener("popstate", handleBackBrowserBtn);
    setIsOpen(false);
    setButtons([]);
    setNumberSelected(1);
    setExtendedState({
      _id: [],
      title: [],
      image: []
    });
    setSearch("");
    setData([]);
    setPage(1);
    setLoading(true);
    setGetError(false);
    setNoItem(false);
    setFooterTry(false);
    setFooterLoading(false);
    setSearchTimeout(null);
  };

  useImperativeHandle(ref, () => ({
    openModal,
    closeModal,
  }));

  const getDataForFirst = async (txt: any) => {
    await axios({
      url: "/",
      method: "post",
      data: {
        query: `
            query paginateHarfAkharChallengesForAdmin($page : Int, $search : String){
                paginateHarfAkharChallengesForAdmin(page : $page, search : $search) {
                    list{
                      _id,
                      title,
                      description,
                      start_date,
                      end_date,
                      media{path, file_type, duration},
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
          page: 1,
          search: txt,
        },
      },
    })
      .then((response) => {
        const riciveData = response.data.data.paginateHarfAkharChallengesForAdmin;
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
      .catch(() => {
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
            query paginateHarfAkharChallengesForAdmin($page : Int, $search : String){
                paginateHarfAkharChallengesForAdmin(page : $page, search : $search) {
                    list{
                      _id,
                      title,
                      description,
                      start_date,
                      end_date,
                      media{path, file_type, duration},
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
          page: page,
          search: search?.length > 0?search:null,
        },
      },
    })
      .then((response) => {
        const riciveData = response.data.data.paginateHarfAkharChallengesForAdmin;
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
      .catch(() => {
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
    getDataForFirst("");
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

  const deletedItem = ({ item }: { item: any }) => {
    const index = extendedState._id.findIndex((i: any) => i == item._id);
    extendedState._id.splice(index, 1);
    extendedState.title.splice(index, 1);
    extendedState.image.splice(index, 1)
    setExtendedState({ ...extendedState });
  };
  const selectedItem = ({ item }: { item: any }) => {
    if (numberSelected == 1) {
      const _id = item._id;
      const title = item.title;
      const image = item.icon_image;
      setExtendedState({
        _id: [_id],
        title: [title],
        image: [image]
      });
    } else {
      if (extendedState._id.length < numberSelected) {
        const _id = item._id;
        const title = item.title;
        const image = item.icon_image;
        extendedState._id.push(_id);
        extendedState.title.push(title);
        extendedState.image.push(image)
        setExtendedState({ ...extendedState });
      } else {
        toast.warning(`بیشتر از ${numberSelected} مورد نمیتوانید انتخاب کنید.`, {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: typeof window !== "undefined" && localStorage.getItem("theme") == "dark" ? "dark" : "light",
        });
        return false;
      }
    }
  };

  const scrollHorizontal = (e: any) => {
    if (typeof window !== "undefined") {
      const activeFiltersWrapper = document.getElementById("selectedContacts-wrapper");
      activeFiltersWrapper?.scrollBy({
        left: e.deltaY < 0 ? 200 : -200,
        behavior: "smooth",
      });
    }
  };

  const deleteItemFromHeader = (index: number) => {
    extendedState._id.splice(index, 1);
    extendedState.title.splice(index, 1);
    extendedState.image.splice(index, 1)
    setExtendedState({ ...extendedState });
  };
  const footertryAgain = () => {
    setFooterLoading(true);
    setFooterTry(false);
    getDataForMore();
  };

  return (
    <div>
      <Transition.Root show={isOpen} as={React.Fragment}>
        <Dialog
          autoFocus={true}
          as="div"
          className="relative z-[1000]"
          onClose={() => {
            closeModal();
          }}
          onTouchEnd={(e: any) => {
            e.preventDefault();
          }}
        >
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-background4_dark bg-opacity-80 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-center justify-center text-center sm:items-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel
                  onTouchEnd={(e: any) => {
                    e.stopPropagation();
                  }}
                  className="relative transform overflow-hidden sm:rounded-lg text-left transition-all modal-box p-0 bg-background2 dark:bg-background2_dark w-full min-w-[90vw] sm:min-w-0 sm:max-w-lg 2xl:max-w-2xl h-[100dvh] flex flex-col justify-between"
                >
                  <div className="h-full bg-background dark:bg-background_dark">
                    <div className="flex items-center justify-center">
                      <div className="flex flex-col h-[100dvh] flex-1 text-right dark:text-text_dark">
                        <div className={`${extendedState?._id?.length > 0 ? "h-[146px]" : "h-[106px]"}`}>
                          <Dialog.Title
                            as="h3"
                            className={`bg-background2 dark:bg-background2_dark font-['iransans-md'] w-full text-right border-b border-border2 dark:border-border2_dark text-lg dark:text-text2_dark text-text2`}
                          >
                            <div className="pt-4 pb-3 px-2 sm:px-6 flex items-center justify-between">
                              <div className="flex items-center">
                                <div
                                  className="text-3xl flex sm:hidden justify-center items-center p-2 rounded text-text6 dark:text-text6_dark cursor-pointer transition hover:bg-background6 dark:hover:bg-background6_dark w-10 h-10"
                                  onClick={() => {
                                    closeModal();
                                  }}
                                >
                                  <IoArrowForwardOutline />
                                </div>
                                <div className="text-text6 dark:text-text6_dark text-right text-[.9rem] sm:text-[.95rem]">
                                  {"چالش‌های حرف آخر"}
                                </div>
                              </div>
                              <div
                                className="text-2xl cursor-pointer rounded-md text-text5 dark:text-text5_dark hover:bg-border dark:hover:bg-border_dark transition hidden sm:block"
                                onClick={() => {
                                  closeModal();
                                }}
                              >
                                <Io5Icons icon={"IoClose"} />
                              </div>
                            </div>
                            <div className="z-50 right-0 left-0 fixed sm:static bg-background2 dark:bg-background2_dark sm:!bg-transparent shadow-[0_4px_2px_-2px_rgba(0,0,0,0.15)] sm:shadow-none px-4 pb-2">
                              <Input
                                onKeyDownFn={submitSearch}
                                value={search}
                                type="search"
                                changeState={(e: string) => handleSearch(e)}
                                SearchLoading={
                                  loading && search.length > 0 && getError == false && noItem == false ? true : false
                                }
                                placeholder="جستجوی عناوین چالش‌ها..."
                                inputStyles="!text-[14px] placeholder:!text-[11px]"
                                searchIconStyle="!hidden"
                                clearSearchIconStyles="!text-base"
                                clearFn={clearSearchFn}
                              />
                            </div>
                            {extendedState?._id?.length > 0 && (
                              <div
                                id="selectedContacts-wrapper"
                                onWheel={scrollHorizontal}
                                className="z-[1000] sm:z-auto flex font-['iransans-md'] text-xs gap-3 overflow-x-auto no-scrollbar px-4 pb-2 mt-14 sm:mt-0 max-w-lg 2xl:max-w-2xl"
                              >
                                {extendedState.title.map((item: any, index: number) => (
                                  <div
                                    className="flex border items-center gap-2 border-primary py-[.3rem] px-2 rounded-md text-primary shrink-0 bg-rgba4 dark:bg-rgba3 select-none"
                                    key={`${item}${index}`}
                                  >
                                    {item}
                                    <div
                                      className="text-lg cursor-pointer rounded-md text-primary bg-background dark:bg-background_dark hover:bg-border dark:hover:bg-border_dark transition border border-primary"
                                      onClick={() => deleteItemFromHeader(index)}
                                    >
                                      <Io5Icons icon={"IoClose"} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </Dialog.Title>
                        </div>
                        <main className={`${extendedState?._id?.length > 0 ? "mt-5 sm:mt-0" : "mt-12 sm:mt-0"}`}>
                          {loading ? (
                            <div className="flex justify-center items-center h-[calc(100dvh-170px)]">
                              <ScreenLoading notItem={noItem} getError={getError} tryAgain={tryAgain} />
                            </div>
                          ) : (
                            <div
                              id="scrollableDiv"
                              className={`${extendedState?._id?.length > 0
                                ? " !h-[calc(100dvh-230px)] sm:!h-[calc(100dvh-210px)]"
                                : "!h-[calc(100dvh-180px)] sm:!h-[calc(100dvh-170px)]"
                                } overflow-y-auto ${theme == "dark" ? "custom-scrollbar-dark" : "custom-scrollbar"}`}
                            >
                              <InfiniteScroll
                                dataLength={data?.length}
                                next={() => getDataForMore()}
                                hasMore={!loading && footerLoading ? true : false}
                                scrollableTarget="scrollableDiv"
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
                              >
                                <ul role="list" className={`flex flex-col`}>
                                  {data?.map((item: any, index: number) => (
                                    <div
                                      className="px-4 hover:bg-border2 dark:hover:bg-border2_dark transition cursor-pointer"
                                      key={index.toString()}
                                    >
                                      <HarfAkharSelectItem
                                        _id={item._id}
                                        title={item.title}
                                        description={item?.description}
                                        checked={extendedState._id.find((i: any) => i == item._id) ? true : false}
                                        numberSelect={numberSelected}
                                        imageSrc={item.media[0].path}
                                        deletedItem={() => deletedItem({ item })}
                                        selectedItem={() => selectedItem({ item })}
                                        start_date={item?.start_date}
                                        end_date={item?.end_date}
                                      />
                                      <Border />
                                    </div>
                                  ))}
                                </ul>
                              </InfiniteScroll>
                            </div>
                          )}
                        </main>
                        {buttons?.length > 0 && (
                          <div className="modal-action border-t border-border2 dark:border-border2_dark py-[.15rem] px-4 bg-background2 dark:bg-background2_dark flex gap-3 items-center">
                            {buttons?.length &&
                              buttons.map((button: any, index: number) => (
                                <button
                                  key={index.toString()}
                                  className={`flex-1 rounded py-2 sm:py-[0.7rem] h-[43px] sm:h-[45px] px-6 my-2 border-border text-xs sm:text-sm hover:opacity-80 transition text-primary_start focus:outline-none font-['iransans-md']
                  ${button.type == "bold"
                                      ? "bg-gradient-to-b from-primary_start to-primary_end text-white"
                                      : button.type == "border"
                                        ? "text-text dark:text-text_dark border border-border dark:border-border_dark bg-background dark:bg-background_dark hover:bg-background6 dark:hover:bg-background6_dark"
                                        : "bg-gradient-to-b from-primary_start to-primary_end text-white"
                                    }`}
                                  onClick={() => {
                                    if(button?.type == "bold" && extendedState?._id?.length > 0){
                                      button?.onClickFn({ data: extendedState });
                                    } else if(button?.type !== "bold") {
                                      button?.onClickFn();
                                    }
                                  }}
                                >
                                  {button.buttonText}
                                </button>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
});

HarfAkharList.displayName = "HarfAkharList";
export default HarfAkharList;