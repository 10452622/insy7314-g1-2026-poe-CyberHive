# HustleHub+

## Explanation of the system:
HustleHub+ is a freelance marketplace or a platform that connects clients with freelancers. Clients can browse and search for services, view the freelancer profiles and available gigs, place bookings/orders, make payments towards the service(s), communicate with freelancers and leave reviews.
Freelancers can create and manage gigs, manage bookings, view their earnings and transactions, communicate with clients and manage their profile and security settings.

For part 2, the original backend has been extended into a full-stack application. A React.js frontend has been developed to allow users to interact with the backend through the REST API endpoints.

The application now supports marketplace functionality including gig creation, gig browsing, gig management, bookings along with booking confirmations, transaction records and freelancer income tracking.

The backend is developed using Node.js and Express.js and the frontend is developed using React.js in Visual Studio Code. The system follows the MERN architecture with the MongoDB forming the intended database layer for persistent application data. This application provides REST API endpoints that allow the frontend application to communicate with the backend application and perform operations such as user registration, authentication and management of HustleHub+ services.

## 1. Intended Users

### 1.1 Clients

**Functions:**
- Create an account and/or login.
- Search and browse freelancer services.
- Filter services based on categories, price and ratings.
- View freelancer profiles and gig details.
- Book/order freelance services.
- Make payments.
- View booking/order history.
- Track booking status.
- Receive notifications.
- Communicate with freelancers.
- Leave reviews and ratings.
- Manage their profile and security settings.
- Reset their password if required.

### 1.2 Freelancers

**Functions:**
- Register as a freelancer.
- Log in securely.
- Create and manage gigs.
- Edit or remove existing gigs.
- View client orders.
- Accept and manage orders.
- Communicate with clients.
- Track earnings.
- View transaction records.
- View estimated tax information.
- Receive notifications.
- Manage their profile.
- Change their password and security settings.

---

## Application Features

### Authentication

Users must authenticate before accessing the protected functionality.

Authentication functionality for users include:

- User registration.
- Account/User type selection.
- Role-based access control.
- User login.
- JWT-based authentication.
- Password hashing.
- Password reset functionality.
- Protected API routes.

### Gig Management

Freelancers are able to manage their own marketplace listings.

The backend performs authorization and ownership checks before sensitive operations are completed e.g. a freelancer updates or deletes a gig that belongs to them but they cannot update or delete another freelancer’s gig.

A freelancer can:

- Create a gig(s).
- View their gig(s).
- Update their own gig(s).
- Delete their own gig(s).

### Gig Browsing

Clients and guests can browse available services through the React frontend. The frontend communicates with the Express API to retrieve the relevant gig information.

Clients and guests can:

- Browse available gigs.
- Search for gigs.
- Filter gigs.
- View gig details.
- View freelancer information.
- Select a service to book.

### Booking Functionality

Clients can initiate a booking from a gig's details page. The application does not use a real payment gateway. Instead, a simulated payment/booking confirmation is used for assessment purposes.

The booking process includes:

- Selecting a gig.
- Reviewing the gig information.
- Providing the required booking information.
- Selecting the simulated payment method.
- Confirming the booking.
- Creating a booking/order record.
- Creating an associated transaction record.
- Displaying the booking confirmation.

### Transaction and Income Tracking

Every successful booking results in a transaction record being created.

The transaction is associated with the relevant:

- Client.
- Freelancer.
- Gig.
- Booking/order.
- Amount.
- Transaction status.

The transaction information allows the system to track income generated from bookings and associate the income with the correct freelancer.

Freelancers can view:

- Earnings.
- Transactions.
- Booking-related income.
- Estimated tax information.

### Messages and Notifications

#### Messages

The messaging functionality allows clients and freelancers to communicate with each other.

Messages support:

- Client-to-freelancer communication.
- Freelancer-to-client communication.
- Sending and receiving messages.
- Conversation history.

#### Notifications

Notifications are separate from messaging and are used for system-generated alerts.

Examples include:

- Booking confirmations.
- Booking updates.
- Payment/transaction updates.
- Password reset notifications.
- Other system alerts.

Messages therefore represent user-to-user communication, while notifications represent system-generated information.

---

## Backend Structure

The backend of **HustleHub+** is built using **Node.js** and **Express.js**. It follows a modular architecture that separates application responsibilities into dedicated folders and files, making the codebase easier to maintain, test, and extend.

### Backend Project Structure

```text
HustleHub+/
├── backend/
│   ├── config/
│   ├── certs/
│   ├── controllers/
│   ├── data/
│   ├── middleware/
│   ├── models/
│   ├── node_modules/
│   ├── routes/
│   ├── utils/
│   ├── .env
│   ├── .gitignore
│   ├── package-lock.json
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── .vscode/
    ├── dist/
    ├── node_modules/
    ├── public/
    ├── src/
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    ├── README.md
    └── vite.config.js
```

### Backend Folder and File Descriptions

| Folder/File | Description |
|---|---|
| `config/` | Contains configuration files and setup logic required by the backend, such as database connection settings. |
| `certs/` | Contains the local SSL/TLS certificates required for HTTPS communication during development. |
| `controllers/` | Contains the main application logic for backend features, including user registration, authentication, and user operations. |
| `data/` | Handles local data storage and retrieval where applicable. This functionality can be extended or replaced with database-backed storage. |
| `middleware/` | Contains middleware responsible for authentication, input validation, rate limiting, error handling, and other request-processing tasks. |
| `models/` | Defines the data structures and models used to represent application entities. |
| `routes/` | Defines the API routes and endpoints through which the frontend communicates with the backend. |
| `utils/` | Contains reusable helper functions, including security-related utilities such as password hashing and JSON Web Token (JWT) generation. |
| `node_modules/` | Contains the Node.js packages and dependencies installed for the backend. This directory is generated through package installation and should not be committed to Git. |
| `.env` | Stores environment variables and sensitive configuration values outside the source code. This file must not be committed to the repository. |
| `.gitignore` | Specifies files and directories that Git should exclude from version control, such as environment files and installed dependencies. |
| `package.json` | Contains project metadata, dependencies, and scripts required to install, configure, and run the backend. |
| `package-lock.json` | Records the resolved dependency versions to support consistent installations across development environments. |
| `server.js` | Serves as the main entry point of the backend. It configures Express, registers middleware and routes, establishes required connections, and starts the HTTPS server. |

> **Note:** The `utils/` directory is included in this structure because it is referenced in the folder descriptions. Ensure that it exists in the actual project. Similarly, retain only the folders that are present in your repository.

## Frontend Structure

The frontend of **HustleHub+** is developed using **React.js** and **Vite**. It provides the user interface through which clients and freelancers interact with the platform's features.

The frontend communicates with the Node.js and Express.js backend through **REST API requests**, enabling users to access application functionality through their respective interfaces.

### Frontend Application Sections

#### 1. Authentication

The authentication section provides the pages required for users to access the platform and create accounts.

- **Landing Page** — Introduces HustleHub+ and its core features.
- **Register Page** — Allows new users to create an account.
- **Choose Account Type** — Allows users to select the appropriate account type, such as client or freelancer.
- **Login Page** — Allows registered users to authenticate and access their accounts.
- **Forgot Password Page** — Supports the password recovery process.

#### 2. Client Functionality

The client interface allows users to discover freelancers, manage bookings, communicate with freelancers, and maintain their accounts.

- **Client Home/Browse** — Displays available services and freelancers.
- **Search Results** — Displays freelancers or gigs matching a user's search criteria.
- **Gig Details** — Displays information about a selected gig, including its description and relevant details.
- **Booking Page** — Allows clients to initiate a booking for a selected gig.
- **Booking Confirmation** — Displays confirmation details after a successful booking.
- **My Orders** — Provides an overview of the client's bookings and orders.
- **Order Details** — Displays information about a specific order.
- **Messages** — Enables communication between clients and freelancers.
- **Profile/Security** — Allows clients to manage their profile information and account security settings.

#### 3. Freelancer Functionality

The freelancer interface provides tools for managing services, tracking orders, monitoring earnings, and maintaining account information.

- **Freelancer Dashboard** — Provides an overview of the freelancer's activities and performance.
- **My Gigs** — Allows freelancers to manage the services they offer.
- **Orders** — Displays and supports the management of incoming and ongoing orders.
- **Earnings** — Provides an overview of income generated through the platform.
- **Estimated Tax** — Helps freelancers estimate their tax obligations based on relevant earnings information.
- **Transaction Records** — Displays financial transaction history.
- **Messages** — Enables communication with clients.
- **Profile/Security** — Allows freelancers to manage their profile information and account security settings.

## Frontend–Backend Communication

HustleHub+ uses a client-server architecture in which the React frontend communicates with the Express.js backend through RESTful API endpoints.

The general request flow is as follows:

1. A client or freelancer interacts with the React user interface.
2. The frontend sends an HTTP or HTTPS request to the appropriate backend API endpoint.
3. Express.js routes the request to the relevant controller, applying the required middleware.
4. The backend processes the request and interacts with the applicable data source or model.
5. The backend returns a response to the frontend.
6. The frontend updates the user interface based on the response.

This separation of responsibilities improves maintainability, supports modular development, and allows the frontend and backend to evolve independently.

## Security Decisions

### Password Hashing

Prevents passwords from being stored as plain text.

### JWT Authentication

Ensures protected API requests can only be accessed by authenticated users.

### Role-Based Access Control

Role-based access control is used to ensure that users can only perform actions permitted for their role.

The main roles are:

- Client.
- Freelancer.

### Resource Ownership

The application checks whether a resource belongs to the authenticated user before allowing sensitive operations. This protects the system against unauthorized access to resources.

### Input Validation

Prevents invalid or potentially malicious input from being processed.

### HTTPS/TLS

Encrypts communication between the frontend and backend.

### Error Handling

Prevents internal system information from being exposed through error responses.

### Environment Variables

Keeps sensitive configuration and secrets outside the source code.

### .gitignore

Prevents sensitive files such as .env from being committed to the repository.

---

## 2. MERN Architecture

### 2.1 Architecture Overview

**React.js (Frontend)**

↓

**HTTPS/TLS**

↓

**Node.js + Express.js (Backend)**

- Authentication
- User/Role Management
- Gig Management
- Booking Management
- Transaction Management
- Messages
- Notifications
- Security Middleware

↓

**MongoDB (Database)**

## Running the application
### Backend:
**Prerequisites:**
Required software:
•	Node.js.
•	npm.
•	Visual Studio Code.
•	Git.
•	MongoDB.

**Install backend dependencies:**
1.	Open a terminal to navigate to backend folder: cd backend
2.	Install dependencies: npm install
Environment variables:
Copy and paste the .env file available in arc into the program opened in Visual Studio Code.

**Start the backend:**
The start command is defined in package.json (node server.js).

### Frontend:
1.	Open a terminal to navigate to backend folder: cd frontend
2.	Install dependencies: npm install

**Start the frontend:**
The start command is npm run dev or npm start. The frontend communicates with backend API.

## Testing

For part 2, testing was extended include both the backend and frontend components.

### Backend API Testing

Tested using Postman.

The Postman collection covers key endpoints including:

- Registration.
- Login.
- Authentication.
- Gig creation.
- Gig retrieval.
- Gig updating.
- Gig deletion.
- Booking creation.
- Booking retrieval.
- Transaction creation.
- Protected routes.
- Invalid requests.
- Unauthorised requests.

### Frontend Testing

The frontend includes basic automated tests to demonstrate component rendering and user interaction.

Testing includes functionality such as:

- Component rendering.
- Form interaction.
- User input.
- Authentication-related interactions.
- Booking-related interactions.

The frontend tests can be executed using the testing command configured in the React project.

### Newman Testing

The newman tests verify that the API endpoints return the expected response and that operations are protected and reject authorized requests.

Newman is used to execute the Postman collection from the command line:

```bash
newman run "HustleHub+2.postman_collection.json" -e "HustleHub Local.postman_enviroment.json"
```

### Security and Authorization Testing

Testing also includes unauthorised and invalid scenarios.

Examples include:

- Registering with invalid information.
- Logging in with incorrect credentials.
- Accessing protected endpoints without a JWT.
- Using an invalid JWT.
- Attempting to modify another user's gig.
- Attempting to delete another user's gig.
- Attempting to access another user's resources.
- Submitting invalid gig information.
- Submitting invalid booking information.
- Exceeding configured rate limits.

These tests demonstrate that authentication, authorisation, validation and ownership controls are applied to sensitive operations.

---

## Demonstration Video

The demonstration video showcases the key features and functionality of HustleHub+, including the client and freelancer interfaces.

**YouTube Link:** [Watch the HustleHub+ Demonstration Video](https://youtu.be/VDY50vO1tt0)

## 3. Conclusion

HustleHub+ has been extended from the Part 1 authentication backend into a full-stack freelance marketplace application.

The Part 2 implementation provides clients with the ability to browse gigs and create bookings, while freelancers can create and manage their own gigs and view bookings and income generated from those bookings. Each successful booking creates an associated transaction record, allowing the system to track marketplace activity and freelancer income.

Security has been applied throughout the application through JWT authentication, role-based access control, resource ownership checks, password hashing, input validation and HTTPS/TLS, and controlled error handling.

The frontend provides the user interface while the Node.js and Express.js backend provides the REST API and business logic. Testing has been expanded to include Postman, Newman and frontend tests.

---
---

# <u>POE Final (Part 3)</u>

# HustleHub+ Security Review

## 1. Introduction

Security was an important consideration during the development of HustleHub+, a freelance marketplace platform designed to connect freelancers with clients. The platform allows freelancers to advertise their services and clients to browse and book these services. It also records financial transactions generated through bookings and provides users with information about their income and estimated tax obligations.

HustleHub+ processes sensitive information, including user credentials, booking records, financial transactions and income-related data, and because of that appropriate security measures are essential to protecting user privacy, preventing unauthorised access and maintaining the reliability of the platform.

Web applications face several security threats, including injection attacks, broken access control and authentication vulnerabilities. These threats can lead to unauthorised access, information disclosure and the manipulation of application data (OWASP Foundation, 2025).

This security review identifies the security features implemented in HustleHub+, discusses common security threats and explains how implemented controls help mitigate them. It also considers application logging, Docker containerisation and Continuous Integration (CI) as part of the project's security and development practices.

## 2. Additional Security Features Implemented

Two additional security features were implemented in HustleHub+ to improve account protection. These features are Two-Factor Authentication (2FA) and Change Password functionality.

### 2.1 Two-Factor Authentication (2FA)

Two-Factor Authentication was implemented to strengthen the authentication process and reduce the risk of unauthorised account access.

Password-based authentication can be vulnerable when login credentials are stolen, guessed or exposed through data breaches. Two-Factor Authentication reduces reliance on passwords by requiring an additional form of identity verification.

Multi-factor authentication strengthens account security by requiring users to prove their identity through separate authentication factors, making it more difficult for attackers to gain access using compromised credentials alone (OWASP Foundation, 2026).

In HustleHub+, 2FA provides an additional layer of account protection. This is particularly important because user accounts may contain personal information, booking records and financial details.

The effectiveness of this feature depends on the secure enforcement of the second authentication factor. Testing confirms that users cannot bypass the additional verification step.

### 2.2 Change Password Functionality

A Change Password feature was implemented to allow registered users to update their account passwords.

This functionality allows users to replace passwords that may have been compromised or are no longer considered secure. Weak authentication mechanisms and insecure password management can increase the possibility of unauthorised account access (OWASP Foundation, 2025).

The Change Password feature contributes to mitigating these risks by giving users the ability to update their account credentials. The password-change process also includes appropriate identity verification between a freelancer and a client, secure password hashing and protection against unauthorised password modifications.

Together, Two-Factor Authentication and Change Password functionality strengthen user account protection and fulfil the requirement to implement two additional security features (OWASP Foundation, 2026).

## 3. Security Threats and Mitigation Measures

HustleHub+ may be exposed to various security threats because users interact with personal information, booking details and financial records.

The following sections identify relevant threats, explain how implemented security controls mitigate them and highlight areas requiring further verification.

### 3.1 Authentication Weaknesses and Unauthorised Access

**Threat** - Attackers may attempt to gain unauthorised access to accounts through stolen login credentials, guessed passwords or compromised authentication information.

**Implemented Security Control** - Two-Factor Authentication (2FA).

**Mitigation** - HustleHub+ implements Two-Factor Authentication to introduce an additional identity-verification step during the authentication process.

This reduces the risk of account takeover because possession of a user's password alone should not be sufficient to complete authentication when the second factor is properly enforced. Multi-factor authentication is an important security measure against credential-based attacks because it introduces an additional verification requirement (OWASP Foundation, 2026).

By implementing 2FA, HustleHub+ strengthens account authentication and helps protect sensitive user information against unauthorised access. Testing verifies that this authentication step cannot be bypassed.

### 3.2 Compromised Passwords

**Threat** - Users may continue using passwords that have been exposed or compromised, increasing the likelihood of unauthorised account access.

**Implemented Security Control** - Change Password functionality.

**Mitigation** - HustleHub+ provides users with the ability to change their passwords.This allows users to replace potentially compromised credentials and maintain greater control over their account security.

Insecure password storage, weak authentication processes and ineffective credential management are important risks that web applications must address (OWASP Foundation, 2025). The Change Password feature contributes to reducing these risks by enabling users to update credentials when necessary.

### 3.3 Injection Attacks

**Threat** - Injection attacks occur when malicious input is processed by an application in a manner that allows unintended commands or database operations.

HustleHub+ uses a Node.js and Express backend that communicates with MongoDB. Consequently, NoSQL injection represents a potential security concern. Attackers could attempt to manipulate information submitted through login requests, booking forms or other API endpoints to interfere with database operations.

Injection attacks can occur when untrusted data is not correctly validated or is incorporated into commands and queries without appropriate safeguards (OWASP Foundation, 2025).

**Required Security Control** - Server-side input validation and secure MongoDB query handling.

**Mitigation** - The Node.js and Express backend validate incoming requests and ensure that submitted information follows the expected format and data type.

Database queries are constructed securely so that untrusted input cannot control query operators or manipulate database operations. These measures help reduce the risk of unauthorised data access, modification or disclosure (OWASP Foundation, 2025).

### 3.4 Cross-Site Scripting (XSS)

**Threat** - Cross-Site Scripting occurs when an attacker introduces malicious scripts into content that is displayed within another user's browser, because HustleHub+ allows freelancers to create service listings and users to interact with user-generated information, malicious scripts could potentially be introduced through editable fields.

For example, an attacker could attempt to insert JavaScript into a service description or profile field.

Cross-Site Scripting is recognised as an injection-related security vulnerability that may allow malicious content to execute within a user's browser (OWASP Foundation, 2025).

**Required Security Control** - Safe frontend rendering, input validation and appropriate sanitisation.

**Mitigation** - HustleHub+ uses React for its frontend. The application ensures that user-generated content is displayed using safe rendering mechanisms. Any functionality that processes user-supplied HTML applies appropriate sanitisation to prevent malicious scripts from executing.

These measures help protect users from browser-based attacks and reduce the possibility of malicious content affecting application interactions.

Further testing has been done to confirm the effectiveness of XSS protection across service listings, freelancer profiles and other user-controlled fields.

### 3.5 Broken Access Control

**Threat** - Broken access control occurs when users gain access to information or application functionality beyond their authorised permissions. This is particularly important for HustleHub+ because users interact with private account information, bookings, earnings and financial records.

For example, one user should not be able to access another user's financial information or modify bookings that do not belong to them. Broken access control can result in unauthorised information disclosure, modification or destruction when appropriate permission checks are not enforced (OWASP Foundation, 2025).

**Required Security Control** - Backend authorisation and record-ownership verification.

**Mitigation** - The Node.js and Express backend should verify user permissions before allowing access to protected resources. Access restrictions should be enforced through backend API endpoints rather than relying exclusively on frontend restrictions.

This helps prevent users from accessing unauthorised information by manipulating URLs, record identifiers or API requests (OWASP Foundation, 2025).

Further testing has been done to confirm that users cannot access or modify information belonging to other accounts without the appropriate permissions.

### 3.6 Suspicious Activity and Security Monitoring

**Threat** - Suspicious login attempts, unusual transactions, unauthorised activities and system errors may remain undetected without effective monitoring.

**Implemented Security Control** - Application logging.

**Mitigation** - Logging provides a mechanism for recording important application events, allowing developers to investigate suspicious behaviour and identify unexpected system activity. Security logging is important because recorded events can support incident detection, investigation and the monitoring of application behaviour (OWASP Foundation, 2026).

In HustleHub+, application logging contributes to monitoring and troubleshooting. The project's required logging coverage includes login attempts, bookings, transactions and application errors.

### 3.7 Application Integration and Software Reliability

**Threat** - Application changes may introduce software defects, configuration problems or regressions that affect reliability and potentially weaken existing security functionality.

**Implemented Security Controls** - Docker containerisation and GitHub Continuous Integration (CI).

**Mitigation** - Docker packages the React frontend and Node.js/Express backend into runnable containers, supporting consistent application environments. The GitHub CI pipeline automatically builds and runs these containers and executes automated tests before code changes are merged.

Automated testing helps identify certain application failures earlier in development, reducing the likelihood of defective changes being integrated without verification (OWASP Foundation, 2025).

## 4. Security Logging and Monitoring

Application logging was implemented as part of HustleHub+'s monitoring functionality. Logging supports application security by providing records that can assist with identifying system errors, reviewing activities and investigating potential incidents.

Application security logs are valuable because they provide information that can be used for operational troubleshooting, security investigations and monitoring unusual behaviour (OWASP Foundation, 2026).

The project's logging requirements identify the following important events.

### 4.1 Login Attempts

Recording successful and unsuccessful login attempts helps identify potential authentication problems and suspicious login behaviour. Repeated unsuccessful login attempts may indicate an attempted brute-force attack. Authentication event logs can help developers investigate unusual account activity and identify patterns that may require further attention (OWASP Foundation, 2026).

### 4.2 Booking Activities

Booking-related logging provides records of important actions performed within the application. These records can assist developers in investigating unexpected booking behaviour, identifying processing errors and reviewing unusual activities (OWASP Foundation, 2026).

### 4.3 Financial Transactions

Transaction logging supports the monitoring of financial operations generated through bookings, because HustleHub+ processes income-related information, transaction events are relevant to investigating errors and reviewing unusual financial activity. However, logs should not expose sensitive financial credentials or authentication information (OWASP Foundation, 2026).

### 4.4 Application Errors

Error logging assists developers in identifying technical problems affecting application functionality.These records support debugging, troubleshooting and the investigation of unexpected system behaviour. Application logs provide important information for diagnosing problems and understanding events surrounding potential security incidents (OWASP Foundation, 2026).

### 4.5 Grafana Monitoring

Grafana also forms part of HustleHub+'s monitoring setup. When connected to an appropriate log data source, Grafana provides a central interface for viewing application logs, investigating errors and analysing system activity. This assists developers in identifying unusual behaviour and reviewing application events (OWASP Foundation, 2026).

### 4.6 Secure Logging Practices

Although logging supports security monitoring, log information must also be protected. Sensitive information such as passwords, authentication codes, access tokens and other confidential credentials should not be recorded in application logs.

The OWASP Foundation (2026) recommends protecting sensitive information in logs and restricting access to recorded security events. The final logging implementation was therefore verified to confirm that relevant events are captured without unnecessarily exposing sensitive user information.

## 5. Docker Containerisation and Continuous Integration Pipeline

Docker containerisation and a Continuous Integration pipeline were implemented to support the development, testing and integration of HustleHub+. These technologies contribute to consistent application execution and automated verification.

### 5.1 Application Architecture

HustleHub+ consists of three main components:

**1). React Frontend**

The React frontend provides the user interface through which freelancers and clients interact with the platform.

**2). Node.js and Express Backend**

The backend receives and processes API requests from the frontend and manages server-side application operations.

**3). MongoDB Database**

MongoDB stores application information, including user-related data, service details, booking records and financial information. The frontend communicates with the backend through API requests, while the backend handles database interactions.

This separation provides a structure for managing server-side operations. However, secure authentication, authorisation and input validation remain necessary to protect sensitive information (OWASP Foundation, 2025).

### 5.2 Docker Containerisation

Docker packages the React frontend and Node.js/Express backend into runnable containers. This allows the application components to execute in defined environments and helps reduce configuration differences during development and testing.

Containerisation supports application consistency, but secure operation also depends on appropriate configuration.

Important security considerations include:

- Keeping container images and software dependencies updated.

- Avoiding hard-coded credentials.

- Protecting sensitive environment variables.

- Restricting unnecessary container permissions.

- Reviewing container configurations for vulnerabilities.

These precautions are relevant because security misconfiguration and software supply chain weaknesses can expose applications to additional risks (OWASP Foundation, 2025).

### 5.3 GitHub Continuous Integration (CI) Pipeline

A Continuous Integration pipeline was implemented using GitHub to automate application building and testing. The CI pipeline builds and runs the Docker containers and executes automated tests before changes are merged.

This supports the development process through:

- **Automated builds:** Verifying that application components can be built successfully.

- **Automated tests:** Checking configured application behaviours and identifying certain software failures.

- **Consistent environments:** Running application components through Docker containers.

- **Early error detection:** Identifying certain problems before changes are merged.

The CI pipeline therefore contributes to application reliability and supports the integration of automated verification into the development process.

However, software supply chain risks remain an important security concern, meaning that automated builds and tests within HustleHub+ are supported by secure dependency management and appropriate security checks (OWASP Foundation, 2025).

### 5.4 Deployment Status

The GitHub CI pipeline currently performs automated building, container execution and testing. It does not publish HustleHub+ to a live production website. Production deployment has not yet been configured.

Consequently, production-specific security measures such as HTTPS configuration, hosting permissions and public infrastructure security have not been assessed in this review.

## 6. Conclusion

The security review of HustleHub+ highlights the importance of protecting sensitive information and maintaining a secure freelance marketplace. The development team implemented Two-Factor Authentication and Change Password functionality as two additional security features.

Two-Factor Authentication strengthens account protection by introducing an additional identity-verification requirement, while Change Password functionality allows users to replace potentially compromised credentials.

Application logging was also implemented to support system monitoring, error investigation and the identification of potentially suspicious activities.

Furthermore, Docker containerisation and the GitHub CI pipeline contribute to consistent application execution, automated testing and early identification of certain development-related problems.

The review identifies injection attacks, cross-site scripting, authentication weaknesses and broken access control as important security threats. These are recognised areas of web application security risk (OWASP Foundation, 2025). The implemented features provide a foundation for strengthening application security.

Overall, HustleHub+ incorporates security considerations into both its application functionality and development practices.

## 7. Reference List

1. OWASP Foundation, 2025. OWASP Top 10:2025. [online] Available at: <https://top10.owasp.org/2025/> [Accessed 09 November 2026].

2. OWASP Foundation, 2026. Logging Cheat Sheet. [online] Available at: <https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html> [Accessed 09 November 2026].

3. OWASP Foundation, 2026. Multifactor Authentication Cheat Sheet. [online] Available at: <https://cheatsheetseries.owasp.org/cheatsheets/Multifactor_Authentication_Cheat_Sheet.html>  [Accessed 09 November 2026].
