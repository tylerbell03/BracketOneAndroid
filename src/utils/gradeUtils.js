export function getGradeLabel(grade) {
  // Split grade divisions (100-107)
  const splitGrades = {
    100: "1st/2nd Grade",
    101: "2nd/3rd Grade",
    102: "3rd/4th Grade",
    103: "4th/5th Grade",
    104: "5th/6th Grade",
    105: "6th/7th Grade",
    106: "7th/8th Grade",
    107: "8th/9th Grade",
  };

  if (splitGrades[grade]) {
    return splitGrades[grade];
  }

  if (grade === "15") return "Middle School";
  if (grade === "0") return "JV";
  if (grade === "14") return "Varsity";
  if (grade === "16") return "High School";
  // Split grades
  if (grade === "100") return "1st/2nd Grade";
  if (grade === "101") return "2nd/3rd Grade";
  if (grade === "102") return "3rd/4th Grade";
  if (grade === "103") return "4th/5th Grade";
  if (grade === "104") return "5th/6th Grade";
  if (grade === "105") return "6th/7th Grade";
  if (grade === "106") return "7th/8th Grade";
  if (grade === "107") return "8th/9th Grade";

  // Split grades (100-107)
  if (grade === "100") return "1st/2nd Grade";
  if (grade === "101") return "2nd/3rd Grade";
  if (grade === "102") return "3rd/4th Grade";
  if (grade === "103") return "4th/5th Grade";
  if (grade === "104") return "5th/6th Grade";
  if (grade === "105") return "6th/7th Grade";
  if (grade === "106") return "7th/8th Grade";
  if (grade === "107") return "8th/9th Grade";

  // Convert to number for proper ordinal suffix calculation
  const num = parseInt(grade);

  // Determine ordinal suffix
  let suffix = "th";
  const lastDigit = num % 10;
  const lastTwoDigits = num % 100;

  // Special cases: 11th, 12th, 13th
  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    suffix = "th";
  }
  // 1st, 21st, 31st, etc.
  else if (lastDigit === 1) {
    suffix = "st";
  }
  // 2nd, 22nd, 32nd, etc.
  else if (lastDigit === 2) {
    suffix = "nd";
  }
  // 3rd, 23rd, 33rd, etc.
  else if (lastDigit === 3) {
    suffix = "rd";
  }

  return `${num}${suffix} Grade`;
}

/**
 * Get sort value for a grade (used for proper ordering with split grades interspersed)
 * @param {number} grade - The grade number
 * @returns {number} - Sort value
 */
function getGradeSortValue(grade) {
  const gradeNum = parseInt(grade);

  // Regular grades 1-12 use their numeric value
  if (gradeNum >= 1 && gradeNum <= 12) return gradeNum;

  // Split grades get placed between their constituent grades
  // 1st/2nd (100) -> 1.5, 2nd/3rd (101) -> 2.5, etc.
  if (gradeNum >= 100 && gradeNum <= 107) {
    const baseGrade = gradeNum - 99; // 100->1, 101->2, etc.
    return baseGrade + 0.5;
  }

  // Middle School (15) comes after grade 12
  if (gradeNum === 15) return 12.1;

  // JV (0) comes after Middle School
  if (gradeNum === 0) return 12.2;

  // Varsity (14) comes after JV
  if (gradeNum === 14) return 12.3;

  // High School (16) comes after Varsity
  if (gradeNum === 16) return 12.4;

  // Fallback
  return gradeNum;
}

/**
 * Sort grades with split grades properly interspersed (e.g., 1st, 1st/2nd, 2nd, 2nd/3rd, 3rd, etc.)
 * @param {number} a - First grade to compare
 * @param {number} b - Second grade to compare
 * @returns {number} - Sort order (-1, 0, or 1)
 */
export function sortGrades(a, b) {
  const aValue = getGradeSortValue(a);
  const bValue = getGradeSortValue(b);
  return aValue - bValue;
}
