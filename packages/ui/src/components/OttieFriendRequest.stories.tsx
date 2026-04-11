import React from 'react'
import { OttieFriendRequest } from './OttieFriendRequest'

export default { title: 'Social/OttieFriendRequest', component: OttieFriendRequest }

export const Default = () => (
  <OttieFriendRequest
    name="Alice"
    userId="@alice:ottie.claws.company"
    onAccept={() => console.log('Accepted')}
    onReject={() => console.log('Rejected')}
  />
)

export const WithMessage = () => (
  <OttieFriendRequest
    name="Bob"
    userId="@bob:ottie.claws.company"
    message="Hi! 我是你的同事 Bob，加个好友吧"
    onAccept={() => console.log('Accepted')}
    onReject={() => console.log('Rejected')}
  />
)
