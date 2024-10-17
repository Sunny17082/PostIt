import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import IndexPage from "./Pages/IndexPage";
import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import { UserContextProvider } from "./UserContext";
import CreatePost from "./Pages/CreatePost";
import PostPage from "./Pages/PostPage";
import EditPost from "./Pages/EditPost";
import ProfilePage from "./Pages/ProfilePage";
import SettingsPage from "./Pages/SettingsPage";
import NotFound from "./Pages/NotFound";
import axios from "axios";

axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
axios.defaults.withCredentials = true;

function App() {
	return (
		<UserContextProvider>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route index element={<IndexPage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/register" element={<RegisterPage />} />
					<Route path="/create" element={<CreatePost />} />
					<Route path="/post/:id" element={<PostPage />} />
					<Route path="/create/:id" element={<CreatePost />} />
					<Route path="/profile/:id" element={<ProfilePage />} />
					<Route path="/settings" element={<SettingsPage />} />
					<Route path="*" element={<NotFound />} />
				</Route>
			</Routes>
		</UserContextProvider>
	);
}

export default App;
