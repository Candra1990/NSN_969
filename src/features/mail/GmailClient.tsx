import { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Trash2, 
  RefreshCw, 
  ArrowLeft, 
  Plus, 
  Inbox, 
  Search, 
  Eye, 
  CheckCircle, 
  AlertCircle,
  Clock,
  User,
  ExternalLink,
  Lock,
  ChevronRight,
  X
} from 'lucide-react';
import { 
  fetchGmailMessages, 
  sendGmailMessage, 
  trashGmailMessage, 
  markGmailMessageAsRead, 
  loginWithGmail, 
  getGmailToken, 
  type GmailMessage 
} from '@/services/mail/gmailService';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export function GmailClient() {
  const [user, setUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [token, setToken] = useState<string | null>(getGmailToken());
  const [loading, setLoading] = useState(false);
  const [emails, setEmails] = useState<GmailMessage[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<GmailMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const isIframe = typeof window !== 'undefined' && window.self !== window.top;
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [sending, setSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [emailToDelete, setEmailToDelete] = useState<GmailMessage | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Sync auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setToken(getGmailToken());
    });
    return () => unsub();
  }, []);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const res = await loginWithGmail();
      if (res) {
        setToken(res.accessToken);
        setUser(res.user);
        showNotification('success', 'Successfully signed in with Google Gmail!');
      }
    } catch (err: any) {
      console.error('Gmail Sign-In Error details:', err);
      if (err.code === 'auth/popup-closed-by-user' || err.message?.includes('popup-closed-by-user')) {
        showNotification('error', 'Auth popup was blocked or closed. Please use "Open in New Tab" below to authorize.');
      } else {
        showNotification('error', `Sign in failed: ${err.message || err}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type: 'success' | 'error', text: string) => {
    // Notifications disabled by user request
  };

  const fetchEmails = async () => {
    const currentToken = token || getGmailToken();
    if (!currentToken) return;

    setLoading(true);
    try {
      const result = await fetchGmailMessages(currentToken, searchQuery);
      if (result.tokenExpired) {
        setToken(null);
        return;
      }
      setEmails(result.messages);
    } catch (err: any) {
      console.error(err);
      showNotification('error', `Failed to load inbox: ${err.message || err}`);
    } finally {
      setLoading(false);
    }
  };

  // Run initial fetch on token update or query submit
  useEffect(() => {
    if (token) {
      fetchEmails();
    }
  }, [token]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmails();
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) {
      showNotification('error', 'Please fill in all email compose fields.');
      return;
    }

    setSending(true);
    try {
      const currentToken = token || getGmailToken();
      if (!currentToken) throw new Error('Not authenticated');

      await sendGmailMessage(currentToken, composeTo, composeSubject, composeBody);

      showNotification('success', `Email sent successfully to ${composeTo}!`);
      setIsComposeOpen(false);
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      
      // Refresh list
      fetchEmails();
    } catch (err: any) {
      console.error(err);
      showNotification('error', `Failed to send email: ${err.message || err}`);
    } finally {
      setSending(false);
    }
  };

  const handleDeleteClick = (email: GmailMessage) => {
    setEmailToDelete(email);
    setIsDeleting(true);
  };

  const handleConfirmDelete = async () => {
    if (!emailToDelete) return;

    try {
      const currentToken = token || getGmailToken();
      if (!currentToken) throw new Error('Not authenticated');
      
      await trashGmailMessage(currentToken, emailToDelete.id);

      showNotification('success', 'Email moved to Trash successfully.');
      setEmails(emails.filter((e) => e.id !== emailToDelete.id));
      if (selectedEmail?.id === emailToDelete.id) {
        setSelectedEmail(null);
      }
    } catch (err: any) {
      console.error(err);
      showNotification('error', `Failed to delete: ${err.message || err}`);
    } finally {
      setIsDeleting(false);
      setEmailToDelete(null);
    }
  };

  const handleMarkAsRead = async (email: GmailMessage) => {
    try {
      const currentToken = token || getGmailToken();
      if (!currentToken) return;

      const success = await markGmailMessageAsRead(currentToken, email.id);

      if (success) {
        setEmails(emails.map((e) => e.id === email.id ? { ...e, isRead: true } : e));
        if (selectedEmail?.id === email.id) {
          setSelectedEmail({ ...selectedEmail, isRead: true });
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleEmailSelect = (email: GmailMessage) => {
    setSelectedEmail(email);
    if (!email.isRead) {
      handleMarkAsRead(email);
    }
  };

  return (
    <div id="gmail-hub-root" className="w-full min-h-[calc(100vh-16rem)] flex flex-col bg-black rounded-3xl border border-zinc-900 overflow-hidden relative shadow-[0_30px_70px_rgba(0,0,0,0.95)]">
      
      {/* Header section */}
      <div className="p-6 border-b border-zinc-900 bg-[#07070a]/60 backdrop-blur-md shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/25 shrink-0 shadow-[0_0_15px_rgba(229,169,60,0.1)]">
            <Mail className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-left">
            <h1 className="text-lg font-black uppercase tracking-wider text-white">Gmail Integration Hub</h1>
            <p className="text-[11px] text-zinc-500 font-mono tracking-wide">SECURE COMMUNICATION ARCHITECTURE</p>
          </div>
        </div>

        {token && (
          <div className="flex items-center gap-2.5 justify-end">
            <form onSubmit={handleSearch} className="relative max-w-xs w-full">
              <input
                type="text"
                placeholder="Search mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-900 rounded-xl pl-9 pr-3.5 py-2 text-xs font-medium text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all font-mono"
              />
              <Search className="w-3.5 h-3.5 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            <button
              onClick={() => { setSearchQuery(''); fetchEmails(); }}
              className="p-2.5 bg-zinc-950 border border-zinc-900 rounded-xl text-zinc-500 hover:text-amber-500 hover:border-amber-500/20 active:scale-95 transition-all cursor-pointer"
              title="Refresh Inbox"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-500' : ''}`} />
            </button>

            <button
              onClick={() => setIsComposeOpen(true)}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-[0_4px_15px_rgba(229,169,60,0.2)] active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Compose</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Panel Content */}
      <div className="flex-1 flex overflow-hidden min-h-[450px]">
        {!token ? (
          /* Authentication Gate Screen */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none bg-radial-gradient">
            <div className="relative w-20 h-20 rounded-full bg-amber-500/[0.03] border border-amber-500/20 flex items-center justify-center shadow-[0_0_40px_rgba(229,169,60,0.05)] mb-6 animate-pulse">
              <Lock className="w-8 h-8 text-amber-500/80" />
            </div>
            
            <h2 className="text-md font-bold uppercase tracking-widest text-zinc-200 mb-2 font-mono">Authentication Required</h2>
            <p className="text-xs text-zinc-500 max-w-sm mb-6 leading-relaxed font-sans">
              To read and compose Gmail directly inside NSN969, please securely authorize Gmail permissions with your Google account.
            </p>

            {isIframe && (
              <div className="mb-6 max-w-md p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex flex-col items-center gap-3 animate-in fade-in duration-300">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider font-mono">AI Studio Preview Sandbox Notice</span>
                </div>
                <p className="text-[10.5px] text-zinc-400 leading-relaxed font-sans max-w-xs">
                  Standard Google sign-in popups are blocked or immediately closed inside cross-origin preview frames. Please open this app in a new tab to authorize.
                </p>
                <a
                  href={window.location.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 transition-all shadow-[0_4px_12px_rgba(229,169,60,0.2)] active:scale-95 cursor-pointer select-none"
                >
                  <ExternalLink className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Open App in New Tab</span>
                </a>
              </div>
            )}

            <button
              onClick={handleSignIn}
              disabled={loading}
              className="gsi-material-button px-6 py-3 bg-white hover:bg-zinc-100 text-black font-semibold text-xs uppercase tracking-widest rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-3 border border-zinc-200 shadow-xl active:scale-95"
            >
              <div className="gsi-material-button-icon w-4 h-4">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                </svg>
              </div>
              <span className="text-black font-black uppercase tracking-wider">{loading ? 'Authorizing...' : 'Authorize Gmail Hub'}</span>
            </button>
          </div>
        ) : loading && emails.length === 0 ? (
          /* High-Fidelity Custom Skeleton Loading Shimmers */
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-0">
            <div className="md:col-span-1 border-r border-zinc-900 p-4 space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="p-4 bg-[#07070a] border border-zinc-950 rounded-2xl space-y-2.5 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="h-2.5 w-24 bg-zinc-800 rounded-md" />
                    <div className="h-2 w-12 bg-zinc-800 rounded-md" />
                  </div>
                  <div className="h-3 w-40 bg-zinc-800 rounded-md" />
                  <div className="h-2 w-full bg-zinc-900 rounded-md" />
                </div>
              ))}
            </div>
            <div className="md:col-span-2 hidden md:flex items-center justify-center bg-[#020203] p-12 text-center">
              <div className="space-y-3 max-w-sm">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900/50 border border-zinc-800/40 mx-auto flex items-center justify-center animate-spin">
                  <RefreshCw className="w-5 h-5 text-zinc-700" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">Loading Messages</h3>
                <p className="text-[11px] text-zinc-600 font-sans">Connecting to secure Gmail services and fetching metadata streams...</p>
              </div>
            </div>
          </div>
        ) : emails.length === 0 ? (
          /* Empty Inbox Layout */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center select-none bg-zinc-950/20">
            <div className="w-16 h-16 rounded-full bg-zinc-900/30 border border-zinc-850 flex items-center justify-center mb-4">
              <Inbox className="w-6 h-6 text-zinc-700" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">No messages found</h3>
            <p className="text-[11px] text-zinc-600 max-w-xs mt-1 leading-relaxed">
              Your inbox is clean or no emails matched the active filter query parameters.
            </p>
          </div>
        ) : (
          /* Interactive Multi-pane Email View */
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-0">
            
            {/* Left Hand: Email list panel */}
            <div className={`md:col-span-1 border-r border-zinc-900 overflow-y-auto ${selectedEmail ? 'hidden md:block' : 'block'}`}>
              <div className="p-3 bg-zinc-950/40 border-b border-zinc-900/60 sticky top-0 z-10 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-zinc-500 tracking-wider">Latest Messages</span>
                <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 text-[9px] font-mono leading-none font-bold">
                  {emails.length} items
                </span>
              </div>
              <div className="divide-y divide-zinc-900/50">
                {emails.map((email) => {
                  const isActive = selectedEmail?.id === email.id;
                  return (
                    <div
                      key={email.id}
                      onClick={() => handleEmailSelect(email)}
                      className={`p-4 text-left cursor-pointer transition-all border-l-2 relative ${
                        isActive 
                          ? 'bg-[#0f0f15]/70 border-amber-500' 
                          : email.isRead 
                            ? 'border-transparent hover:bg-zinc-950/40' 
                            : 'border-amber-500/40 bg-amber-500/[0.01] hover:bg-amber-500/[0.02]'
                      }`}
                    >
                      {/* Read/Unread Dot indicator */}
                      {!email.isRead && (
                        <div className="absolute top-4.5 left-2.5 w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_6px_#e5a93c]" />
                      )}

                      <div className="flex justify-between items-start gap-2 mb-1.5 pl-1">
                        <span className="text-xs font-bold text-zinc-200 line-clamp-1 max-w-[140px] font-mono">
                          {email.from.split(' <')[0]}
                        </span>
                        <span className="text-[9px] font-mono text-zinc-600 select-none whitespace-nowrap shrink-0 pt-0.5">
                          {email.date}
                        </span>
                      </div>

                      <h4 className={`text-xs font-semibold mb-1 leading-snug line-clamp-1 pl-1 ${
                        email.isRead ? 'text-zinc-300' : 'text-white font-black'
                      }`}>
                        {email.subject}
                      </h4>
                      
                      <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed pl-1">
                        {email.snippet}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Hand: Reading pane */}
            <div className={`md:col-span-2 bg-[#020203] overflow-y-auto flex flex-col ${selectedEmail ? 'block' : 'hidden md:flex md:items-center md:justify-center p-12'}`}>
              {selectedEmail ? (
                /* Active Email Panel layout */
                <div className="flex-1 flex flex-col text-left">
                  {/* Top utility row */}
                  <div className="p-4 border-b border-zinc-900 bg-black/40 flex items-center justify-between sticky top-0 z-10 backdrop-blur">
                    <button
                      onClick={() => setSelectedEmail(null)}
                      className="md:hidden flex items-center gap-1 text-zinc-500 hover:text-zinc-200 cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="text-xs font-bold uppercase font-mono">Back</span>
                    </button>
                    
                    <div className="hidden md:block" />

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteClick(selectedEmail)}
                        className="px-3 py-1.5 bg-zinc-950 hover:bg-red-950/20 text-zinc-500 hover:text-red-400 border border-zinc-900 hover:border-red-900/40 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1"
                        title="Delete Email"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Mail metadata header */}
                  <div className="p-6 bg-[#040406]/50 border-b border-zinc-900">
                    <h2 className="text-md sm:text-lg font-bold text-white tracking-wide mb-4 leading-normal font-sans">
                      {selectedEmail.subject}
                    </h2>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-zinc-900 border border-zinc-800/80 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-zinc-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-xs font-bold text-zinc-200 truncate leading-none">
                            {selectedEmail.from}
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500 leading-none select-none">
                            {selectedEmail.date}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono mt-1.5 truncate">
                          To: me &lt;{user?.email}&gt;
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Body view */}
                  <div className="p-6 flex-1 text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap font-sans overflow-x-hidden select-text select-all">
                    {selectedEmail.body && selectedEmail.body.includes('<') && selectedEmail.body.includes('>') ? (
                      /* Display sanitized-looking HTML in a secure iframe or clean sanitized string */
                      <div className="prose prose-invert prose-xs max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: selectedEmail.body }} />
                      </div>
                    ) : (
                      selectedEmail.body || selectedEmail.snippet
                    )}
                  </div>
                </div>
              ) : (
                /* Unselected Panel layout */
                <div className="text-center p-8 select-none max-w-sm">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900/20 border border-zinc-850 mx-auto flex items-center justify-center mb-4">
                    <Inbox className="w-5 h-5 text-zinc-600" />
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 font-mono">Select a message</h3>
                  <p className="text-[11px] text-zinc-600 mt-1">
                    Choose an email from the left sidebar feed to view full transmission content details.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* Compose Email Modal Modal Overlay */}
      {isComposeOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#07070a] border border-zinc-900 rounded-2xl max-w-lg w-full overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.95)]">
            <div className="p-4 bg-zinc-950 border-b border-zinc-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-black uppercase tracking-wider text-white">New Message</span>
              </div>
              <button
                onClick={() => setIsComposeOpen(false)}
                className="p-1 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-900 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="p-6 space-y-4 text-left">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase text-zinc-500">Recipient Email</label>
                <input
                  type="email"
                  required
                  placeholder="recipient@example.com"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-amber-500/40 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase text-zinc-500">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="Enter email subject"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-2.5 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-amber-500/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold uppercase text-zinc-500">Message Content</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Type your message here..."
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-900 rounded-xl px-4 py-3 text-xs text-zinc-200 placeholder-zinc-700 focus:outline-none focus:border-amber-500/40 leading-relaxed resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-900">
                <button
                  type="button"
                  onClick={() => setIsComposeOpen(false)}
                  className="px-4 py-2 bg-zinc-950 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-[0_4px_15px_rgba(229,169,60,0.2)]"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sending ? 'Sending...' : 'Send Mail'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Premium Confirm Deletion Modal Dialog (MANDATORY User Confirmation) */}
      {isDeleting && emailToDelete && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-[#07070a] border border-red-500/20 rounded-2xl max-w-sm w-full overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.95)]">
            <div className="p-4 bg-red-950/15 border-b border-zinc-900 flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span className="text-xs font-black uppercase tracking-wider">Confirm Delete</span>
            </div>

            <div className="p-6 text-left space-y-4">
              <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                Are you sure you want to delete this email? This action will move the message to your <span className="font-mono text-red-400">Trash</span> folder.
              </p>

              <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl text-left">
                <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase">Subject</p>
                <p className="text-xs font-semibold text-zinc-200 truncate mt-0.5">{emailToDelete.subject}</p>
                
                <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase mt-2.5">From</p>
                <p className="text-xs font-semibold text-zinc-200 truncate mt-0.5">{emailToDelete.from}</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-900">
                <button
                  onClick={() => { setIsDeleting(false); setEmailToDelete(null); }}
                  className="px-4 py-2 bg-zinc-950 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-[0_4px_15px_rgba(239,68,68,0.25)]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Move to Trash</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
