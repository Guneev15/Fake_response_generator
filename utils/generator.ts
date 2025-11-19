import { FieldType, FormField, GeneratedRecord } from '../types';

// Indian context data
const firstNames = [
  "Aarav", "Vihaan", "Aditya", "Arjun", "Rohan", "Ishaan", "Vivaan", "Reyansh",
  "Diya", "Ananya", "Saanvi", "Priya", "Neha", "Kavya", "Aadya", "Isha", "Rahul", "Amit"
];
const lastNames = [
  "Patel", "Sharma", "Singh", "Kumar", "Gupta", "Verma", "Reddy", "Nair", "Malhotra", "Iyer",
  "Mehta", "Joshi", "Rao", "Saxena", "Bhatia", "Das", "Chopra"
];
const domains = ["gmail.com", "yahoo.co.in", "outlook.com", "rediffmail.com"];
const cities = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Surat",
  "Lucknow", "Kanpur", "Nagpur", "Indore", "Thane", "Bhopal", "Patna", "Vadodara"
];

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateFakeRecord = (fields: FormField[]): GeneratedRecord => {
  // More structured Response ID
  const record: GeneratedRecord = {
    id: `RESP-${Date.now()}-${randomInt(1000, 9999)}`,
  };

  fields.forEach((field) => {
    const labelLower = field.label.toLowerCase();
    
    switch (field.type) {
      case FieldType.TEXT:
        if (labelLower.includes('name')) {
          record[field.id] = `${randomItem(firstNames)} ${randomItem(lastNames)}`;
        } else if (labelLower.includes('city') || labelLower.includes('address')) {
          record[field.id] = randomItem(cities);
        } else if (labelLower.includes('phone') || labelLower.includes('mobile')) {
          // Indian Mobile Number Format
          record[field.id] = `+91 ${randomInt(60000, 99999)} ${randomInt(10000, 99999)}`;
        } else {
          record[field.id] = `Response ${randomInt(100, 999)}`;
        }
        break;
      case FieldType.EMAIL:
        const fname = randomItem(firstNames).toLowerCase();
        const lname = randomItem(lastNames).toLowerCase();
        record[field.id] = `${fname}.${lname}${randomInt(1, 99)}@${randomItem(domains)}`;
        break;
      case FieldType.NUMBER:
        if (labelLower.includes('age')) {
          record[field.id] = randomInt(18, 65);
        } else {
          record[field.id] = randomInt(0, 1000);
        }
        break;
      case FieldType.SELECT:
        if (field.options && field.options.length > 0) {
          record[field.id] = randomItem(field.options);
        }
        break;
      case FieldType.CHECKBOX:
        if (field.options && field.options.length > 0) {
          // Select random subset
          record[field.id] = field.options.filter(() => Math.random() > 0.5);
        } else {
          record[field.id] = Math.random() > 0.5;
        }
        break;
    }
  });

  return record;
};

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));