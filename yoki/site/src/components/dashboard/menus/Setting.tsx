import { Server } from "@prisma/client";
import { Toggle } from "../Toggle";

export const Setting = ({ server }: { server: Server }) => {
	return <div className="w-6/7 mx-8 bg-gray-900 border-custom-slate border-2 rounded-md p-8">
		<div className="bg-red-500 w-1/3 p-4 text-white rounded-xl">
			<h3 className="text-3xl font-bold pb-2">Automod</h3>
			<p className="text-md pb-4">Scan text, images, and files from messages.</p>
			<Toggle />
		</div>
	</div>
}