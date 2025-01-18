const Timeline = () => {
    return (
        <section>
            <div className="relative items-center w-full mx-auto ">
                <div className="divide-y-2 divide-black">
                    <div className="justify-center max-w-3xl p-8 lg:p-20">
                        <p className="text-5xl lg:text-7xl text-black">Timelines</p>
                    </div>
                    <div className="divide-y-2 divide-black">
                        {/* <div className="p-8 lg:p-20">
                            <h3 className="text-xl font-medium leading-6 text-black">
                                Vertical right
                            </h3>
                        </div>
                        <div className="divide-y-2 divide-black">
                            <div className="flex flex-col md:grid grid-cols-9 mx-auto">
                                <div className="col-start-1 md:mx-auto relative hidden lg:block">
                                    <div className="h-full w-6 flex items-center justify-center">
                                        <div
                                            className="h-full w-0.5 bg-black pointer-events-none hidden lg:block"
                                        >
                                        </div>
                                    </div>
                                    <div className="size-6 absolute top-1/2 -mt-3 rounded-full bg-black">
                                    </div>
                                </div>
                                <div className="col-start-2 col-end-10">
                                    <div
                                        className="relative text-black lg:border-l-2 border-black h-full p-8 lg:p-20 bg-lila-500"
                                    >
                                        <img
                                            className="h-12 w-12 shadow-small rounded-full border-2 border-black"
                                            src="/images/blob1.svg"
                                            alt="your alt-text"
                                        />
                                        <p className="text-base mt-8 text-black">03.16.2023</p>
                                        <h4 className="text-lg lg:text-2xl mt-8 text-black">
                                            Expansion and Innovation
                                        </h4>
                                        <p className="mt-4 text-black text-base">
                                            he team sets its sights on the future, aiming for expansion
                                            and continuous innovation to stay competitive.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col md:grid grid-cols-9 mx-auto">
                                <div className="col-start-1 md:mx-auto relative hidden lg:block">
                                    <div className="h-full w-6 flex items-center justify-center">
                                        <div className="h-full w-0.5 bg-black pointer-events-none"></div>
                                    </div>
                                    <div className="size-6 absolute top-1/2 -mt-3 rounded-full bg-black">
                                    </div>
                                </div>
                                <div className="col-start-2 col-end-10">
                                    <div
                                        className="relative text-black lg:border-l-2 border-black h-full p-8 lg:p-20 bg-green-500"
                                    >
                                        <img
                                            className="h-12 w-12 shadow-small rounded-full border-2 border-black"
                                            src="/images/blob2.svg"
                                            alt="your alt-text"
                                        />
                                        <p className="text-base mt-8 text-black">03.16.2023</p>
                                        <h4 className="text-lg lg:text-2xl mt-8 text-black">
                                            Expansion and Innovation
                                        </h4>
                                        <p className="mt-4 text-black text-base">
                                            he team sets its sights on the future, aiming for expansion
                                            and continuous innovation to stay competitive.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col md:grid grid-cols-9 mx-auto">
                                <div className="col-start-1 md:mx-auto relative hidden lg:block">
                                    <div className="h-full w-6 flex items-center justify-center">
                                        <div className="h-full w-0.5 bg-black pointer-events-none"></div>
                                    </div>
                                    <div className="size-6 absolute top-1/2 -mt-3 rounded-full bg-black">
                                    </div>
                                </div>
                                <div className="col-start-2 col-end-10">
                                    <div
                                        className="relative text-black lg:border-l-2 border-black h-full p-8 lg:p-20 bg-yellow-500"
                                    >
                                        <img
                                            className="h-12 w-12 shadow-small rounded-full border-2 border-black"
                                            src="/images/blob3.svg"
                                            alt="your alt-text"
                                        />
                                        <p className="text-base mt-8 text-black">03.16.2023</p>
                                        <h4 className="text-lg lg:text-2xl mt-8 text-black">
                                            Expansion and Innovation
                                        </h4>
                                        <p className="mt-4 text-black text-base">
                                            he team sets its sights on the future, aiming for expansion
                                            and continuous innovation to stay competitive.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div> */}

                        <div className="p-8 lg:p-20">
                            <h3 className="text-xl font-medium leading-6 text-black">Vertical</h3>
                        </div>
                        <div className="flex flex-col md:grid grid-cols-9 bg-black gap-y-0.5 lg:gap-0 lg:bg-transparent mx-auto pt-8">
                            {/* left */}
                            <div className="flex flex-row-reverse md:contents">
                                <div className="col-start-1 col-end-5 ml-auto">
                                    <div
                                        className="relative text-black lg:border-2 lg:border-l-0 border-black h-full p-8 lg:p-20 lg:shadow lg:rounded-r-2xl bg-yellow-500"
                                    >
                                        <img
                                            className="h-12 w-12 shadow-small rounded-full border-2 border-black"
                                            src="/images/blob3.svg"
                                            alt="your alt-text"
                                        />
                                        <p className="text-base mt-8 text-black">03.16.2023</p>
                                        <h4 className="text-lg lg:text-2xl mt-8 text-black">
                                            Expansion and Innovation
                                        </h4>
                                        <p className="mt-4 text-black text-base">
                                            he team sets its sights on the future, aiming for expansion
                                            and continuous innovation to stay competitive.
                                        </p>
                                    </div>
                                </div>
                                <div className="col-start-5 col-end-6 md:mx-auto relative mr-10 hidden lg:block">
                                    <div className="h-full w-6 flex items-center justify-center">
                                        <div className="h-full w-0.5 bg-black pointer-events-none"></div>
                                    </div>
                                    <div className="size-6 absolute top-1/2 -mt-3 rounded-full bg-black">
                                    </div>
                                </div>
                            </div>
                            {/* right */}
                            <div className="flex md:contents">
                                <div className="col-start-5 col-end-6 mr-10 md:mx-auto relative hidden lg:block">
                                    <div className="h-full w-6 flex items-center justify-center">
                                        <div className="h-full w-0.5 bg-black pointer-events-none"></div>
                                    </div>
                                    <div className="size-6 absolute top-1/2 -mt-3 rounded-full bg-black">
                                    </div>
                                </div>
                                <div className="col-start-6 col-end-10 lg:my-4 mr-auto">
                                    <div
                                        className="relative text-black lg:border-l-2 lg:border-y-2 border-black h-full p-8 lg:p-20 bg-green-500 lg:shadow lg:rounded-l-2xl"
                                    >
                                        <img
                                            className="h-12 w-12 shadow-small rounded-full border-2 border-black"
                                            src="/images/blob2.svg"
                                            alt="your alt-text"
                                        />
                                        <p className="text-base mt-8 text-black">03.16.2023</p>
                                        <h4 className="text-lg lg:text-2xl mt-8 text-black">
                                            Expansion and Innovation
                                        </h4>
                                        <p className="mt-4 text-black text-base">
                                            he team sets its sights on the future, aiming for expansion
                                            and continuous innovation to stay competitive.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            {/* left */}
                            <div className="flex flex-row-reverse md:contents">
                                <div className="col-start-1 col-end-5 lg:my-4 ml-auto">
                                    <div
                                        className="relative text-black lg:border-r-2 lg:border-y-2 border-black h-full p-8 lg:p-20 bg-lila-500 lg:shadow lg:rounded-r-2xl"
                                    >
                                        <img
                                            className="h-12 w-12 shadow-small rounded-full border-2 border-black"
                                            src="/images/blob1.svg"
                                            alt="your alt-text"
                                        />
                                        <p className="text-base mt-8 text-black">03.16.2023</p>
                                        <h4 className="text-lg lg:text-2xl mt-8 text-black">
                                            Expansion and Innovation
                                        </h4>
                                        <p className="mt-4 text-black text-base">
                                            he team sets its sights on the future, aiming for expansion
                                            and continuous innovation to stay competitive.
                                        </p>
                                    </div>
                                </div>
                                <div className="col-start-5 col-end-6 md:mx-auto relative mr-10 hidden lg:block">
                                    <div className="h-full w-6 flex items-center justify-center">
                                        <div className="h-full w-0.5 bg-black pointer-events-none"></div>
                                    </div>
                                    <div className="size-6 absolute top-1/2 -mt-3 rounded-full bg-black">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Timeline;
