import prisma from "../prisma.js";

const jobsUpdate = [
  {
    id: "role-1",
    titleRw: "Umuhanga mu bwubatsi bwa Porogaramu (Fullstack React/Node)",
    departmentRw: "Ubuhanga mu bya Tekinoroji",
    locationRw: "Kigali, u Rwanda (Gukorera mu rugo no ku biro)",
    descriptionRw: "Turashaka Umushakashatsi Mukuru w'Ikoranabuhanga (Senior Fullstack Developer) wo kuyobora iterambere rya MIS Admin Dashboard yacu no kwagura ama-API y'ibanze y'iduka. Uzakorera kuri sisitemu z'ibarura ry'ibicuruzwa mu gihe nyacyo, POS, n'ibikoresho byikora by'abagurisha.",
    requirementsRw: [
      "Uburambe bw'imyaka 3+ muri React.js, Node.js, na PostgreSQL/Prisma.",
      "Uburambe bwagaragaye mu kubaka SaaS control planes cyangwa imbuga z'ubuyobozi bw'ubucuruzi bwa elegitoroniki.",
      "Kumenyera ububiko bw'ibicuruzwa bwa Cloudinary no guhuza WebSockets.",
      "Umutima ukunda guhanga ibyiza byoroshye gukoresha kandi bifite ireme ryiza."
    ],
    benefitsRw: [
      "Mushahara mwiza n'ubwishingizi bw'ubuzima.",
      "Gukora mu buryo bworoshye (iminsi 2 ukorera mu rugo).",
      "Ikibanza kigezweho cy'abashakashatsi rwagati muri Kigali.",
      "Imfashanyo ya buri mwaka yo kwiga no kwiteza imbere."
    ]
  },
  {
    id: "role-2",
    titleRw: "Inzobere mu Gushushanya no Gucapa",
    departmentRw: "Umusaruro",
    locationRw: "Kigali HQ (Icyicaro Gikuru)",
    descriptionRw: "Fasha abakoresha bacu guhindura ibitekerezo byabo ibicuruzwa bifatika. Uzasuzuma ibibazo byihariye byo gucapa, kugenzura ireme ry'inyandikorugero zoherejwe (amakarita y'irangamuntu, ibyapa, amakadiri), no guhuza n'itsinda ryo gucapa ryo mu gace.",
    requirementsRw: [
      "Ubumenyi buhanitse bwa Adobe Illustrator, Photoshop, n'uburyo bw'amadosiye ya vector.",
      "Uburambe mu gukoresha imashini zicapa z'inganda no gushaka impapuro/ibikoresho.",
      "Ijisho ryitonda ku bintu bito n'ibisobanuro byo guhuza icapa.",
      "Ubumenyi bukomeye bwo gutumanaho bwo gufasha abakiriya guhindura amadosiye."
    ],
    benefitsRw: [
      "Uburambe bw'ingero ku bikoresho bigezweho byo gucapa.",
      "Inyungu z'ubuzima no kumererwa neza.",
      "Amahirwe yo kuzamuka mu ntera mu Buyobozi bw'Imirimo."
    ]
  },
  {
    id: "role-3",
    titleRw: "Umuyobozi wo Kwandika no Gukura Abagurisha",
    departmentRw: "Imirimo",
    locationRw: "Kigali, u Rwanda (Mu murima/Ku biro)",
    descriptionRw: "Yobora gahunda yacu yo kwagura abagurisha. Uzaba ushinzwe gushaka abacuruzi bo mu gace, kubayobora mu kwiyandikisha muri RDB (TIN number), no gusuzuma amadosiye ya KYC yoherejwe kugira ngo ufungure amaduka mashya.",
    requirementsRw: [
      "Uburambe mu mibanire n'abacuruzi, gucunga ubufatanye, cyangwa imirimo yo kugurisha.",
      "Ubumenyi buhanitse bw'iyandikisha ry'ubucuruzi mu Rwanda (RDB) na sisitemu z'imisoro (RRA).",
      "Utumanaho wumva abandi kandi ufite ubumenyi bukomeye bwo gukemura ibibazo.",
      "Ushoboye gutangira no gucunga imishinga y'abafanyabikorwa ubwe."
    ],
    benefitsRw: [
      "Agahimbazamusyi keza kuri buri duka rishya ryanditswe.",
      "Imfashanyo y'ingendo/ibitoro.",
      "Terefone na mudasobwa by'ikigo."
    ]
  },
  {
    id: "role-4",
    titleRw: "Umukozi Ushinzwe Gahunda y'Ibidukikije n'Imirasire y'Izuba",
    departmentRw: "Imishinga y'Iterambere",
    locationRw: "Kigali / Mukorera mu Rugo",
    descriptionRw: "Yobora ibicuruzwa byacu birengera ibidukikije (amatara y'imirasire y'izuba, amashyiga yagezweho). Uzacunga imibanire n'abatanga ibicuruzwa, uhuze ibikorwa by'amashyiga yagezweho, kandi ukusanye imibare y'iterambere ku raporo z'abafanyabikorwa.",
    requirementsRw: [
      "Impamyabumenyi mu bumenyi bw'ibidukikije, iterambere, cyangwa ibindi bifitanye isano.",
      "Uburambe bw'imyaka 1-2 mu bijyanye n'ingendo z'imishinga cyangwa ikwirakwizwa ry'ingufu zitangiza ibidukikije.",
      "Ubumenyi bwo gukusanya amakuru (ingero za Excel/CSV).",
      "Kwiyemeza guteza imbere ibintu bitangiza ibidukikije mu Rwanda."
    ],
    benefitsRw: [
      "Amahirwe yo gukora ku mishinga ikomeye y'ikirere.",
      "Amasaha y'akazi yoroshye.",
      "Ubwishingizi bwuzuye bw'ubuzima."
    ]
  }
];

async function run() {
  console.log("Starting Job Listings Kinyarwanda update...");
  for (const job of jobsUpdate) {
    try {
      const updated = await prisma.jobListing.update({
        where: { id: job.id },
        data: {
          titleRw: job.titleRw,
          departmentRw: job.departmentRw,
          locationRw: job.locationRw,
          descriptionRw: job.descriptionRw,
          requirementsRw: job.requirementsRw,
          benefitsRw: job.benefitsRw
        }
      });
      console.log(`Updated job ${job.id}: "${updated.titleRw}"`);
    } catch (err) {
      console.error(`Failed to update job ${job.id}:`, err.message);
    }
  }
  console.log("Job Listings Kinyarwanda update completed!");
}

run()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
