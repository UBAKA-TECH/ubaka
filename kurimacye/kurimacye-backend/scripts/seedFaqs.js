import prisma from "../prisma.js";

const faqs = [
  {
    question: "How long does delivery take?",
    questionRw: "Itangwa ry'ibicuruzwa rigenda ringana gute?",
    answer: "Standard delivery typically takes 3-5 business days within Rwanda. Please contact us for delivery to other locations.",
    answerRw: "Itangwa risanzwe rifata iminsi 3-5 y'akazi mu Rwanda. Watwandikira kugira ngo tubone hamwe ibirebana n'aho uri.",
    order: 1
  },
  {
    question: "What is your return policy?",
    questionRw: "Politiki yanyu yo gusubiza ibicuruzwa ni iyihe?",
    answer: "We accept returns within 30 days of purchase. The item must be unused and in its original packaging. Please contact our support team to initiate a return.",
    answerRw: "Twakira gusubiza ibicuruzwa mu minsi 30 nyuma yo kugura. Igicuruzwa ntikigomba gukoreshwa kandi gihuze n'agashya. Twandikire itsinda ryacu kugira ngo utangire gusubiza.",
    order: 2
  },
  {
    question: "How can I track my order?",
    questionRw: "Nakurikirana nte ikomande yanjye?",
    answer: "Once your order is shipped, you will receive a tracking number via email. You can also use the 'Track Order' link in the footer to check your status.",
    answerRw: "Nyuma yo kohereza ikomande yawe, uzahabwa numero yo gukurikirana kuri imeli. Ukoreshe kandi urunigi 'Kurikirana Ikomande' uri munsi w'urupapuro.",
    order: 3
  },
  {
    question: "Do you offer international delivery?",
    questionRw: "Mugeza ibicuruzwa mu mahanga?",
    answer: "Yes, we deliver to most countries worldwide. Delivery costs and times vary based on location.",
    answerRw: "Yego, tugeza ibicuruzwa mu bihugu byinshi ku isi. Igiciro n'igihe bigenda binyuranye ukurikije aho uri.",
    order: 4
  },
  {
    question: "How can I contact customer support?",
    questionRw: "Nakumana na serivisi y'inkunga ite?",
    answer: "You can reach our support team via email at ishfabzele2@gmail.com or by calling +250 789 079 978 during business hours.",
    answerRw: "Ushobora kugera ku tsinda ryacu kuri imeli: ishfabzele2@gmail.com cyangwa uhamagare +250 789 079 978 mu masaha y'akazi.",
    order: 5
  },
  {
    question: "How do I become a seller on Kuri Macye?",
    questionRw: "Nabyaza ute umuguzi kuri Kuri Macye?",
    answer: "You can register as a seller by clicking 'Become a Seller' in the navigation menu. Our team will review your application and get back to you within 48 hours.",
    answerRw: "Ushobora kwiyandikisha nk'umugurisha binyuze ku rugero 'Bwera Umugurisha' mu gikubitiro. Itsinda ryacu rizasuzuma inyandiko yawe rikasubize mu masaha 48.",
    order: 6
  }
];

async function seed() {
  console.log("Starting FAQ seeding...");
  
  // Clear existing FAQs first to avoid duplicates
  await prisma.faq.deleteMany({});
  console.log("Cleared existing FAQs.");

  for (const faq of faqs) {
    const created = await prisma.faq.create({
      data: faq
    });
    console.log(`Seeded FAQ: "${created.question}"`);
  }

  console.log("FAQ seeding completed successfully!");
}

seed()
  .catch((e) => {
    console.error("Error seeding FAQs:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
