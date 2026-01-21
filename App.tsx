
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Trash2, Plus, FileText, AlertCircle, ShieldAlert, Key, Lock, Activity, Library, Database, Layers, Search, Eye } from 'lucide-react';
import { AppState, Message, MessageRole, Document } from './types';
import { ragEngine } from './services/ragEngine';
import { generateLocalResponse } from './services/nlpService';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';

const INITIAL_DOCS: Document[] = [
  {
    id: 'doc-1',
    title: 'IQRA UNIVERSITY FAQ 2025',
    content: `GENERAL POLICY & ADMISSIONS POLICY 2025
    
    Announcement: Admission campaigns are officially announced through the University’s website and social media platforms.
    
    Equal Opportunity: Applications are considered without discrimination on the basis of race, gender, age, religion, marital status, physical disability, or national origin.
    
    Merit-Based Selection: Admissions at Iqra University are strictly merit-based. Applicants must:
    1. Pass the admission test.
    2. Appear in and qualify the interview.
    3. Meet the eligibility criteria of the respective program.
    4. Submit all required credentials, which will be carefully reviewed.
    
    Application Submission: All admission documents must be uploaded through the online admission portal: iqra.edu.pk.
    
    Policy Rights: The University reserves the right to revise its admission policy at any time without prior notice.
    
    ADMISSIONS TIMELINE:
    Admissions in offered programs are announced two months prior to the commencement of classes:
    - Spring Semester (March to June): Admission starts in November.
    - Summer Semester (July to September): Admission starts in April.
    - Fall Semester (October to February): Admission starts in August.`,
    uploadDate: Date.now() - 86400000,
    chunkCount: 0
  },
  {
    id: 'doc-2',
    title: 'NLP Course Policy',
    content: `This course covers Natural Language Processing (NLP). Total marks for the CCP are 11. Due date is the last class. Topics include RAG, LLMs, Embeddings, and Vector Databases. Late submissions will result in a 10% deduction per day. Attendance of 75% is mandatory to sit in the final exam.`,
    uploadDate: Date.now() - 43200000,
    chunkCount: 0
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [state, setState] = useState<AppState>({
    messages: [],
    documents: INITIAL_DOCS,
    isThinking: false,
    logs: [`[${new Date().toLocaleTimeString()}] IQRA AI Engine Initialized.`, `[${new Date().toLocaleTimeString()}] Knowledge Repository Synced.`],
    cache: {}
  });

  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocContent, setNewDocContent] = useState('');

  useEffect(() => {
    // Initial ingestion of documentation
    state.documents.forEach(doc => {
      const chunks = ragEngine.ingestDocument(doc);
      doc.chunkCount = chunks.length;
    });
    setState(prev => ({ ...prev }));
  }, []);

  const addLog = (message: string) => {
    setState(prev => ({
      ...prev,
      logs: [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev.logs.slice(0, 49)]
    }));
  };

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      content: text,
      timestamp: Date.now()
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isThinking: true
    }));

    addLog(`Query Received: "${text}"`);

    try {
      const sources = await ragEngine.retrieve(text);
      const response = await generateLocalResponse(text, sources);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.ASSISTANT,
        content: response.answer,
        timestamp: Date.now(),
        sources: response.sources,
        confidence: response.confidence
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, botMessage],
        isThinking: false
      }));
      
      addLog(`Local context synthesized (Match: ${Math.round(response.confidence * 100)}%).`);

    } catch (error: any) {
      addLog(`Engine Error: ${error.message}`);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.ASSISTANT,
        content: "Internal local processing error.",
        timestamp: Date.now()
      };
      setState(prev => ({ ...prev, messages: [...prev.messages, errorMessage], isThinking: false }));
    }
  };

  const handleAddDocument = () => {
    if (!newDocTitle.trim() || !newDocContent.trim()) return;
    
    const newDoc: Document = {
      id: `doc-${Date.now()}`,
      title: newDocTitle,
      content: newDocContent,
      uploadDate: Date.now(),
      chunkCount: 0
    };

    const chunks = ragEngine.ingestDocument(newDoc);
    newDoc.chunkCount = chunks.length;

    setState(prev => ({
      ...prev,
      documents: [...prev.documents, newDoc]
    }));

    addLog(`Resource added: "${newDocTitle}" (${chunks.length} segments).`);
    setNewDocTitle('');
    setNewDocContent('');
  };

  const handleDeleteDocument = (id: string) => {
    setState(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== id)
    }));
    addLog(`Resource purged from index.`);
  };

  const totalChars = state.documents.reduce((acc, doc) => acc + doc.content.length, 0);
  const totalChunks = state.documents.reduce((acc, doc) => acc + (doc.chunkCount || 0), 0);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        docCount={state.documents.length} 
      />

      <main className="flex-1 flex flex-col min-w-0 h-full p-6">
        {activeTab === 'chat' && (
          <ChatWindow 
            messages={state.messages} 
            isThinking={state.isThinking} 
            onSendMessage={handleSendMessage}
            activeDocs={state.documents}
          />
        )}

        {activeTab === 'docs' && (
          <div className="flex-1 flex flex-col gap-6 overflow-hidden">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Knowledge Showcase</h2>
                <p className="text-slate-500 text-sm">Managing locally indexed IQRA University resources.</p>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-indigo-600 rounded-xl p-4 text-white shadow-lg shadow-indigo-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-80 mb-1">Active Repository</p>
                  <p className="text-2xl font-bold">{state.documents.length} Resources</p>
                </div>
                <Library size={32} className="opacity-40" />
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Search Segments</p>
                  <p className="text-2xl font-bold text-slate-800">{totalChunks} Chunks</p>
                </div>
                <Layers size={32} className="text-slate-100" />
              </div>
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Index Volume</p>
                  <p className="text-2xl font-bold text-slate-800">{(totalChars / 1024).toFixed(1)} KB</p>
                </div>
                <Activity size={32} className="text-slate-100" />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-hidden">
              <div className="lg:col-span-2 overflow-y-auto space-y-4 pr-2 chat-scrollbar">
                {state.documents.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl h-64 flex flex-col items-center justify-center text-slate-400">
                    <Database size={48} className="mb-4 opacity-20" />
                    <p className="font-medium">The knowledge base is empty.</p>
                  </div>
                ) : (
                  state.documents.map(doc => (
                    <div key={doc.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-all group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                            <FileText size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-800 text-lg">{doc.title}</h3>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] font-medium text-slate-400">Modified {new Date(doc.uploadDate).toLocaleDateString()}</span>
                              <span className="text-slate-200">•</span>
                              <span className="text-[11px] font-bold text-indigo-500 uppercase">Local Secure Storage</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setActiveTab('chat')} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors" title="View in Chat Showcase">
                            <Eye size={18} />
                          </button>
                          <button onClick={() => handleDeleteDocument(doc.id)} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 mb-4">
                        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed italic">
                          "{doc.content}"
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Information Density</p>
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-indigo-500 rounded-full" 
                              style={{ width: `${Math.min(100, (doc.content.length / 500) * 10)}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Segments</p>
                          <p className="text-xs font-bold text-slate-700">{doc.chunkCount || 0}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Status</p>
                          <p className="text-xs font-bold text-emerald-600">Active</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit sticky top-0">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
                    <Plus size={20} />
                  </div>
                  <h3 className="font-bold text-slate-800">Resource Ingestion</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Title</label>
                    <input 
                      type="text" 
                      value={newDocTitle}
                      onChange={(e) => setNewDocTitle(e.target.value)}
                      placeholder="e.g. Exam Schedule, New Policy..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Content</label>
                    <textarea 
                      rows={8}
                      value={newDocContent}
                      onChange={(e) => setNewDocContent(e.target.value)}
                      placeholder="Paste policy text or document contents..."
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm resize-none"
                    />
                  </div>
                  <button 
                    onClick={handleAddDocument}
                    className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-[0.98]"
                  >
                    Index into Showcase
                  </button>
                  <p className="text-[10px] text-center text-slate-400 px-4">
                    Document data remains encrypted in local session memory.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8 overflow-y-auto pr-2 chat-scrollbar">
            <h2 className="text-2xl font-bold text-slate-800">Local Processing Health</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Session Queries', value: state.messages.length.toString(), color: 'bg-indigo-600', icon: Activity },
                { label: 'Showcase Items', value: `${state.documents.length}`, color: 'bg-emerald-500', icon: Library },
                { label: 'Avg Latency', value: '42ms', color: 'bg-amber-500', icon: AlertCircle },
                { label: 'Privacy Score', value: '100%', color: 'bg-violet-600', icon: Lock },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase">{stat.label}</p>
                    <p className="text-xl font-bold text-slate-800">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
