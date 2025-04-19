import { PrismaClient } from '@prisma/client';
import lodash from 'lodash';

const prisma = new PrismaClient();
const { sample, sampleSize } = lodash;

// 所有 tags 的完整信息（含 name, color, description）
const TAG_DATA = [
  {
    name: "Cancer Survivor",
    color: "#F94144",
    description: "Donor who has personally survived cancer."
  },
  {
    name: "Caregiver",
    color: "#F3722C",
    description: "Supports or cares for someone affected by cancer."
  },
  {
    name: "Patient Support",
    color: "#F9C74F",
    description: "Interested in services that support patients emotionally or practically."
  },
  {
    name: "Lung Cancer",
    color: "#90BE6D",
    description: "Interested in supporting lung cancer research or awareness."
  },
  {
    name: "Breast Cancer",
    color: "#43AA8B",
    description: "Engaged in causes related to breast cancer treatment or research."
  },
  {
    name: "Pediatric Cancer",
    color: "#577590",
    description: "Supports research and care for children with cancer."
  },
  {
    name: "Immunotherapy",
    color: "#9A6FB0",
    description: "Interested in cancer treatment breakthroughs like immunotherapy."
  },
  {
    name: "Prevention",
    color: "#B5838D",
    description: "Focused on cancer prevention and early detection."
  },
  {
    name: "Family Impacted",
    color: "#FF6F91",
    description: "Has family members affected by cancer."
  },
  {
    name: "Volunteer",
    color: "#FFD166",
    description: "Has volunteered time for cancer-related causes or events."
  },
  {
    name: "Business Leader",
    color: "#06D6A0",
    description: "A donor who is active in the business or corporate sector."
  },
  {
    name: "Speaks Mandarin",
    color: "#118AB2",
    description: "Fluent in Mandarin Chinese for communication or outreach."
  },
  {
    name: "Speaks Punjabi",
    color: "#5D9CEC",
    description: "Fluent in Punjabi, may relate to cultural events or outreach."
  },
  {
    name: "Speaks Tagalog",
    color: "#4DD0E1",
    description: "Fluent in Tagalog, suitable for community-focused engagement."
  },
  {
    name: "Rare Cancers",
    color: "#FF8A65",
    description: "Supports awareness or research of rare cancer types."
  },
  {
    name: "Precision Medicine",
    color: "#A1887F",
    description: "Interested in personalized cancer treatment and genomics."
  },
  {
    name: "End-of-Life Care",
    color: "#BA68C8",
    description: "Cares about hospice, palliative care, or quality of life issues."
  },
  {
    name: "Tech Industry",
    color: "#9575CD",
    description: "Works in or supports innovation from the tech sector."
  },
  {
    name: "Family Friendly",
    color: "#4DB6AC",
    description: "Prefers events or programs that include families or children."
  },
  {
    name: "Young Professional",
    color: "#E57373",
    description: "A younger donor building career and philanthropic interest."
  }
];

// 三个重点 tag，确保至少 500 个 donor 会有其中之一
const REQUIRED_TAGS = ["Cancer Survivor", "Caregiver", "Patient Support"];

function getRandomTagCount() {
  return Math.floor(Math.random() * 3) + 1; // 1–3 tags
}

async function main() {
  console.log("🧹 Deleting donor-tag relationships...");
  await prisma.donorTag.deleteMany();

  console.log("🧹 Deleting all tags...");
  await prisma.tag.deleteMany();

  console.log("🌱 Inserting 20 tags with colors and descriptions...");
  await prisma.tag.createMany({
    data: TAG_DATA,
  });

  const tags = await prisma.tag.findMany({
    where: { name: { in: TAG_DATA.map(tag => tag.name) } },
  });

  const tagMap = Object.fromEntries(tags.map(tag => [tag.name, tag.id]));

  for (const requiredTag of REQUIRED_TAGS) {
    if (!tagMap[requiredTag]) {
      throw new Error(`❌ Required tag not found: ${requiredTag}`);
    }
  }

  console.log("📦 Fetching 5000 random donors...");
  const donors = await prisma.$queryRaw`
    SELECT id FROM Donor WHERE is_deleted = false ORDER BY RAND() LIMIT 5000;
  `;

  console.log(`✨ Selected ${donors.length} donors`);

  const requiredDonors = donors.slice(0, 500);

  console.log("🏷️ Tagging 500 donors with at least one required tag...");
  for (const donor of requiredDonors) {
    const tagName = sample(REQUIRED_TAGS);
    const tagId = tagMap[tagName];
    await prisma.donorTag.create({
      data: {
        donor_id: donor.id,
        tag_id: tagId,
      },
    });
  }

  console.log("🔁 Assigning 1–3 random tags to all donors...");
  for (const donor of donors) {
    const assignedTags = sampleSize(TAG_DATA.map(tag => tag.name), getRandomTagCount());
    for (const tagName of assignedTags) {
      const tagId = tagMap[tagName];
      try {
        await prisma.donorTag.create({
          data: {
            donor_id: donor.id,
            tag_id: tagId,
          },
        });
      } catch (error) {
        if (error.code === 'P2002') continue; // skip duplicate
        console.warn(`⚠️ Failed to tag donor ${donor.id}: ${error.message}`);
      }
    }
  }

  console.log("✅ Done! All donors and tags updated.");
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
