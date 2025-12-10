# GREENCART

## Mini Project Report

### Submitted by

**[Your Name]**  
**Reg. No.: [Your Registration Number]**

In Partial fulfillment for the Award of the Degree of  
**MASTER OF COMPUTER APPLICATIONS (MCA)**

---

**AMAL JYOTHI COLLEGE OF ENGINEERING AUTONOMOUS**  
**KANJIRAPPALLY**

[Approved by AICTE, Accredited by NAAC with A+, Accredited by NBA.  
Koovappally, Kanjirappally, Kottayam, Kerala – 686518]

**2024-2026**

---

## DEPARTMENT OF COMPUTER APPLICATIONS  
AMAL JYOTHI COLLEGE OF ENGINEERING AUTONOMOUS  
KANJIRAPPALLY

---

## CERTIFICATE

This is to certify that the Project report titled **"GREENCART"** is the bona fide work of **[Your Name] (Regno: [Your Registration Number])** carried out in partial fulfillment of the requirements for the award of the Degree of Master of Computer Applications at Amal Jyothi College of Engineering Autonomous, Kanjirappally. The project was undertaken during the period from **July 07, 2025 to October 30, 2025**.

**Ms. Meera Rose Mathew**  
Internal Guide

**Ms. Meera Rose Mathew**  
Coordinator

**Dr. Bijimol TK**  
Head of the Department

---

## DECLARATION

I hereby declare that the project report **"GREENCART"** is a bona fide work done at Amal Jyothi College of Engineering Autonomous, Kanjirappally, towards the partial fulfilment of the requirements for the award of the Master of Computer Applications (MCA) during the period from **July 07, 2025 to October 30, 2025**.

**Date:** 30-10-25  
**Place:** KANJIRAPPALLY

**[Your Name]**  
**Reg: [Your Registration Number]**

---

## ACKNOWLEDGEMENT

First and foremost, I thank God almighty for his eternal love and protection throughout the project. I take this opportunity to express my gratitude to all who helped me in completing this project successfully. It has been said that gratitude is the memory of the heart. I wish to express my sincere gratitude to our Director (Administration) **Rev. Fr. Dr. Roy Abraham Pazhayaparampil** and Principal **Dr. Lillykutty Jacob** for providing good faculty for guidance.

I owe a great depth of gratitude towards our Head of the Department **Dr. Bijimol T K** for helping us. I extend my whole hearted thanks to the project coordinator **Ms. Meera Rose Mathew** for her valuable suggestions and for overwhelming concern and guidance from the beginning to the end of the project. I would also express sincere gratitude to my guide **Ms. Meera Rose Mathew** for her inspiration and helping hand.

I thank our beloved teachers for their cooperation and suggestions that helped me throughout the project. I express my thanks to all my friends and classmates for their interest, dedication, and encouragement shown towards the project. I convey my hearty thanks to my family for the moral support, suggestions, and encouragement to make this venture a success.

**[Your Name]**

---

## ABSTRACT

**GreenCart** is an advanced e-commerce platform designed to promote sustainable agriculture and holistic wellness by connecting organic farmers, herbal product suppliers, eco-conscious consumers, and community health enthusiasts through a unified digital marketplace. The system bridges the gap between traditional agricultural practices and modern digital commerce, ensuring farmers receive fair prices, consumers access authentic organic products, and communities benefit from educational health resources and wellness events.

The **Admin module** functions as the central control hub, managing product listings, vendor approvals, user accounts, order fulfillment, event management, and platform analytics. **Vendors** can list organic products, manage inventory, track sales, and fulfill orders. **Customers** can browse products by category and subcategory, filter by price and ratings, add items to cart or wishlist, make secure payments via Razorpay, track orders, write reviews, and participate in community events. The platform also features a **blog system** for health and wellness content, an **event management system** for community health programs, an **AI-powered chatbot** for customer support using Mistral API, and a **herbal remedies database** with traditional medicinal knowledge.

GreenCart integrates **AI-based product recommendations**, **real-time inventory management**, **secure payment processing**, and **responsive design** for seamless mobile and desktop experiences. The platform is developed using the **MERN-inspired stack** — **React.js** with **Material-UI** for a modern, responsive frontend, **Flask (Python)** for a lightweight and scalable backend, **MongoDB** for flexible NoSQL data storage, and **Redis** for caching and performance optimization. Secure authentication through **JWT tokens** and **Google OAuth** maintains privacy and role-based access across all modules.

By combining sustainable e-commerce, community health education, event coordination, and AI-driven personalization, **GreenCart** builds a transparent and efficient digital ecosystem that empowers organic farmers, promotes healthy living, supports traditional herbal wisdom, and strengthens public awareness of sustainable agriculture and holistic wellness.

---

## CONTENTS

| SL. NO | TOPIC | PAGE NO |
|--------|-------|---------|
| **1** | **INTRODUCTION** | 1 |
| 1.1 | PROJECT OVERVIEW | 2 |
| 1.2 | PROJECT SPECIFICATION | 3 |
| **2** | **SYSTEM STUDY** | 5 |
| 2.1 | INTRODUCTION | 6 |
| 2.2 | LITERATURE REVIEW | 6 |
| 2.3 | DRAWBACKS OF EXISTING SYSTEM | 7 |
| 2.4 | PROPOSED SYSTEM | 7 |
| 2.5 | ADVANTAGES OF PROPOSED SYSTEM | 8 |
| **3** | **REQUIREMENT ANALYSIS** | 9 |
| 3.1 | FEASIBILITY STUDY | 10 |
| 3.1.1 | ECONOMICAL FEASIBILITY | 10 |
| 3.1.2 | TECHNICAL FEASIBILITY | 10 |
| 3.1.3 | BEHAVIORAL FEASIBILITY | 11 |
| 3.1.4 | FEASIBILITY STUDY QUESTIONNAIRE | 11 |
| 3.2 | SYSTEM SPECIFICATION | 13 |
| 3.2.1 | HARDWARE SPECIFICATION | 13 |
| 3.2.2 | SOFTWARE SPECIFICATION | 14 |
| 3.3 | SOFTWARE DESCRIPTION | 14 |
| 3.3.1 | React.js with Material-UI | 14 |
| 3.3.2 | Python with Flask Framework | 15 |
| 3.3.3 | MongoDB | 15 |
| **4** | **SYSTEM DESIGN** | 16 |
| 4.1 | INTRODUCTION | 17 |
| 4.2 | UML DIAGRAM | 17 |
| 4.2.1 | USE CASE DIAGRAM | 18 |
| 4.2.2 | SEQUENCE DIAGRAM | 19 |
| 4.2.3 | STATE CHART DIAGRAM | 20 |
| 4.2.4 | ACTIVITY DIAGRAM | 21 |
| 4.2.5 | CLASS DIAGRAM | 22 |
| 4.2.6 | OBJECT DIAGRAM | 23 |
| 4.2.7 | COMPONENT DIAGRAM | 24 |
| 4.2.8 | DEPLOYMENT DIAGRAM | 25 |
| 4.3 | USER INTERFACE DESIGN | 26 |
| 4.4 | DATABASE DESIGN | 28 |
| **5** | **SYSTEM TESTING** | 31 |
| 5.1 | INTRODUCTION | 32 |
| 5.2 | TEST PLAN | 32 |
| 5.2.1 | UNIT TESTING | 33 |
| 5.2.2 | INTEGRATION TESTING | 33 |
| 5.2.3 | VALIDATION TESTING | 34 |
| 5.2.4 | USER ACCEPTANCE TESTING | 34 |
| 5.2.5 | AUTOMATION TESTING | 35 |
| **6** | **IMPLEMENTATION** | 44 |
| 6.1 | INTRODUCTION | 45 |
| 6.2 | IMPLEMENTATION PROCEDURE | 45 |
| 6.2.1 | USER TRAINING | 45 |
| 6.2.2 | TRAINING ON APPLICATION SOFTWARE | 46 |
| 6.2.3 | SYSTEM MAINTENANCE | 46 |
| **7** | **CONCLUSION & FUTURE SCOPE** | 48 |
| 7.1 | CONCLUSION | 49 |
| 7.2 | FUTURE SCOPE | 49 |
| **8** | **BIBLIOGRAPHY** | 50 |
| **9** | **APPENDIX** | 52 |
| 9.1 | SAMPLE CODE | 53 |
| 9.2 | SCREEN SHOTS | 64 |
| 9.3 | GIT LOG | 67 |

---

## List of Abbreviations

| Abbreviation | Full Form |
|--------------|-----------|
| AI | Artificial Intelligence |
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete |
| CSS | Cascading Style Sheets |
| DB | Database |
| HTML | HyperText Markup Language |
| HTTP | HyperText Transfer Protocol |
| HTTPS | HyperText Transfer Protocol Secure |
| IDE | Integrated Development Environment |
| JSON | JavaScript Object Notation |
| JWT | JSON Web Token |
| MUI | Material-UI |
| NoSQL | Not Only Structured Query Language |
| NPM | Node Package Manager |
| OAuth | Open Authorization |
| OTP | One-Time Password |
| PDF | Portable Document Format |
| REST | Representational State Transfer |
| SDK | Software Development Kit |
| SEO | Search Engine Optimization |
| SSL | Secure Sockets Layer |
| UI/UX | User Interface / User Experience |
| URL | Uniform Resource Locator |

---

# CHAPTER 1

## INTRODUCTION

### 1.1 PROJECT OVERVIEW

---

