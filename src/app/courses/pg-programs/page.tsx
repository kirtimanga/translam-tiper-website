import PgCourses from '@/components/Courses/PgCourses/PgCourses'
import Footer from '@/components/shared/Footer/Footer'
import Header from '@/components/shared/Header/Header'
import React from 'react'

function PgProgram() {
  return (
   <>
        <Header />
            <PgCourses />
        <Footer />
   </>
  )
}

export default PgProgram