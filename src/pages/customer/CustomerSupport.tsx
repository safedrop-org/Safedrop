import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import CustomerSidebar from '@/components/customer/CustomerSidebar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { MessageSquare, Loader2, Send, Clock, CheckCircle, XCircle } from 'lucide-react';
import { LanguageProvider, useLanguage } from '@/components/ui/language-context';
const CustomerSupportContent = () => {
  const {
    user
  } = useAuth();
  const {
    t
  } = useLanguage();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    if (!user) return;
    const fetchTickets = async () => {
      try {
        const {
          data,
          error
        } = await supabase.from('complaints').select('*, complaint_responses(*)').eq('user_id', user.id).order('created_at', {
          ascending: false
        });
        if (error) throw error;
        setTickets(data || []);
      } catch (error) {
        console.error('Error fetching support tickets:', error);
        toast.error('Error loading support tickets');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [user]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login first');
      return;
    }
    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    setSubmitting(true);
    try {
      const {
        data,
        error
      } = await supabase.from('complaints').insert({
        subject: subject,
        description: message,
        user_id: user.id,
        status: 'pending'
      }).select();
      if (error) throw error;
      toast.success('Support request sent successfully');
      setSubject('');
      setMessage('');

      // Add the new ticket to the list
      if (data && data.length > 0) {
        setTickets([data[0], ...tickets]);
      }
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      toast.error('Error sending support request');
    } finally {
      setSubmitting(false);
    }
  };
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  const getStatusBadge = (status: string) => {
    const badgeClasses = {
      base: "px-2 py-1 rounded-full text-xs font-medium",
      pending: "bg-yellow-100 text-yellow-800",
      in_progress: "bg-blue-100 text-blue-800",
      resolved: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
      rejected: "bg-red-100 text-red-800"
    };
    const statusTranslation = {
      pending: "Pending",
      in_progress: "In Progress",
      resolved: "Resolved",
      closed: "Closed",
      rejected: "Rejected"
    };
    const statusIcons = {
      pending: <Clock className="h-3 w-3 mr-1" />,
      in_progress: <Loader2 className="h-3 w-3 mr-1" />,
      resolved: <CheckCircle className="h-3 w-3 mr-1" />,
      closed: <XCircle className="h-3 w-3 mr-1" />,
      rejected: <XCircle className="h-3 w-3 mr-1" />
    };
    return <span className={`${badgeClasses.base} ${badgeClasses[status]} flex items-center`}>
        {statusIcons[status]}
        {statusTranslation[status] || status}
      </span>;
  };
  return <div className="flex h-screen bg-gray-50">
      <CustomerSidebar />
      <main className="flex-1 p-6 overflow-auto">
        <h1 className="text-3xl font-bold mb-6 text-safedrop-primary">Technical Support</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          
          
        </div>
      </main>
    </div>;
};
const CustomerSupport = () => {
  return <LanguageProvider>
      <CustomerSupportContent />
    </LanguageProvider>;
};
export default CustomerSupport;

