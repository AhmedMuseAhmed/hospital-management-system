'use client'

import { useEffect, useState } from 'react'

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        const storedUser = localStorage.getItem('user')

        if (storedUser) {
            setUser(JSON.parse(storedUser))
        }
    }, [])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                <p className="mt-2 text-gray-500">Your account information</p>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border max-w-xl">
                <p><strong>Full Name:</strong> {user?.full_name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Role:</strong> {user?.role}</p>
                <p><strong>User ID:</strong> {user?.id}</p>
            </div>
        </div>
    )
}