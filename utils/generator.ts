
import { FieldType, FormField, GeneratedRecord } from '../types';

// Indian context data
const maleNames = [
  "Aarav", "Vihaan", "Aditya", "Arjun", "Rohan", "Ishaan", "Vivaan", "Reyansh", "Rahul", "Amit",
  "Kabir", "Aryan", "Shaurya", "Atharv", "Ayaan", "Dhruv", "Krishna", "Sai", "Manish", "Deepak"
];

const femaleNames = [
  "Diya", "Ananya", "Saanvi", "Priya", "Neha", "Kavya", "Aadya", "Isha", "Meera", "Riya",
  "Sika", "Myra", "Amaira", "Kiara", "Aditi", "Pooja", "Shruti", "Sneha", "Anjali"
];

const lastNames = [
  "Patel", "Sharma", "Singh", "Kumar", "Gupta", "Verma", "Reddy", "Nair", "Malhotra", "Iyer",
  "Mehta", "Joshi", "Rao", "Saxena", "Bhatia", "Das", "Chopra", "Desai", "Jain"
];

const domains = ["gmail.com", "yahoo.co.in", "outlook.com", "rediffmail.com", "hotmail.com"];
const cities = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat",
  "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Patna", "Vadodara", "Chandigarh", "Kochi"
];

// Specific Hostel Configuration
const boysHostels = ["Hostel J", "Hostel K", "Hostel B", "Hostel H", "Hostel L", "Hostel O", "Hostel A"];
const girlsHostels = ["Hostel I", "Hostel Q", "PG", "Hostel G"];

// Context-aware Lists
const departments = ["Computer Science", "Mechanical", "Electrical", "Civil", "Electronics", "Information Tech", "Biotech"];
const colors = ["Red", "Blue", "Green", "Yellow", "Black", "White", "Purple", "Orange"];
const foods = ["Pizza", "Burger", "Pasta", "Biryani", "Dosa", "Idli", "Sandwich", "Salad"];
const hobbies = ["Reading", "Gaming", "Traveling", "Cooking", "Music", "Sports", "Photography"];
const colleges = ["IIT Bombay", "BITS Pilani", "NIT Trichy", "VIT Vellore", "Manipal Institute", "SRM University", "Amity University"];

// Lorem Ipsum for paragraphs
const loremSentences = [
  "The quick brown fox jumps over the lazy dog.",
  "Reviewing the submitted application for further processing.",
  "Ideally, we would like to schedule a meeting next week.",
  "This is a generated response for testing purposes.",
  "Please consider this as a placeholder for the actual content.",
  "The service quality was exceptional and exceeded expectations.",
  "I encountered a few issues while navigating the interface.",
  "The product durability seems to be quite good overall."
];

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Helper for Date Generation (YYYY-MM-DD)
const generateDate = (startYear: number, endYear: number): string => {
  const year = randomInt(startYear, endYear);
  const month = randomInt(1, 12);
  const day = randomInt(1, 28); // Safe day limit
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

// Helper for Time Generation (HH:MM)
const generateTime = (): string => {
  const hour = randomInt(0, 23);
  const minute = randomItem([0, 15, 30, 45]); // Standard intervals
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

export const generateFakeRecord = (fields: FormField[]): GeneratedRecord => {
  const record: GeneratedRecord = {
    id: `RESP-${Date.now()}-${randomInt(1000, 9999)}`,
  };

  // 1. Determine gender for this record to ensure consistency between Name and Hostel
  const isMale = Math.random() > 0.5;
  const firstName = isMale ? randomItem(maleNames) : randomItem(femaleNames);
  const lastName = randomItem(lastNames);

  fields.forEach((field) => {
    const labelLower = field.label.toLowerCase();
    
    // Priority Custom Logic based on Label content
    if (labelLower.includes('roll')) {
       record[field.id] = randomInt(102203000, 102505999);
       return;
    }

    if (labelLower.includes('hostel')) {
        if (field.type === FieldType.SELECT && field.options && field.options.length > 0) {
            record[field.id] = randomItem(field.options);
        } else {
            record[field.id] = isMale ? randomItem(boysHostels) : randomItem(girlsHostels);
        }
        return;
    }

    // Standard Type Logic
    switch (field.type) {
      case FieldType.TEXT:
        if (labelLower.includes('name')) {
          record[field.id] = `${firstName} ${lastName}`;
        } else if (labelLower.includes('city') || labelLower.includes('address') || labelLower.includes('location')) {
          record[field.id] = randomItem(cities);
        } else if (labelLower.includes('phone') || labelLower.includes('mobile') || labelLower.includes('contact')) {
          // Indian Mobile Number Format
          record[field.id] = `+91 ${randomInt(60000, 99999)} ${randomInt(10000, 99999)}`;
        } else if (labelLower.includes('email')) {
          record[field.id] = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 99)}@${randomItem(domains)}`;
        } else if (labelLower.includes('dept') || labelLower.includes('department') || labelLower.includes('branch')) {
          record[field.id] = randomItem(departments);
        } else if (labelLower.includes('college') || labelLower.includes('university') || labelLower.includes('institute')) {
            record[field.id] = randomItem(colleges);
        } else if (labelLower.includes('color')) {
          record[field.id] = randomItem(colors);
        } else if (labelLower.includes('food') || labelLower.includes('dish')) {
          record[field.id] = randomItem(foods);
        } else if (labelLower.includes('hobby') || labelLower.includes('interest')) {
          record[field.id] = randomItem(hobbies);
        } else {
          record[field.id] = `Answer ${randomInt(100, 999)}`;
        }
        break;
      
      case FieldType.PARAGRAPH:
        record[field.id] = Array.from({ length: randomInt(2, 4) }, () => randomItem(loremSentences)).join(' ');
        break;

      case FieldType.EMAIL:
        record[field.id] = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${randomInt(1, 99)}@${randomItem(domains)}`;
        break;

      case FieldType.NUMBER:
        if (labelLower.includes('age')) {
          record[field.id] = randomInt(18, 30);
        } else if (labelLower.includes('year')) {
          record[field.id] = randomInt(1990, 2025);
        } else {
          record[field.id] = randomInt(1, 100);
        }
        break;

      case FieldType.DATE:
        if (labelLower.includes('birth') || labelLower.includes('dob')) {
            record[field.id] = generateDate(1995, 2005);
        } else {
            record[field.id] = generateDate(2024, 2025);
        }
        break;

      case FieldType.TIME:
        record[field.id] = generateTime();
        break;

      case FieldType.LINEAR_SCALE:
        record[field.id] = randomInt(1, 5);
        break;

      case FieldType.SELECT:
        if (field.options && field.options.length > 0) {
          record[field.id] = randomItem(field.options);
        } else {
          // Fallback if no options parsed
          record[field.id] = "Option " + randomInt(1, 3);
        }
        break;

      case FieldType.CHECKBOX:
        if (field.options && field.options.length > 0) {
          const shuffled = [...field.options].sort(() => 0.5 - Math.random());
          record[field.id] = shuffled.slice(0, randomInt(1, Math.min(3, field.options.length)));
        } else {
          record[field.id] = Math.random() > 0.5;
        }
        break;
    }
  });

  return record;
};

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
