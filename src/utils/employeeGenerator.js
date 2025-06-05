const firstNames = [
  'James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda',
  'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Christopher', 'Nancy', 'Daniel', 'Lisa',
  'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra', 'Donald', 'Ashley',
  'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle'
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia',
  'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez',
  'Moore', 'Martin', 'Jackson', 'Thompson', 'White', 'Lopez', 'Lee', 'Gonzalez',
  'Harris', 'Clark', 'Lewis', 'Robinson', 'Walker', 'Perez', 'Hall', 'Young', 'Allen'
];

const departments = ['Analytics', 'Tech']
const positions = ['Junior', 'Medior', 'Senior']

export function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

export function generatePhoneNumber() {
  const getRandomDigit = () => Math.floor(Math.random() * 10);
  const getRandomBlock = (length) =>
    Array.from({ length }, getRandomDigit).join('');

  const firstBlock = '5' + Math.floor(5 + Math.random() * 5); 
  const secondBlock = getRandomBlock(1);
  const thirdBlock = getRandomBlock(3);
  const fourthBlock = getRandomBlock(2);
  const fifthBlock = getRandomBlock(2);

  return `+(90) ${firstBlock}${secondBlock} ${thirdBlock} ${fourthBlock} ${fifthBlock}`;
}


function generateEmployee(id) {
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@sourcetimes.org`;
  
  const maxDob = new Date();
  maxDob.setFullYear(maxDob.getFullYear() - 18);
  const minDob = new Date(maxDob);
  minDob.setFullYear(minDob.getFullYear() - 47);
  
  const dob = randomDate(minDob, maxDob);
  const minDoe = new Date(dob);
  minDoe.setFullYear(minDoe.getFullYear() + 18); 
  const maxDoe = new Date();
  const doe = randomDate(minDoe, maxDoe);
  
  return {
    id: id.toString(),
    firstName,
    lastName,
    email,
    phone: generatePhoneNumber(),
    dob: dob.toISOString().split('T')[0],
    doe: doe.toISOString().split('T')[0],
    department: departments[Math.floor(Math.random() * departments.length)],
    position: positions[Math.floor(Math.random() * positions.length)]
  };
}

export function generateEmployees(count) {
  const employees = [];
  for (let i = 0; i < count; i++) {
    employees.push(generateEmployee(i + 1));
  }
  return employees;
}
