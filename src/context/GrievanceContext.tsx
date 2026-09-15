import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ticketApi, authApi } from '../services/api';
import type {
  Ticket,
  GrievanceCategory,
  UrgencyLevel,
  TicketStatus,
  ViewType,
  DepartmentPerformance,
  AuditLog
} from '../types/grievance';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

interface GrievanceContextType {
  tickets: Ticket[];
  selectedTicketId: string;
  setSelectedTicketId: (id: string) => void;
  activeView: ViewType;
  setActiveView: (view: ViewType) => void;
  isComplaintModalOpen: boolean;
  setIsComplaintModalOpen: (open: boolean) => void;
  isEmergencyModalOpen: boolean;
  setIsEmergencyModalOpen: (open: boolean) => void;
  isStaffLoginModalOpen: boolean;
  setIsStaffLoginModalOpen: (open: boolean) => void;
  isApiConnected: boolean;
  addTicket: (data: {
    title: string;
    category: GrievanceCategory;
    urgency: UrgencyLevel;
    location: string;
    description: string;
    complainantName: string;
    complainantEmail: string;
    attachments?: Array<{ name: string; size: string; type: string }>;
  }) => Promise<string>;
  updateTicketStatus: (id: string, status: TicketStatus) => void;
  assignTicket: (id: string, agentName: string, role: string) => void;
  escalateTicket: (id: string) => void;
  addAuditNote: (id: string, note: string, author?: string) => void;
  toasts: Toast[];
  dismissToast: (id: string) => void;
  showToast: (title: string, message: string, type?: Toast['type']) => void;
  departmentMetrics: DepartmentPerformance[];
  activeTicket: Ticket | undefined;
  refreshTickets: () => void;
}

const INITIAL_TICKETS: Ticket[] = [
  {
    id: 'RP-8042',
    title: 'Air Conditioning Breakdown in Block-C Server & Common Hall',
    category: 'Hostel & Facilities',
    department: 'Facilities & HVAC',
    urgency: 'high',
    status: 'dispatched',
    slaStatus: 'normal',
    location: 'Block-C, Room 304 & Common Wing',
    description: 'Central cooling unit tripping every 10 minutes with severe compressor noise and rising temperature causing discomfort and server room temperature warnings.',
    complainant: {
      name: 'Aditya Rao',
      email: 'aditya.r@campus.edu',
      phone: '+91 98451 22910',
      role: 'Block Representative'
    },
    createdAt: 'Today, 10:30 AM',
    updatedAt: '12 mins ago',
    eta: 'Today, 02:30 PM',
    etaMinutesLeft: 58,
    assignedAgent: {
      name: 'Rahul K.',
      role: 'Lead HVAC Specialist',
      phone: '+91 94412 88201'
    },
    attachments: [
      { id: 'att-1', name: 'ac_compressor_trip.jpg', size: '1.4 MB', type: 'image/jpeg' },
      { id: 'att-2', name: 'thermostat_reading.png', size: '820 KB', type: 'image/png' }
    ],
    auditLogs: [
      { id: 'l1', timestamp: '10:30 AM', author: 'System Dispatch', role: 'Automated Bot', action: 'Ticket Logged', note: 'Issue classified as High Urgency via AI Intake parser.' },
      { id: 'l2', timestamp: '10:45 AM', author: 'Dispatcher Sharma', role: 'Dispatch Lead', action: 'Ticket Assigned', note: 'Assigned to Facilities & HVAC division queue.' },
      { id: 'l3', timestamp: '11:15 AM', author: 'Rahul K.', role: 'Lead HVAC Specialist', action: 'Technician Dispatched', note: 'On-site diagnostic kit deployed. Heading to Block-C rooftop chiller unit.' }
    ],
    currentStepIndex: 2
  },
  {
    id: 'RP-8039',
    title: 'Main Library 5GHz Enterprise Wi-Fi Gateway Offline',
    category: 'IT & Network',
    department: 'IT & Network Systems',
    urgency: 'critical',
    status: 'investigating',
    slaStatus: 'warning',
    location: 'Central Library, 2nd Floor Reading Room',
    description: 'Aruba AP-535 access point blinking red. Over 120 students in the digital research lab disconnected during mid-term preparation.',
    complainant: {
      name: 'Sneha Patel',
      email: 'sneha.p@campus.edu',
      phone: '+91 91234 56789',
      role: 'Research Scholar'
    },
    createdAt: 'Today, 09:15 AM',
    updatedAt: '25 mins ago',
    eta: 'Today, 01:00 PM',
    etaMinutesLeft: 32,
    assignedAgent: {
      name: 'Vikram Mehta',
      role: 'Senior Network Engineer',
      phone: '+91 98877 12345'
    },
    attachments: [
      { id: 'att-3', name: 'ap_led_status.jpg', size: '2.1 MB', type: 'image/jpeg' }
    ],
    auditLogs: [
      { id: 'l4', timestamp: '09:15 AM', author: 'System Dispatch', role: 'Automated Bot', action: 'Ticket Logged', note: 'SLA timer initiated: 4.0 Hours Max.' },
      { id: 'l5', timestamp: '09:30 AM', author: 'IT Operations', role: 'Network NOC', action: 'Investigating', note: 'Remote ping to switch port GigabitEthernet1/0/24 timed out.' }
    ],
    currentStepIndex: 1
  },
  {
    id: 'RP-7994',
    title: 'Merit Scholarship Disbursal Ledger Discrepancy (Semester V)',
    category: 'Finance & Scholarship',
    department: 'Student Finance Bureau',
    urgency: 'medium',
    status: 'new',
    slaStatus: 'normal',
    location: 'Admin Wing, Finance Counter 3',
    description: 'Tution fee waiver credited only at 40% instead of official 75% awarded by the Academic Council notification #AC/2026/088.',
    complainant: {
      name: 'Karthik Raja',
      email: 'karthik.raja@campus.edu',
      role: 'Student'
    },
    createdAt: 'Yesterday, 04:20 PM',
    updatedAt: 'Yesterday, 04:20 PM',
    eta: 'Tomorrow, 12:00 PM',
    etaMinutesLeft: 840,
    attachments: [
      { id: 'att-4', name: 'scholarship_award_letter.pdf', size: '640 KB', type: 'application/pdf' }
    ],
    auditLogs: [
      { id: 'l6', timestamp: 'Yesterday, 04:20 PM', author: 'System Dispatch', role: 'Automated Bot', action: 'Ticket Logged', note: 'Queued in Finance verification backlog.' }
    ],
    currentStepIndex: 0
  },
  {
    id: 'RP-7911',
    title: 'Water Filtration Unit Filter Replacement (Dining Hall B)',
    category: 'Sanitation & Hygiene',
    department: 'Health & Sanitation',
    urgency: 'medium',
    status: 'resolved',
    slaStatus: 'normal',
    location: 'Mess Facility B, South Wing',
    description: 'Reverse Osmosis filtration TDS reading indicated 380 PPM. Requested immediate membrane replacement and purity sanitization test.',
    complainant: {
      name: 'Mess Oversight Committee',
      email: 'mess.council@campus.edu',
      role: 'Staff Representative'
    },
    createdAt: 'Oct 10, 08:00 AM',
    updatedAt: 'Oct 10, 03:45 PM',
    eta: 'Resolved',
    etaMinutesLeft: 0,
    assignedAgent: {
      name: 'Santosh Kumar',
      role: 'Sanitation Officer',
      phone: '+91 97766 54321'
    },
    attachments: [],
    auditLogs: [
      { id: 'l7', timestamp: 'Oct 10, 08:00 AM', author: 'System', role: 'Intake', action: 'Ticket Logged' },
      { id: 'l8', timestamp: 'Oct 10, 11:00 AM', author: 'Santosh K.', role: 'Officer', action: 'Technician Dispatched', note: 'Industrial RO cartridge swapped.' },
      { id: 'l9', timestamp: 'Oct 10, 03:45 PM', author: 'Santosh K.', role: 'Officer', action: 'Resolved', note: 'Water tested at 45 PPM pure. Signed off by food safety officer.' }
    ],
    currentStepIndex: 3
  },
  {
    id: 'RP-7890',
    title: 'Lab 4 Deep Learning GPU Server Overheating Warning',
    category: 'IT & Network',
    department: 'IT & Network Systems',
    urgency: 'critical',
    status: 'resolved',
    slaStatus: 'normal',
    location: 'AI Research Center, Lab 4 Rack 2',
    description: 'NVIDIA RTX A6000 node throttling at 94°C due to intake fan dust blockage.',
    complainant: {
      name: 'Dr. S. Nair',
      email: 's.nair@campus.edu',
      role: 'Faculty'
    },
    createdAt: 'Oct 08, 02:00 PM',
    updatedAt: 'Oct 08, 04:30 PM',
    eta: 'Resolved',
    etaMinutesLeft: 0,
    assignedAgent: {
      name: 'Vikram Mehta',
      role: 'Senior Network Engineer'
    },
    attachments: [],
    auditLogs: [
      { id: 'l10', timestamp: 'Oct 08, 02:00 PM', author: 'System', role: 'Intake', action: 'Ticket Logged' },
      { id: 'l11', timestamp: 'Oct 08, 04:30 PM', author: 'Vikram M.', role: 'Engineer', action: 'Resolved', note: 'Thermal paste reapplied and intake filters cleansed.' }
    ],
    currentStepIndex: 3
  },
  {
    id: 'RP-7852',
    title: 'Corridor Emergency Lighting Sensor Failure near Fire Exit 4',
    category: 'Hostel & Facilities',
    department: 'Facilities & HVAC',
    urgency: 'low',
    status: 'resolved',
    slaStatus: 'normal',
    location: 'Academic Complex 2, 4th Floor',
    description: 'PIR motion sensor stuck in off state during twilight hours.',
    complainant: {
      name: 'Security Guardpost 3',
      email: 'security@campus.edu',
      role: 'Staff'
    },
    createdAt: 'Oct 06, 06:15 PM',
    updatedAt: 'Oct 07, 09:00 AM',
    eta: 'Resolved',
    etaMinutesLeft: 0,
    assignedAgent: {
      name: 'Manoj Singh',
      role: 'Electrical Tech'
    },
    attachments: [],
    auditLogs: [
      { id: 'l12', timestamp: 'Oct 06, 06:15 PM', author: 'System', role: 'Intake', action: 'Ticket Logged' },
      { id: 'l13', timestamp: 'Oct 07, 09:00 AM', author: 'Manoj S.', role: 'Electrical', action: 'Resolved', note: 'Sensor replaced with IP65 optical unit.' }
    ],
    currentStepIndex: 3
  }
];

const INITIAL_DEPARTMENT_METRICS: DepartmentPerformance[] = [
  { department: 'IT & Network Systems', onTimeRate: 96, resolvedCount: 88, avgHours: 2.1, color: '#06b6d4' },
  { department: 'Hostel & Facilities', onTimeRate: 84, resolvedCount: 142, avgHours: 4.8, color: '#10b981' },
  { department: 'Health & Sanitation', onTimeRate: 91, resolvedCount: 64, avgHours: 3.2, color: '#f59e0b' },
  { department: 'Academics Redressal', onTimeRate: 98, resolvedCount: 45, avgHours: 1.8, color: '#8b5cf6' },
  { department: 'Finance & Scholarship', onTimeRate: 89, resolvedCount: 39, avgHours: 5.2, color: '#ec4899' }
];

const GrievanceContext = createContext<GrievanceContextType | undefined>(undefined);

export const GrievanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [selectedTicketId, setSelectedTicketId] = useState<string>('RP-8042');
  const [activeView, setActiveView] = useState<ViewType>('landing');
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isStaffLoginModalOpen, setIsStaffLoginModalOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isApiConnected, setIsApiConnected] = useState(false);

  // ── Load tickets from backend on mount ────────────────────────────────────
  const refreshTickets = useCallback(async () => {
    try {
      const data = await ticketApi.getAll();
      setTickets(data);
      setIsApiConnected(true);
      if (data.length > 0 && !selectedTicketId) {
        setSelectedTicketId(data[0].id);
      }
    } catch {
      // Backend offline — keep using in-memory seed data
      setIsApiConnected(false);
    }
  }, []);

  useEffect(() => {
    refreshTickets();
  }, [refreshTickets]);

  // ── Load stats from backend ─────────────────────────────────────────────
  const [, setStats] = useState<any>(null);
  useEffect(() => {
    authApi.getStats().then(setStats).catch(() => {});
  }, [tickets]);

  const showToast = (title: string, message: string, type: Toast['type'] = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Real-time ETA countdown simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTickets((prev) =>
        prev.map((t) => {
          if (t.status === 'resolved' || t.etaMinutesLeft <= 0) return t;
          const nextMinutes = t.etaMinutesLeft - 1;
          return {
            ...t,
            etaMinutesLeft: nextMinutes > 0 ? nextMinutes : 0
          };
        })
      );
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const addTicket = async (data: {
    title: string;
    category: GrievanceCategory;
    urgency: UrgencyLevel;
    location: string;
    description: string;
    complainantName: string;
    complainantEmail: string;
    attachments?: Array<{ name: string; size: string; type: string }>;
  }): Promise<string> => {
    try {
      // Try backend first
      const created = await ticketApi.create(data);
      setTickets(prev => [created, ...prev]);
      setSelectedTicketId(created.id);
      showToast('Grievance Registered', `Ticket #${created.id} submitted successfully.`, 'success');
      return created.id;
    } catch {
      // Fallback: in-memory creation
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const newId = `RP-${randNum}`;
      const deptMap: Record<string, string> = {
        'Hostel & Facilities': 'Facilities & HVAC',
        'IT & Network': 'IT & Network Systems',
        'Finance & Scholarship': 'Student Finance Bureau',
        'Sanitation & Hygiene': 'Health & Sanitation',
        'Academics': 'Academics Redressal',
        'Harassment & Discipline': 'Internal Grievance Committee'
      };
      const dept = deptMap[data.category] || 'General Affairs';
      const newTicket: Ticket = {
        id: newId, title: data.title, category: data.category,
        department: dept, urgency: data.urgency, status: 'new',
        slaStatus: data.urgency === 'critical' ? 'warning' : 'normal',
        location: data.location, description: data.description,
        complainant: { name: data.complainantName, email: data.complainantEmail, role: 'Citizen / Student' },
        createdAt: 'Just now', updatedAt: 'Just now',
        eta: 'Assessing ETA...', etaMinutesLeft: 480,
        attachments: (data.attachments || []).map((a, i) => ({ id: `att-${i}`, name: a.name, size: a.size, type: a.type })),
        auditLogs: [{ id: `log-${Date.now()}`, timestamp: 'Just now', author: 'System', role: 'Automated Bot', action: 'Ticket Registered', note: '' }],
        currentStepIndex: 0
      };
      setTickets(prev => [newTicket, ...prev]);
      setSelectedTicketId(newId);
      showToast('Grievance Registered', `Ticket #${newId} queued (offline mode).`, 'success');
      return newId;
    }
  };

  const updateTicketStatus = async (id: string, status: TicketStatus) => {
    try {
      const updated = await ticketApi.updateStatus(id, status);
      setTickets(prev => prev.map(t => t.id === id ? updated : t));
    } catch {
      // Fallback in-memory
      const stepMap: Record<TicketStatus, number> = { new: 0, investigating: 1, dispatched: 2, resolved: 3 };
      setTickets(prev => prev.map(ticket => {
        if (ticket.id !== id) return ticket;
        const newLog: AuditLog = { id: `log-${Date.now()}`, timestamp: 'Just now', author: 'Admin Command', role: 'Staff Lead', action: 'Status Updated', note: `Updated to ${status}.` };
        return { ...ticket, status, currentStepIndex: stepMap[status], updatedAt: 'Just now', auditLogs: [newLog, ...ticket.auditLogs] };
      }));
    }
    showToast('Status Updated', `Ticket #${id} is now ${status.toUpperCase()}.`, 'info');
  };

  const assignTicket = async (id: string, agentName: string, role: string) => {
    try {
      const updated = await ticketApi.assign(id, agentName, role);
      setTickets(prev => prev.map(t => t.id === id ? updated : t));
    } catch {
      setTickets(prev => prev.map(t => {
        if (t.id !== id) return t;
        return { ...t, assignedAgent: { name: agentName, role }, status: t.status === 'new' ? 'investigating' : t.status, updatedAt: 'Just now' };
      }));
    }
    showToast('Staff Assigned', `Ticket #${id} assigned to ${agentName}.`, 'success');
  };

  const escalateTicket = async (id: string) => {
    try {
      const updated = await ticketApi.escalate(id);
      setTickets(prev => prev.map(t => t.id === id ? updated : t));
    } catch {
      setTickets(prev => prev.map(t => t.id !== id ? t : { ...t, urgency: 'critical', slaStatus: 'breached', updatedAt: 'Just now' }));
    }
    showToast('Urgency Escalated', `Ticket #${id} marked CRITICAL with SLA Breach warning.`, 'warning');
  };

  const addAuditNote = async (id: string, note: string, author: string = 'Staff Officer') => {
    if (!note.trim()) return;
    try {
      const updated = await ticketApi.addNote(id, note, author);
      setTickets(prev => prev.map(t => t.id === id ? updated : t));
    } catch {
      setTickets(prev => prev.map(t => {
        if (t.id !== id) return t;
        const newLog: AuditLog = { id: `log-${Date.now()}`, timestamp: 'Just now', author, role: 'Operations Reviewer', action: 'Audit Log Added', note };
        return { ...t, updatedAt: 'Just now', auditLogs: [newLog, ...t.auditLogs] };
      }));
    }
    showToast('Note Added', `Internal audit note recorded for #${id}.`, 'info');
  };

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  return (
    <GrievanceContext.Provider
      value={{
        tickets,
        selectedTicketId,
        setSelectedTicketId,
        activeView,
        setActiveView,
        isComplaintModalOpen,
        setIsComplaintModalOpen,
        isEmergencyModalOpen,
        setIsEmergencyModalOpen,
        isStaffLoginModalOpen,
        setIsStaffLoginModalOpen,
        isApiConnected,
        addTicket,
        updateTicketStatus,
        assignTicket,
        escalateTicket,
        addAuditNote,
        toasts,
        dismissToast,
        showToast,
        departmentMetrics: INITIAL_DEPARTMENT_METRICS,
        activeTicket,
        refreshTickets
      }}
    >
      {children}
    </GrievanceContext.Provider>
  );
};

export const useGrievance = () => {
  const context = useContext(GrievanceContext);
  if (!context) {
    throw new Error('useGrievance must be used within a GrievanceProvider');
  }
  return context;
};
