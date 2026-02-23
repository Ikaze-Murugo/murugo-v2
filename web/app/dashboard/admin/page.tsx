"use client";

import { useState } from "react";
import { 
  Users, Home, TrendingUp, DollarSign, Eye, MessageSquare, 
  Calendar, MapPin, Award, Activity 
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";

// Mock data - replace with real API calls
const platformStats = {
  totalUsers: 1247,
  totalProperties: 856,
  activeListings: 623,
  totalRevenue: 45680,
  monthlyGrowth: 12.5,
  avgResponseTime: "2.4h",
};

const userGrowthData = [
  { month: "Jan", users: 850, properties: 620 },
  { month: "Feb", users: 920, properties: 680 },
  { month: "Mar", users: 1050, properties: 750 },
  { month: "Apr", users: 1150, properties: 810 },
  { month: "May", users: 1200, properties: 840 },
  { month: "Jun", users: 1247, properties: 856 },
];

const propertyTypeData = [
  { name: "House", value: 320, color: "#949DDB" },
  { name: "Apartment", value: 280, color: "#7B85CB" },
  { name: "Condo", value: 150, color: "#A8B0E5" },
  { name: "Land", value: 80, color: "#6B75BB" },
  { name: "Commercial", value: 26, color: "#5A64AB" },
];

const transactionData = [
  { name: "For Sale", value: 520, color: "#949DDB" },
  { name: "For Rent", value: 336, color: "#7B85CB" },
];

const topPropertiesData = [
  { id: "1", title: "Luxury Villa in Kigali", views: 1250, inquiries: 45, price: "$450,000" },
  { id: "2", title: "Modern Apartment Downtown", views: 980, inquiries: 38, price: "$180,000" },
  { id: "3", title: "Commercial Space Nyarugenge", views: 875, inquiries: 32, price: "$320,000" },
  { id: "4", title: "Family Home Kimihurura", views: 720, inquiries: 28, price: "$275,000" },
  { id: "5", title: "Studio Apartment Remera", views: 650, inquiries: 25, price: "$95,000" },
];

const locationData = [
  { location: "Kigali", count: 450 },
  { location: "Nyarugenge", count: 180 },
  { location: "Gasabo", count: 120 },
  { location: "Kicukiro", count: 85 },
  { location: "Other", count: 21 },
];

const recentActivityData = [
  { time: "2 min ago", user: "John Doe", action: "Listed new property", property: "Modern Villa" },
  { time: "15 min ago", user: "Jane Smith", action: "Inquired about", property: "Downtown Apartment" },
  { time: "1 hour ago", user: "Mike Johnson", action: "Favorited", property: "Family Home" },
  { time: "2 hours ago", user: "Sarah Williams", action: "Updated listing", property: "Commercial Space" },
  { time: "3 hours ago", user: "David Brown", action: "Registered as", property: "New Lister" },
];

export default function AdminDashboardPage() {
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fafaf8] to-[#f5f5f3] py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Analytics Dashboard</h1>
          <p className="text-sm text-gray-600">Platform performance and insights</p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-6 flex gap-2">
          {(["7d", "30d", "90d", "1y"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors ${
                timeRange === range
                  ? "bg-gradient-to-r from-[#949DDB] to-[#7B85CB] text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {range === "7d" && "Last 7 Days"}
              {range === "30d" && "Last 30 Days"}
              {range === "90d" && "Last 90 Days"}
              {range === "1y" && "Last Year"}
            </button>
          ))}
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            icon={<Users className="h-5 w-5" />}
            title="Total Users"
            value={platformStats.totalUsers.toLocaleString()}
            change="+12.5%"
            positive
          />
          <MetricCard
            icon={<Home className="h-5 w-5" />}
            title="Total Properties"
            value={platformStats.totalProperties.toLocaleString()}
            change="+8.3%"
            positive
          />
          <MetricCard
            icon={<TrendingUp className="h-5 w-5" />}
            title="Active Listings"
            value={platformStats.activeListings.toLocaleString()}
            change="+15.2%"
            positive
          />
          <MetricCard
            icon={<DollarSign className="h-5 w-5" />}
            title="Total Revenue"
            value={`$${platformStats.totalRevenue.toLocaleString()}`}
            change="+22.1%"
            positive
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* User & Property Growth */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">User & Property Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#949DDB" strokeWidth={2} name="Users" />
                <Line type="monotone" dataKey="properties" stroke="#7B85CB" strokeWidth={2} name="Properties" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Property Types Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Property Types Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={propertyTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {propertyTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Location Distribution */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Properties by Location</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="location" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#949DDB" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Transaction Types */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Transaction Types</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={transactionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${percent ? (percent * 100).toFixed(0) : 0}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {transactionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Properties Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="h-4 w-4 text-[#949DDB]" />
            Top Performing Properties
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Property</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Views</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Inquiries</th>
                  <th className="text-left text-xs font-medium text-gray-600 pb-3">Price</th>
                </tr>
              </thead>
              <tbody>
                {topPropertiesData.map((property, index) => (
                  <tr key={property.id} className="border-b border-gray-100 last:border-0">
                    <td className="py-3 text-sm text-gray-900">{property.title}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Eye className="h-3.5 w-3.5" />
                        {property.views.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {property.inquiries}
                      </div>
                    </td>
                    <td className="py-3 text-sm font-semibold text-[#949DDB]">{property.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 text-[#949DDB]" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {recentActivityData.map((activity, index) => (
              <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#949DDB] mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span>{" "}
                    <span className="text-gray-600">{activity.action}</span>{" "}
                    <span className="font-medium">{activity.property}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  positive: boolean;
}

function MetricCard({ icon, title, value, change, positive }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="p-2 bg-gradient-to-br from-[#949DDB]/10 to-[#7B85CB]/10 rounded-lg text-[#949DDB]">
          {icon}
        </div>
        <span className={`text-xs font-medium ${positive ? "text-green-600" : "text-red-600"}`}>
          {change}
        </span>
      </div>
      <h3 className="text-xs font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}
