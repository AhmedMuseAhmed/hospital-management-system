'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'
import Link from 'next/link'
import { Users, Stethoscope, Calendar, Building2, TrendingUp, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

const API_BASE_URL = 'http://127.0.0.1:5000'

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed':
      return 'bg-green-100 text-green-800'
    case 'In Progress':
      return 'bg-blue-100 text-blue-800'
    case 'Scheduled':
      return 'bg-yellow-100 text-yellow-800'
    case 'Confirmed':
      return 'bg-green-100 text-green-800'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'Cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total_patients: 0,
    total_doctors: 0,
    total_appointments: 0,
    total_departments: 0,
  })

  const [appointments, setAppointments] = useState<any[]>([])

  useEffect(() => {
    async function fetchDashboardData() {
      const statsResponse = await fetch(`${API_BASE_URL}/dashboard/stats`)
      const statsData = await statsResponse.json()
      setStats(statsData)

      const appointmentsResponse = await fetch(`${API_BASE_URL}/appointments`)
      const appointmentsData = await appointmentsResponse.json()
      setAppointments(appointmentsData)
    }

    fetchDashboardData()
  }, [])

  const statCards = [
    {
      title: 'Total Patients',
      value: stats.total_patients,
      description: 'Patients registered',
      icon: Users,
      bgGradient: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
    },
    {
      title: 'Total Doctors',
      value: stats.total_doctors,
      description: 'Doctors available',
      icon: Stethoscope,
      bgGradient: 'from-green-500 to-green-600',
      textColor: 'text-green-600',
    },
    {
      title: 'Total Appointments',
      value: stats.total_appointments,
      description: 'Appointments booked',
      icon: Calendar,
      bgGradient: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
    },
    {
      title: 'Departments',
      value: stats.total_departments,
      description: 'Hospital departments',
      icon: Building2,
      bgGradient: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-600',
    },
  ]

  const overviewData = [
    { name: 'Patients', total: stats.total_patients },
    { name: 'Doctors', total: stats.total_doctors },
    { name: 'Appointments', total: stats.total_appointments },
    { name: 'Departments', total: stats.total_departments },
  ]

  return (
    <div className="w-full max-w-none space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back! Here&apos;s your hospital overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 w-full">
        {statCards.map((stat, index) => {
          const Icon = stat.icon

          return (
            <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className="flex items-baseline gap-2 mt-2">
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <TrendingUp className={`h-4 w-4 ${stat.textColor}`} />
                    </div>
                  </div>
                  <div className={`bg-gradient-to-br ${stat.bgGradient} p-2 rounded-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Hospital Overview</CardTitle>
          <CardDescription>Summary of hospital records</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overviewData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total">
                  <Cell fill="#3B82F6" />
                  <Cell fill="#10B981" />
                  <Cell fill="#8B5CF6" />
                  <Cell fill="#F97316" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Appointments</CardTitle>
            <CardDescription>Latest patient appointments</CardDescription>
          </div>
          <Link href="/appointments">
            <Button variant="outline" className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Patient Name</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      {appointment.patient_name}
                    </TableCell>
                    <TableCell>{appointment.doctor_name}</TableCell>
                    <TableCell className="text-sm">
                      {appointment.doctor_specialization}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {appointment.appointment_date}
                    </TableCell>
                    <TableCell>
                      <Badge className={`${getStatusColor(appointment.status)} border-0`}>
                        {appointment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}