import { FetchUser } from "@/hooks";
import { AppState, IUser } from "@/interface";

let user: IUser | null = FetchUser();

const initialState: AppState = {
  user: null,
  users: [],
  projects: [],
  currentProject: null,
  chats: [],
  currentChat: null,
  currentAIResponse: null,
  currentConversation: [],
  currentSchema: null,
  currentSchemaKeys: [],
  currentSchemaValues: [],
  isLoading: false,
  error: null,
};
