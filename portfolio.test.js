
const regexPatterns = {
    zip: /^\d{5}(-\d{4})?$/,
    phone: /^(\+?\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
};

// TEST 1: Email Address Validation
test('Contact form should validate valid and invalid email addresses correctly', () => {
    const emailPattern = regexPatterns.email; 
    
    expect(emailPattern.test('dylan.apfelbeck@gmail.com')).toBe(true);
    expect(emailPattern.test('invalid-email')).toBe(false);
    expect(emailPattern.test('test@domain')).toBe(false);
});

// TEST 2: ZIP Code Validation
test('Contact form should validate 5-digit and ZIP+4 postal codes correctly', () => {
    const zipPattern = regexPatterns.zip;
    
    expect(zipPattern.test('54448')).toBe(true);
    expect(zipPattern.test('54448-1234')).toBe(true);
    expect(zipPattern.test('abc12')).toBe(false);
    expect(zipPattern.test('5444')).toBe(false);
});

// TEST 3: Phone Number Validation
test('Contact form should validate multiple phone number formats correctly', () => {
    const phonePattern = regexPatterns.phone; 
    
    expect(phonePattern.test('555-555-5555')).toBe(true);
    expect(phonePattern.test('(555) 555-5555')).toBe(true);
    expect(phonePattern.test('5555555555')).toBe(true);
    expect(phonePattern.test('123-abc-efgh')).toBe(false);
});