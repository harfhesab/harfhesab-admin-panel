"use client";

import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaCamera, FaMusic, FaPlay, FaVideo } from "react-icons/fa6";
import DialogHelper from "@/components/Dialog/DialogHelper";
import { BiTrash } from "react-icons/bi";
import { IoIosVideocam } from "react-icons/io";
import { secondsToTime } from "@/utils/SecondToTime";
import ImageComponent from "@/components/ImageComponent";
import ShowVideoModalHelper from "@/components/ShowMediaModal/ShowVideoModalHelper";
import ShowImageModalHelper from "@/components/ShowMediaModal/ShowImageModalHelper";
import ModalInputHelper from "@/components/ModalInput/ModalInputHelper";
import ShowVideoModal from "@/components/ShowMediaModal/ShowVideoModal";
import ShowImageModal from "@/components/ShowMediaModal/ShowImageModal";
import ModalInput from "@/components/ModalInput/ModalInput";
import Footer from "@/components/Footer/Footer";
import Border from "@/components/Border";
import { Switch } from "@headlessui/react";
import ScreenLoading from "@/components/ScreenLoading";
import { useParams } from "next/navigation";
import Globals from "@/utils/Globals";


const Page = () => {
  const { challengeId } = useParams();
  const inputImageRef: any = useRef();
  const inputVideoRef: any = useRef();
  const inputMusicRef: any = useRef();
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<any>([]);
  const [video, setVideo] = useState<any>([]);
  const media = video.concat(image);
  const [music, setMusic] = useState<any[]>([])
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
            query getHarfAkharChallengeInformationForAdmin(
              $_id : ID!,
            ){
                getHarfAkharChallengeInformationForAdmin(
                  _id : $_id,
                ) {
                    _id,
                    media{path, file_type, duration, order},
                    voice{path, file_type, duration, order},
                }
            }
            `,
        variables: {
          _id : challengeId
        },
      },
    }).then(async (response) => {
        const data = response.data.data.getHarfAkharChallengeInformationForAdmin;
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

  const deletePreviousMedia = async ({path, type}:{path:string, type:string}) => {
    let data = {
      query: `
          mutation deleteMediaFromHarfAkharChallenge(
            $_id : ID!,
            $path : String!,
            $type : String!,
          ){
            deleteMediaFromHarfAkharChallenge(
              _id : $_id,
              path : $path,
              type : $type,
            ) {
              status,
              message,
            }
          }
          `,
      variables: {
        _id : challengeId,
        path : path,
        type : type,
      },
    };
    await axios({
      url: "/",
      method: "post",
      data: data,
    })
      .then(async (response) => {
        const res = response.data?.data?.deleteMediaFromHarfAkharChallenge
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

  const registerAndConfirm = ()=>{
    if(media.length == 0 && !music){
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
    let queryData = {
      query: `
          mutation addNewMediaToHarfAkharChallenge(
            $_id : ID!,
            $media : [FileInput],
            $voice : [FileInput],
          ){
            addNewMediaToHarfAkharChallenge(
              _id : $_id,
              media : $media,
              voice : $voice,
            ) {
              status,
              message,
            }
          }
          `,
      variables: {
        _id : challengeId,
        media: media?.length > 0? media.map((item:any, index:number) => ({
          file: null,
          order: (index+1),
          duration: item.duration??undefined,
        })):undefined,
        voice : music?.length > 0? music.map((item:any, index:number) => ({
          file: null,
          order: (index+1),
          duration: item.duration??undefined,
        })):undefined,
      },
    };
    const map: any = {};
    const formD = new FormData();
    let fileIndex = 0;
    formD.append("operations", JSON.stringify(queryData));
    if (media?.length > 0) {
      media.forEach((item: any, index: number) => {
        map[fileIndex] = [`variables.media.${index}.file`];
        fileIndex++;
      });
    }
    if (music?.length > 0) {
      music.forEach((item: any, index: number) => {
        map[fileIndex] = [`variables.voice.${index}.file`];
        fileIndex++;
      });
    }
    formD.append("map", JSON.stringify(map));
    fileIndex = 0;
    if (media?.length > 0) {
      media.forEach((item: any) => {
        formD.append(`${fileIndex}`, item.file);
        fileIndex++;
      });
    }
    if (music?.length > 0) {
      music.forEach((item: any) => {
        formD.append(`${fileIndex}`, item.file);
        fileIndex++;
      });
    }
    await axios({
      url: "/",
      method: "post",
      data: formD,
      headers: {
        Accept: "*/*",
        "Content-Type": "multipart/form-data",
      },
    })
      .then(async (response) => {
        setLoading(false);
        if (response.data?.data?.addNewMediaToHarfAkharChallenge?.status == 200) {
            toast.success(response.data?.data?.addNewMediaToHarfAkharChallenge?.message, {
              position: "top-center",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: typeof window !== "undefined" && localStorage.getItem("theme") == "dark" ? "dark" : "light",
            });
            setMusic([])
            setImage([])
            setVideo([])
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
        setLoading(false);
      });
  }

  const handleAddPhotos = (e: any) => {
    const photos = e.target.files;
    if (photos.length > 10) {
      toast.warning("بیشتر از 10 عکس نمی‌توانید برای فصل انتخاب کنید.", {
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
      if (image.length + photos.length > 10) {
        toast.warning("بیشتر از 10 عکس نمی‌توانید برای فصل انتخاب کنید.", {
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
        const newData: any = [...image];
        for (let index = 0; index < photos.length; index++) {
          const data = {
            file: photos[index],
            preview: URL.createObjectURL(photos[index]),
          };
          newData.push(data);
        }
        setImage(newData);
      }
      inputImageRef.current.value = "";
    }
  };

  const handleAddVideos = (e: any) => {
    const uri = URL.createObjectURL(e.target.files[0]);
    var videoElement = document.createElement("video");
    videoElement.preload = "metadata";
    videoElement.src = URL.createObjectURL(e.target.files[0]);
    videoElement.onloadedmetadata = function () {
      const videos = e.target.files;
      window.URL.revokeObjectURL(videoElement.src);
      const duration = videoElement.duration;
      if (duration < 30) {
        toast.warning("ویدیوی انتخابی نمیتواند کمتر از 30 ثانیه باشد.", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: typeof window !== "undefined" && localStorage.getItem("theme") == "dark" ? "dark" : "light",
        });
      } else if (duration > 120) {
        toast.warning("ویدیوی انتخابی نمیتواند بیشتر از 120 ثانیه باشد.", {
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
        const items: any = [];
        const data = {
          file: videos[0],
          preview: uri,
          duration: duration.toFixed(0).toString(),
        };
        items.push(data);
        setVideo(items);
        inputVideoRef.current.value = "";
      }
    };
  };
  const handleAddMusic = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files || []);

    if (files.length > 4 || files.length + music.length > 4) {
      toast.warning("بیشتر از 4 صدا نمیتوانید برای مرحله انتخاب کنید.", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: typeof window !== "undefined" && localStorage.getItem("theme") == "dark" ? "dark" : "light",
      });
      return;
    }

    const newData: any[] = [...music];

    const audioPromises = files.map((file) => {
      return new Promise<any | null>((resolve) => {
        const objectURL = URL.createObjectURL(file);
        const audioEl = document.createElement("audio");
        audioEl.preload = "metadata";
        audioEl.src = objectURL;

        audioEl.onloadedmetadata = function () {
          const duration = audioEl.duration;

          if (duration < 3) {
            toast.warning("صدا نمیتواند کمتر از 3 ثانیه باشد", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: typeof window !== "undefined" && localStorage.getItem("theme") == "dark" ? "dark" : "light",
            });
            URL.revokeObjectURL(objectURL); // پاک کردن فایل ناپذیرفته‌شده
            resolve(null);
          } else if (duration > 180) {
            toast.warning("صدا نمیتواند بیشتر از 180 ثانیه باشد.", {
                position: "top-center",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: typeof window !== "undefined" && localStorage.getItem("theme") == "dark" ? "dark" : "light",
            });
            URL.revokeObjectURL(objectURL); // پاک کردن فایل ناپذیرفته‌شده
            resolve(null);
          } else {
            resolve({
              file,
              preview: objectURL,
              duration: duration.toFixed(0).toString(),
            });
          }
        };
      });
    });

    const results = await Promise.all(audioPromises);
    const validAudios = results.filter((item) => item !== null);

    if (newData.length + validAudios.length > 4) {
      toast.warning("بیشتر از 4 صدا نمیتوانید برای مرحله انتخاب کنید.", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: typeof window !== "undefined" && localStorage.getItem("theme") == "dark" ? "dark" : "light",
      });
      return;
    }

    setMusic([...newData, ...validAudios]);
    inputMusicRef.current.value = "";
  };

  const deleteMediaItem = (item: any) => {
    if (item?.file?.type.includes("video") == true) {
      setVideo([]);
    } else {
      let index = image.findIndex((i: any) => i.preview == item.preview);
      const newData = [...image];
      newData.splice(index, 1);
      setImage(newData);
    }
  };

  const moveImage = (fromMediaIndex: number, toMediaIndex: number) => {
    const videoOffset = video.length === 1 ? 1 : 0;
    if (
      fromMediaIndex < videoOffset ||
      toMediaIndex < videoOffset ||
      fromMediaIndex >= media.length ||
      toMediaIndex >= media.length
    ) {
      toast.warning("در صورت وجود ویدیو، باید در اولین آیتم لیست، ویدیو قرار گیرد.", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: typeof window !== "undefined" && localStorage.getItem("theme") == "dark" ? "dark" : "light",
      });
      return;
    }
    const fromImageIndex = fromMediaIndex - videoOffset;
    const toImageIndex = toMediaIndex - videoOffset;
    const newImageArray = [...image];
    const [movedItem] = newImageArray.splice(fromImageIndex, 1);
    newImageArray.splice(toImageIndex, 0, movedItem);
    setImage(newImageArray);
  };
  const setOrderForMediaItem = ({item, index}:{item:any, index:number}) => {
    if(item?.file?.type.includes("video") == true){
      toast.warning("ترتیب نمایش ویدیو همیشه در اولین آیتم است و قابل تغییر نمیباشد.", {
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
      let title = `ترتیب نمایش عکس = (${index + 1 + data?.media.length})`;
      ModalInputHelper.showModalInput({
        title: title,
        description: "میتوانید ترتیب نمایش این عکس را تغییر دهید.",
        inputValue: `${index + 1 + data?.media.length}`,
        buttons:[
                {
                  buttonText: "تایید",
                  onClickFn: (call) => {
                    const value = Number(call)
                    if(typeof value === 'number' && Number.isFinite(value) && value < 12 && value > 0 && value > data?.media?.length){
                      const fromMediaIndex = index
                      const toMediaIndex = value - 1 - data?.media?.length
                      moveImage(fromMediaIndex, toMediaIndex)
                      ModalInputHelper.closeModalInput();
                    } else {
                      toast.warning("مقدار وارد شده معتبر نمیباشد", {
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
                  },
                },
                {
                  buttonText: "انصراف",
                  onClickFn: () => {
                    ModalInputHelper.closeModalInput();
                  },
                },
              ],
        options: {
          maxLength: 2,
        },
      });
    }
  };
  const deleteVoiceItem = (item: any) => {
    let index = music.findIndex((i: any) => i.preview == item.preview);
    const newData = [...music];
    newData.splice(index, 1);
    setMusic(newData);
  };
  const moveVoiceItem = (fromIndex: number, toIndex: number) => {
    setMusic(prev => {
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= prev.length || toIndex > prev.length) {
        return prev;
      }
      const updated = [...prev];
      const [movedItem] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedItem);
      return updated;
    });
  };
  const setOrderForVoiceItem = ({item, index}:{item:any, index:number}) => {
     let title = `ترتیب پخش صدا در مرحله = (${index + 1 + data?.voice.length})`;
      ModalInputHelper.showModalInput({
        title: title,
        description: "میتوانید ترتیب پخش این صدا را تغییر دهید.",
        inputValue: `${index + 1 + data?.media.length}`,
        buttons:[
                {
                  buttonText: "تایید",
                  onClickFn: (call) => {
                    const value = Number(call)
                    if(typeof value === 'number' && Number.isFinite(value) && value < 9 && value > 0 && value > data?.voice?.length){
                      const fromIndex = index
                      const toIndex = value - 1 - data?.voice?.length
                      moveVoiceItem(fromIndex, toIndex)
                      ModalInputHelper.closeModalInput();
                    } else {
                      toast.warning("مقدار وارد شده معتبر نمیباشد", {
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
                  },
                },
                {
                  buttonText: "انصراف",
                  onClickFn: () => {
                    ModalInputHelper.closeModalInput();
                  },
                },
              ],
        options: {
          maxLength: 2,
        },
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
      {(data?.media.length > 0 || data?.voice.length > 0)&& (
        <div className="border-2 border-dashed border-primary dark:border-primary rounded-md py-2 mt-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-4 sm:gap-y-4 my-4 ">
            {data?.media.map((item: any, index: number) => (
              <div key={`${index.toString()}`} className="w-full h-20 3xs:h-24 sm:h-28 flex justify-center items-center">
                <div
                  className="relative w-20 h-20 3xs:w-24 3xs:h-24 sm:w-28 sm:h-28 cursor-pointer"
                  onClick={() => {
                    if (item?.duration) {
                      ShowVideoModalHelper.showModal({
                        src: `${Globals.uri}${item.path}`,
                      });
                    } else {
                      ShowImageModalHelper.showModal({
                        src: `${Globals.uri}${item.path}`,
                      });
                    }
                  }}
                >
                  {item?.duration ? (
                    <div className="relative h-full w-full">
                      <video src={`${Globals.uri}${item.path}`} className="inset-0 h-full w-full rounded-md object-cover" />
                      <div className="absolute top-[26%] right-[26%] text-xl sm:text-2xl text-primary bg-background6 bg-opacity-30 rounded-full p-3">
                        <FaPlay />
                      </div>
                      <div className="absolute bottom-1 left-1 flex items-center gap-2 bg-[#00000099] rounded px-1">
                        <p className="text-xs font-['iransans-light'] text-white">{secondsToTime(item.duration)}</p>
                        <div className="text-sm text-white">
                          <IoIosVideocam />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ImageComponent
                      src={item.path}
                      alt={"file_photos"}
                      parentclasses="h-full w-full cursor-pointer"
                    />
                  )}
                  <div className="absolute top-0 w-full flex justify-between px-1 pt-1">
                    <div
                      className={`flex justify-center items-center rounded transition text-red_color bg-[#00000099] sm:hover:bg-[#33333370] text-lg w-6 h-6`}
                    >
                      <p className="text-xs 3xs:text-sm text-center font-['iransans-md']">{index + 1}</p>
                    </div>
                    <div
                      onClick={(e: any) => {
                        e.stopPropagation();
                        DialogHelper.showDialog({
                          bodyText:`آیا این آیتم حذف شود؟`,
                          buttons:[
                            {
                              onClickFn:()=>{
                                deletePreviousMedia({path:item.path, type:"media"})
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
                      className="flex justify-center items-center rounded transition text-white bg-[#00000099] sm:hover:bg-[#33333370] text-lg w-6 h-6"
                    >
                      <BiTrash />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {(data?.voice && data?.voice?.length > 0) && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-4 sm:gap-y-4 my-4 ">
              {
                data?.voice.map((item: any, index: number)=>(
                <div key={`${index.toString()}`} className="relative bg-primary rounded-lg p-4 w-full max-w-xs mx-auto mb-2">
                  <audio
                    src={`${Globals.uri}${item?.path}`}
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
                                deletePreviousMedia({path:item?.path, type:"voice"})
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
                ))
              }
            </div>
          )}
        </div>
      )}
      <div className="flex gap-6 justify-center font-['iransans-md'] mt-4">
        <label
          className="text-text6 dark:text-text6_dark border-2 border-dashed border-text5 dark:border-text5_dark py-6 text-lg flex-1 rounded-md cursor-pointer transition sm:hover:bg-border2 sm:dark:hover:bg-border2_dark flex flex-col justify-center items-center gap-y-2"
          htmlFor="upload_file_photos"
          tabIndex={0}
        >
          <div className="text-4xl">
            <FaCamera />
          </div>
          <p className="text-xs 3xs:text-sm text-center">افزودن عکس</p>
          <input
            ref={inputImageRef}
            autoComplete="off"
            tabIndex={-1}
            className="hidden"
            id="upload_file_photos"
            type="file"
            accept="image/*"
            multiple
            onChange={handleAddPhotos}
          />
        </label>
        <label
          className="text-text6 dark:text-text6_dark border-2 border-dashed border-text5 dark:border-text5_dark py-6 text-lg flex-1 rounded-md cursor-pointer transition sm:hover:bg-border2 sm:dark:hover:bg-border2_dark flex flex-col justify-center items-center gap-y-2"
          htmlFor="upload_file_video"
        >
          <div className="text-4xl">
            <FaVideo />
          </div>
          <p className="text-xs 3xs:text-sm text-center">افزودن ویدیو</p>
          <input
            ref={inputVideoRef}
            className="hidden"
            id="upload_file_video"
            type="file"
            accept="video/*"
            onChange={handleAddVideos}
          />
        </label>
        <label
          className="text-text6 dark:text-text6_dark border-2 border-dashed border-text5 dark:border-text5_dark py-6 text-lg flex-1 rounded-md cursor-pointer transition sm:hover:bg-border2 sm:dark:hover:bg-border2_dark flex flex-col justify-center items-center gap-y-2"
          htmlFor="upload_file_audio"
        >
          <div className="text-4xl">
            <FaMusic />
          </div>
          <p className="text-xs 3xs:text-sm text-center">افزودن صدای مرحله</p>
          <input
            ref={inputMusicRef}
            autoComplete="off"
            className="hidden"
            id="upload_file_audio"
            type="file"
            accept=".mp3,audio/mpeg"
            multiple
            onChange={handleAddMusic}
          />
        </label>
      </div>
      {(media.length > 0 || music.length > 0)&& (
        <div className="border-2 border-dashed border-primary dark:border-primary rounded-md py-2 mt-4">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-4 sm:gap-y-4 mt-4">
            {media.map((item: any, index: number) => (
              <div key={`${index.toString()}`} className="w-full h-20 3xs:h-24 sm:h-28 flex justify-center items-center">
                <div
                  className="relative w-20 h-20 3xs:w-24 3xs:h-24 sm:w-28 sm:h-28 cursor-pointer"
                  onClick={() => {
                    if (item?.file?.type.includes("video") == true) {
                      ShowVideoModalHelper.showModal({
                        src: item.preview,
                        title: item?.title ? item.title : null,
                      });
                    } else {
                      ShowImageModalHelper.showModal({
                        src: item.preview,
                        title: item?.title ? item.title : null,
                      });
                    }
                  }}
                >
                  {item?.file?.type.includes("video") == true ? (
                    <div className="relative h-full w-full">
                      <video src={item.preview} className="inset-0 h-full w-full rounded-md object-cover" />
                      <div className="absolute top-[26%] right-[26%] text-xl sm:text-2xl text-primary bg-background6 bg-opacity-30 rounded-full p-3">
                        <FaPlay />
                      </div>
                      <div className="absolute bottom-1 left-1 flex items-center gap-2 bg-[#00000099] rounded px-1">
                        <p className="text-xs font-['iransans-light'] text-white">{secondsToTime(item.duration)}</p>
                        <div className="text-sm text-white">
                          <IoIosVideocam />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ImageComponent
                      src={item.preview}
                      alt={"file_photos"}
                      baseURI={false}
                      parentclasses="h-full w-full cursor-pointer"
                    />
                  )}
                  <div className="absolute top-0 w-full flex justify-between px-1 pt-1">
                    <div
                      onClick={(e: any) => {
                        e.stopPropagation();
                        setOrderForMediaItem({item, index});
                      }}
                      className={`flex justify-center items-center rounded transition text-red_color bg-[#00000099] sm:hover:bg-[#33333370] text-lg w-6 h-6`}
                    >
                      <p className="text-xs 3xs:text-sm text-center font-['iransans-md']">{index + 1 + data?.media?.length}</p>
                    </div>
                    <div
                      onClick={(e: any) => {
                        e.stopPropagation();
                        deleteMediaItem(item);
                      }}
                      className="flex justify-center items-center rounded transition text-white bg-[#00000099] sm:hover:bg-[#33333370] text-lg w-6 h-6"
                    >
                      <BiTrash />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 px-2">
            {music.map((item: any, index: number) => (
              <div key={index} className="relative bg-primary rounded-lg p-4 w-full max-w-xs mx-auto">
                <audio
                  src={item.preview}
                  controls
                  className="w-full rounded-md"
                />
                <div className="absolute top-2 left-2">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteVoiceItem(item);
                    }}
                    className="w-6 h-6 bg-black/50 text-white hover:bg-black/70 rounded flex items-center justify-center"
                  >
                    <BiTrash size={14} />
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setOrderForVoiceItem({ item, index });
                    }}
                    className="w-6 h-6 bg-black/60 text-red_color rounded flex items-center justify-center text-xs font-['iransans-md']"
                  >
                    {index + 1 + data?.voice?.length}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer buttonFn={registerAndConfirm} buttonText="بارگذاری موارد جدید" loadingButton={loading} classes="md:!mr-72 !justify-end" />
     
      
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
