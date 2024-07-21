import React from "react";

const Pagination = ({ pageNumber, setPageNumber, totalPages }) => {
	const pages = new Array(totalPages).fill(null).map((v, i) => i + 1);

	return (
		<>
			{totalPages > 1 && (
				<div className="width-full flex items-center justify-center">
					<button
						className="border border-black p-1"
						onClick={() => {
							if (pageNumber > 1) {
								setPageNumber(pageNumber - 1);
							}
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="size-6"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M15.75 19.5 8.25 12l7.5-7.5"
							/>
						</svg>
					</button>
					{totalPages > 1 && pages.map((page) => (
							<button
								className="border border-black px-2 py-1"
								style={{
									backgroundColor:
										page === pageNumber ? "black" : "white",
									color:
										page === pageNumber ? "white" : "black",
								}}
								onClick={() => setPageNumber(page)}
							>
								{page}
							</button>
						))}
					<button
						className="border border-black p-1"
						onClick={() => {
							if (pageNumber < totalPages) {
								setPageNumber(pageNumber + 1);
							}
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							strokeWidth={1.5}
							stroke="currentColor"
							className="size-6"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="m8.25 4.5 7.5 7.5-7.5 7.5"
							/>
						</svg>
					</button>
				</div>
			)}
		</>
	);
};

export default Pagination;
