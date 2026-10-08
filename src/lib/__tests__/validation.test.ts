import { isEmail, normaliseUkPhone, validateCustomer } from '../validation';

const valid = {
  firstName: 'Sam',
  lastName: 'Reilly',
  email: 'sam@example.com',
  phone: '020 3488 4472',
  company: '',
  citbRegistered: false,
  notes: '',
};

describe('validation', () => {
  it('normalises UK phone numbers', () => {
    expect(normaliseUkPhone('020 3488 4472')).toBe('+442034884472');
    expect(normaliseUkPhone('+44 (0)7700 900123')).toBe('+447700900123');
    expect(normaliseUkPhone('0044 7700 900123')).toBe('+447700900123');
    expect(normaliseUkPhone('12345')).toBeNull();
    expect(normaliseUkPhone('+1 212 555 0100')).toBeNull();
  });

  it('checks email addresses', () => {
    expect(isEmail('a@b.co')).toBe(true);
    expect(isEmail('a@b')).toBe(false);
    expect(isEmail('a b@c.com')).toBe(false);
  });

  it('says what to fix', () => {
    expect(validateCustomer(valid)).toEqual({});
    const errors = validateCustomer({ ...valid, firstName: ' ', email: 'nope', phone: '123' });
    expect(errors.firstName).toMatch(/first name/);
    expect(errors.email).toMatch(/like name@company/);
    expect(errors.phone).toMatch(/UK phone number/);
  });
});
