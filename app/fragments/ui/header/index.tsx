"use client";
import NewChatFragment from "../new-chat";
import React from "react";
import { cx } from "@/lib/utils";
import { useStateValue } from "@/global/state.provider";
import { GetProjects } from "@/app/api/services/project.service";
import { GetChats } from "@/app/api/services/chat.service";
import { AuthContext } from "@/context/auth.context";

type Props = {};

const HeaderFragment = (props: Props) => {
    const [loading, setLoading] = React.useState(false);
    const { state, dispatch } = useStateValue();
    const { user, projects, currentChat, chats, token } = state;

    const authContext = React.useContext(AuthContext);
    if (!authContext) throw new Error("HeaderFragment must be used within AuthProvider");

    const { token: authToken } = authContext;

    React.useEffect(() => {
        const effectiveToken = authToken || token;
        if (effectiveToken) {
            setLoading(true);
            GetProjects(
                effectiveToken,
                setLoading,
                (data) => {
                    if (data.projects) {
                        const flattenedProjects = data.projects.flat();
                        dispatch({ type: "SET_PROJECTS", payload: flattenedProjects });
                    } else {
                        console.error("Projects data is undefined or empty");
                    }
                    setLoading(false);
                },

            );

            GetChats(
                effectiveToken,
                setLoading,
                (data) => {
                    if (data.chats) {
                        const flattenedChats = data.chats.flat();
                        dispatch({
                            type: "SET_CHATS",
                            payload: flattenedChats
                        });
                    } else {
                        console.error("Chats data is undefined or empty");
                    }
                    setLoading(false);
                },
            );

        } else {
            console.error("Token is null or undefined");
        }
    }, [authToken, token, dispatch]);

    return (
        <div
            className={cx(
                "flex",
                "justify-between",
                "items-center",
                "p-4",
                "bg-gray-900",
                "text-white",
                "border-b",
                "border-gray-800"
            )}
        >
            <div className="flex items-center space-x-2">
                <span className="text-xl font-bold"></span>
                {loading && <span className="animate-pulse text-sm text-gray-400">Loading...</span>}
            </div>
            <NewChatFragment />
        </div>
    );
};

export default HeaderFragment;