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

                    <div className={styles.signatureBlock}>
                        {directorDeskData.staffMembers.map((member, index) => (
                            <div key={index}>
                                {member.image && (
                                    <img 
                                        src={member.image} 
                                        alt={member.name}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '50%',
                                            objectFit: 'cover',
                                            marginBottom: '8px'
                                        }}
                                    />
                                )}
                                <strong>{member.name}</strong>
                                <br />
                                <span>{member.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}

export default DirectorDesk