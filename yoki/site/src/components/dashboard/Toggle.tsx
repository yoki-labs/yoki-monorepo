import { useState } from "react";

export const Toggle = () => {
	const [toggle, setToggle] = useState(true);

	return <div
		className="md:w-14 md:h-7 animate transition-transform w-12 h-6 flex items-center bg-gray-300 rounded-full p-1 cursor-pointer"
		onClick={() => { setToggle(!toggle) }}>
		<div
			className={"bg-white md:w-6 md:h-6 h-5 w-5 rounded-full shadow-md duration-300 ease-in-out transform " + (toggle ? null : "transform translate-x-6")}>
		</div>
	</div>
}