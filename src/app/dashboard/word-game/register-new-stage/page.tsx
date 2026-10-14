"use client";

import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaCamera, FaCheck, FaEyeSlash, FaMusic, FaPlay, FaStar, FaVideo } from "react-icons/fa6";
import { BiTrash } from "react-icons/bi";
import { IoIosVideocam } from "react-icons/io";
import { Switch } from "@headlessui/react";
import { secondsToTime } from "@/utils/SecondToTime";
import ImageComponent from "@/components/ImageComponent";
import ShowVideoModalHelper from "@/components/ShowMediaModal/ShowVideoModalHelper";
import ShowImageModalHelper from "@/components/ShowMediaModal/ShowImageModalHelper";
import ModalInputHelper from "@/components/ModalInput/ModalInputHelper";
import ShowVideoModal from "@/components/ShowMediaModal/ShowVideoModal";
import ShowImageModal from "@/components/ShowMediaModal/ShowImageModal";
import ModalInput from "@/components/ModalInput/ModalInput";
import Input from "@/components/Input";
import Footer from "@/components/Footer/Footer";
import GradientButton from "@/components/GradientButton";
import SelectInput from "@/components/SelectInput";
import Border from "@/components/Border";

/* ------------------------------------------------------------------ */
/* Types & constants                                                   */
/* ------------------------------------------------------------------ */

type SelectedOption = {
  value: any;
  label: string;
};

interface WordItem {
  word: string;
}

interface CategorizedWords {
  [key: number]: string[];
}

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

const MAX_IMAGES = 3;
const MAX_VOICES = 4;
const MIN_LETTERS = 3;
const MAX_LETTERS = 12;

// فقط حروف الفبای فارسی، عربی و انگلیسی
const LETTER_REGEX = /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFFa-zA-Z]/g;

// تعداد حروف کلمه (شمارش کاراکترهای واقعی، نه UTF-16)
const wordLength = (w: string) => Array.from(w).length;

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const getToastTheme = () =>
  typeof window !== "undefined" && localStorage.getItem("theme") == "dark" ? "dark" : "light";

const showToast = (
  type: "error" | "warning" | "success" | "info",
  message: string,
  autoClose: number = 3000
) => {
  toast[type](message, {
    position: "top-center",
    autoClose,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: getToastTheme(),
  });
};

const categorizeWords = (wordsArray: WordItem[]): CategorizedWords => {
  const categorized: CategorizedWords = {};
  wordsArray.forEach((item: WordItem) => {
    const len = wordLength(item.word);
    if (!categorized[len]) categorized[len] = [];
    categorized[len].push(item.word);
  });
  // مرتب‌سازی دسته‌ها از کمترین تعداد حرف به بیشترین
  return Object.keys(categorized)
    .map(Number)
    .sort((a, b) => a - b)
    .reduce((obj: CategorizedWords, key: number) => {
      obj[key] = categorized[key];
      return obj;
    }, {} as CategorizedWords);
};

// اضافه کردن کلمه (بدون تکرار) و مرتب‌سازی از بیشترین حروف به کمترین
const addAndSortByLength = (list: string[], word: string) => {
  if (list.includes(word)) return list;
  return [...list, word].sort((a, b) => wordLength(b) - wordLength(a));
};

/* ------------------------------------------------------------------ */
/* Small presentational components                                     */
/* ------------------------------------------------------------------ */

const SectionTitle = ({ title, hint }: { title: string; hint?: string }) => (
  <div className="mt-12 mb-1 pb-3 border-b border-gray-200 dark:border-gray-700/70 text-right">
    <div className="flex items-center gap-2.5">
      <span className="h-5 w-1.5 rounded-full bg-gradient-to-b from-blue-500 to-purple-600" />
      <h2 className="font-['iransans-bold'] text-lg text-gray-800 dark:text-gray-100">{title}</h2>
    </div>
    {hint && <p className="mt-1.5 mr-4 font-['iransans-md'] text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
  </div>
);

const Field = ({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div className="mt-6">
    <label
      className="font-['iransans-md'] block text-right text-text6 dark:text-text6_dark text-[.85rem] sm:text-[.95rem] cursor-pointer py-3"
      htmlFor={htmlFor}
    >
      {label}
      {required && <span className="text-red-500 px-1">*</span>}
      <div className="mt-1 flex gap-2 w-full items-center justify-between">{children}</div>
    </label>
  </div>
);

const ToggleRow = ({
  title,
  description,
  checked,
  onToggle,
}: {
  title: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) => (
  <div
    className="py-4 cursor-pointer sm:hover:bg-border2 dark:sm:hover:bg-border2_dark transition select-none"
    onClick={onToggle}
  >
    <div className="flex items-center justify-between w-full h-[42px] pl-2 rounded">
      <label className="text-sm font-['iransans-md'] cursor-pointer">
        <h3 className="text-text dark:text-text_dark font-['iransans-md'] text-[15px]">{title}</h3>
      </label>
      <Switch
        checked={checked}
        onChange={onToggle}
        onClick={(e: any) => e.stopPropagation()}
        className={`${checked ? "bg-rgba2" : "bg-border dark:bg-border_dark"}
relative h-[19px] w-[33px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out flex items-center`}
      >
        <span
          aria-hidden="true"
          className={`${checked ? "translate-x-2 bg-primary" : "-translate-x-[16px] bg-text5 dark:bg-text5_dark"}
pointer-events-none inline-block h-[22px] w-[22px] transform rounded-full shadow-lg ring-0 transition duration-200 ease-in-out`}
        />
      </Switch>
    </div>
    <p className="text-justify font-['iransans-md'] text-text5 dark:text-text5_dark text-[12px] sm:text-[14px] mb-1">
      {description}
    </p>
  </div>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const Page = () => {
  const inputImageRef: any = useRef();
  const inputVideoRef: any = useRef();
  const inputMusicRef: any = useRef();

  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [language, setLanguage] = useState<string | null>(null);
  const [languageCode, setLanguageCode] = useState<string | null>(null);
  const [languageList, setLanguageList] = useState<any[]>([]);
  const [season, setSeason] = useState<string | null>(null);
  const [seasonList, setSeasonList] = useState<any[]>([]);
  const [visible, setVisible] = useState(true);
  const [active, setActive] = useState(true);
  const [stageNumberInLanguage, setStageNumberInLanguage] = useState("");
  const [stageNumberInSeason, setStageNumberInSeason] = useState("");
  const [image, setImage] = useState<any>([]);
  const [video, setVideo] = useState<any>([]);
  const media = video.concat(image);
  const videoOffset = video.length === 1 ? 1 : 0;
  const [music, setMusic] = useState<any[]>([]);
  const [publicationStatus, setPublicationStatus] = useState<string | null>(null);
  const [completionStatus, setCompletionStatus] = useState<string | null>(null);
  const [letter, setLetter] = useState(["", "", ""]);
  const [wordsFounded, setWordsFounded] = useState<CategorizedWords | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [hiddenWords, setHiddenWords] = useState<string[]>([]);

  useEffect(() => {
    getAllLanguage();
  }, []);

  /* ----------------------------- API ----------------------------- */

  const getAllLanguage = async () => {
    const data = {
      query: `
        query getAllLanguageForAdmin($filter_visible : Boolean, $filter_active : Boolean){
          getAllLanguageForAdmin(filter_visible : $filter_visible, filter_active : $filter_active) {
            _id,
            code,
            name,
          }
        }
        `,
      variables: {
        filter_visible: false,
        filter_active: false,
      },
    };
    await axios({ url: "/", method: "post", data })
      .then((response) => {
        const list = response.data?.data?.getAllLanguageForAdmin;
        if (list?.length > 0) {
          const items = list.map((item: any) => ({
            label: item.name,
            value: item._id,
            code: item.code,
          }));
          items.unshift({ label: "انتخاب زبان", value: null, code: null });
          setLanguageList(items);
        }
      })
      .catch(() => {
        setLanguageList([]);
      });
  };

  const getAllSeason = async (value: string) => {
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
    await axios({ url: "/", method: "post", data })
      .then((response) => {
        const list = response.data?.data?.getAllWordGameSeasonForAdmin;
        if (list?.length > 0) {
          const items = list.map((item: any) => ({
            label: item.title,
            value: item._id,
          }));
          items.unshift({ label: "انتخاب فصل", value: null });
          setSeasonList(items);
        } else {
          setSeasonList([]);
        }
      })
      .catch(() => {
        setSeasonList([]);
      });
  };

  const registerAndConfirm = () => {
    if (
      !season ||
      !language ||
      stageNumberInLanguage.length == 0 ||
      stageNumberInSeason.length == 0 ||
      !publicationStatus ||
      !completionStatus
    ) {
      showToast("error", "ابتدا موارد الزامی را وارد کنید", 6000);
      return;
    }
    if (letter.filter((l) => l !== "").length < MIN_LETTERS) {
      showToast("error", `حداقل ${MIN_LETTERS} حرف برای مرحله وارد کنید`);
      return;
    }
    if (words.length === 0) {
      showToast("error", "حداقل یک کلمه اصلی برای مرحله انتخاب کنید");
      return;
    }
    checkedAndRegister();
  };

  const resetForm = () => {
    setImage([]);
    setVideo([]);
    setMusic([]);
    setStageNumberInLanguage("");
    setStageNumberInSeason("");
    setLetter(["", "", ""]);
    setWords([]);
    setHiddenWords([]);
    setWordsFounded(null);
  };

  const checkedAndRegister = async () => {
    setLoading(true);
    const data = {
      query: `
          mutation newStageDefinitionForWordGame(
            $letters : [String!]!,
            $words : [String!]!,
            $hidden_words : [String],
            $season : ID!,
            $language_ref : ID!,
            $stage_number_in_language : Int!,
            $stage_number_in_season : Int!,
            $is_visible : Boolean!,
            $is_active : Boolean!,
            $media : [FileInput],
            $voice : [FileInput],
            $publication_status : String!,
            $completion_status : String!,
          ){
            newStageDefinitionForWordGame(
              letters : $letters,
              words : $words,
              hidden_words : $hidden_words,
              season : $season,
              language_ref : $language_ref,
              stage_number_in_language : $stage_number_in_language,
              stage_number_in_season : $stage_number_in_season,
              is_visible : $is_visible,
              is_active : $is_active,
              media : $media,
              voice : $voice,
              publication_status : $publication_status,
              completion_status : $completion_status,
            ) {
              status,
              message,
            }
          }
          `,
      variables: {
        letters: letter.filter((l) => l !== ""),
        words: words,
        hidden_words: hiddenWords,
        season: season,
        language_ref: language,
        stage_number_in_language: Number(stageNumberInLanguage),
        stage_number_in_season: Number(stageNumberInSeason),
        is_visible: visible,
        is_active: active,
        media:
          media.length > 0
            ? media.map((item: any, index: number) => ({
                file: null,
                order: index + 1,
                duration: item.duration ?? undefined,
              }))
            : undefined,
        voice:
          music.length > 0
            ? music.map((item: any, index: number) => ({
                file: null,
                order: index + 1,
                duration: item.duration ?? undefined,
              }))
            : undefined,
        publication_status: publicationStatus,
        completion_status: completionStatus,
      },
    };

    const map: any = {};
    const formD = new FormData();
    let fileIndex = 0;
    media.forEach((_: any, index: number) => {
      map[fileIndex] = [`variables.media.${index}.file`];
      fileIndex++;
    });
    music.forEach((_: any, index: number) => {
      map[fileIndex] = [`variables.voice.${index}.file`];
      fileIndex++;
    });
    formD.append("operations", JSON.stringify(data));
    formD.append("map", JSON.stringify(map));
    fileIndex = 0;
    media.forEach((item: any) => {
      formD.append(`${fileIndex}`, item.file);
      fileIndex++;
    });
    music.forEach((item: any) => {
      formD.append(`${fileIndex}`, item.file);
      fileIndex++;
    });

    await axios({
      url: "/",
      method: "post",
      data: formD,
      headers: {
        Accept: "*/*",
        "Content-Type": "multipart/form-data",
      },
    })
      .then((response) => {
        setLoading(false);
        if (response.data?.data?.newStageDefinitionForWordGame?.status == 200) {
          showToast("success", response.data?.data?.newStageDefinitionForWordGame?.message);
          resetForm();
        } else {
          showToast("error", response.data?.errors?.[0]?.data?.[0]?.message || "مشکلی پیش آمد دوباره تلاش کنید");
        }
      })
      .catch(() => {
        showToast("error", "مشکلی پیش آمد دوباره تلاش کنید");
        setLoading(false);
      });
  };

  /* ---------------------------- Media ---------------------------- */

  const handleAddPhotos = (e: any) => {
    const photos: File[] = Array.from(e.target.files || []);
    if (photos.length === 0) return;
    if (image.length + photos.length > MAX_IMAGES) {
      showToast("warning", `بیشتر از ${MAX_IMAGES} عکس نمی‌توانید برای مرحله انتخاب کنید.`);
    } else {
      const newData: any = [...image];
      photos.forEach((photo) => {
        newData.push({ file: photo, preview: URL.createObjectURL(photo) });
      });
      setImage(newData);
    }
    if (inputImageRef.current) inputImageRef.current.value = "";
  };

  const handleAddVideos = (e: any) => {
    const file: File | undefined = e.target.files?.[0];
    if (!file) return;
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
        setVideo([{ file, preview: uri, duration: duration.toFixed(0).toString() }]);
      }
      if (inputVideoRef.current) inputVideoRef.current.value = "";
    };
  };

  const handleAddMusic = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (files.length + music.length > MAX_VOICES) {
      showToast("warning", `بیشتر از ${MAX_VOICES} صدا نمیتوانید برای مرحله انتخاب کنید.`);
      if (inputMusicRef.current) inputMusicRef.current.value = "";
      return;
    }

    const results = await Promise.all(
      files.map(
        (file) =>
          new Promise<any | null>((resolve) => {
            const objectURL = URL.createObjectURL(file);
            const audioEl = document.createElement("audio");
            audioEl.preload = "metadata";
            audioEl.src = objectURL;
            audioEl.onloadedmetadata = function () {
              const duration = audioEl.duration;
              if (duration < 3) {
                showToast("warning", "صدا نمیتواند کمتر از 3 ثانیه باشد");
                URL.revokeObjectURL(objectURL);
                resolve(null);
              } else if (duration > 180) {
                showToast("warning", "صدا نمیتواند بیشتر از 180 ثانیه باشد.");
                URL.revokeObjectURL(objectURL);
                resolve(null);
              } else {
                resolve({ file, preview: objectURL, duration: duration.toFixed(0).toString() });
              }
            };
            audioEl.onerror = function () {
              showToast("error", "فایل صوتی قابل خواندن نیست.");
              URL.revokeObjectURL(objectURL);
              resolve(null);
            };
          })
      )
    );
    const validAudios = results.filter((item) => item !== null);
    setMusic((prev) => [...prev, ...validAudios].slice(0, MAX_VOICES));
    if (inputMusicRef.current) inputMusicRef.current.value = "";
  };

  const deleteMediaItem = (item: any) => {
    if (item?.file?.type.includes("video") == true) {
      setVideo([]);
    } else {
      const index = image.findIndex((i: any) => i.preview == item.preview);
      if (index === -1) return;
      const newData = [...image];
      newData.splice(index, 1);
      setImage(newData);
    }
  };

  const moveImage = (fromMediaIndex: number, toMediaIndex: number) => {
    if (
      fromMediaIndex < videoOffset ||
      toMediaIndex < videoOffset ||
      fromMediaIndex >= media.length ||
      toMediaIndex >= media.length
    ) {
      showToast("warning", "در صورت وجود ویدیو، باید در اولین آیتم لیست، ویدیو قرار گیرد.");
      return;
    }
    const newImageArray = [...image];
    const [movedItem] = newImageArray.splice(fromMediaIndex - videoOffset, 1);
    newImageArray.splice(toMediaIndex - videoOffset, 0, movedItem);
    setImage(newImageArray);
  };

  const setOrderForMediaItem = ({ item, index }: { item: any; index: number }) => {
    if (item?.file?.type.includes("video") == true) {
      showToast("warning", "ترتیب نمایش ویدیو همیشه در اولین آیتم است و قابل تغییر نمیباشد.");
      return;
    }
    ModalInputHelper.showModalInput({
      title: `ترتیب نمایش عکس = (${index + 1})`,
      description: "میتوانید ترتیب نمایش این عکس را تغییر دهید.",
      inputValue: `${index + 1}`,
      buttons: [
        {
          buttonText: "تایید",
          onClickFn: (call) => {
            const value = Number(call);
            if (Number.isInteger(value) && value >= 1 && value <= media.length) {
              moveImage(index, value - 1);
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
      options: { maxLength: 2 },
    });
  };

  const deleteVoiceItem = (item: any) => {
    setMusic((prev) => prev.filter((i: any) => i.preview !== item.preview));
  };

  const moveVoiceItem = (fromIndex: number, toIndex: number) => {
    setMusic((prev) => {
      if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= prev.length || toIndex >= prev.length) {
        return prev;
      }
      const updated = [...prev];
      const [movedItem] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, movedItem);
      return updated;
    });
  };

  const setOrderForVoiceItem = ({ index }: { item: any; index: number }) => {
    ModalInputHelper.showModalInput({
      title: `ترتیب پخش صدا در مرحله = (${index + 1})`,
      description: "میتوانید ترتیب پخش این صدا را تغییر دهید.",
      inputValue: `${index + 1}`,
      buttons: [
        {
          buttonText: "تایید",
          onClickFn: (call) => {
            const value = Number(call);
            if (Number.isInteger(value) && value >= 1 && value <= music.length) {
              moveVoiceItem(index, value - 1);
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
      options: { maxLength: 2 },
    });
  };

  /* ------------------------ Letters & search ----------------------- */

  const findAllWord = () => {
    if (!language || !languageCode) {
      showToast("error", "زبان دیکشنری را انتخاب کنید.");
      return;
    }
    if (letter.filter((l) => l !== "").length < MIN_LETTERS) {
      showToast("error", `حداقل ${MIN_LETTERS} حرف وارد کنید`);
      return;
    }
    checkedAndFindAllWord();
  };

  const checkedAndFindAllWord = async () => {
    setSearching(true);
    const data = {
      query: `
          query combineLettersAndFindWords(
            $letter : [String!]!,
            $language : String!,
          ){
            combineLettersAndFindWords(
              letter : $letter,
              language : $language,
            ) {
              word
            }
          }
          `,
      variables: {
        letter: letter.filter((l) => l !== ""),
        language: languageCode,
      },
    };

    await axios({ url: "/", method: "post", data })
      .then((response) => {
        const list = response.data?.data?.combineLettersAndFindWords;
        if (list && list.length > 0) {
          setWordsFounded(categorizeWords(list));
          showToast("success", `${list.length} کلمه یافت شد`, 5000);
        } else if (list && list.length == 0) {
          setWordsFounded(null);
          showToast("info", "هیچ کلمه‌ای یافت نشد.", 5000);
        } else {
          setWordsFounded(null);
          showToast("error", response.data?.errors?.[0]?.data?.[0]?.message ?? "هیچ کلمه‌ای یافت نشد", 4000);
        }
        setSearching(false);
      })
      .catch(() => {
        showToast("error", "مشکلی پیش آمد دوباره تلاش کنید");
        setSearching(false);
      });
  };

  const changeLetter = (index: number, value: string) => {
    const filteredValue = value.match(LETTER_REGEX)?.join("") || "";
    setLetter((prev) => {
      const newLetter = [...prev];
      newLetter[index] = filteredValue;
      return newLetter;
    });
  };

  const deleteInput = (index: number) => {
    if (letter.length > MIN_LETTERS) {
      const newLetter = [...letter];
      newLetter.splice(index, 1);
      setLetter(newLetter);
    } else {
      showToast("error", `حداقل باید ${MIN_LETTERS} حرف را ترکیب کنید.`);
    }
  };

  const addNewInput = () => {
    if (letter.length < MAX_LETTERS) {
      setLetter((prev) => [...prev, ""]);
    } else {
      showToast("error", `بیشتر از ${MAX_LETTERS} حرف نمیتوان انتخاب کرد`);
    }
  };

  const handlePaste = (index: number, pastedText: string) => {
    const chars = pastedText.match(LETTER_REGEX) || [];
    if (chars.length === 0) return;
    setLetter((prev) => {
      const newLetters = [...prev];
      let currentIndex = index;
      for (let i = 0; i < chars.length; i++) {
        if (currentIndex >= newLetters.length) {
          if (newLetters.length < MAX_LETTERS) {
            newLetters.push(chars[i]);
            currentIndex++;
          } else {
            break;
          }
        } else {
          newLetters[currentIndex] = chars[i];
          currentIndex++;
        }
      }
      return newLetters;
    });
  };

  /* --------------------- Main / hidden words ---------------------- */
  // هر کلمه فقط در یکی از دو لیست می‌تواند باشد.
  // کلیک دوباره روی دکمهٔ فعال، کلمه را از همان لیست خارج می‌کند.

  const toggleMainWord = (word: string) => {
    if (hiddenWords.includes(word)) {
      showToast("warning", "این کلمه در کلمات پنهان است. ابتدا آن را از کلمات پنهان خارج کنید.");
      return;
    }
    if (words.includes(word)) {
      setWords((prev) => prev.filter((w) => w !== word));
    } else {
      setWords((prev) => addAndSortByLength(prev, word));
    }
  };

  const toggleHiddenWord = (word: string) => {
    if (words.includes(word)) {
      showToast("warning", "این کلمه در کلمات اصلی است. ابتدا آن را از کلمات اصلی خارج کنید.");
      return;
    }
    if (hiddenWords.includes(word)) {
      setHiddenWords((prev) => prev.filter((w) => w !== word));
    } else {
      setHiddenWords((prev) => addAndSortByLength(prev, word));
    }
  };

  const removeFromWords = (word: string) => setWords((prev) => prev.filter((w) => w !== word));
  const removeFromHiddenWords = (word: string) => setHiddenWords((prev) => prev.filter((w) => w !== word));

  /* ---------------------------- Render ---------------------------- */

  const uploadBoxClasses =
    "text-text6 dark:text-text6_dark border-2 border-dashed border-text5 dark:border-text5_dark py-6 text-lg flex-1 rounded-md cursor-pointer transition sm:hover:bg-border2 sm:dark:hover:bg-border2_dark flex flex-col justify-center items-center gap-y-2";

  const mediaIconBtn =
    "flex justify-center items-center rounded transition text-white bg-[#00000099] sm:hover:bg-[#33333370] text-lg w-6 h-6";

  return (
    <div className="flex flex-col justify-between w-full lg:w-[600px] 2xl:w-[750px] mt-10 mb-28 px-4 sm:mx-auto">
      {/* ---------------- آپلود رسانه ---------------- */}
      <div className="flex gap-6 justify-center font-['iransans-md'] mt-1">
        <label className={uploadBoxClasses} htmlFor="upload_file_photos" tabIndex={0}>
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
        <label className={uploadBoxClasses} htmlFor="upload_file_video">
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
        <label className={uploadBoxClasses} htmlFor="upload_file_audio">
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

      {(media.length > 0 || music.length > 0) && (
        <div className="border-2 border-dashed border-primary dark:border-primary rounded-md py-2 mt-4">
          {media.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-y-4 sm:gap-y-4 mt-4">
              {media.map((item: any, index: number) => {
                const isVideo = item?.file?.type.includes("video") == true;
                return (
                  <div key={item.preview} className="w-full h-20 3xs:h-24 sm:h-28 flex justify-center items-center">
                    <div
                      className="relative w-20 h-20 3xs:w-24 3xs:h-24 sm:w-28 sm:h-28 cursor-pointer"
                      onClick={() => {
                        if (isVideo) {
                          ShowVideoModalHelper.showModal({ src: item.preview, title: item?.title ? item.title : null });
                        } else {
                          ShowImageModalHelper.showModal({ src: item.preview, title: item?.title ? item.title : null });
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
                            setOrderForMediaItem({ item, index });
                          }}
                          className={`${mediaIconBtn} text-red_color`}
                        >
                          <p className="text-xs 3xs:text-sm text-center font-['iransans-md']">{index + 1}</p>
                        </div>
                        <div
                          onClick={(e: any) => {
                            e.stopPropagation();
                            deleteMediaItem(item);
                          }}
                          className={mediaIconBtn}
                        >
                          <BiTrash />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {music.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 px-2 mb-2">
              {music.map((item: any, index: number) => (
                <div key={item.preview} className="relative bg-primary rounded-lg p-4 w-full max-w-xs mx-auto">
                  <audio src={item.preview} controls className="w-full rounded-md" />
                  <div className="absolute top-2 left-2">
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteVoiceItem(item);
                      }}
                      className="w-6 h-6 bg-black/50 text-white hover:bg-black/70 rounded flex items-center justify-center cursor-pointer"
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
                      className="w-6 h-6 bg-black/60 text-red_color rounded flex items-center justify-center text-xs font-['iransans-md'] cursor-pointer"
                    >
                      {index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------- اطلاعات مرحله ---------------- */}
      <SectionTitle title="اطلاعات مرحله" />

      <Field label="زبان مرحله" htmlFor="stage-language" required>
        <SelectInput
          name="stage-game-language"
          options={languageList}
          onChange={(value) => {
            setLanguage(value || null);
            const item = languageList.find((i: any) => i.value == value);
            setLanguageCode(item?.code || null);
            setWordsFounded(null)
            setWords([])
            setHiddenWords([])
            // با تغییر زبان، فصل قبلی دیگر معتبر نیست
            setSeason(null);
            setSeasonList([]);
            if (value) {
              getAllSeason(value);
            }
          }}
        />
      </Field>
      <Field label="فصل مرحله" htmlFor="stage-season" required>
        <SelectInput
          name="stage-game-season"
          options={seasonList}
          onChange={(value) => {
            setSeason(value || null);
          }}
        />
      </Field>
      <Field label="شماره مرحله در زبان" htmlFor="stage-number-in-language" required>
        <Input
          type="number"
          id="stage-number-in-language"
          value={stageNumberInLanguage}
          changeState={setStageNumberInLanguage}
          classes="flex-1"
          inputStyles="!text-base"
        />
      </Field>
      <Field label="شماره مرحله در فصل" htmlFor="stage-number-in-season" required>
        <Input
          type="number"
          id="stage-number-in-season"
          value={stageNumberInSeason}
          changeState={setStageNumberInSeason}
          classes="flex-1"
          inputStyles="!text-base"
        />
      </Field>
      <Field label="وضعیت انتشار مرحله" htmlFor="stage-publication-status" required>
        <SelectInput
          name="stage-game-publication-status"
          options={PublicationStatus}
          onChange={(value) => setPublicationStatus(value)}
        />
      </Field>
      <Field label="وضعیت کامل بودن مرحله" htmlFor="stage-completion-status" required>
        <SelectInput
          name="stage-game-completion-status"
          options={CompletionStatus}
          onChange={(value) => setCompletionStatus(value)}
        />
      </Field>

      <ToggleRow
        title="قابل نمایش شود"
        description="با فعال بودن این گزینه، آیتم قابل نمایش برای کاربران ثبت خواهد شد."
        checked={visible}
        onToggle={() => setVisible((last) => !last)}
      />
      <Border />
      <ToggleRow
        title="فعال شود"
        description="با فعال بودن این گزینه، آیتم به عنوان فعال شده ثبت خواهد شد."
        checked={active}
        onToggle={() => setActive((last) => !last)}
      />
      <Border />

      {/* ---------------- حروف و کلمات ---------------- */}
      <SectionTitle
        title="حروف و کلمات"
        hint={`حروف مرحله را وارد کنید (${MIN_LETTERS} تا ${MAX_LETTERS} حرف) و روی «ترکیب حروف» بزنید.`}
      />

      <div className="flex items-center justify-between gap-3 mt-6">
        <GradientButton
          buttonText={"افزودن یک حرف"}
          onClickFn={addNewInput}
          loading={false}
          classes="!text-sm !flex-none !px-8 sm:!w-[200px] !w-full"
        />
        <GradientButton
          buttonText={"ترکیب حروف"}
          onClickFn={findAllWord}
          loading={searching}
          classes="!text-sm !flex-none !px-8 sm:!w-[200px] !w-full"
        />
      </div>

      {/* ورودی حروف */}
      <div className="mt-6 flex items-center justify-center">
        <div className="mt-4 flex flex-wrap gap-3 max-w-[calc(8*4rem+7*0.75rem)] justify-center">
          {letter.map((item: any, index: number) => (
            <div key={index.toString()} className="relative inline-block group">
              <Input
                value={item}
                changeState={(val: string) => changeLetter(index, val.slice(0, 1))}
                classes="w-16 text-center rounded-md"
                inputStyles="!w-16 !h-16 text-lg text-center font-bold tracking-wide"
                maxLength={1}
                fontSize="28px"
                onPaste={(e: React.ClipboardEvent<HTMLInputElement>) => {
                  e.preventDefault();
                  handlePaste(index, e.clipboardData.getData("text"));
                }}
              />
              {/* div (نه button) و بدون tabIndex تا با Tab فوکوس روی آیکون نیفتد و مستقیم به input بعدی برود */}
              <div
                role="button"
                aria-label="حذف این حرف"
                onClick={() => deleteInput(index)}
                className="absolute -top-3 -right-3 z-10
                  bg-gradient-to-br from-red-500 to-red-600
                  rounded-full p-1.5
                  shadow-lg hover:shadow-xl
                  transition-all duration-300
                  cursor-pointer
                  text-white
                  hover:scale-110 active:scale-95
                  opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
                  ring-2 ring-white dark:ring-gray-800
                  hover:rotate-12"
              >
                <BiTrash size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* خلاصهٔ کلمات انتخاب‌شده */}
      {(words.length > 0 || hiddenWords.length > 0) && (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 font-['iransans-md']">
          {/* کلمات اصلی */}
          <div className="rounded-xl overflow-hidden border border-emerald-200 dark:border-emerald-800/50 bg-white dark:bg-gray-800/40 shadow-sm">
            <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
              <h4 className="flex items-center gap-2 text-sm">
                <FaStar size={12} />
                کلمات اصلی
              </h4>
              <span className="bg-white/25 rounded-full px-2.5 py-0.5 text-xs">{words.length}</span>
            </div>
            <div className="p-4">
              {words.length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">هنوز کلمه‌ای انتخاب نشده است.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {words.map((w) => (
                    <span
                      key={w}
                      className="flex items-center gap-2 rounded-lg border border-emerald-200 dark:border-emerald-700/50 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/25 dark:to-teal-900/15 text-emerald-900 dark:text-emerald-100 px-2.5 py-1 text-sm"
                    >
                      {w}
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => removeFromWords(w)}
                        title="حذف از کلمات اصلی"
                        className="text-xs text-emerald-700/60 dark:text-emerald-300/60 hover:text-red-500 transition-colors"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* کلمات پنهان */}
          <div className="rounded-xl overflow-hidden border border-indigo-200 dark:border-indigo-800/50 bg-white dark:bg-gray-800/40 shadow-sm">
            <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
              <h4 className="flex items-center gap-2 text-sm">
                <FaEyeSlash size={13} />
                کلمات پنهان
              </h4>
              <span className="bg-white/25 rounded-full px-2.5 py-0.5 text-xs">{hiddenWords.length}</span>
            </div>
            <div className="p-4">
              {hiddenWords.length === 0 ? (
                <p className="text-xs text-gray-500 dark:text-gray-400">هنوز کلمه‌ای انتخاب نشده است.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {hiddenWords.map((w) => (
                    <span
                      key={w}
                      className="flex items-center gap-2 rounded-lg border border-indigo-200 dark:border-indigo-700/50 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/25 dark:to-purple-900/15 text-indigo-900 dark:text-indigo-100 px-2.5 py-1 text-sm"
                    >
                      {w}
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => removeFromHiddenWords(w)}
                        title="حذف از کلمات پنهان"
                        className="text-xs text-indigo-700/60 dark:text-indigo-300/60 hover:text-red-500 transition-colors"
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* کلمات یافت‌شده، دسته‌بندی‌شده بر اساس تعداد حروف */}
      {wordsFounded && (
        <div className="mt-10 space-y-8">
          {Object.entries(wordsFounded).map(([length, wordList]) => (
            <div key={length} className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-['iransans-bold'] text-gray-800 dark:text-gray-200">
                  کلمات {length} حرفی
                </h3>
                <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm font-['iransans-md']">
                  {wordList.length} کلمه
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                {wordList.map((word: string, idx: number) => {
                  const inWords = words.includes(word);
                  const inHidden = hiddenWords.includes(word);

                  // رنگ کارت فقط با «وضعیت انتخاب» عوض می‌شود، نه با هاور
                  const cardState = inWords
                    ? "border-emerald-300 dark:border-emerald-700/60 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/25 dark:to-teal-900/15 shadow-md"
                    : inHidden
                    ? "border-indigo-300 dark:border-indigo-700/60 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/25 dark:to-purple-900/15 shadow-md"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm";

                  const btnBase =
                    "flex items-center gap-1 text-[11px] font-['iransans-md'] px-2.5 py-1 rounded-lg border transition-all duration-200";
                  const locked =
                    "border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 opacity-50 cursor-not-allowed";

                  const mainBtn = inWords
                    ? "border-transparent bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm hover:from-emerald-600 hover:to-teal-600"
                    : inHidden
                    ? locked
                    : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-300";

                  const hiddenBtn = inHidden
                    ? "border-transparent bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm hover:from-indigo-600 hover:to-purple-700"
                    : inWords
                    ? locked
                    : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-300";

                  return (
                    <div
                      key={`${word}-${idx}`}
                      className={`rounded-xl border px-4 py-2.5 flex flex-col items-center gap-2.5 transition-colors duration-300 ${cardState}`}
                    >
                      <span className="text-lg font-['iransans-md'] text-gray-800 dark:text-gray-100">{word}</span>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => toggleMainWord(word)}
                          disabled={inHidden}
                          title={
                            inHidden
                              ? "این کلمه در کلمات پنهان است"
                              : inWords
                              ? "برای حذف از کلمات اصلی کلیک کنید"
                              : "افزودن به کلمات اصلی"
                          }
                          className={`${btnBase} ${mainBtn}`}
                        >
                          {inWords ? <FaCheck size={9} /> : <FaStar size={9} />}
                          کلمه اصلی
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleHiddenWord(word)}
                          disabled={inWords}
                          title={
                            inWords
                              ? "این کلمه در کلمات اصلی است"
                              : inHidden
                              ? "برای حذف از کلمات پنهان کلیک کنید"
                              : "افزودن به کلمات پنهان"
                          }
                          className={`${btnBase} ${hiddenBtn}`}
                        >
                          {inHidden ? <FaCheck size={9} /> : <FaEyeSlash size={10} />}
                          کلمه پنهان
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Footer buttonFn={registerAndConfirm} buttonText="ثبت مرحله" loadingButton={loading} classes="md:!mr-72 !justify-end" />
      <ModalInput
        ref={(Ref) => {
          ModalInputHelper.setRef(Ref);
        }}
      />
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
    </div>
  );
};

export default Page;