// app/courses/pg-programs/[pgSlug]/page.tsx

import { pgProgram } from '@/app/apiData/pgProgram';
import CommonBanner from '@/components/CommonSection/CommonBanner';
import Footer from '@/components/shared/Footer/Footer';
import Header from '@/components/shared/Header/Header';
import { notFound } from 'next/navigation';
import styles from '../../courseDetail.module.scss';
import Image from 'next/image';

// Use inline typing for Next page params to avoid type collisions with generated types

// Pre-render all PG course paths
export async function generateStaticParams() {
  return pgProgram.map((course) => ({
    pgSlug: course.pgSlug,
  }));
}

// Page component
export default function PgProgramDetail(props: unknown) {
  const { params } = props as { params: { pgSlug: string } };
  const course = pgProgram.find((item: { pgSlug: string; }) => item.pgSlug === params.pgSlug);

  if (!course) return notFound();

  const bannerMap: Record<string, string> = {
    'm-pharmacy': '/images/m_pharm_banner.png',
  };

  return (
    <>
      <Header />
      <CommonBanner title={course.title} imgSrc={bannerMap[params.pgSlug] || '/images/commonBanner.png'} />

      <section className={styles.articleContainer}>
        <div className='container'>
          <div className={styles.content}>
            <Image
              src={course.image}
              alt={course.title}
              width={300}
              height={200}
              className="rounded-xl object-cover"
            />
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
              <p className="text-gray-700 font-medium mb-2">Duration: {course.duration}</p>
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
