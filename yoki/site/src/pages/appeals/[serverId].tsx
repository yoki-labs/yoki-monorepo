import type { GetServerSideProps, NextPage } from "next";
import { LandingPage } from "../../components/landing/LandingPage";
import prisma from "../../lib/Prisma";
import Button from "../../components/appeals/Button";
import { useState } from "react";

export type Props = { id: string | null; enabled: boolean };
export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
	const { serverId } = ctx.params as { serverId: string };
	const server = await prisma.server.findFirst({ "where": { serverId } });

	if (!server?.appealChannel) return { props: { id: null, enabled: false } }
	return { props: { id: server.serverId, enabled: true } }
}

const AppealPage: NextPage<Props> = ({ id, enabled }) => {
	const [status, setStatus] = useState<"LOADING" | "SUCCESS" | "FAILED" | "PENDING">("PENDING");
	const [appealContent, setAppealContent] = useState("");
	const [appealerId, setAppealId] = useState("");

	const appealReq = async (event: any) => {
		console.log("hi")
		event.preventDefault();
		if (!appealerId) return alert("You must provide your user ID for the appeal.")
		if (!appealContent) return alert("You must provide content for your appeal");

		setStatus("LOADING")
		const req = await fetch(`/api/appeals/${id}`, { "method": "POST", "body": JSON.stringify({ appealContent, appealerId }), "headers": { "content-type": "application/json" } });
		if (!req.ok) setStatus("FAILED")
		else setStatus("SUCCESS");
	}

	let response;
	switch (status) {
		case "SUCCESS": {
			response = <h1 className="text-green-600">Success! Your appeal was sent in.</h1>;
			break;
		}
		case "FAILED": {
			response = <h1 className="text-red-600 text-center">There was an error sending in your appeal.<br />Please reach out to server staff for manual appeal.</h1>;
			break;
		}
		case "LOADING": {
			response = <h1 className="text-yellow-600">Sending...</h1>
			break;
		}
		default:
			const appealContentLength = appealContent.length;
			response = <form onSubmit={appealReq} className="text-white w-1/2">
				<h1 className="text-3xl pb-4">Appeal Here</h1>
				<div className="flex flex-wrap space-y-4">
					<input id="appealerId" onChange={(data) => setAppealId(data.target.value)} placeholder="What is your Guilded ID?" className="w-1/2 px-3 py-1 rounded-lg border-custom-black bg-custom-black resize-none font-normal text-lg"></input>
					<textarea
						id="appealContent"
						placeholder="Why should you be unbanned?"
						defaultValue={appealContent?.length ? appealContent : ""}
						maxLength={1000}
						rows={8}
						onChange={(data) => setAppealContent(data.target.value)}
						className="w-full px-3 pt-3 pb-40 rounded-lg border-custom-black bg-custom-black resize-none font-normal"
					/>
					<p
						className={`ml-auto text-lg ${appealContentLength === 1000 ? "font-bold" : ""} ${appealContentLength >= 200 ? "text-red-400/70" : appealContentLength >= 100 ? "text-guilded-gilded/70" : "text-guilded-white/70"}`}
					>
						{appealContent == null ? 0 : appealContentLength}/1000
					</p>
				</div>
				<div className="pt-2">
					<Button disabled={appealContentLength < 1}>Save</Button>
				</div>
			</form>
	}

	return (
		<>
			<LandingPage>
				<div style={{ "height": "100vh" }} className="flex justify-center text-3xl font-bold py-8">
					{
						!enabled ? <h1 className="text-red-600">This server does not accept appeals through Yoki.</h1> :
							id ?
								response
								: <h1 className="text-red-600">That is not a valid server.</h1>}</div>
			</LandingPage>
		</>
	);
};

export default AppealPage;
