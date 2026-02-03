import React from 'react';
import Header from '../../components/shared/Header/Header';
import Footer from '../../components/shared/Footer/Footer';
import DirectorDesk from '@/components/DirectorDesk/DirectorDesk';

export default function PrincipleMessage() {
  return (
    <>
      <Header />
        <DirectorDesk />
      <Footer />
    </>
  );
}
