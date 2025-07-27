# 🔒 Security Testing Framework

A comprehensive, modular security testing framework for web applications. This framework provides detailed security assessments with proper documentation and maintainable code structure.

## 📁 Module Structure

```
tests/security/
├── README.md                    # This documentation
├── SecurityTester.js           # Main orchestrator
├── securityTests.js            # Legacy monolithic tester (deprecated)
└── modules/                    # Individual test modules
    ├── httpsTester.js          # HTTPS/TLS testing
    ├── headersTester.js        # Security headers testing
    ├── cookieTester.js         # Cookie security testing
    └── vulnerabilityTester.js  # Vulnerability scanning
```

## 🎯 Test Coverage

### 1. **HTTPS/TLS Configuration** (`httpsTester.js`)

- **HTTP to HTTPS redirect testing**
- **HTTPS connection validation**
- **TLS configuration analysis**
- **Security header verification**

### 2. **Security Headers** (`headersTester.js`)

- **Critical headers**: HSTS, X-Frame-Options, X-Content-Type-Options
- **XSS protection**: X-XSS-Protection header
- **Content Security Policy**: CSP header analysis
- **Additional headers**: Referrer Policy, Permissions Policy
- **Header validation**: Proper configuration checking

### 3. **Cookie Security** (`cookieTester.js`)

- **Secure flag**: HTTPS-only cookie transmission
- **HttpOnly flag**: JavaScript access prevention
- **SameSite attribute**: CSRF protection
- **Session cookies**: Authentication token security
- **Cookie behavior**: Injection vulnerability testing

### 4. **Vulnerability Testing** (`vulnerabilityTester.js`)

- **XSS vulnerabilities**: Reflected and stored XSS detection
- **Information disclosure**: Header and file exposure testing
- **Input validation**: Form field security analysis
- **Sensitive files**: Common security file accessibility

## 🚀 Usage

### Basic Usage

```javascript
const SecurityTester = require('./tests/security/SecurityTester');

const tester = new SecurityTester({
  targetUrl: 'https://example.com',
  verbose: true,
  timeout: 30000,
});

const results = await tester.runSecurityTests();
```

### CLI Integration

```bash
# Run security assessment
node index.js --security

# Run with specific options
node index.js --security --count 10 --debug

# Interactive mode with security
node index.js --security --interactive
```

## 📊 Test Results

Each test module returns a standardized result object:

```javascript
{
  name: 'Test Name',
  status: 'PASS|WARN|FAIL|ERROR',
  score: 15,
  maxScore: 20,
  details: ['✅ Success message', '⚠️ Warning message'],
  issues: ['Recommendation 1', 'Recommendation 2']
}
```

## 🎨 HTML Reports

Security test results are integrated into the HTML reporting system:

- **Security Assessment Report**: Dedicated security report page
- **Complete Report**: Security section in comprehensive reports
- **Interactive Charts**: Visual representation of security scores
- **Recommendations**: Actionable security improvement suggestions

## 🔧 Configuration Options

### SecurityTester Options

```javascript
{
  targetUrl: 'https://example.com',    // Target URL to test
  verbose: false,                      // Enable detailed logging
  timeout: 30000,                     // Network timeout (ms)
  headless: true                      // Browser headless mode
}
```

### Individual Module Options

Each module accepts the same configuration options and can be used independently:

```javascript
const HTTPSecurityTester = require('./modules/httpsTester');
const tester = new HTTPSecurityTester(options);
const results = await tester.testHTTPSConfiguration();
```

## 📈 Scoring System

### Overall Security Rating

- **EXCELLENT**: 80%+ score
- **GOOD**: 65-79% score
- **FAIR**: 50-64% score
- **POOR**: <50% score

### Individual Test Scoring

- **PASS**: 75%+ of max score
- **WARN**: 50-74% of max score
- **FAIL**: <50% of max score

## 🛡️ Security Features Tested

### HTTPS/TLS (20 points)

- HTTP to HTTPS redirect (5 points)
- HTTPS connection success (10 points)
- TLS configuration (5 points)

### Security Headers (25 points)

- HSTS header (5 points)
- X-Frame-Options (4 points)
- X-Content-Type-Options (3 points)
- X-XSS-Protection (3 points)
- Content Security Policy (5 points)
- Additional headers (5 points)

### Content Security Policy (15 points)

- CSP header presence (10 points)
- Inline script restrictions (3 points)
- Eval() restrictions (2 points)

### Cookie Security (15 points)

- Secure flag (5 points)
- HttpOnly flag (5 points)
- SameSite attribute (5 points)

### Vulnerability Assessment (25 points)

- XSS vulnerability detection (10 points)
- Information disclosure (10 points)
- Input validation (5 points)

## 🔄 Integration Points

### CLI Application

- **Security flag**: `--security`
- **Interactive menu**: Security testing option
- **Report generation**: HTML security reports
- **Export capabilities**: JSON/CSV security data

### Report System

- **Security report generator**: `securityReport.js`
- **CSS styling**: Security-specific styles
- **Chart integration**: Security score visualizations
- **Recommendation engine**: Actionable security advice

## 🧪 Testing Individual Modules

```javascript
// Test HTTPS configuration only
const httpsTester = new HTTPSecurityTester(options);
const httpsResults = await httpsTester.testHTTPSConfiguration();

// Test security headers only
const headersTester = new SecurityHeadersTester(options);
const headersResults = await headersTester.testSecurityHeaders();

// Test cookie security only
const cookieTester = new CookieSecurityTester(options);
const cookieResults = await cookieTester.testCookieSecurity();

// Test vulnerabilities only
const vulnTester = new VulnerabilityTester(options);
const xssResults = await vulnTester.testXSSVulnerabilities();
const disclosureResults = await vulnTester.testInformationDisclosure();
```

## 📝 Contributing

### Adding New Security Tests

1. **Create new module** in `modules/` directory
2. **Follow naming convention**: `{feature}Tester.js`
3. **Implement standard interface**:
   ```javascript
   class NewSecurityTester {
     constructor(options) {
       /* ... */
     }
     async testNewFeature() {
       return {
         name: 'New Feature Test',
         status: 'UNKNOWN',
         score: 0,
         maxScore: 10,
         details: [],
         issues: [],
       };
     }
   }
   ```
4. **Add to main orchestrator** in `SecurityTester.js`
5. **Update documentation** in this README

### Code Standards

- **JSDoc comments**: All public methods documented
- **Error handling**: Comprehensive try-catch blocks
- **Status determination**: Consistent scoring system
- **Detailed logging**: Verbose mode support
- **Modular design**: Single responsibility principle

## 🚨 Security Considerations

### Testing Limitations

- **Non-intrusive**: Tests do not attempt actual exploits
- **Basic coverage**: Focus on common security misconfigurations
- **Header analysis**: Limited to response header inspection
- **Cookie analysis**: Browser-based cookie examination

### Best Practices

- **Regular testing**: Run security assessments frequently
- **Manual review**: Supplement automated testing
- **Penetration testing**: Professional security audits
- **Continuous monitoring**: Ongoing security validation

## 📞 Support

- **Email**: jrbauti19@gmail.com
- **Portfolio**: https://www.joshuabautista.dev/
- **LinkedIn**: https://www.linkedin.com/in/joshua-raphael-bautista-8a019a11b/

---

_This security testing framework is part of the QA Wolf Take-Home Assignment by Joshua Bautista._
