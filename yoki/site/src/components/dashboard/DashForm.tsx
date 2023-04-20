const questions = {
    main: {
        prefix: {
            label: "Prefix",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce luctus augue quis elit dapibus, sed suscipit turpis lacinia.",
            type: "text",
        },
    },
};

export default function DashForm() {
    return (
        <div className="w-7/8 bg-gray-900 p-8 flex flex-col space-y-8">
            <h1 className="text-3xl font-semibold">Page Name</h1>

            {Object.keys(questions.main).map((qKey) => {
                const questionInfo = questions.main[qKey as keyof (typeof questions)["main"]];

                return (
                    <div className="flex flex-row">
                        <div className="w-3/5">
                            <label className="label">
                                <span className="label-text font-medium text-2xl">{questionInfo.label}</span>
                            </label>
                            <p className="text-lg">{questionInfo.description}</p>
                        </div>
                        <input type="text" placeholder="Type here" className="input input-bordered w-2/5" />
                    </div>
                );
            })}

            <button className="btn bg-custom-guilded text-black text-xl">Submit</button>
        </div>
    );
}
