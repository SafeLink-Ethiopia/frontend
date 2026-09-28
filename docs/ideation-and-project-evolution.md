# SafeLink — Ideation & Project Evolution

**Project:** SafeLink
**Team:** Andalus
**Team Members:** Hayat Nura, Marya Tawfik, Nuha Samson, Sifen Beyan
**Event:** STARK Hackathon 2026

---

## 1. The Problem We Started With

**Our starting point was a simple question:**

> **What happens when someone experiencing sexual or gender-based violence needs help, but the existing ways of reaching that help are difficult, intimidating, inaccessible, or require more information than they are comfortable providing?**

We identified several barriers that can exist at the same time.

**People may:**

* fear stigma or exposure;
* be uncomfortable providing their real name;
* not know which service they should contact;
* have limited access to appropriate support services;
* live in rural or underserved areas;
* face language barriers when using digital services;
* have limited digital literacy;
* have limited or unreliable access to technology and the internet;
* need guidance from a real person rather than only information.

We therefore did not want to approach the problem as simply **"build an AI assistant for violence-related questions."**

The larger problem we were interested in was the gap between a person who needs help and the digital systems through which that help is normally accessed.

---

## 2. Early Idea Exploration

During the early ideation stage, we explored multiple technology-based approaches.

Several of the early concepts were primarily AI-based. These included approaches where an AI system would provide information, answer questions, or act as the main support mechanism.

These ideas were useful during brainstorming because they helped us identify what technology could potentially do.

However, as we evaluated them against the actual problem, we became less interested in making AI the center of the solution.

The important question became:

> **Would an AI-first solution actually solve the barriers we had identified?**

For our target users, the answer was not always yes.

An AI system could provide information, but information alone does not necessarily solve:

* lack of trust;
* privacy concerns;
* language barriers;
* limited digital familiarity;
* uncertainty about which service to use;
* the need for human guidance;
* difficulty moving from **"I need help"** to **"I know what to do next."**

This led us to reconsider the direction of the project.

---

## 3. Why We Moved Away From the Early AI-Based Ideas

We did not reject AI because AI is inherently unsuitable.

We rejected an AI-first approach because it did not sufficiently address the complete access problem we were trying to solve.

Our reasoning was:

> **Information is not the same as support.**

A person may know that help exists and still not know:

* where to go;
* who to contact;
* what type of assistance they need;
* whether they can safely disclose their identity;
* what to do after asking for help.

We therefore moved toward a system where technology would reduce the barriers to reaching appropriate human support rather than attempting to replace human support.

This became an important design principle for SafeLink.

---

## 4. The SafeLink Concept Emerges

From this exploration, SafeLink evolved into a privacy-first support platform.

The central concept became:

> **A person should be able to say what they need, create a private SafeLink session without providing their name, request appropriate support, and connect with a human advisor who can guide them toward the next step.**

This led to the core SafeLink flow:

**Private SafeLink Session**
             ↓
**Express what help is needed**
             ↓
**Request Human Support**
             ↓
**Advisor Conversation**
             ↓
**Guidance / Facility Recommendation**

The system was designed around reducing unnecessary barriers rather than collecting more information.

A SafeLink session uses a generated SafeLink ID and an optional password instead of requiring a person's name, phone number, or email.

---

## 5. Accessibility Became a Core Design Consideration

As the idea developed, we recognized that accessibility was not only about whether a website technically works.

The digital divide can also involve:

* language;
* digital literacy;
* familiarity with online services;
* access to appropriate devices;
* confidence navigating complex interfaces.

This was particularly important when thinking about rural and underserved communities, while still being relevant to people in urban areas.

This influenced our decision to make the interaction simple and direct.

Instead of expecting a person to understand a complicated service directory or choose from many unfamiliar systems, the intended experience is closer to:

> **"I need help."**

SafeLink then helps connect that request to an appropriate human support pathway.

---

## 6. Research and Evidence

During our ideation and development process, we researched the problem and explored relevant topics surrounding it, including consent, boundaries, harassment, support, and accessibility.

ScholarXIV was one of the resources we used during this process.

We researched the problem and relevant topics, but we did not find one paper that directly represented the exact SafeLink concept.

Instead, the research helped us better understand the surrounding issues and the challenges that people may face when seeking support. These included topics such as consent, boundaries, harassment, support systems, and accessibility.

We therefore do **not** claim that one paper "proves" or directly validates the SafeLink concept.

Instead, the research is documented as part of our broader research and exploration process.

Our product idea came from identifying a practical access and support problem and thinking about how technology could reduce those barriers.

Where research or external resources influenced a specific design decision, we document that connection rather than claiming that a single resource validates the entire product.

---

## 7. From Idea to MVP

Once the core direction was established, we deliberately reduced the scope to a focused MVP.

The MVP centered on the most important part of the problem:

> **Can someone reach appropriate human support through a private and simple digital interaction?**

The resulting MVP flow became:

1. **Enter SafeLink.**
2. **Create or access a private SafeLink session.**
3. **Avoid requiring a real name.**
4. **Request medical support.**
5. **Create a conversation with an advisor.**
6. **Allow the advisor and user to communicate.**
7. **Allow the advisor to provide a relevant facility recommendation.**
8. **Allow the user to leave quickly when necessary.**

This kept the prototype focused on the central support pathway rather than attempting to build an entire national support infrastructure.

---

## 8. Prototype Development

The implementation evolved across the frontend and backend repositories of the SafeLink-Ethiopia organization.

The backend provides the session and conversation APIs, while the frontend provides the user and advisor experiences.

The private-session system stores a SafeLink ID rather than requiring personally identifying information.

The conversation system connects a user request to an advisor and supports messages between the two sides.

The advisor can also provide facility recommendations through the conversation workflow.

**The project was developed using:**

* React;
* TypeScript;
* Tailwind CSS;
* Express;
* MongoDB;
* REST APIs;
* Voxide for voice interaction.

---

## 9. Iteration Through Testing

The project did not remain identical to the first implementation.

As we tested the MVP, we discovered practical problems in the communication workflow.

**Examples included:**

* difficulty opening the correct conversation;
* conversation ID handling;
* retrieving existing conversations;
* advisor-side conversation management;
* message timestamps;
* message editing;
* message deletion;
* selected-message management;
* maintaining conversation state;
* handling frontend/backend communication errors.

These findings led us to improve the conversation workflow and user experience rather than treating the first implementation as final.

The advisor-user communication system consequently became a larger part of the MVP iteration.

---

## 10. Current Product Direction

SafeLink's current direction is built around four principles.

### Privacy

A person should not need to provide their name simply to begin seeking support.

### Accessibility

The interaction should be understandable and usable even for people who may face language or digital-literacy barriers.

### Human Support

Technology should help a person reach appropriate human guidance rather than assuming that an automated system can replace that support.

### Practical Next Steps

The goal is not only to tell someone that help exists.

The system should help move the person toward a concrete next step, such as connecting with an advisor and receiving a relevant facility recommendation.

---

## 11. What We Learned From the Ideation Process

The most important change in our thinking was moving from:

> **"Can we build an AI system that answers questions about violence?"**

toward:

> **"How can we reduce the barriers that prevent someone from safely reaching the right human support?"**

That change shaped the final SafeLink concept.

AI-based ideas were part of our exploration, but they were not the final direction because they did not fully address the accessibility, language, digital-literacy, and human-support barriers we were trying to solve.

SafeLink therefore became a privacy-first bridge between a person seeking help and a human advisor.

---

## 13. Final Evolution Summary

The evolution of SafeLink can be summarized as:

                                                                     **Problem Identification**
                                                                                 ↓
                          Identified barriers around privacy, stigma, accessibility, language, digital literacy, service access, and uncertainty.

                                                                                 ↓
                                                                       **Early Exploration**
                                                                                 ↓
                                                    Explored several technology-based and AI-centered approaches.

                                                                                 ↓

                                                                          **Evaluation**
                                                                                 ↓
                                 Recognized that providing information alone did not address the complete access and support problem.

                                                                                 ↓

                                                                           **Reframing**
                                                                                ↓
                                    Shifted the focus from replacing human support to reducing barriers to reaching human support.

                                                                                ↓

                                                                       **SafeLink Concept**
                                                                                ↓
                                Designed a privacy-first session that does not require a person's name and connects them to an advisor.

                                                                                ↓

                                                                             **MVP**
                                                                                ↓
                                  Private session → request support → advisor conversation → facility recommendation → quick exit.

                                                                                ↓

                                                                          **Iteration**
                                                                                ↓
                              Tested the product, identified communication and conversation-management problems, and improved the workflow.

                                                                                ↓

                                                                       **Current Direction**
                                                                                ↓
                                    A privacy-first, accessible bridge between people seeking support and appropriate human guidance.
