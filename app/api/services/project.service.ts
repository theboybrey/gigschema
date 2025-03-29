import { notifier } from "@/components/notifier";
import { IContinueConversationDTO, IProject } from "@/interface/";
import Axios from "../axios";

interface ApiResponse<T> {
  project?: T;
  projects?: T[];
  message?: string;
}

export const CreateProject = async (
  info: { name: string; description: string; schemaType: "sql" | "nosql" },
  token: string,
  setLoading: (loading: boolean) => void,
  callback: (response: ApiResponse<IProject>) => void
) => {
  setLoading(true);
  try {
    const response = await Axios.post<ApiResponse<IProject>>("/project", info, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const data = response.data;
    if (data.project) {
      notifier.success("New schema document created", "Project Created");
      callback(data);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message || error?.message || "Unknown error";
    notifier.error(errorMessage, "Project Creation Error");
    throw error;
  } finally {
    setLoading(false);
  }
};

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      url: "/project",
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message;
    notifier.error(errorMessage, "Project Deletion Error");
  } finally {
    setLoading(false);
  }
}
