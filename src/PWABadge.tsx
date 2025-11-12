import { useState, useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Snackbar, Alert, Button, Chip } from '@mui/material'
import CloudOffIcon from '@mui/icons-material/CloudOff'

function PWABadge() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // check for updates every hour
  const period = 60 * 60 * 1000

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl: string, r: ServiceWorkerRegistration | undefined) {
      if (period <= 0) return
      if (r?.active?.state === 'activated') {
        registerPeriodicSync(period, swUrl, r)
      } else if (r?.installing) {
        r.installing.addEventListener('statechange', (e: Event) => {
          const sw = e.target as ServiceWorker
          if (sw.state === 'activated') registerPeriodicSync(period, swUrl, r!)
        })
      }
    },
  })

  const handleClose = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <>
      {!isOnline && (
        <Chip icon={<CloudOffIcon />} label="Offline" color="warning" variant="filled" />
      )}
      <Snackbar
        open //={offlineReady || needRefresh}
        autoHideDuration={offlineReady ? 6000 : null}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleClose}
          severity={needRefresh ? 'info' : 'success'}
          sx={{ width: '100%' }}
          action={
            needRefresh && (
              <Button color="inherit" size="small" onClick={() => updateServiceWorker(true)}>
                Reload
              </Button>
            )
          }
        >
          {offlineReady
            ? 'App ready to work offline'
            : 'New content available, click on reload button to update.'}
        </Alert>
      </Snackbar>
    </>
  )
}

export default PWABadge

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 */
function registerPeriodicSync(period: number, swUrl: string, r: ServiceWorkerRegistration) {
  if (period <= 0) return

  setInterval(async () => {
    if ('onLine' in navigator && !navigator.onLine) return

    const resp = await fetch(swUrl, {
      cache: 'no-store',
      headers: {
        cache: 'no-store',
        'cache-control': 'no-cache',
      },
    })

    if (resp?.status === 200) await r.update()
  }, period)
}
