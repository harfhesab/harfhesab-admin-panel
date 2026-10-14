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

type MediaType = "start" | "end";

const MediaTypeOptions: { value: MediaType; label: string; description: string }[] = [
  { value: "start", label: "شروع فصل", description: "نمایش در ابتدای فصل" },
  { value: "end", label: "پایان فصل", description: "نمایش در انتهای فصل" },
];

const MEDIA_TYPE_LABEL: Record<MediaType, string> = {
  start: "شروع فصل",
  end: "پایان فصل",
};

const MEDIA_TYPE_BADGE_CLASS: Record<MediaType, string> = {
  start: "bg-green-600/90",
  end: "bg-orange-600/90",
};

const MAX_IMAGES = 10;
// حداکثر ۲ ویدیو: یکی برای شروع فصل و یکی برای پایان فصل
const MAX_VIDEOS = 2;

const sortVideos = (list: any[]) =>
  [...list].sort((a, b) => (a.type === b.type ? 0 : a.type === "start" ? -1 : 1));

const getToastTheme = () =>
  typeof window !== "undefined" && localStorage.getItem("theme") == "dark" ? "dark" : "light";

const showToast = (type: "error" | "warning" | "success", message: string) => {
  toast[type](message, {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: getToastTheme(),
  });
};

const Page = () => {
  const { seasonId } = useParams();
  const inputImageRef: any = useRef();
  const inputVideoRef: any = useRef();
  const inputMusicRef: any = useRef();
  // تایپی که کاربر قبل از باز شدن پنجرهٔ انتخاب فایل مشخص کرده است
  const pendingMediaType = useRef<MediaType | null>(null);

  const [data, setData] = useState<any>(null);
  const [changeVersionUpdated, setChangeVersionUpdated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState<any>([]);
  const [video, setVideo] = useState<any>([]);
  const [music, setMusic] = useState<any>(null);
  const [loading2, setLoading2] = useState(true);
  const [getError, setGetError] = useState(false);
  // مشخص می‌کند مودال انتخاب تایپ برای عکس باز شده یا ویدیو
  const [typePicker, setTypePicker] = useState<null | "image" | "video">(null);

  // رسانه‌های جدید: ویدیوها همیشه ابتدای لیست هستند (اول شروع، بعد پایان)
  const media = video.concat(image);
  const videoOffset = video.length;

  // رسانه‌های قبلی (ثبت‌شده روی سرور)
  const existingMedia: any[] = data?.media ?? [];
  const existingCount = existingMedia.length;
  const existingVideos = existingMedia.filter((m: any) => m?.duration);
  const existingImagesCount = existingCount - existingVideos.length;

  // نوع‌هایی که برای آن‌ها ویدیو وجود دارد (چه از قبل ثبت شده، چه جدید)
  const takenVideoTypes: MediaType[] = [
    ...existingVideos.map((v: any) => v.type),
    ...video.map((v: any) => v.type),
  ].filter(Boolean);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
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
                    language_info{ name},
                    media{path, file_type, duration, order, type},
                    music{path, file_type, duration},

                }
            }
            `,
        variables: {
          _id: seasonId,
        },
      },
    })
      .then(async (response) => {
        const data = response.data.data.getWordGameSeasonInformation;
        if (data) {
          setData(data);
          setLoading2(false);
        } else {
          setGetError(true);
        }
      })
      .catch(() => {
        setGetError(true);
      });
  };

  const tryAgain = () => {
    setLoading2(true);
    setGetError(false);
    getData();
  };

  const deletePreviousMedia = async ({ path, type }: { path: string; type: string }) => {
    let data = {
      query: `
          mutation deleteMediaFromWordGameSeason(
            $_id : ID!,
            $path : String!,
            $type : String!,
            $change_version_updated : Boolean!
          ){
            deleteMediaFromWordGameSeason(
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
        _id: seasonId,
        path: path,
        type: type,
        change_version_updated: changeVersionUpdated,
      },
    };
    await axios({
      url: "/",
      method: "post",
      data: data,
    })
      .then(async (response) => {
        const res = response.data?.data?.deleteMediaFromWordGameSeason;
        if (res?.status == 200) {
          showToast("success", res?.message);
          getData();
        } else {
          showToast("error", response.data?.errors?.[0]?.data?.[0]?.message || "مشکلی پیش آمد دوباره تلاش کنید");
        }
      })
      .catch(() => {
        showToast("error", "مشکلی پیش آمد دوباره تلاش کنید");
      });
  };

  const registerAndConfirm = () => {
    if (media.length == 0 && !music) {
      showToast("error", "هیچ مورد جدیدی اضافه نشده است.");
      return;
    }
    if (media.some((item: any) => item.type !== "start" && item.type !== "end")) {
      showToast("error", "برای همهٔ عکس‌ها و ویدیوها باید نوع (شروع یا پایان فصل) مشخص شود");
      return;
    }
    // اطمینان از اینکه برای هر نوع حداکثر یک ویدیو (با احتساب ویدیوهای قبلی) وجود دارد
    const startVideos = takenVideoTypes.filter((t) => t === "start").length;
    const endVideos = takenVideoTypes.filter((t) => t === "end").length;
    if (startVideos > 1 || endVideos > 1) {
      showToast("error", "برای شروع فصل و پایان فصل، هرکدام فقط یک ویدیو می‌توانید داشته باشید");
      return;
    }
    checkedAndRegister();
  };

  const checkedAndRegister = async () => {
    setLoading(true);
    let queryData = {
      query: `
          mutation addNewMediaToWordGameSeason(
            $_id : ID!,
            $media : [FileInput],
            $music : FileInput,
            $change_version_updated : Boolean!
          ){
            addNewMediaToWordGameSeason(
              _id : $_id,
              media : $media,
              music : $music,
              change_version_updated : $change_version_updated,
            ) {
              status,
              message,
            }
          }
          `,
      variables: {
        _id: seasonId,
        media: media.map((item: any, index: number) => ({
          file: null,
          order: index + 1 + existingCount,
          duration: item.duration ?? undefined,
          type: item.type, // 'start' | 'end'
        })),
        music: music?.file && music?.duration ? { file: null, duration: music.duration } : undefined,
        change_version_updated: changeVersionUpdated,
      },
    };
    let map: any = {};
    let fileIndex = 0;
    media.forEach((item: any, index: number) => {
      map[fileIndex] = [`variables.media.${index}.file`];
      fileIndex++;
    });
    if (music?.file && music?.duration) {
      map[fileIndex] = [`variables.music.file`];
    }
    let formD = new FormData();
    formD.append("operations", JSON.stringify(queryData));
    formD.append("map", JSON.stringify(map));
    media.forEach((item: any, index: number) => {
      formD.append(`${index}`, item.file);
    });
    if (music?.file && music?.duration) {
      formD.append(`${fileIndex}`, music.file);
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
        if (response.data?.data?.addNewMediaToWordGameSeason?.status == 200) {
          showToast("success", response.data?.data?.addNewMediaToWordGameSeason?.message);
          setMusic(null);
          setImage([]);
          setVideo([]);
          getData();
        } else {
          showToast("error", response.data?.errors?.[0]?.data?.[0]?.message || "مشکلی پیش آمد دوباره تلاش کنید");
        }
      })
      .catch(() => {
        showToast("error", "مشکلی پیش آمد دوباره تلاش کنید");
        setLoading(false);
      });
  };

  // ---------- انتخاب تایپ قبل از انتخاب فایل ----------
  const openTypePicker = (kind: "image" | "video") => {
    if (kind === "image" && existingImagesCount + image.length >= MAX_IMAGES) {
      showToast("warning", `بیشتر از ${MAX_IMAGES} عکس نمی‌توانید برای فصل انتخاب کنید.`);
      return;
    }
    if (kind === "video" && existingVideos.length + video.length >= MAX_VIDEOS) {
      showToast(
        "warning",
        "برای شروع فصل و پایان فصل ویدیو انتخاب شده است. برای انتخاب ویدیوی جدید، ابتدا یکی از ویدیوها را حذف کنید."
      );
      return;
    }
    setTypePicker(kind);
  };

  const handleSelectMediaType = (type: MediaType) => {
    const kind = typePicker;
    // برای ویدیو، هر نوع فقط یک بار قابل انتخاب است
    if (kind === "video" && takenVideoTypes.includes(type)) {
      showToast("warning", `برای ${MEDIA_TYPE_LABEL[type]} قبلاً ویدیو انتخاب شده است.`);
      return;
    }
    pendingMediaType.current = type;
    setTypePicker(null);
    if (kind === "image") {
      inputImageRef.current?.click();
    } else if (kind === "video") {
      inputVideoRef.current?.click();
    }
  };

  // ---------- افزودن فایل‌ها ----------
  const handleAddPhotos = (e: any) => {
    const photos: File[] = Array.from(e.target.files || []);
    const mediaType = pendingMediaType.current;
    if (photos.length === 0 || !mediaType) {
      if (inputImageRef.current) inputImageRef.current.value = "";
      return;
    }
    if (photos.length > MAX_IMAGES || existingImagesCount + image.length + photos.length > MAX_IMAGES) {
      showToast("warning", `بیشتر از ${MAX_IMAGES} عکس نمی‌توانید برای فصل انتخاب کنید.`);
    } else {
      const newData: any = [...image];
      photos.forEach((photo) => {
        newData.push({
          file: photo,
          preview: URL.createObjectURL(photo),
          type: mediaType,
        });
      });
      setImage(newData);
    }
    if (inputImageRef.current) inputImageRef.current.value = "";
  };

  const handleAddVideos = (e: any) => {
    const file: File | undefined = e.target.files?.[0];
    const mediaType = pendingMediaType.current;
    if (!file || !mediaType) {
      if (inputVideoRef.current) inputVideoRef.current.value = "";
      return;
    }
    const uri = URL.createObjectURL(file);
    const videoElement = document.createElement("video");
    videoElement.preload = "metadata";
    videoElement.src = uri;
    videoElement.onloadedmetadata = function () {
      const duration = videoElement.duration;
      if (duration < 30) {
        URL.revokeObjectURL(uri);
        showToast("warning", "ویدیوی انتخابی نمیتواند کمتر از 30 ثانیه باشد.");
      } else if (duration > 120) {
        URL.revokeObjectURL(uri);
        showToast("warning", "ویدیوی انتخابی نمیتواند بیشتر از 120 ثانیه باشد.");
      } else {
        const newVideo = {
          file: file,
          preview: uri,
          duration: duration.toFixed(0).toString(),
          type: mediaType,
        };
        // هر نوع فقط یک ویدیو دارد؛ در صورت وجود ویدیوی جدید هم‌نوع، جایگزین می‌شود
        setVideo((prev: any[]) => sortVideos([...prev.filter((v) => v.type !== mediaType), newVideo]));
      }
      if (inputVideoRef.current) inputVideoRef.current.value = "";
    };
  };

  const handleAddMusic = (e: any) => {
    const file: File | undefined = e.target.files?.[0];
    if (!file) return;
    const uri = URL.createObjectURL(file);
    const musicElement = document.createElement("audio");
    musicElement.preload = "metadata";
    musicElement.src = uri;
    musicElement.onloadedmetadata = function () {
      const duration = musicElement.duration;
      if (duration < 3) {
        URL.revokeObjectURL(uri);
        showToast("warning", "موزیک متن نمیتواند کمتر از 3 ثانیه باشد");
      } else if (duration > 180) {
        URL.revokeObjectURL(uri);
        showToast("warning", "موزیک متن نمیتواند بیشتر از 180 ثانیه باشد.");
      } else {
        setMusic({
          file: file,
          preview: uri,
          duration: duration.toFixed(0).toString(),
        });
      }
      if (inputMusicRef.current) inputMusicRef.current.value = "";
    };
  };

  // ---------- حذف / تغییر تایپ / ترتیب (رسانه‌های جدید) ----------
  const deleteMediaItem = (item: any) => {
    if (item?.file?.type.includes("video") == true) {
      setVideo((prev: any[]) => prev.filter((v) => v.preview !== item.preview));
    } else {
      const index = image.findIndex((i: any) => i.preview == item.preview);
      if (index === -1) return;
      const newData = [...image];
      newData.splice(index, 1);
      setImage(newData);
    }
  };

  const toggleMediaType = (item: any) => {
    const newType: MediaType = item.type === "start" ? "end" : "start";
    if (item?.file?.type.includes("video") == true) {
      // اگر برای نوع مقصد قبلاً ویدیو (قدیمی یا جدید) انتخاب شده، تغییر مجاز نیست
      const existingConflict = existingVideos.some((v: any) => v.type === newType);
      const newConflict = video.some((v: any) => v.type === newType && v.preview !== item.preview);
      if (existingConflict || newConflict) {
        showToast(
          "warning",
          `برای ${MEDIA_TYPE_LABEL[newType]} قبلاً ویدیو انتخاب شده است. ابتدا آن ویدیو را حذف کنید.`
        );
        return;
      }
      setVideo((prev: any[]) =>
        sortVideos(prev.map((v) => (v.preview === item.preview ? { ...v, type: newType } : v)))
      );
    } else {
      setImage((prev: any[]) => prev.map((img) => (img.preview === item.preview ? { ...img, type: newType } : img)));
    }
  };

  const moveImage = (fromMediaIndex: number, toMediaIndex: number) => {
    if (
      fromMediaIndex < videoOffset ||
      toMediaIndex < videoOffset ||
      fromMediaIndex >= media.length ||
      toMediaIndex >= media.length
    ) {
      showToast("warning", "در صورت وجود ویدیوی جدید، ویدیوها باید در ابتدای لیست رسانه‌های جدید قرار گیرند.");
      return;
    }
    const fromImageIndex = fromMediaIndex - videoOffset;
    const toImageIndex = toMediaIndex - videoOffset;
    const newImageArray = [...image];
    const [movedItem] = newImageArray.splice(fromImageIndex, 1);
    newImageArray.splice(toImageIndex, 0, movedItem);
    setImage(newImageArray);
  };

  const setOrderForMediaItem = ({ item, index }: { item: any; index: number }) => {
    if (item?.file?.type.includes("video") == true) {
      showToast(
        "warning",
        "ویدیوها همیشه در ابتدای لیست رسانه‌های جدید قرار می‌گیرند (اول شروع فصل، بعد پایان فصل) و ترتیب آن‌ها قابل تغییر نیست."
      );
    } else {
      const shownOrder = index + 1 + existingCount;
      ModalInputHelper.showModalInput({
        title: `ترتیب نمایش عکس = (${shownOrder})`,
        description: "میتوانید ترتیب نمایش این عکس را تغییر دهید.",
        inputValue: `${shownOrder}`,
        buttons: [
          {
            buttonText: "تایید",
            onClickFn: (call) => {
              const value = Number(call);
              if (
                Number.isFinite(value) &&
                value > existingCount &&
                value <= existingCount + media.length
              ) {
                const fromMediaIndex = index;
                const toMediaIndex = value - 1 - existingCount;
                moveImage(fromMediaIndex, toMediaIndex);
                ModalInputHelper.closeModalInput();
              } else {
                showToast("warning", "مقدار وارد شده معتبر نمیباشد");
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

  // ---------- برچسب نوع ----------
  const renderTypeBadge = ({
    type,
    isVideo,
    onClick,
  }: {
    type?: MediaType;
    isVideo: boolean;
    onClick?: (e: any) => void;
  }) => (
    <div
      onClick={onClick}
      title={onClick ? "برای تغییر نوع کلیک کنید" : undefined}
      className={`absolute ${isVideo ? "bottom-1 right-1" : "bottom-1 left-1"} rounded px-1.5 py-0.5 text-[10px] 3xs:text-xs text-white font-['iransans-md'] ${
        onClick ? "cursor-pointer" : ""
      } ${type && MEDIA_TYPE_BADGE_CLASS[type] ? MEDIA_TYPE_BADGE_CLASS[type] : "bg-gray-600/90"}`}
    >
      {type && MEDIA_TYPE_LABEL[type] ? MEDIA_TYPE_LABEL[type] : "بدون نوع"}
    </div>
  );

  // ---------- رندر یک آیتم قبلی (ثبت‌شده روی سرور) ----------
  const renderExistingItem = (item: any, index: number) => {
    const isVideo = !!item?.duration;
    const src = `${Globals.uri}${item.path}`;
    return (
      <div key={item.path} className="w-full h-20 3xs:h-24 sm:h-28 flex justify-center items-center">
        <div
          className="relative w-20 h-20 3xs:w-24 3xs:h-24 sm:w-28 sm:h-28 cursor-pointer"
          onClick={() => {
            if (isVideo) {
              ShowVideoModalHelper.showModal({ src });
            } else {
              ShowImageModalHelper.showModal({ src });
            }
          }}
        >
          {isVideo ? (
            <div className="relative h-full w-full">
              <video src={src} className="inset-0 h-full w-full rounded-md object-cover" />
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
            <ImageComponent src={item.path} alt={"file_photos"} parentclasses="h-full w-full cursor-pointer" />
          )}

          <div className="absolute top-0 w-full flex justify-between px-1 pt-1">
            <div className="flex justify-center items-center rounded transition text-primary bg-[#00000099] sm:hover:bg-[#33333370] text-lg w-6 h-6">
              <p className="text-xs 3xs:text-sm text-center font-['iransans-md']">{index + 1}</p>
            </div>
            <div
              onClick={(e: any) => {
                e.stopPropagation();
                DialogHelper.showDialog({
                  bodyText: `آیا این آیتم حذف شود؟`,
                  buttons: [
                    {
                      onClickFn: () => {
                        deletePreviousMedia({ path: item.path, type: "media" });
                      },
                      buttonText: "حذف آیتم",
                      type: "bold",
                    },
                    {
                      onClickFn: () => {},
                      buttonText: "لغو",
                      type: "border",
                    },
                  ],
                });
              }}
              className="flex justify-center items-center rounded transition text-white bg-[#00000099] sm:hover:bg-[#33333370] text-lg w-6 h-6"
            >
              <BiTrash />
            </div>
          </div>

          {/* برچسب نوع (فقط نمایشی؛ برای تغییر نوع باید آیتم حذف و دوباره اضافه شود) */}
          {renderTypeBadge({ type: item.type, isVideo })}
        </div>
      </div>
    );
  };

  // ---------- رندر یک آیتم جدید (عکس یا ویدیو) ----------
  const renderNewItem = (item: any, mediaIndex: number) => {
    const isVideo = item?.file?.type.includes("video") == true;
    return (
      <div key={item.preview} className="w-full h-20 3xs:h-24 sm:h-28 flex justify-center items-center">
        <div
          className="relative w-20 h-20 3xs:w-24 3xs:h-24 sm:w-28 sm:h-28 cursor-pointer"
          onClick={() => {
            if (isVideo) {
              ShowVideoModalHelper.showModal({ src: item.preview });
            } else {
              ShowImageModalHelper.showModal({ src: item.preview });
            }
          }}
        >
          {isVideo ? (
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
                setOrderForMediaItem({ item, index: mediaIndex });
              }}
              className="flex justify-center items-center rounded transition text-red_color bg-[#00000099] sm:hover:bg-[#33333370] text-lg w-6 h-6"
            >
              <p className="text-xs 3xs:text-sm text-center font-['iransans-md']">{mediaIndex + 1 + existingCount}</p>
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

          {/* برچسب نوع (با کلیک روی آن، نوع بین شروع و پایان تغییر می‌کند) */}
          {renderTypeBadge({
            type: item.type,
            isVideo,
            onClick: (e: any) => {
              e.stopPropagation();
              toggleMediaType(item);
            },
          })}
        </div>
      </div>
    );
  };

  const uploadBoxClasses =
    "text-text6 dark:text-text6_dark border-2 border-dashed border-text5 dark:border-text5_dark py-6 text-lg flex-1 rounded-md cursor-pointer transition sm:hover:bg-border2 sm:dark:hover:bg-border2_dark flex flex-col justify-center items-center gap-y-2";

  return loading2 == true ? (
    <div className="flex items-center justify-center w-full h-[calc(100dvh-60px)]">
      <ScreenLoading getError={getError} notItem={false} tryAgain={tryAgain} />
    </div>
  ) : (
    <div className="flex flex-col justify-between w-full lg:w-[600px] 2xl:w-[750px] mt-10 mb-28 px-4 sm:mx-auto">
      <p className="text-justify font-['iransans-md'] text-primary text-[16px] mb-2">
        <span className="text-text5 dark:text-text5_dark">فصل</span>
        {` ${data?.title} `}
        <span className="text-text5 dark:text-text5_dark">زبان</span>
        {` ${data?.language_info?.name} `}
      </p>

      {/* رسانه‌ها و موزیک قبلی */}
      {(existingCount > 0 || data?.music) && (
        <div className="border-2 border-dashed border-primary dark:border-primary rounded-md py-2 mt-4">
          <h4 className="px-3 pt-1 text-right font-['iransans-md'] text-sm text-text dark:text-text_dark">
            رسانه‌های ثبت‌شده
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-4 sm:gap-y-4 my-4">
            {existingMedia.map((item: any, index: number) => renderExistingItem(item, index))}
          </div>
          {data?.music && (
            <div className="relative bg-primary rounded-lg p-4 w-full max-w-xs mx-auto mb-2">
              <audio src={`${Globals.uri}${data?.music?.path}`} controls className="w-full rounded-md" />
              <div className="absolute top-2 left-2">
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    DialogHelper.showDialog({
                      bodyText: `آیا این آیتم حذف شود؟`,
                      buttons: [
                        {
                          onClickFn: () => {
                            deletePreviousMedia({ path: data?.music?.path, type: "music" });
                          },
                          buttonText: "حذف آیتم",
                          type: "bold",
                        },
                        {
                          onClickFn: () => {},
                          buttonText: "لغو",
                          type: "border",
                        },
                      ],
                    });
                  }}
                  className="w-6 h-6 bg-black/50 text-white hover:bg-black/70 rounded flex items-center justify-center cursor-pointer"
                >
                  <BiTrash size={14} />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-6 justify-center font-['iransans-md'] mt-4">
        {/* افزودن عکس */}
        <div
          className={uploadBoxClasses}
          role="button"
          tabIndex={0}
          onClick={() => openTypePicker("image")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openTypePicker("image");
            }
          }}
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
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* افزودن ویدیو */}
        <div
          className={uploadBoxClasses}
          role="button"
          tabIndex={0}
          onClick={() => openTypePicker("video")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openTypePicker("video");
            }
          }}
        >
          <div className="text-4xl">
            <FaVideo />
          </div>
          <p className="text-xs 3xs:text-sm text-center">افزودن ویدیو</p>
          <input
            ref={inputVideoRef}
            tabIndex={-1}
            className="hidden"
            id="upload_file_video"
            type="file"
            accept="video/*"
            onChange={handleAddVideos}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* افزودن موزیک */}
        <label className={uploadBoxClasses} htmlFor="upload_file_audio">
          <div className="text-4xl">
            <FaMusic />
          </div>
          <p className="text-xs 3xs:text-sm text-center">افزودن موزیک</p>
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

      {/* بخش ویدیوهای جدید */}
      {video.length > 0 && (
        <div className="border-2 border-dashed border-primary dark:border-primary rounded-md py-2 mt-4">
          <h4 className="px-3 pt-1 text-right font-['iransans-md'] text-sm text-text dark:text-text_dark">
            ویدیوهای جدید ({existingVideos.length + video.length} از {MAX_VIDEOS})
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-4 sm:gap-y-4 my-4">
            {video.map((item: any, index: number) => renderNewItem(item, index))}
          </div>
        </div>
      )}

      {/* بخش عکس‌های جدید */}
      {image.length > 0 && (
        <div className="border-2 border-dashed border-primary dark:border-primary rounded-md py-2 mt-4">
          <h4 className="px-3 pt-1 text-right font-['iransans-md'] text-sm text-text dark:text-text_dark">
            عکس‌های جدید ({existingImagesCount + image.length} از {MAX_IMAGES})
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-4 sm:gap-y-4 my-4">
            {image.map((item: any, index: number) => renderNewItem(item, videoOffset + index))}
          </div>
        </div>
      )}

      {/* بخش موزیک جدید */}
      {music && (
        <div className="border-2 border-dashed border-primary dark:border-primary rounded-md py-2 mt-4">
          <h4 className="px-3 pt-1 text-right font-['iransans-md'] text-sm text-text dark:text-text_dark">
            موزیک جدید
          </h4>
          <div className="relative bg-primary rounded-lg p-4 w-full max-w-xs mx-auto my-3">
            <audio src={music.preview} controls className="w-full rounded-md" />
            <div className="absolute top-2 left-2">
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  setMusic(null);
                }}
                className="w-6 h-6 bg-black/50 text-white hover:bg-black/70 rounded flex items-center justify-center cursor-pointer"
              >
                <BiTrash size={14} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div
        className="py-4 cursor-pointer sm:hover:bg-border2 dark:sm:hover:bg-border2_dark transition select-none"
        onClick={() => setChangeVersionUpdated((last) => !last)}
      >
        <div className="flex items-center justify-between w-full h-[42px] pl-2 rounded">
          <label className={`text-sm font-['iransans-md'] cursor-pointer`}>
            <h3 className="text-text dark:text-text_dark font-['iransans-md'] text-[15px]">ورژن آپدیت ارتقا یابد</h3>
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
                changeVersionUpdated ? "translate-x-2 bg-primary" : "-translate-x-[16px] bg-text5 dark:bg-text5_dark"
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
      <Footer
        buttonFn={registerAndConfirm}
        buttonText="بارگذاری موارد جدید"
        loadingButton={loading}
        classes="md:!mr-72 !justify-end"
      />

      {/* مودال انتخاب نوع (شروع / پایان فصل) */}
      {typePicker && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setTypePicker(null)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-background dark:bg-background_dark p-5 font-['iransans-md']"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-text dark:text-text_dark text-base mb-1">
              {typePicker === "image" ? "نوع عکس" : "نوع ویدیو"}
            </h3>
            <p className="text-text5 dark:text-text5_dark text-xs mb-4">
              {typePicker === "image"
                ? "عکس‌هایی که انتخاب می‌کنید برای کدام بخش فصل هستند؟"
                : "این ویدیو برای کدام بخش فصل است؟ برای هر بخش فقط یک ویدیو می‌توانید داشته باشید."}
            </p>
            <div className="flex gap-3">
              {MediaTypeOptions.map((opt) => {
                const disabled = typePicker === "video" && takenVideoTypes.includes(opt.value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelectMediaType(opt.value)}
                    className={`flex-1 rounded-md border-2 py-3 px-2 text-text dark:text-text_dark transition flex flex-col items-center gap-1 ${
                      disabled
                        ? "border-text5 dark:border-text5_dark opacity-50 cursor-not-allowed"
                        : "border-primary sm:hover:bg-border2 sm:dark:hover:bg-border2_dark"
                    }`}
                  >
                    <span className="text-sm">{opt.label}</span>
                    <span className="text-[11px] text-text5 dark:text-text5_dark">
                      {disabled ? "ویدیو انتخاب شده است" : opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setTypePicker(null)}
              className="mt-3 w-full text-xs text-text5 dark:text-text5_dark py-2"
            >
              انصراف
            </button>
          </div>
        </div>
      )}

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