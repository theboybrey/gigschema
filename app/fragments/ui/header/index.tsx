import React, { useState, useContext, useEffect } from "react";
import {
    PlusIcon,
    XIcon,
    FolderPlus,
    Database,
    FileText,
    ChevronRight, 
} from "lucide-react";
import { useStateValue } from "@/global/state.provider";
import { AuthContext } from "@/context/auth.context";
import {
    GetProjects,
    CreateProject as CreateProjectService
} from "@/app/api/services/project.service";
import { GetChats } from "@/app/api/services/chat.service";
import NewProjectModal from "../new-chat";

// const NewProjectModal = ({ isOpen, onClose }: {
//     isOpen: boolean;
//     onClose: () => void;
// }) => {
//     const { state, dispatch } = useStateValue();
//     const authContext = useContext(AuthContext);

//     const [loading, setLoading] = useState(false);
//     const [details, setDetails] = useState({
//         name: "",
//         description: "",
//         schemaType: "sql",
//     });

//     const projectTemplates = [
//         {
//             name: "E-commerce Database",
//             icon: <Database className="text-blue-500 w-6 h-6" />,
//             description: "Typical schema for online retail platforms"
//         },
//         {
//             name: "User Management",
//             icon: <FileText className="text-green-500 w-6 h-6" />,
//             description: "Standard user authentication and profile schema"
//         }
//     ];

//     const handleChange = (e: any) => {
//         const { name, value } = e.target;
//         setDetails((prev) => ({ ...prev, [name]: value }));
//     };

//     const handleSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (!authContext?.token) return;

//         setLoading(true);
//         try {
//             await CreateProjectService(details as any, authContext.token, setLoading, (response) => {
//                 if (response.project) {
//                     dispatch({
//                         type: "SET_PROJECTS",
//                         payload: [...state.projects, response.project]
//                     });
//                     onClose();
//                 }
//             });
//         } catch (error) {
//             console.error("Project creation failed:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     if (!isOpen) return null;

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
//             <div className="bg-white w-[95%] max-w-2xl rounded-2xl shadow-2xl p-8">
//                 <div className="flex justify-between items-center mb-6 ">
//                     <h2 className="text-2xl font-medium font-syne text-gray-800 flex items-center">
//                         <FolderPlus className="mr-3 text-gray-800" />
//                         Create New Project
//                     </h2>
//                     <button
//                         onClick={onClose}
//                         className="text-gray-500 hover:text-gray-800 transition-colors"
//                     >
//                         <XIcon className="w-6 h-6" />
//                     </button>
//                 </div>

//                 <div className="grid md:grid-cols-2 gap-6">
//                     {/* Project Details Form */}
//                     <form onSubmit={handleSubmit} className="space-y-4">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Project Name
//                             </label>
//                             <input
//                                 type="text"
//                                 name="name"
//                                 value={details.name}
//                                 onChange={handleChange}
//                                 placeholder="Enter project name"
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                                 required
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Description
//                             </label>
//                             <textarea
//                                 name="description"
//                                 value={details.description}
//                                 onChange={handleChange}
//                                 placeholder="Brief project description"
//                                 rows={3}
//                                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//                             />
//                         </div>

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Schema Type
//                             </label>
//                             <div className="grid grid-cols-2 gap-3">
//                                 {["sql", "nosql"].map((type) => (
//                                     <label
//                                         key={type}
//                                         className={`
//                       flex items-center justify-center p-3 border rounded-lg cursor-pointer
//                       ${details.schemaType === type
//                                                 ? "bg-blue-50 border-blue-500 text-blue-700"
//                                                 : "border-gray-300 text-gray-600 hover:bg-gray-50"}
//                     `}
//                                     >
//                                         <input
//                                             type="radio"
//                                             name="schemaType"
//                                             value={type}
//                                             checked={details.schemaType === type}
//                                             onChange={() => setDetails(prev => ({ ...prev, schemaType: type }))}
//                                             className="hidden"
//                                         />
//                                         <span className="capitalize">{type}</span>
//                                     </label>
//                                 ))}
//                             </div>
//                         </div>

//                         <button
//                             type="submit"
//                             disabled={loading}
//                             className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                         >
//                             {loading ? "Creating..." : "Create Project"}
//                         </button>
//                     </form>

//                     {/* Project Templates */}
//                     <div className="border-l pl-6 border-gray-200">
//                         <h3 className="text-sm font-medium text-gray-700 mb-4">
//                             Quick Templates
//                         </h3>
//                         <div className="space-y-4">
//                             {projectTemplates.map((template) => (
//                                 <div
//                                     key={template.name}
//                                     className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer group"
//                                 >
//                                     <div className="flex items-center space-x-4">
//                                         {template.icon}
//                                         <div>
//                                             <p className="font-medium text-gray-800">{template.name}</p>
//                                             <p className="text-sm text-gray-500">{template.description}</p>
//                                         </div>
//                                     </div>
//                                     <ChevronRight className="text-gray-400 group-hover:translate-x-1 transition-transform" />
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

const HeaderFragment = () => {
    const [loading, setLoading] = useState(false);
    const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
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

    return (
        <>
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <h1 className="text-xl font-medium font-syne text-gray-800">
                        {state.currentProject?.name || "Schema Design Assistant"}
                    </h1>
                    {loading && (
                        <span className="text-sm text-gray-500 animate-pulse">
                            Loading...
                        </span>
                    )}
                </div>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => setIsNewProjectOpen(true)}
                        className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                        New Project
                    </button>
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