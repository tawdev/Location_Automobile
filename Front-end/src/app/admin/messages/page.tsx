"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/LanguageProvider";
import {
  fetchMessages, fetchMessage, replyToMessage, deleteMessage,
  type ContactMessage, type PaginatedMessages,
} from "@/lib/adminMessagesApi";
import type { ApiError } from "@/lib/apiClient";
import {
  Mail, ChevronLeft, ChevronRight, Trash2, Reply, Send, Loader2,
  CheckCircle, Clock, MessageSquare, X, Eye, EyeOff, AlertCircle, Search,
} from "lucide-react";

function StatusBadge({ readAt, adminReply, t }: { readAt: string | null; adminReply: string | null; t: (key: string) => string }) {
  if (adminReply) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700 border border-green-200">
        <CheckCircle className="w-3 h-3" /> {t("admin.replied")}
      </span>
    );
  }
  if (readAt) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">
        <Eye className="w-3 h-3" /> {t("admin.read")}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
      <Clock className="w-3 h-3" /> {t("admin.unread")}
    </span>
  );
}

export default function AdminMessagesPage() {
  const { t } = useI18n();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [pagination, setPagination] = useState<Omit<PaginatedMessages, "data"> | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState("");
  const [replySuccess, setReplySuccess] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadMessages = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchMessages({
        status: statusFilter || undefined,
        page,
        search: debouncedSearch || undefined,
      });
      setMessages(res.data);
      setPagination({
        current_page: res.current_page,
        last_page: res.last_page,
        per_page: res.per_page,
        total: res.total,
      });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [statusFilter, page, debouncedSearch]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch]);

  async function openDetail(msg: ContactMessage) {
    setDetailLoading(true);
    setSelected(msg);
    setReplyText("");
    setReplyError("");
    setReplySuccess(false);
    try {
      const updated = await fetchMessage(msg.id);
      setSelected(updated);
      setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    } catch {
      // keep local data
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selected || !replyText.trim()) return;
    setReplySubmitting(true);
    setReplyError("");
    setReplySuccess(false);
    try {
      const updated = await replyToMessage(selected.id, replyText.trim());
      setSelected(updated);
      setReplySuccess(true);
      setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      setTimeout(() => setReplySuccess(false), 3000);
    } catch (err) {
      setReplyError((err as ApiError)?.message ?? t("admin.reply_failed"));
    } finally {
      setReplySubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    try {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch {
      // ignore
    }
    setDeleteConfirm(null);
  }

  const filters = [
    { label: t("admin.all"), value: "" },
    { label: t("admin.unread"), value: "unread" },
    { label: t("admin.read"), value: "read" },
    { label: t("admin.replied"), value: "replied" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#395886] dark:text-[#D5DEEF] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#395886] to-[#2b4c7e] flex items-center justify-center shadow-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            {t("admin.messages")}
          </h1>
          <p className="text-sm font-semibold text-[#638ECB] dark:text-[#94A3B8] mt-1">
            {pagination ? `${pagination.total} ${t("admin.total")}` : t("admin.messages_description")}
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === f.value
                  ? "bg-[#395886] text-white shadow-md"
                  : "bg-white dark:bg-[#0f1729] text-[#638ECB] dark:text-[#94A3B8] border border-[#D5DEEF] dark:border-[#1e293b] hover:bg-[#F0F3FA] dark:hover:bg-[#1e293b]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#638ECB] dark:text-[#94A3B8] pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("admin.messages_search_placeholder")}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 bg-white dark:bg-[#0f1729] text-xs font-semibold text-[#395886] dark:text-[#D5DEEF] placeholder:text-[#638ECB]/60 dark:placeholder:text-[#94A3B8]/60 focus:outline-none focus:ring-2 focus:ring-[#395886]/20 focus:border-[#395886] transition-all shadow-sm"
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-[#0f1729] rounded-2xl border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-[#638ECB]" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Mail className="w-12 h-12 text-[#D5DEEF] dark:text-[#1e293b] mb-4" />
            <p className="text-sm font-bold text-[#638ECB] dark:text-[#94A3B8]">{t("admin.messages_no_results")}</p>
          </div>
        ) : (
          <div className="divide-y divide-[#D5DEEF]/40 dark:divide-[#1e293b]/70">
            {messages.map((msg) => (
              <button
                key={msg.id}
                type="button"
                onClick={() => openDetail(msg)}
                className={`w-full text-left px-6 py-4 flex items-center gap-4 hover:bg-[#F0F3FA] dark:hover:bg-[#1e293b] transition-colors cursor-pointer ${
                  selected?.id === msg.id ? "bg-[#F0F3FA] dark:bg-[#1e293b]" : ""
                }`}
              >
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                  msg.admin_reply
                    ? "bg-green-100 dark:bg-green-900/30"
                    : msg.read_at
                    ? "bg-blue-100 dark:bg-blue-900/30"
                    : "bg-amber-100 dark:bg-amber-900/30"
                }`}>
                  <Mail className={`w-5 h-5 ${
                    msg.admin_reply
                      ? "text-green-600 dark:text-green-400"
                      : msg.read_at
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-bold text-[#395886] dark:text-[#D5DEEF] truncate">
                      {msg.name}
                    </span>
                    <span className="text-[11px] font-semibold text-[#638ECB] dark:text-[#94A3B8]">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-[#638ECB] dark:text-[#94A3B8] truncate">
                    {msg.subject}
                  </p>
                </div>
                <StatusBadge readAt={msg.read_at} adminReply={msg.admin_reply} t={t} />
              </button>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#D5DEEF]/40 dark:border-[#1e293b]/70">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[#638ECB] hover:text-[#395886] disabled:opacity-30 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> {t("admin.prev")}
            </button>
            <span className="text-xs font-bold text-[#638ECB] dark:text-[#94A3B8]">
              {t("admin.page_of").replace("{current}", String(pagination.current_page)).replace("{total}", String(pagination.last_page))}
            </span>
            <button
              type="button"
              disabled={page >= pagination.last_page}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-[#638ECB] hover:text-[#395886] disabled:opacity-30 transition-colors cursor-pointer"
            >
              {t("admin.next")} <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Detail / Reply Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0f1729] rounded-2xl border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              {detailLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-6 h-6 animate-spin text-[#638ECB]" />
                </div>
              ) : (
                <>
                  {/* Modal Header */}
                  <div className="flex items-start justify-between px-6 py-5 border-b border-[#D5DEEF]/40 dark:border-[#1e293b]/70">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-lg font-black text-[#395886] dark:text-[#D5DEEF] truncate">
                          {selected.subject}
                        </h2>
                        <StatusBadge readAt={selected.read_at} adminReply={selected.admin_reply} />
                      </div>
                      <p className="text-xs font-semibold text-[#638ECB] dark:text-[#94A3B8]">
                        {t("admin.from")} <span className="font-bold">{selected.name}</span> &lt;{selected.email}&gt;
                        &middot; {new Date(selected.created_at).toLocaleString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="shrink-0 ml-4 w-8 h-8 rounded-lg hover:bg-[#F0F3FA] dark:hover:bg-[#1e293b] flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4 text-[#638ECB]" />
                    </button>
                  </div>

                  {/* Message Body */}
                  <div className="px-6 py-5 border-b border-[#D5DEEF]/40 dark:border-[#1e293b]/70">
                    <div className="bg-[#F0F3FA] dark:bg-[#1e293b]/50 rounded-xl px-5 py-4 text-sm font-semibold text-[#395886] dark:text-[#D5DEEF] leading-relaxed whitespace-pre-wrap">
                      {selected.message}
                    </div>
                  </div>

                  {/* Admin Reply (if exists) */}
                  {selected.admin_reply && (
                    <div className="px-6 py-5 border-b border-[#D5DEEF]/40 dark:border-[#1e293b]/70">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                          <Reply className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                        </div>
                        <span className="text-xs font-extrabold text-green-700 dark:text-green-400 uppercase tracking-wider">
                          {t("admin.your_reply")}
                        </span>
                      </div>
                      <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 rounded-xl px-5 py-4 text-sm font-semibold text-[#395886] dark:text-[#D5DEEF] leading-relaxed whitespace-pre-wrap">
                        {selected.admin_reply}
                      </div>
                    </div>
                  )}

                  {/* Reply Form */}
                  {!selected.admin_reply && (
                    <form onSubmit={handleReply} className="px-6 py-5">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-7 h-7 rounded-lg bg-[#F0F3FA] dark:bg-[#1e293b] flex items-center justify-center">
                          <Reply className="w-3.5 h-3.5 text-[#395886] dark:text-[#f39c12]" />
                        </div>
                        <span className="text-xs font-extrabold text-[#395886] dark:text-[#D5DEEF] uppercase tracking-wider">
                          {t("admin.reply")}
                        </span>
                      </div>
                      <textarea
                        rows={4}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={t("admin.write_reply")}
                        className="w-full px-4 py-3 rounded-xl border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 bg-[#F0F3FA]/50 dark:bg-[#1e293b]/30 text-sm font-semibold text-[#395886] dark:text-[#D5DEEF] placeholder:text-[#638ECB]/40 focus:outline-none focus:ring-2 focus:ring-[#395886]/20 focus:border-[#395886]/50 transition-all resize-none"
                      />
                      {replyError && (
                        <div className="flex items-center gap-2 mt-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-xs font-bold text-red-600 dark:text-red-400">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          {replyError}
                        </div>
                      )}
                      {replySuccess && (
                        <div className="flex items-center gap-2 mt-3 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-xs font-bold text-green-600 dark:text-green-400">
                          <CheckCircle className="w-4 h-4 shrink-0" />
                          {t("admin.reply_sent")}
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-4">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(selected.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> {t("admin.delete")}
                        </button>
                        <button
                          type="submit"
                          disabled={replySubmitting || !replyText.trim()}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#395886] to-[#2b4c7e] text-white text-xs font-extrabold shadow-lg hover:shadow-xl disabled:opacity-50 transition-all cursor-pointer"
                        >
                          {replySubmitting ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Send className="w-3.5 h-3.5" />
                          )}
                          {t("admin.send_reply")}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Already replied - actions */}
                  {selected.admin_reply && (
                    <div className="px-6 py-4 border-t border-[#D5DEEF]/40 dark:border-[#1e293b]/70 flex justify-between items-center">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(selected.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> {t("admin.delete")}
                      </button>
                      <span className="text-[11px] font-semibold text-[#638ECB] dark:text-[#94A3B8]">
                        {t("admin.replied_on").replace("{date}", new Date(selected.updated_at).toLocaleString())}
                      </span>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {deleteConfirm !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-[#0f1729] rounded-2xl border border-[#D5DEEF]/40 dark:border-[#1e293b]/70 shadow-2xl p-6 max-w-sm w-full text-center"
            >
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <h3 className="text-lg font-black text-[#395886] dark:text-[#D5DEEF] mb-2">{t("admin.delete_message_confirm")}</h3>
              <p className="text-sm font-semibold text-[#638ECB] dark:text-[#94A3B8] mb-6">
                {t("admin.delete_message_warning")}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="px-5 py-2.5 rounded-xl border border-[#D5DEEF] dark:border-[#1e293b] text-xs font-bold text-[#638ECB] hover:bg-[#F0F3FA] dark:hover:bg-[#1e293b] transition-colors cursor-pointer"
                >
                  {t("admin.cancel")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteConfirm)}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  {t("admin.delete")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
