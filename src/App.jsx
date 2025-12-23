import React, { useState, useEffect, useCallback } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  increment, 
  serverTimestamp, 
  updateDoc, 
  getDocs,
  query,
  orderBy
} from 'firebase/firestore';
import { 
  Database, 
  HardDrive, 
  Server, 
  Activity, 
  FileText, 
  Info, 
  CheckCircle, 
  AlertTriangle,
  RefreshCw,
  Cloud,
  Code,
  Video,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  PlayCircle
} from 'lucide-react';

// --- Firebase Configuration & Initialization ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Simulated Cloud Services Paths ---
const PATHS = {
  OBS_DATA: 'simulated_obs_content_v2', // Use v2 to avoid conflicts with old data structure
  REDIS_CACHE: 'simulated_redis_stats'
};

// --- Main Application Component ---
export default function CloudDemoSite() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);

  // Authentication Setup
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  // --- Render Logic ---
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin w-8 h-8 text-blue-400" />
          <p>正在连接云资源演示环境...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="w-6 h-6 text-blue-400" />
            <h1 className="text-lg font-bold tracking-wide">CloudVerify <span className="text-slate-400 text-xs font-normal ml-1">技术演示站</span></h1>
          </div>
          <nav className="flex gap-1 md:gap-4 text-sm font-medium">
            <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={<Activity size={16}/>} label="仪表盘" />
            <NavButton active={activeTab === 'learning'} onClick={() => setActiveTab('learning')} icon={<Database size={16}/>} label="学习内容 (OBS)" />
            <NavButton active={activeTab === 'about'} onClick={() => setActiveTab('about')} icon={<Info size={16}/>} label="项目说明" />
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {activeTab === 'home' && <DashboardPage user={user} appId={appId} />}
        {activeTab === 'learning' && <LearningPage user={user} appId={appId} />}
        {activeTab === 'about' && <AboutPage />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-slate-500 text-xs">
          <p>此网站仅用于演示云资源（OBS/Redis）在实际开发中的应用方案。</p>
          <p className="mt-1">Environment: Development | Status: Active</p>
        </div>
      </footer>
    </div>
  );
}

// --- Navigation Component ---
const NavButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    <span className="hidden md:inline">{label}</span>
  </button>
);

// --- Page Components ---

// 1. Dashboard Page (Simulates Redis Cache Interaction)
const DashboardPage = ({ user, appId }) => {
  const [stats, setStats] = useState({ totalVisits: 0, lastVisit: '获取中...' });
  const [loading, setLoading] = useState(true);

  // 初始化访问统计
  useEffect(() => {
    if (!user) return;

    const statsRef = doc(db, 'artifacts', appId, 'public', 'data', PATHS.REDIS_CACHE, 'global_stats');

    const updateAndFetchStats = async () => {
      try {
        await setDoc(statsRef, {
          totalVisits: increment(1),
          lastVisitTime: serverTimestamp()
        }, { merge: true });

        const snapshot = await getDoc(statsRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setStats({
            totalVisits: data.totalVisits || 1,
            lastVisit: data.lastVisitTime?.toDate().toLocaleString() || new Date().toLocaleString()
          });
        }
      } catch (error) {
        console.error("Error updating stats:", error);
      } finally {
        setLoading(false);
      }
    };

    updateAndFetchStats();
  }, [user, appId]);

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">访问行为分析</h2>
        <p className="text-slate-500">
          此页面演示如何从云端缓存服务 (DCS/Redis) 读取实时访问数据。
          <br/>
          <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded border border-orange-100 mt-2 inline-block">
            注意：每次刷新页面都会触发一次云端计数器原子递增
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity size={80} className="text-blue-600" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              <Server size={24} />
            </div>
            <h3 className="font-semibold text-slate-700">总访问量 (PV)</h3>
          </div>
          <div className="text-4xl font-extrabold text-slate-900 mb-2">
            {loading ? <span className="animate-pulse text-slate-300">---</span> : stats.totalVisits}
          </div>
          <div className="flex items-center text-xs text-slate-500 gap-1 bg-slate-50 w-fit px-2 py-1 rounded">
            <Database size={12} />
            <span>来源: 分布式缓存 (Redis)</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <HardDrive size={80} className="text-emerald-600" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <CheckCircle size={24} />
            </div>
            <h3 className="font-semibold text-slate-700">最近访问时间</h3>
          </div>
          <div className="text-xl font-bold text-slate-900 mb-4 h-10 flex items-center">
             {loading ? <span className="animate-pulse text-slate-300">加载中...</span> : stats.lastVisit}
          </div>
           <div className="flex items-center text-xs text-slate-500 gap-1 bg-slate-50 w-fit px-2 py-1 rounded">
            <Database size={12} />
            <span>来源: 分布式缓存 (Redis)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Learning Page (Enhanced: Richer Content & Filters)
const LearningPage = ({ user, appId }) => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [fetchingDetail, setFetchingDetail] = useState(false);

  // 初始化内容
  useEffect(() => {
    if (!user) return;

    const fetchContent = async () => {
      setLoading(true);
      const contentCollection = collection(db, 'artifacts', appId, 'public', 'data', PATHS.OBS_DATA);
      
      try {
        const snapshot = await getDocs(contentCollection);
        if (snapshot.empty) {
          await seedInitialData(contentCollection);
          const newSnapshot = await getDocs(contentCollection);
          setContent(newSnapshot.docs.map(d => d.data()));
        } else {
          setContent(snapshot.docs.map(d => d.data()));
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [user, appId]);

  // 模拟从 OBS 加载大文件详情
  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setFetchingDetail(true);
      setExpandedId(id);
      // 模拟网络延迟
      setTimeout(() => {
        setFetchingDetail(false);
      }, 800);
    }
  };

  const seedInitialData = async (collRef) => {
    const initialData = [
      {
        id: 1,
        type: 'article',
        title: "分布式缓存 Redis 核心原理",
        summary: "深入剖析 Redis 的数据结构、持久化机制（RDB/AOF）以及在微服务架构中的应用场景。",
        content: "Redis (Remote Dictionary Server) 是一个开源的、使用 C 语言编写的、支持网络、可基于内存亦可持久化的日志型、Key-Value 数据库。\n\n关键特性：\n1. 速度快：基于内存操作，QPS 可达 10w+。\n2. 数据类型丰富：String, List, Set, ZSet, Hash。\n3. 原子性：所有操作都是原子性的。",
        date: "2023-10-24",
        source: "obs://bucket-learning/docs/redis-core.md",
        tags: ["Redis", "Backend", "Architecture"]
      },
      {
        id: 2,
        type: 'code',
        title: "Node.js 上传文件到 OBS 示例代码",
        summary: "一段用于演示如何在 Node.js 环境中使用 SDK 将本地文件上传至对象存储桶的代码片段。",
        content: `const ObsClient = require('esdk-obs-nodejs');\n\nconst obsClient = new ObsClient({\n  access_key_id: '***',\n  secret_access_key: '***',\n  server: 'https://obs.region.mycloud.com'\n});\n\nawait obsClient.putObject({\n  Bucket: 'my-bucket',\n  Key: 'images/logo.png',\n  SourceFile: './logo.png'\n});\n// 上传成功`,
        date: "2023-10-25",
        source: "obs://bucket-code/snippets/upload-demo.js",
        tags: ["Node.js", "SDK", "Storage"]
      },
      {
        id: 3,
        type: 'video',
        title: "React Hooks 最佳实践 (视频演示)",
        summary: "视频教程：如何正确使用 useEffect 处理副作用，避免常见的闭包陷阱和无限循环问题。",
        content: "Video resource placeholder.\nDuration: 15:30\nResolution: 1080p\nTranscoding status: Completed",
        date: "2023-10-26",
        source: "obs://bucket-media/videos/react-hooks.mp4",
        tags: ["React", "Frontend", "Video"]
      },
      {
        id: 4,
        type: 'article',
        title: "Serverless 无服务器架构入门",
        summary: "Function as a Service (FaaS) 的概念介绍，以及如何利用云函数构建低成本的 API 服务。",
        content: "Serverless 并不意味着没有服务器，而是开发者不再需要关心服务器的管理和运维。\n\n优势：\n- 按量付费，成本低\n- 自动扩缩容\n- 快速迭代上线",
        date: "2023-10-28",
        source: "obs://bucket-learning/docs/serverless.json",
        tags: ["Cloud", "Serverless"]
      }
    ];

    for (const item of initialData) {
      await setDoc(doc(collRef, `doc_${item.id}`), item);
    }
  };

  // 筛选逻辑
  const allTags = ['All', ...new Set(content.flatMap(item => item.tags))];
  const filteredContent = content.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = selectedTag === 'All' || item.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'code': return <Code size={20} className="text-purple-600" />;
      case 'video': return <Video size={20} className="text-pink-600" />;
      default: return <FileText size={20} className="text-blue-600" />;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'code': return 'Code Snippet';
      case 'video': return 'Video Tutorial';
      default: return 'Article';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 border-b border-slate-200 pb-4 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">学习资源库</h2>
          <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
             <Cloud size={14} className="text-blue-400" />
             Content Source: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600 font-mono text-xs">obs://bucket-learning/public</code>
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <input
            type="text"
            placeholder="搜索内容..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
        </div>
      </div>

      {/* Tags Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex items-center gap-1 text-slate-400 text-sm mr-2">
          <Filter size={14} />
          <span>筛选:</span>
        </div>
        {allTags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              selectedTag === tag
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm animate-pulse">
              <div className="flex justify-between">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-3"></div>
                <div className="h-6 bg-slate-100 rounded w-16"></div>
              </div>
              <div className="h-4 bg-slate-100 rounded w-full mb-2"></div>
              <div className="h-4 bg-slate-100 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredContent.length === 0 ? (
             <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <Search size={48} className="mx-auto mb-2 opacity-20" />
                <p>未找到相关内容</p>
             </div>
          ) : (
            filteredContent.map((item) => (
              <div key={item.id} className={`bg-white rounded-lg border transition-all duration-300 overflow-hidden ${
                expandedId === item.id ? 'shadow-md border-blue-200 ring-1 ring-blue-100' : 'shadow-sm border-slate-200 hover:shadow-md'
              }`}>
                {/* Card Header & Summary */}
                <div className="p-5 cursor-pointer" onClick={() => toggleExpand(item.id)}>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 p-2 rounded-lg ${
                        item.type === 'code' ? 'bg-purple-100' : item.type === 'video' ? 'bg-pink-100' : 'bg-blue-100'
                      }`}>
                        {getTypeIcon(item.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {getTypeLabel(item.type)}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {item.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-blue-600 transition-colors">
                      {expandedId === item.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                  </div>
                  
                  <p className="text-slate-600 text-sm leading-relaxed pl-[52px]">{item.summary}</p>
                </div>

                {/* Expanded Detail View */}
                {expandedId === item.id && (
                  <div className="bg-slate-50 border-t border-slate-100 p-5 pl-[72px] animate-fade-in">
                    {fetchingDetail ? (
                      <div className="flex items-center gap-2 text-slate-500 py-4">
                        <RefreshCw className="animate-spin" size={16} />
                        <span className="text-sm">从对象存储 (OBS) 加载详细内容中...</span>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {item.type === 'video' && (
                          <div className="aspect-video bg-slate-800 rounded-lg flex flex-col items-center justify-center text-slate-400 mb-4">
                            <PlayCircle size={48} className="mb-2 opacity-50" />
                            <span className="text-xs font-mono">Simulated Video Player</span>
                          </div>
                        )}
                        
                        <div className={`text-sm rounded-md border ${
                          item.type === 'code' 
                            ? 'bg-slate-900 text-green-400 border-slate-800 font-mono p-4 whitespace-pre-wrap' 
                            : 'bg-white text-slate-700 border-slate-200 p-4 whitespace-pre-wrap'
                        }`}>
                          {item.content}
                        </div>
                        
                        <div className="flex items-center justify-between pt-2">
                           <div className="flex gap-2">
                            {item.tags.map(tag => (
                              <span key={tag} className="text-xs px-2 py-0.5 bg-white border border-slate-200 text-slate-500 rounded-full">
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono bg-white px-2 py-1 rounded border border-slate-200">
                            <HardDrive size={10} />
                            {item.source}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// 3. About/Status Page
const AboutPage = () => (
  <div className="max-w-3xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
      <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
        <AlertTriangle size={24} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-800">项目状态说明</h2>
        <p className="text-slate-500 text-sm">Project Status & Background</p>
      </div>
    </div>

    <div className="space-y-8">
      <section>
        <h3 className="text-lg font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
          项目背景
        </h3>
        <p className="text-slate-600 leading-relaxed text-sm">
          本项目是一个用于技术验证的个人学习站点。主要目的是演示如何在实际 Web 项目中集成云原生的存储与计算服务。
          传统的网站可能将图片放在本地服务器，将数据全部放在 MySQL 中；而本站采用了更现代的“对象存储 + 分布式缓存”架构，
          以实现动静分离和高性能读写。
        </p>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
          当前状态
        </h3>
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100">
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold">ACTIVE</span>
              <span className="text-slate-700">前端服务运行正常</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-bold">CONNECTED</span>
              <span className="text-slate-700">云资源 (Firebase Simulation) 连接正常</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs font-bold">DEMO</span>
              <span className="text-slate-700">当前处于演示/开发模式，不用于商业生产</span>
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold text-slate-700 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
          技术声明
        </h3>
        <div className="text-sm text-slate-500 space-y-2">
          <p>
            本演示环境受浏览器限制，无法直接连接真实的 VPC 内网 Redis 实例。
            因此，本演示使用 Firebase Firestore 的原子操作来模拟 Redis 的计数器行为，
            使用 Firestore 的文档存储来模拟 OBS 的 JSON 文件存储。
          </p>
          <p className="italic mt-2 text-xs">
            In a real production environment, this would be replaced by AWS S3 / Huawei OBS and AWS ElastiCache / Huawei DCS.
          </p>
        </div>
      </section>
    </div>
  </div>
);