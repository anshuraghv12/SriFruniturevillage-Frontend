// Header.jsx - UPDATED VERSION with Full-Screen Mobile Menu
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, User, ShoppingCart, Menu, X, Heart, MapPin, LogOut, ArrowLeft, Store, Grid, Truck, Building, PenTool, FileText, Info, MessageCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const checkAuthStatus = () => {
      const token = localStorage.getItem('token');
      const id = localStorage.getItem('id');
      const name = localStorage.getItem('username') || localStorage.getItem('first_name') || 'User';
      if (token && id) {
        setIsLoggedIn(true);
        setUserName(name);
      } else {
        setIsLoggedIn(false);
        setUserName('');
      }
    };
    checkAuthStatus();
    window.addEventListener('storage', checkAuthStatus);
    return () => window.removeEventListener('storage', checkAuthStatus);
  }, []);

  useEffect(() => {
    const fetchWishlistCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { setWishlistCount(0); return; }
        const res = await API.get('/api/wishlist');
        const data = Array.isArray(res.data) ? res.data : (res.data.wishlist || res.data.items || []);
        setWishlistCount(data.length);
      } catch (err) {
        console.warn('Could not fetch wishlist count:', err);
      }
    };
    fetchWishlistCount();
    const onUpdate = () => fetchWishlistCount();
    window.addEventListener('wishlistUpdated', onUpdate);
    return () => window.removeEventListener('wishlistUpdated', onUpdate);
  }, [isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    localStorage.removeItem('username');
    localStorage.removeItem('first_name');
    localStorage.removeItem('last_name');
    localStorage.removeItem('email');
    setIsLoggedIn(false);
    setUserName('');
    navigate('/');
    window.location.reload();
  };

  const handleProfileClick = () => {
    if (isLoggedIn) navigate('/userprofile');
    else navigate('/login');
  };

  const [categories] = useState([
    { _id: '1', name: 'Sofas', slug: 'sofas' },
    { _id: '2', name: 'Living', slug: 'living' },
    { _id: '3', name: 'Bedroom', slug: 'bedroom' },
    { _id: '4', name: 'Dining & Kitchen', slug: 'dining-kitchen' },
    { _id: '5', name: 'Storage', slug: 'storage' },
    { _id: '6', name: 'Study & Office', slug: 'study-office' },
    { _id: '7', name: 'Custom Furniture', slug: 'custom-furnitures' }
  ]);

  const [activeMenu, setActiveMenu] = useState(null);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMobileSubmenu, setActiveMobileSubmenu] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount] = useState(3);
  const [wishlistCount, setWishlistCount] = useState(0);
  const timeoutRef = useRef(null);
  const subMenuTimeoutRef = useRef(null);

  const menuData = {
    'Sofas': {
      sections: [
        {
          title: 'SOFA SETS',
          items: ['Sofas', 'Sofa Cum Beds', '3 Seater Sofas', '1 Seater Sofas', '3+1+1 Sofa Sets', 'L Shaped Sofas'],
          hasDropdown: true
        },
      ]
    },
    'Bedroom': {
      sections: [
        { title: 'BEDS', items: ['King Size Beds', 'Queen Size Beds', 'Single Beds', 'Hydraulic Storage Beds', 'Poster Beds', 'Sofa Cum Beds'], hasDropdown: true },
        { title: 'WARDROBES', items: ['Wooden Wardrobe'], hasDropdown: true },
        { title: 'DRESSING TABLES', items: ['Wooden Dressing Table'], hasDropdown: true },
        { title: 'BED SIDES', items: ['Bed Side Table'], hasDropdown: true },
      ]
    },
    'Living': {
      sections: [
        { title: 'LIVING STORAGE', items: ['TV Units', 'Temples', 'Book Shelves', 'Display Units', 'Shoe Racks', 'Sideboards', 'Chest of Drawers', 'Trunk Box'], hasDropdown: true },
        { title: 'SEATING & CHAIRS', items: ['Chairs', 'Stools', 'Benches', 'Swings'], hasDropdown: true },
        { title: 'TABLES', items: ['Coffee Tables', 'Side Tables', 'Console Tables'], hasDropdown: true },
        { title: 'DECOR', items: ['Wall Shelves & Hanger', 'Wall Mirrors'], hasDropdown: true },
        { title: 'SEATING', items: ['Wooden Diwan', 'Benches', 'Stools'], hasDropdown: true }
      ]
    },
    'Dining & Kitchen': {
      sections: [
        { title: 'DINING FURNITURE', items: ['Dining Table Sets', '2 Seater Dining Sets', '4 Seater Dining Sets', '6 Seater Dining Sets', 'Dining Tables', 'Dining Chairs', 'Benches'], hasDropdown: true },
        { title: 'KITCHEN FURNITURE', items: ['Kitchen Cabinets & SideBoards', 'Crockery Units'], hasDropdown: true },
        { title: 'KITCHENWARE', items: ['Wooden Tray', 'Wooden Jars', 'Spice Box', 'Chopping Board', 'Coasters', 'Tissue Box'], hasDropdown: true }
      ]
    },
    'Storage': {
      sections: [
        { title: 'LIVING STORAGE', items: ['TV Units', 'Book Shelves', 'Display Units', 'Shoe Racks', 'Temples', 'Magazine Racks', 'Wooden Corner', 'Trunk Box'], hasDropdown: true },
        { title: 'BEDROOM STORAGE', items: ['Chest of Drawers', 'Wooden Wardrobe', 'Bed Side Tables', 'Wooden Dressing Table', 'Almira'], hasDropdown: true },
        { title: 'BAR FURNITURE', items: ['Bar Cabinets'], hasDropdown: true }
      ]
    },
    'Study & Office': {
      sections: [
        { title: 'TABLES', items: ['Study Tables', 'Computer Tables', 'Wall Mounted Study Table'], hasDropdown: true },
        { title: 'STORAGE', items: ['Wooden Corner'], hasDropdown: true }
      ]
    },
    'Custom Furniture': {
      sections: [],
      hasDropdown: false,
      link: '/contact-us'
    }
  };

  const navigateToSlug = (itemName, isMainCategory = false) => {
    setIsMobileMenuOpen(false);
    setActiveMenu(null);
    setActiveSubMenu(null);
    setActiveMobileSubmenu({});

    if (isMainCategory) {
      const category = categories.find(cat => cat.name === itemName);
      if (category) { navigate(`/${category.slug}`); return; }
    }

    const slug = itemName.toLowerCase().replace(/\s+/g, '-').replace(/\+/g, '').replace(/&/g, '');
    navigate(`/${slug}`);
  };

  const handleMouseEnter = (menu) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
      setActiveSubMenu(null);
    }, 300);
  };

  const handleSubMenuEnter = (sectionTitle) => {
    if (subMenuTimeoutRef.current) clearTimeout(subMenuTimeoutRef.current);
    setActiveSubMenu(sectionTitle);
  };

  const handleSubMenuLeave = () => {
    subMenuTimeoutRef.current = setTimeout(() => setActiveSubMenu(null), 200);
  };

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : 'unset';
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (subMenuTimeoutRef.current) clearTimeout(subMenuTimeoutRef.current);
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="bg-white sticky top-0 z-50 shadow-sm border-b border-gray-200">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">

          {/* ───── MOBILE HEADER ───── */}
          <div className="lg:hidden flex items-center justify-between py-2 gap-2">

            {/* Hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex-shrink-0 p-2 -ml-1 rounded-md active:bg-gray-100"
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>

            {/* Logo – centred, full visible */}
            <div
              className="flex-1 flex justify-center cursor-pointer"
              onClick={() => navigate('/')}
            >
              <img
                src="/SFV Log 637x154 Pxl.png"
                alt="Sri Furniture Village"
                className="h-9 w-auto object-contain max-w-[160px]"
                style={{ imageRendering: 'crisp-edges' }}
              />
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => navigate('/wishlist')} className="relative p-2 rounded-md active:bg-gray-100" aria-label="Wishlist">
                <Heart className="h-6 w-6 text-gray-700" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-orange-600 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                    {wishlistCount}
                  </span>
                )}
              </button>
              <button onClick={() => navigate('/cart')} className="relative p-2 rounded-md active:bg-gray-100" aria-label="Cart">
                <ShoppingCart className="h-6 w-6 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-orange-600 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 flex items-center justify-center px-0.5">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ───── MOBILE SEARCH BAR ───── */}
          <div className="lg:hidden pb-2.5">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const q = searchQuery.trim();
                    if (q) navigate(`/search?search=${encodeURIComponent(q)}`);
                  }
                }}
                placeholder="Search Products, Color & More..."
                className="w-full px-4 py-2.5 pr-11 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-sm bg-gray-50"
              />
              <button
                onClick={() => { const q = searchQuery.trim(); if (q) navigate(`/search?search=${encodeURIComponent(q)}`); }}
                className="absolute right-0 top-0 bottom-0 px-3 flex items-center"
              >
                <Search className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* ───── DESKTOP HEADER ───── */}
          <div className="hidden lg:flex items-center justify-between py-4 border-b border-gray-100">
            <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
              <img src="/SFV Log 637x154 Pxl.png" alt="Sri Furniture Village Logo" className="h-12 w-auto object-contain" />
            </div>

            <div className="flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { const q = searchQuery.trim(); if (q) navigate(`/search?search=${encodeURIComponent(q)}`); } }}
                  placeholder="Search Products, Color & More..."
                  className="w-full px-4 py-2.5 pr-10 border border-orange-300 rounded-lg focus:outline-none focus:border-orange-500 text-sm"
                />
                <button onClick={() => { const q = searchQuery.trim(); if (q) navigate(`/search?search=${encodeURIComponent(q)}`); }} className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Search className="h-5 w-5 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <a href="#location" className="flex flex-col items-center text-gray-700 hover:text-orange-600 transition-colors">
                <MapPin className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">Stores</span>
              </a>
              <button onClick={handleProfileClick} className="flex flex-col items-center text-gray-700 hover:text-orange-600 transition-colors p-2">
                <User className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{isLoggedIn ? 'Profile' : 'Login'}</span>
              </button>
              {isLoggedIn && (
                <button onClick={handleLogout} className="flex flex-col items-center text-gray-700 hover:text-red-600 transition-colors p-2">
                  <LogOut className="h-5 w-5 mb-1" />
                  <span className="text-xs font-medium">Logout</span>
                </button>
              )}
              <button onClick={() => navigate('/wishlist')} className="flex flex-col items-center text-gray-700 hover:text-orange-600 transition-colors p-2">
                <Heart className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">Wishlist ({wishlistCount})</span>
              </button>
              <button onClick={() => navigate('/cart')} className="flex flex-col items-center text-gray-700 hover:text-orange-600 transition-colors relative p-2">
                <ShoppingCart className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">Cart (0)</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">{cartCount}</span>
                )}
              </button>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center justify-center space-x-1 py-3">
            {categories.map((cat) => (
              <div key={cat._id} className="relative" onMouseEnter={() => handleMouseEnter(cat.name)} onMouseLeave={handleMouseLeave}>
                <button
                  onClick={() => navigateToSlug(cat.name, true)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${activeMenu === cat.name ? 'text-orange-600 border-b-2 border-orange-600' : 'text-gray-700 hover:text-orange-600'}`}
                >
                  {cat.name}
                  {menuData[cat.name] && <ChevronDown className="h-4 w-4 inline ml-1 align-sub" />}
                </button>
                {activeMenu === cat.name && menuData[cat.name] && (
                  <div
                    className="absolute left-0 top-full mt-2 bg-white shadow-2xl rounded-lg border border-gray-100 z-50"
                    style={{ minWidth: '220px' }}
                    onMouseEnter={() => handleMouseEnter(cat.name)}
                    onMouseLeave={handleMouseLeave}
                  >
                    <div className="py-2">
                      {menuData[cat.name].sections.map((section, idx) => (
                        <div key={idx} className="relative" onMouseEnter={() => section.hasDropdown && handleSubMenuEnter(section.title)} onMouseLeave={handleSubMenuLeave}>
                          <button
                            onClick={() => !section.hasDropdown && navigateToSlug(section.title)}
                            className="w-full px-4 py-2.5 text-left text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center justify-between group"
                          >
                            {section.title}
                            {section.hasDropdown && <ChevronDown className="h-4 w-4 -rotate-90 group-hover:translate-x-1 transition-transform" />}
                          </button>
                          {section.hasDropdown && activeSubMenu === section.title && (
                            <div className="absolute left-full top-0 ml-1 bg-white shadow-2xl rounded-lg border border-gray-100 z-50" style={{ minWidth: '200px' }} onMouseEnter={() => handleSubMenuEnter(section.title)} onMouseLeave={handleSubMenuLeave}>
                              <div className="py-2">
                                {section.items.map((item, itemIdx) => (
                                  <button key={itemIdx} onClick={() => navigateToSlug(item, false)} className="w-full px-4 py-2 text-left text-sm text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors flex items-center group">
                                    <span className="w-1 h-1 bg-orange-400 rounded-full mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                                    {item}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </header>

      {/* ───── MOBILE FULL-SCREEN BACKDROP ───── */}
      <div
        className={`lg:hidden fixed inset-0 bg-black z-40 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* ───── MOBILE FULL-SCREEN DRAWER ───── */}
      {/*
        Key changes vs original:
        • w-full  → fills 100vw on all phones (no 85% cap on small screens)
        • max-w-none → removes any max-width cap
        • inset-0 → top/right/bottom/left all 0, truly edge-to-edge
        • transition-transform for smooth slide-in
      */}
      <div
        className={`lg:hidden fixed inset-0 w-full bg-gray-50 z-50 flex flex-col transform transition-transform duration-300 ease-in-out overflow-y-auto ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* ── Drawer Top Bar ── */}
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-1.5 -ml-1.5 rounded-md active:bg-gray-100"
              aria-label="Close menu"
            >
              <ArrowLeft className="h-6 w-6 text-gray-800" />
            </button>
            {/* Logo clearly visible in drawer */}
            <img
              src="/SFV Log 637x154 Pxl.png"
              alt="Sri Furniture Village"
              className="h-8 w-auto object-contain"
              style={{ maxWidth: '140px' }}
            />
          </div>
          <button
            onClick={() => {
              if (isLoggedIn) navigate('/userprofile');
              else navigate('/login');
              setIsMobileMenuOpen(false);
            }}
            className="text-sm font-semibold text-gray-800 hover:text-orange-600 transition-colors"
          >
            {isLoggedIn ? userName : 'Login / Signup'}
          </button>
        </div>

        {/* ── Store Promo Banner ── */}
        <button
          className="w-full flex items-center justify-between px-4 py-3.5 bg-[#fff8f3] border-b border-orange-100 active:bg-orange-50"
          onClick={() => { navigate('/stores'); setIsMobileMenuOpen(false); }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-orange-100 flex-shrink-0">
              <Store className="h-5 w-5 text-orange-500" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-orange-600 leading-tight">Get Instant Extra Discount*</p>
              <p className="text-xs text-gray-500 mt-0.5">On Visiting Your Nearest Store</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
        </button>

        {/* ── Category Grid ── */}
        <div className="p-3 bg-[#f4f5f8] border-b border-gray-200">
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { name: 'Sofas', img: '/latest/Sofa Collection.jpg.jpeg', slug: 'sofas' },
              { name: 'Living', img: '/latest/Home side.jpg.jpeg', slug: 'living' },
              { name: 'Bedroom', img: '/latest/BEDROOM Collection.jpg.jpeg', slug: 'bedroom' },
              { name: 'Mattress', img: '/latest/BEDROOM Collection (1).jpg.jpeg', slug: 'mattress' },
              { name: 'Dining', img: '/latest/Dining Collection.jpg.jpeg', slug: 'dining-kitchen' },
              { name: 'Storage', img: '/latest/Home side 2.jpg.jpeg', slug: 'storage' },
              { name: 'Study & Office', img: '/latest/Study Collection.jpg.jpeg', slug: 'study-office' },
              { name: 'Outdoor', img: '/latest/Home.jpg.jpeg', slug: 'outdoor' },
              { name: 'Decor & Furnishing', img: '/latest/coffee Collection.jpg.jpeg', slug: 'decor' },
              { name: 'Luxury Furniture', img: '/latest/Home .jpg.jpeg', slug: 'luxury' }
            ].map((cat, idx) => (
              <button
                key={idx}
                onClick={() => { navigate('/' + cat.slug); setIsMobileMenuOpen(false); }}
                className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 active:border-orange-300 active:bg-orange-50 transition-colors overflow-hidden"
                style={{ minHeight: '60px' }}
              >
                {/* Image area */}
                <div className="w-[52px] h-[60px] flex-shrink-0 bg-gray-100 overflow-hidden">
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                {/* Label */}
                <span className="flex-1 px-2.5 text-xs font-semibold text-gray-800 text-left leading-tight">
                  {cat.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Links List ── */}
        <div className="bg-white flex-1">
          {/* Modular Kitchen – special row with "New" badge */}
          <button
            onClick={() => { navigate('/modular-kitchen'); setIsMobileMenuOpen(false); }}
            className="flex items-center w-full px-5 py-4 border-b border-gray-100 active:bg-gray-50"
          >
            <Grid className="h-5 w-5 text-gray-500 mr-4 flex-shrink-0" strokeWidth={1.5} />
            <span className="text-sm font-medium text-gray-700 flex-grow text-left">Modular Kitchen & Wardrobe</span>
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-2">New</span>
          </button>

          {[
            { name: 'Track Order', icon: Truck, slug: '/track-order' },
            { name: 'Stores', icon: Store, slug: '/stores' },
            { name: 'Furniture Franchise', icon: Building, slug: '/franchise' },
            { name: 'Design Services', icon: PenTool, slug: '/design-services' },
            { name: 'Blogs', icon: FileText, slug: '/blogs' },
            { name: 'About Us', icon: Info, slug: '/about' },
            { name: 'Support', icon: MessageCircle, slug: '/contact' },
            { name: 'My Account', icon: User, slug: '/userprofile' }
          ].map((link, idx) => {
            const Icon = link.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  if (link.name === 'My Account') {
                    if (isLoggedIn) navigate('/userprofile'); else navigate('/login');
                  } else {
                    navigate(link.slug);
                  }
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-5 py-4 border-b border-gray-100 active:bg-gray-50"
              >
                <Icon className="h-5 w-5 text-gray-500 mr-4 flex-shrink-0" strokeWidth={1.5} />
                <span className="text-sm font-medium text-gray-700">{link.name}</span>
                <ChevronRight className="h-4 w-4 text-gray-300 ml-auto" />
              </button>
            );
          })}

          {/* Logout row (only when logged in) */}
          {isLoggedIn && (
            <button
              onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
              className="flex items-center w-full px-5 py-4 border-b border-gray-100 active:bg-red-50"
            >
              <LogOut className="h-5 w-5 text-red-400 mr-4 flex-shrink-0" strokeWidth={1.5} />
              <span className="text-sm font-medium text-red-500">Logout</span>
            </button>
          )}

          {/* Bottom padding so last item isn't glued to edge on notched phones */}
          <div className="h-8" />
        </div>
      </div>
    </>
  );
};

export default Header;