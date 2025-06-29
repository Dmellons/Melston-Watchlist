'use client'
import { useState } from 'react'
import { Check, Clock, Eye, Play, Pause, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import SafeIcon from '@/components/SafeIcon'
import { database } from '@/lib/appwrite'
import { toast } from 'sonner'
import { WatchStatus } from '@/types/customTypes'
// import { WatchStatus } from '@/types/appwrite'

interface WatchStatusComponentProps {
  currentStatus: WatchStatus
  documentId: string
  mediaTitle: string
  mediaType: 'movie' | 'tv'
  onStatusUpdate?: (status: WatchStatus) => void
  compact?: boolean
}

const statusConfig = {
  [WatchStatus.WANT_TO_WATCH]: {
    label: 'Want to Watch',
    icon: Clock,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    buttonColor: 'bg-blue-500 hover:bg-blue-600'
  },
  [WatchStatus.WATCHING]: {
    label: 'Watching',
    icon: Play,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    buttonColor: 'bg-green-500 hover:bg-green-600'
  },
  [WatchStatus.COMPLETED]: {
    label: 'Completed',
    icon: Check,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    buttonColor: 'bg-purple-500 hover:bg-purple-600'
  },
  [WatchStatus.ON_HOLD]: {
    label: 'On Hold',
    icon: Pause,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    buttonColor: 'bg-yellow-500 hover:bg-yellow-600'
  },
  [WatchStatus.DROPPED]: {
    label: 'Dropped',
    icon: X,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    buttonColor: 'bg-red-500 hover:bg-red-600'
  }
}

export default function WatchStatusComponent({
  currentStatus,
  documentId,
  mediaTitle,
  mediaType,
  onStatusUpdate,
  compact = false
}: WatchStatusComponentProps) {
  const [status, setStatus] = useState<WatchStatus>(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusChange = async (newStatus: WatchStatus) => {
    if (newStatus === status) return

    setIsUpdating(true)
    
    try {
      const updateData: any = {
        watch_status: newStatus
      }

      // If marking as completed, set date_watched
      if (newStatus === WatchStatus.COMPLETED) {
        updateData.date_watched = new Date().toISOString()
      }

      await database.updateDocument(
        'watchlist',
        process.env.NEXT_PUBLIC_APPWRITE_WATCHLIST_COLLECTION_ID!,
        documentId,
        updateData
      )

      setStatus(newStatus)
      onStatusUpdate?.(newStatus)

      toast.success(
        `Updated "${mediaTitle}" status to ${statusConfig[newStatus].label}`
      )
    } catch (error) {
      toast.error('Failed to update status')
      console.error('Status update error:', error)
    } finally {
      setIsUpdating(false)
    }
  }

  const currentConfig = statusConfig[status]

  if (compact) {
    return (
      <Select
        value={status}
        onValueChange={(value: WatchStatus) => handleStatusChange(value)}
        disabled={isUpdating}
      >
        <SelectTrigger className={`w-full ${currentConfig.color} border-none`}>
          <div className="flex items-center gap-2">
            <SafeIcon icon={currentConfig.icon} className="h-4 w-4" size={16} />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {Object.entries(statusConfig).map(([statusKey, config]) => (
            <SelectItem key={statusKey} value={statusKey}>
              <div className="flex items-center gap-2">
                <SafeIcon icon={config.icon} className="h-4 w-4" size={16} />
                <span>{config.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-lg">Watch Status</h3>
            <Badge className={currentConfig.color}>
              <SafeIcon icon={currentConfig.icon} className="h-3 w-3 mr-1" size={12} />
              {currentConfig.label}
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {Object.entries(statusConfig).map(([statusKey, config]) => {
              const isActive = status === statusKey
              const IconComponent = config.icon

              return (
                <Button
                  key={statusKey}
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className={`
                    flex items-center gap-2 justify-start text-xs
                    ${isActive ? config.buttonColor : ''}
                    transition-all duration-200 hover:scale-105
                  `}
                  onClick={() => handleStatusChange(statusKey as WatchStatus)}
                  disabled={isUpdating}
                >
                  <SafeIcon icon={IconComponent} className="h-3 w-3" size={12} />
                  <span className="truncate">{config.label}</span>
                </Button>
              )
            })}
          </div>

          {status === WatchStatus.WATCHING && mediaType === 'tv' && (
            <div className="mt-4 p-3 bg-muted/30 rounded-lg border border-border/50">
              <p className="text-sm text-muted-foreground mb-2">Track Progress</p>
              <div className="flex gap-2 text-xs">
                <span>Episode tracking coming soon...</span>
              </div>
            </div>
          )}

          {status === WatchStatus.COMPLETED && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-700 dark:text-green-300">
                Great! Consider rating this {mediaType === 'movie' ? 'movie' : 'show'} to help others discover it.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}