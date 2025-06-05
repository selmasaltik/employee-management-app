/* eslint-env es6 */
import { generateEmployees, generatePhoneNumber, randomDate } from '../src/utils/employeeGenerator.js';
import { assert } from '@open-wc/testing';

describe('Employee Generator', () => {
  describe('generateEmployees', () => {
    it('generates the specified number of employees', () => {
      const count = 5;
      const employees = generateEmployees(count);
      
      assert.isArray(employees, 'Should return an array');
      assert.lengthOf(employees, count, `Should generate ${count} employees`);
    });

    it('generates employees with valid properties', () => {
      const employees = generateEmployees(1);
      const employee = employees[0];
      
      const requiredProps = [
        'id', 'firstName', 'lastName', 'email', 'phone',
        'dob', 'doe', 'department', 'position'
      ];
      
      requiredProps.forEach(prop => {
        assert.property(employee, prop, `Employee should have ${prop} property`);
      });
      
      assert.typeOf(employee.id, 'string', 'id should be a string');
      assert.typeOf(employee.firstName, 'string', 'firstName should be a string');
      assert.typeOf(employee.lastName, 'string', 'lastName should be a string');
      assert.typeOf(employee.email, 'string', 'email should be a string');
      assert.typeOf(employee.phone, 'string', 'phone should be a string');
      assert.typeOf(employee.dob, 'string', 'dob should be a string');
      assert.typeOf(employee.doe, 'string', 'doe should be a string');
      assert.typeOf(employee.department, 'string', 'department should be a string');
      assert.typeOf(employee.position, 'string', 'position should be a string');
    });

    it('generates valid email addresses', () => {
      const employees = generateEmployees(10);
      
      employees.forEach(employee => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        assert.match(
          employee.email,
          emailRegex,
          `Employee ${employee.firstName} ${employee.lastName} should have a valid email`
        );
        
        const expectedEmail = `${employee.firstName.toLowerCase()}.${employee.lastName.toLowerCase()}@sourcetimes.org`;
        assert.equal(
          employee.email,
          expectedEmail,
          'Email should follow the pattern firstName.lastName@sourcetimes.org'
        );
      });
    });

    it('generates valid phone numbers', () => {
      const employees = generateEmployees(10);
      const phoneRegex = /^\+\(90\) 5[5-9]\d \d{3} \d{2} \d{2}$/;
      
      employees.forEach(employee => {
        assert.match(
          employee.phone,
          phoneRegex,
          `Employee ${employee.firstName} ${employee.lastName} should have a valid phone number`
        );
      });
    });

    it('generates valid dates of birth', () => {
      const employees = generateEmployees(10);
      const now = new Date();
      const minAge = 18;
      const maxAge = 65;
      
      employees.forEach(employee => {
        const dob = new Date(employee.dob);
        const age = now.getFullYear() - dob.getFullYear();
        
        assert.isFalse(isNaN(dob.getTime()), 'DOB should be a valid date');
        
        assert.isAtLeast(
          age,
          minAge,
          `Employee ${employee.firstName} ${employee.lastName} should be at least ${minAge} years old`
        );
        
        assert.isAtMost(
          age,
          maxAge,
          `Employee ${employee.firstName} ${employee.lastName} should be at most ${maxAge} years old`
        );
      });
    });

    it('generates valid dates of employment', () => {
      const employees = generateEmployees(10);
      const now = new Date();
      
      employees.forEach(employee => {
        const dob = new Date(employee.dob);
        const doe = new Date(employee.doe);
        
        assert.isFalse(isNaN(doe.getTime()), 'DOE should be a valid date');
        
        const minDoe = new Date(dob);
        minDoe.setFullYear(minDoe.getFullYear() + 18);
        
        assert.isAtLeast(
          doe.getTime(),
          minDoe.getTime(),
          `Employee ${employee.firstName} ${employee.lastName} should be at least 18 years old at the time of employment`
        );
        
        assert.isAtMost(
          doe.getTime(),
          now.getTime(),
          `Employee ${employee.firstName} ${employee.lastName} should not have a future employment date`
        );
      });
    });

    it('generates employees with valid departments', () => {
      const validDepartments = ['Analytics', 'Tech'];
      const employees = generateEmployees(10);
      
      employees.forEach(employee => {
        assert.include(
          validDepartments,
          employee.department,
          `Employee ${employee.firstName} ${employee.lastName} should have a valid department`
        );
      });
    });

    it('generates employees with valid positions', () => {
      const validPositions = ['Junior', 'Medior', 'Senior'];
      const employees = generateEmployees(10);
      
      employees.forEach(employee => {
        assert.include(
          validPositions,
          employee.position,
          `Employee ${employee.firstName} ${employee.lastName} should have a valid position`
        );
      });
    });

    it('generates unique employee IDs', () => {
      const count = 10;
      const employees = generateEmployees(count);
      const ids = new Set(employees.map(emp => emp.id));
      
      assert.equal(
        ids.size,
        count,
        `Should generate ${count} unique employee IDs`
      );
      
      const sortedIds = [...ids].map(Number).sort((a, b) => a - b);
      assert.deepEqual(
        sortedIds,
        Array.from({ length: count }, (_, i) => i + 1),
        'Employee IDs should be sequential starting from 1'
      );
    });
  });

  describe('helper functions', () => {
    let originalRandom;
    
    before(() => {
      originalRandom = Math.random;
      
      Math.random = () => 0.5;
    });
    
    after(() => {
      Math.random = originalRandom;
    });
    
    it('generates random dates within the specified range', () => {
      const start = new Date(1990, 0, 1);
      const end = new Date(2000, 0, 1);
      const result = randomDate(start, end);
      
      assert.instanceOf(result, Date, 'Should return a Date object');
      assert.isAtLeast(result.getTime(), start.getTime(), 'Date should be after start date');
      assert.isAtMost(result.getTime(), end.getTime(), 'Date should be before end date');
      
      const expectedTime = start.getTime() + (end.getTime() - start.getTime()) * 0.5;
      assert.equal(result.getTime(), expectedTime, 'Should be exactly in the middle with 0.5 random value');
    });
    
    it('generates valid phone numbers with correct format', () => {
      const phoneNumber = generatePhoneNumber();
      const phoneRegex = /^\+\(90\) 5[5-9]\d \d{3} \d{2} \d{2}$/;
      
      assert.match(
        phoneNumber,
        phoneRegex,
        'Generated phone number should match the expected format'
      );
    });

    it('generates different dates for different random values', () => {
      const start = new Date('2000-01-01');
      const end = new Date('2001-01-01');
      
      const testCases = [
        { random: 0.0, message: 'Should return start date for random=0' },
        { random: 0.5, message: 'Should return middle date for random=0.5' },
        { random: 1.0, message: 'Should return end date for random=1' }
      ];
      
      testCases.forEach(({ random, message }) => {
        Math.random = () => random;
        const result = randomDate(start, end);
        const expectedTime = start.getTime() + (end.getTime() - start.getTime()) * random;
        
        assert.equal(
          result.getTime(),
          expectedTime,
          `${message}: Expected ${new Date(expectedTime).toISOString()}, got ${result.toISOString()}`
        );
      });
    });
  });
});
