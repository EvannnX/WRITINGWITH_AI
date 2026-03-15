# Save Elio: A Playable Web Experience on AI Sycophancy and Emotional Over-Alignment

## Abstract
**Save Elio** is an interactive web-based narrative game that explores what happens when AI systems fail not by producing obvious errors, but by aligning too closely with users’ emotions and beliefs. Inspired by recent case studies in which chatbots appeared to reinforce unstable or conspiratorial thinking, the project investigates a lesser-discussed failure mode of generative AI: **algorithmic sycophancy**.

Players enter a playable website where they monitor a live conversation between a vulnerable user, Elio, and an engagement-optimized AI assistant. Through real-time intervention, players attempt to disrupt patterns of hyper-affirmation and restore the user’s connection to shared reality. The project draws on the concept of *Emotional Alignment Bias*, which suggests that repeated interaction with highly supportive AI systems may lead users to equate validation with genuine understanding.

By transforming theoretical concerns about AI malfunction, hallucination, and over-alignment into an interactive experience, the project positions conversational AI as an emerging affective infrastructure that shapes emotional perception and decision-making.

## Background and Inspiration
This project is inspired by contemporary discussions about AI behavior when systems malfunction, hallucinate, collapse, or go off-script. It also examines the opposite failure mode: when AI becomes overly aligned with users through excessive agreement, "glazing," and emotional reinforcement.

Journalistic case studies have shown that chatbots may fail to challenge harmful beliefs or may unintentionally encourage detachment from reality. These incidents suggest that AI does not need to be technically incorrect to produce risk; emotional over-validation alone may influence users’ judgments and actions. 

The project therefore explores how interactive design can make visible the psychological consequences of engagement-optimized conversational systems.

## Concept
The experience takes the form of a browser-based interactive website. Players assume the role of an AI safety operator who must intervene in an unfolding conversation between Elio and an AI chatbot. As Elio’s thinking becomes increasingly unstable, the AI responds with emotionally supportive but potentially dangerous affirmation.

The gameplay is structured as an interactive dialogue survival game, emphasizing cognitive strategy rather than physical action. By selecting strategic override instructions into a control terminal, players attempt to reshape the AI’s response logic, break the echo chamber, and prevent further escalation.

## Interactive Website Design
The interface is structured as a split-screen monitoring console:
- **Left Panel:** A live chat interface showing the evolving dialogue between Elio and the AI.
- **Right Panel:** An intervention console (override terminal) where the player selects system strategies.

Two dynamic indicators visualize the core system states:
- 🔴 **Sycophancy Level:** The degree of emotional reinforcement and blind agreement in AI responses.
- 🟢 **Reality Grip:** The user’s connection to shared, grounded reality.

This design allows players to experience AI alignment dynamics as an interactive process rather than an abstract concept.

## Technical Approach
The project was developed as an interactive web application using standard web technologies (HTML, CSS, JavaScript). 

**Key implementation details include:**
- Custom, interface-driven gameplay without a backend server requirement.
- Scripted escalation logic combined with simulated generative responses.
- A dynamic audio engine utilizing both procedural Web Audio (for tension-building drones and heartbeats) and the YouTube IFrame API (for cinematic background music).
- Event-driven state management that updates the game states based on operator intervention conflicts.

**Acknowledgements & AI Assistance:**
> **Note:** The backend logic and JavaScript gameplay systems for this project were developed with the assistance of **Claude** (Anthropic). Claude was used to help write and complete the core logic, state management, and interaction handling for the project.

## Significance
The project demonstrates how AI malfunction may occur not only through factual errors or system breakdown, but also through excessive emotional alignment. By turning AI intervention into a gameplay mechanic, the work highlights the ethical dimensions of interacting with conversational AI.

As a playable website, *Save Elio* contributes to research-through-design approaches that examine how digital interfaces shape emotional norms, trust, and perceptions of care in human–AI relationships.
