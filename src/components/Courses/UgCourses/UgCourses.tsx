import React from 'react'
import styles from '../Courses.module.scss';
import CommonBanner from '@/components/CommonSection/CommonBanner';
import Link from 'next/link';
import { ugProgram } from '@/app/apiData/ugProgram';

function UgCourses() {
    return (

        <>
            <CommonBanner title="Graduates Programs" imgSrc="/images/commonBanner.png" />
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

                            {ugProgram.map((course) => (
                                <div className={styles.card} key={course.ugSlug}>
                                    <img src={course.image} alt={course.title} />
                                    <div className={styles.info}>
                                        <p className={styles.duration}>
                                            <i className="fa-regular fa-clock" /> Duration: {course.duration}
                                        </p>
                                        <h3>{course.title}</h3>
                                        <p className={styles.desc}>{course.overview}</p>
                                        <button className={styles.readMore}>
                                            <Link href={`/courses/pg-programs/${course.ugSlug}`}>Read more</Link>
                                        </button>
                                    </div>

                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    )
}

export default UgCourses