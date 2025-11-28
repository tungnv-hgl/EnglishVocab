// Seed script to populate the database with sample vocabulary data
// Run this script after the database is created to have test data available

import { db } from "./db";
import { users, collections, vocabulary } from "@shared/schema";
import { sql } from "drizzle-orm";

const seedVocabulary = [
  // Business English Collection
  {
    word: "Synergy",
    meaning: "The interaction of two or more agents to produce a combined effect greater than the sum of their separate effects",
    example: "The synergy between the marketing and sales teams led to record-breaking results.",
    category: "business"
  },
  {
    word: "Benchmark",
    meaning: "A standard or point of reference against which things may be compared",
    example: "We use industry benchmarks to evaluate our company's performance.",
    category: "business"
  },
  {
    word: "Leverage",
    meaning: "To use something to maximum advantage; to use borrowed capital for investment",
    example: "We need to leverage our expertise to gain a competitive edge.",
    category: "business"
  },
  {
    word: "Scalable",
    meaning: "Able to be changed in size or scale; capable of being expanded",
    example: "Our cloud infrastructure is highly scalable to meet growing demand.",
    category: "business"
  },
  {
    word: "Streamline",
    meaning: "To make a system or organization more efficient by simplifying or eliminating unnecessary steps",
    example: "We streamlined our approval process to reduce delays.",
    category: "business"
  },
  // Academic Words Collection
  {
    word: "Hypothesis",
    meaning: "A proposed explanation made as a starting point for further investigation",
    example: "The scientist tested her hypothesis through a series of experiments.",
    category: "academic"
  },
  {
    word: "Paradigm",
    meaning: "A typical example or pattern of something; a worldview underlying theories",
    example: "The discovery led to a paradigm shift in physics.",
    category: "academic"
  },
  {
    word: "Empirical",
    meaning: "Based on observation or experience rather than theory or logic",
    example: "The study provides empirical evidence for the effectiveness of the treatment.",
    category: "academic"
  },
  {
    word: "Synthesis",
    meaning: "The combination of ideas to form a connected whole",
    example: "Her paper was a synthesis of various philosophical perspectives.",
    category: "academic"
  },
  {
    word: "Correlate",
    meaning: "To have a mutual relationship or connection with something",
    example: "Higher education levels correlate with higher income.",
    category: "academic"
  },
  // Everyday English Collection
  {
    word: "Serendipity",
    meaning: "The occurrence of events by chance in a happy or beneficial way",
    example: "Finding that rare book in a small bookshop was pure serendipity.",
    category: "everyday"
  },
  {
    word: "Ephemeral",
    meaning: "Lasting for a very short time",
    example: "The beauty of cherry blossoms is ephemeral, lasting only a few weeks.",
    category: "everyday"
  },
  {
    word: "Ubiquitous",
    meaning: "Present, appearing, or found everywhere",
    example: "Smartphones have become ubiquitous in modern society.",
    category: "everyday"
  },
  {
    word: "Resilient",
    meaning: "Able to recover quickly from difficulties; tough",
    example: "Children are often more resilient than we give them credit for.",
    category: "everyday"
  },
  {
    word: "Nostalgia",
    meaning: "A sentimental longing for the past",
    example: "Looking at old photos filled her with nostalgia.",
    category: "everyday"
  },
  {
    word: "Ambiguous",
    meaning: "Open to more than one interpretation; unclear",
    example: "The contract language was ambiguous and needed clarification.",
    category: "everyday"
  },
  {
    word: "Pragmatic",
    meaning: "Dealing with things sensibly and realistically",
    example: "We need a pragmatic approach to solving this problem.",
    category: "everyday"
  },
  {
    word: "Eloquent",
    meaning: "Fluent or persuasive in speaking or writing",
    example: "The speaker delivered an eloquent speech that moved the audience.",
    category: "everyday"
  },
  // SAT/GRE Words Collection
  {
    word: "Sycophant",
    meaning: "A person who acts obsequiously to gain advantage",
    example: "The CEO was surrounded by sycophants who never challenged his ideas.",
    category: "test_prep"
  },
  {
    word: "Perfunctory",
    meaning: "Carried out with a minimum of effort or reflection",
    example: "The guard gave the bag a perfunctory check before waving us through.",
    category: "test_prep"
  },
  {
    word: "Taciturn",
    meaning: "Reserved or uncommunicative in speech; saying little",
    example: "The taciturn librarian rarely spoke to visitors.",
    category: "test_prep"
  },
  {
    word: "Ephemeral",
    meaning: "Lasting for only a short time",
    example: "Fame can be ephemeral in the entertainment industry.",
    category: "test_prep"
  },
  {
    word: "Cognizant",
    meaning: "Having knowledge or awareness",
    example: "She was fully cognizant of the risks involved in the investment.",
    category: "test_prep"
  },
  {
    word: "Obfuscate",
    meaning: "To render obscure, unclear, or unintelligible",
    example: "The lawyer tried to obfuscate the facts of the case.",
    category: "test_prep"
  },
  {
    word: "Propitious",
    meaning: "Indicating a good chance of success; favorable",
    example: "The economic conditions were propitious for launching the new business.",
    category: "test_prep"
  },
  {
    word: "Didactic",
    meaning: "Intended to teach or instruct; morally instructive",
    example: "The novel has a didactic purpose, aiming to teach moral lessons.",
    category: "test_prep"
  },
  // Advanced Vocabulary
  {
    word: "Verisimilitude",
    meaning: "The appearance of being true or real",
    example: "The film achieved great verisimilitude in its depiction of medieval life.",
    category: "advanced"
  },
  {
    word: "Solipsistic",
    meaning: "Characterized by the belief that only one's own mind is sure to exist",
    example: "His solipsistic worldview made collaboration difficult.",
    category: "advanced"
  },
  {
    word: "Perspicacious",
    meaning: "Having keen mental perception and understanding",
    example: "The perspicacious detective noticed the crucial detail everyone else missed.",
    category: "advanced"
  },
  {
    word: "Ameliorate",
    meaning: "To make something better; improve",
    example: "The new policies helped ameliorate the housing crisis.",
    category: "advanced"
  },
  {
    word: "Ineffable",
    meaning: "Too great or extreme to be expressed in words",
    example: "She felt an ineffable joy at the birth of her first child.",
    category: "advanced"
  },
  {
    word: "Perfidious",
    meaning: "Deceitful and untrustworthy",
    example: "The perfidious ally switched sides at the crucial moment.",
    category: "advanced"
  },
  {
    word: "Supercilious",
    meaning: "Behaving as if one thinks they are superior to others",
    example: "His supercilious attitude made him unpopular among coworkers.",
    category: "advanced"
  },
  {
    word: "Sanguine",
    meaning: "Optimistic or positive, especially in an apparently bad situation",
    example: "Despite the setback, she remained sanguine about the project's success.",
    category: "advanced"
  },
  // More Everyday Words
  {
    word: "Meticulous",
    meaning: "Showing great attention to detail; very careful and precise",
    example: "The jeweler was meticulous in crafting each piece.",
    category: "everyday"
  },
  {
    word: "Gregarious",
    meaning: "Fond of company; sociable",
    example: "Her gregarious nature made her the life of every party.",
    category: "everyday"
  },
  {
    word: "Tenacious",
    meaning: "Tending to keep a firm hold of something; persistent",
    example: "The tenacious reporter spent years investigating the story.",
    category: "everyday"
  },
  {
    word: "Candid",
    meaning: "Truthful and straightforward; frank",
    example: "She gave a candid interview about her struggles.",
    category: "everyday"
  },
  {
    word: "Volatile",
    meaning: "Liable to change rapidly and unpredictably",
    example: "The stock market has been particularly volatile this year.",
    category: "everyday"
  },
  {
    word: "Prolific",
    meaning: "Producing much fruit or foliage; creative and productive",
    example: "The prolific author published three novels in one year.",
    category: "everyday"
  },
  {
    word: "Arduous",
    meaning: "Involving or requiring strenuous effort; difficult",
    example: "The climb to the summit was long and arduous.",
    category: "everyday"
  },
  {
    word: "Concise",
    meaning: "Giving a lot of information clearly in few words",
    example: "Please keep your summary concise and to the point.",
    category: "everyday"
  },
  {
    word: "Lucid",
    meaning: "Expressed clearly; easy to understand",
    example: "The professor gave a lucid explanation of complex concepts.",
    category: "everyday"
  },
  {
    word: "Astute",
    meaning: "Having or showing an ability to accurately assess situations",
    example: "Her astute observations helped identify the problem.",
    category: "everyday"
  }
];

const collectionInfo: Record<string, { name: string; description: string; color: string }> = {
  business: {
    name: "Business English",
    description: "Essential vocabulary for professional and corporate environments",
    color: "#3B82F6" // Blue
  },
  academic: {
    name: "Academic Words",
    description: "Vocabulary commonly used in academic writing and research",
    color: "#8B5CF6" // Purple
  },
  everyday: {
    name: "Everyday English",
    description: "Useful words to enhance daily communication",
    color: "#10B981" // Green
  },
  test_prep: {
    name: "SAT/GRE Prep",
    description: "Advanced vocabulary for standardized test preparation",
    color: "#F59E0B" // Amber
  },
  advanced: {
    name: "Advanced Vocabulary",
    description: "Sophisticated words for articulate expression",
    color: "#EC4899" // Pink
  }
};

export async function seedDatabase(userId: string) {
  console.log("Starting database seed for user:", userId);
  
  try {
    // Create collections
    const createdCollections: Record<string, string> = {};
    
    for (const [category, info] of Object.entries(collectionInfo)) {
      const [collection] = await db
        .insert(collections)
        .values({
          name: info.name,
          description: info.description,
          color: info.color,
          userId,
        })
        .returning();
      
      createdCollections[category] = collection.id;
      console.log(`Created collection: ${info.name}`);
    }
    
    // Create vocabulary
    for (const word of seedVocabulary) {
      await db
        .insert(vocabulary)
        .values({
          word: word.word,
          meaning: word.meaning,
          example: word.example,
          userId,
          collectionId: createdCollections[word.category],
          mastered: false,
        });
    }
    
    console.log(`Seeded ${seedVocabulary.length} vocabulary words across ${Object.keys(collectionInfo).length} collections`);
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    return false;
  }
}

// Export the seed data for use in routes
export { seedVocabulary, collectionInfo };
