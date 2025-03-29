import { Button } from '@/components/button';
import { useStateValue } from '@/global/state.provider';
import { formatDate } from '@/helper/date.format';
import { Dialog } from '@headlessui/react';
import { RiWalkFill } from '@remixicon/react';
import {
  Palette,
  PenLine,
  Plus,
  Search,
  Settings,
  Shield,
  Trash2,
  User,
  X
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ChatHistoryModal: React.FC<ChatHistoryModalProps> = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredChatId, setHoveredChatId] = useState<string | null>(null);
  const { state: { projects, currentProject } } = useStateValue()

  const chatHistory = projects
  const filteredChats = chatHistory.filter((chat) =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" aria-hidden="true" />
      <Dialog.Panel className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className=" border-b border-gray-100 p-4 flex items-center justify-between">
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
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>
        {/* Chat History List */}
        <div className="max-h-[60vh] overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              <div className="flex items-center justify-center">
                <span className='w-20 h-20 rounded-full border border-gray-300 bg-slate-50 flex items-center justify-center'>
                  <RiWalkFill className={'text-muted-foreground w-10 h-10'} />
                </span>
              </div>
              <p className='mt-2 text-sm '>No schema chats found</p>

            </div>
          ) : (
            filteredChats.map((chat, index) => (
              <div
                key={chat._id ?? index}
                className={`px-4 py-3 border-b border-gray-100 cursor-pointer ${chat?._id === currentProject?._id ? 'bg-blue-50' : 'hover:bg-gray-50'
                  } group relative`}
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
                      >
                        <PenLine className="w-4 h-4" />
                      </button>
                      <button
                        className="text-gray-500 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                        aria-label="Delete conversation"
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
        <div className=" border-t border-gray-100 p-4 flex justify-center">
          <Button
            variant='secondary'
            className="hover:text-blue-500 text-muted-foreground border border-dashed hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2">
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



interface SchemaSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SchemaSettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('account');

  const settingsTabs = [
    { id: 'account', label: 'Account', icon: <User className="w-5 h-5" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-5 h-5" /> },
    { id: 'schema', label: 'Schema Settings', icon: <Settings className="w-5 h-5" /> },
    { id: 'privacy', label: 'Privacy', icon: <Shield className="w-5 h-5" /> },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <div className="space-y-6">
            <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-800">SchemaUser</p>
                <p className="text-sm text-gray-500">schemauser@example.com</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b pb-3">
                <span className="text-gray-700">Language</span>
                <button className="text-sm text-blue-600 hover:underline">
                  English (US)
                </button>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                  Pro
                </div>
                <p className="text-sm text-gray-800">Unlock Schema Pro Features</p>
              </div>
              <div className="space-y-1 text-xs text-gray-600">
                <p>✦ Advanced Schema Validation</p>
                <p>✦ JSON-LD Generator</p>
                <p>✦ Priority Support</p>
              </div>
              <button className="mt-3 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                Go Pro
              </button>
            </div>
          </div>
        );
      case 'schema':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Schema Preferences</h3>
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-gray-700">Validation Strictness</span>
              <select className="text-sm text-blue-600 border rounded px-2 py-1">
                <option>Strict</option>
                <option>Moderate</option>
                <option>Lenient</option>
              </select>
            </div>
            <div className="flex justify-between items-center border-b pb-3">
              <span className="text-gray-700">Default Schema Type</span>
              <select className="text-sm text-blue-600 border rounded px-2 py-1">
                <option>JSON-LD</option>
                <option>Microdata</option>
                <option>RDFa</option>
              </select>
            </div>
          </div>
        );
      default:
        return <div className="text-center text-gray-500 py-10">Coming soon</div>;
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" aria-hidden="true" />
      <Dialog.Panel className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-100 flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 border-r border-gray-100 p-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:bg-gray-100 rounded-full p-2 transition-colors"
              aria-label="Close settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all ${activeTab === tab.id ? 'bg-blue-500 text-white' : 'hover:bg-gray-200 text-gray-700'
                  }`}
              >
                {tab.icon}
                <span className="text-sm">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
        {/* Content Area */}
        <div className="flex-1 p-6">{renderTabContent()}</div>
      </Dialog.Panel>
    </Dialog>
  );
};


export { ChatHistoryModal, SettingsModal };
