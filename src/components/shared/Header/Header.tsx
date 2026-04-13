"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from './Header.module.scss';
import apiFetch from '../../../utils/apiFetch';
import { pgProgram } from '@/app/apiData/pgProgram';
import { ugProgram } from '@/app/apiData/ugProgram';
import { diplomaProgram } from '@/app/apiData/diplomaProgram';
import Marquee from 'react-fast-marquee';
import { usePathname } from 'next/navigation';
import AdmissionEnquiryPopup from '../AdmissionEnquiryPopup/AdmissionEnquiryPopup';

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null); // for multi-level
  const [shortNews, setShortNews] = useState<string[]>([]);
  const [enquiryOpen, setEnquiryOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch short news (use centralized apiFetch which tries external BASE_URL then same-origin)
  useEffect(() => {
    const fetchShortNews = async () => {
      try {
        const res = await apiFetch('/api/short-news/active');
        if (!res.ok) {
          // Non-2xx response: log at debug level and don't spam console.error
          console.warn('Short-news endpoint returned non-OK status', res.status);
          return;
        }

        const data = await res.json();
        const raw = data?.shortNews;
        if (Array.isArray(raw)) {
          const newsItems = raw.map((item: unknown) => {
            if (item && typeof item === 'object' && 'title' in (item as any)) {
              return String((item as any).title ?? '');
            }
            return '';
          }).filter(Boolean);
          setShortNews(newsItems);
        }
      } catch (err: unknown) {
        // Use warn rather than error to reduce noise when backend is down.
        console.warn('Failed to fetch short news:', err instanceof Error ? err.message : String(err));
      }
    };

    fetchShortNews();
  }, []);

  const toggleDropdown = (dropdownName: string) => {
    setOpenDropdown((prev) => (prev === dropdownName ? null : dropdownName));
    setOpenSubmenu(null); // reset submenus on change
  };

  const toggleSubmenu = (submenuName: string) => {
    setOpenSubmenu((prev) => (prev === submenuName ? null : submenuName));
  };

  // Close dropdowns when clicking mobile menu links
  const handleMobileLinkClick = () => {
    setOpenDropdown(null);
    setOpenSubmenu(null);
  };

  return (
    <header className={scrolled ? styles.scrollHeader : (isHome ? styles.transparentHeader : styles.stickyHeader)}>

      <div className={styles.marqueeContainer}>
        <div style={{backgroundColor:'rgb(139, 74, 74)', color: 'white', padding: '8px 0', fontSize: '14px'}}>
          <Marquee speed={50} gradient={false}>
            {shortNews.length > 0 ? (
              shortNews.map((news, index) => `"${news}"`).join(', ')
            ) : (
              'Welcome to our website! Explore our courses and programs.'
            )}
          </Marquee>
        </div>
      </div>
      <div className={styles.containerFluid}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Link href="/">
              <img src="/images/tiper-logo.png" alt="Logo" />
            </Link>
          </div>

          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={menuOpen ? styles.barOpen : styles.bar}></span>
            <span className={menuOpen ? styles.barOpen : styles.bar}></span>
            <span className={menuOpen ? styles.barOpen : styles.bar}></span>
          </button>

          <nav className={menuOpen ? styles.navMobile : styles.nav}>
              <button
            className={styles.hamburger}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span>X</span>
          </button>
            <ul>
              <li className={pathname === '/' ? styles.active : ''}><Link href="/">Home</Link></li>
              <li className={styles.dropdown + (openDropdown === "aboutUs" ? ' ' + styles.active : '')}>
                <span
                  className={styles.dropdownToggle}
                  onClick={() => toggleDropdown("aboutUs")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && toggleDropdown("aboutUs")}
                >About Us ▾
                </span>
                <ul className={`${styles.dropdownMenu} ${openDropdown === "aboutUs" ? styles.show : ""}`}>
                  <li className={pathname === '/about' ? styles.active : ''}><Link href="/about">About Group</Link></li>
                  <li className={pathname === '/philosophy' ? styles.active : ''}><Link href="/philosophy">Our Philosophy</Link></li>
                  <li className={pathname === '/principle-message' ? styles.active : ''}><Link href="/principle-message">Director General</Link></li>
                </ul>
              </li>
             
              <li className={pathname === '/admission' ? styles.active : ''}><Link href="/admission">Admission</Link></li>

              {/* Courses Dropdown (Multi-Level) */}
              <li className={styles.dropdown + (openDropdown === "courses" ? ' ' + styles.active : '')}>
                <span
                  className={styles.dropdownToggle}
                  onClick={() => toggleDropdown("courses")}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && toggleDropdown("courses")}
                >
                   Courses ▾
                </span>
                <ul className={`${styles.dropdownMenu} ${openDropdown === "courses" ? styles.show : ""}`}>
                  {ugProgram.map((course) => (
                    <li key={course.ugSlug} className={pathname === `/courses/graduate-program/${course.ugSlug}` ? styles.active : ''}>
                      <Link href={`/courses/graduate-program/${course.ugSlug}`}>
                        {course.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              <li><Link href="https://translam.com/placement" target="_blank" rel="noopener noreferrer">Placements</Link></li>
              <li className={pathname === '/departments' ? styles.active : ''}><Link href="/departments">Departments</Link></li>
              <li className={pathname === '/documents' ? styles.active : ''}><Link href="/documents">Documents</Link></li>
              <li className={pathname === '/events' ? styles.active : ''}><Link href="https://www.translam.com/events" target="_blank">Events</Link></li>
              <li className={pathname === '/contact' ? styles.active : ''}><Link href="/contact">Contact Us</Link></li>
              <li><Link href="https://translam.com/" target="_blank" rel="noopener noreferrer">Group Website</Link></li>
            </ul>

              <div className={styles.loginBtnContainer}>
              <button className={styles.loginBtn} onClick={() => setEnquiryOpen(true)}>Admission Enquiry</button>
              </div>

          </nav>

          <button className={styles.loginBtn} onClick={() => setEnquiryOpen(true)}>Admission Enquiry</button>
        </div>
      </div>
      <AdmissionEnquiryPopup open={enquiryOpen} onClose={() => setEnquiryOpen(false)} />
    </header>
  );
}

export default Header;
