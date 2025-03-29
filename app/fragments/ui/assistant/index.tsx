"use client"
import React from 'react'
import HeaderFragment from '../header'
import { TextAreaFragment, ChatRoomFragment } from '../textarea'



type Props = {}

const SchemaAssistant = (props: Props) => {
  return (
    <div>
      <HeaderFragment />
      <ChatRoomFragment />
    </div>
  )
}

export default SchemaAssistant


