import { notifier } from "@/components/notifier";
import { IUser } from "@/interface/";
import Axios from "../axios";

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user: IUser;
}

export async function LoginAccount(
  credentials: Partial<LoginData>,
  setLoading: (loading: boolean) => void,
  callback: (response: LoginResponse) => void
) {
  try {
    const response = await Axios({
      url: "/user/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: credentials,
    });

    const data = response.data as LoginResponse;

    if (data && data.user) {
      notifier.success(data.message, "Login Successful");
      callback(data);
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error?.message;
    notifier.error(errorMessage, "Authentication Error");
  } finally {
    setLoading(false);
  }
}

export async function LogoutAccount(
  token: string,
  sessionId: string,
  setLoading: (loading: boolean) => void,
  callback: () => void
) {
  setLoading(true);

  try {
    const response = await Axios.post(
      `/user/logout/${sessionId}`,
      {},
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { data } = response;

    if (!data.success) {
      notifier.error(
        data?.message || "Encountered an error while logging out",
        "Logout Failed"
      );
    } else {
      callback();
    }
  } catch (error: any) {
    notifier.error(
      error?.response?.data?.message ||
        error?.message ||
        "Encountered an error while logging out",
      "Bad Server Request"
    );
  } finally {
    setLoading(false);
  }
}

/**
 * @function RegisterAccount
 * @param {Partial<IUser>} data
 */
export async function RegisterAccount(
  info: Partial<IUser>,
  setLoading: (loading: boolean) => void,
  callback: (e: any) => void
) {
  setLoading(true);
  try {
    const { data } = await Axios({
      url: `/user/`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: info,
    });

    setLoading(false);
    notifier.success(
      `Now let's get you verified buddy!`,
      `Registration Successful`
    );
    callback(data);
  } catch (error: any) {
    notifier.error(
      error?.message ||
        error?.response?.data?.message ||
        `Encountered an error during account registration`,
      `Bad Server Request`
    );
  } finally {
    setLoading(false);
  }
}

export async function VerifyAccount(
  token: string,
  setLoading: (loading: boolean) => void,
  callback: (e: any) => void
) {
  setLoading(true);
  try {
    const { data } = await Axios({
      url: `/user/verify-email/${token}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    setLoading(false);
    notifier.success(
      `You passed the verification test!`,
      `Verification Successful`
    );
    callback(data);
  } catch (error: any) {
    notifier.error(
      error?.message ||
        error?.response?.data?.message ||
        `Encountered an error during account verification`,
      `Bad Server Request`
    );
  } finally {
    setLoading(false);
  }
}

export async function VerifyOTP(
  token: string,
  code: string,
  setLoading: (loading: boolean) => void,
  callback: (e: any) => void
) {
  setLoading(true);
  try {
    const { data } = await Axios({
      url: `/user/verify/otp`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      data: { code },
    });

    setLoading(false);
    notifier.success(
      `You passed the verification test!`,
      `Verification Successful`
    );
    callback(data);
  } catch (error: any) {
    notifier.error(
      error?.message ||
        error?.response?.data?.message ||
        `Encountered an error during account verification`,
      `Bad Server Request`
    );
  } finally {
    setLoading(false);
  }
}

export async function ForgotPassword(
  email: string,
  setLoading: (loading: boolean) => void,
  callback: (e: any) => void
) {
  try {
    const { data } = await Axios({
      url: `/user/forgot-password`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: { email },
    });
    if (!data.success) {
      setLoading(false);
      notifier.error(
        data?.message || `Encountered an error while processing request`,
        `Bad Server Request`
      );
    }
    callback(data?.data);
  } catch (error: any) {
    notifier.error(
      error?.message ||
        error?.response?.data?.message ||
        `Encountered an error while processing your request`,
      `Bad Server Request`
    );
  } finally {
    setLoading(false);
  }
}

export async function ResetPassword(
  token: string,
  password: string,
  setLoading: (loading: boolean) => void,
  callback: (e: any) => void
) {
  try {
    const { data } = await Axios({
      url: `/auth/reset-password/${token}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      data: { password },
    });
    if (!data.success) {
      setLoading(false);
      notifier.error(
        data?.message || `Security update failed for password reset`,
        `Password Reset Failed`
      );
    }
    callback(data?.data);
  } catch (error: any) {
    notifier.error(
      error?.message ||
        error?.response?.data?.message ||
        `Something went wrong during password reset`,
      `Password Reset Failed`
    );
  } finally {
    setLoading(false);
  }
}
