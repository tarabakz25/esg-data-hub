"use client"

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { ChevronDown } from 'lucide-react'
import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"

// CO2排出量の月次推移データ（サンプル）
const emissionData = [
  { month: "1月", co2: 450, energy: 1200, waste: 85 },
  { month: "2月", co2: 430, energy: 1150, waste: 80 },
  { month: "3月", co2: 480, energy: 1300, waste: 90 },
  { month: "4月", co2: 420, energy: 1100, waste: 75 },
  { month: "5月", co2: 460, energy: 1250, waste: 88 },
  { month: "6月", co2: 440, energy: 1180, waste: 82 },
]

// ESGスコア分布データ（サンプル）
const esgScoreData = [
  { name: "Environmental", value: 75, color: "#10B981" },
  { name: "Social", value: 68, color: "#3B82F6" },
  { name: "Governance", value: 82, color: "#8B5CF6" },
]

// コンプライアンス状況データ（サンプル）
const complianceData = [
  { category: "ISSB", completed: 85, total: 100 },
  { category: "CSRD", completed: 70, total: 100 },
  { category: "GRI", completed: 92, total: 100 },
  { category: "TCFD", completed: 78, total: 100 },
]

export function EmissionTrendChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>CO₂排出量推移</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={emissionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="co2" 
              stroke="#EF4444" 
              strokeWidth={2}
              name="CO₂排出量 (t)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function ESGScoreChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ESGスコア分布</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={esgScoreData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {esgScoreData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center space-x-4 mt-4">
          {esgScoreData.map((item) => (
            <div key={item.name} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600">
                {item.name}: {item.value}%
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function ComplianceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>コンプライアンス進捗</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={complianceData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis dataKey="category" type="category" width={80} />
            <Tooltip />
            <Bar 
              dataKey="completed" 
              fill="#10B981" 
              name="完了率 (%)"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export function EnergyUsageChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>エネルギー使用量推移</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={emissionData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar 
              dataKey="energy" 
              fill="#3B82F6" 
              name="エネルギー使用量 (MWh)"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
} 