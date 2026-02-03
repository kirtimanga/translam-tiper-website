import React from 'react';
import Header from '../../components/shared/Header/Header';
import Footer from '../../components/shared/Footer/Footer';
import Documents from '@/components/Document/Document'; 

export default function DocumentPage() {
  return (
    <>
      <Header />
        <Documents />
      <Footer />
    </>
  );
}
