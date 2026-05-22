import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Clock, 
  ExternalLink, 
  ShieldCheck, 
  Layers, 
  Activity, 
  Users, 
  Smartphone, 
  Home, 
  Heart, 
  ArrowRight,
  TrendingUp,
  Cpu,
  Globe
} from 'lucide-react';

const getIconComponent = (iconName) => {
  switch (iconName) {
    case 'Smartphone': return Smartphone;
    case 'Heart': return Heart;
    case 'Globe': return Globe;
    case 'Home': return Home;
    case 'Layers': return Layers;
    default: return Layers;
  }
};

const getStatusLabelAndColor = (status) => {
  switch (status) {
    case 'active':
      return { label: 'Active & Empowering', bg: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' };
    case 'development':
      return { label: 'Active Co-Design', bg: 'bg-amber-500/10 text-amber-300 border-amber-500/20' };
    case 'testing':
      return { label: 'Community Testing', bg: 'bg-blue-500/10 text-blue-300 border-blue-500/20' };
    case 'planning':
      return { label: 'Co-Design Planning', bg: 'bg-purple-500/10 text-purple-300 border-purple-500/20' };
    default:
      return { label: 'Ecosystem Project', bg: 'bg-slate-500/10 text-slate-300 border-slate-500/20' };
  }
};

const DEFAULT_PRODUCTS = [
  {
    id: 'impressa',
    name: 'Impressa',
    tagline: 'Unified E-Commerce & Hybrid Retail POS',
    shortDesc: 'Sustaining local vendors and micro-businesses through modern hybrid e-commerce. Bridging storefronts and streetfronts.',
    iconName: 'Smartphone',
    gradient: 'from-purple-500 via-indigo-500 to-blue-500',
    shadow: 'shadow-purple-500/10',
    stats: [
      { label: 'Active Vendors', value: '1,200+' },
      { label: 'Weekly Transactions', value: '7.4M RWF' },
      { label: 'Rwandan Regions Active', value: '5 Provinces' },
      { label: 'System Uptime', value: '99.98%' }
    ],
    details: {
      mission: 'To empower Rwandan SMEs and retail shops by merging their brick-and-mortar sales with a powerful digital marketplace. No vendor is left behind.',
      tech: ['React 19', 'Node.js Express', 'Supabase', 'PostgreSQL', 'Prisma ORM'],
      features: [
        'Unified POS cashier interface with strict shift cash management.',
        'Multi-vendor inventory synchronization and attributes catalog.',
        'Secure credit tracking system ("Abonne tracking") for loyal local customers.',
        'Audit-ready financial report PDF generation.'
      ]
    }
  },
  {
    id: 'gesture-to-speech',
    name: 'Gesture to Speech',
    tagline: 'Rwandan Sign Language (RSL) Translation System',
    shortDesc: 'Breaking daily communication barriers for deaf students and workers with real-time gesture-to-speech translation.',
    iconName: 'Heart',
    gradient: 'from-rose-500 to-orange-500',
    shadow: 'shadow-rose-500/10',
    stats: [
      { label: 'Vocabulary signs', value: '12,000+' },
      { label: 'Translation Latency', value: '120ms' },
      { label: 'Model Accuracy', value: '98.4%' },
      { label: 'Schools Implemented', value: '8 centers' }
    ],
    details: {
      mission: 'Providing digital accessibility tools that enable seamless communication between Deaf signers and non-signing members of the community.',
      tech: ['TensorFlow.js', 'Python FastAPI', 'MediaPipe', 'WebRTC Streamer', 'React'],
      features: [
        'High-speed video frame hand and body pose tracking.',
        'Local dataset mapping Kinyarwanda dialects and RSL idioms.',
        'Voice synthesis engine supporting Kinyarwanda and English audio playback.',
        'Offline capability for school computers with low connectivity.'
      ]
    }
  },
  {
    id: 'linker',
    name: 'Linker',
    tagline: 'Smart Commuter Bus Booking Portal',
    shortDesc: 'Removing commuting stress and waiting lines through a digitized real-time booking and scheduling system.',
    iconName: 'Globe',
    gradient: 'from-emerald-500 to-teal-500',
    shadow: 'shadow-emerald-500/10',
    stats: [
      { label: 'Daily Tickets Booked', value: '1,850+' },
      { label: 'Active Routes Mapped', value: '18 lines' },
      { label: 'Partner Operators', value: '5 agencies' },
      { label: 'Bus Terminal Sync', value: 'Real-time' }
    ],
    details: {
      mission: 'Transforming public transportation in Kigali and upcountry routes, replacing unorganized queuing with clean, scheduled seat bookings.',
      tech: ['React Native', 'Redis Queue', 'PostgreSQL', 'Socket.io', 'Twilio Gateway'],
      features: [
        'React-time bus seat selection and live bus location tracker.',
        'Instant mobile ticket generation via SMS & dynamic QR Codes.',
        'Automated route load balancing for fleet managers.',
        'Mobile Money (MoMo) integration for instant payment checkout.'
      ]
    }
  },
  {
    id: 'homland',
    name: 'Homland',
    tagline: 'Virtual Real-Estate & Direct Rental Portal',
    shortDesc: 'Helping tenants meet property owners directly, verifying spaces via virtual tours to eliminate broker scams.',
    iconName: 'Home',
    gradient: 'from-blue-500 to-cyan-500',
    shadow: 'shadow-blue-500/10',
    stats: [
      { label: 'Verified Properties', value: '2,400+' },
      { label: 'Active Owners', value: '650+' },
      { label: 'Broker Fee Savings', value: '100%' },
      { label: 'Virtual Tours Loaded', value: '1,500+' }
    ],
    details: {
      mission: 'Creating a highly transparent rental market where university students and families can confidently rent houses, apartments, and offices without broker exploitation.',
      tech: ['Vite React', 'Three.js 3D Viewer', 'Cloudinary', 'Node.js', 'PostgreSQL'],
      features: [
        '180° and 360° virtual property walk-throughs.',
        'Direct in-app messaging between landlord and prospective tenants.',
        'Standardized digital lease drafting and rent payment tracking.',
        'Direct validation system (INZOZI staff physically inspect listed listings).'
      ]
    }
  }
];

const Landing = ({ onEnterPortal }) => {
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [kigaliTime, setKigaliTime] = useState('');
  const [greeting, setGreeting] = useState({ rw: 'Muraho', en: 'Welcome' });
  const [secretCounter, setSecretCounter] = useState(0);

  // Fetch showcase dynamically from backend API
  useEffect(() => {
    const fetchShowcase = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/projects/public/showcase');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setProducts(data);
          }
        }
      } catch (err) {
        console.warn('[Landing] Failed to fetch live showcase, falling back to mock data:', err.message);
      }
    };
    fetchShowcase();
  }, []);

  // Update Kigali Local Time and Cultural Greeting
  useEffect(() => {
    const updateTime = () => {
      const options = {
        timeZone: 'Africa/Kigali',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      };
      
      const timeFormatter = new Intl.DateTimeFormat('en-US', options);
      const timeStr = timeFormatter.format(new Date());
      setKigaliTime(timeStr);

      const hour = parseInt(timeStr.split(':')[0], 10);
      if (hour >= 5 && hour < 12) {
        setGreeting({ rw: 'Mwaramutse', en: 'Good Morning' });
      } else if (hour >= 12 && hour < 18) {
        setGreeting({ rw: 'Mwiriwe', en: 'Good Afternoon' });
      } else if (hour >= 18 && hour < 22) {
        setGreeting({ rw: 'Mwiriwe', en: 'Good Evening' });
      } else {
        setGreeting({ rw: 'Muraho', en: 'Welcome' });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSecretClick = () => {
    // Hidden Easter-egg gateway: clicking the brand logo 5 times opens the portal login
    const newCount = secretCounter + 1;
    if (newCount >= 5) {
      setSecretCounter(0);
      onEnterPortal(); // Toggles the view to Login
    } else {
      setSecretCounter(newCount);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-hidden flex flex-col justify-between selection:bg-purple-600/30">
      
      {/* Drifting gradient nodes for premium visual aesthetic */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-900/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute top-[20%] right-[-10%] w-[45vw] h-[45vw] bg-rose-500/5 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-10%] w-[45vw] h-[45vw] bg-emerald-500/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-20">
        <div 
          onClick={handleSecretClick}
          className="flex items-center gap-3 cursor-default select-none group transition-all"
        >
          <img 
            src="/inzozi_group_logo.png" 
            alt="INZOZI Group Logo" 
            className="w-10 h-10 object-contain group-hover:scale-105 transition-transform"
          />
          <div>
            <h1 className="text-base font-extrabold text-white leading-none tracking-tight">INZOZI Group</h1>
            <span className="text-[9px] font-bold text-slate-500 tracking-widest uppercase block mt-1">Ecosystem Showcase</span>
          </div>
        </div>

        {/* Live Kigali Clock & Greeting Widget */}
        <div className="flex items-center gap-4 bg-slate-900/40 border border-slate-800/80 backdrop-blur-md px-4 py-2 rounded-2xl">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <div className="text-left shrink-0">
              <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider leading-none">Kigali Time</div>
              <div className="text-xs font-bold text-slate-300 font-mono mt-0.5">{kigaliTime || '--:--:--'}</div>
            </div>
          </div>
          <div className="border-l border-slate-800 h-6"></div>
          <div className="text-right">
            <span className="text-[10px] font-bold text-purple-400 block uppercase tracking-wide leading-none">{greeting.rw}!</span>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{greeting.en}</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-7xl mx-auto px-6 py-12 md:py-16 grid lg:grid-cols-12 gap-12 items-center flex-1 z-10">
        
        {/* Left Side: Text and Group Narrative */}
        <div className="lg:col-span-6 space-y-8 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-semibold tracking-wide animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Empowering Rwandan Communities Through Code
          </div>

          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] text-white">
              Software for the <br />
              <span className="bg-gradient-to-r from-purple-400 via-rose-400 to-amber-400 bg-clip-text text-transparent">
                Rhythm of Daily Life
              </span>
            </h2>
            <p className="text-slate-400 leading-relaxed text-sm md:text-base max-w-xl font-medium">
              We design and develop technology products that simplify community workflows. From securing bus rides and supporting neighborhood market vendors to translating sign language in schools, we build tools that connect people.
            </p>
          </div>

          {/* Key Value Propositions */}
          <div className="grid grid-cols-2 gap-4 max-w-lg">
            <div className="flex gap-3 items-start p-3.5 bg-slate-900/40 border border-slate-800/60 rounded-2xl">
              <Heart className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Trust & Safety First</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Hand-verified listings, fraud protections, and secure local checkout options.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start p-3.5 bg-slate-900/40 border border-slate-800/60 rounded-2xl">
              <Users className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Inclusive Accessibility</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Designed with low-bandwidth optimization and local Kinyarwanda support.</p>
              </div>
            </div>
          </div>

          {/* Real-world community impact indicators */}
          <div className="pt-6 border-t border-slate-900 max-w-lg">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-extrabold">Ecosystem Human Impact</div>
            <div className="grid grid-cols-3 gap-4 mt-3">
              <div>
                <div className="text-xl font-black text-white font-mono bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">1,200+</div>
                <div className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wider font-bold">Vendors Empowered</div>
              </div>
              <div>
                <div className="text-xl font-black text-white font-mono bg-gradient-to-r from-rose-400 to-amber-400 bg-clip-text text-transparent">18 Lines</div>
                <div className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wider font-bold">Routes Mapped</div>
              </div>
              <div>
                <div className="text-xl font-black text-white font-mono bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">98.4%</div>
                <div className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wider font-bold">Gesture Accuracy</div>
              </div>
            </div>
          </div>

          {/* Explore Prompt */}
          <div className="flex flex-wrap gap-4 items-center pt-2">
            <a 
              href="#products" 
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-2xl text-xs transition-all shadow-lg shadow-purple-500/10 hover:shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.99] flex items-center gap-2 cursor-pointer"
            >
              Explore Our Ecosystem
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Right Side: Interactive Image Panel showcasing the group artwork */}
        <div className="lg:col-span-6 flex justify-center items-center">
          <div className="relative w-full max-w-lg group">
            {/* Soft decorative glow behind the illustration */}
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/20 to-blue-500/20 rounded-3xl blur-2xl group-hover:scale-105 transition-all opacity-80 duration-500" />
            
            {/* Visual Glass Frame */}
            <div className="bg-slate-900/40 border border-slate-800/80 backdrop-blur-md rounded-3xl p-4 shadow-2xl relative transition-all duration-500 hover:border-purple-500/30 hover:shadow-purple-500/5">
              <img 
                src="/workspace_hero.png" 
                alt="INZOZI Group Connectivity Artwork" 
                className="w-full h-auto rounded-2xl object-cover mix-blend-lighten aspect-[4/3] select-none pointer-events-none"
              />
              
              {/* Floating metadata badge inside the illustration frame */}
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-slate-950/80 border border-slate-850 backdrop-blur-md flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-purple-300 font-extrabold uppercase tracking-wider">Community-First Platform</div>
                  <div className="text-[8.5px] text-slate-400 font-medium mt-0.5">Crafted to support local citizens & merchant trust</div>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Showcase Grid Section */}
      <section id="products" className="w-full max-w-7xl mx-auto px-6 py-16 border-t border-slate-900 z-10 space-y-10">
        <div className="text-center space-y-3">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 bg-purple-950/30 px-3 py-1 rounded-full border border-purple-500/10">Project Spotlight</span>
          <h3 className="text-3xl font-extrabold text-white tracking-tight">Our Digital Portfolios</h3>
          <p className="text-slate-400 text-xs max-w-lg mx-auto">
            Click on any product card below to deep dive into its features, real-world metrics, and development stack.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((prod) => {
            const Icon = typeof prod.icon === 'function' ? prod.icon : getIconComponent(prod.iconName || prod.icon);
            const primaryStat = prod.stats && prod.stats[0] ? prod.stats[0] : null;
            return (
              <div 
                key={prod.id}
                onClick={() => setSelectedProduct(prod)}
                className="bg-slate-900/20 hover:bg-slate-900/50 border border-slate-900 hover:border-purple-500/25 rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02] active:scale-[0.99] cursor-pointer relative group flex flex-col justify-between h-[310px] shadow-lg hover:shadow-purple-500/5"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${prod.gradient} flex items-center justify-center text-white shadow-lg ${prod.shadow} group-hover:scale-110 transition-transform duration-350 shrink-0`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    {(() => {
                      const statusInfo = getStatusLabelAndColor(prod.status);
                      return (
                        <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-md transition-colors ${statusInfo.bg}`}>
                          {statusInfo.label}
                        </span>
                      );
                    })()}
                  </div>
                  
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-white group-hover:text-purple-300 transition-colors">{prod.name}</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{prod.tagline}</p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                    {prod.shortDesc}
                  </p>
                </div>
                
                <div className="space-y-3 pt-4 border-t border-slate-900/60">
                  {primaryStat && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-950/60 border border-slate-900/80 text-[10px] font-mono text-slate-300 font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse"></span>
                      {primaryStat.label}: {primaryStat.value}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 group-hover:text-slate-300 font-semibold">
                    <span>Explore Product Impact</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Values & Team Section */}
      <section className="w-full max-w-7xl mx-auto px-6 py-16 border-t border-slate-900 z-10 grid md:grid-cols-3 gap-8">
        <div className="space-y-3.5 bg-slate-900/10 p-5 rounded-2xl border border-slate-900/60 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-purple-950/20 border border-purple-900/30 flex items-center justify-center text-purple-400">
            <Users className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Human-First Design</h4>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Every line of code is written to empower human relationships. From making bus rides stress-free for Kigali commuters to connecting sign language speakers in schools, we design for the community.
          </p>
        </div>
        <div className="space-y-3.5 bg-slate-900/10 p-5 rounded-2xl border border-slate-900/60 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-indigo-950/20 border border-indigo-900/30 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Dignity & Privacy First</h4>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            We design secure database boundaries to respect user and vendor trust, ensuring merchant financial logs and private data profiles are kept strictly separated and fully protected.
          </p>
        </div>
        <div className="space-y-3.5 bg-slate-900/10 p-5 rounded-2xl border border-slate-900/60 animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-rose-950/20 border border-rose-900/30 flex items-center justify-center text-rose-400">
            <Activity className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Active Community Listening</h4>
          <p className="text-xs text-slate-400 leading-relaxed font-medium">
            Instead of tracking dry system memory allocations, we monitor indicators that matter to citizens—like reducing physical queue times at bus terminals or adding dialect-friendly dictionary vocabularies.
          </p>
        </div>
      </section>

      {/* Product Deep-Dive Dialog Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto space-y-6 relative shadow-2xl animate-zoom-in">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedProduct(null)}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>

            {/* Header */}
            <div className="flex gap-4 items-center">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${selectedProduct.gradient} flex items-center justify-center text-white`}>
                {(() => {
                  const ModalIcon = typeof selectedProduct.icon === 'function' 
                    ? selectedProduct.icon 
                    : getIconComponent(selectedProduct.iconName || selectedProduct.icon);
                  return <ModalIcon className="w-7 h-7" />;
                })()}
              </div>
              <div>
                <h3 className="text-2xl font-black text-white">{selectedProduct.name}</h3>
                <p className="text-xs font-bold text-purple-400 tracking-wide mt-0.5">{selectedProduct.tagline}</p>
              </div>
            </div>

            <div className="border-t border-slate-850 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Our Vision & Mission</h4>
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {selectedProduct.details.mission}
              </p>
            </div>

            {/* Simulated Live Impact Telemetry */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-850">
              {selectedProduct.stats.map((stat, i) => (
                <div key={i} className="text-center md:text-left">
                  <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider leading-none">{stat.label}</span>
                  <span className="text-base font-extrabold text-white block mt-1.5 font-mono">{stat.value}</span>
                </div>
              ))}
            </div>

            {/* Feature Points */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Core Technical Capabilities</h4>
              <ul className="grid md:grid-cols-2 gap-3 text-xs text-slate-400">
                {selectedProduct.details.features.map((feat, i) => (
                  <li key={i} className="flex gap-2 items-start bg-slate-950/40 p-2.5 rounded-xl border border-slate-850">
                    <span className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Technologies list */}
            <div className="flex flex-wrap gap-2 pt-2 items-center">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-2">Built with:</span>
              {selectedProduct.details.tech.map((t, i) => (
                <span key={i} className="px-2.5 py-1 bg-slate-950 border border-slate-850 rounded-lg text-[10px] font-bold text-slate-400 font-mono">
                  {t}
                </span>
              ))}
            </div>

            <div className="border-t border-slate-850 pt-6 flex justify-end">
              <button 
                onClick={() => setSelectedProduct(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all cursor-pointer"
              >
                Close Spotlight
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Humanized Rich Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 pt-16 pb-8 border-t border-slate-900/60 z-20 space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 md:gap-12">
          
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <img 
              src="/inzozi_group_logo.png" 
              alt="INZOZI Group Logo" 
              className="w-8 h-8 object-contain"
            />
              <span className="text-sm font-extrabold text-white tracking-tight">INZOZI Group</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              We design digital infrastructure that supports local merchants, maps transit, and breaks accessibility barriers in Rwanda. Built by people, for people.
            </p>
            <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              Kigali Innovation City, Rwanda
            </div>
          </div>

          {/* Ecosystem Column */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 font-sans">Ecosystem</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#products" className="text-slate-500 hover:text-purple-400 transition-colors font-medium whitespace-nowrap">Impressa E-Commerce</a></li>
              <li><a href="#products" className="text-slate-500 hover:text-rose-400 transition-colors font-medium whitespace-nowrap">Gesture to Speech</a></li>
              <li><a href="#products" className="text-slate-500 hover:text-emerald-400 transition-colors font-medium whitespace-nowrap">Linker Bus Portal</a></li>
              <li><a href="#products" className="text-slate-500 hover:text-blue-400 transition-colors font-medium whitespace-nowrap">Homland Real Estate</a></li>
            </ul>
          </div>

          {/* Resources & Careers */}
          <div className="col-span-1 md:col-span-3 space-y-3">
            <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Community</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#" onClick={(e) => e.preventDefault()} className="text-slate-500 hover:text-white transition-colors font-medium font-sans">Local Impact Stories</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors font-medium">Careers <span className="whitespace-nowrap text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-950/40 border border-purple-500/20 text-purple-400">We're hiring</span></a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="text-slate-500 hover:text-white transition-colors font-medium">Design Blog</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="text-slate-500 hover:text-white transition-colors font-medium">Newsroom</a></li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div className="col-span-2 md:col-span-3 space-y-3">
            <h5 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Trust & Security</h5>
            <ul className="space-y-2 text-xs">
              <li><a href="#" onClick={(e) => e.preventDefault()} className="text-slate-500 hover:text-white transition-colors font-medium">Community Guidelines</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="text-slate-500 hover:text-white transition-colors font-medium">Safety Hub & Audits</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="text-slate-500 hover:text-white transition-colors font-medium">Privacy Policy</a></li>
              <li><a href="#" onClick={(e) => e.preventDefault()} className="text-slate-500 hover:text-white transition-colors font-medium">Accessibility Standard</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-900/60 pt-8 flex flex-col md:flex-row justify-between items-center text-[11px] text-slate-600 gap-4">
          <div className="flex items-center gap-1.5 font-medium">
            <span>© {new Date().getFullYear()} INZOZI Group. Made with </span>
            <span className="text-rose-500 animate-pulse">♥</span>
            <span> for civic and vendor empowerment.</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-medium tracking-wide">Ecosystem Console v1.5</span>
            {/* Developer Gateway Switch */}
            <span 
              onClick={onEnterPortal}
              className="w-2.5 h-2.5 rounded-full bg-slate-950 hover:bg-purple-500/30 cursor-pointer transition-all duration-300"
              title="Secure Gateway"
            />
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Landing;
