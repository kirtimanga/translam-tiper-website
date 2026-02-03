import React from 'react';
import styles from './Courses.module.scss';
import CommonBanner from '../CommonSection/CommonBanner';
import { pgProgram } from '@/app/apiData/pgProgram';
import Link from 'next/link';

// const pgcourses = [
//     {
//         title: 'MBA',
//         duration: '12 Month',
//         description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
//         image: '/images/event1.png',
//     },
//     {
//         title: 'M. Pharm in Pharmaceutics',
//         duration: '12 Month',
//         description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
//         image: '/images/event1.png',
//     },
//     {
//         title: 'M.Pharm in Phamacognosy',
//         duration: '12 Month',
//         description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
//         image: '/images/event1.png',
//     },
//     {
//         title: 'M.Pharm in Pharmacology',
//         duration: '12 Month',
//         description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
//         image: '/images/event1.png',
//     },
// ];


// Graduate Courses

const graduatecourses = [
    {
        title: 'MBA',
        duration: '12 Month',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
        image: '/images/event1.png',
    },
    {
        title: 'M. Pharm in Pharmaceutics',
        duration: '12 Month',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
        image: '/images/event1.png',
    },
    {
        title: 'M.Pharm in Phamacognosy',
        duration: '12 Month',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
        image: '/images/event1.png',
    },
    {
        title: 'M.Pharm in Pharmacology',
        duration: '12 Month',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
        image: '/images/event1.png',
    },
];

// Diploma Courses

const diplomacourses = [
    {
        title: 'MBA',
        duration: '12 Month',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
        image: '/images/event1.png',
    },
    {
        title: 'M. Pharm in Pharmaceutics',
        duration: '12 Month',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
        image: '/images/event1.png',
    },
    {
        title: 'M.Pharm in Phamacognosy',
        duration: '12 Month',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
        image: '/images/event1.png',
    },
    {
        title: 'M.Pharm in Pharmacology',
        duration: '12 Month',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
        image: '/images/event1.png',
    },
];

// PG Diploma Courses

const pgdiplomacourses = [
    {
        title: 'MBA',
        duration: '12 Month',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
        image: '/images/event1.png',
    },
    {
        title: 'M. Pharm in Pharmaceutics',
        duration: '12 Month',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
        image: '/images/event1.png',
    },
    {
        title: 'M.Pharm in Phamacognosy',
        duration: '12 Month',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
        image: '/images/event1.png',
    },
    {
        title: 'M.Pharm in Pharmacology',
        duration: '12 Month',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor',
        image: '/images/event1.png',
    },
];


const Courses = () => (
    <>
        <CommonBanner title="COURSES" imgSrc="/images/commonBanner.png" />
    <div className={styles.coursesContainer}>
        <section className={styles.courses}>
            <div className='container'>
                <h2> PG Courses</h2>
                <div className={styles.cardGrid}>
                    {/* {pgcourses.map((pgcourses, idx) => (
                        <div className={styles.card} key={idx}>
                            <img src={pgcourses.image} alt={pgcourses.title} />
                            <div className={styles.info}>
                                <p className={styles.duration}>
                                    <i className="fa-regular fa-clock" /> Duration: {pgcourses.duration}
                                </p>
                                <h3>{pgcourses.title}</h3>
                                <p className={styles.desc}>{pgcourses.description}</p>
                                <button className={styles.readMore}>Read more</button>
                            </div>
                        </div>
                    ))} */}

                     {pgProgram.map((course) => (
                         <div className={styles.card} key={course.pgSlug}>
                             <img src={course.image} alt={course.title} />
                             <div className={styles.info}>
                                 <p className={styles.duration}>
                                     <i className="fa-regular fa-clock" /> Duration: {course.duration}
                                 </p>
                                    <h3>{course.title}</h3>
                                    <p className={styles.desc}>{course.overview}</p>
                                    <button className={styles.readMore}>
                                        <Link href={`/courses/pg-programs/${course.pgSlug}`}>Read more</Link>
                                    </button>
                                </div>

                            </div>
                         ))}
                </div>
            </div>
        </section>

        {/* Graduate Course */}
        <section className={styles.courses}>
            <div className='container'>
                <h2> PG Courses</h2>
                <div className={styles.cardGrid}>
                    {graduatecourses.map((graduatecourses, idx) => (
                        <div className={styles.card} key={idx}>
                            <img src={graduatecourses.image} alt={graduatecourses.title} />
                            <div className={styles.info}>
                                <p className={styles.duration}>
                                    <i className="fa-regular fa-clock" /> Duration: {graduatecourses.duration}
                                </p>
                                <h3>{graduatecourses.title}</h3>
                                <p className={styles.desc}>{graduatecourses.description}</p>
                                <button className={styles.readMore}>Read more</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

         {/* Diplmoa Course */}
        <section className={styles.courses}>
            <div className='container'>
                <h2> PG Courses</h2>
                <div className={styles.cardGrid}>
                    {diplomacourses.map((diplomacourses, idx) => (
                        <div className={styles.card} key={idx}>
                            <img src={diplomacourses.image} alt={diplomacourses.title} />
                            <div className={styles.info}>
                                <p className={styles.duration}>
                                    <i className="fa-regular fa-clock" /> Duration: {diplomacourses.duration}
                                </p>
                                <h3>{diplomacourses.title}</h3>
                                <p className={styles.desc}>{diplomacourses.description}</p>
                                <button className={styles.readMore}>Read more</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>

          {/* PG Diplmoa Course */}
        <section className={styles.courses}>
            <div className='container'>
                <h2> PG Courses</h2>
                <div className={styles.cardGrid}>
                    {pgdiplomacourses.map((pgdiplomacourses, idx) => (
                        <div className={styles.card} key={idx}>
                            <img src={pgdiplomacourses.image} alt={pgdiplomacourses.title} />
                            <div className={styles.info}>
                                <p className={styles.duration}>
                                    <i className="fa-regular fa-clock" /> Duration: {pgdiplomacourses.duration}
                                </p>
                                <h3>{pgdiplomacourses.title}</h3>
                                <p className={styles.desc}>{pgdiplomacourses.description}</p>
                                <button className={styles.readMore}>Read more</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    </div>
    </>
);

export default Courses;
