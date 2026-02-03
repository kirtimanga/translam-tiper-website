// app/courses/pg-programs/[pgSlug]/page.tsx

import CommonBanner from '@/components/CommonSection/CommonBanner';
import Footer from '@/components/shared/Footer/Footer';
import Header from '@/components/shared/Header/Header';
import { notFound } from 'next/navigation';
import styles from '../../courseDetail.module.scss';
import { diplomaProgram } from '@/app/apiData/diplomaProgram';

// Use inline typing for Next page params to avoid type collisions with generated types

// Pre-render all PG course paths
export async function generateStaticParams() {
  return diplomaProgram.map((course) => ({
    diplomaSlug: course.diplomaSlug,
  }));
}

// Page component
export default function DiplomaProgramDetail(props: unknown) {
  const { params } = props as { params: { diplomaSlug: string } };
  const course = diplomaProgram.find((item: { diplomaSlug: string; }) => item.diplomaSlug === params.diplomaSlug);

  if (!course) return notFound();

  return (
    <>
     <Header />
        <CommonBanner title={course.title} />
          
            <section className={styles.articleContainer}>
                  <div className='container'>
                <div className={styles.content}>
                    <h1 className={styles.title}>
                      {course.title}
                    </h1>

                    <div className={styles.paragraphs}>
                       <p><strong>Duration:</strong> {course.duration}</p> 
                        <p>
                            {course.description}
                        </p>
                    </div>

                    {/* <div className={styles.tags}>
                        <span>affordable</span>
                        <span>stunning</span>
                        <span>making</span>
                    </div> */}

                    {/* <div className={styles.image}>
                        <img
                            src="/images/student-group.jpg"
                            alt="Girl learning with tablet"
                        />
                    </div> */}
                </div>
                 </div>
            </section>
           
       
    
      <Footer />
    </>
  );
}
