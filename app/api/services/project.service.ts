import { RetryOperation } from "@/helper/operation.retry";
import {
  IContinueConversationDTO,
  ICreateProjectDTO,
  IProject,
} from "@/interface/";
import Axios from "../axios";
import { notifier } from "@/components/notifier";

interface ApiResponse<T> {
  project?: T;
  projects?: T[];
  message?: string;
}

export async function CreateProject(
  info: Partial<IProject>,
  token: string,
  setLoading: (loading: boolean) => void,
  callback: (response: ApiResponse<IProject>) => void
) {
  setLoading(true);

  try {
    const response = await Axios({
      url: "/project/",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: info,
    });

    const data = response.data as ApiResponse<IProject>;

    if (data && data.project) {
      notifier.success("New schema document created", "Project Created");
      callback(data);
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message;
    notifier.error(errorMessage, "Project Creation Error");
  } finally {
    setLoading(false);
  }
}

export async function ContinueConversation(
  id: string,
  info: IContinueConversationDTO,
  token: string,
  setLoading: (loading: boolean) => void,
  callback: (response: ApiResponse<IProject>) => void
) {
  setLoading(true);

  try {
    const response = await Axios({
      url: `/project/${id}/conversation`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: info,
    });

    const data = response.data as ApiResponse<IProject>;

    if (data && data.project) {
      callback(data);
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message;
    notifier.error(errorMessage, "Conversation Error");
  } finally {
    setLoading(false);
  }
}

export async function GetProjects(
  token: string,
  setLoading: (loading: boolean) => void,
  callback: (response: ApiResponse<IProject[]>) => void
) {
  setLoading(true);

  try {
    const response = await Axios({
      url: "/project/",
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = response.data as ApiResponse<IProject[]>;

    if (data && data.projects) {
      callback(data);
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message;
    notifier.error(errorMessage, "Project Fetch Error");
  } finally {
    setLoading(false);
  }
}

export async function GetProject(
  id: string,
  token: string,
  setLoading: (loading: boolean) => void,
  callback: (response: ApiResponse<IProject>) => void
) {
  setLoading(true);

  try {
    const response = await Axios({
      url: `/project/${id}`,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = response.data as ApiResponse<IProject>;

    if (data && data.project) {
      callback(data);
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message;
    notifier.error(errorMessage, "Project Fetch Error");
  } finally {
    setLoading(false);
  }
}

export async function UpdateProject(
  id: string,
  info: Partial<IProject>,
  token: string,
  setLoading: (loading: boolean) => void,
  callback: (response: ApiResponse<IProject>) => void
) {
  setLoading(true);

  try {
    const response = await Axios({
      url: `/project/${id}`,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: info,
    });

    const data = response.data as ApiResponse<IProject>;

    if (data && data.project) {
      notifier.success("Schema document updated", "Project Updated");
      callback(data);
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message;
    notifier.error(errorMessage, "Project Update Error");
  } finally {
    setLoading(false);
  }
}

export async function DeleteProject(
  id: string,
  token: string,
  setLoading: (loading: boolean) => void,
  callback: (response: ApiResponse<IProject>) => void
) {
  setLoading(true);

  try {
    const response = await Axios({
      url: `/project/${id}`,
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = response.data as ApiResponse<IProject>;

    if (data && data.project) {
      notifier.success("Schema document deleted", "Project Deleted");
      callback(data);
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message;
    notifier.error(errorMessage, "Project Deletion Error");
  } finally {
    setLoading(false);
  }
}
