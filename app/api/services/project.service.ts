import { RetryOperation } from "@/helper/operation.retry";
import {
    IContinueConversationDTO,
    ICreateProjectDTO,
    IProject,
} from "@/interface/";
import Axios from "../axios";

interface ApiResponse<T> {
  project?: T;
  projects?: T[];
  message?: string;
}

export const FetchAllProjects = async (): Promise<IProject[]> => {
  const operation = async () => {
    const response = await Axios.get<ApiResponse<IProject>>("/project");
    return response.data.projects || [];
  };
  return RetryOperation(operation);
};

export const FetchProjectById = async (id: string): Promise<IProject> => {
  const operation = async () => {
    const response = await Axios.get<ApiResponse<IProject>>(`/project/${id}`);
    if (!response.data.project) throw new Error("Project not found");
    return response.data.project;
  };
  return RetryOperation(operation);
};

export const CreateProject = async (
  data: ICreateProjectDTO
): Promise<IProject> => {
  const operation = async () => {
    const response = await Axios.post<ApiResponse<IProject>>("/project", data);
    if (!response.data.project) throw new Error("Failed to create project");
    return response.data.project;
  };
  return RetryOperation(operation);
};

export const UpdateProject = async (
  id: string,
  data: Partial<ICreateProjectDTO> & { _schema?: any }
): Promise<IProject> => {
  const operation = async () => {
    const response = await Axios.put<ApiResponse<IProject>>(
      `/project/${id}`,
      data
    );
    if (!response.data.project) throw new Error("Failed to update project");
    return response.data.project;
  };
  return RetryOperation(operation);
};

export const DeleteProject = async (id: string): Promise<void> => {
  const operation = async () => {
    const response = await Axios.delete<ApiResponse<never>>(`/project/${id}`);
    if (response.data.message !== "Project deleted successfully") {
      throw new Error("Failed to delete project");
    }
  };
  return RetryOperation(operation);
};

export const ContinueConversation = async (
  id: string,
  data: IContinueConversationDTO
): Promise<IProject> => {
  const operation = async () => {
    const response = await Axios.post<ApiResponse<IProject>>(
      `/project/${id}/conversation`,
      data
    );
    if (!response.data.project)
      throw new Error("Failed to continue conversation");
    return response.data.project;
  };
  return RetryOperation(operation);
};
