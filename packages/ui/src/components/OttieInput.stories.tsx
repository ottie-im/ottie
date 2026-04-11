import React from 'react'
import { OttieInput } from './OttieInput'

export default { title: 'Chat/OttieInput', component: OttieInput }

export const Default = () => (
  <OttieInput onSend={(text) => console.log('Send:', text)} />
)

export const WithAttach = () => (
  <OttieInput onSend={(text) => console.log('Send:', text)} onAttach={(file) => console.log('Attach:', file.name)} />
)

export const WithReply = () => (
  <OttieInput
    onSend={(text) => console.log('Send:', text)}
    replyingTo={{ sender: '@bob:ottie.claws.company', body: '那家新开的川菜馆怎么样？' }}
    onCancelReply={() => console.log('Cancel reply')}
  />
)

export const Disabled = () => (
  <OttieInput onSend={() => {}} disabled />
)
