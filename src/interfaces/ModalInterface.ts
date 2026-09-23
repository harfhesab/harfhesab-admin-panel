import { ReactElement } from "react";

interface IconComponentInterface {
  icon: string;
}

export interface PackageListModalInterface {
  buttons?: { onClickFn?: (data: any) => any; buttonText?: string; type: string }[];
  numberSelected?: number;
  previousSelected?: { title: string[]; _id: string[]; image: string[]};
}

export interface HarfAkharListModalInterface {
  buttons?: { onClickFn?: (data: any) => any; buttonText?: string; type: string }[];
  numberSelected?: number;
  previousSelected?: { title: string[]; _id: string[]; image: string[]};
}

export interface UserListModalInterface {
  buttons?: { onClickFn?: (data: any) => any; buttonText?: string; type: string }[];
  numberSelected?: number;
  previousSelected?: { _id: string[]; user_name: string[]; phone: any[]; name?: any[]};
}

export interface FreeCoinListModalInterface {
  buttons?: { onClickFn?: (data: any) => any; buttonText?: string; type: string }[];
  numberSelected?: number;
  previousSelected?: { _id: string[]; type: string[]; title: string[]; icon_image?: string[]; number_coin: string[]};
}

export interface FreeSubscriptionListModalInterface {
  buttons?: { onClickFn?: (data: any) => any; buttonText?: string; type: string }[];
  numberSelected?: number;
  previousSelected?: { _id: string[]; type: string[]; title: string[]; icon_image?: string[]; duration: string[]};
}

export interface CollectionListModalInterface {
  buttons?: { onClickFn?: (data: any) => any; buttonText?: string; type: string }[];
  numberSelected?: number;
  previousSelected?: { title: string[]; _id: string[]};
}

export interface TopicCategoryListModalInterface {
  buttons?: { onClickFn?: (data: any) => any; buttonText?: string; type: string }[];
  numberSelected?: number;
  previousSelected?: { title: string[]; _id: string[]; image: string[]};
}

export interface DialogInterface {
  titleText?: string;
  bodyText: string;
  closeTextButton?: string;
  showCloseButton?: boolean;
  buttons?: {
    onClickFn?: () => any;
    buttonText?: string;
    type?: string;
    loading?: boolean;
    boldBtnClasses?: string;
    borderBtnClasses?: string;
  }[];
  onClose?: boolean;
  dialogType?: string;
  textBodyJustify?: boolean;
}

export interface ModalNormalListInterface {
  title?: string;
  description?: string;
  list: {
    _id?: string;
    onClick1?: () => any;
    onClick2?: () => any;
    checked?: boolean;
    icon?: ReactElement<IconComponentInterface>;
    image?: string;
    name?: string;
    name2?: string;
    arrow?: boolean;
    style?: string;
    disable?: boolean;
  }[];
  options?: {
    selected?: number;
    page?: number;
    type: string;
    replaceImage?: ReactElement<IconComponentInterface>;
    fitHeight?: boolean;
  };
  buttons?: { onClickFn?: any; buttonText?: string; type?: string; loading?: boolean }[];
}

export interface ModalLoadingListInterface {
  title?: string;
  description?: string;
  buttons?: { onClickFn?: any; buttonText?: string; type?: string; loading?: boolean }[];
  options?: {
    page?: number;
    type: string;
    replaceImage?: ReactElement<IconComponentInterface>;
  };
}

export interface ModalListResponseLoadingInterface {
  loading?: boolean;
  error?: boolean;
  noItem?: boolean;
  tryAgain?: () => any;
  buttons?: { onClickFn?: any; buttonText?: string; type?: string; loading?: boolean }[];
  list: {
    _id?: string;
    onClick1?: () => any;
    onClick2?: () => any;
    icon?: ReactElement<IconComponentInterface>;
    image?: string;
    name?: string;
    name2?: string;
    arrow?: boolean;
    checked?: boolean;
  }[];
  options?: {
    selected?: number;
  };
}

export interface FilterFeatureNormal {
  title?: string;
  data: {}[];
  buttons?: {
    onClickFn?: (filters: []) => any;
    buttonText?: string;
    type?: string;
    loading?: boolean;
  }[];
}

export interface FilterFeatureLoading {
  title?: string;
  buttons?: {
    onClickFn?: (filters: []) => any;
    buttonText?: string;
    type?: string;
    loading?: boolean;
  }[];
}

export interface FilterFeatureResponse {
  loading?: boolean;
  error?: boolean;
  noItem?: boolean;
  tryAgain?: () => any;
  data?: {}[];
}

export interface ModalInputInterface {
  title?: string;
  description?: string;
  type?: string;
  inputValue?: string;
  buttons: { onClickFn: (val: string) => any; buttonText: string }[];
  options?: {
    keyboardType?: string;
    maxLength?: number;
    placeholder?: string;
    multiLine?: boolean;
    textAreaRows?: number;
  };
}

export interface ModalCityInterface {
  screens: string[];
  parentName?: string;
  parentId?: string;
  buttons?: ({ onClickFn?: (data: any) => any; buttonText?: string; type?: string; noReturn?: boolean }[] | null)[];
  type?: string[];
  provinceItemClick?: { onClick: (data: {}) => any };
  cityItemClick?: { onClick: (data: {}) => any };
  areaItemClick?: { onClick: (data: {}) => any };
  description?: [];
  checkActive?: boolean;
  previousData?: { list: (string | { _id: string; name: string })[]; listType: string };
}

export interface SetFileModalInterface {
  type: string;
  title?: string;
  buttons: { onClickFn?: (data: any) => any; buttonText?: string; type: string }[];
  focus?: string;
  rentAndDeposit?: {
    previousNegotiable: boolean;
    previosDeposit: string;
    previousRent: string;
    previousConvertable: boolean;
    previousDepositConvert: string;
    previousRentConvert: string;
  };
  price?: {
    previousNegotiable: boolean;
    previousPrice: string;
  };
  sizeNormal?: {
    previousSize: string;
  };
  sizeAndDetails?: {
    previousSizeLand: string;
    previousSizeBuilding: string;
  };
}

export interface VideoModalInterface {
  src: string;
  title?: string;
  autoPlay?: boolean;
}

export interface ImageModalInterface {
  src: string;
  title?: string;
}

export interface PreviewFileModalInterface {
  list?: any[];
  list2?: any[];
  title?: string;
  title2?: string;
  description?: string;
}

export interface EditTitleModalInterface {
  data?: {
    successAction: () => {};
  };
  type?: string;
}

export interface ContactSelectModalInterface {
  buttons?: { onClickFn?: (data: any) => any; buttonText?: string; type: string }[];
  numberSelected?: number;
  previousSelected?: { name: string[]; _id: string[] };
}

export interface SuggestFileModalInterface {
  title?: string;
  maxSelectFile?: number;
  buttons?: { onClickFn?: (data: any) => any; buttonText?: string };
}

export interface SuggestedFilesModalInterface {
  title?: string;
}

export interface SelectFileForBelowPriceModalInterface {
  title?: string;
  type?: string;
}

export interface SettingShowFileModalInterface {
  data?: {
    successAction: () => {};
  };
}

export interface CustomModalInterface {
  title?: string;
  options?: {
    fitHeight?: boolean;
  };
  component: { component: any };
}

export interface OTPModalInterface {
  minutes: number;
  seconds: number;
  type: string;
  phone: string;
  password?: string;
  replaceRoute?: string;
}

export interface RatingAndCommentsModalInterface {
  title: string;
  avatar?: any;
  agencyType?: boolean;
  ratingItemData?: { rating_average: number; rating_info: number[]; reviews: number };
}

export interface CalendarModalInterface {
  callBack: { callBackCalendar: (date: any) => any };
  minDate?: any;
  maxDate?: any;
  initialDate?: any;
  selectedDate: any;
  hideButtons?: boolean;
}
