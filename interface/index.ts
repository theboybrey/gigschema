export type VoidFunction = () => void;
export type StringFunction = (value: string) => void;
export type NumberFunction = (value: number) => void;
export type BooleanFunction = (value: boolean) => void;
export type ObjectFunction = (value: object) => void;
export type ArrayFunction = (value: any[]) => void;

export type Function<T> = (value: T) => void;

export interface IServerResponse {
  status: number;
  message: string;
  data?: any;
  error?: any;
  success: boolean;
}

export interface IUser {
  _id?: string | string | any;
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin" | "system";
  phone?: string;
  gender: "male" | "female" | "unknown";
  avatar?: string;
  provider: "local" | "google";
  meta: {
    token: string;
    tokenExpires: Date;
    verified: boolean;
    verificationToken: string;
    resetToken: string;
    resetTokenExpires: Date;
  };
  projects: Array<string>;
  chats: Array<string>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChat {
  _id?: string;
  sessionId?: string;
  owner?: string;
  projectId?: string;
  messages: IMessage[] | Array<string>;
  archived?: boolean;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProject {
  _id?: string;
  name: string;
  description: string;
  _schema: any;
  messages: IMessage[];
  owner?: string;
  visibility: "private" | "public";
  schemaType: "sql" | "nosql";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface IAIResponse {
  message: string;
  _schema?: any;
}

export interface ICreateProjectDTO {
  name: string;
  description: string;
  schemaType: "sql" | "nosql";
}

export interface IContinueConversationDTO {
  message: string;
  sessionId?: string;
  schemaType?: "sql" | "nosql";
}
export interface IError extends Error {
  status?: number;
}

export interface AppState {
  user: IUser | null;
  users: IUser[];
  projects: IProject[];
  currentProject: IProject | null;
  chats: IChat[];
  currentChat: IChat | null;
  currentAIResponse: IAIResponse | null;
  currentConversation: IMessage[];
  currentSchema: any | null;
  currentSchemaKeys: string[];
  currentSchemaValues: any[];
  isLoading: boolean;
  error: IError | null;
  token: string | null;
}

export interface ActionType {
  type: string;
  payload?: any;
  meta?: any;
  error?: any;
}
