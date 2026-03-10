import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  HelpCircle, 
  CalendarDays, 
  Lightbulb, 
  Plus, 
  Trash2, 
  Save, 
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Menu,
  X
} from 'lucide-react';

type SectionKey = 'achievements' | 'problems' | 'plans' | 'gains';

interface RecordItem {
  id: string;
  title: string;
  content: string;
  isExpanded: boolean;
}

type RecordData = Record<SectionKey, RecordItem[]>;

const initialData: RecordData = {
  achievements: [{ id: '1', title: '', content: '', isExpanded: true }],
  problems: [{ id: '2', title: '', content: '', isExpanded: true }],
  plans: [{ id: '3', title: '', content: '', isExpanded: true }],
  gains: [{ id: '4', title: '', content: '', isExpanded: true }],
};

const SECTIONS = [
  { id: 'achievements', label: '学习成果', icon: Trophy, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
  { id: 'problems', label: '问题与疑惑', icon: HelpCircle, color: 'text-rose-600', bgColor: 'bg-rose-100' },
  { id: 'plans', label: '明日计划', icon: CalendarDays, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  { id: 'gains', label: '心得体会', icon: Lightbulb, color: 'text-amber-600', bgColor: 'bg-amber-100' },
] as const;

export default function App() {
  const [activeTab, setActiveTab] = useState<SectionKey>('achievements');
  const [data, setData] = useState<RecordData>(() => {
    const saved = localStorage.getItem('learning-records');
    return saved ? JSON.parse(saved) : initialData;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    localStorage.setItem('learning-records', JSON.stringify(data));
  }, [data]);

  const currentDate = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long'
  });

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddItem = () => {
    setData(prev => ({
      ...prev,
      [activeTab]: [
        ...prev[activeTab],
        { id: crypto.randomUUID(), title: '', content: '', isExpanded: true }
      ]
    }));
  };

  const handleRemoveItem = (id: string) => {
    setData(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].filter(item => item.id !== id)
    }));
  };

  const handleUpdateItem = (id: string, field: keyof RecordItem, value: string | boolean) => {
    setData(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>, id: string) => {
    handleUpdateItem(id, 'content', e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const confirmClearAll = () => {
    setData(initialData);
    setShowClearConfirm(false);
    showToast('已清空所有记录');
  };

  const handleSaveToFile = () => {
    let content = `每日学习简记 - ${currentDate}\n\n`;
    
    SECTIONS.forEach(section => {
      content += `【${section.label}】\n`;
      const items = data[section.id].filter(item => item.title.trim() !== '');
      if (items.length > 0) {
        items.forEach((item, index) => {
          content += `    ${index + 1}. ${item.title}\n`;
          if (item.content.trim()) {
            content += `          ${item.content.replace(/\n/g, '\n          ')}\n`;
          }
        });
      } else {
        content += `    无\n`;
      }
      content += '\n';
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `每日学习简记_${new Date().toLocaleDateString('zh-CN').replace(/\//g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('记录已成功导出！');
  };

  const activeSection = SECTIONS.find(s => s.id === activeTab)!;

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-emerald-200">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-sm shadow-emerald-200">
              <Lightbulb className="text-white" size={20} />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-800">每日学习简记</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center text-sm text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-full">
              {currentDate}
            </div>
            <button 
              onClick={handleSaveToFile}
              className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Save size={16} />
              <span className="hidden sm:inline">导出记录</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className={`
          md:w-64 shrink-0 
          ${isMobileMenuOpen ? 'block' : 'hidden'} 
          md:block
        `}>
          <nav className="flex flex-col gap-2 sticky top-24">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              const isActive = activeTab === section.id;
              const itemCount = data[section.id].filter(i => i.title.trim() !== '').length;
              
              return (
                <button
                  key={section.id}
                  onClick={() => {
                    setActiveTab(section.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    flex items-center justify-between w-full px-4 py-3 rounded-xl text-left transition-all duration-200
                    ${isActive 
                      ? 'bg-white shadow-sm border border-zinc-200 text-zinc-900' 
                      : 'text-zinc-600 hover:bg-zinc-200/50 hover:text-zinc-900 border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isActive ? section.bgColor : 'bg-zinc-100'}`}>
                      <Icon size={18} className={isActive ? section.color : 'text-zinc-500'} />
                    </div>
                    <span className="font-medium">{section.label}</span>
                  </div>
                  {itemCount > 0 && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${isActive ? 'bg-zinc-100 text-zinc-600' : 'bg-zinc-200 text-zinc-500'}`}>
                      {itemCount}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="mt-8 pt-6 border-t border-zinc-200">
              <button 
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-2 w-full px-4 py-3 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors text-sm font-medium"
              >
                <RotateCcw size={16} />
                清空所有记录
              </button>
            </div>
          </nav>
        </aside>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="mb-6 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${activeSection.bgColor}`}>
              <activeSection.icon size={24} className={activeSection.color} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-zinc-900">{activeSection.label}</h2>
              <p className="text-sm text-zinc-500 mt-1">
                {activeTab === 'achievements' && '记录今天的进步，哪怕是一点点。'}
                {activeTab === 'problems' && '遇到困难很正常，写下来就是解决的第一步。'}
                {activeTab === 'plans' && '为明天做好规划，让学习更有条理。'}
                {activeTab === 'gains' && '沉淀思考，总结经验，转化为自己的知识。'}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {data[activeTab].map((item, index) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="flex items-start gap-3 p-4">
                    <div className="mt-2 text-zinc-400 font-mono text-sm select-none">
                      {(index + 1).toString().padStart(2, '0')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleUpdateItem(item.id, 'title', e.target.value)}
                        placeholder={`输入${activeSection.label.replace('与疑惑', '')}概要...`}
                        className="w-full text-lg font-medium text-zinc-900 bg-transparent border-none focus:outline-none focus:ring-0 p-0 placeholder:text-zinc-300"
                      />
                    </div>
                    <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleUpdateItem(item.id, 'isExpanded', !item.isExpanded)}
                        className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-lg transition-colors"
                        title={item.isExpanded ? "收起详情" : "展开详情"}
                      >
                        {item.isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="删除"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <AnimatePresence>
                    {item.isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-zinc-100 bg-zinc-50/50"
                      >
                        <div className="p-4 pl-11">
                          <textarea
                            value={item.content}
                            onChange={(e) => handleTextareaChange(e, item.id)}
                            placeholder="补充详细说明、代码片段或思考过程..."
                            className="w-full min-h-[100px] text-zinc-600 bg-transparent border-none focus:outline-none focus:ring-0 p-0 resize-none placeholder:text-zinc-400 text-sm leading-relaxed"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>

            <motion.button
              layout
              onClick={handleAddItem}
              className="w-full py-4 border-2 border-dashed border-zinc-200 rounded-2xl text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={20} />
              添加新{activeSection.label.replace('与疑惑', '')}
            </motion.button>
          </div>
        </div>
      </main>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 text-white px-6 py-3 rounded-full shadow-lg z-50 text-sm font-medium"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clear Confirm Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 overflow-hidden"
            >
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">清空所有记录？</h3>
              <p className="text-zinc-500 text-sm mb-6">此操作将删除所有标签页下的学习记录，且无法恢复。确定要继续吗？</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={confirmClearAll}
                  className="px-4 py-2 text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-sm"
                >
                  确认清空
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
