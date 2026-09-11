# ORCA — Ocean Risk & Conservation Assistant

> An intelligent maritime assistance platform designed to help fishermen make safer, smarter, and more informed decisions at sea.

---

## The Problem

Fishermen operating at sea often have to make critical decisions with limited access to real-time information.

They need to know:

- Where potential fishing zones are located
- Whether the surrounding sea conditions are safe
- What the current weather and wave conditions look like
- Whether their route passes through restricted or protected areas
- How far a fishing zone is from their current location
- What to do during an emergency
- How to quickly access important information without navigating through complex systems

ORCA brings these capabilities together into a single, easy-to-use platform.

---

## Our Solution

**ORCA (Oceanic Risk & Catch Assistance)** is a maritime intelligence and navigation platform that combines:

- Interactive geospatial maps
- Potential Fishing Zone (PFZ) visualization
- Location-aware navigation
- Marine safety analysis
- Weather and sea-condition information
- Maritime boundary awareness
- SOS emergency assistance
- AI-powered conversational assistance

The goal is simple:

> **Help fishermen find better fishing opportunities while making safer decisions at sea.**

---

## Key Features

### Potential Fishing Zones

ORCA visualizes Potential Fishing Zones (PFZs) on an interactive map.

Users can:

- View PFZ locations
- Select individual PFZs
- View PFZ information
- Calculate distance to a PFZ
- Navigate toward a selected PFZ
- View relevant environmental conditions

PFZ data is integrated from marine data sources and represented as geospatial features.

---

### Intelligent Navigation

ORCA provides navigation from the user's current location to a selected fishing zone.

The navigation system:

1. Detects the user's current location
2. Allows the user to select a PFZ
3. Determines the destination coordinates
4. Calculates a route
5. Displays the route directly on the map
6. Provides distance and estimated travel information

The map uses interactive geospatial visualization so users can understand their surroundings at a glance.

---

### Maritime Safety Analysis

Before heading toward a destination, ORCA can evaluate important safety conditions.

The platform considers information such as:

- Marine Protected Areas (MPAs)
- India's EEZ
- IMBL proximity
- Bathymetry
- Land/sea classification
- Water depth
- Environmental warnings

The system communicates conditions using clear statuses and warnings rather than requiring users to interpret raw geospatial data.

---

### Weather and Marine Conditions

ORCA provides environmental information relevant to fishing and navigation, including:

- Wind conditions
- Wave conditions
- Temperature
- Safety warnings

This information helps users assess whether travelling toward a fishing zone is appropriate.

---

### SOS Emergency Assistance

ORCA includes an SOS feature designed for emergency situations.

The SOS interface provides a fast-access emergency workflow so that users do not need to navigate through multiple screens during a critical situation.

The feature is designed around:

- Quick accessibility
- Clear emergency interaction
- Location awareness
- Minimal user interaction

---

### AI Fishing Assistant

ORCA includes an AI-powered conversational assistant.

Users can interact with the assistant to obtain information related to:

- Fishing
- Marine conditions
- Navigation
- Safety
- Weather
- General fishing-related queries

The assistant is designed to make complex information easier to understand through natural language.

---

## System Architecture

ORCA follows a frontend-backend architecture.

```text
                    ┌─────────────────────┐
                    │      ORCA User      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │                     │
                    │ • Dashboard         │
                    │ • Navigation        │
                    │ • Maps              │
                    │ • PFZ Visualization  │
                    │ • SOS               │
                    │ • AI Assistant      │
                    └──────────┬──────────┘
                               │
                         REST API
                               │
                               ▼
                    ┌─────────────────────┐
                    │   FastAPI Backend   │
                    │                     │
                    │ • PFZ APIs          │
                    │ • Navigation        │
                    │ • Safety Checks     │
                    │ • Boundary Analysis │
                    │ • Weather           │
                    │ • AI Services       │
                    └──────────┬──────────┘
                               │
             ┌─────────────────┼─────────────────┐
             ▼                 ▼                 ▼
      Marine Data         Geospatial         Database
       Sources             Processing
