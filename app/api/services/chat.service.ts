import { RetryOperation } from "@/helper/operation.retry";
import { IChat } from "@/interface/";
import Axios from "../axios";
import { notifier } from "@/components/notifier";

interface ApiResponse<T> {
  chat?: T;
  chats?: T[];
  message?: string;
}

export async function CreateChat(
  info: Partial<IChat>,
  token: string,
  setLoading: (loading: boolean) => void,
  callback: (response: ApiResponse<IChat>) => void
) {
  setLoading(true);

  try {
    const response = await Axios({
      url: "/chat/",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: info,
    });

    const data = response.data as ApiResponse<IChat>;

    if (data && data.chat) {
      callback(data);
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message;
    notifier.error(errorMessage, "New Chat Error");
  } finally {
    setLoading(false);
  }
}

export async function GetChats(
  token: string,
  setLoading: (loading: boolean) => void,
  callback: (response: ApiResponse<IChat[]>) => void
) {
  setLoading(true);

  try {
    const response = await Axios({
      url: "/chat/",
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = response.data as ApiResponse<IChat[]>;

    if (data && data.chats) {
      callback(data);
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message;
    notifier.error(errorMessage, "Unavailable Chat History");
  } finally {
    setLoading(false);
  }
}

export async function GetChat(
  id: string,
  token: string,
  setLoading: (loading: boolean) => void,
  callback: (response: ApiResponse<IChat>) => void
) {
  setLoading(true);

  try {
    const response = await Axios({
      url: `/chat/${id}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = response.data as ApiResponse<IChat>;

    if (data && data.chat) {
      callback(data);
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message;
    notifier.error(errorMessage, "Unavailble Chat History ");
  } finally {
    setLoading(false);
  }
}

export async function ToggleArchiveChat(
  id: string,
  token: string,
  setLoading: (loading: boolean) => void,
  callback: (response: ApiResponse<IChat>) => void
) {
  setLoading(true);

  try {
    const response = await Axios({
      url: `/chat/${id}/conversation`,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = response.data as ApiResponse<IChat>;

    if (data && data.chat) {
      callback(data);
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message;
    notifier.error(errorMessage, "Chat Archive Error");
  } finally {
    setLoading(false);
  }
}

export async function RenameChat(
  id: string,
  name: string,
  token: string,
  setLoading: (loading: boolean) => void,
  callback: (response: ApiResponse<IChat>) => void
) {
  setLoading(true);

  try {
    const response = await Axios({
      url: `/chat/${id}/rename`,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: { name },
    });

    const data = response.data as ApiResponse<IChat>;

    if (data && data.chat) {
      callback(data);
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message;
    notifier.error(errorMessage, "Chat Rename Error");
  } finally {
    setLoading(false);
  }
}

export async function DeleteChat(
  id: string,
  token: string,
  setLoading: (loading: boolean) => void,
  callback: (response: ApiResponse<IChat>) => void
) {
  setLoading(true);

  try {
    const response = await Axios({
      url: `/chat/${id}`,
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = response.data as ApiResponse<IChat>;

    if (data && data.chat) {
      callback(data);
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message;
    notifier.error(errorMessage, "Chat Deletion Error");
  } finally {
    setLoading(false);
  }
}
