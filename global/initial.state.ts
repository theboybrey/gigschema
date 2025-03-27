import { FetchUser, FetchToken } from "@/hooks";
import { AppState, IUser } from "@/interface";

let user: IUser | null = FetchUser();
let token: string | null = FetchToken();

const initialState: AppState = {
  user: user,
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
  token: token,
};

export default initialState;
