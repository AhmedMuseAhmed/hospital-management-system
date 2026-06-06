'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { serialize } from 'v8'

export default function LoginPage() {
    const router = useRouter()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()

        const response = await fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })

        const data = await response.json()

        if (!response.ok) {
            toast.error(data.error || 'Login failed')
            return
        }

        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify(data.user))

        toast.success('Login successful')
        router.push('/dashboard')
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-100 px-4'>
            <form
                onSubmit={handleLogin}
                className='w-full max-w-md rounded-2xl bg-white p-8 shadow-sm border'
            >
                <h1 className='text-3xl font-bold text-gray-900'>Login</h1>
                <p className='mt-2 text-gray-500'>
                    Access Hospital Management System</p>
                <div className='mt-6 space-y-4'>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder='email'
                        type='email'
                        className='w-full border rounded-lg px-4 py-2'
                    />

                    <input
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder='Password'
                        type='password'
                        className='w-full border rounded-lg px-4 py-2'
                    />

                    <button
                        type='submit'
                        className='w-full rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700'
                    >
                        Login
                    </button>
                </div>
            </form>
        </div>
    )
}