'use client'

import { useEffect, useState } from 'react'

type Appointment = {
    id: number
    patient_id: number
    patient_name: string
    doctor_id: number
    doctor_name: string
    doctor_specialization: string
    appointment_date: string
    status: string
}

type Patient = {
    id: number
    full_name: string
}

type Doctor = {
    id: number
    full_name: string
    specialization: string
}

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<Appointment[]>([])

    const [patientId, setPatientId] = useState('')
    const [doctorId, setDoctorId] = useState('')
    const [appointmentDate, setAppointmentDate] = useState('')
    const [status, setStatus] = useState('Pending')
    const [patients, setPatients] = useState<Patient[]>([])
    const [doctors, setDoctors] = useState<Doctor[]>([])
    const [search, setSearch] = useState('')

    const [editingId, setEditingId] = useState<number | null>(null)

    async function fetchAppointments() {
        const response = await fetch('http://127.0.0.1:5000/appointments')
        const data = await response.json()
        setAppointments(data)
    }

    async function fetchPatients() {
        const response = await fetch('http://127.0.0.1:5000/patients')
        const data = await response.json()
        setPatients(data)
    }

    async function fetchDoctors() {
        const response = await fetch('http://127.0.0.1:5000/doctors')
        const data = await response.json()
        setDoctors(data)
    }

    useEffect(() => {
        fetchAppointments()
        fetchPatients()
        fetchDoctors()
    }, [])

    function startEdit(appointment: Appointment) {
        setEditingId(appointment.id)
        setPatientId(String(appointment.patient_id))
        setDoctorId(String(appointment.doctor_id))
        setAppointmentDate(appointment.appointment_date)
        setStatus(appointment.status)
    }

    async function saveAppointment(e: React.FormEvent) {
        e.preventDefault()

        const appointmentData = {
            patient_id: Number(patientId),
            doctor_id: Number(doctorId),
            appointment_date: appointmentDate,
            status,
        }

        if (editingId) {
            await fetch(`http://127.0.0.1:5000/appointments/${editingId}`, {
                method: 'PUT',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify(appointmentData),
            })

            setEditingId(null)
        } else {
            await fetch('http://127.0.0.1:5000/appointments', {
                method: 'POST',
                headers: {
                    'Content-type': 'application/json',
                },
                body: JSON.stringify(appointmentData),
            })
        }

        setPatientId('')
        setDoctorId('')
        setAppointmentDate('')
        setStatus('Pending')

        fetchAppointments()
    }

    async function deleteAppointment(id: number) {
        const confirmed = window.confirm(
            'Are you sure you want to delete this appointment?'
        )

        if (!confirmed) return

        await fetch(`http://127.0.0.1:5000/appointments/${id}`, {
            method: 'DELETE',
        })

        fetchAppointments()
    }

    async function updateStatus(id: number, newStatus: string) {
        await fetch(`http://127.0.0.1:5000/appointments/${id}`, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json',
            },
            body: JSON.stringify({
                status: newStatus,
            }),
        })

        fetchAppointments()
    }

    const filteredAppointments = appointments.filter((appointment) =>
        appointment.patient_name.toLowerCase().includes(search.toLowerCase()) ||
        appointment.doctor_name.toLowerCase().includes(search.toLowerCase()) ||
        appointment.doctor_specialization.toLowerCase().includes(search.toLowerCase()) ||
        appointment.status.toLowerCase().includes(search.toLowerCase()) ||
        appointment.appointment_date.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className='space-y-6'>
            <div>
                <h1 className='text-3xl font-bold text-gray-900'>
                    Appointments
                </h1>
                <p className='mt-2 text-gray-500'>
                    Manage patient appointments with doctors.
                </p>
            </div>

            <form
                onSubmit={saveAppointment}
                className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 rounded-2xl bg-white p-6 shadow-sm border'
            >
                <select
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="border rounded-lg px-4 py-2"
                >
                    <option value="">Select Patient</option>
                    {patients.map((patient) => (
                        <option key={patient.id} value={patient.id}>
                            {patient.full_name}
                        </option>
                    ))}
                </select>

                <select
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="border rounded-lg px-4 py-2"
                >
                    <option value="">Select Doctor</option>
                    {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                            {doctor.full_name} - {doctor.specialization}
                        </option>
                    ))}
                </select>

                <input
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    placeholder='Appointment date'
                    className='border  rounded-lg px-4 py-2'
                />

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className='border rounded-lg px-4 py-2'
                >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                </select>

                <button
                    type='submit'
                    className='rounded-lg bg-purple-600 px-4 py-2 text-white hover:bg-purple-700'
                >
                    {editingId ? 'Update Appointment' : 'Book Appointment'}
                </button>
            </form>

            <div className='rounded-2xl bg-white p-6 shadow-sm border'>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search appointments..."
                    className="w-full border rounded-lg px-4 py-2 mb-4"
                />
                <table className='w-full text-left'>
                    <thead>
                        <tr className='border-b bg-gray-50'>
                            <th className='p-3'>ID</th>
                            <th className='p-3'>Patient</th>
                            <th className='p-3'>Doctor</th>
                            <th className='p-3'>Specialization</th>
                            <th className='p-3'>Date</th>
                            <th className='p-3'>Status</th>
                            <th className='p-3'>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {filteredAppointments.map((appointment) => (
                            <tr key={appointment.id} className='border-b hover:bg-purple-50'>
                                <td className='p-3'>{appointment.id}</td>
                                <td className='p-3 font-medium'>{appointment.patient_name}</td>
                                <td className='p-3'>{appointment.doctor_name}</td>
                                <td className='p-3'>{appointment.doctor_specialization}</td>
                                <td className='p-3'>{appointment.appointment_date}</td>
                                <td className='p-3'>{appointment.status}</td>
                                <td className='p-3 flex flex-wrap gap-2'>

                                    <button
                                        onClick={() => startEdit(appointment)}
                                        className='rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600'
                                    >
                                        Edit
                                    </button>

                                    {appointment.status === 'Pending' && (
                                        <button
                                            onClick={() => updateStatus(appointment.id, 'Confirmed')}
                                            className='rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600'
                                        >
                                            Confirm
                                        </button>
                                    )}

                                    {appointment.status === 'Confirmed' && (
                                        <button
                                            onClick={() => updateStatus(appointment.id, 'Completed')}
                                            className='rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600'
                                        >
                                            Complete
                                        </button>
                                    )}

                                    {(appointment.status === 'Pending' || appointment.status === 'Confirmed') && (
                                        <button
                                            onClick={() => updateStatus(appointment.id, 'Cancelled')}
                                            className='rounded bg-gray-600 px-3 py-1 text-white hover:bg-gray-700'
                                        >
                                            Cancel
                                        </button>
                                    )}

                                    <button
                                        onClick={() => deleteAppointment(appointment.id)}
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