import React from 'react'
import styles from '../Courses.module.scss';
import CommonBanner from '@/components/CommonSection/CommonBanner';
import Link from 'next/link';
import { pgProgram } from '@/app/apiData/pgProgram';

function PgCourses() {
    return (

        <>
            <CommonBanner title="Pg Programs" imgSrc="/images/commonBanner.png" />
            <div className={styles.coursesContainer}>
                <section className={styles.courses}>
                    <div className='container'>
                        <h2> PG Courses</h2>
                        <div className={styles.cardGrid}>
                        

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
            </div>
        </>
    )
}

export default PgCourses