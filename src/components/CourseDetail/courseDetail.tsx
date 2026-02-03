import React from 'react'
import styles from './courseDetail.module.scss';
import CommonBanner from '../CommonSection/CommonBanner';

function CourseDetail() {
    return (
        <>
            <CommonBanner title="Course Detail" />
          
            <section className={styles.articleContainer}>
                  <div className='container'>
                <div className={styles.content}>
                    <h1 className={styles.title}>
                        Why Swift UI Should Be on the Radar of Every Mobile Developer
                    </h1>

                    <div className={styles.paragraphs}>
                        {[...Array(4)].map((_, index) => (
                            <p key={index}>
                                TOTC is a platform that allows educators to create online classes whereby they can store the
                                course materials online; manage assignments, quizzes and exams; monitor due dates; grade results
                                and provide students with feedback all in one place.
                            </p>
                        ))}

                        <p>
                            TOTC is a platform that allows educators to create online classes whereby they can store the course
                            materials online; manage assignments, quizzes and exams; monitor due dates; grade results and provide
                            students with feedback all in one place.
                        </p>
                    </div>

                    <div className={styles.tags}>
                        <span>affordable</span>
                        <span>stunning</span>
                        <span>making</span>
                    </div>

                    <div className={styles.image}>
                        <img
                            src="/images/student-group.jpg"
                            alt="Girl learning with tablet"
                        />
                    </div>
                </div>
                 </div>
            </section>
           
        </>
    )
}

export default CourseDetail