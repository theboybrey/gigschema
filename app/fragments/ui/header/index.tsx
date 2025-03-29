import { GetChats } from "@/app/api/services/chat.service";
import { GetProjects } from "@/app/api/services/project.service";
import { AuthContext } from "@/context/auth.context";
import { useStateValue } from "@/global/state.provider";
import { RiBarcodeBoxLine, RiLoader5Fill } from "@remixicon/react";
import { ChevronDownIcon, LogOutIcon, PlusIcon, SettingsIcon } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { ChatHistoryModal, SettingsModal } from "../modals";
import NewProjectModal from "../new-chat";

const HeaderFragment = () => {
    const [loading, setLoading] = useState(false);
    const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
    const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
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

    const getUserInitials = (name: string) => {
        if (!name) return '?';
        const names = name.split(' ');
        return names.length > 1
            ? (names[0][0] + names[1][0]).toUpperCase()
            : names[0][0].toUpperCase();
    };

    // Get the 4 most recent projects, sorted by creation date
    const getLatestProjects = () => {
        return state.projects
    };

    const handleLogout = () => {
        authContext?.handleLogout();
    };

    const handleSettings = () => {
        setIsSettingsModalOpen(true);
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

                                    {loading ? (
                                        <span className="text-sm text-gray-500 animate-pulse">
                                            <RiLoader5Fill className="w-4 h-4 inline-block spinner" />
                                        </span>

                                    ) : state.projects.length > 0 ?
                                        (
                                            <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                                        ) :
                                        (
                                            <span className="text-sm text-gray-500">
                                                <RiBarcodeBoxLine className="w-4 h-4 inline-block" />
                                            </span>
                                        )

                                    }
                                </button>

                                {isProjectDropdownOpen && (
                                    <div className="absolute left-0 mt-2 w-72 origin-top-left bg-white divide-y divide-gray-100 rounded-xl shadow-lg ring-1 ring-black/5 focus:outline-none overflow-hidden">
                                        <div className="px-1 py-1">
                                            <div className="px-3 py-2 text-xs text-gray-500 uppercase tracking-wider">
                                                Recent Projects
                                            </div>
                                            {getLatestProjects().map((project) => (
                                                <button
                                                    key={project._id}
                                                    onClick={() => {
                                                        dispatch({ type: "SET_CURRENT_PROJECT", payload: project });
                                                        setIsProjectDropdownOpen(false);
                                                    }}
                                                    className={`group flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-gray-100 ${state.currentProject?._id === project._id
                                                        ? 'bg-blue-50 text-blue-600 font-medium'
                                                        : ''
                                                        }`}
                                                >
                                                    <span className="truncate">{project.name}</span>
                                                    {state.currentProject?._id === project._id && (
                                                        <span className="ml-auto text-blue-600">●</span>
                                                    )}
                                                </button>
                                            ))}
                                            {state.projects.length > 4 && (
                                                <button
                                                    onClick={() => {
                                                        setIsProjectDropdownOpen(false);
                                                        setIsChatHistoryOpen(true);
                                                    }}
                                                    className="group flex w-full items-center rounded-md px-3 py-2 text-sm hover:bg-gray-100 text-blue-600 font-semibold"
                                                >
                                                    View All Projects
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>


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

                            {/* Chat History Button */}
                            <button
                                onClick={() => setIsChatHistoryOpen(true)}
                                className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
                                </svg>
                                <span className="hidden sm:inline">History</span>
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
                                                className="group flex w-full items-center rounded-md px-2 py-2 text-sm bg-rose-100 text-rose-600"
                                            >
                                                <LogOutIcon className="mr-2 w-4 h-4 text-rose-500" />
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

            {/* Modals */}
            <NewProjectModal
                isOpen={isNewProjectOpen}
                onClose={() => setIsNewProjectOpen(false)}
            />
            <ChatHistoryModal
                isOpen={isChatHistoryOpen}
                onClose={() => setIsChatHistoryOpen(false)}
            />
            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={() => setIsSettingsModalOpen(false)}
            />
        </>
    );
};

export default HeaderFragment;