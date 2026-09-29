import { getCurrentUser, updateAdminProfile, createAdminAccount, getUsersList } from "./auth.js";

document.addEventListener("DOMContentLoaded", () => {
  loadAdminProfile();
  loadAdminsDirectory();

  // Profile edit form
  document.getElementById("edit-profile-form")?.addEventListener("submit", handleSaveProfile);

  // Create admin account form
  document.getElementById("create-admin-form")?.addEventListener("submit", handleCreateAdmin);

  // Listen for user updates
  window.addEventListener("users_updated", loadAdminsDirectory);
  window.addEventListener("user_profile_updated", loadAdminProfile);
});

function loadAdminProfile() {
  const user = getCurrentUser();
  if (!user) return;

  const displayName = user.fullName || "System Administrator";
  document.getElementById("profile-display-name").textContent = displayName;
  document.getElementById("profile-name-input").value = displayName;
  document.getElementById("profile-email-input").value = user.email || "";
  
  if (user.agency) {
    document.getElementById("profile-agency-input").value = user.agency;
  }
  if (user.phone) {
    document.getElementById("profile-phone-input").value = user.phone;
  }

  // Initials
  const initials = displayName
    .split(" ")
    .map(p => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "AD";
  document.getElementById("profile-avatar-initials").textContent = initials;
}

async function handleSaveProfile(e) {
  e.preventDefault();
  const alertBox = document.getElementById("profile-status-alert");
  const saveBtn = document.getElementById("save-profile-btn");

  const fullName = document.getElementById("profile-name-input")?.value.trim();
  const agency = document.getElementById("profile-agency-input")?.value;
  const phone = document.getElementById("profile-phone-input")?.value.trim();

  if (!fullName) {
    showAlert(alertBox, "Full name cannot be empty.", "error");
    return;
  }

  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving...";
  }

  try {
    await updateAdminProfile({ fullName, agency, phone });
    showAlert(alertBox, "Your administrator profile has been successfully updated.", "success");
    loadAdminProfile();
    loadAdminsDirectory();
  } catch (err) {
    showAlert(alertBox, err.message || "Failed to update profile.", "error");
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.textContent = "Save Profile Changes";
    }
  }
}

async function handleCreateAdmin(e) {
  e.preventDefault();
  const statusBox = document.getElementById("create-admin-status");
  const submitBtn = document.getElementById("create-admin-btn");

  const fullName = document.getElementById("new-admin-name")?.value.trim();
  const email = document.getElementById("new-admin-email")?.value.trim();
  const agency = document.getElementById("new-admin-agency")?.value;
  const phone = document.getElementById("new-admin-phone")?.value.trim();
  const password = document.getElementById("new-admin-password")?.value;
  const confirmPassword = document.getElementById("new-admin-confirm-password")?.value;

  if (!fullName || !email || !password || !agency) {
    showAlert(statusBox, "Please fill in all required fields.", "error");
    return;
  }

  if (password !== confirmPassword) {
    showAlert(statusBox, "Passwords do not match. Please re-enter.", "error");
    return;
  }

  if (password.length < 6) {
    showAlert(statusBox, "Password must be at least 6 characters.", "error");
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span>Creating Account...</span>`;
  }

  try {
    await createAdminAccount({ fullName, email, password, agency, phone });
    showAlert(statusBox, `Success! Administrator account for "${fullName}" (${email}) was created successfully.`, "success");
    document.getElementById("create-admin-form")?.reset();
    loadAdminsDirectory();
  } catch (err) {
    showAlert(statusBox, err.message || "Failed to create administrator account.", "error");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>➕ Create Administrator Account</span>`;
    }
  }
}

async function loadAdminsDirectory() {
  const tbody = document.getElementById("admins-table-body");
  const countBadge = document.getElementById("admins-count-badge");
  if (!tbody) return;

  try {
    const allUsers = await getUsersList();
    const admins = allUsers.filter(u => u.role === "admin");
    const currentUser = getCurrentUser();
    const currentEmail = (currentUser?.email || "").toLowerCase().trim();
    const currentUid = currentUser?.uid || "";

    if (countBadge) {
      countBadge.textContent = `${admins.length} Active Admins`;
    }

    if (admins.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-slate-400">No administrators found.</td></tr>`;
      return;
    }

    tbody.innerHTML = admins.map(admin => {
      const isSelf = Boolean(
        (currentUid && admin.uid === currentUid) ||
        (currentEmail && admin.email && admin.email.toLowerCase().trim() === currentEmail)
      );

      const createdFormatted = admin.createdAt 
        ? new Date(admin.createdAt).toLocaleDateString("en-MY", { year: "numeric", month: "short", day: "numeric" })
        : "Active";

      const agency = admin.agency || "Public Works Department (JKR)";

      return `
        <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${isSelf ? 'bg-emerald-50/20' : ''}">
          <td class="py-3 px-4 font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <span class="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
              ${(admin.fullName || 'A').charAt(0)}
            </span>
            <div class="flex items-center gap-2">
              <span>${escapeHtml(admin.fullName || 'Administrator')}</span>
              ${isSelf ? '<span class="px-1.5 py-0.5 text-[9px] font-bold font-mono bg-emerald-100 text-emerald-800 rounded">YOU</span>' : ''}
            </div>
          </td>
          <td class="py-3 px-4 font-mono text-xs text-blue-600 dark:text-blue-400">${escapeHtml(admin.email)}</td>
          <td class="py-3 px-4 text-slate-600 dark:text-slate-300">${escapeHtml(agency)}</td>
          <td class="py-3 px-4">
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${isSelf ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}">
              ● ${isSelf ? 'Current Session' : 'Active'}
            </span>
          </td>
          <td class="py-3 px-4 font-mono text-slate-400 text-xs">${createdFormatted}</td>
        </tr>
      `;
    }).join("");

  } catch (err) {
    console.error("Error loading admins directory:", err);
    tbody.innerHTML = `<tr><td colspan="5" class="py-6 text-center text-red-500">Failed to load administrators directory.</td></tr>`;
  }
}

function showAlert(container, text, type) {
  if (!container) return;
  container.classList.remove("hidden", "bg-emerald-50", "text-emerald-800", "border-emerald-200", "bg-red-50", "text-red-800", "border-red-200", "border");
  if (type === "success") {
    container.classList.add("bg-emerald-50", "dark:bg-emerald-950/60", "text-emerald-800", "dark:text-emerald-300", "border", "border-emerald-200", "dark:border-emerald-800");
    container.innerHTML = `<strong>✓</strong> ${text}`;
  } else {
    container.classList.add("bg-red-50", "dark:bg-red-950/60", "text-red-800", "dark:text-red-300", "border", "border-red-200", "dark:border-red-800");
    container.innerHTML = `<strong>⚠️</strong> ${text}`;
  }
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
