# i have to know about constant-time comparison.

# what is timing attack?

# what is ReDoS?

# what is dos? what is ddos?

# what is Bcrypt?

# what is Hashing?

# what is sql injection?

# what is xss?

# what is csrf?

# what is credential stuffing?

# what is null byte injection?

# what is session hijacking?

# what is session fixation?

# what is session prediction?

# what is information disclosure?

# what is type confusion?

Attack / Vulnerability │ Fix Applied │
├────────────────────────────┼──────────────────────────────────────────────────┤
│ SQL Injection │ Prisma parameterized queries (always safe) │
│ Buffer Overflow / DoS │ 4KB body limit, 128 char password, 254 char email │
│ bcrypt DoS │ 128 char password max (bcrypt truncates at 72) │
│ Brute Force │ Rate limiting: 5 attempts / 15 min per IP │
│ User Enumeration │ Identical error messages for email/username taken │
│ Timing Attacks │ Dummy bcrypt hash when user exists │
│ XSS via Username │ Strict alphanum+underscore+hyphen regex only │
│ ReDoS │ Simple regexes, size checked BEFORE regex │
│ Null Byte Injection │ Explicit null byte stripping + checks │
│ Information Disclosure │ Generic error messages, no stack traces │
│ Large Payload Attack │ Read as text first, reject if > 4KB │
│ Type Confusion │ Explicit typeof checks before processing │
│ Content-Type Smuggling │ Strict Content-Type: application/json enforcement │
│ Weak Passwords │ 10+ chars, upper+lower+number+special required │
│ Privilege Leakage │ select{} whitelist — never return password hash │

# what is nextrequest and nextresponse?

# what is webfetch api standard? what is req and res in webfetch?

# what is ipv4 and ipv6?

# ip header spoofing?

# how to prevent ip header spoofing?

# what is nonderterministic finite automaton?

# what is linter?

# what is edge computing?

# what is edge runtime?

# what is botnet?

# what is bandwidth?

# what is webfetch api? what are webfetch api standards?

# what is tcp protocol?

# what is ssl?

# what is reverse proxy?

# @map in prisma means what?

# what is ip?

# type assertion in typescript?

# what is nginx

# what is proxy? what is forward proxy? what is reverse proxy?

# database connection pool?
