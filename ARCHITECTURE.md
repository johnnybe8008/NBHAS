# NBHAS Architecture

## Purpose

NBHAS is a data-driven menopause assessment platform.

The system separates:

- Clinical knowledge
- Scoring engine
- User interface

to ensure the clinical logic remains independent of Shopify.

## Components

1. Knowledge Base
2. Knowledge Compiler
3. NBHAS Assessment Engine
4. Shopify Interface

## Guiding Principles

- Single source of truth
- KISS
- Stateless engine
- Data-driven rules
- Browser and Node compatible

Your Personal Assessment
        ↓
Tell us a little about yourself
        ↓
Choose the option that best describes you
        ↓
🌿 Emotional Symptoms
        ↓
🧠 Mental & Cognitive Symptoms
        ↓
🌙 Sleep Symptoms
        ↓
💪 Physical Symptoms
        ↓
🌸 Women's Health Symptoms
        ↓
🩸 Menstrual Symptoms
        ↓
❤️ Sexual Health Symptoms
        ↓
🌿 Analyzing Your Responses...
        ↓
Your Personalized Results


NBHAS UI Standards

Colors
-------
Primary Teal: #008C8C

Buttons
--------
Height: 50px
Radius: 10px

Progress
--------
Always below the assessment.
Milestone icons only.
Results icon highlighted.

Transitions
-----------
Fade: 300ms
Results analysis: 2500ms

Cards
-----
Rounded corners
Subtle shadow
Hover lift
