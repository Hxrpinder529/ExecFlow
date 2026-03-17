import { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Clock, 
  User as UserIcon, 
  Tag, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Calendar,
  Percent,
  MessageSquare
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ActivityLog } from "@/types";
import { fetchTaskActivity } from "@/lib/activityService";

interface TaskActivityLogProps {
  taskId: string;
  taskTitle: string;
}

export function TaskActivityLog({ taskId, taskTitle }: TaskActivityLogProps) {
  const { users } = useApp();
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    loadActivities();
  }, [taskId]);

  const loadActivities = async () => {
    setLoading(true);
    try {
      const logs = await fetchTaskActivity(taskId);
      setActivities(logs);
    } catch (error) {
      console.error("Error loading activity logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "created":
        return <div className="h-6 w-6 rounded-full bg-green-500/20 flex items-center justify-center"><CheckCircle2 className="h-3 w-3 text-green-500" /></div>;
      case "completed":
        return <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center"><CheckCircle2 className="h-3 w-3 text-blue-500" /></div>;
      case "status_changed":
        return <div className="h-6 w-6 rounded-full bg-yellow-500/20 flex items-center justify-center"><Tag className="h-3 w-3 text-yellow-500" /></div>;
      case "assigned":
        return <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center"><UserIcon className="h-3 w-3 text-purple-500" /></div>;
      case "priority_changed":
        return <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center"><AlertCircle className="h-3 w-3 text-red-500" /></div>;
      case "due_date_changed":
        return <div className="h-6 w-6 rounded-full bg-orange-500/20 flex items-center justify-center"><Calendar className="h-3 w-3 text-orange-500" /></div>;
      case "progress_updated":
        return <div className="h-6 w-6 rounded-full bg-indigo-500/20 flex items-center justify-center"><Percent className="h-3 w-3 text-indigo-500" /></div>;
      case "comment_added":
        return <div className="h-6 w-6 rounded-full bg-gray-500/20 flex items-center justify-center"><MessageSquare className="h-3 w-3 text-gray-500" /></div>;
      default:
        return <div className="h-6 w-6 rounded-full bg-gray-500/20 flex items-center justify-center"><Activity className="h-3 w-3 text-gray-500" /></div>;
    }
  };

  const getActivityDescription = (activity: ActivityLog) => {
    const userName = activity.userName || "Unknown user";
    
    switch (activity.action) {
      case "created":
        return <span><span className="font-medium">{userName}</span> created this task</span>;
      
      case "updated":
        return <span><span className="font-medium">{userName}</span> updated {activity.field}</span>;
      
      case "status_changed":
        return (
          <span>
            <span className="font-medium">{userName}</span> changed status from{' '}
            <Badge variant="outline" className="text-[10px] mx-1">{activity.metadata?.fromStatus}</Badge>
            <ArrowRight className="h-3 w-3 inline mx-1" />
            <Badge variant="outline" className="text-[10px] mx-1">{activity.metadata?.toStatus}</Badge>
          </span>
        );
      
      case "assigned":
        return (
          <span>
            <span className="font-medium">{userName}</span> assigned task to{' '}
            <span className="font-medium">{activity.newValue}</span>
          </span>
        );
      
      case "priority_changed":
        return (
          <span>
            <span className="font-medium">{userName}</span> changed priority from{' '}
            <Badge variant="outline" className="text-[10px] mx-1">{activity.metadata?.fromPriority}</Badge>
            <ArrowRight className="h-3 w-3 inline mx-1" />
            <Badge variant="outline" className="text-[10px] mx-1">{activity.metadata?.toPriority}</Badge>
          </span>
        );
      
      case "due_date_changed":
        return (
          <span>
            <span className="font-medium">{userName}</span> changed due date from{' '}
            <span className="font-mono text-xs">{activity.oldValue}</span> to{' '}
            <span className="font-mono text-xs">{activity.newValue}</span>
          </span>
        );
      
      case "progress_updated":
        return (
          <span>
            <span className="font-medium">{userName}</span> updated progress from{' '}
            <span className="font-medium">{activity.metadata?.fromPercent}%</span> to{' '}
            <span className="font-medium">{activity.metadata?.toPercent}%</span>
          </span>
        );
      
      case "completed":
        return <span><span className="font-medium">{userName}</span> marked task as completed</span>;
      
      default:
        return <span><span className="font-medium">{userName}</span> {activity.action}</span>;
    }
  };

  const displayActivities = expanded ? activities : activities.slice(0, 5);

  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Activity Log
          {!loading && <Badge variant="outline" className="text-[10px]">{activities.length} events</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : activities.length > 0 ? (
          <>
            <ScrollArea className={expanded ? "h-[400px]" : "h-[300px]"}>
              <div className="space-y-4">
                {displayActivities.map((activity, index) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">
                        {getActivityDescription(activity)}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                      {index < displayActivities.length - 1 && (
                        <div className="absolute left-3 top-6 bottom-0 w-px bg-border" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            
            {activities.length > 5 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full mt-2 text-xs"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? "Show less" : `Show all ${activities.length} activities`}
              </Button>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No activity logged yet</p>
            <p className="text-xs mt-1">Changes to this task will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}