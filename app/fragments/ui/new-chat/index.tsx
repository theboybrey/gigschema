import React, { useState, useContext } from "react";
import { 
  FolderPlus, 
  XIcon, 
  Database, 
  FileText, 
  Table, 
  Layers, 
  ChevronRight, 
  Server, 
  Columns 
} from "lucide-react";
import { useStateValue } from "@/global/state.provider";
import { AuthContext } from "@/context/auth.context";
import { CreateProject as CreateProjectService } from "@/app/api/services/project.service";
import { FaDatabase } from "react-icons/fa";
import { SiMongodb } from "react-icons/si";

const SchemaTypeIcon = {
  sql: <FaDatabase className="w-5 h-5 " />,
  nosql: <SiMongodb className="w-5 h-5 " />
};

const NewProjectModal = ({ isOpen, onClose }: {
    isOpen: boolean;
    onClose: () => void;
}) => {
    const { state, dispatch } = useStateValue();
    const authContext = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [details, setDetails] = useState({
        name: "",
        description: "",
        schemaType: "sql",
    });

    const projectTemplates = [
        {
            name: "E-commerce",
            icon: <Server className="text-indigo-500 w-6 h-6" />,
            description: "Comprehensive online retail schema",
            schemaType: "sql"
        },
        {
            name: "User Management",
            icon: <FileText className="text-emerald-500 w-6 h-6" />,
            description: "Scalable authentication system",
            schemaType: "nosql"
        },
        {
            name: "Product Catalog",
            icon: <Columns className="text-orange-500 w-6 h-6" />,
            description: "Flexible product information model",
            schemaType: "nosql"
        }
    ];

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDetails((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!authContext?.token) return;

        setLoading(true);
        try {
            await CreateProjectService(details as any, authContext.token, setLoading, (response) => {
                if (response.project) {
                    dispatch({
                        type: "SET_PROJECTS",
                        payload: [...state.projects, response.project]
                    });
                    onClose();
                }
            });
        } catch (error) {
            console.error("Project creation failed:", error);
        } finally {
            setLoading(false);
        }
    };

    const selectTemplate = (template: any) => {
        setDetails(prev => ({
            ...prev,
            name: template.name,
            schemaType: template.schemaType
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white w-[95%] max-w-4xl rounded-2xl shadow-2xl p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-medium text-gray-800 flex items-center">
                        <FolderPlus className="mr-3 text-gray-800" />
                        Create New Project
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-800 transition-colors"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Project Details Form */}
                    <div className="md:col-span-2 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Project Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={details.name}
                                onChange={handleChange}
                                placeholder="Enter project name"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={details.description}
                                onChange={handleChange}
                                placeholder="Brief project description"
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Schema Type
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.keys(SchemaTypeIcon).map((type) => (
                                    <label
                                        key={type}
                                        className={`
                                            flex items-center justify-center p-3 border rounded-lg cursor-pointer
                                            ${details.schemaType === type
                                                ? "bg-blue-50 border-blue-500 text-blue-700"
                                                : "border-gray-300 text-gray-600 hover:bg-gray-50"}
                                        `}
                                    >
                                        <input
                                            type="radio"
                                            name="schemaType"
                                            value={type}
                                            checked={details.schemaType === type}
                                            onChange={() => setDetails(prev => ({ ...prev, schemaType: type }))}
                                            className="hidden"
                                        />
                                        {SchemaTypeIcon[type as keyof typeof SchemaTypeIcon]} 
                                        <span className="ml-2 capitalize">{type?.toUpperCase()}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                        >
                            {loading ? "Creating..." : "Create Project"}
                        </button>
                    </div>

                    {/* Project Templates */}
                    <div className="border-l pl-6 border-gray-200">
                        <h3 className="text-sm font-medium text-gray-700 mb-4">
                            Quick Templates
                        </h3>
                        <div className="space-y-2">
                            {projectTemplates.map((template) => (
                                <div
                                    key={template.name}
                                    onClick={() => selectTemplate(template)}
                                    className={`
                                        flex items-center justify-between p-4 border rounded-lg cursor-pointer group
                                        ${details.name === template.name 
                                            ? "border-blue-500 bg-slate-50" 
                                            : "border-gray-200 hover:bg-gray-50"}
                                    `}
                                >
                                    <div className="flex items-center space-x-2">
                                        {template.icon}
                                        <div>
                                            <p className="font-medium text-gray-800 text-sm">{template.name}</p>
                                            <p className="text-sm text-gray-500 flex items-center">
                                                <span className=" capitalize">{template.schemaType?.toUpperCase()} Schema</span>
                                            </p>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewProjectModal;