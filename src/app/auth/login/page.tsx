"use client";

import { useEffect, useState } from "react";
import { BsSun } from "react-icons/bs";
import { GoMoon } from "react-icons/go";
import { useTheme } from "next-themes";
import Input from "@/components/Input";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/store";
import { loginRequest } from "@/redux/features/login/loginSlice";
import { ThreeDots } from "react-loader-spinner";
import { useRouter } from "next/navigation";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

export default function Home() {
  const [username, setUsername] = useState<{ value: string; validateOn: boolean }>({
    value: "",
    validateOn: false,
  });
  const [password, setPassword] = useState<{ value: string; validateOn: boolean }>({
    value: "",
    validateOn: false,
  });
  const { loading } = useSelector((state: RootState) => state.loginReducer);
  const { theme, setTheme } = useTheme();
  const [mode, setMode] = useState<any>();

  const [fpHash, setFpHash] = useState("");

  useEffect(() => {
    const setFp = async () => {
      const fp = await FingerprintJS.load();

      const { visitorId } = await fp.get();

      setFpHash(visitorId);
    };
    setFp();
  }, []);

  const dispatch = useDispatch<AppDispatch>();
  const isFormValid = username.value?.length < 80 && password.value.length >= 6;

  const router = useRouter();

  useEffect(() => {
    setMode(theme);
  }, []);

  const toggleTheme = () => {
    setTheme(mode === "light" ? "dark" : "light");
    setMode(mode === "light" ? "dark" : "light");
  };

  const handleSubmit = () => {
    dispatch(
      loginRequest({
        userName: username.value.toLowerCase(),
        password: password.value,
        router: router,
        uniqueId: fpHash,
      })
    );
  };

  return (
    <main
      className="flex md:items-center md:flex-row flex-col-reverse md:h-screen w-full pb-14 md:pb-0"
      style={{ fontFamily: "iransans-light" }}
    >
      {mode && (
        <div
          className="fixed flex items-center border left-6 top-4 py-1 px-1 gap-3 rounded-full bg-background4 dark:bg-background4_dark dark:border-border_dark cursor-pointer hover:opacity-80 transition"
          onClick={toggleTheme}
        >
          {mode === "light" && <GoMoon className="h-7 w-7 text-text4 dark:text-text4_dark" />}
          {mode === "dark" && <BsSun className="h-7 w-7 text-text4 dark:text-text4_dark" />}
        </div>
      )}

      {/*  */}
      <section className="flex-1">
        <form
          className="flex flex-col justify-center items-center gap-2 h-full"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          <h1
            style={{ fontFamily: "iransans-md" }}
            className="text-xl mb-3 lg:w-2/3 w-5/6 xl:w-3/5 2xl:w-1/2 text-text dark:text-text_dark mt-12 md:mt-0"
          >
            ورود به حساب کاربری
          </h1>
          <label className="text-right lg:w-2/3 w-5/6 xl:w-3/5 2xl:w-1/2 text-text6 dark:text-text6_dark" htmlFor="username">
            نام کاربری
          </label>
          <Input
            type={"text"}
            id={"username"}
            value={username.value}
            validateOn={username.validateOn}
            classes={"lg:w-2/3 w-5/6 xl:w-3/5 2xl:w-1/2"}
            changeState={setUsername}
            error={username.validateOn && username.value?.length > 80}
          />
          {username.validateOn && username.value?.length > 80 && (
            <p className="text-red_error text-sm text-right lg:w-2/3 w-5/6 xl:w-3/5 2xl:w-1/2 -mt-1 ">
              {username.value?.length == 0 ? "نام کاربری را وارد کنید" : "نام کاربری را به صورت صحیح وارد کنید"}
            </p>
          )}
          <label
            className="text-right lg:w-2/3 w-5/6 xl:w-3/5 2xl:w-1/2 mt-5 text-text6 dark:text-text6_dark"
            htmlFor="password"
          >
            رمز عبور
          </label>
          <Input
            type="password"
            id="password"
            value={password.value}
            changeState={setPassword}
            validateOn={password.validateOn}
            classes="lg:w-2/3 w-5/6 xl:w-3/5 2xl:w-1/2"
            fontFamily="iransans-light-en"
            error={password.value?.length < 6 && password.validateOn}
          />
          {password.value?.length < 6 && password.validateOn && (
            <p className="text-red_error text-sm text-right lg:w-2/3 w-5/6 xl:w-3/5 2xl:w-1/2 -mt-1 ">
              {password.value?.length == 0 ? "رمز عبور را وارد کنید" : "رمز عبور را با حداقل 6 کاراکتر وارد کنید"}
            </p>
          )}
          <button
            className={`font-['iransans-md'] rounded text-white py-[.6rem] px-6 w-5/6 lg:w-2/3 xl:w-3/5 2xl:w-1/2 hover:opacity-80 transition mt-10 bg-gradient-to-b from-primary_start to-primary_end 
          `}
            disabled={loading}
            onClick={() => {
              if (!isFormValid) {
                if (!password.value?.length) {
                  setPassword((last) => {
                    return { ...last, validateOn: true };
                  });
                }
                if (!username.value?.length) {
                  setUsername((last) => {
                    return { ...last, validateOn: true };
                  });
                }
              } else {
                handleSubmit();
              }
            }}
          >
            {loading ? (
              <ThreeDots
                visible={true}
                height="16"
                width="50"
                color="white"
                radius="9"
                ariaLabel="three-dots-loading"
                wrapperStyle={{}}
                wrapperClass="py-1 flex justify-center"
              />
            ) : (
              "ورود"
            )}
          </button>
        </form>
      </section>
      <section
        className=" flex-1 h-full flex flex-col justify-center items-center w-full mt-16 md:mt-0"
        style={{ fontFamily: "iransans-black" }}
      >
        <div className="sm:text-5xl lg:text-6xl xl:text-7xl text-3xl primaryGradient">Harf Hesab</div>
        <div className="sm:text-2xl xl:text-4xl text-base primaryGradient mt-4 pb-1" style={{ wordSpacing: ".20rem" }}>
          پنل مدیریت
        </div>
      </section>
    </main>
  );
}
