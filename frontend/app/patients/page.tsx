'use client'


import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

type Patient = {
    id: number
    full_name: string
    age: number
    gender: string
    phone: string
    address: string
}


export default function PatientsPage() {
    const [patients, setPatients] = useState<Patient[]>([])
    const [fullName, setFullName] = useState('')
    const [age, setAge] = useState('')
    const [gender, setGender] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')
    const [editingId, setEditingId] = useState<number | null>(null)
    const [search, setSearch] = useState('')

    useEffect(() => {
        async function fetchPatients() {
            const response = await fetch('http://127.0.0.1:5000/patients')
            const data = await response.json()
            setPatients(data)
        }

        fetchPatients()
    }, [])

    async function deletePatient(id: number) {

        const confirmed = window.confirm(
            "Are you sure you want to delete this patient?"
        )

        if (!confirmed) return

        try {
            await fetch(`http://127.0.0.1:5000/patients/${id}`, {
                method: 'DELETE',
            })
            toast.success('Patient deleted successfully')

            const response = await fetch(
                'http://127.0.0.1:5000/patients'
            )

            const data = await response.json()

            setPatients(data)

        } catch (error) {
            console.error(error)
            alert('Backend server is not running or patient has related appointments.')
        }
    }

    function startEdit(patient: Patient) {
        setEditingId(patient.id)
        setFullName(patient.full_name)
        setAge(String(patient.age))
        setGender(patient.gender)
        setPhone(patient.phone)
        setAddress(patient.address)
    }

    async function addPatient(e: React.FormEvent) {
        e.preventDefault()

        if (editingId) {
            await fetch(`http://127.0.0.1:5000/patients/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({
                    full_name: fullName,
                    age: Number(age),
                    gender,
                    phone,
                    address,
                }),
            })
            toast.success('Patient updated successfully')

            setEditingId(null)
        } else {
            await fetch('http://127.0.0.1:5000/patients', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify({
                    full_name: fullName,
                    age: Number(age),
                    gender,
                    phone,
                    address,
                }),
            })
            toast.success('Patient added successfully')
        }
        setFullName('')
        setAge('')
        setGender('')
        setPhone('')
        setAddress('')

        const response = await fetch('http://127.0.0.1:5000/patients')
        const data = await response.json()
        setPatients(data)
    }

    const filteredPatients = patients.filter((patient) =>
        patient.full_name.toLowerCase().includes(search.toLowerCase()) ||
        patient.phone.toLowerCase().includes(search.toLowerCase()) ||
        patient.gender.toLowerCase().includes(search.toLowerCase()) ||
        (patient.address || '').toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
                <p className="mt-2 text-gray-500">
                    Manage all registered hospital patients
                </p>
            </div>

            {/* Form Card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                    {editingId ? 'Update Patient' : 'Add New Patient'}
                </h2>

                <form
                    onSubmit={addPatient}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                >
                    <input
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Full name"
                        className="border rounded-lg px-4 py-2"
                    />

                    <input
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="Age"
                        type="number"
                        className="border rounded-lg px-4 py-2"
                    />

                    <input
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        placeholder="Gender"
                        className="border rounded-lg px-4 py-2"
                    />

                    <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone"
                        className="border rounded-lg px-4 py-2"
                    />

                    <input
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Address"
                        className="border rounded-lg px-4 py-2"
                    />

                    <button
                        type="submit"
                        className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                    >
                        {editingId ? 'Update Patient' : 'Add Patient'}
                    </button>
                </form>
            </div>

            {/* Table Card */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border">
                <div className="mb-4 flex items-center justify-between gap-4">

                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search patients..."
                        className="w-full border rounded-lg px-4 py-2"

                    />
                </div>

                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="p-3">ID</th>
                            <th className="p-3">Full Name</th>
                            <th className="p-3">Age</th>
                            <th className="p-3">Gender</th>
                            <th className="p-3">Phone</th>
                            <th className="p-3">Address</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredPatients.map((patient) => (
                            <tr key={patient.id} className="border-b hover:bg-blue-50">
                                <td className="p-3">{patient.id}</td>
                                <td className="p-3 font-medium">{patient.full_name}</td>
                                <td className="p-3">{patient.age}</td>
                                <td className="p-3">{patient.gender}</td>
                                <td className="p-3">{patient.phone}</td>
                                <td className="p-3">{patient.address}</td>
                                <td className="p-3 flex gap-2">
                                    <button
                                        onClick={() => startEdit(patient)}
                                        className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => deletePatient(patient.id)}
                                        className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
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