import React from 'react';
import Header from '../../components/shared/Header/Header';
import Footer from '../../components/shared/Footer/Footer';
import Courses from '../../components/Courses/Courses';

export default function CoursesPage() {
  return (
    <>
      <Header />
        <Courses />
      <Footer />
    </>
  );
}
