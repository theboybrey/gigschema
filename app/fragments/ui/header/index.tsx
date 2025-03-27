import { GetChats } from "@/app/api/services/chat.service";
import { GetProjects } from "@/app/api/services/project.service";
import { AuthContext } from "@/context/auth.context";
import { useStateValue } from "@/global/state.provider";
import { PlusIcon, ChevronDownIcon, SettingsIcon, LogOutIcon, UserIcon } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import NewProjectModal from "../new-chat";

const HeaderFragment = () => {
    const [loading, setLoading] = useState(false);
    const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { state, dispatch } = useStateValue();
    const authContext = useContext(AuthContext);

    useEffect(() => {
        const token = authContext?.token;
        if (token) {
            setLoading(true);
            Promise.all([
                GetProjects(token, setLoading,
                    (data) => dispatch({
                        type: "SET_PROJECTS",
                        payload: data.projects?.flat() || []
                    })
                ),
                GetChats(token, setLoading,
                    (data) => dispatch({
                        type: "SET_CHATS",
                        payload: data.chats?.flat() || []
                    })
                )
            ]).finally(() => setLoading(false));
        }
    }, [authContext?.token, dispatch]);

    // Function to get user initials
    const getUserInitials = (name: string) => {
        if (!name) return '?';
        const names = name.split(' ');
        return names.length > 1
            ? (names[0][0] + names[1][0]).toUpperCase()
            : names[0][0].toUpperCase();
    };

    const handleLogout = () => {
        // Implement logout logic
        authContext?.handleLogout();
    };

    const handleSettings = () => {
        // Navigate to settings page or open settings modal
        // Replace with your actual navigation/modal logic
        console.log('Open settings');
    };

    return (
        <>
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4 space-x-4">
                        {/* Project Title and Loading State */}
                        <div className="flex items-center space-x-3 min-w-0">
                            <div className="relative">
                                <button
                                    onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                                    className="flex items-center space-x-2 text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                                >
                                    <h1 className="text-xl font-medium font-syne truncate max-w-[200px]">
                                        {state.currentProject?.name || "Schema Design Assistant"}
                                    </h1>
                                    <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                                </button>

                                {isProjectDropdownOpen && (
                                    <div className="absolute left-0 mt-2 w-56 origin-top-left bg-white divide-y divide-gray-100 rounded-lg shadow-lg ring-1 ring-black/5 focus:outline-none">
                                        <div className="px-1 py-1">
                                            {state.projects.map((project) => (
                                                <button
                                                    key={project._id}
                                                    onClick={() => {
                                                        dispatch({ type: "SET_CURRENT_PROJECT", payload: project });
                                                        setIsProjectDropdownOpen(false);
                                                    }}
                                                    className="group flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-gray-100"
                                                >
                                                    {project.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {loading && (
                                <span className="text-sm text-gray-500 animate-pulse">
                                    Loading...
                                </span>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-4">
                            {/* New Project Button */}
                            <button
                                onClick={() => setIsNewProjectOpen(true)}
                                className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                            >
                                <PlusIcon className="w-5 h-5" />
                                <span className="hidden sm:inline">New Project</span>
                            </button>

                            {/* User Profile */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 transition-all"
                                >
                                    {getUserInitials(authContext?.user?.firstName + " " + authContext?.user?.lastName || '')}
                                </button>

                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-lg shadow-lg ring-1 ring-black/5 focus:outline-none">
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {authContext?.user?.firstName + " " + authContext?.user?.lastName}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {authContext?.user?.email}
                                            </p>
                                        </div>
                                        <div className="px-1 py-1">
                                            <button
                                                onClick={handleSettings}
                                                className="group flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-gray-100"
                                            >
                                                <SettingsIcon className="mr-2 w-4 h-4 text-gray-500" />
                                                Settings
                                            </button>
                                            <button
                                                onClick={handleLogout}
                                                className="group flex w-full items-center rounded-md px-2 py-2 text-sm hover:bg-gray-100 hover:text-red-600"
                                            >
                                                <LogOutIcon className="mr-2 w-4 h-4 text-gray-500" />
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <NewProjectModal
                isOpen={isNewProjectOpen}
                onClose={() => setIsNewProjectOpen(false)}
            />
        </>
    );
};

export default HeaderFragment;