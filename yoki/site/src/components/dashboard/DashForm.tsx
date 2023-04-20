const questions = {
    main: {
        prefix: {
            label: "Prefix",
            description: "Change the prefix Yoki uses to recognize commands for your server.",
            type: "text",
        },
        language: {
            label: "Language",
            description: "Change the language Yoki uses to respond to respond in (WIP)",
            type: "text",
        },
        timezone: {
            label: "Timezone",
            description: "Change the timezone Yoki uses to display times in",
            type: "text",
        },
        memberRole: {
            label: "Member Role",
            description: "Change the role Yoki uses to recognize regular members",
            type: "text",
        },
        muteRole: {
            label: "Mute Role",
            description: "Change the role Yoki uses to mute bad actors",
            type: "text",
        },
    },
};

export default function DashForm() {
    return (
        <div className="w-7/8 bg-gray-900 p-8 flex flex-col space-y-8">
            <h1 className="text-3xl font-semibold">Main Settings</h1>

            {Object.keys(questions.main).map((qKey) => {
                const questionInfo = questions.main[qKey as keyof (typeof questions)["main"]];

                return (
                    <div className="flex flex-row">
                        <div className="w-3/5">
                            <label className="label">
                                <span className="label-text font-bold text-2xl">{questionInfo.label}</span>
                            </label>
                            <p className="text-md ml-1 mr-4">{questionInfo.description}</p>
                        </div>
                        <input type="text" placeholder="Type here" className="input input-bordered w-2/5 my-auto" />
                    </div>
                );
            })}

            <button className="btn bg-custom-guilded text-black text-xl">Submit</button>
        </div>
    );
}
