const questions = {
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
};

export default function MainSettings() {
    return (
        <>
            {Object.keys(questions).map((qKey) => {
                const questionInfo = questions[qKey as keyof typeof questions];

                return (
                    <div key={qKey} className="flex flex-row">
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
        </>
    );
}
