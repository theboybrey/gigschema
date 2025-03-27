import { RetryOperation } from "@/helper/operation.retry";
import { IChat } from "@/interface/";
import Axios from "../axios";

interface ApiResponse<T> {
  chat?: T;
  chats?: T[];
  message?: string;
}

export const FetchAllChats = async (): Promise<IChat[]> => {
  const operation = async () => {
    const response = await Axios.get<ApiResponse<IChat>>("/chats");
    return response.data.chats || [];
  };
  return RetryOperation(operation);
};

export const FetchChatById = async (id: string): Promise<IChat> => {
  const operation = async () => {
    const response = await Axios.get<ApiResponse<IChat>>(`/chats/${id}`);
    if (!response.data.chat) throw new Error("Chat not found");
    return response.data.chat;
  };
  return RetryOperation(operation);
};

export const CreateChat = async (data: { name: string }): Promise<IChat> => {
  const operation = async () => {
    const response = await Axios.post<ApiResponse<IChat>>("/chats", data);
    if (!response.data.chat) throw new Error("Failed to create chat");
    return response.data.chat;
  };
  return RetryOperation(operation);
};

export const RenameChat = async (
  id: string,
  data: { name: string }
): Promise<IChat> => {
  const operation = async () => {
    const response = await Axios.put<ApiResponse<IChat>>(`/chats/${id}`, data);
    if (!response.data.chat) throw new Error("Failed to rename chat");
    return response.data.chat;
  };
  return RetryOperation(operation);
};

export const DeleteChat = async (id: string): Promise<void> => {
  const operation = async () => {
    const response = await Axios.delete<ApiResponse<never>>(`/chats/${id}`);
    if (response.data.message !== "Chat deleted successfully") {
      throw new Error("Failed to delete chat");
    }
  };
  return RetryOperation(operation);
};

export const ToggleArchiveChat = async (id: string): Promise<IChat> => {
  const operation = async () => {
    const response = await Axios.post<ApiResponse<IChat>>(
      `/chats/${id}/conversation`
    );
    if (!response.data.chat) throw new Error("Failed to toggle archive status");
    return response.data.chat;
  };
  return RetryOperation(operation);
};
