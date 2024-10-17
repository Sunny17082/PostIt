import React from "react";

const Pagination = ({ pageNumber, setPageNumber, totalPages }) => {
	const pages = new Array(totalPages).fill(null).map((v, i) => i + 1);

	return (
		<>
			{totalPages > 1 && (
				<div className="w-full flex items-center justify-center mt-8">
					<nav
						className="inline-flex rounded-md shadow-sm"
						aria-label="Pagination"
					>
						<button
							className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
							onClick={() => {
								if (pageNumber > 1) {
									setPageNumber(pageNumber - 1);
								}
							}}
						>
							<span className="sr-only">Previous</span>
							<svg
								className="h-5 w-5"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									fillRule="evenodd"
									d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
									clipRule="evenodd"
								/>
							</svg>
						</button>
						{pages.map((page) => (
							<button
								key={page}
								className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
                                    ${
										page === pageNumber
											? "z-10 bg-gray-100 border-gray-400 text-gray-700"
											: "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
									}`}
								onClick={() => setPageNumber(page)}
							>
								{page}
							</button>
						))}
						<button
							className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
							onClick={() => {
								if (pageNumber < totalPages) {
									setPageNumber(pageNumber + 1);
								}
							}}
						>
							<span className="sr-only">Next</span>
							<svg
								className="h-5 w-5"
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									fillRule="evenodd"
									d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
									clipRule="evenodd"
								/>
							</svg>
						</button>
					</nav>
				</div>
			)}
		</>
	);
};

export default Pagination;
