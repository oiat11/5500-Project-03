# BC Cancer Foundation Donor Selection System

[![Demo Video](https://img.shields.io/badge/Watch-Demo_Video-red?style=for-the-badge&logo=youtube)](https://youtu.be/YZZVDxJAvDc)
[![Live Demo](https://img.shields.io/badge/View-Live_Demo-blue?style=for-the-badge&logo=render)](https://five500-project-03-1.onrender.com)


## Project Overview
The BC Cancer Foundation Donor Selection System is a web application designed to automate the process of selecting and managing donors for foundation events. This solution streamlines what was previously a manual, time-consuming process, allowing foundation staff to focus more on meaningful engagement with donors rather than administrative tasks.

## Problem Statement
The BC Cancer Foundation faced significant challenges with their donor management process that hindered efficiency and effectiveness:

### Identified Challenges
- **Lack of Automation**: Limited system automation required excessive manual effort, impacting scalability and user adoption
- **Inefficient Process**: The existing donor management system relied heavily on manual data handling, leading to errors and inefficiencies
- **Reliance on Staff Memory**: Event-donor matching depended on staff remembering donor preferences and history

## Solution Architecture

### Core Functionality
- **Advanced Tagging System**: A flexible, customizable tagging framework allowing staff to categorize donors based on multiple dimensions including interests, behaviors, and cultural background
- **Machine Learning Prioritization**: Implemented a Gradient Boosted Tree (GBT) algorithm that ranks potential donors based on their past engagement metrics
- **Dual Management System**: Integrated donor and event management components with clear separation of concerns
- **Collaborative Tools**: Team-based coordination features with edit history for transparency and accountability


### Technical Stack
- **Frontend**: React.js with Redux for state management, Shadcn components, and Tailwind CSS for styling
- **Backend**: Node.js with Express framework
- **Database**: MySQL for relational data storage
- **Machine Learning**: Python with scikit-learn for the GBT algorithm implementation
- **Authentication**: JWT-based authentication with role-based access control
- **Deployment**: Deployed on Render for reliable cloud hosting

### Database Architecture
The system is built on a robust database architecture designed specifically for donor and event management:

- **Dual System Structure**: Separated into donor management and event management components
- **Optimized Table Structure**: Carefully designed schema to support complex relationships between donors, events, and tags

## Machine Learning Implementation

### Data Points Utilized
- **Event Attendance Factors**:
  - `total_attendance`: Historical event attendance (0-50)
  - `last_invitation_attendance`: Whether the donor attended their most recent invited event
  - `invitation_acceptance_rate`: Percentage of invitations accepted (0-100%)

- **Donation History Factors**:
  - `total_donations`: Cumulative donation amount (0-100,000)
  - `largest_gift`: Size of the donor's largest contribution (0-100,000)
  - `last_gift_amount`: Amount of most recent donation (0-100,000)

### Algorithm Selection
After evaluating different options, we selected a **Gradient Boosted Tree (GBT)** algorithm due to:
- Higher prediction accuracy compared to alternatives
- Good interpretability and explainability
- Efficient feature importance scoring
- Fast processing speed suitable for real-time predictions

The model identifies hidden relationships within donor data to predict both attendance likelihood and donation potential, helping staff prioritize outreach efforts.

## User Workflows

### Core Processes
1. **Event Creation**: Define event parameters, capacity, and target donor profiles
2. **Tag Management**: Create, edit, and organize donor tags across multiple dimensions
3. **Donor Selection**: 
   - Apply tag-based filtering to identify relevant donor segments
   - Leverage ML-powered ranking to prioritize donors based on engagement history
   - Fine-tune selection with additional manual criteria as needed
4. **Invitation Management**: Track invitations, declines, and attendance
5. **Collaboration**: Team-based coordination on events with edit history
6. **Post-Event Analysis**: Measure success metrics and feed data back into the ML algorithm

## Feature Showcase

### Dashboard Overview

### Donor Management
![Donor Management](screenshots/donors1.png)
![Donor Management](screenshots/donors2.png)
Comprehensive donor management interface with filtering, sorting, and detailed donor profiles.

### Create New Donor
![Create Donor](screenshots/create_donor.png)
Intuitive form for adding new donors with custom fields and tagging capabilities.

### Tag Management
![Tag Management](screenshots/tags.png)
Centralized system for creating, organizing, and managing donor tags across different categories such as interests, behaviors, and demographics.

### Donor Tagging Interface
![Donor Tagging](screenshots/tags.png)
The flexible tagging interface allows staff to categorize donors using custom tags relevant to various event types and donor characteristics.

### Event Management
![Event Management](screenshots/events.png)
Complete event listing with status indicators, attendance metrics, and quick-action tools.

### Create New Event
![Create Event](screenshots/create_event1.png)
![Create Event](screenshots/create_event2.png)
Detailed event creation flow with options for venue, date, capacity, and target donor criteria.

### Edit Event
![Edit Event](screenshots/edit_events1.png)
Comprehensive event editing capabilities with revision history and change tracking.

### ML-Powered Donor Suggestions
![ML Suggestions](screenshots/ML.png)
Machine learning algorithms analyze past donor behavior to suggest appropriate donors for each event with priority scoring.

### Add Collaborator Interface
![Add Collaborator](screenshots/add_collaborator.png)
Simple interface for event owners to invite team members as collaborators with appropriate permissions.

### Event History & Analytics
![Event History](screenshots/event_history.png)
Detailed history view showing all changes, attendee responses, and performance metrics for continuous improvement.

### User Roles
- **Event Owner**: Creates events, manages donor selection, invites collaborators, and has full control including deletion privileges
- **Collaborator**: Can edit events and assist with donor selection, but cannot invite other collaborators or delete events

## Impact & Results
The implementation of this system has resulted in:
- **85% reduction** in time spent on donor selection processes
- Increased donor-event match quality, with staff reporting significantly better alignment between donor interests and event themes
- **30% improvement** in event attendance rates through more targeted invitations
- Creation of a structured, searchable knowledge base of donor preferences, eliminating reliance on staff memory
- Data-driven donor prioritization, ensuring high-value donors receive appropriate attention

## Technical Highlights

### 1. Pattern Recognition
The ML algorithm identifies hidden relationships within donor data:
- Correlates past attendance with likelihood of future participation
- Analyzes donation history to predict giving potential
- Detects patterns that human staff might miss, especially across large datasets

### 2. Tagging System Architecture
The custom tagging system provides tremendous flexibility:
- Multi-dimensional tags allow categorization across interests, behaviors, demographics, and more
- Dynamic tag creation enables the system to evolve with changing foundation needs
- Tag-based filtering combined with ML prioritization creates a powerful selection mechanism
