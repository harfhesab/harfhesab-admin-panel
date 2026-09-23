"use client";

import React, { useEffect, useState } from "react";
import { IoCalendarOutline } from "react-icons/io5";
import ImageComponent from "../ImageComponent";
import CheckBox from "../CheckBox";
import moment from "moment-jalaali";
moment.locale('fa');
moment.loadPersian({ usePersianDigits: false, dialect: "persian-modern" });

const HarfAkharSelectItem = ({
  _id,
  title,
  description,
  checked,
  deletedItem,
  selectedItem,
  numberSelect = 1,
  imageSrc,
  start_date,
  end_date,
}: {
  _id: any;
  title: string;
  description?: string;
  checked: boolean;
  deletedItem: any;
  selectedItem: any;
  numberSelect?: number;
  imageSrc?: any;
  start_date?: Date | string;
  end_date?: Date | string;
}) => {
  const [select, setSelect] = useState(checked);

  const getTime = (date: Date | string) => moment(date).format("HH:mm");

  useEffect(() => {
    setSelect(checked);
  }, [checked]);

  const selectItem = () => {
    if (select == true) {
      setSelect(false);
      const time = setTimeout(() => {
        deletedItem();
        clearTimeout(time);
      }, 150);
    } else {
      setSelect(true);
      const time = setTimeout(() => {
        if (selectedItem() == false) {
          setSelect(false);
        }
        clearTimeout(time);
      }, 150);
    }
  };

  return (
    <div 
      className="py-4 select-none cursor-pointer flex flex-col gap-4 border-b border-gray-100 dark:border-gray-800 last:border-none" 
      onClick={selectItem}
    >
      {/* بخش بالایی: تصویر، عنوان، توضیحات و چک‌باکس */}
      <div className="flex w-full items-start justify-between">
        <div className="flex flex-1 items-start">
          <ImageComponent
            parentclasses="w-12 h-12 lg:h-18 lg:w-18 2xl:h-18 2xl:w-18 !rounded-xl shrink-0"
            imageClasses="!rounded-xl"
            src={imageSrc}
          />
          <div className="flex-1 pr-3 flex flex-col justify-center gap-1.5 mt-0.5">
            <h3 className="text-sm 2xl:text-base font-['iransans-md'] text-text dark:text-text_dark line-clamp-1">
              {title}
            </h3>
            
            {/* نمایش Description در صورت وجود */}
            {description && (
              <p className="text-xs 2xl:text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* بخش انتخابگر (Radio / Checkbox) */}
        <div className="pl-2 flex items-center justify-center pt-2">
          {numberSelect > 1 ? (
            <CheckBox checked={select} id={_id} onChange={selectItem} />
          ) : (
            <div className="relative !w-[20px] !h-[20px] !box-border flex justify-center items-center border-2 border-primary rounded-full">
              <input
                type="radio"
                checked={select}
                id={_id}
                onChange={selectItem}
                className="radio-button-input focus:outline-none hidden"
              />
              <div className="radio-button rounded-full absolute top-0 bottom-0 right-0 left-0 flex items-center justify-center z-[1000]">
                {/* شرطی کردن نمایش نقطه داخلی دکمه رادیویی */}
                {select && (
                  <span className="bg-primary h-[9.5px] w-[9.5px] rounded-full transition-all duration-200"></span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* بخش پایینی: تاریخ شروع و پایان */}
      {(start_date || end_date) && (
        <div className="flex flex-col justify-center gap-2.5 p-3 rounded-lg bg-rose-50/60 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30 w-full mt-1">
          {start_date && (
            <div className="flex items-center justify-between text-rose-800 dark:text-rose-400 flex-wrap gap-1">
              <div className="flex items-center gap-2">
                <IoCalendarOutline className="text-base text-rose-500" />
                <span>شروع:</span>
              </div>
              {/* اطمینان حاصل کنید تابع getTime در این فایل در دسترس است */}
              <span className="font-['iransans-bold'] text-xs" dir="ltr">
                {`( ${getTime(start_date)}   ___  ${moment(start_date).format("jYYYY/jMM/jDD")} )`}
              </span>
            </div>
          )}
          
          {end_date && (
            <div className="flex items-center justify-between text-rose-800 dark:text-rose-400 flex-wrap gap-1">
              <div className="flex items-center gap-2">
                <IoCalendarOutline className="text-base text-rose-500" />
                <span>پایان:</span>
              </div>
              <span className="font-['iransans-bold'] text-xs" dir="ltr">
                {`( ${getTime(end_date)}   ___  ${moment(end_date).format("jYYYY/jMM/jDD")} )`}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HarfAkharSelectItem;