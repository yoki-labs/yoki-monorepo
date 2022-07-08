import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";

import Navbar from "../components/navbar/navbar";

const Home: NextPage = () => {
    return (
        <>
            <Head>
                <title>Yoki</title>
                <meta name="description" content="Guilded's first moderation bot." />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <Navbar />
            <div className="px-16 py-20 grid grid-cols-10">
                <div className="text-center col-span-6">
                    <h1 className="text-4xl text-white font-bold">
                        Meet <span className="text-custom-guilded">Yoki</span>, your <br />
                        moderation companion
                    </h1>
                    <div className="pt-6">
                        <p className="text-md text-slate-300">
                            Yoki has a powerful set of moderation tools to <br />
                            make your communities safer
                        </p>
                    </div>
                    <div className="pt-6 text-white space-y-2">
                        <p>Moderation & Automoderation features</p>
                        <p>Server & Moderation action logging</p>
                    </div>
                    <div className="pt-8 space-x-4">
                        <button className="px-14 py-3 bg-gradient-to-r from-[#F3B741] to-[#DFC546] text-black rounded-md">Invite now</button>
                        <button className="px-14 py-3 border-[.5px] border-custom-guilded text-white rounded-md">Get support</button>
                    </div>
                    <p className="px-8 pt-8 text-gray-50 text-sm">
                        Made by{" "}
                        <a className="underline underline-offset-4" href="https://github.com/yoki-labs">
                            Yoki Labs
                        </a>
                    </p>
                </div>
                <div className="bg-[#202227] px-8 pt-8 pb-4 col-span-3 rounded-lg text-white text-opacity-70 divide-y divide-gray-400/50 hidden md:block">
                    <div className="pb-4">
                        <div className="flex">
                            <Image className="rounded-full" src="/face.png" width="60" height="60"></Image>
                            <div className="pl-4 text-white">
                                <p className="text-xl font-semibold text-custom-guilded">Yoki</p>
                                <p className="text-sm">Server Protector 4000</p>
                            </div>
                        </div>
                        <p className="pt-4">A mod bot with a powerful set of tools to make your communities safer!</p>
                        <div className="flex space-x-4 pt-2">
                            <p>3k communities</p>
                            <p>3000k members</p>
                        </div>
                    </div>
                    <div className="py-4">
                        <p className="font-bold">Status</p>
                        <div className="pl-8 bg-gradient-to-r py-4 from-[#202227] to-[#20222776] space-y-1">
                            <p className="text-lg font-bold text-white">Keeping your communities safe</p>
                            <p className="text-sm">for always and forever</p>
                        </div>
                    </div>
                    <div className="py-4">
                        <p className="font-bold">Roles</p>
                        <div className="flex pt-2 space-x-2">
                            <div className="border-[.5px] rounded-full border-dashed px-2 py-1 flex">
                                <div className="my-auto w-5 h-5 bg-gray-400 rounded-full"></div>
                                <p className="pl-2">Mod</p>
                            </div>
                            <div className="border-[.5px] rounded-full border-dashed border-custom-guilded px-2 py-1 flex">
                                <div className="my-auto w-5 h-5 bg-custom-guilded rounded-full"></div>
                                <p className="pl-2">Server Protector 4000</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;
