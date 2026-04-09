import React from 'react'
import { OttieLogin } from './OttieLogin'

export default { title: 'Pages/OttieLogin', component: OttieLogin }

export const Default = () => (
  <OttieLogin onLogin={(u, p) => alert(`Login: ${u}`)} onRegister={(u, p) => alert(`Register: ${u}`)} />
)

export const Loading = () => (
  <OttieLogin onLogin={() => {}} loading />
)

export const WithError = () => (
  <OttieLogin onLogin={() => {}} error="用户名或密码错误" />
)
