"use client"

import { Users, Building, Globe, GraduationCap } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StatsSectionProps {
  dict: any
}

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b"]

export function StatsSection({ dict }: StatsSectionProps) {
  const stats = [
    {
      icon: Users,
      value: 500,
      name: dict.stats.government,
      fill: COLORS[0]
    },
    {
      icon: Building,
      value: 900,
      name: dict.stats.privateSector,
      fill: COLORS[1]
    },
    {
      icon: Globe,
      value: 700,
      name: dict.stats.international,
      fill: COLORS[2]
    },
    {
      icon: GraduationCap,
      value: 2000,
      name: dict.stats.youth,
      fill: COLORS[3]
    },
  ]

  const total = stats.reduce((sum, stat) => sum + stat.value, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            {payload[0].value.toLocaleString()} participants
          </p>
          <p className="text-sm text-gray-500">
            {((payload[0].value / total) * 100).toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Participant Statistics
          </h2>
          <p className="text-lg text-gray-600">
            Expected {total.toLocaleString()}+ participants from diverse sectors
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Pie Chart */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Participant Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={stats}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-2 gap-6">
            {stats.map((stat, index) => (
              <Card key={index} className="shadow-md hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: stat.fill + "20" }}
                    >
                      <stat.icon className="w-6 h-6" style={{ color: stat.fill }} />
                    </div>
                    <div className="flex-1">
                      <div className="text-3xl font-bold text-gray-900">
                        {stat.value.toLocaleString()}+
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{stat.name}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div
                          className="h-2 rounded-full flex-1"
                          style={{ backgroundColor: stat.fill + "20" }}
                        >
                          <div
                            className="h-2 rounded-full"
                            style={{
                              backgroundColor: stat.fill,
                              width: `${(stat.value / total) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {((stat.value / total) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
