import { assert } from '@open-wc/testing';
import { translations as enTranslations } from '../src/locales/en.js';
import { translations as trTranslations } from '../src/locales/tr.js';

describe('Locale Files', () => {
  const commonKeys = [
    'Employees', 'Add New', 'Save', 'Cancel', 'Edit', 'Delete', 'Close',
    'Yes', 'No', 'Loading...', 'First Name', 'Last Name', 'Email', 'Phone',
    'Department', 'Position', 'Actions', 'Change Language', 'Search...'
  ];

  it('has all required keys in English translations', () => {
    commonKeys.forEach(key => {
      assert.property(
        enTranslations,
        key,
        `English translations should have key: ${key}`
      );
      
      assert.isNotEmpty(
        enTranslations[key],
        `English translation for '${key}' should not be empty`
      );
    });
  });

  it('has all required keys in Turkish translations', () => {
    commonKeys.forEach(key => {
      assert.property(
        trTranslations,
        key,
        `Turkish translations should have key: ${key}`
      );
      
      assert.isNotEmpty(
        trTranslations[key],
        `Turkish translation for '${key}' should not be empty`
      );
    });
  });

  it('has the same keys in both translation files', () => {
    const enKeys = Object.keys(enTranslations);
    const trKeys = Object.keys(trTranslations);
    
    assert.sameMembers(
      enKeys,
      trKeys,
      'English and Turkish translation files should have the same keys'
    );
  });

  it('has proper message formatting in English', () => {
    assert.include(
      enTranslations['Page {0}'],
      '{0}',
      'Should include placeholder {0} in English translation'
    );
    
    assert.include(
      enTranslations['This field is required'],
      'required',
      'Should include required message in English'
    );
  });

  it('has proper message formatting in Turkish', () => {
    assert.include(
      trTranslations['Page {0}'],
      '{0}',
      'Should include placeholder {0} in Turkish translation'
    );
    
    assert.isString(
      trTranslations['This field is required'],
      'Should include required message in Turkish'
    );
  });

  it('has consistent message structure', () => {
    Object.entries(enTranslations).forEach(([key, value]) => {
      assert.isString(
        value,
        `English translation for '${key}' should be a string`
      );
    });
    
    Object.entries(trTranslations).forEach(([key, value]) => {
      assert.isString(
        value,
        `Turkish translation for '${key}' should be a string`
      );
    });
  });

  it('has consistent placeholder usage', () => {
    Object.entries(enTranslations).forEach(([key, enValue]) => {
      if (enValue.includes('{0}')) {
        assert.include(
          trTranslations[key],
          '{0}',
          `Turkish translation for '${key}' should include the same placeholder as English`
        );
      }
    });
  });
});
