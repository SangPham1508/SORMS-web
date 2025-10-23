"use client";

import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { createTaskNotification } from "@/lib/notifications";

type Task = {
  id: number;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'IN_PROGRESS' | 'COMPLETED';
  assignedBy: string;
  dueDate: string;
  estimatedHours: number;
  actualHours?: number;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  rejectionReason?: string;
};

export default function StaffPage() {
  // Set user role in sessionStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('userRole', 'staff');
    }
  }, []);

  const [tasks, setTasks] = useState<Task[]>([]);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [timeModalOpen, setTimeModalOpen] = useState(false);
  const [actualHours, setActualHours] = useState(0);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [filterPriority, setFilterPriority] = useState<'ALL' | 'LOW' | 'MEDIUM' | 'HIGH'>('ALL');
  const [flash, setFlash] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Auto-hide success/error messages after a few seconds
  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 3000);
    return () => clearTimeout(timer);
  }, [flash]);

  // Load tasks from shared system API
  useEffect(() => {
    const loadTasks = async () => {
      try {
        const res = await fetch('/api/system/tasks')
        const sysTasks = await res.json()
        const statusMap: Record<string, Task['status']> = {
          TODO: 'PENDING',
          IN_PROGRESS: 'IN_PROGRESS', 
          DONE: 'COMPLETED',
          CANCELLED: 'REJECTED'
        }
        setTasks(sysTasks.map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description || '',
          priority: t.priority,
          status: statusMap[t.status] || 'PENDING',
          assignedBy: t.assigned_to,
          dueDate: t.due_at.slice(0, 10),
          estimatedHours: 2,
          createdAt: new Date().toISOString()
        })))
      } catch (e) {
        // ignore demo errors
      }
    }
    loadTasks()
  }, []);

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'ALL' || task.status === filterStatus;
    const priorityMatch = filterPriority === 'ALL' || task.priority === filterPriority;
    return statusMatch && priorityMatch;
  });

  const handleAcceptTask = async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    await fetch('/api/system/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'IN_PROGRESS' })
    });
    
    // Refresh tasks
    const res = await fetch('/api/system/tasks')
    const sysTasks = await res.json()
    const statusMap: Record<string, Task['status']> = {
      TODO: 'PENDING',
      IN_PROGRESS: 'IN_PROGRESS', 
      DONE: 'COMPLETED',
      CANCELLED: 'REJECTED'
    }
    setTasks(sysTasks.map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      priority: t.priority,
      status: statusMap[t.status] || 'PENDING',
      assignedBy: t.assigned_to,
      dueDate: t.due_at.slice(0, 10),
      estimatedHours: 2,
      createdAt: new Date().toISOString()
    })));
    
    setTaskModalOpen(false);
    setFlash({ type: 'success', text: 'Đã nhận công việc thành công!' });
      
    // Create notification
    createTaskNotification(task.title, 'ACCEPTED', task.assignedBy);
  };

  const handleRejectTask = async (id: number) => {
    if (!rejectionReason.trim()) {
      setFlash({ type: 'error', text: 'Vui lòng nhập lý do từ chối' });
      return;
    }
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    await fetch('/api/system/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'CANCELLED' })
    });
    
    // Refresh tasks
    const res = await fetch('/api/system/tasks')
    const sysTasks = await res.json()
    const statusMap: Record<string, Task['status']> = {
      TODO: 'PENDING',
      IN_PROGRESS: 'IN_PROGRESS', 
      DONE: 'COMPLETED',
      CANCELLED: 'REJECTED'
    }
    setTasks(sysTasks.map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      priority: t.priority,
      status: statusMap[t.status] || 'PENDING',
      assignedBy: t.assigned_to,
      dueDate: t.due_at.slice(0, 10),
      estimatedHours: 2,
      createdAt: new Date().toISOString(),
      rejectionReason: t.status === 'CANCELLED' ? rejectionReason : undefined
    })));
    
    setTaskModalOpen(false);
    setRejectionReason('');
    setFlash({ type: 'success', text: 'Đã từ chối công việc!' });
    
    // Create notification
    createTaskNotification(task.title, 'REJECTED', task.assignedBy, rejectionReason);
  };

  const handleStartTask = async (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    await fetch('/api/system/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'IN_PROGRESS' })
    });
    
    // Refresh tasks
    const res = await fetch('/api/system/tasks')
    const sysTasks = await res.json()
    const statusMap: Record<string, Task['status']> = {
      TODO: 'PENDING',
      IN_PROGRESS: 'IN_PROGRESS', 
      DONE: 'COMPLETED',
      CANCELLED: 'REJECTED'
    }
    setTasks(sysTasks.map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      priority: t.priority,
      status: statusMap[t.status] || 'PENDING',
      assignedBy: t.assigned_to,
      dueDate: t.due_at.slice(0, 10),
      estimatedHours: 2,
      createdAt: new Date().toISOString()
    })));
    
    // Create notification
    createTaskNotification(task.title, 'IN_PROGRESS', task.assignedBy);
  };

  const handleCompleteTask = (id: number) => {
    setSelectedTask(tasks.find(t => t.id === id) || null);
    setActualHours(0);
    setTimeModalOpen(true);
  };

  const handleSubmitTime = async () => {
    if (!selectedTask) return;
    
    await fetch('/api/system/tasks', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: selectedTask.id, status: 'DONE' })
    });
    
    // Refresh tasks
    const res = await fetch('/api/system/tasks')
    const sysTasks = await res.json()
    const statusMap: Record<string, Task['status']> = {
      TODO: 'PENDING',
      IN_PROGRESS: 'IN_PROGRESS', 
      DONE: 'COMPLETED',
      CANCELLED: 'REJECTED'
    }
    setTasks(sysTasks.map((t: any) => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      priority: t.priority,
      status: statusMap[t.status] || 'PENDING',
      assignedBy: t.assigned_to,
      dueDate: t.due_at.slice(0, 10),
      estimatedHours: 2,
      actualHours: t.status === 'DONE' ? actualHours : undefined,
      createdAt: new Date().toISOString(),
      completedAt: t.status === 'DONE' ? new Date().toISOString() : undefined
    })));
    
    setTimeModalOpen(false);
    setFlash({ type: 'success', text: 'Đã hoàn thành công việc!' });
    
    // Create notification
    createTaskNotification(selectedTask.title, 'COMPLETED', selectedTask.assignedBy);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge tone="warning">Chờ phản hồi</Badge>;
      case 'ACCEPTED':
        return <Badge tone="success">Đã nhận</Badge>;
      case 'REJECTED':
        return <Badge tone="error">Từ chối</Badge>;
      case 'IN_PROGRESS':
        return <Badge>Đang làm</Badge>;
      case 'COMPLETED':
        return <Badge tone="success">Hoàn thành</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <Badge tone="error">Cao</Badge>;
      case 'MEDIUM':
        return <Badge tone="warning">Trung bình</Badge>;
      case 'LOW':
        return <Badge tone="muted">Thấp</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'PENDING').length;
  const acceptedTasks = tasks.filter(t => t.status === 'ACCEPTED').length;
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;

  return (
    <>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="min-w-0 flex-1 pl-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Nhân viên</h1>
              <p className="text-sm lg:text-base text-gray-600 mt-1">Quản lý công việc và thời gian làm việc</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Flash Messages */}
          {flash && (
            <div className={`rounded-md border p-2 sm:p-3 text-xs sm:text-sm shadow-sm ${
              flash.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {flash.text}
            </div>
          )}

          {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <Card>
            <CardBody>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{pendingTasks}</div>
                <div className="text-sm text-gray-600">Chờ phản hồi</div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{acceptedTasks}</div>
                <div className="text-sm text-gray-600">Đã nhận</div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
                <div className="text-sm text-gray-600">Hoàn thành</div>
              </div>
            </CardBody>
          </Card>
        </div>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo trạng thái</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="ALL">Tất cả</option>
                <option value="PENDING">Chờ phản hồi</option>
                <option value="ACCEPTED">Đã nhận</option>
                <option value="IN_PROGRESS">Đang làm</option>
                <option value="COMPLETED">Hoàn thành</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Lọc theo ưu tiên</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
                value={filterPriority} 
                onChange={(e) => setFilterPriority(e.target.value as any)}
              >
                <option value="ALL">Tất cả</option>
                <option value="HIGH">Cao</option>
                <option value="MEDIUM">Trung bình</option>
                <option value="LOW">Thấp</option>
              </select>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                Hiển thị {filteredTasks.length} công việc
              </div>
            </div>
            <div className="flex items-end">
              <div className="text-sm text-gray-600">
                {pendingTasks} chờ phản hồi
              </div>
            </div>
          </div>

          {/* Tasks List */}
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card key={task.id} className={`${task.status === 'PENDING' ? 'ring-2 ring-yellow-200 bg-yellow-50' : ''}`}>
                <CardBody>
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                        {getStatusBadge(task.status)}
                        {getPriorityBadge(task.priority)}
                        {task.status === 'PENDING' && (
                          <Badge tone="warning">Mới</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed mb-3">{task.description}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600 mb-3">
                        <div><span className="font-medium">Giao bởi:</span> {task.assignedBy}</div>
                        <div><span className="font-medium">Hạn:</span> {task.dueDate}</div>
                        <div><span className="font-medium">Dự kiến:</span> {task.estimatedHours}h</div>
                        {task.actualHours && (
                          <div><span className="font-medium">Thực tế:</span> {task.actualHours}h</div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        Tạo lúc: {new Date(task.createdAt).toLocaleString('vi-VN')}
                      </div>
                      {task.status === 'REJECTED' && task.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-100 border border-red-200 rounded-md">
                          <div className="text-sm font-medium text-red-800 mb-1">Lý do từ chối:</div>
                          <div className="text-sm text-red-700">{task.rejectionReason}</div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
                      {task.status === 'PENDING' && (
                        <Button 
                          onClick={() => {
                            setSelectedTask(task);
                            setTaskModalOpen(true);
                          }}
                          className="w-full sm:w-auto lg:w-full"
                        >
                          Xem chi tiết
                        </Button>
                      )}
                      {task.status === 'ACCEPTED' && (
                        <Button 
                          onClick={() => handleStartTask(task.id)}
                          className="w-full sm:w-auto lg:w-full"
                        >
                          Bắt đầu
                        </Button>
                      )}
                      {task.status === 'IN_PROGRESS' && (
                        <Button 
                          onClick={() => handleCompleteTask(task.id)}
                          className="w-full sm:w-auto lg:w-full"
                        >
                          Hoàn thành
                        </Button>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

        {/* Task Detail Modal */}
        <Modal
          open={taskModalOpen}
          onClose={() => {
            setTaskModalOpen(false);
            setRejectionReason('');
          }}
          title="Chi tiết công việc"
          footer={
            <div className="flex justify-end gap-2">
              <Button 
                variant="danger" 
                onClick={() => selectedTask && handleRejectTask(selectedTask.id)}
              >
                Từ chối
              </Button>
              <Button 
                onClick={() => selectedTask && handleAcceptTask(selectedTask.id)}
              >
                Nhận việc
              </Button>
            </div>
          }
        >
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <span className="font-medium text-sm">Mô tả:</span>
                <p className="text-sm text-gray-600 mt-1">{selectedTask.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="font-medium">Giao bởi:</span> {selectedTask.assignedBy}</div>
                <div><span className="font-medium">Hạn:</span> {selectedTask.dueDate}</div>
                <div><span className="font-medium">Ưu tiên:</span> {selectedTask.priority}</div>
                <div><span className="font-medium">Dự kiến:</span> {selectedTask.estimatedHours}h</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lý do từ chối (nếu từ chối):
                </label>
                <textarea
                  className="w-full h-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập lý do từ chối..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
            </div>
          )}
        </Modal>

        {/* Time Entry Modal */}
        <Modal
          open={timeModalOpen}
          onClose={() => setTimeModalOpen(false)}
          title="Nhập thời gian hoàn thành"
          footer={
            <div className="flex justify-end gap-2">
              <Button 
                variant="secondary" 
                onClick={() => setTimeModalOpen(false)}
              >
                Hủy
              </Button>
              <Button 
                onClick={handleSubmitTime}
              >
                Xác nhận
              </Button>
            </div>
          }
        >
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian thực tế (giờ)</label>
              <Input
                type="number"
                step="0.5"
                min="0"
                value={actualHours}
                onChange={(e) => setActualHours(parseFloat(e.target.value) || 0)}
                placeholder="Nhập số giờ thực tế"
              />
            </div>
            {selectedTask && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Dự kiến:</span> {selectedTask.estimatedHours} giờ
              </div>
            )}
          </div>
        </Modal>
        </div>
      </div>
    </>
  );
}