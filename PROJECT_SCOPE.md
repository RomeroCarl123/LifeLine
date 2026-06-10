# LifeLine: Blood Donation and Request Management System

## Project Scope

LifeLine is a web and mobile-ready blood donation coordination system for donors, requesters, and administrators. The current system focuses on account access, donor availability, blood request submission, donor matching, request monitoring, and real-time in-app updates.

The system is scoped for localized donor matching in Valencia City, Bukidnon.

## General Objective

To provide a centralized platform that helps donors, requesters, and administrators manage blood request activities, identify available donors, and reduce response time for urgent blood needs.

## Functional Scope

### 1. User Management Module

**Current Features**

- User registration and login
- Role-based access for Donor, Requester, and Admin
- JWT-based authenticated sessions
- Donor profile creation during registration
- Basic password validation

**Users Involved**

- Donors
- Requesters
- Administrators

**Current Limitations**

- Password recovery is shown in the UI but is not implemented.
- Account verification is not implemented.
- Full profile management is currently available mainly for donor blood type, location, and availability.

### 2. Donor Management Module

**Current Features**

- Donor registration
- Blood type management
- Donor location management
- Availability status updates
- View active approved blood requests that match donor blood type and location
- Accept compatible approved requests

**Outputs**

- Donor profile
- Available donor list
- Matched request list for donors

**Current Limitations**

- Donation history is represented through completed requests, not a dedicated donation-history table.
- Eligibility checking based on donation interval is not implemented.

### 3. Blood Request Module

**Current Features**

- Requesters can submit blood requests.
- Requests include blood type, units needed, urgency level, hospital, location, and contact details.
- Requesters can view active requests and completed request history.
- Admins can approve and progress requests.

**Current Status Flow**

```text
Pending
  |
  v
Approved
  |
  v
In Progress
  |
  v
Completed
```

**Current Limitations**

- Rejected request status is not implemented.
- "Matched with Donor" is represented by `in_progress` after a donor accepts or an admin starts the request.

### 4. Donor Matching Module

**Current Features**

- Matches donors by blood type.
- Filters available donors by location.
- Donor search is limited to Valencia City, Bukidnon.
- Requesters can search nearby available donors.
- Admins can find donors for a request.
- Donors can accept approved compatible requests.

**Outputs**

- List of matched donors
- Donor acceptance updates
- Real-time in-app notifications

**Current Limitations**

- Donor decline flow is not implemented.
- Matching is text-based by location, not GPS radius-based.
- Email and mobile push notifications are not implemented.

### 5. Notification Module

**Current Features**

- Real-time in-app notifications using Socket.IO
- New request notifications
- Request status update notifications
- Donor assignment and donor acceptance notifications

**Current Notification Channel**

- In-app notifications

**Current Limitations**

- Email notifications are not implemented.
- Mobile push notifications are not implemented.
- Donation reminders are not implemented.

### 6. Admin Management Module

**Current Features**

- Admin login through the normal login page
- Admin dashboard
- Request approval
- Request status progression
- Urgency updates
- Donor matching lookup
- Basic analytics cards and request queue monitoring

**Current Limitations**

- User management is not implemented.
- Dedicated inventory management is not implemented.
- Report generation and export are not implemented.

### 7. Analytics Module

**Current Features**

- Total donors
- Available donors
- Active requests
- Urgent cases
- Completed requests
- Request counts by urgency
- Request counts by status
- Top request locations

**Current Limitations**

- Monthly donation trends are not implemented.
- User activity reports are not implemented.
- PDF, Excel, and CSV report exports are not implemented.

## Modules Not Currently Included

The following modules are part of the broader proposed scope but are not implemented in the current system:

- Blood inventory management
- Donated blood unit records
- Blood stock expiration monitoring
- Low-stock alerts
- Report export to PDF, Excel, or CSV
- Email notifications
- Mobile push notifications
- Account verification
- Password recovery
- Donor eligibility based on donation interval
- Hospital billing or payment processing
- Blood laboratory testing
- Ambulance dispatch
- Medical diagnosis or treatment
- Blood transfusion procedure management
- Integration with national blood bank databases

## Current System Flow

```text
User Registration/Login
          |
          v
Select Role
(Donor, Requester, or Admin)
          |
          v
Requester Creates Blood Request
          |
          v
Admin Reviews Request
          |
          v
Request Approved
          |
          v
System Matches Available Donors
in Valencia City, Bukidnon
          |
          v
Donor Accepts Request
          |
          v
Request Moves to In Progress
          |
          v
Admin Marks Request Completed
          |
          v
Dashboard Analytics Updated
```

## Expected Users

### Donors

- Register as donors
- Manage blood type, location, and availability
- View approved compatible requests
- Accept donation requests

### Requesters

- Submit blood requests
- Search available donors in Valencia City, Bukidnon
- Track request progress
- View active and completed request history

### Administrators

- Review and approve requests
- Monitor request queue
- Update request urgency and status
- Find matched donors
- View operational analytics

## Scope Delimitation

LifeLine currently focuses on request coordination and donor matching. It does not perform medical validation, laboratory processing, payment processing, or external blood bank integration.
