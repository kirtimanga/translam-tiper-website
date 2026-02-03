import UgCourses from '@/components/Courses/UgCourses/UgCourses'
import Footer from '@/components/shared/Footer/Footer'
import Header from '@/components/shared/Header/Header'
import React from 'react'

function UgProgram() {
  return (
   <>
        <Header />
            <UgCourses />
        <Footer />
   </>
  )
}

export default UgProgram