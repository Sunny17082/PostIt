import axios from "axios";
import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";

const SettingsPage = () => {
	const [coverImg, setCoverImg] = useState("");
	const [profileImg, setProfileImg] = useState("");
	const [bio, setBio] = useState("");
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isChanged, setIsChanged] = useState(false);
	const [coverImgFile, setCoverImgFile] = useState(null);
	const [profileImgFile, setProfileImgFile] = useState(null);


	const fetchUserInfo = async () => {
		try {
			const response = await axios.get(`/user`, {withCredentials: true, headers: { "Content-Type": "application/json"}});
			const { bio, profileImg, coverImg } = response.data;
			setBio(bio || "");
			if (profileImg) {
				setProfileImg(profileImg);
			}
			if (coverImg) {
				setCoverImg(coverImg);
			}
		} catch (err) {
			console.log(err);
		}
	}

	useEffect(() => {
		fetchUserInfo();
		setIsChanged(false);
	}, [isChanged]);

	const onDropCover = useCallback((acceptedFiles) => {
		const file = acceptedFiles[0];
		setCoverImg(URL.createObjectURL(file));
		setCoverImgFile(file);
	}, []);

	const onDropProfile = useCallback((acceptedFiles) => {
		const file = acceptedFiles[0];
		setProfileImg(URL.createObjectURL(file));
		setProfileImgFile(file);
	}, []);

	const {
		getRootProps: getCoverRootProps,
		getInputProps: getCoverInputProps,
	} = useDropzone({
		onDrop: onDropCover,
		accept: {
			"image/*": [".jpeg", ".jpg", ".png", ".gif"],
		},
		multiple: false,
	});

	const {
		getRootProps: getProfileRootProps,
		getInputProps: getProfileInputProps,
	} = useDropzone({
		onDrop: onDropProfile,
		accept: {
        	'image/*': ['.jpeg', '.jpg', '.png', '.gif']
      	},
		multiple: false,
	});

	const handleSubmit = async (ev) => {
		ev.preventDefault();
		const formData = new FormData();
		formData.append("bio", bio);
		if (newPassword && confirmPassword) {
			if (oldPassword === newPassword) {
				alert("New password must be different from old password");
				return;
			}
			if (newPassword !== confirmPassword) {
				alert("New password and confirm password does not match");
				return;
			}
			formData.append("oldPassword", oldPassword);
			formData.append("newPassword", newPassword);
		}

		if (coverImgFile) {
			formData.append("coverImg", coverImgFile);
		}

		if (profileImgFile) {
			formData.append("profileImg", profileImgFile);
		}

		try {
			const response = await axios.put(`/user`, formData, { headers: { "Content-Type": "multipart/form-data" } });
			setIsChanged(true);
		} catch (err) {
			console.log(err);
		}
	}

	return (
		<div className="w-full max-w-2xl mx-auto my-10 p-6 bg-white rounded-lg shadow-md">
			<h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
				Settings
			</h1>
			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Cover Image
					</label>
					<div
						{...getCoverRootProps()}
						className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-gray-400 transition-colors"
					>
						<input {...getCoverInputProps()} />
						{coverImg ? (
							<img
								src={coverImg}
								alt="Cover"
								className="max-h-40 object-cover rounded-md"
							/>
						) : (
							<div className="space-y-1 text-center">
								<svg
									className="mx-auto h-12 w-12 text-gray-400"
									stroke="currentColor"
									fill="none"
									viewBox="0 0 48 48"
									aria-hidden="true"
								>
									<path
										d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
										strokeWidth={2}
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
								<p className="text-sm text-gray-500">
									Drop a file or click to select
								</p>
							</div>
						)}
					</div>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Profile Image
					</label>
					<div
						{...getProfileRootProps()}
						className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-gray-400 transition-colors"
					>
						<input {...getProfileInputProps()} />
						{profileImg ? (
							<img
								src={profileImg}
								alt="Profile"
								className="h-32 w-32 object-cover rounded-full"
							/>
						) : (
							<div className="space-y-1 text-center">
								<svg
									className="mx-auto h-12 w-12 text-gray-400"
									stroke="currentColor"
									fill="none"
									viewBox="0 0 48 48"
									aria-hidden="true"
								>
									<path
										d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
										strokeWidth={2}
										strokeLinecap="round"
										strokeLinejoin="round"
									/>
								</svg>
								<p className="text-sm text-gray-500">
									Drop a file or click to select
								</p>
							</div>
						)}
					</div>
				</div>

				<div>
					<label
						htmlFor="bio"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Bio
					</label>
					<textarea
						id="bio"
						rows="3"
						value={bio}
						onChange={(ev) => setBio(ev.target.value)}
						className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
						placeholder="Write a short bio about yourself"
					/>
				</div>

				<div>
					<label
						htmlFor="old-password"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Old Password
					</label>
					<input
						type="password"
						value={oldPassword}
						onChange={(ev) => setOldPassword(ev.target.value)}
						className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
						placeholder="Enter Old password ( leave blank if no password )"
					/>
				</div>

				<div>
					<label
						htmlFor="new-password"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						New Password
					</label>
					<input
						type="password"
						value={newPassword}
						onChange={(ev) => setNewPassword(ev.target.value)}
						className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
						placeholder="Enter new password"
					/>
				</div>

				<div>
					<label
						htmlFor="confirm-password"
						className="block text-sm font-medium text-gray-700 mb-2"
					>
						Confirm New Password
					</label>
					<input
						type="password"
						value={confirmPassword}
						onChange={(ev) => setConfirmPassword(ev.target.value)}
						className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm"
						placeholder="Confirm new password"
					/>
				</div>

				<div>
					<button
						type="submit"
						className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
					>
						Save Changes
					</button>
				</div>
			</form>
		</div>
	);
};

export default SettingsPage;
