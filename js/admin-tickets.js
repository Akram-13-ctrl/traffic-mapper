import { db, isFirebasePlaceholder } from "./firebase-config.js";
import { collection, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { seedSimulationInquiries } from "./contact.js";

let allTickets = [];

document.addEventListener("DOMContentLoaded", () => {
  seedSimulationInquiries();
  loadTickets();

  // Search and filter listeners
  document.getElementById("search-tickets-input")?.addEventListener("input", filterAndRenderTickets);
  document.getElementById("filter-ticket-status")?.addEventListener("change", filterAndRenderTickets);
  document.getElementById("filter-ticket-category")?.addEventListener("change", filterAndRenderTickets);
  document.getElementById("refresh-tickets-btn")?.addEventListener("click", loadTickets);

  // Modal close handlers
  document.getElementById("close-modal-btn")?.addEventListener("click", closeModal);
  document.getElementById("modal-cancel-btn")?.addEventListener("click", closeModal);
  
  // Close modal when clicking outside
  const modal = document.getElementById("ticket-modal");
  modal?.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Action form submit
  document.getElementById("ticket-action-form")?.addEventListener("submit", handleSaveTicket);

  // Delete ticket button
  document.getElementById("modal-delete-ticket-btn")?.addEventListener("click", handleDeleteTicket);

  // Listen for background updates
  window.addEventListener("inquiries_updated", loadTickets);
});

async function loadTickets() {
  const tableBody = document.getElementById("tickets-table-body");
  if (tableBody) {
    tableBody.innerHTML = `<tr><td colspan="6" class="py-12 text-center text-slate-400">Loading tickets...</td></tr>`;
  }

  // Load from local buffer first
  const localData = JSON.parse(localStorage.getItem("inquiries") || "[]");
  allTickets = localData;

  // Try real Firestore if available
  if (!isFirebasePlaceholder && db) {
    try {
      const snapshot = await getDocs(collection(db, "inquiries"));
      if (!snapshot.empty) {
        const firestoreTickets = [];
        snapshot.forEach(docSnap => {
          firestoreTickets.push({ id: docSnap.id, ...docSnap.data() });
        });
        allTickets = firestoreTickets;
      }
    } catch (err) {
      console.warn("Using offline storage buffer for tickets:", err);
    }
  }

  // Sort descending by timestamp
  allTickets.sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0));

  updateStats();
  filterAndRenderTickets();
}

function updateStats() {
  const total = allTickets.length;
  const newCount = allTickets.filter(t => t.status === "New").length;
  const reviewCount = allTickets.filter(t => t.status === "In Review").length;
  const resolvedCount = allTickets.filter(t => t.status === "Resolved").length;

  document.getElementById("stat-total-tickets").textContent = total;
  document.getElementById("stat-new-tickets").textContent = newCount;
  document.getElementById("stat-review-tickets").textContent = reviewCount;
  document.getElementById("stat-resolved-tickets").textContent = resolvedCount;
}

function filterAndRenderTickets() {
  const tableBody = document.getElementById("tickets-table-body");
  if (!tableBody) return;

  const searchQuery = (document.getElementById("search-tickets-input")?.value || "").trim().toLowerCase();
  const statusFilter = document.getElementById("filter-ticket-status")?.value || "all";
  const categoryFilter = document.getElementById("filter-ticket-category")?.value || "all";

  const filtered = allTickets.filter(t => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (categoryFilter !== "all" && t.category !== categoryFilter) return false;

    if (searchQuery) {
      const matchId = (t.id || "").toLowerCase().includes(searchQuery);
      const matchName = (t.fullName || "").toLowerCase().includes(searchQuery);
      const matchEmail = (t.email || "").toLowerCase().includes(searchQuery);
      const matchSubject = (t.subject || "").toLowerCase().includes(searchQuery);
      const matchMsg = (t.message || "").toLowerCase().includes(searchQuery);
      if (!matchId && !matchName && !matchEmail && !matchSubject && !matchMsg) return false;
    }

    return true;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="py-12 text-center text-slate-400">
          <div class="flex flex-col items-center justify-center space-y-2">
            <span class="text-3xl">📭</span>
            <p class="text-xs font-bold text-slate-600 dark:text-slate-300">No support tickets match your filter criteria.</p>
            <p class="text-[11px] text-slate-400">All submitted citizen inquiries will show up here in real time.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(t => {
    let statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">✨ New</span>`;
    if (t.status === "In Review") {
      statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900">⏳ In Review</span>`;
    } else if (t.status === "Resolved") {
      statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">✅ Resolved</span>`;
    }

    const dateFormatted = t.timestamp ? new Date(t.timestamp).toLocaleDateString("en-MY", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }) : "Recent";

    return `
      <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
        <td class="py-4 px-5 font-mono font-bold text-blue-600 dark:text-blue-400">${t.id}</td>
        <td class="py-4 px-5">
          <p class="font-bold text-slate-900 dark:text-white">${escapeHtml(t.fullName)}</p>
          <p class="text-[10px] text-slate-400 font-mono">${escapeHtml(t.email)}</p>
        </td>
        <td class="py-4 px-5 max-w-xs">
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">${escapeHtml(t.category || 'General')}</span>
          <p class="font-bold text-slate-800 dark:text-slate-100 mt-1 line-clamp-1">${escapeHtml(t.subject)}</p>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">${escapeHtml(t.message)}</p>
        </td>
        <td class="py-4 px-5">${statusBadge}</td>
        <td class="py-4 px-5 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">${dateFormatted}</td>
        <td class="py-4 px-5 text-right">
          <button data-ticket-id="${t.id}" class="inspect-btn px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/60 font-bold rounded-lg transition-colors cursor-pointer text-xs">
            🔍 Inspect & Respond
          </button>
        </td>
      </tr>
    `;
  }).join("");

  // Attach inspection click handlers
  tableBody.querySelectorAll(".inspect-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const ticketId = btn.getAttribute("data-ticket-id");
      openTicketModal(ticketId);
    });
  });
}

function openTicketModal(ticketId) {
  const ticket = allTickets.find(t => t.id === ticketId);
  if (!ticket) return;

  document.getElementById("modal-active-id").value = ticket.id;
  document.getElementById("modal-ticket-id").textContent = ticket.id;
  document.getElementById("modal-ticket-subject").textContent = ticket.subject;
  document.getElementById("modal-ticket-name").textContent = ticket.fullName;
  document.getElementById("modal-ticket-email").textContent = ticket.email;
  document.getElementById("modal-ticket-category").textContent = ticket.category || "General Road Inquiry";
  document.getElementById("modal-ticket-message").textContent = ticket.message;
  document.getElementById("modal-status-select").value = ticket.status || "New";
  document.getElementById("modal-notes-input").value = ticket.adminNotes || "";

  const timeFormatted = ticket.timestamp ? new Date(ticket.timestamp).toLocaleString("en-MY") : "Recent";
  document.getElementById("modal-ticket-time").textContent = timeFormatted;

  // Status badge inside modal
  const badge = document.getElementById("modal-ticket-status-badge");
  badge.textContent = ticket.status;
  badge.className = "px-2.5 py-0.5 rounded-full text-[10px] font-bold ";
  if (ticket.status === "New") {
    badge.className += "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300";
  } else if (ticket.status === "In Review") {
    badge.className += "bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300";
  } else {
    badge.className += "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300";
  }

  // Mailto link setup
  const mailtoBtn = document.getElementById("modal-mailto-btn");
  if (mailtoBtn) {
    const subjectEncoded = encodeURIComponent(`RE: [${ticket.id}] ${ticket.subject}`);
    const bodyEncoded = encodeURIComponent(`Dear ${ticket.fullName},\n\nThank you for reaching out to the Road Safety Administration.\nRegarding your ticket #${ticket.id} (${ticket.subject}):\n\n\nBest regards,\nRoad Safety Research & Operations Team`);
    mailtoBtn.href = `mailto:${ticket.email}?subject=${subjectEncoded}&body=${bodyEncoded}`;
  }

  const modal = document.getElementById("ticket-modal");
  modal?.classList.remove("hidden");
}

function closeModal() {
  document.getElementById("ticket-modal")?.classList.add("hidden");
}

async function handleSaveTicket(e) {
  e.preventDefault();

  const ticketId = document.getElementById("modal-active-id").value;
  const newStatus = document.getElementById("modal-status-select").value;
  const notes = document.getElementById("modal-notes-input").value.trim();

  const index = allTickets.findIndex(t => t.id === ticketId);
  if (index !== -1) {
    allTickets[index].status = newStatus;
    allTickets[index].adminNotes = notes;

    // Save to local storage
    localStorage.setItem("inquiries", JSON.stringify(allTickets));
    window.dispatchEvent(new CustomEvent("inquiries_updated"));

    // Sync to Firestore if active
    if (!isFirebasePlaceholder && db) {
      try {
        await updateDoc(doc(db, "inquiries", ticketId), {
          status: newStatus,
          adminNotes: notes
        });
      } catch (err) {
        console.warn("Firestore sync deferred:", err);
      }
    }

    closeModal();
    updateStats();
    filterAndRenderTickets();
  }
}

async function handleDeleteTicket() {
  const ticketId = document.getElementById("modal-active-id").value;
  if (!confirm(`Are you sure you want to permanently delete ticket ${ticketId}?`)) return;

  allTickets = allTickets.filter(t => t.id !== ticketId);
  localStorage.setItem("inquiries", JSON.stringify(allTickets));
  window.dispatchEvent(new CustomEvent("inquiries_updated"));

  if (!isFirebasePlaceholder && db) {
    try {
      await deleteDoc(doc(db, "inquiries", ticketId));
    } catch (err) {
      console.warn("Firestore delete deferred:", err);
    }
  }

  closeModal();
  updateStats();
  filterAndRenderTickets();
}

function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
