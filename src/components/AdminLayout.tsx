"use client";
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const [activeTab, setActiveTab] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);

  // Read search params on client mount (avoid using useSearchParams which requires a Suspense
  // boundary during prerender). This runs only in the browser and prevents prerender errors.
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      setSearchParams(sp);
    } catch (e) {
      // ignore in non-browser environments
      setSearchParams(null);
    }
  }, []);

  const navigationStructure = [
    { 
      name: 'Home', 
      icon: '🏠', 
      route: '/admin/home',
      subTabs: [
        { name: 'Home Slider', route: '/admin/home-slider' },
        { name: 'Our Success', route: '/admin/our-success' },
        // { name: 'Our Institutions', route: '/admin/our-institutions' },
        { name: 'Our Recruiters', route: '/admin/our-recruiters' },
        { name: 'Why Choose US', route: '/admin/why-choose-us' },
        { name: 'Incredibly Outstanding Placements', route: '/admin/outstanding-placements' },
        { name: 'TESTIMONIAL', route: '/admin/testimonial' }
      ]
    },
    { 
      name: 'About Us', 
      icon: '👥', 
      route: '/admin/aboutus',
      subTabs: [
        { name: 'About Group', route: '/admin/aboutus/about-group' },
        { name: 'Our Philosophy', route: '/admin/aboutus/our-philosophy' },
        { name: 'Principle Message', route: '/admin/aboutus/director-desk' }
      ]
    },
    { name: 'Admission', icon: '📝', route: '/admin/admission', subTabs: [] },
    { name: 'Admission Forms', icon: '📋', route: '/admin/admission-forms', subTabs: [] },
    { 
      name: 'Placement', 
      icon: '💼', 
      route: '/admin/placement',
      subTabs: []
    },
    { name: 'Events', icon: '🎉', route: '/admin/events', subTabs: [] },
    { name: 'Gallery', icon: '📸', route: '/admin/gallery', subTabs: [] },
    { name: 'Documents', icon: '📄', route: '/admin/documents', subTabs: [] },
    { name: 'Contact Us', icon: '📞', route: '/admin/contact', subTabs: [] },
    { name: 'Short News', icon: '📰', route: '/admin/short-news', subTabs: [] },
    { name: 'SMTP Settings', icon: '📧', route: '/admin/smtp', subTabs: [] },
    { name: 'Email Logs', icon: '📨', route: '/admin/email-logs', subTabs: [] }
  ];

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin/login');
    }

    // Set active tab based on current pathname
    // Sort by route length to ensure more specific routes match first
    const sortedNavigation = [...navigationStructure].sort((a, b) => b.route.length - a.route.length);
    const currentTab = sortedNavigation.find(item => 
      pathname === item.route || pathname.startsWith(item.route + '/')
    );
    
    if (currentTab) {
      setActiveTab(currentTab.name);

      // Set active sub-tab based on search params (only when searchParams are available)
      if (currentTab.subTabs.length > 0 && searchParams) {
        const section = searchParams.get('section') || searchParams.get('program');
        const subTab = currentTab.subTabs.find(sub => sub.route.includes(section || ''));
        if (subTab) {
          setActiveSubTab(subTab.name);
        }
      }
    }
  }, [router, pathname, searchParams]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    router.push('/admin/login');
  };

  const handleTabClick = (route: string, tabName: string, subTabs: any[]) => {
    if (subTabs.length === 0) {
      // No sub-tabs, navigate directly
      router.push(route);
    } else {
      // Has sub-tabs, navigate to first sub-tab
      setActiveTab(tabName);
      setActiveSubTab(subTabs[0].name);
      router.push(subTabs[0].route);
    }
  };

  const handleSubTabClick = (route: string, subTabName: string) => {
    setActiveSubTab(subTabName);
    router.push(route);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      display: 'flex',
      fontFamily: 'system-ui, sans-serif'
    }}>
      {/* Sidebar */}
      <div style={{
        width: isSidebarOpen ? '256px' : '64px',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh',
        zIndex: 1000
      }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: !isSidebarOpen ? 'center' : 'flex-start'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: '#2563eb',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: '700'
              }}>
                T
              </div>
              {isSidebarOpen && (
                <span style={{
                  marginLeft: '8px',
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#1f2937'
                }}>
                  Translam Admin
                </span>
              )}
            </div>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              style={{
                padding: '4px',
                borderRadius: '4px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer'
              }}
              onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#f3f4f6'; }}
              onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
            >
              <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{
          flex: '1',
          overflowY: 'auto',
          padding: '8px'
        }}>
          {navigationStructure.map((item) => (
            <div key={item.name} style={{ marginBottom: '4px' }}>
              <button
                onClick={() => handleTabClick(item.route, item.name, item.subTabs)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  borderRadius: '8px',
                  textAlign: 'left',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  backgroundColor: activeTab === item.name ? '#eff6ff' : 'transparent',
                  color: activeTab === item.name ? '#1d4ed8' : '#6b7280',
                  borderRight: activeTab === item.name ? '2px solid #2563eb' : 'none'
                }}
                onMouseOver={(e) => {
                  if (activeTab !== item.name) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseOut={(e) => {
                  if (activeTab !== item.name) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                {isSidebarOpen && (
                  <>
                    <span style={{
                      marginLeft: '12px',
                      fontWeight: '500'
                    }}>
                      {item.name}
                    </span>
                    {item.subTabs.length > 0 && (
                      <svg style={{
                        marginLeft: 'auto',
                        width: '16px',
                        height: '16px'
                      }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </>
                )}
              </button>
              
              {/* Sub Tabs */}
              {isSidebarOpen && activeTab === item.name && item.subTabs.length > 0 && (
                <div style={{
                  marginLeft: '24px',
                  marginTop: '8px'
                }}>
                  {item.subTabs.map((subTab) => (
                    <button
                      key={subTab.name}
                      onClick={() => handleSubTabClick(subTab.route, subTab.name)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px',
                        borderRadius: '6px',
                        fontSize: '14px',
                        border: 'none',
                        cursor: 'pointer',
                        marginBottom: '4px',
                        transition: 'all 0.2s',
                        backgroundColor: activeSubTab === subTab.name ? '#dbeafe' : 'transparent',
                        color: activeSubTab === subTab.name ? '#1d4ed8' : '#6b7280',
                        fontWeight: activeSubTab === subTab.name ? '500' : '400'
                      }}
                      onMouseOver={(e) => {
                        if (activeSubTab !== subTab.name) {
                          (e.currentTarget as HTMLElement).style.backgroundColor = '#f9fafb';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (activeSubTab !== subTab.name) {
                          (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {subTab.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* User Section */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: !isSidebarOpen ? 'center' : 'flex-start'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              backgroundColor: '#d1d5db',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{
                fontSize: '14px',
                fontWeight: '500',
                color: '#6b7280'
              }}>
                A
              </span>
            </div>
            {isSidebarOpen && (
              <div style={{ marginLeft: '12px', flex: '1' }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#1f2937'
                }}>
                  Admin User
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#6b7280'
                }}>
                  admin@translam.com
                </div>
              </div>
            )}
          </div>
          {isSidebarOpen && (
            <button 
              onClick={handleLogout}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '8px 12px',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                borderRadius: '6px',
                border: 'none',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fee2e2'; }}
              onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#fef2f2'; }}
            >
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        marginLeft: isSidebarOpen ? '256px' : '64px',
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Top Bar */}
        <header style={{
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          borderBottom: '1px solid #e5e7eb',
          padding: '16px 24px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1f2937',
              margin: '0'
            }}>
              {title}
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <button style={{
                padding: '8px',
                color: '#9ca3af',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
              onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.color = '#6b7280'; }}
              onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.color = '#9ca3af'; }}
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V6h0z" />
                </svg>
              </button>
              <button style={{
                padding: '8px',
                color: '#9ca3af',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                borderRadius: '4px'
              }}
              onMouseOver={(e) => { (e.currentTarget as HTMLElement).style.color = '#6b7280'; }}
              onMouseOut={(e) => { (e.currentTarget as HTMLElement).style.color = '#9ca3af'; }}
              >
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div style={{ flex: '1', padding: '32px' }}>
          {children}
        </div>
      </div>
    </div>
  );
}