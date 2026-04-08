import React from 'react'
import { useAppStore } from './store'
import { OttieLogin } from '@ottie-im/ui'
import { MainLayout } from './MainLayout'

export function App() {
  const { loggedIn, setLoggedIn } = useAppStore()

  const handleLogin = (username: string, _password: string) => {
    // TODO: integrate with OttieMatrix.login()
    setLoggedIn(`@${username}:localhost`)
  }

  const handleRegister = (username: string, _password: string) => {
    // TODO: integrate with OttieMatrix.register()
    setLoggedIn(`@${username}:localhost`)
  }

  if (!loggedIn) {
    return <OttieLogin onLogin={handleLogin} onRegister={handleRegister} />
  }

  return <MainLayout />
}
