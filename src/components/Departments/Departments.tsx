import React from 'react';
import CommonBanner from '../CommonSection/CommonBanner';
import styles from "./Departments.module.scss";

export default function EventsPage() {
  const departments = [
    {
      name: "Department of Pharmacognosy",
      description: `
       
        <p>
          A Department of Pharmacognosy is an academic department within a pharmacy school 
          that studies medicinal compounds from natural sources like plants, animals, 
          and microorganisms.
          </p>

          <h3>Scope of Pharmacognosy</h3>

          <p>
          It focuses on the extraction, isolation, characterization, and quality control 
          of these natural products to develop drugs, nutraceuticals, and cosmeceuticals. 
          The field integrates knowledge from botany, chemistry, pharmacology, and 
          microbiology to understand the physical, chemical, and biological properties 
          of crude drugs.
          </p>

          <h3>Key Activities and Areas of Study</h3>

          <ul>
            <li><strong>Natural product drug discovery:</strong> Research to find and develop new drugs from natural sources.</li>
            <li><strong>Phytochemistry:</strong> Study of chemical compounds derived from plants, including identifying new compounds.</li>
            <li><strong>Traditional medicine:</strong> Exploring the traditional uses of medicinal plants and natural substances.</li>
            <li><strong>Quality control:</strong> Using modern analytical techniques to ensure quality and standardization of natural drugs and herbal formulations.</li>
            <li><strong>Phytotherapy:</strong> Studying medicinal uses of plant extracts.</li>
            <li><strong>Marine pharmacognosy:</strong> Investigating medicinal chemicals derived from marine organisms.</li>
          </ul>

          <h3>Educational and Research Facilities</h3>

          <ul>
            <li><strong>Laboratories:</strong> Modern labs for undergraduate and postgraduate research, equipped for extraction and isolation work.</li>
            <li><strong>Herbal garden:</strong> A curated collection of living medicinal plants for identification and study.</li>
            <li><strong>Crude drug museum:</strong> A collection of raw medicinal materials for learning and research.</li>
          </ul>
          
          `,

      research: [

      ]
    },
    {
      name: "Department of Pharmaceutics",
      description: `
        The Department of Pharmaceutics is the discipline of pharmacy that deals with the process of
        turning a new chemical entity (NCE) or an existing drug into a medication.
        <br/>
        <h3>It Focus On:</h3>
        <ul>
          <li>How drugs work (Mechanism of action)</li>
          <li>How the body absorbs, distributes, metabolizes, and excretes (ADME) drugs</li>
          <li>Therapeutic uses of drugs</li>
          <li>Adverse effects, toxicity, and interactions</li>
          <li>Regulatory requirements, research, and discovery</li>
          <li>Drug development and clinical applications</li>
          <li>Drug-target interactions and side effects</li>
        </ul>
        <p>The lab is equipped with modern instruments and learning resources to support high quality
          teaching, resources and skill development.</p>
        <h3>Instrument Name List:</h3>
        <ul>
        <li>Tablet Hardness Tester</li>
        <li>Tablet Disintegration Tester</li>
        <li>Tablet Friability Tester</li>
        <li>Dissolution Test Apparatus</li>
        <li>Clarity Tester</li>
        <li>Viscometer (e.g., Brookfield)</li>
        <li>Autoclave</li>
        <li>Hot Air Oven</li>
        <li>Capsule Filling Machine</li>
        <li>Tablet Punching/Pressing Machine</li>
        <li>Tablet Coating Machine</li>
        <li>Mixers and Blenders</li>
        <li>Mills (e.g., Ball Mill, Multi-mill)</li>
      </ul>                 
        `,
      research: [

      ]
    },
    {
      name: "Department of Pharmacology",
      description: `
        <p>
        The Department of Pharmacology is a branch of medical and pharmacy education where 
        students learn about drugs and their actions on the body.
        </p>

        <h3>It Focuses On:</h3>

        <ul>
          <li>How drugs work (Mechanism of action)</li>
          <li>How the body absorbs, distributes, metabolizes, and excretes drugs</li>
          <li>Therapeutic uses of drugs</li>
          <li>Side effects, toxicity, and interactions</li>
          <li>Principles of rational drug therapy</li>
          <li>Experimental and clinical evaluation of drugs</li>
        </ul>

        <p>
        The lab is equipped with modern instruments and learning resources to support high-quality 
        teaching, research, and skill development.
        </p>

        <p>
        <strong>Computer-assisted simulation software</strong> is used for ethical, animal-free experiments.
        </p>

        <h3>Animal House</h3>

        <p>
        An Animal House is a facility where laboratory animals such as rats, mice, rabbits, and 
        guinea pigs are kept, fed, and maintained under controlled conditions for teaching and 
        research in pharmacology. It ensures proper care, hygiene, temperature control, and 
        ethical handling of animals as per CCSEA guidelines.
        </p>`,
      research: []
    },
    {
      name: "Department of Pharmaceutical Chemistry",
     description: `
     <p>Department of Pharmaceutical Chemistry is a core academic and research unit focusing on the design, synthesis, and analysis of drugs. It bridges chemistry and biology, covering areas like medicinal chemistry, molecular modeling, and quality control. Key research includes developing new molecules for treating diseases and utilizing instruments like HPLC and IR spectrometers. </p>
     <h3>Key Areas of Focus</h3>
     <p>
      <b>Drug Design and Discovery:</b> Using computational tools (computer-aided drug design - CADD) to design new molecules for conditions like cancer, antimicrobial resistance, and neurological disorders.
      </p>

      <p>
     <b>Synthetic Chemistry:</b> Synthesis of active pharmaceutical ingredients (APIs), including green chemistry techniques.Key Courses and Curriculum
      </p>

      <ul>
        <li>Pharmaceutical Organic & Inorganic Chemistry</li>
        <li>Medicinal Chemistry</li>
        <li>Biochemistry</li>
        <li>Instrumental Methods of Analysis</li>
        <li>Stereochemistry</li>
      </ul>
      <h3>Facilities and Research</h3>
      <p>Departments are typically equipped with advanced instrumentation for research, including: </p>
      <ul>
        <li>High-Performance Liquid Chromatography (HPLC)</li>
        <li>UV-Vis Spectrophotometers</li>
        <li>IR Spectrometers</li>
        <li>Computer-Aided Drug Design labs</li>
      </ul>
      <h3>Career Opportunities</h3>
      <p>Graduates from these departments are prepared for roles in: </p>
      <ul>
        <li>Pharmaceutical Industry (R&D, Quality Control, Regulatory Affairs)</li>
        <li>Academia</li>
        <li>Drug discovery research</li>
      </ul>

      `,
      research: []
    },
  ];

  return (
    <>
      <CommonBanner
        title="Departments" imgSrc="/images/pharma-department.jpg"
      />
      <div className='container'>
        <div className={styles.departments}>
          {departments.map((dept, i) => (
            <div key={i} className={styles.card}>
              <h2>{dept.name}</h2>
              <div dangerouslySetInnerHTML={{ __html: dept.description }} />

              {dept.research.length > 0 && (
                <>
                  <h3>Research Activities</h3>
                  <ul>
                    {dept.research.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
