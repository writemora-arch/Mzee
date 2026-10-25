module.exports = () => {
  const P = (id, type, title, cls, price, mrp, short, o = {}) => ({ id, type, title, classes: cls, price, mrp, short, desc: short + ' Edit this description from Admin → Products.', highlights: o.h || [], badge: o.badge || '', featured: !!o.f, status: 'published', stock: o.stock || '', duration: o.duration || '', pages: o.pages || '', lang: o.lang || 'English + Hindi', images: [], lectures: o.lec || [], fileName: '', fileLink: '', tag: o.tag || '', demo: true, at: new Date().toISOString() });
  const L = n => Array.from({ length: n }, (_, i) => ({ title: 'Lesson ' + (i + 1), url: '', free: i === 0 }));
  return {
    settings: {
      name: 'M-zee', tagline: 'Chemistry, made clear.', announcement: '🎉 New batch for Class 8–12 starts soon — book a free demo class!',
      contact: { phone: '', whatsapp: '', email: '', address: '', hours: '' },
      waTemplate: 'Hi M-zee! I am {name} (Class {cls}). I am interested in: {items}. Please share details.',
      hero: { overline: 'CHEMISTRY FOR CLASS 8 – 12', title: 'Learn chemistry the way it was meant to be understood.', sub: 'Concept-first video courses, crisp handwritten notes, practice tests and lab-ready stationery — all in one place.' },
      colors: { ink: '#0F2A3D', accent: '#0FB5A0', warm: '#F5B83D' },
      stats: [{ n: 5000, l: 'Happy students', s: '+' }, { n: 300, l: 'Video lessons', s: '+' }, { n: 1200, l: 'Notes pages', s: '+' }, { n: 95, l: 'Avg. score boost', s: '%' }],
      steps: [{ t: 'Choose', d: 'Pick your class and what you need — course, notes or stationery.' }, { t: 'Enquire on WhatsApp', d: 'One tap sends your list to us. We confirm price and payment.' }, { t: 'Start learning', d: 'Log in to My Library and your lectures and notes unlock.' }],
      about: 'M-zee was started with one idea: chemistry becomes easy when you see why a reaction happens, not just what happens. Edit this story in Admin → Website Content.',
      testimonials: [{ n: 'Aarav S.', c: 'Class 10', t: 'Organic chemistry finally makes sense. The notes are so neat I revise from them every night!' }, { n: 'Meher K.', c: 'Class 12', t: 'Recorded lectures let me pause and replay tough numericals. My board marks jumped.' }, { n: 'Rohan P.', c: 'Class 9', t: 'Fun experiments and short lessons. I now actually look forward to chemistry.' }],
      faqs: [{ q: 'How do I buy a course?', a: 'Tap “Enquire on WhatsApp”. We confirm the price and payment details, then unlock the item in your My Library.' }, { q: 'Can I watch lectures on my phone?', a: 'Yes. Log in to My Library from any phone, tablet or laptop.' }, { q: 'Do I get a demo?', a: 'Every course has free preview lessons. You can also book a free demo class.' }, { q: 'Are stationery items delivered?', a: 'Yes. Share your address on WhatsApp and we will confirm delivery time and charges.' }]
    },
    products: [
      P('c101', 'course', 'Class 10 Complete Chemistry Course', ['10'], 2499, 3999, 'Full board syllabus with concept videos, numericals and revision tests.', { f: 1, badge: 'Best Seller', duration: '60 hrs', lec: L(6), h: ['120+ video lessons', 'Chapter-wise tests', 'Doubt support on WhatsApp', 'Lifetime access'] }),
      P('c102', 'course', 'Class 12 Organic Chemistry Masterclass', ['12'], 2999, 4499, 'Reaction mechanisms made visual — from named reactions to conversions.', { f: 1, badge: 'New', duration: '45 hrs', lec: L(5), h: ['All named reactions', 'Mechanism animations', 'Conversion practice', 'PYQ discussion'] }),
      P('c103', 'course', 'Class 8–9 Foundation: Matter & Atoms', ['8', '9'], 1299, 1999, 'Build a rock-solid base: matter, atoms, mixtures and everyday chemistry.', { duration: '25 hrs', lec: L(4), h: ['Activity-based learning', 'Easy language', 'Quiz after each lesson'] }),
      P('l201', 'lecture', 'Chemical Bonding — Recorded Lecture Series', ['11', '12'], 699, 999, 'Ionic, covalent, VSEPR and hybridisation in one binge-worthy series.', { f: 1, duration: '9 hrs', lec: L(8), h: ['8 recorded lectures', 'Watch anytime', 'Slides included'] }),
      P('l202', 'lecture', 'Class 11 Mole Concept & Stoichiometry', ['11'], 599, 899, 'Never fear numericals again with step-by-step recorded lectures.', { duration: '7 hrs', lec: L(6), h: ['Solved numericals', 'Shortcuts & tricks'] }),
      P('n301', 'notes', 'Class 10 Handwritten Chemistry Notes (PDF)', ['10'], 249, 449, 'Neat, colour-coded notes for every chapter, ready to print or revise on screen.', { f: 1, badge: 'Popular', pages: '140 pages', h: ['Chapter summaries', 'Important reactions', 'Exam-focused tips'] }),
      P('n302', 'notes', 'Class 12 Organic Reaction Map & Formula Sheet', ['12'], 199, 349, 'A one-glance map of every named reaction, reagent and conversion.', { pages: '32 pages', h: ['Poster-style map', 'Printable A3'] }),
      P('t401', 'test', 'Class 9 & 10 Chemistry Mock Test Series', ['9', '10'], 399, 699, '20 full-length papers with solutions modelled on the latest pattern.', { badge: 'Hot', pages: '20 papers', h: ['Detailed solutions', 'Score tracker sheet'] }),
      P('s501', 'stationery', 'M-zee Chemistry Lab Notebook (Pack of 2)', ['8', '9', '10', '11', '12'], 199, 299, 'Ruled + practical pages, durable cover, periodic table on the back.', { stock: 'In stock', h: ['100 GSM paper', 'Periodic table on cover'] }),
      P('s502', 'stationery', 'Periodic Table Wall Poster (A2)', ['8', '9', '10', '11', '12'], 149, 249, 'Colour-coded, laminated poster for your study wall.', { f: 1, stock: 'In stock', h: ['A2 size, glossy laminated', 'Electronic configuration included'] }),
      P('k601', 'kit', 'Molecular Model Kit (Organic & Inorganic)', ['10', '11', '12'], 899, 1299, 'Build methane to benzene — visualise 3D structures with 200+ pieces.', { badge: 'Gift idea', stock: 'Limited stock', h: ['200+ atoms & bonds', 'Instruction booklet'] })
    ],
    students: [], enquiries: [], sessions: {}
  };
};
