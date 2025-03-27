"use client"
import NewChatFragment from '../new-chat'
import React from 'react'
import { cx } from '@/lib/utils'
import { useStateValue } from '@/global/state.provider'
import { FetchAllProjects } from '@/app/api/services/project.service'
import { FetchAllChats } from '@/app/api/services/chat.service'

type Props = {}

const HeaderFragment = (props: Props) => {
    const { state, dispatch } = useStateValue()
    const { user, projects, currentChat, chats } = state

    React.useEffect(() => {
        
    }, [])

    return (
        <div className={cx('flex', 'justify-between', 'items-center', 'p-4', 'bg-transparent', 'text-muted-foreground')}>
            <NewChatFragment />
        </div>
    )
}

export default HeaderFragment