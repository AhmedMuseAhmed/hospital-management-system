'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const [checking, setChecking] = useState(true)

    useEffect(() => {
        const publicRoutes = ['/login']
        const token = localStorage.getItem('token')

        if (publicRoutes.includes(pathname)) {
            setChecking(false)
            return
        }

        if (!token) {
            router.push('/login')
        } else {
            setChecking(false)
        }
    }, [router, pathname])

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                Loading...
            </div>
        )
    }

    return <>{children}</>
}