"use client";
import React from 'react'
import CommonBanner from '../CommonSection/CommonBanner'
import styles from './Philosophy.module.scss'
import { usePhilosophy } from '@/contexts/PhilosophyContext'

function Philosophy() {
  const { philosophyData } = usePhilosophy();

  return (
    <>
      <CommonBanner 
        title={philosophyData.heroTitle} 
        imgSrc={philosophyData.heroBannerImage || "/images/commonBanner.png"} 
      />
      <section className={styles.visionSection}>
        <div className="container">
          <blockquote className={styles.quote}>
            <strong>{philosophyData.mainQuote}</strong>
          </blockquote>

          {/* ✅ Dynamic Main Image */}
          {/* {philosophyData.mainImage ? (
            <div className="imageContainer">
              <img 
                src={philosophyData.mainImage} 
                alt="Philosophy Main" 
                className={styles.mainImage} 
              />
            </div>
          ) : (
            <div className="imageContainer">
              <img 
                src="/images/tce-principle.jpeg" 
                alt="Default Philosophy Main" 
                className={styles.mainImage} 
              />
            </div>
          )} */}

          {/* ✅ Render HTML Content */}
          <div 
            className={styles.content}
            dangerouslySetInnerHTML={{ __html: philosophyData.content }}
          />
           <div className={styles.signatureBlock}>
                        
                                    <img
                                        src="/images/chairman.jpg"
                                        alt="chairman"
                                        style={{
                                            width: '200px',
                                            height: '200px',
                                            borderRadius: '10px',
                                            objectFit: 'cover',
                                            marginBottom: '8px'
                                        }}
                                    /><br/>
                           <strong>Mr.Prashant jain</strong>
                            <br />
                            <span>(Chairman)</span>
                    </div>
        </div>
      </section>
    </>
  )
}

export default Philosophy
