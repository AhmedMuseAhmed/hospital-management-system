'use client'

import { useEffect, useState } from 'react'

type Department = {
    id: number
    name: string
    description: string
}

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([])

    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [editingId, setEditingId] = useState<number | null>(null)
    const [search, setSearch] = useState('')

    async function fetchDepartments() {
        const response = await fetch('http://127.0.0.1:5000/departments')
        const data = await response.json()
        setDepartments(data)
    }

    useEffect(() => {
        fetchDepartments()
    }, [])

    function startEdit(department: Department) {
        setEditingId(department.id)
        setName(department.name)
        setDescription(department.description)
    }

    async function saveDepartment(e: React.FormEvent) {
        e.preventDefault()

        if (editingId) {
            await fetch(`http://127.0.0.1:5000/departments/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    description,
                }),
            })

            setEditingId(null)
        } else {
            await fetch('http://127.0.0.1:5000/departments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    description,
                }),
            })
        }

        setName('')
        setDescription('')

        fetchDepartments()
    }

    async function deleteDepartment(id: number) {
        const confirmed = window.confirm(
            'Are you sure you want to delete this department?'
        )

        if (!confirmed) return

        await fetch(`http://127.0.0.1:5000/departments/${id}`, {
            method: 'DELETE',
        })

        fetchDepartments()
    }

    const filteredDepartments = departments.filter((department) =>
        department.name.toLowerCase().includes(search.toLowerCase()) ||
        department.description.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
                <p className="mt-2 text-gray-500">
                    Manage hospital departments and specialties.
                </p>
            </div>

            <form
                onSubmit={saveDepartment}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-2xl bg-white p-6 shadow-sm border"
            >
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Department name"
                    className="border rounded-lg px-4 py-2"
                />

                <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description"
                    className="border rounded-lg px-4 py-2"
                />

                <button
                    type="submit"
                    className="rounded-lg bg-orange-600 px-4 py-2 text-white hover:bg-orange-700"
                >
                    {editingId ? 'Update Department' : 'Add Department'}
                </button>
            </form>

            <div className="rounded-2xl bg-white p-6 shadow-sm border">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search departments..."
                    className="w-full border rounded-lg px-4 py-2 mb-4"
                />
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b bg-gray-50">
                            <th className="p-3">ID</th>
                            <th className="p-3">Department Name</th>
                            <th className="p-3">Description</th>
                            <th className="p-3">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredDepartments.map((department) => (
                            <tr key={department.id} className="border-b hover:bg-orange-50">
                                <td className="p-3">{department.id}</td>
                                <td className="p-3 font-medium">{department.name}</td>
                                <td className="p-3">{department.description}</td>
                                <td className="p-3 flex gap-2">
                                    <button
                                        onClick={() => startEdit(department)}
                                        className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() => deleteDepartment(department.id)}
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