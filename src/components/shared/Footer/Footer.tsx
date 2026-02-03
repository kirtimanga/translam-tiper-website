'use client';
import React,{useRef} from 'react'
import styles from './Footer.module.scss'

function Footer() {
 
  return (
    <>
    <footer className={styles.footer}>
      <div className={styles.topSection}>
        <h2 className={styles.title}>TRANSLAM GROUP OF INSTITUTIONS</h2>
        
        <div className={styles.links}>
          <a href="https://www.translam.com/" target="_blank">Visit Group Website</a>
          <span>|</span>
          <a href="https://www.translam.com/gallery" target="_blank">Gallery</a>
          <span>|</span>
          <a href="/admission">Apply Now</a>
          <span>|</span>
          <a href="/pdfs/antiragging.pdf" target='_blank'>Anti Ragging Notification</a>
          <span>|</span>
          <a href="/pdfs/Minority-Letter.pdf" target='_blank'>Minority letter</a>
          <span>|</span>
          <a href="https://docs.google.com/forms/d/e/1FAIpQLSdlNkvPNWeijhmJeK11pUwTOnrJ4rYoHPLuxTOxwKRWBgdg4A/viewform" 
          target='_blank'>Alumni Registration</a>
          
        </div>
      </div>
      <hr className={styles.divider} />
      <div className={styles.bottomSection}>
        <p>©2025 TRANSLAM, ALL RIGHTS RESERVED</p>
      </div>
    </footer>
  
    </>
  )
}

export default Footer