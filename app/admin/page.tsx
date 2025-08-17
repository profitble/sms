"use client";

import { Button } from '../../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

export default function AdminPage() {
  return (
    <div className="space-y-8 lg:space-y-12">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">Campaigns</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage SMS campaigns and messaging workflows.
        </p>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-8">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Total Campaigns</CardTitle>
            <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">12</div>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Active Campaigns</CardTitle>
            <div className="text-xl sm:text-2xl font-bold text-green-600">3</div>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Messages Sent</CardTitle>
            <div className="text-xl sm:text-2xl font-bold text-sky-600">1,247</div>
          </CardHeader>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-6">
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription className="mt-2">
            Common campaign management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
            <Button variant="neumorphic-primary" className="h-12">
              Create New Campaign
            </Button>
            <Button variant="neumorphic-secondary" className="h-12">
              View Campaign Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-6">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription className="mt-2">
            Latest campaign updates and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 lg:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <div className="space-y-1 mb-2 sm:mb-0">
                <p className="font-medium text-gray-900 dark:text-white">Welcome Campaign</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sent to 45 new subscribers</p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 sm:ml-4 sm:flex-shrink-0">
                2 hours ago
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between py-3 sm:py-4 border-b border-gray-100 dark:border-gray-800 last:border-0">
              <div className="space-y-1 mb-2 sm:mb-0">
                <p className="font-medium text-gray-900 dark:text-white">Weekly Newsletter</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Scheduled for tomorrow 9:00 AM</p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 sm:ml-4 sm:flex-shrink-0">
                1 day ago
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between py-3 sm:py-4">
              <div className="space-y-1 mb-2 sm:mb-0">
                <p className="font-medium text-gray-900 dark:text-white">Event Reminder</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Delivered to 128 contacts</p>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 sm:ml-4 sm:flex-shrink-0">
                3 days ago
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}