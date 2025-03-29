import { Button } from '@/components/button';
import { useStateValue } from '@/global/state.provider';
import { formatDate } from '@/helper/date.format';
import { Dialog } from '@headlessui/react';
import { RiCheckLine, RiErrorWarningLine, RiLoader5Fill, RiWalkFill, RiWalkLine } from '@remixicon/react';
import {
  AlertTriangle,
  Check,
  Palette,
  PenLine,
  Search,
  Settings,
  Shield,
  Trash2,
  User,
  X
} from 'lucide-react';
import React, { Fragment, useContext, useEffect, useState } from 'react';
import { UpdateProject, DeleteProject } from '@/app/api/services/project.service';
import { notifier } from '@/components/notifier';
import { IProject, IUser } from '@/interface';
import { ChangePassword, UpdateProfile } from '@/app/api/services/user.service';
import { AuthContext } from '@/context/auth.context';

interface ApiResponse<T> {
  project: T;
  message?: string;
  status?: string;
}



interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingProject, setEditingProject] = useState<IProject | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<IProject | null>(null);
  const [progressValue, setProgressValue] = useState(0);

  const { state: { projects, currentProject, token }, dispatch } = useStateValue();

  const chatHistory = projects;
  const filteredChats = chatHistory.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (loading) {
      setProgressValue(10);
      interval = setInterval(() => {
        setProgressValue((prev) => {
          const newValue = prev + Math.floor(Math.random() * 10);
          if (newValue >= 90) {
            clearInterval(interval);
            return 90
          }
          return newValue;
        });

        notifier.progress("Processing", progressValue);
      }, 300);
    } else if (progressValue > 0) {
      setProgressValue(100);
      setTimeout(() => setProgressValue(0), 500);
      notifier.success("Operation completed successfully", "Update Success");
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading, progressValue]);

  const handleEditProject = (project: IProject) => {
    setEditingProject(project);
    setNewProjectName(project.name);
  };

  const handleUpdateProject = () => {
    if (!editingProject || !newProjectName.trim()) return;

    const updatedProject: IProject = {
      ...editingProject,
      name: newProjectName.trim(),
      description: editingProject?.description ?? '',
      _schema: editingProject?._schema ?? '',
      messages: editingProject?.messages ?? [],
      visibility: editingProject?.visibility ?? 'private',
      schemaType: editingProject?.schemaType ?? 'default'
    };

    dispatch({
      type: 'UPDATE_PROJECT_OPTIMISTIC' as any,
      payload: updatedProject
    });

    setEditingProject(null);

    setLoading(true);

    UpdateProject(
      editingProject._id ?? "",
      { name: newProjectName.trim() },
      token ?? '',
      setLoading,
      (response) => {
        setLoading(false);
        notifier.success("Schema updated successfully");

        if (currentProject && currentProject._id === response.project?._id) {
          dispatch({
            type: 'SET_CURRENT_PROJECT',
            payload: response.project ?? null
          });
        }
      },
    );
  };

  const handleDeleteClick = (project: IProject) => {
    setProjectToDelete(project);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (!projectToDelete) return;

    const projectId = projectToDelete._id;

    dispatch({
      type: 'SET_PROJECTS',
      payload: projects.filter(p => p._id !== projectId)
    });

    if (currentProject && currentProject._id === projectId) {
      dispatch({
        type: 'SET_CURRENT_PROJECT',
        payload: null
      });
    }

    setDeleteConfirmOpen(false);
    setProjectToDelete(null);

    setLoading(true);

    DeleteProject(
      projectId ?? "",
      token!,
      setLoading,
      (response) => {
        setLoading(false);
        notifier.success("Schema deleted successfully");
      }
    );
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" aria-hidden="true" />
      <Dialog.Panel className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">


        {/* Header */}
        <div className="border-b border-gray-100 p-4 flex items-center justify-between">
          <h2 className="text-lg font-medium font-syne text-gray-800 flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 0 0-1.883 2.542l.857 6a2.25 2.25 0 0 0 2.227 1.932H19.05a2.25 2.25 0 0 0 2.227-1.932l.857-6a2.25 2.25 0 0 0-1.883-2.542m-16.5 0V6A2.25 2.25 0 0 1 6 3.75h3.879a1.5 1.5 0 0 1 1.06.44l2.122 2.12a1.5 1.5 0 0 0 1.06.44H18A2.25 2.25 0 0 1 20.25 9v.776" />
            </svg>
            <span>Recent Chat History</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:bg-gray-100 rounded-full p-2 transition-colors"
            aria-label="Close chat history"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search schema chats..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 outline-none text-sm"
              disabled={loading}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>

        {/* Edit Project Name Modal */}
        {editingProject && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
              <div className="mb-4 flex items-center">
                <PenLine className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-medium">Rename Schema</h3>
              </div>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new name"
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProject}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-1"
                  disabled={loading || !newProjectName.trim()}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmOpen && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
              <div className="mb-4 flex items-center text-red-600">
                <AlertTriangle className="w-5 h-5 mr-2" />
                <h3 className="text-lg font-medium">Delete Schema</h3>
              </div>
              <p className="text-gray-600 mb-5">
                Are you sure you want to delete <span className="font-medium">{projectToDelete?.name}</span>? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setDeleteConfirmOpen(false);
                    setProjectToDelete(null);
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-1"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Schema</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat History List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <div className="flex items-center justify-center">
                <span className='w-20 h-20 rounded-full border border-gray-300 bg-slate-50 flex items-center justify-center'>
                  <RiWalkLine className={'text-muted-foreground w-8 h-8'} />
                </span>
              </div>
              <p className='mt-2 text-sm'>No schema chats found</p>
            </div>
          ) : (
            filteredChats.map((chat, index) => (
              <div
                key={chat._id ?? index}
                className={`px-4 py-3 border-b border-gray-100 cursor-pointer ${chat?._id === currentProject?._id ? 'bg-blue-50' : 'hover:bg-gray-50'} group relative`}
                onMouseEnter={() => setHoveredChatId(chat?._id!)}
                onMouseLeave={() => setHoveredChatId(null)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className={`text-sm font-medium ${chat?._id === currentProject?._id ? 'text-blue-600' : 'text-gray-800'}`}>
                      {chat.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(chat?.createdAt!)}</p>
                  </div>
                  {hoveredChatId === chat._id && (
                    <div className="flex space-x-2">
                      <button
                        className="text-gray-500 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors"
                        aria-label="Edit conversation"
                        onClick={() => chat._id && handleEditProject(chat as IProject)}
                        disabled={loading}
                      >
                        <PenLine className="w-4 h-4" />
                      </button>
                      <button
                        className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                        aria-label="Delete conversation"
                        onClick={() => handleDeleteClick(chat as IProject)}
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 p-4 flex justify-center">
          <Button
            variant='secondary'
            className="hover:text-blue-500 text-muted-foreground border border-dashed hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m4.06-7.19-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z" />
            </svg>
            <span>New Schema Chat</span>
          </Button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const authContext = useContext(AuthContext);
  const { state } = useStateValue();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (authContext?.user) {
      setProfileForm({
        firstName: authContext.user.firstName || "",
        lastName: authContext.user.lastName || "",
        email: authContext.user.email || "",
        phone: authContext.user.phone || "",
        gender: authContext.user.gender || "unknown",
      });
    }
  }, [authContext?.user]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    if (!authContext?.token) {
      setErrorMessage("Authentication error. Please log in again.");
      setLoading(false);
      return;
    }

    UpdateProfile(
      profileForm as Partial<IUser>,
      authContext.token,
      setLoading,
      (data) => {
        if (data) {
          setSuccessMessage("Profile updated successfully");
          // Update context with new user data
          if (authContext?.user) {
            authContext.user = { ...authContext.user, ...profileForm, gender: profileForm.gender as "male" | "female" | "unknown" };
          }
          setTimeout(() => setSuccessMessage(""), 3000);
        } else {
          setErrorMessage("Failed to update profile");
          setTimeout(() => setErrorMessage(""), 3000);
        }
      }
    );
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    if (!authContext?.token || !authContext?.user?._id) {
      setErrorMessage("Authentication error. Please log in again.");
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setErrorMessage("Passwords do not match");
      setLoading(false);
      return;
    }

    ChangePassword(
      authContext.user._id,
      authContext.token,
      {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      },
      setLoading,
      (data) => {
        if (data) {
          setSuccessMessage("Password changed successfully");
          setPasswordForm({
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
          });
          setTimeout(() => setSuccessMessage(""), 3000);
        } else {
          setErrorMessage("Failed to change password");
          setTimeout(() => setErrorMessage(""), 3000);
        }
      }
    );
  };

  const getUserInitials = (name: string) => {
    if (!name) return '?';
    const names = name.split(' ');
    return names.length > 1
      ? (names[0][0] + names[1][0]).toUpperCase()
      : names[0][0].toUpperCase();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-syne font-medium">Account Settings</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {/* Notification */}
          {(successMessage || errorMessage) && (
            <div className={`p-3 mb-4 rounded-lg text-sm ${successMessage ? "bg-green-50 text-green-700" : "bg-rose-50 text-rose-700"}`}>
              <div className="flex items-center gap-2">
                {successMessage ? <RiCheckLine className="w-4 h-4" /> : <RiErrorWarningLine className="w-4 h-4" />}
                <span>{successMessage || errorMessage}</span>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex border-b border-gray-200">
              <button
                className={`px-4 py-2 font-medium text-sm ${activeTab === "profile"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab("profile")}
              >
                Profile
              </button>
              <button
                className={`px-4 py-2 font-medium text-sm ${activeTab === "security"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab("security")}
              >
                Security
              </button>
            </div>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div>
              <div className="flex items-center justify-center mb-6">
                <div className="relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xl font-semibold">
                  {getUserInitials(profileForm.firstName + " " + profileForm.lastName)}
                </div>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={profileForm.firstName}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      value={profileForm.lastName}
                      onChange={handleProfileChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
                    value={profileForm.email}
                    disabled
                  />
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone (optional)
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={profileForm.phone || ""}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={profileForm.gender}
                    onChange={handleProfileChange}
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unknown">Prefer not to say</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {loading ? (
                    <Fragment>
                      <RiLoader5Fill className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </Fragment>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                {authContext?.user?.provider === "google" ? (
                  <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-700">
                    <p>You're signed in with Google. Password management is handled through your Google account.</p>
                  </div>
                ) : (
                  <Fragment>
                    <div className="space-y-2">
                      <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <input
                        id="oldPassword"
                        name="oldPassword"
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={passwordForm.oldPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        value={passwordForm.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      disabled={loading}
                    >
                      {loading ? (
                        <Fragment>
                          <RiLoader5Fill className="w-4 h-4 mr-2 animate-spin" />
                          Changing...
                        </Fragment>
                      ) : (
                        "Change Password"
                      )}
                    </button>
                  </Fragment>
                )}
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export { ChatHistoryModal, SettingsModal };