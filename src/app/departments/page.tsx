import Image from "next/image";
import Header from '../../components/shared/Header/Header';
import Footer from '../../components/shared/Footer/Footer';
import Departments from '@/components/Departments/Departments';

export default function DepartmentPage() {
  return (
    <>
      <Header />
        <Departments />
      <Footer />
    </>
  );
}
