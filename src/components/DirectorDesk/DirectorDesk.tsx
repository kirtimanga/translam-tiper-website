"use client";
import React from 'react'
import CommonBanner from '../CommonSection/CommonBanner'
import styles from './DirectorDesk.module.scss'
import { useDirectorDesk } from '@/contexts/DirectorDeskContext'

function DirectorDesk() {
    const { directorDeskData } = useDirectorDesk();

    return (
        <>
            <CommonBanner 
                title={directorDeskData.heroTitle} 
                imgSrc={directorDeskData.heroBannerImage || "/images/commonBanner.png"} 
            />
            <section className={styles.directorSection}>
                <div className="container">
                    <blockquote className={styles.quote}>
                        <strong>{directorDeskData.mainHeading}</strong>
                    </blockquote>

                    <div 
                        className={styles.content}
                        dangerouslySetInnerHTML={{ __html: directorDeskData.content }}
                    />


                    <div className={styles.principalsGrid}>
                        {[
                            { name: 'Dr. Shamim Ahmed', designation: 'Director', image: '/images/dr-shamim-ahmed.jpg' },
                            { name: 'Dr. Kamini Rajput', designation: 'Principal', image: '/images/dr-kamini-rajput.jpg' },
                            { name: 'Dr. Krishan Pal Singh', designation: 'Principal', image: '/images/dr-krishan-pal-singh.jpg' },
                        ].map((person, idx) => (
                            <div className={styles.principalCard} key={idx}>
                                <img src={person.image} alt={person.name} />
                                <strong>{person.name}</strong>
                                <span>{person.designation}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}

export default DirectorDesk