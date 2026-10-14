"use client";

import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaCamera, FaMusic, FaPlay, FaVideo } from "react-icons/fa6";
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
import Input from "@/components/Input";
import TextAreaInput from "@/components/TextAreaInput";
import Footer from "@/components/Footer/Footer";
import Border from "@/components/Border";
import { Switch } from "@headlessui/react";
import SelectInput from "@/components/SelectInput";

type SelectedOption = {
  value: any;
  label: string;
};

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

const PublicationStatus: SelectedOption[] = [
  { value: null, label: "انتخاب وضعیت انتشار محتوا" },
  { value: "draft", label: "پیشنویس" },
  { value: "ready", label: "آماده انتشار" },
  { value: "published", label: "منتشر شده" },
  { value: "archived", label: "آرشیو شده، غیرفعال" },
  { value: "rejected", label: "رد شده" },
];
const CompletionStatus: SelectedOption[] = [
  { value: null, label: "انتخاب وضعیت کامل بودن محتوا" },
  { value: "incomplete", label: "ناقص (نیاز به بخش‌هایی بیشتر)" },
  { value: "in_progress", label: "در حال کار و بازبینی" },
  { value: "complete", label: "کامل‌شده ولی قابل به‌روزرسانی" },
  { value: "finalized", label: "نهایی‌شده، بدون نیاز به تغییر" },
];

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
  const inputImageRef: any = useRef();
  const inputVideoRef: any = useRef();
  const inputMusicRef: any = useRef();
  // تایپی که کاربر قبل از باز شدن پنجرهٔ انتخاب فایل مشخص کرده است
  const pendingMediaType = useRef<MediaType | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState(false);
  const [badge, setBadge] = useState("");
  const [language, setLanguage] = useState<string | null>(null);
  const [languageList, setLanguageList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seasonNumber, setSeasonNumber] = useState("");
  const [stageNumberFrom, setStageNumberFrom] = useState("");
  const [stageNumberTo, setStageNumberTo] = useState("");
  const [numberStage, setNumberStage] = useState("");
  const [publicationStatus, setPublicationStatus] = useState<string | null>(null);
  const [completionStatus, setCompletionStatus] = useState<string | null>(null);
  const [image, setImage] = useState<any>([]);
  const [video, setVideo] = useState<any>([]);
  const media = video.concat(image);
  // ویدیوها همیشه ابتدای لیست هستند (اول شروع، بعد پایان)
  const videoOffset = video.length;
  const takenVideoTypes: MediaType[] = video.map((v: any) => v.type);
  const [music, setMusic] = useState<any>(null);
  // مشخص می‌کند مودال انتخاب تایپ برای عکس باز شده یا ویدیو
  const [typePicker, setTypePicker] = useState<null | "image" | "video">(null);

  useEffect(() => {
    getAllLanguage();
  }, []);

  const getAllLanguage = async () => {
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
    })
      .then(async (response) => {
        const data = response.data.data.getAllLanguageForAdmin;
        if (data.length > 0) {
          const items = data.map((item: any) => ({
            label: item.name,
            value: item._id,
          }));
          items.unshift({
            label: "انتخاب زبان",
            value: null,
          });
          setLanguageList(items);
        }
      })
      .catch(() => {
        setLanguageList([]);
      });
  };

  const registerAndConfirm = () => {
    if (title.length == 0) {
      showToast("error", "ابتدا موارد الزامی را وارد کنید");
      return;
    }
    if (media.some((item: any) => item.type !== "start" && item.type !== "end")) {
      showToast("error", "برای همهٔ عکس‌ها و ویدیوها باید نوع (شروع یا پایان فصل) مشخص شود");
      return;
    }
    // اطمینان از اینکه برای هر نوع حداکثر یک ویدیو وجود دارد
    if (
      video.filter((v: any) => v.type === "start").length > 1 ||
      video.filter((v: any) => v.type === "end").length > 1
    ) {
      showToast("error", "برای شروع فصل و پایان فصل، هرکدام فقط یک ویدیو می‌توانید انتخاب کنید");
      return;
    }
    checkedAndRegister();
  };

  const checkedAndRegister = async () => {
    setLoading(true);
    let data = {
      query: `
          mutation newSeasonDefinitionForWordGame(
            $title : String!,
            $description : String,
            $language_ref : ID!,
            $media : [FileInput!]!,
            $music : FileInput,
            $badge : String,
            $season_number : Int!,
            $stage_number_from : Int!,
            $stage_number_to : Int!,
            $number_stage : Int!,
            $is_visible : Boolean!,
            $is_active : Boolean!,
            $publication_status : String!,
            $completion_status : String!,
          ){
            newSeasonDefinitionForWordGame(
              title : $title,
              description : $description,
              language_ref : $language_ref,
              media : $media,
              music : $music,
              badge : $badge,
              season_number : $season_number,
              stage_number_from : $stage_number_from,
              stage_number_to : $stage_number_to,
              number_stage : $number_stage,
              is_visible : $is_visible,
              is_active : $is_active,
              publication_status : $publication_status,
              completion_status : $completion_status,
            ) {
              status,
              message,
            }
          }
          `,
      variables: {
        title: title,
        description: description?.length > 0 ? description : undefined,
        language_ref: language,
        media: media.map((item: any, index: number) => ({
          file: null,
          order: index + 1,
          duration: item.duration ?? undefined,
          type: item.type, // 'start' | 'end'
        })),
        music: music?.file && music?.duration ? { file: null, duration: music.duration } : undefined,
        badge: badge?.length > 0 ? badge : undefined,
        season_number: Number(seasonNumber),
        stage_number_from: Number(stageNumberFrom),
        stage_number_to: Number(stageNumberTo),
        number_stage: Number(numberStage),
        is_visible: visible,
        is_active: active,
        publication_status: publicationStatus,
        completion_status: completionStatus,
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
    formD.append("operations", JSON.stringify(data));
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
        if (response.data?.data?.newSeasonDefinitionForWordGame?.status == 200) {
          showToast("success", response.data?.data?.newSeasonDefinitionForWordGame?.message);
          setTitle("");
          setDescription("");
          setBadge("");
          setImage([]);
          setVideo([]);
          setMusic(null);
          setNumberStage("");
          setSeasonNumber("");
          setStageNumberFrom("");
          setStageNumberTo("");
        } else {
          showToast(
            "error",
            response.data?.errors?.[0]?.data?.[0]?.message || "مشکلی پیش آمد دوباره تلاش کنید"
          );
        }
      })
      .catch(() => {
        showToast("error", "مشکلی پیش آمد دوباره تلاش کنید");
        setLoading(false);
      });
  };

  // ---------- انتخاب تایپ قبل از انتخاب فایل ----------
  const openTypePicker = (kind: "image" | "video") => {
    if (kind === "image" && image.length >= MAX_IMAGES) {
      showToast("warning", `بیشتر از ${MAX_IMAGES} عکس نمی‌توانید برای فصل انتخاب کنید.`);
      return;
    }
    if (kind === "video" && video.length >= MAX_VIDEOS) {
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
    if (photos.length > MAX_IMAGES || image.length + photos.length > MAX_IMAGES) {
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
        // هر نوع فقط یک ویدیو دارد؛ در صورت وجود ویدیوی هم‌نوع، جایگزین می‌شود
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

  // ---------- حذف / تغییر تایپ / ترتیب ----------
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
      // اگر برای نوع مقصد قبلاً ویدیو انتخاب شده، تغییر مجاز نیست
      if (video.some((v: any) => v.type === newType && v.preview !== item.preview)) {
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
      showToast("warning", "در صورت وجود ویدیو، ویدیوها باید در ابتدای لیست قرار گیرند.");
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
      showToast("warning", "ویدیوها همیشه در ابتدای لیست قرار می‌گیرند (اول شروع فصل، بعد پایان فصل) و ترتیب آن‌ها قابل تغییر نیست.");
    } else {
      let title = `ترتیب نمایش عکس = (${index + 1})`;
      ModalInputHelper.showModalInput({
        title: title,
        description: "میتوانید ترتیب نمایش این عکس را تغییر دهید.",
        inputValue: `${index + 1}`,
        buttons: [
          {
            buttonText: "تایید",
            onClickFn: (call) => {
              const value = Number(call);
              if (
                typeof value === "number" &&
                Number.isFinite(value) &&
                value <= media.length &&
                value > 0
              ) {
                const fromMediaIndex = index;
                const toMediaIndex = value - 1;
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

  // ---------- رندر یک آیتم (عکس یا ویدیو) ----------
  const renderMediaItem = (item: any, mediaIndex: number) => {
    const isVideo = item?.file?.type.includes("video") == true;
    const itemType: MediaType | undefined = item.type;
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
              className={`flex justify-center items-center rounded transition text-red_color bg-[#00000099] sm:hover:bg-[#33333370] text-lg w-6 h-6`}
            >
              <p className="text-xs 3xs:text-sm text-center font-['iransans-md']">{mediaIndex + 1}</p>
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

          {/* برچسب تایپ (با کلیک روی آن، تایپ بین شروع و پایان تغییر می‌کند) */}
          <div
            onClick={(e: any) => {
              e.stopPropagation();
              toggleMediaType(item);
            }}
            title="برای تغییر نوع کلیک کنید"
            className={`absolute ${isVideo ? "bottom-1 right-1" : "bottom-1 left-1"} rounded px-1.5 py-0.5 text-[10px] 3xs:text-xs text-white font-['iransans-md'] ${
              itemType ? MEDIA_TYPE_BADGE_CLASS[itemType] : "bg-gray-600/90"
            }`}
          >
            {itemType ? MEDIA_TYPE_LABEL[itemType] : "بدون نوع"}
          </div>
        </div>
      </div>
    );
  };

  const uploadBoxClasses =
    "text-text6 dark:text-text6_dark border-2 border-dashed border-text5 dark:border-text5_dark py-6 text-lg flex-1 rounded-md cursor-pointer transition sm:hover:bg-border2 sm:dark:hover:bg-border2_dark flex flex-col justify-center items-center gap-y-2";

  return (
    <div className="flex flex-col justify-between w-full lg:w-[600px] 2xl:w-[750px] mt-10 mb-28 px-4 sm:mx-auto">
      <div className="flex gap-6 justify-center font-['iransans-md'] mt-1">
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

      {/* بخش ویدیوها */}
      {video.length > 0 && (
        <div className="border-2 border-dashed border-primary dark:border-primary rounded-md py-2 mt-4">
          <h4 className="px-3 pt-1 text-right font-['iransans-md'] text-sm text-text dark:text-text_dark">
            ویدیوها ({video.length} از {MAX_VIDEOS})
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-4 sm:gap-y-4 my-4">
            {video.map((item: any, index: number) => renderMediaItem(item, index))}
          </div>
        </div>
      )}

      {/* بخش عکس‌ها */}
      {image.length > 0 && (
        <div className="border-2 border-dashed border-primary dark:border-primary rounded-md py-2 mt-4">
          <h4 className="px-3 pt-1 text-right font-['iransans-md'] text-sm text-text dark:text-text_dark">
            عکس‌ها ({image.length} از {MAX_IMAGES})
          </h4>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-4 sm:gap-y-4 my-4">
            {image.map((item: any, index: number) => renderMediaItem(item, videoOffset + index))}
          </div>
        </div>
      )}

      {/* بخش موزیک */}
      {music && (
        <div className="border-2 border-dashed border-primary dark:border-primary rounded-md py-2 mt-4">
          <h4 className="px-3 pt-1 text-right font-['iransans-md'] text-sm text-text dark:text-text_dark">موزیک</h4>
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

      <div className="mt-6">
        <label
          className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.85rem] sm:text-[.95rem] cursor-pointer py-3"
          htmlFor="name"
        >
          زبان فصل
          <span className="text-red-500 px-1">*</span>
          <div className={`mt-1 flex-1 gap-2 w-full items-center justify-between`}>
            <SelectInput
              name="stage-game-language"
              options={languageList}
              onChange={(value) => setLanguage(value || null)}
            />
          </div>
        </label>
      </div>
      <div className="mt-6">
        <label
          className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.85rem] sm:text-[.95rem] cursor-pointer py-3"
          htmlFor="name-stage-season"
        >
          عنوان فصل
          <span className="text-red-500 px-1">*</span>
          <div className={`mt-1 flex gap-2 w-full items-center justify-between`}>
            <Input id="name-stage-season" value={title} changeState={setTitle} classes="flex-1" inputStyles="!text-base" />
          </div>
        </label>
      </div>
      <div className="mt-6">
        <label
          className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.85rem] sm:text-[.95rem] cursor-pointer py-3"
          htmlFor="number-season-stage-season"
        >
          شماره فصل
          <span className="text-red-500 px-1">*</span>
          <div className={`mt-1 flex gap-2 w-full items-center justify-between`}>
            <Input
              type="number"
              id="number-season-stage-season"
              value={seasonNumber}
              changeState={setSeasonNumber}
              classes="flex-1"
              inputStyles="!text-base"
            />
          </div>
        </label>
      </div>
      <div className="mt-6">
        <label
          className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.85rem] sm:text-[.95rem] cursor-pointer py-3"
          htmlFor="number-stage-season"
        >
          تعداد مراحل فصل
          <span className="text-red-500 px-1">*</span>
          <div className={`mt-1 flex gap-2 w-full items-center justify-between`}>
            <Input
              type="number"
              id="number-stage-season"
              value={numberStage}
              changeState={setNumberStage}
              classes="flex-1"
              inputStyles="!text-base"
            />
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
            <Input
              type="number"
              id="stage_number_from"
              value={stageNumberFrom}
              changeState={setStageNumberFrom}
              classes="flex-1"
              inputStyles="!text-base"
            />
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
            <Input
              type="number"
              id="stage_number_to"
              value={stageNumberTo}
              changeState={setStageNumberTo}
              classes="flex-1"
              inputStyles="!text-base"
            />
          </div>
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
              name="stage-game-publication-status"
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
              name="stage-game-completion-status"
              options={CompletionStatus}
              onChange={(value) => setCompletionStatus(value)}
            />
          </div>
        </label>
      </div>
      <div className="mt-6">
        <label
          className="font-['iransans-md'] flex-1 text-right text-text6 dark:text-text6_dark text-[.85rem] sm:text-[.95rem] cursor-pointer py-3"
          htmlFor="badge-stage-season"
        >
          نشان ( مثل جدید یا به‌زودی )
          <div className={`mt-1 flex gap-2 w-full items-center justify-between`}>
            <Input id="badge-stage-season" value={badge} changeState={setBadge} classes="flex-1" inputStyles="!text-base" />
          </div>
        </label>
      </div>
      <div className="mt-6">
        <label
          className="text-right lg:w-2/3 w-5/6 xl:w-3/5 2xl:w-1/2 text-text6 dark:text-text6_dark cursor-pointer font-iransans-md text-sm"
          htmlFor="description-stage-season"
        >
          دربارهٔ فصل
          <TextAreaInput
            id={"description-stage-season"}
            value={description}
            changeState={(e: any) => setDescription(e)}
            textAreaStyles="!text-sm mt-1"
            rows={4}
          />
        </label>
      </div>
      <div
        className="py-4 cursor-pointer sm:hover:bg-border2 dark:sm:hover:bg-border2_dark transition select-none"
        onClick={() => setVisible((last) => !last)}
      >
        <div className="flex items-center justify-between w-full h-[42px] pl-2 rounded">
          <label className={`text-sm font-['iransans-md'] cursor-pointer`}>
            <h3 className="text-text dark:text-text_dark font-['iransans-md'] text-[15px]">قابل نمایش شود</h3>
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
                visible ? "translate-x-2 bg-primary" : "-translate-x-[16px] bg-text5 dark:bg-text5_dark"
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
            <h3 className="text-text dark:text-text_dark font-['iransans-md'] text-[15px]">فعال شود</h3>
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
                active ? "translate-x-2 bg-primary" : "-translate-x-[16px] bg-text5 dark:bg-text5_dark"
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
      <Footer buttonFn={registerAndConfirm} buttonText="ثبت فصل" loadingButton={loading} classes="md:!mr-72 !justify-end" />

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
                : "این ویدیو برای کدام بخش فصل است؟ برای هر بخش فقط یک ویدیو می‌توانید انتخاب کنید."}
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