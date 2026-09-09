"use client";

import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaCamera, FaMusic } from "react-icons/fa6";
import { BiTrash } from "react-icons/bi";
import ImageComponent from "@/components/ImageComponent";
import ShowImageModalHelper from "@/components/ShowMediaModal/ShowImageModalHelper";
import ShowImageModal from "@/components/ShowMediaModal/ShowImageModal";
import Footer from "@/components/Footer/Footer";
import { Switch } from "@headlessui/react";
import { useParams } from "next/navigation";
import ScreenLoading from "@/components/ScreenLoading";
import Globals from "@/utils/Globals";
import DialogHelper from "@/components/Dialog/DialogHelper";


const Page = () => {
  const { packageId } = useParams();
  const inputIconImageRef: any = useRef();
  const inputBannerImageRef: any = useRef();
  const inputMusicRef: any = useRef();
  const [data, setData] = useState<any>(null)
  const [changeVersionUpdated, setChangeVersionUpdated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [iconImage, setIconImage] = useState<any>(null);
  const [bannerImage, setBannerImage] = useState<any>(null);
  const [music, setMusic] = useState<any>(null)
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
            query getPackageGamePackageInformation(
              $_id : ID!,
            ){
                getPackageGamePackageInformation(
                  _id : $_id,
                ) {
                  title,
                  icon_image,
                  banner_image,
                  music{path, file_type, duration}
                }
            }
            `,
        variables: {
          _id : packageId
        },
      },
    }).then(async (response) => {
      const data = response.data.data.getPackageGamePackageInformation;
      if (data) {
        setData(data)
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
    if(!iconImage && !bannerImage && !music){
      toast.error("هیچ مورد جدیدی اضافه نشده است.", {
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
          mutation addNewMediaToPackageGamePackage(
            $_id : ID!,
            $icon_image : Upload,
            $banner_image : Upload,
            $music : FileInput,
            $change_version_updated : Boolean!
          ){
            addNewMediaToPackageGamePackage(
              _id : $_id,
              icon_image : $icon_image,
              banner_image : $banner_image,
              music : $music,
              change_version_updated : $change_version_updated,
            ) {
              status,
              message,
            }
          }
          `,
      variables: {
        _id : packageId,
        icon_image: null,
        banner_image: null,
        music: music?.file && music?.duration ? { file: null, duration: music.duration } : undefined,
        change_version_updated : changeVersionUpdated,
      },
    };
    const formData = new FormData();
    const map: Record<string, string[]> = {};
    let fileIndex = 0;
    const fileMap: Record<string, File> = {};
    if (iconImage?.file) {
      map[fileIndex.toString()] = ['variables.icon_image'];
      fileMap[fileIndex.toString()] = iconImage.file;
      fileIndex++;
    }
    if (bannerImage?.file) {
      map[fileIndex.toString()] = ['variables.banner_image'];
      fileMap[fileIndex.toString()] = bannerImage.file;
      fileIndex++;
    }
    if (music?.file && music?.duration) {
      map[fileIndex.toString()] = ['variables.music.file'];
      fileMap[fileIndex.toString()] = music.file;
      fileIndex++;
    }
    formData.append('operations', JSON.stringify(data));
    formData.append('map', JSON.stringify(map));

    for (const index in fileMap) {
      formData.append(index, fileMap[index]);
    }
    await axios({
        url: "/",
        method: "post",
        data: formData,
        headers: {
          Accept: "*/*",
          "Content-Type": "multipart/form-data",
        },
    }).then(async (response) => {
        setLoading(false);
        if (response.data?.data?.addNewMediaToPackageGamePackage?.status == 200) {
            toast.success(response.data?.data?.addNewMediaToPackageGamePackage?.message, {
              position: "top-center",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: typeof window !== "undefined" && localStorage.getItem("theme") == "dark" ? "dark" : "light",
            });
            setMusic(null)
            setBannerImage(null)
            setIconImage(null)
            getData()
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
      .catch((err) => {
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
  const handleAddIconPhoto = (e: any) => {
    const photo = e.target.files;
    const data = {
      file: photo[0],
      preview: URL.createObjectURL(photo[0]),
    };
    setIconImage(data);
    inputIconImageRef.current.value = "";
  };
  const handleAddBannerPhoto = (e: any) => {
    const photo = e.target.files;
    const data = {
      file: photo[0],
      preview: URL.createObjectURL(photo[0]),
    };
    setBannerImage(data);
    inputBannerImageRef.current.value = "";
  };
  const handleAddMusic = (e: any) => {
    const uri = URL.createObjectURL(e.target.files[0]);
    var musicElement = document.createElement("audio");
    musicElement.preload = "metadata";
    musicElement.src = URL.createObjectURL(e.target.files[0]);
    musicElement.onloadedmetadata = function () {
      const audios = e.target.files;
      window.URL.revokeObjectURL(musicElement.src);
      const duration = musicElement.duration;
      if (duration < 3) {
        toast.warning("موزیک متن نمیتواند کمتر از 3 ثانیه باشد", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: typeof window !== "undefined" && localStorage.getItem("theme") == "dark" ? "dark" : "light",
        });
      } else if (duration > 180) {
        toast.warning("موزیک متن نمیتواند بیشتر از 180 ثانیه باشد.", {
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
        const data = {
          file: audios[0],
          preview: uri,
          duration: duration.toFixed(0).toString(),
        };
        setMusic(data);
        inputMusicRef.current.value = "";
      }
    };
  };
  const dleteImage = (item: string) => {
    if (item == "icon") {
      setIconImage(null)
    } else if(item == "banner") {
      setBannerImage(null)
    }
  };
  const deletePreviousMedia = async ({path, type}:{path:string, type:string}) => {
    let data = {
      query: `
          mutation deleteMediaFromPackageGamePackage(
            $_id : ID!,
            $path : String!,
            $type : String!,
            $change_version_updated : Boolean!
          ){
            deleteMediaFromPackageGamePackage(
              _id : $_id,
              path : $path,
              type : $type,
              change_version_updated : $change_version_updated,
            ) {
              status,
              message,
            }
          }
          `,
      variables: {
        _id : packageId,
        path : path,
        type : type,
        change_version_updated : changeVersionUpdated,
      },
    };
    await axios({
      url: "/",
      method: "post",
      data: data,
    })
      .then(async (response) => {
        const res = response.data?.data?.deleteMediaFromPackageGamePackage
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
            getData()
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
      <h2>{}</h2>
      <p className="text-justify font-['iransans-md'] text-primary text-[16px] mb-2">
        <span className="text-text5 dark:text-text5_dark">بسته بازی </span>
        {`${data?.title}`}
      </p>
      {(data?.icon_image || data?.banner_image || data?.music)&& (
        <div className="border-2 border-dashed border-primary dark:border-primary rounded-md py-2 mt-4">
          <div className="flex justify-center items-center gap-4">
            {data?.icon_image&&(
                <div
                  className="relative w-20 h-20 sm:w-28 sm:h-28 cursor-pointer flex-shrink-0"
                  onClick={() =>
                    ShowImageModalHelper.showModal({
                      src: `${Globals.uri}${data?.icon_image}`,
                    })
                  }
                >
                  <ImageComponent
                    src={data?.icon_image}
                    alt="icon"
                    parentclasses="h-full w-full object-cover rounded-md cursor-pointer"
                  />
                </div>
            )}
            {data?.banner_image && (
              <div
                className="relative w-40 h-20 sm:w-60 sm:h-28 cursor-pointer"
                onClick={() =>
                  ShowImageModalHelper.showModal({
                    src: `${Globals.uri}${data?.banner_image}`,
                  })
                }
              >
                <ImageComponent
                  src={data?.banner_image}
                  alt="banner"
                  parentclasses="h-full w-full object-cover rounded-md cursor-pointer"
                />
              </div>
            )}
            {data?.music && (
            <div className="relative bg-primary rounded-lg p-4 w-full max-w-xs mx-auto mb-2">
              <audio
                src={`${Globals.uri}${data?.music?.path}`}
                controls
                className="w-full rounded-md"
              />
              <div className="absolute top-2 left-2">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    DialogHelper.showDialog({
                      bodyText:`آیا این آیتم حذف شود؟`,
                      buttons:[
                        {
                          onClickFn:()=>{
                            deletePreviousMedia({path:data?.music?.path, type:"music"})
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
                  className="w-6 h-6 bg-black/50 text-white hover:bg-black/70 rounded flex items-center justify-center"
                >
                  <BiTrash size={14} />
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      )}
      <div className="flex gap-6 justify-center font-['iransans-md'] mt-4">
        <label
          className="text-text6 dark:text-text6_dark border-2 border-dashed border-text5 dark:border-text5_dark py-6 text-lg flex-1 rounded-md cursor-pointer transition sm:hover:bg-border2 sm:dark:hover:bg-border2_dark flex flex-col justify-center items-center gap-y-2"
          htmlFor="upload_file_photo_icon"
          tabIndex={0}
        >
          <div className="text-4xl">
            <FaCamera />
          </div>
          <p className="text-xs 3xs:text-sm text-center">تغییر عکس آیکون</p>
          <input
            ref={inputIconImageRef}
            autoComplete="off"
            tabIndex={-1}
            className="hidden"
            id="upload_file_photo_icon"
            type="file"
            accept="image/*"
            onChange={handleAddIconPhoto}
          />
        </label>
        <label
          className="text-text6 dark:text-text6_dark border-2 border-dashed border-text5 dark:border-text5_dark py-6 text-lg flex-1 rounded-md cursor-pointer transition sm:hover:bg-border2 sm:dark:hover:bg-border2_dark flex flex-col justify-center items-center gap-y-2"
          htmlFor="upload_file_photo_banner"
        >
          <div className="text-4xl">
            <FaCamera />
          </div>
          <p className="text-xs 3xs:text-sm text-center">تغییر عکس بنر</p>
          <input
            ref={inputBannerImageRef}
            className="hidden"
            id="upload_file_photo_banner"
            type="file"
            accept="image/*"
            onChange={handleAddBannerPhoto}
          />
        </label>
        <label
          className="text-text6 dark:text-text6_dark border-2 border-dashed border-text5 dark:border-text5_dark py-6 text-lg flex-1 rounded-md cursor-pointer transition sm:hover:bg-border2 sm:dark:hover:bg-border2_dark flex flex-col justify-center items-center gap-y-2"
          htmlFor="upload_file_audio"
        >
          <div className="text-4xl">
            <FaMusic />
          </div>
          <p className="text-xs 3xs:text-sm text-center">{data?.music?"تغییر موزیک":"افزودن موزیک"}</p>
          <input
            ref={inputMusicRef}
            className="hidden"
            id="upload_file_audio"
            type="file"
            accept=".mp3,audio/mpeg"
            onChange={handleAddMusic}
          />
        </label>
      </div>

      {(iconImage || bannerImage || music) && (
        <div className="mt-4 border-2 border-dashed border-primary rounded-md py-4 px-2">
          <div className="flex justify-center items-center gap-4">
            {iconImage && (
              <div
                className="relative w-20 h-20 sm:w-28 sm:h-28 cursor-pointer flex-shrink-0"
                onClick={() =>
                  ShowImageModalHelper.showModal({
                    src: iconImage.preview,
                  })
                }
              >
                <ImageComponent
                  src={iconImage.preview}
                  alt="icon"
                  baseURI={false}
                  parentclasses="h-full w-full object-cover rounded-md cursor-pointer"
                />
                <div className="absolute top-0 w-full flex justify-between px-1 pt-1">
                  <div
                    onClick={(e: any) => {
                      e.stopPropagation();
                      dleteImage("icon");
                    }}
                    className="flex justify-center items-center rounded transition text-white bg-[#00000080] hover:bg-[#33333370] text-lg w-6 h-6"
                  >
                    <BiTrash />
                  </div>
                </div>
              </div>
            )}
            {bannerImage && (
              <div
                className="relative w-40 h-20 sm:w-60 sm:h-28 cursor-pointer"
                onClick={() =>
                  ShowImageModalHelper.showModal({
                    src: bannerImage.preview,
                  })
                }
              >
                <ImageComponent
                  src={bannerImage.preview}
                  alt="banner"
                  baseURI={false}
                  parentclasses="h-full w-full object-cover rounded-md cursor-pointer"
                />
                <div className="absolute top-0 w-full flex justify-between px-1 pt-1">
                  <div
                    onClick={(e: any) => {
                      e.stopPropagation();
                      dleteImage("banner");
                    }}
                    className="flex justify-center items-center rounded transition text-white bg-[#00000080] hover:bg-[#33333370] text-lg w-6 h-6"
                  >
                    <BiTrash />
                  </div>
                </div>
              </div>
            )}
            {music && (
              <div className="relative bg-primary rounded-lg p-4 w-full max-w-xs mx-auto mb-2">
                <audio
                  src={music.preview}
                  controls
                  className="w-full rounded-md"
                />
                <div className="absolute top-2 left-2">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setMusic(null)
                    }}
                    className="w-6 h-6 bg-black/50 text-white hover:bg-black/70 rounded flex items-center justify-center"
                  >
                    <BiTrash size={14} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
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
      <Footer buttonFn={registerAndConfirm} buttonText="بارگذاری موارد جدید" loadingButton={loading} classes="md:!mr-72 !justify-end" />
      <ShowImageModal
        ref={(Ref) => {
          ShowImageModalHelper.setRef(Ref);
        }}
      />
    </div>
  );
};

export default Page;
