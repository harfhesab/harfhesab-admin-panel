"use client";

import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Footer from "@/components/Footer/Footer";
import GradientButton from "@/components/GradientButton";
import ScreenLoading from "@/components/ScreenLoading";

const Page = () => {
    const [loading, setLoading] = useState(false);
    const [getError, setGetError] = useState(false)
    const [noItem, setNoItem] = useState(false);
    const [versionCreatedDiff, setVersionCreatedDiff] = useState<any>(null)
    const [loading1, setLoading1] = useState(false)
    const [versionUpdatedDiff, setVersionUpdatedDiff] = useState<any>(null)
    const [loading2, setLoading2] = useState(false)
    const [versionDeletedDiff, setVersionDeletedDiff] = useState<any>(null)
    const [loading3, setLoading3] = useState(false)
  
    useEffect(()=>{
        getData()
    }, [])
    const getData = async()=>{
        await axios({
        url: "/",
        method: "post",
        data: {
            query: `
                query getWordGameVersionControl(
                $_id : ID,
                ){
                    getWordGameVersionControl(
                    _id : $_id,
                    ) {
                        version_created,
                        version_updated,
                        version_deleted,
                        force_version_created,
                        force_version_updated,
                        force_version_deleted,
                        version_created_pending_diff,
                        version_updated_pending_diff,
                        version_deleted_pending_diff,
                    }
                }
                `,
            variables: {
            _id : null
            },
        },
        }).then(async (response) => {
            const data = response.data.data?.getWordGameVersionControl;
            if (data) {
                setLoading(false)
                if(data?.version_created_pending_diff && data.version_created_pending_diff > 0){
                    setVersionCreatedDiff(true)
                }
                if(data?.version_updated_pending_diff && data.version_updated_pending_diff > 0){
                    setVersionUpdatedDiff(true)
                }
                if(data?.version_deleted_pending_diff && data.version_deleted_pending_diff > 0){
                    setVersionDeletedDiff(true)
                }
            } else {
                if(response.data?.errors[0]?.status == 404){
                    setNoItem(true)
                    setLoading(false)
                    setGetError(false)
                } else {
                    setLoading(true)
                    setGetError(true)
                }
            }
        })
        .catch(() => {
            setLoading(true)
            setGetError(true)
        });
    }
    const tryAgain = ()=>{
        setLoading(true)
        setGetError(false)
        getData()
    }

    const createNewDoc = async()=>{
        setLoading(true)
        let data = {
        query: `
            mutation createNewWordGameVersionControl(
                $_id : ID,
            ){
                createNewWordGameVersionControl(
                _id : $_id,
                ) {
                    status,
                    message,
                }
            }
            `,
        variables: {
            _id : null,
        },
        };
        await axios({
        url: "/",
        method: "post",
        data: data,
        })
        .then(async (response) => {
            const res = response.data?.data?.createNewWordGameVersionControl
            setLoading(false)
            if (res?.status == 200) {
                setNoItem(false)
                tryAgain()
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
            setLoading(false)
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
    }

    const applyPendingCreateVersion = async()=>{
        if(versionCreatedDiff === true){
            setLoading1(true)
            let data = {
            query: `
                mutation applyDiffCreatedVersionWordGame(
                    $_id : ID,
                ){
                    applyDiffCreatedVersionWordGame(
                        _id : $_id,
                    ) {
                        status,
                        message,
                    }
                }
                `,
            variables: {
                _id : null,
            },
            };
            await axios({
            url: "/",
            method: "post",
            data: data,
            })
            .then(async (response) => {
                const res = response.data?.data?.applyDiffCreatedVersionWordGame
                setLoading1(false)
                if (res?.status == 200) {
                    setVersionCreatedDiff(false)
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
                setLoading1(false)
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
        }
    }
    const applyPendingUpdateVersion = async()=>{
        if(versionUpdatedDiff === true){
            setLoading2(true)
            let data = {
            query: `
                mutation applyDiffUpdatedVersionWordGame(
                    $_id : ID,
                ){
                    applyDiffUpdatedVersionWordGame(
                        _id : $_id,
                    ) {
                        status,
                        message,
                    }
                }
                `,
            variables: {
                _id : null,
            },
            };
            await axios({
            url: "/",
            method: "post",
            data: data,
            })
            .then(async (response) => {
                const res = response.data?.data?.applyDiffUpdatedVersionWordGame
                setLoading2(false)
                if (res?.status == 200) {
                    setVersionUpdatedDiff(false)
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
                setLoading2(false)
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
        }
    }
    const applyPendingDeleteVersion = async()=>{
        if(versionDeletedDiff === true){
            setLoading3(true)
            let data = {
            query: `
                mutation applyDiffDeletedVersionWordGame(
                    $_id : ID,
                ){
                    applyDiffDeletedVersionWordGame(
                        _id : $_id,
                    ) {
                        status,
                        message,
                    }
                }
                `,
            variables: {
                _id : null,
            },
            };
            await axios({
            url: "/",
            method: "post",
            data: data,
            })
            .then(async (response) => {
                const res = response.data?.data?.applyDiffDeletedVersionWordGame
                setLoading3(false)
                if (res?.status == 200) {
                    setVersionDeletedDiff(false)
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
                setLoading3(false)
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
        }
    }
    return (
        loading == true?
        <div className="flex items-center justify-center w-full h-[calc(100dvh-60px)]">
            <ScreenLoading
                getError={getError}
                notItem={false}
                tryAgain={tryAgain}
            />
        </div>
        :
        <div className="flex flex-col justify-between w-full lg:w-[600px] 2xl:w-[750px] mt-10 mb-28 px-4 sm:mx-auto">
            {
                noItem == true?
                <div className="flex items-center justify-center w-full h-[calc(100dvh-220px)]">
                    <p className="text-text6 dark:text-text6_dark text-[16px] font-['iransans-md']">{"کنترل ورژن بازی مرحله‌ای یافت نشد. یک کنترل ورژن ایجاد کنید."}</p>
                </div>
                :
                <div className="flex items-center justify-center w-full h-[calc(100dvh-220px)]">
                    <div className="flex flex-col gap-2">
                        {
                        (versionCreatedDiff === true || versionCreatedDiff === false)?
                        <GradientButton
                            buttonText={versionCreatedDiff === true?"در انتظار اعمال ورژن ایجاد":versionCreatedDiff === false?"اعمال شد":""}
                            onClickFn={applyPendingCreateVersion}
                            loading={loading1}
                            type={"border"}
                            classes={`!text-base !px-8 !w-full rounded-[15px] ${versionCreatedDiff === true?"!bg-red_error":"!bg-info"}`}
                        />:null
                        }
                        {
                        (versionUpdatedDiff === true || versionUpdatedDiff === false)?
                        <GradientButton
                            buttonText={versionUpdatedDiff === true?"در انتظار اعمال ورژن آپدیت":versionUpdatedDiff === false?"اعمال شد":""}
                            onClickFn={applyPendingUpdateVersion}
                            loading={loading2}
                            type={"border"}
                            classes={`!text-base !px-8 !w-full rounded-[15px] ${versionUpdatedDiff === true?"!bg-red_error":"!bg-info"}`}
                        />:null
                        }
                        {
                        (versionDeletedDiff === true || versionDeletedDiff === false)?
                        <GradientButton
                            buttonText={versionDeletedDiff === true?"در انتظار اعمال ورژن حذف":versionDeletedDiff === false?"اعمال شد":""}
                            onClickFn={applyPendingDeleteVersion}
                            loading={loading3}
                            type={"border"}
                            classes={`!text-base !px-8 !w-full rounded-[15px] ${versionDeletedDiff === true?"!bg-red_error":"!bg-info"}`}
                        />:null
                        }
                        {
                            (versionDeletedDiff == null && versionCreatedDiff == null && versionDeletedDiff == null)&&
                            <p className="text-text6 dark:text-text6_dark text-[16px] font-['iransans-md']">{"تنظیمات جدیدی یافت نشد."}</p>
                        }
                    </div>
                </div>
            }
            <Footer
                buttonFn={()=>{
                    if(noItem == true){
                        createNewDoc()
                    } else {
                        tryAgain()
                    }
                }}
                buttonText={noItem == true?"ایجاد کنترل ورژن":"بروزرسانی وضعیت"}
                loadingButton={loading}
                classes="md:!mr-72 !justify-end"
            />
        </div>
    );
};

export default Page;
