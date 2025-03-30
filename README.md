# Gigschema

## Overview
Gigschema is a web application that enables users to design and generate database schemas interactively using AI. Users answer guided questions posed by an AI model, and based on their responses, a complete database schema (SQL or NoSQL) is generated. Each schema is stored as an individual project, accessible via a unique URL. The system is flexible, allowing users to switch between SQL and NoSQL schemas at any time.

## Features
### Frontend
- **User Interface:**
  - Responsive UI designed for ease of use.
  - Home page with an option to create a new project.
  - Interactive AI-powered session for gathering database requirements.

- **Project Management:**
  - Each generated database schema has its own unique URL.
  - Users can view, edit, and save their schema for future reference.
  - A dropdown menu displays the **four most recent projects** for quick access.
  - Full project history can be accessed using the **History** option.

### Backend
- **API & Data Handling:**
  - Backend service interacts with the AI model and processes user responses.
  - Integration with an AI provider (e.g., OpenAI) to generate schemas dynamically.
  - Proper error handling and data validation.
  - Rate-limited AI interactions to prevent excessive usage.

- **Schema Generation & Storage:**
  - Supports both SQL and NoSQL schema generation, allowing users to switch anytime.
  - Persistent storage for each generated schema.
  - Projects are retrievable via unique project URLs.

### AI Integration
- **Interactive Q&A:**
  - AI asks structured questions to understand project requirements.
  - Generates a relevant and optimized database schema.
  - Users can switch between SQL and NoSQL dynamically.
  - **AI interactions are time-limited** to optimize response efficiency.

## Getting Started
### Prerequisites
- Node.js (v18+)
- Yarn or npm
- A valid API key for an AI model provider (e.g., HuggingFace as used in this project)
- Database setup (MongoDB, PostgreSQL, or preferred storage option)

### Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/yourusername/gigschema.git
   cd gigschema
   ```
2. Install dependencies:
   ```sh
   yarn install
   ```
   or
   ```sh
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file and configure necessary API keys and database credentials:
   ```sh
   NEXT_PUBLIC_AI_API_KEY=your_api_key_here
   DATABASE_URL=your_database_url_here
   ```

### Running the Project
#### Development Mode
```sh
yarn dev
```
OR
```sh
npm run dev
```

#### Production Build
```sh
yarn build && yarn start
```
OR
```sh
npm run build && npm run start
```

## Navigating Through the Project
1. **Create an Account**: Register a new account via the sign-up page.
2. **Verify Your Account**: Check your email for a verification link.
3. **Login**: Access your dashboard after verification.
4. **Create a New Project**: Start a new AI-driven interactive session.
5. **Interact with AI**: Answer guided questions to generate your database schema.
6. **Switch Schema Type**: Seamlessly switch between SQL and NoSQL anytime.
7. **View and Edit Schema**: Retrieve and modify your schema at any time.
8. **Access Recent Projects**: Use the dropdown to quickly load your last four projects.
9. **Search Project History**: Use the **History** option to search for older projects.

## Technology Stack
- **Frontend**: Next.js, React, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: MongoDB/PostgreSQL (depending on SQL/NoSQL selection)
- **AI Integration**: HuggingFace API

## Documentation
- Design Inspiration from [Figma Design Guidelines](https://www.figma.com/design/sTaho4kTFib0OmS5Q1H3pd/Full-Stack-Test)

## Contributing
Feel free to submit issues and pull requests for improvements.

## License
MIT License

---
### Contact & Support
For questions, reach out via [Email](mailto:709bjs@duck.com).

