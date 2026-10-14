"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { FaCheck, FaEyeSlash, FaStar } from "react-icons/fa6";
import { BiTrash } from "react-icons/bi";
import { Switch } from "@headlessui/react";
import { useParams } from "next/navigation";
import Input from "@/components/Input";
import Footer from "@/components/Footer/Footer";
import GradientButton from "@/components/GradientButton";
import SelectInput from "@/components/SelectInput";
import Border from "@/components/Border";
import ScreenLoading from "@/components/ScreenLoading";

/* ------------------------------------------------------------------ */
/* Types & constants                                                   */
/* ------------------------------------------------------------------ */

type SelectedOption = {
  value: any;
  label: string;
};

type listType = {
  label: any;
  value: any;
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

// مرتب‌سازی لیست کلمات از بیشترین حروف به کمترین
const sortByLengthDesc = (list: string[]) => [...list].sort((a, b) => wordLength(b) - wordLength(a));

// یک کلید یکتا از حروف برای مقایسهٔ «حروف فعلی» با «حروفی که آخرین بار ترکیب شده‌اند»
const lettersKey = (letters: string[]) => letters.filter((l) => l !== "").join("|");

// حداقل MIN_LETTERS ورودی خالی تا کاربر بتواند حروف را ویرایش کند
const padLetters = (letters: string[]) => {
  const result = [...letters].slice(0, MAX_LETTERS);
  while (result.length < MIN_LETTERS) result.push("");
  return result;
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
  const { stageId } = useParams();

  const [oldData, setOldData] = useState<any>(null);
  const [changeVersionUpdated, setChangeVersionUpdated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [loading2, setLoading2] = useState(true);
  const [getError, setGetError] = useState(false);

  const [language, setLanguage] = useState<string | null>(null);
  const [languageCode, setLanguageCode] = useState<string | null>(null);
  const [languageList, setLanguageList] = useState<listType[]>([]);
  const [season, setSeason] = useState<string | null>(null);
  const [seasonList, setSeasonList] = useState<listType[]>([]);
  const [visible, setVisible] = useState(true);
  const [active, setActive] = useState(true);
  const [stageNumberInLanguage, setStageNumberInLanguage] = useState("");
  const [stageNumberInSeason, setStageNumberInSeason] = useState("");
  const [publicationStatus, setPublicationStatus] = useState<string | null>(null);
  const [completionStatus, setCompletionStatus] = useState<string | null>(null);

  const [letter, setLetter] = useState<string[]>(["", "", ""]);
  // حروفی که آخرین بار کلمات‌شان ساخته شده (برای تشخیص تغییر حروف بدون ترکیب مجدد)
  const [searchedLettersKey, setSearchedLettersKey] = useState("");
  const [wordsFounded, setWordsFounded] = useState<CategorizedWords | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [hiddenWords, setHiddenWords] = useState<string[]>([]);

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ----------------------------- API ----------------------------- */

  // صدا زدن API ترکیب حروف؛ در صورت خطا null برمی‌گرداند
  const fetchCombinedWords = async (letters: string[], code: string): Promise<{ list: string[] | null; error?: string }> => {
    try {
      const response = await axios({
        url: "/",
        method: "post",
        data: {
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
            letter: letters.filter((l) => l !== ""),
            language: code,
          },
        },
      });
      const list = response.data?.data?.combineLettersAndFindWords;
      if (Array.isArray(list)) {
        return { list: list.map((i: WordItem) => i.word) };
      }
      return { list: null, error: response.data?.errors?.[0]?.data?.[0]?.message };
    } catch {
      return { list: null };
    }
  };

  const getData = async () => {
    await axios({
      url: "/",
      method: "post",
      data: {
        query: `
            query getWordGameStageInformation(
              $_id : ID!,
            ){
                getWordGameStageInformation(
                  _id : $_id,
                ) {
                    _id,
                    letters,
                    words,
                    hidden_words,
                    season_info{_id, title},
                    language_info{_id, name, code},
                    stage_number_in_language,
                    stage_number_in_season,
                    is_visible,
                    is_active,
                    publication_status,
                    completion_status,
                }
            }
            `,
        variables: {
          _id: stageId,
        },
      },
    })
      .then((response) => {
        const data = response.data?.data?.getWordGameStageInformation;
        if (!data) {
          setGetError(true);
          return;
        }

        setOldData(structuredClone(data));

        setLanguage(data?.language_info?._id ?? null);
        const code: string | null = data?.language_info?.code ?? null;
        setLanguageCode(code);
        setSeason(data?.season_info?._id ?? null);
        setLanguageList([{ label: data?.language_info?.name, value: data?.language_info?._id }]);
        setSeasonList([{ label: data?.season_info?.title, value: data?.season_info?._id }]);

        setVisible(!!data?.is_visible);
        setActive(!!data?.is_active);
        setStageNumberInLanguage(String(data?.stage_number_in_language ?? ""));
        setStageNumberInSeason(String(data?.stage_number_in_season ?? ""));
        setPublicationStatus(data?.publication_status ?? null);
        setCompletionStatus(data?.completion_status ?? null);

        const savedLetters: string[] = (data?.letters || []).filter((l: string) => l !== "");
        const savedWords: string[] = sortByLengthDesc(data?.words || []);
        const savedHidden: string[] = sortByLengthDesc(data?.hidden_words || []);

        setLetter(padLetters(savedLetters));
        setWords(savedWords);
        setHiddenWords(savedHidden);
        setSearchedLettersKey(lettersKey(savedLetters));

        // تا قبل از رسیدن پاسخ سرور، کلمات ذخیره‌شده‌ی مرحله نمایش داده می‌شوند
        const savedAll = Array.from(new Set([...savedWords, ...savedHidden]));
        setWordsFounded(savedAll.length > 0 ? categorizeWords(savedAll.map((w) => ({ word: w }))) : null);

        setLoading2(false);

        // ترکیب حروفِ ذخیره‌شده و ساخت لیست کامل کلمات قابل ساخت
        if (code && savedLetters.length >= MIN_LETTERS) {
          loadInitialWords(savedLetters, code, savedAll);
        }
      })
      .catch(() => {
        setGetError(true);
      });
  };

  // بعد از ورود به صفحه: کلمات قابل ساخت را می‌گیریم و با کلمات ذخیره‌شده ادغام می‌کنیم
  // (تا اگر دیکشنری تغییر کرده باشد، کلمات ذخیره‌شدهٔ مرحله ناپدید نشوند)
  const loadInitialWords = async (letters: string[], code: string, savedAll: string[]) => {
    setSearching(true);
    const { list, error } = await fetchCombinedWords(letters, code);
    if (list) {
      const merged = Array.from(new Set([...list, ...savedAll]));
      setWordsFounded(categorizeWords(merged.map((w) => ({ word: w }))));
    } else {
      showToast("error", error ?? "دریافت کلمات قابل ساخت ناموفق بود. دوباره روی «ترکیب حروف» بزنید.", 5000);
    }
    setSearching(false);
  };

  const tryAgain = () => {
    setLoading2(true);
    setGetError(false);
    getData();
  };

  /* ------------------------ Letters & search ----------------------- */

  const findAllWord = async () => {
    if (!language || !languageCode) {
      showToast("error", "زبان دیکشنری مشخص نیست.");
      return;
    }
    const filled = letter.filter((l) => l !== "");
    if (filled.length < MIN_LETTERS) {
      showToast("error", `حداقل ${MIN_LETTERS} حرف وارد کنید`);
      return;
    }

    setSearching(true);
    const { list, error } = await fetchCombinedWords(letter, languageCode);
    setSearching(false);

    if (list === null) {
      showToast("error", error ?? "مشکلی پیش آمد دوباره تلاش کنید", 4000);
      return;
    }

    setSearchedLettersKey(lettersKey(letter));

    if (list.length === 0) {
      setWordsFounded(null);
      showToast("info", "هیچ کلمه‌ای یافت نشد.", 5000);
    } else {
      setWordsFounded(categorizeWords(list.map((w) => ({ word: w }))));
      showToast("success", `${list.length} کلمه یافت شد`, 5000);
    }

    // کلماتِ انتخاب‌شده‌ای که با حروف جدید قابل ساخت نیستند حذف می‌شوند
    const available = new Set(list);
    const keptWords = words.filter((w) => available.has(w));
    const keptHidden = hiddenWords.filter((w) => available.has(w));
    const removed = words.length - keptWords.length + (hiddenWords.length - keptHidden.length);
    if (removed > 0) {
      setWords(keptWords);
      setHiddenWords(keptHidden);
      showToast("warning", `${removed} کلمهٔ انتخاب‌شده با حروف جدید قابل ساخت نبود و حذف شد.`, 6000);
    }
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

  /* --------------------------- Submit ---------------------------- */

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
    if (lettersKey(letter) !== searchedLettersKey) {
      showToast("error", "حروف تغییر کرده‌اند. ابتدا روی «ترکیب حروف» بزنید تا کلمات به‌روز شوند.", 5000);
      return;
    }
    if (words.length === 0) {
      showToast("error", "حداقل یک کلمه اصلی برای مرحله انتخاب کنید");
      return;
    }
    checkedAndRegister();
  };

  const checkedAndRegister = async () => {
    setLoading(true);
    const data = {
      query: `
          mutation editWordGameStageInformation(
            $_id : ID!,
            $letters : [String],
            $words : [String],
            $hidden_words : [String],
            $stage_number_in_language : Int,
            $stage_number_in_season : Int,
            $is_visible : Boolean,
            $is_active : Boolean,
            $publication_status : String,
            $completion_status : String,
            $change_version_updated : Boolean!
          ){
            editWordGameStageInformation(
              _id : $_id,
              letters : $letters,
              words : $words,
              hidden_words : $hidden_words,
              stage_number_in_language : $stage_number_in_language,
              stage_number_in_season : $stage_number_in_season,
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
        _id: stageId,
        letters: letter.filter((l) => l !== ""),
        words: words,
        hidden_words: hiddenWords,
        stage_number_in_language:
          oldData?.stage_number_in_language !== Number(stageNumberInLanguage) && Number(stageNumberInLanguage) > 0
            ? Number(stageNumberInLanguage)
            : undefined,
        stage_number_in_season:
          oldData?.stage_number_in_season !== Number(stageNumberInSeason) && Number(stageNumberInSeason) > 0
            ? Number(stageNumberInSeason)
            : undefined,
        is_visible: oldData?.is_visible !== visible ? visible : undefined,
        is_active: oldData?.is_active !== active ? active : undefined,
        publication_status: oldData?.publication_status !== publicationStatus ? publicationStatus : undefined,
        completion_status: oldData?.completion_status !== completionStatus ? completionStatus : undefined,
        change_version_updated: changeVersionUpdated,
      },
    };

    await axios({
      url: "/",
      method: "post",
      data: data,
    })
      .then((response) => {
        setLoading(false);
        if (response.data?.data?.editWordGameStageInformation?.status == 200) {
          showToast("success", response.data?.data?.editWordGameStageInformation?.message, 5000);
          // مقادیر ذخیره‌شده را به‌عنوان مبنای جدید مقایسه نگه می‌داریم
          setOldData((prev: any) => ({
            ...prev,
            letters: letter.filter((l) => l !== ""),
            words,
            hidden_words: hiddenWords,
            stage_number_in_language: Number(stageNumberInLanguage),
            stage_number_in_season: Number(stageNumberInSeason),
            is_visible: visible,
            is_active: active,
            publication_status: publicationStatus,
            completion_status: completionStatus,
          }));
          setChangeVersionUpdated(false);
        } else {
          showToast("error", response.data?.errors?.[0]?.data?.[0]?.message || "مشکلی پیش آمد دوباره تلاش کنید");
        }
      })
      .catch(() => {
        showToast("error", "مشکلی پیش آمد دوباره تلاش کنید");
        setLoading(false);
      });
  };

  /* ---------------------------- Render ---------------------------- */

  if (loading2) {
    return (
      <div className="flex items-center justify-center w-full h-[calc(100dvh-60px)]">
        <ScreenLoading getError={getError} notItem={false} tryAgain={tryAgain} />
      </div>
    );
  }

  const lettersChanged = lettersKey(letter) !== searchedLettersKey;

  return (
    <div className="flex flex-col justify-between w-full lg:w-[600px] 2xl:w-[750px] mt-10 mb-28 px-4 sm:mx-auto">
      <Border />
      <ToggleRow
        title="ورژن آپدیت ارتقا یابد"
        description="با فعال بودن این گزینه، بعد از ویرایش، ورژن آپدیت سند (version_updated) افزایش میابد."
        checked={changeVersionUpdated}
        onToggle={() => setChangeVersionUpdated((last) => !last)}
      />
      <Border />

      {/* ---------------- اطلاعات مرحله ---------------- */}
      <SectionTitle title="اطلاعات مرحله" />

      <Field label="زبان مرحله" htmlFor="stage-language" required>
        <SelectInput
          disabled={true}
          value={language}
          name="stage-game-language"
          options={languageList}
          onChange={(value) => setLanguage(value || null)}
        />
      </Field>
      <Field label="فصل مرحله" htmlFor="stage-season" required>
        <SelectInput
          disabled={true}
          value={season}
          name="stage-game-season"
          options={seasonList}
          onChange={(value) => setSeason(value || null)}
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
          value={publicationStatus}
          name="stage-game-publication-status"
          options={PublicationStatus}
          onChange={(value) => setPublicationStatus(value)}
        />
      </Field>
      <Field label="وضعیت کامل بودن مرحله" htmlFor="stage-completion-status" required>
        <SelectInput
          value={completionStatus}
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
        hint={`حروف مرحله را ویرایش کنید (${MIN_LETTERS} تا ${MAX_LETTERS} حرف) و در صورت تغییر، روی «ترکیب حروف» بزنید.`}
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

      {lettersChanged && (
        <p className="mt-4 text-center font-['iransans-md'] text-xs text-amber-600 dark:text-amber-400">
          حروف تغییر کرده‌اند؛ برای به‌روزرسانی کلمات، روی «ترکیب حروف» بزنید.
        </p>
      )}

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

      <Footer
        buttonFn={registerAndConfirm}
        buttonText="ویرایش اطلاعات"
        loadingButton={loading}
        classes="md:!mr-72 !justify-end"
      />
    </div>
  );
};

export default Page;