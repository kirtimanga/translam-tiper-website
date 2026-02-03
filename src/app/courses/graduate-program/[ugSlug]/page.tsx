// app/courses/pg-programs/[pgSlug]/page.tsx

import CommonBanner from '@/components/CommonSection/CommonBanner';
import Footer from '@/components/shared/Footer/Footer';
import Header from '@/components/shared/Header/Header';
import { notFound } from 'next/navigation';
import styles from '../../courseDetail.module.scss';
import { ugProgram } from '@/app/apiData/ugProgram';

// Use inline typing for Next page params to avoid type collisions with generated types

// Pre-render all PG course paths
export async function generateStaticParams() {
  return ugProgram.map((course) => ({
    ugSlug: course.ugSlug,
  }));
}

// Page component
export default function UgProgramDetail(props: unknown) {
  const { params } = props as { params: { ugSlug: string } };
  const course = ugProgram.find((item: { ugSlug: string; }) => item.ugSlug === params.ugSlug);

  if (!course) return notFound();

  return (
    <>
     <Header />
        <CommonBanner title={course.title} />
          
            <section className={styles.articleContainer}>
                  <div className='container'>
                <div className={styles.content}>
                    {/* <h1 className={styles.title}>
                      {course.title}
                    </h1>

                    <div className={styles.paragraphs}>
                       <p><strong>Duration:</strong> {course.duration}</p> 
                        <p>
                            {course.description}
                        </p>
                    </div> */}

                   <div className="w-full md:w-1/2">
              <h2 className="">{course.titleFull}</h2>
              <p className=""><strong>Duration:</strong> {course.duration}</p>
              {/* <p className=""><strong>Fees:</strong> {course.fees}</p> */}
              <p className="text-gray-600 mb-4">{course.overview}</p>

              <h3 className="text-xl font-semibold text-blue-800 mt-4 mb-2">Program Highlights:</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                {course.highlights.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-blue-800 mt-4 mb-2">Key Features:</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4">
                {course.features.map((point, i) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>

              <h3 className="text-xl font-semibold text-blue-800 mt-4 mb-2">Program Outcome:</h3>
              <p className="text-gray-600">{course.outcome}</p>
            </div>
          </div>
                </div>
            </section>
           
       
    
      <Footer />
    </>
  );
}
