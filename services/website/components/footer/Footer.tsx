import Image from "next/image";

export default function Footer() {
    return (
        <footer className="text-white p-4 sm:p-6 dark:bg-gray-900">
            <div className="md:flex md:justify-between">
                <div className="mb-6 md:mb-0 ">
                    <a href="/" className="flex items-center">
                        <Image src="/yoki-labs-logo.png" className="mr-3 h-8" alt="FlowBite Logo" width="294" height="80" />
                    </a>
                </div>
                <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
                    <div>
                        <h2 className="mb-6 text-sm font-semibold uppercase">Resources</h2>
                        <ul>
                            <li className="mb-4">
                                <a href="/docs" className="hover:underline">
                                    Docs
                                </a>
                            </li>
                            <li>
                                <a href="/feedback" className="hover:underline">
                                    Feedback
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="mb-6 text-sm font-semibold uppercase">Follow us</h2>
                        <ul>
                            <li className="mb-4">
                                <a href="https://github.com/yoki-labs" className="hover:underline">
                                    Github
                                </a>
                            </li>
                            <li>
                                <a href="https://twitter.com/yoki_labs" className="hover:underline">
                                    Twitter
                                </a>
                            </li>
                        </ul>
                    </div>
                    <div>
                        <h2 className="mb-6 text-sm font-semibold uppercase">Legal</h2>
                        <ul>
                            <li className="mb-4">
                                <a href="/privacy" className="hover:underline">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="/tos" className="hover:underline">
                                    Terms &amp; Conditions
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <hr className="my-6 border-gray-200 sm:mx-auto lg:my-8" />
            <div className="sm:flex sm:items-center sm:justify-between">
                <span className="text-sm sm:text-center">
                    © 2022{" "}
                    <a href="/" className="hover:underline">
                        Yoki Labs
                    </a>
                    . All Rights Reserved.
                </span>
            </div>
        </footer>
    );
}
