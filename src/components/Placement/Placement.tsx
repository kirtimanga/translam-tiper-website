'use client'; 
import React from 'react'
import CommonBanner from '../CommonSection/CommonBanner'
import styles from './Placement.module.scss'
import Image from "next/image";
import { motion } from 'framer-motion';
import { usePlacement } from '@/contexts/PlacementContext';


function fadeIn(delay = 0) {
    return {
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true },
        transition: { duration: 0.7, delay }
    };
}

function Placement() {
    const { data, getActiveStudents } = usePlacement();
    return (
        <>
            <CommonBanner title={data.heroTitle} imgSrc={data.heroImage} />
            <section className={styles.crcSection}>
                <div className="container">
                    <h2>{data.crcTitle.replace('(CRC)', '')} <span>(CRC)</span></h2>
                    <div dangerouslySetInnerHTML={{ __html: data.crcDescription }} />
                    <div dangerouslySetInnerHTML={{ __html: data.crcContent }} />
                </div>
            </section>

            <section className={styles.crcSection}>
                <div className="container">
                    <h2>{data.trainingTitle}</h2>
                    <div dangerouslySetInnerHTML={{ __html: data.trainingDescription }} />
                    
                    {data.trainingDescription.includes('customized training programs') && (
                        <p>
                            We offer a wide range of <strong>customized training programs</strong>, workshops, and industrial exposure
                            sessions designed to enhance technical, interpersonal, and leadership skills. These initiatives are aligned
                            with current industry demands and future trends, ensuring our students remain competitive in the dynamic
                            professional landscape.
                        </p>
                    )}

                    <h3>Key Features:</h3>
                    <ul>
                        {data.trainingFeatures
                            .sort((a, b) => a.order - b.order)
                            .map((feature) => (
                                <li key={feature.id}>
                                    <strong>{feature.title}:</strong> {feature.description}
                                </li>
                            ))
                        }
                    </ul>

                    <p>
                        Our holistic approach ensures that every student at Translam is not just academically proficient but
                        also equipped with the confidence, knowledge, and skills to thrive in their chosen career paths.
                    </p>
                </div>
            </section>

            <section>
                {/* Placements Section */}
                <motion.section className={styles.placementsSection} {...fadeIn(0.5)}>
                    <div className='container'>
                        <h2 className={styles.placementsTitle}>Student <span>Placements</span></h2>
                        <p className={styles.placementsDesc}></p>
                        <div className={styles.placementsGrid}>
                            {getActiveStudents().map((student) => (
                                <div className={styles.placementCard} key={student.id}>
                                    <Image 
                                        src={student.image} 
                                        alt={student.name} 
                                        width={300}
                                        height={300}
                                        priority
                                        className={styles.placementImg} 
                                    />
                                    <div className={styles.placementName}><h4>{student.name}</h4></div>
                                    <div className={styles.placementCompany}><p>{student.company}</p></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>
            </section>

        </>
    )
}

export default Placement