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
     <h3>U.V. Spectrophotometer</h3>
     <p>
      Ability to perform quantitative and qualitative analysis with high accuracy and sensitivity. 
      It offers versatile measurement modes such as spectrum, quantitation, and time-course 
      analysis.
      </p>

      <h3>Fluorimetry</h3>

      <p>
      Fluorimetry is an analytical technique used to measure the intensity of fluorescence emitted 
      by molecules after they absorb light. Key features include high sensitivity, high selectivity, 
      specific analytical principles, and specialized instrumentation.
      </p>

      <h3>High-Performance Liquid Chromatography (HPLC)</h3>

      <p>
      High-Performance Liquid Chromatography (HPLC) offers high resolution, accuracy, and 
      sensitivity, enabling the separation and detection of a wide variety of compounds, including 
      thermally unstable or non-volatile substances. Additional features include fast analysis 
      speed, high separation efficiency, reproducibility, and the ability to automate processes for 
      high-throughput analysis.
      </p>

      <h3>Calorimeter</h3>

      <p>
      A calorimeter includes an insulated container to prevent heat exchange, a reaction vessel to 
      hold the sample or water, a thermometer to measure temperature changes, and a stirrer to 
      ensure uniform temperature distribution.
      </p>

      <h3>Digital pH Meter</h3>

      <p>Used extensively in:</p>

      <ul>
        <li>Pharmaceuticals</li>
        <li>Cosmetics</li>
        <li>Manufacturing</li>
        <li>Product formulation</li>
      </ul>

      <h3>F.T.I.R. Spectrometer</h3>

      <p>
      FTIR spectrometers use a <strong>Michelson interferometer</strong> to collect all infrared frequencies 
      simultaneously, enabling fast and non-destructive analysis. These instruments offer high 
      sensitivity, speed, and resolution, and are suitable for a wide range of sample types (solid, 
      liquid, gas). They produce a unique fingerprint spectrum for accurate identification.
      </p>`,
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
