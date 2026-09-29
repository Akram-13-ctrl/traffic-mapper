/**
 * AI Road Safety Chatbot Assistant (Gemini API)
 * Floating interactive widget for user and admin interfaces.
 */

class AIChatWidget {
  constructor() {
    this.isOpen = false;
    this.isLoading = false;
    this.history = [];
    this.init();
  }

  init() {
    if (document.getElementById("ai-chat-widget-root")) return;

    const root = document.createElement("div");
    root.id = "ai-chat-widget-root";
    root.className = "fixed bottom-6 right-6 z-50 font-sans select-none";
    root.innerHTML = `
      <!-- Floating Toggle Bubble -->
      <button id="ai-chat-toggle-btn" class="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 focus:outline-none cursor-pointer relative group">
        <span class="text-2xl transition-transform duration-300" id="ai-chat-toggle-icon">💬</span>
        <span class="absolute -top-1 -right-1 flex h-4 w-4">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
        </span>
        <!-- Tooltip -->
        <span class="absolute right-16 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          AI Road Safety Assistant
        </span>
      </button>

      <!-- Expandable Chat Window -->
      <div id="ai-chat-window" class="hidden absolute bottom-16 right-0 w-[360px] sm:w-[400px] h-[540px] max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right">
        <!-- Header -->
        <div class="px-5 py-4 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white flex items-center justify-between shadow-xs">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-lg shadow-inner">
              🤖
            </div>
            <div>
              <h3 class="font-bold text-sm tracking-tight leading-tight">Road Safety AI Assistant</h3>
              <p class="text-[11px] text-blue-100 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                Gemini 3.8 Transport Specialist
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1.5">
            <button id="ai-chat-faq-btn" title="Road Safety Q&A Topics" class="px-2 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1">
              <span>📚</span>
              <span>Topics</span>
            </button>
            <button id="ai-chat-clear-btn" title="Clear Conversation" class="p-1.5 hover:bg-white/15 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer text-xs">
              🗑️
            </button>
            <button id="ai-chat-close-btn" title="Minimize Chat" class="p-1.5 hover:bg-white/15 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer text-sm font-bold">
              ✕
            </button>
          </div>
        </div>

        <!-- Grounding Sub-header Banner -->
        <div class="px-4 py-2 bg-blue-50 dark:bg-slate-800/80 border-b border-blue-100 dark:border-slate-800 text-[11px] text-blue-800 dark:text-blue-300 flex items-center justify-between">
          <span>Official Road Safety Database (JPJ / JKR / MIROS)</span>
          <span class="text-[10px] font-bold px-1.5 py-0.5 bg-blue-200/60 dark:bg-blue-900/60 rounded">Verified</span>
        </div>

        <!-- Interactive Road Safety Q&A Categories Panel (Collapsible) -->
        <div id="ai-chat-faq-panel" class="hidden max-h-[65%] overflow-y-auto bg-slate-50 dark:bg-slate-800/95 border-b border-slate-200 dark:border-slate-700 p-3 space-y-2 text-xs transition-all z-20">
          <div class="flex items-center justify-between">
            <span class="font-bold text-slate-800 dark:text-white font-mono text-[11px] uppercase">Road Safety Knowledge Base</span>
            <button id="ai-chat-close-faq" class="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs cursor-pointer font-bold">✕ Close</button>
          </div>
          <div id="ai-chat-faq-categories" class="grid grid-cols-2 gap-1.5"></div>
          <div id="ai-chat-faq-questions" class="hidden space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-700"></div>
        </div>

        <!-- Messages Area -->
        <div id="ai-chat-messages" class="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs text-slate-800 dark:text-slate-200 scroll-smooth">
          <!-- Welcome Message -->
          <div class="flex items-start gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-sm shrink-0">
              🤖
            </div>
            <div class="bg-slate-100 dark:bg-slate-800 p-3.5 rounded-2xl rounded-tl-sm max-w-[85%] space-y-1.5 shadow-2xs">
              <p class="font-semibold text-slate-900 dark:text-white">Hello! I am your Road Safety & GIS Assistant.</p>
              <p class="text-slate-600 dark:text-slate-300 leading-relaxed">
                I can answer official questions on <strong>Traffic Rules, Right of Way, Road Signs, Highway Driving, Emergencies, Adverse Weather, Vehicle Safety, and KEJARA Demerit Points</strong>. Click <strong>📚 Topics</strong> above or ask any question!
              </p>
            </div>
          </div>
        </div>

        <!-- Quick Prompts (Horizontal Scroll) -->
        <div id="ai-chat-chips" class="px-3 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button class="chip-prompt whitespace-nowrap px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 text-[11px] font-medium rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer" data-prompt="What is the national speed limit on expressways?">
            🚗 Speed Limits
          </button>
          <button class="chip-prompt whitespace-nowrap px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 text-[11px] font-medium rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer" data-prompt="Who has the right of way in a roundabout?">
            🔄 Roundabout Rules
          </button>
          <button class="chip-prompt whitespace-nowrap px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 text-[11px] font-medium rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer" data-prompt="What should I do if my brakes fail while driving down a hill?">
            🛑 Brake Failure
          </button>
          <button class="chip-prompt whitespace-nowrap px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 text-[11px] font-medium rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer" data-prompt="What does a yellow box junction mean and what are the rules for it?">
            🟨 Yellow Box Rules
          </button>
          <button class="chip-prompt whitespace-nowrap px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 text-[11px] font-medium rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer" data-prompt="What is the legal blood alcohol concentration (BAC) limit?">
            🍷 BAC Limit
          </button>
          <button class="chip-prompt whitespace-nowrap px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 text-[11px] font-medium rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer" data-prompt="How many demerit points do I get for running a red light?">
            🚦 Red Light Demerits
          </button>
          <button class="chip-prompt whitespace-nowrap px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 text-[11px] font-medium rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer" data-prompt="What should I do if my vehicle starts aquaplaning or hydroplaning?">
            🌊 Aquaplaning
          </button>
          <button class="chip-prompt whitespace-nowrap px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 text-[11px] font-medium rounded-full border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer" data-prompt="What are effective engineering mitigations for high-accident roads?">
            🛠️ Mitigations
          </button>
        </div>

        <!-- Input Bar -->
        <div class="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <textarea id="ai-chat-input" rows="1" placeholder="Ask about road safety, blackspots..." class="flex-1 resize-none px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-500 dark:text-white placeholder:text-slate-400 max-h-24"></textarea>
          <button id="ai-chat-send-btn" class="w-9 h-9 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm">
            <svg class="w-4 h-4 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(root);
    this.bindEvents();
  }

  bindEvents() {
    const toggleBtn = document.getElementById("ai-chat-toggle-btn");
    const closeBtn = document.getElementById("ai-chat-close-btn");
    const clearBtn = document.getElementById("ai-chat-clear-btn");
    const sendBtn = document.getElementById("ai-chat-send-btn");
    const input = document.getElementById("ai-chat-input");

    toggleBtn?.addEventListener("click", () => this.toggleChat());
    closeBtn?.addEventListener("click", () => this.closeChat());
    clearBtn?.addEventListener("click", () => this.clearChat());

    sendBtn?.addEventListener("click", () => this.sendMessage());

    const faqBtn = document.getElementById("ai-chat-faq-btn");
    const closeFaqBtn = document.getElementById("ai-chat-close-faq");
    faqBtn?.addEventListener("click", () => this.toggleFaqPanel());
    closeFaqBtn?.addEventListener("click", () => this.hideFaqPanel());

    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    document.querySelectorAll(".chip-prompt").forEach((chip) => {
      chip.addEventListener("click", (e) => {
        const prompt = e.currentTarget.getAttribute("data-prompt");
        if (prompt && input) {
          input.value = prompt;
          this.sendMessage();
        }
      });
    });
  }

  toggleFaqPanel() {
    const panel = document.getElementById("ai-chat-faq-panel");
    if (!panel) return;
    if (panel.classList.contains("hidden")) {
      panel.classList.remove("hidden");
      this.loadFaqCategories();
    } else {
      panel.classList.add("hidden");
    }
  }

  hideFaqPanel() {
    document.getElementById("ai-chat-faq-panel")?.classList.add("hidden");
  }

  async loadFaqCategories() {
    const catContainer = document.getElementById("ai-chat-faq-categories");
    const qContainer = document.getElementById("ai-chat-faq-questions");
    if (!catContainer) return;
    if (catContainer.children.length > 0) return; // already loaded

    const categories = [
      { name: "Traffic Rules & Right of Way", icon: "🚦" },
      { name: "Road Signs, Signals & Markings", icon: "🛑" },
      { name: "Highway Driving & Overtaking", icon: "🛣️" },
      { name: "Emergencies & Breakdowns", icon: "🚨" },
      { name: "Adverse Weather & Environmental Conditions", icon: "🌧️" },
      { name: "Vehicle Safety Features & Maintenance", icon: "🚗" },
      { name: "Vulnerable Road Users (Pedestrians, Cyclists, Motorcycles)", icon: "🚴" },
      { name: "Licensing, Demerits (KEJARA), & Administration", icon: "🪪" }
    ];

    catContainer.innerHTML = categories.map(c => `
      <button class="faq-category-btn p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 text-left transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs" data-category="${c.name}">
        <span class="text-sm shrink-0">${c.icon}</span>
        <span class="text-[10px] font-semibold text-slate-800 dark:text-slate-200 leading-tight line-clamp-2">${c.name}</span>
      </button>
    `).join("");

    catContainer.querySelectorAll(".faq-category-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const cat = btn.getAttribute("data-category");
        if (cat) this.loadCategoryQuestions(cat);
      });
    });
  }

  async loadCategoryQuestions(category) {
    const qContainer = document.getElementById("ai-chat-faq-questions");
    if (!qContainer) return;
    qContainer.classList.remove("hidden");
    qContainer.innerHTML = `<div class="text-[11px] text-slate-500 py-1 flex items-center gap-1"><span class="animate-spin">⏳</span> Loading ${category} questions...</div>`;

    try {
      const res = await fetch(`/api/road-safety-qna?category=${encodeURIComponent(category)}`);
      const data = await res.json();
      const questions = data.questions || [];

      if (questions.length === 0) {
        qContainer.innerHTML = `<div class="text-[11px] text-slate-500">No questions found.</div>`;
        return;
      }

      qContainer.innerHTML = `
        <div class="flex items-center justify-between text-[11px] font-bold text-blue-600 dark:text-blue-400">
          <span>${category} (${questions.length} questions):</span>
          <button id="ai-chat-hide-questions" class="text-slate-400 hover:text-slate-600 text-[10px] font-normal cursor-pointer">▲ Hide</button>
        </div>
        <div class="space-y-1 max-h-48 overflow-y-auto">
          ${questions.map(q => `
            <div class="faq-question-item p-2 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer transition-colors text-[11px] text-slate-800 dark:text-slate-200 font-medium" data-question="${q.question}">
              ❓ ${q.question}
            </div>
          `).join("")}
        </div>
      `;

      document.getElementById("ai-chat-hide-questions")?.addEventListener("click", () => {
        qContainer.classList.add("hidden");
      });

      qContainer.querySelectorAll(".faq-question-item").forEach(item => {
        item.addEventListener("click", () => {
          const qText = item.getAttribute("data-question");
          const input = document.getElementById("ai-chat-input");
          if (qText && input) {
            input.value = qText;
            this.hideFaqPanel();
            this.sendMessage();
          }
        });
      });
    } catch {
      qContainer.innerHTML = `<div class="text-[11px] text-red-500">Failed to load questions.</div>`;
    }
  }

  toggleChat() {
    this.isOpen = !this.isOpen;
    const win = document.getElementById("ai-chat-window");
    const icon = document.getElementById("ai-chat-toggle-icon");
    if (this.isOpen) {
      win?.classList.remove("hidden");
      if (icon) icon.textContent = "✕";
      setTimeout(() => document.getElementById("ai-chat-input")?.focus(), 100);
    } else {
      win?.classList.add("hidden");
      if (icon) icon.textContent = "💬";
    }
  }

  closeChat() {
    this.isOpen = false;
    document.getElementById("ai-chat-window")?.classList.add("hidden");
    const icon = document.getElementById("ai-chat-toggle-icon");
    if (icon) icon.textContent = "💬";
  }

  clearChat() {
    this.history = [];
    const container = document.getElementById("ai-chat-messages");
    if (container) {
      container.innerHTML = `
        <div class="flex items-start gap-2.5">
          <div class="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-sm shrink-0">
            🤖
          </div>
          <div class="bg-slate-100 dark:bg-slate-800 p-3.5 rounded-2xl rounded-tl-sm max-w-[85%] space-y-1.5 shadow-2xs">
            <p class="font-semibold text-slate-900 dark:text-white">Conversation cleared.</p>
            <p class="text-slate-600 dark:text-slate-300 leading-relaxed">
              How else can I assist your road safety analysis?
            </p>
          </div>
        </div>
      `;
    }
  }

  async sendMessage() {
    if (this.isLoading) return;
    const input = document.getElementById("ai-chat-input");
    const text = input?.value?.trim();
    if (!text) return;

    input.value = "";
    this.appendUserMessage(text);
    this.history.push({ role: "user", text });

    this.showTypingIndicator();
    this.isLoading = true;

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: this.history })
      });

      const data = await response.json();
      this.removeTypingIndicator();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reach AI Chat endpoint.");
      }

      const reply = data.reply || "No response received.";
      this.history.push({ role: "model", text: reply });
      this.appendBotMessage(reply);
    } catch (err) {
      this.removeTypingIndicator();
      this.appendErrorMessage(err.message || "Failed to contact road safety AI.");
    } finally {
      this.isLoading = false;
    }
  }

  appendUserMessage(text) {
    const container = document.getElementById("ai-chat-messages");
    if (!container) return;

    const div = document.createElement("div");
    div.className = "flex justify-end";
    div.innerHTML = `
      <div class="bg-blue-600 text-white p-3 rounded-2xl rounded-tr-sm max-w-[85%] shadow-sm leading-relaxed whitespace-pre-wrap">
        ${this.escapeHtml(text)}
      </div>
    `;
    container.appendChild(div);
    this.scrollToBottom();
  }

  appendBotMessage(text) {
    const container = document.getElementById("ai-chat-messages");
    if (!container) return;

    const div = document.createElement("div");
    div.className = "flex items-start gap-2.5";
    div.innerHTML = `
      <div class="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-sm shrink-0 mt-0.5">
        🤖
      </div>
      <div class="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 p-3.5 rounded-2xl rounded-tl-sm max-w-[85%] shadow-2xs leading-relaxed space-y-2">
        ${this.formatMarkdown(text)}
      </div>
    `;
    container.appendChild(div);
    this.scrollToBottom();
  }

  appendErrorMessage(text) {
    const container = document.getElementById("ai-chat-messages");
    if (!container) return;

    const div = document.createElement("div");
    div.className = "flex items-start gap-2.5";
    div.innerHTML = `
      <div class="w-7 h-7 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-sm shrink-0">
        ⚠️
      </div>
      <div class="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 p-3 rounded-2xl text-xs max-w-[85%] border border-red-200 dark:border-red-900">
        ${this.escapeHtml(text)}
      </div>
    `;
    container.appendChild(div);
    this.scrollToBottom();
  }

  showTypingIndicator() {
    const container = document.getElementById("ai-chat-messages");
    if (!container) return;

    const div = document.createElement("div");
    div.id = "ai-chat-typing";
    div.className = "flex items-center gap-2 text-slate-400 dark:text-slate-500 text-xs pl-9";
    div.innerHTML = `
      <span class="inline-flex gap-1 items-center bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl">
        <span class="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
        <span class="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.15s"></span>
        <span class="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style="animation-delay: 0.3s"></span>
      </span>
      <span class="text-[10px] text-slate-400">Assistant analyzing...</span>
    `;
    container.appendChild(div);
    this.scrollToBottom();
  }

  removeTypingIndicator() {
    document.getElementById("ai-chat-typing")?.remove();
  }

  scrollToBottom() {
    const container = document.getElementById("ai-chat-messages");
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  formatMarkdown(md) {
    let html = this.escapeHtml(md);

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h4 class="font-bold text-slate-900 dark:text-white mt-2 mb-1">$1</h4>');
    html = html.replace(/^#### (.*$)/gim, '<h5 class="font-semibold text-slate-800 dark:text-slate-200 mt-1 mb-0.5">$1</h5>');

    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900 dark:text-white">$1</strong>');
    
    // Bullet points
    html = html.replace(/^\* (.*$)/gim, '<div class="flex items-start gap-1.5 pl-1 my-0.5"><span class="text-blue-500">•</span><span>$1</span></div>');
    html = html.replace(/^- (.*$)/gim, '<div class="flex items-start gap-1.5 pl-1 my-0.5"><span class="text-blue-500">•</span><span>$1</span></div>');

    // Numbered lists
    html = html.replace(/^(\d+)\. (.*$)/gim, '<div class="flex items-start gap-1.5 pl-1 my-0.5"><span class="font-bold text-blue-600 dark:text-blue-400 text-[11px]">$1.</span><span>$2</span></div>');

    // Paragraph breaks
    html = html.replace(/\n\n/g, '<div class="h-2"></div>');

    return html;
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => new AIChatWidget());
} else {
  new AIChatWidget();
}
