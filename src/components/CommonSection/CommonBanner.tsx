import React from 'react';
import styles from './CommonBanner.module.scss';

function CommonBanner({ title = "OUR COURSES", imgSrc = "/images/commonBanner.png" }) {
  return (
    <div className={styles.bannerWrapper}>
      <img src={imgSrc} alt={title} className={styles.bannerImg} />
      <div className={styles.bannerText}>{title}</div>
    </div>
  );
}

export default CommonBanner;