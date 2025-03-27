import {
  IUser,
  IChat,
  IProject,
  IAIResponse,
  IMessage,
  AppState,
  ActionType,
  IError,
} from "@/interface";
import { Draft, produce } from "immer";

export type AppAction =
  | { type: "SET_USER"; payload: IUser | null }
  | { type: "SET_TOKEN"; payload: string | null }
  | { type: "SET_USERS"; payload: IUser[] }
  | { type: "SET_PROJECTS"; payload: IProject[] }
  | { type: "SET_CURRENT_PROJECT"; payload: IProject | null }
  | { type: "SET_CHATS"; payload: IChat[] }
  | { type: "SET_CURRENT_CHAT"; payload: IChat | null }
  | { type: "SET_CURRENT_AI_RESPONSE"; payload: IAIResponse | null }
  | { type: "SET_CURRENT_CONVERSATION"; payload: IMessage[] }
  | { type: "SET_CURRENT_SCHEMA"; payload: any | null }
  | { type: "SET_CURRENT_SCHEMA_KEYS"; payload: string[] }
  | { type: "SET_CURRENT_SCHEMA_VALUES"; payload: any[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: IError | null }
  | { type: "UPDATE_PROJECT_OPTIMISTIC"; payload: IProject }
  | { type: "ADD_MESSAGE_OPTIMISTIC"; payload: IMessage }
  | { type: "ROLLBACK_PROJECT"; payload: IProject }
  | { type: "ROLLBACK_CONVERSATION"; payload: IMessage[] };

export const RootReducer = produce(
  (state: Draft<AppState>, action: AppAction) => {
    switch (action.type) {
      case "SET_USER":
        state.user = action.payload;
        break;
      case "SET_TOKEN":
        state.token = action.payload;
        break;
      case "SET_USERS":
        state.users = action.payload;
        break;
      case "SET_PROJECTS":
        state.projects = action.payload;
        break;
      case "SET_CURRENT_PROJECT":
        state.currentProject = action.payload;
        state.currentSchema = action.payload?._schema || null;
        state.currentSchemaKeys = action.payload?._schema
          ? Object.keys(action.payload._schema)
          : [];
        state.currentSchemaValues = action.payload?._schema
          ? Object.values(action.payload._schema)
          : [];
        break;
      case "SET_CHATS":
        state.chats = action.payload;
        break;
      case "SET_CURRENT_CHAT":
        state.currentChat = action.payload;
        state.currentConversation =
          Array.isArray(action.payload?.messages) &&
          action.payload?.messages.every((msg) => typeof msg !== "string")
            ? action.payload.messages
            : [];
        break;
      case "SET_CURRENT_AI_RESPONSE":
        state.currentAIResponse = action.payload;
        break;
      case "SET_CURRENT_CONVERSATION":
        state.currentConversation = action.payload;
        break;
      case "SET_CURRENT_SCHEMA":
        state.currentSchema = action.payload;
        state.currentSchemaKeys = action.payload
          ? Object.keys(action.payload)
          : [];
        state.currentSchemaValues = action.payload
          ? Object.values(action.payload)
          : [];
        break;
      case "SET_CURRENT_SCHEMA_KEYS":
        state.currentSchemaKeys = action.payload;
        break;
      case "SET_CURRENT_SCHEMA_VALUES":
        state.currentSchemaValues = action.payload;
        break;
      case "SET_LOADING":
        state.isLoading = action.payload;
        break;
      case "SET_ERROR":
        state.error = action.payload;
        break;

      case "UPDATE_PROJECT_OPTIMISTIC":
        if (state.currentProject) {
          const index = state.projects.findIndex(
            (p) => p._id === action.payload._id
          );
          if (index !== -1) state.projects[index] = action.payload;
          state.currentProject = action.payload;
          state.currentSchema = action.payload._schema;
          state.currentSchemaKeys = action.payload._schema
            ? Object.keys(action.payload._schema)
            : [];
          state.currentSchemaValues = action.payload._schema
            ? Object.values(action.payload._schema)
            : [];
        }
        state.isLoading = true;
        break;

      case "ADD_MESSAGE_OPTIMISTIC":
        state.currentConversation.push(action.payload);
        if (state.currentChat) {
          state.currentChat.messages = state.currentConversation;
        } else if (state.currentProject) {
          state.currentProject.messages = state.currentConversation;
        }
        state.isLoading = true;
        break;

      case "ROLLBACK_PROJECT":
        if (state.currentProject) {
          const index = state.projects.findIndex(
            (p) => p._id === action.payload._id
          );
          if (index !== -1) state.projects[index] = action.payload;
          state.currentProject = action.payload;
          state.currentSchema = action.payload._schema;
          state.currentSchemaKeys = action.payload._schema
            ? Object.keys(action.payload._schema)
            : [];
          state.currentSchemaValues = action.payload._schema
            ? Object.values(action.payload._schema)
            : [];
        }
        state.isLoading = false;
        state.error = {
          message: "Failed to update project",
          status: 500,
        } as IError;
        break;

      case "ROLLBACK_CONVERSATION":
        state.currentConversation = action.payload;
        if (state.currentChat) {
          state.currentChat.messages = action.payload;
        } else if (state.currentProject) {
          state.currentProject.messages = action.payload;
        }
        state.isLoading = false;
        state.error = {
          message: "Failed to add message",
          status: 500,
        } as IError;
        break;
    }
  }
);
