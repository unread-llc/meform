"use client"

import { Users, Building, Globe, GraduationCap } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { motion } from "framer-motion"

interface StatsSectionProps {
  dict: any
}

const COLORS = ["#0056b3", "#2563eb", "#60a5fa", "#93c5fd"] // Different shades of blue

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
        <div className="bg-background/95 backdrop-blur-sm p-4 rounded-xl shadow-xl border border-border/50">
          <p className="font-semibold text-foreground">{payload[0].name}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-muted-foreground">
              {payload[0].value.toLocaleString()} {dict.stats.participants}
            </span>
            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
              {((payload[0].value / total) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <section className="py-24 bg-gradient-to-b from-muted/30 via-background to-background overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute -top-[200px] -right-[200px] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-[200px] -left-[200px] w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-6 tracking-tight">
              {dict.stats.title}
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {dict.stats.description}
            </p>
          </motion.div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Pie Chart */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="border-border/50 shadow-2xl bg-card/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b border-border/50 bg-muted/20">
                <CardTitle>{dict.stats.chartTitle}</CardTitle>
                <CardDescription>{dict.stats.chartDesc}</CardDescription>
              </CardHeader>
              <CardContent className="p-6 sm:p-10">
                <div className="h-[400px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats}
                        cx="50%"
                        cy="50%"
                        innerRadius={70}
                        outerRadius={120}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="none"
                      >
                        {stats.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={entry.fill}
                            className="hover:opacity-80 transition-opacity duration-300 cursor-pointer"
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={(value) => <span className="text-foreground font-medium ml-1">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Stats Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-border/50 overflow-hidden group">
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
                    style={{ backgroundColor: stat.fill }}
                  />
                  <CardContent className="p-6">
                    <div className="flex items-start gap-5">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"
                        style={{ backgroundColor: stat.fill + "15" }}
                      >
                        <stat.icon className="w-7 h-7" style={{ color: stat.fill }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between mb-1">
                          <div className="text-2xl font-bold text-foreground truncate">
                            {stat.value.toLocaleString()}+
                          </div>
                          <div className="text-sm font-medium text-muted-foreground">
                            {((stat.value / total) * 100).toFixed(0)}%
                          </div>
                        </div>
                        <p className="text-sm font-medium text-muted-foreground mb-3 truncate">{stat.name}</p>
                        <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: stat.fill }}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${(stat.value / total) * 100}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: "easeOut", delay: 0.5 + index * 0.1 }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
