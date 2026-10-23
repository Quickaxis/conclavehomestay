"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import {
  Clock,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Filter
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { 
  getBookingRequestsAction, 
  approveBookingRequestAction, 
  rejectBookingRequestAction 
} from "@/app/actions/booking-requests";
import { DbBookingRequest } from "@/lib/types";
import { formatISTCompactDate } from "@/lib/dateUtils";

interface BookingRequestsViewProps {
  homestayId?: string;
  onBookingCreated?: () => void;
}

export function BookingRequestsView({ homestayId, onBookingCreated }: BookingRequestsViewProps) {
  const [requests, setRequests] = useState<DbBookingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("pending");

  const supabase = useMemo(() => createClient(), []);

  const loadRequests = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getBookingRequestsAction(homestayId);
      if (res.success && res.data) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error("[HMS] Failed to load booking requests:", err);
    } finally {
      setIsLoading(false);
    }
  }, [homestayId]);

  useEffect(() => {
    loadRequests();

    // Subscribe to realtime updates for instant notification
    const channel = supabase
      .channel("booking-requests-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "booking_requests" },
        () => {
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, loadRequests]);

  const handleApprove = async (requestId: string) => {
    if (!window.confirm("Approve this booking request and convert it into a confirmed reservation?")) return;
    setActionLoadingId(requestId);
    try {
      const res = await approveBookingRequestAction(requestId);
      if (res.success) {
        await loadRequests();
        if (onBookingCreated) onBookingCreated();
      } else {
        alert(res.error || "Failed to approve booking request.");
      }
    } catch (err: any) {
      alert(err?.message || "An error occurred.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!window.confirm("Are you sure you want to decline this request?")) return;
    setActionLoadingId(requestId);
    try {
      const res = await rejectBookingRequestAction(requestId);
      if (res.success) {
        await loadRequests();
      } else {
        alert(res.error || "Failed to reject booking request.");
      }
    } catch (err: any) {
      alert(err?.message || "An error occurred.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = r.guest_name.toLowerCase().includes(q);
        const phoneMatch = r.guest_phone.includes(q);
        const roomMatch = r.rooms?.name?.toLowerCase().includes(q);
        const refMatch = r.id.toLowerCase().includes(q);
        if (!nameMatch && !phoneMatch && !roomMatch && !refMatch) return false;
      }
      return true;
    });
  }, [requests, statusFilter, searchQuery]);

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="flex flex-col space-y-4">
      {/* Filter & Search Bar */}
      <GlassPanel className="p-3 md:p-4 rounded-[20px] bg-white md:glass-panel-secondary border border-gray-100 md:border-[rgba(255,255,255,0.05)] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-gray-400 md:text-[#96928A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by guest name, phone, or reference..."
            className="w-full bg-transparent text-xs font-medium text-gray-900 md:text-[#F5F1E8] placeholder-gray-400 outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-gray-50 md:bg-[rgba(0,0,0,0.2)] border border-gray-200 md:border-[rgba(255,255,255,0.08)] rounded-xl px-2 py-1">
            <Filter className="w-3.5 h-3.5 text-gray-400 md:text-[#96928A]" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-[11px] md:text-xs font-medium text-gray-700 md:text-[#F5F1E8] outline-none cursor-pointer"
            >
              <option value="pending">Pending ({pendingCount})</option>
              <option value="all">All Requests</option>
              <option value="approved">Approved</option>
              <option value="rejected">Declined</option>
            </select>
          </div>

          <button
            onClick={loadRequests}
            disabled={isLoading}
            className="p-1.5 rounded-lg border border-gray-200 md:border-[rgba(255,255,255,0.08)] hover:bg-gray-100 md:hover:bg-[rgba(255,255,255,0.05)] text-gray-500 md:text-[#96928A] transition-colors"
            title="Refresh requests"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </GlassPanel>

      {/* Requests List */}
      {isLoading && requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-2">
          <Loader2 className="w-6 h-6 text-[#F59E0B] animate-spin" />
          <span className="text-gray-500 text-xs">Loading website booking requests...</span>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="bg-white border border-gray-100 shadow-sm rounded-[20px] p-8 flex flex-col items-center justify-center text-center">
          <Clock className="w-8 h-8 text-gray-300 mb-2" />
          <div className="text-gray-700 font-bold text-sm">No {statusFilter !== 'all' ? statusFilter : ''} booking requests found</div>
          <div className="text-xs text-gray-400 mt-1">Website booking submissions will appear here automatically in real time.</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((req) => {
            const isProcessing = actionLoadingId === req.id;
            return (
              <GlassPanel 
                key={req.id} 
                className="p-4 rounded-[20px] bg-white border border-gray-100 md:border-[rgba(255,255,255,0.08)] shadow-sm flex flex-col justify-between gap-3"
              >
                <div>
                  {/* Header: Reference and Status */}
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        REQ-{req.id.slice(0, 8).toUpperCase()}
                      </span>
                      <h4 className="text-sm font-bold text-gray-900 mt-1">
                        {req.guest_name}
                      </h4>
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        req.status === "pending"
                          ? "bg-amber-50 text-amber-600 border-amber-200"
                          : req.status === "approved"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                          : "bg-gray-50 text-gray-500 border-gray-200"
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  {/* Contact details */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {req.guest_phone}
                    </span>
                    {req.guest_email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-gray-400" />
                        {req.guest_email}
                      </span>
                    )}
                  </div>

                  {/* Stay details box */}
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Room:</span>
                      <strong className="text-gray-900">{req.rooms?.name || "Room Assigned on Review"}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Dates:</span>
                      <span className="text-gray-900 font-medium">
                        {formatISTCompactDate(req.check_in)} &rarr; {formatISTCompactDate(req.check_out)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Guests:</span>
                      <span className="text-gray-900 font-medium">{req.number_of_guests} Guest(s)</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-1.5 mt-1.5">
                      <span className="text-gray-700 font-bold">Estimated Payable:</span>
                      <strong className="text-emerald-700 font-bold">
                        ₹{(req.estimated_total || 0).toLocaleString("en-IN")} (Pay at Property)
                      </strong>
                    </div>
                  </div>

                  {/* Guest Notes */}
                  {req.notes && (
                    <div className="mt-2 text-xs text-gray-600 bg-amber-50/50 p-2 rounded-lg border border-amber-100 flex items-start gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <span>{req.notes}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {req.status === "pending" && (
                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleApprove(req.id)}
                      disabled={isProcessing}
                      className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                      Approve & Confirm
                    </button>
                    <button
                      onClick={() => handleReject(req.id)}
                      disabled={isProcessing}
                      className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Decline
                    </button>
                  </div>
                )}
              </GlassPanel>
            );
          })}
        </div>
      )}
    </div>
  );
}
