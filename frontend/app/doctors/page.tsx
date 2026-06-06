'use client'

import { useEffect, useState } from 'react'

type Doctor = {
    id: number
    full_name: string
    specialization: string
    phone: string
    email: string
}

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<Doctor[]>([])

    const [fullName, setFullName] = useState('')
    const [specialization, setSpecialization] = useState('')
    const [phone, setPhone] = useState('')
    const [email, setEmail] = useState('')

    const [editingId, setEditingId] = useState<number | null>(null)
    const [search, setSearch] = useState('')

    async function fetchDoctors() {
        const response = await fetch('http://127.0.0.1:5000/doctors')
        const data = await response.json()
        setDoctors(data)
    }

    useEffect(() => {
        fetchDoctors()
    }, [])

    function startEdit(doctor: Doctor) {
        setEditingId(doctor.id)
        setFullName(doctor.full_name)
        setSpecialization(doctor.specialization)
        setPhone(doctor.phone)
        setEmail(doctor.email)
    }

    async function saveDoctor(e: React.FormEvent) {
        e.preventDefault()

        if (editingId) {
            await fetch(`http://127.0.0.1:5000/doctors/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({
                    full_name: fullName,
                    specialization,
                    phone,
                    email,
                }),
            })

            setEditingId(null)
        } else {
            await fetch('http://127.0.0.1:5000/doctors', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({
                    full_name: fullName,
                    specialization,
                    phone,
                    email,
                }),
            })
        }

        setFullName('')
        setSpecialization('')
        setPhone('')
        setEmail('')

        fetchDoctors()
    }

    async function deleteDoctor(id: number) {
        const confirmed = window.confirm('Are you sure want to delete this doctor?')

        if (!confirmed) return

        await fetch(`http://127.0.0.1:5000/doctors/${id}`, {
            method: 'DELETE'
        })

        fetchDoctors()
    }

    const filteredDoctors = doctors.filter((doctor) =>
        doctor.full_name.toLowerCase().includes(search.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(search.toLowerCase()) ||
        doctor.phone.toLowerCase().includes(search.toLowerCase()) ||
        doctor.email.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className='space-y-6'>
            <div>
                <h1 className='text-3xl font-bold text-gray-900'>Doctors</h1>
                <p className='mt-2 text-gray-500'>Manage all hospital doctors.</p>
            </div>


            <form
                onSubmit={saveDoctor}
                className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 rounded-2xl bg-white p-6 shadow-sm border'
            >
                <input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Doctor full name"
                    className='border rounded-lg px-4 py-2'
                />
                <input
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    placeholder='specialization'
                    className='border rounded-lg px-4 py-2'
                />
                <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder='Phone'
                    className='border rounded-lg px-4 py-2'
                />

                <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='Email'
                    className='border rounded-lg px-4 py-2'
                />

                <button
                    type="submit"
                    className='rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700'
                >
                    {editingId ? 'Update Doctor' : 'Add Dcotor'}
                </button>
            </form>


            <div className='rounded-2xl bg-white p-6 shadow-sm border'>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search doctors..."
                    className="w-full border rounded-lg px-4 py-2 mb-4"
                />
                <table className='w-full text-left'>
                    <thead>
                        <tr className='border-b bg-gray-50'>
                            <th className='p-3'>ID</th>
                            <th className='p-3'>Full Name</th>
                            <th className='p-3'>Specialization</th>
                            <th className='p-3'>Phone</th>
                            <th className='p-3'>Email</th>
                            <th className='p-3'>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredDoctors.map((doctor) => (
                            <tr key={doctor.id} className='border-b hover:bg-green-50'>
                                <td className='p-3'>{doctor.id}</td>
                                <td className='p-3 font-medium'>{doctor.full_name}</td>
                                <td className='p-3'>{doctor.specialization}</td>
                                <td className='p-3'>{doctor.phone}</td>
                                <td className='p-3'>{doctor.email}</td>
                                <td className='p-3 flex gap-2'>
                                    <button
                                        onClick={() => startEdit(doctor)}
                                        className='rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600'
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => deleteDoctor(doctor.id)}
                                        className='rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600'
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}