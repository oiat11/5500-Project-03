# Donor List Automation System

## Project Overview

This is a comprehensive donor management system designed for organizations to efficiently track, manage, and engage with donors and events. The application provides a robust platform for maintaining donor relationships, organizing fundraising events, and analyzing donation patterns.

## Key Features

### Donor Management
- Create and maintain detailed donor profiles
- Track donation history and total contributions
- Categorize donors with customizable tags
- View donor engagement metrics (invitations, attendance)
- Search and filter donors by various criteria

### Event Management
- Create and schedule fundraising events
- Manage event details (date, location, capacity)
- Track event status (draft, published, archived)
- Invite donors to events and track their responses
- Record attendance and participation

### Collaboration
- Add collaborators to events for team management
- Define roles and permissions for event access
- Track changes and edits with a detailed history log
- Maintain accountability with user-specific actions

## Technical Stack

### Frontend
- React.js for the user interface
- Redux for state management
- Shadcn UI components for consistent design
- Lucide icons for visual elements
- React Router for navigation

### Backend
- Node.js with Express.js framework
- Prisma ORM for database operations
- JWT for authentication and authorization
- RESTful API architecture

### Database
- Relational database (MySQL)
- Structured schema for donors, events, and relationships

## Key Components

### User Interface
- **Dashboard**: Overview of donors, events, and key metrics
- **Donor Directory**: Comprehensive list of all donors with filtering
- **Donor Details**: Individual donor profiles with history and metrics
- **Event Management**: Create, edit, and manage fundraising events
- **Event Details**: Comprehensive view of event information and participants
- **Collaborator Management**: Add and manage team members for events

### API Endpoints
- User authentication and management
- Donor CRUD operations
- Event creation and management
- Donor-event relationship management
- Collaborator assignment and permissions
- History and activity logging

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Database (PostgreSQL recommended)

### Installation

1. Clone the repository
```
git clone [repository-url]
```

2. Install dependencies
```
cd client
npm install

cd ../api
npm install
```

3. Set up environment variables
Create `.env` files in both client and api directories with the necessary configuration.

4. Set up the database
```
npx prisma migrate dev
```

5. Start the development servers
```
# In the api directory
npm run dev

# In the client directory
npm run dev
```

## Usage

### User Authentication
- Register a new account or log in with existing credentials
- User sessions are maintained with JWT tokens

### Managing Donors
- Add new donors with contact information and initial donation amounts
- Tag donors for easy categorization and filtering
- View and edit donor profiles
- Track donation history and engagement metrics

### Creating and Managing Events
- Create new events with details like name, date, location, and capacity
- Invite donors to events and track their responses
- Update event status as it progresses
- Record attendance and participation
- Add collaborators to help manage larger events

### Collaboration
- Add team members as collaborators on specific events
- Track changes with the event history feature
- Maintain accountability with user-specific action logging

## Project Structure

```
/
├── client/                  # Frontend React application
│   ├── public/              # Static assets
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── pages/           # Page components
│       ├── redux/           # State management
│       └── utils/           # Utility functions
│
└── api/                     # Backend Node.js application
    ├── controllers/         # Request handlers
    ├── models/              # Data models
    ├── routes/              # API routes
    └── utils/               # Utility functions
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the [MIT License](LICENSE).
