"use client";
import React from 'react';
import styles from './About.module.scss';
import CommonBanner from '../CommonSection/CommonBanner';
import { useAboutGroup } from '@/contexts/AboutGroupContext';

function About() {
  const { aboutGroupData, isLoading } = useAboutGroup();

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        Loading...
      </div>
    );
  }

  const aboutContent = [
    {
      title: aboutGroupData.aboutUsTitle,
      content1: aboutGroupData.aboutUsContent.split('\n\n')[0] || '',
      content2: aboutGroupData.aboutUsContent.split('\n\n')[1] || '',
      image: aboutGroupData.buildingImage || '/images/college-img.png',
      reverse: false,
    },
    {
      title: aboutGroupData.visionTitle,
      content1: aboutGroupData.visionContent,
      content2: aboutGroupData.missionContent,
      image: aboutGroupData.visionImage || '/images/event1.png',
      reverse: false,
    },
    {
      title: aboutGroupData.aimsTitle,
      content1: aboutGroupData.aimsObjectives[0] || '',
      content2: aboutGroupData.aimsObjectives[1] || '',
      content3: aboutGroupData.aimsObjectives[2] || '',
      image: aboutGroupData.aimsImage || '/images/event1.png',
      reverse: true,
    },
  ];

  return (
    <>
      <CommonBanner 
        title={aboutGroupData.heroTitle} 
        imgSrc={aboutGroupData.heroBannerImage || "/images/commonBanner.png"} 
      />
      <div className={styles.aboutSection}>
        {aboutContent.map((item, idx) => (
          <div
            className={`${styles.aboutBlock} ${item.reverse ? styles.reverse : ''}`}
            key={idx}
          >
            <div className={styles.image}>
              <img src={item.image} alt={item.title} />
            </div>
            <div className={styles.content}>
              <h3>{item.title}</h3>
              
              <div dangerouslySetInnerHTML={{ __html: item.content1 }} />
              {item.content2 && <div dangerouslySetInnerHTML={{ __html: item.content2 }} />}
              {item.content3 && <div dangerouslySetInnerHTML={{ __html: item.content3 }} />}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default About;