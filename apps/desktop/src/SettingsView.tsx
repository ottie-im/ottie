import React, { useEffect, useState } from 'react'
import { useAppStore } from './store'
import { OttieSettingsPage } from '@ottie-im/ui'
import { getProfile, setDisplayName, setAvatar, unblockUser, getMatrix } from './services'

export function SettingsView() {
  const { userId, setCurrentView, blockedUsers, setBlockedUsers } = useAppStore()
  const [displayName, setName] = useState(userId ?? '')
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>()

  useEffect(() => {
    getProfile().then(p => {
      setName(p.displayName)
      setAvatarUrl(p.avatarUrl)
    }).catch(() => {})

    // Load blocked users
    try {
      const blocked = getMatrix().getBlockedUsers()
      setBlockedUsers(blocked)
    } catch {}
  }, [setBlockedUsers])

  const handleUpdateName = async (name: string) => {
    await setDisplayName(name)
    setName(name)
  }

  const handleUpdateAvatar = async (file: File) => {
    await setAvatar(file)
    const p = await getProfile()
    setAvatarUrl(p.avatarUrl)
  }

  const handleUnblock = async (uid: string) => {
    await unblockUser(uid)
    const blocked = getMatrix().getBlockedUsers()
    setBlockedUsers(blocked)
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <OttieSettingsPage
        displayName={displayName}
        avatarUrl={avatarUrl}
        userId={userId ?? ''}
        blockedUsers={blockedUsers}
        onUpdateName={handleUpdateName}
        onUpdateAvatar={handleUpdateAvatar}
        onUnblock={handleUnblock}
        onBack={() => setCurrentView('chat')}
      />
    </div>
  )
}
