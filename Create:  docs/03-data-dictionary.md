# NBHAS Data Dictionary

## Customer

| Field | Type | Notes |
|---|---|---|
| CustomerID | Text | Internal NBHAS customer ID |
| ShopifyCustomerID | Text | Shopify customer ID |
| FirstName | Text | Customer first name |
| LastName | Text | Customer last name |
| Email | Email | Primary matching field |
| Phone | Text | Optional |
| Country | Text | Optional |
| MarketingConsent | Boolean | Required for email results |
| CreatedAt | DateTime | First created |
| Status | Enum | Active / Inactive |

## Core NBHAS Objects

1. Customer
2. Assessment
3. Assessment Session
4. Category
5. Section
6. Symptom
7. Assessment Symptom
8. Recommendation
9. Product
10. Resource
11. Report
12. Communication
13. Shopify Order
14. Assessment Order Link
15. Timeline Event
16. Admin Note
17. Follow-Up Task

---

# Assessment

## Description

Represents a versioned assessment definition.

An Assessment is the template or ruleset used to create Assessment Sessions. It defines the assessment version, available categories, symptoms, scoring rules, recommendation rules, and report templates.

Assessment records are never deleted. Older versions remain available so historical Assessment Sessions remain accurate.

## Relationships

Assessment
- has many Assessment Sessions
- has many Categories
- has many Symptoms
- has many Recommendation Rules

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| AssessmentID | Text | Yes | Internal assessment definition ID |
| Version | Text | Yes | Assessment version, e.g. 2.0.0 |
| Name | Text | Yes | Assessment name |
| Description | Text | No | Internal description |
| Status | Enum | Yes | Draft / Active / Archived |
| EffectiveDate | Date | Yes | Date this version became active |
| RetiredDate | Date | No | Date this version was retired |
| CreatedAt | DateTime | Yes | Created timestamp |
| UpdatedAt | DateTime | Yes | Last updated timestamp |
| Notes | Text | No | Internal notes |

---

# Assessment Session

## Description

Represents one completed customer assessment.

An Assessment Session is permanent and is never edited. If a customer retakes the assessment, a new Assessment Session is created.

## Relationships

Assessment Session
- belongs to Customer
- belongs to Assessment
- belongs to Category
- has many Assessment Symptoms
- has one Recommendation
- has many Reports
- has many Timeline Events
- may link to many Shopify Orders

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| AssessmentSessionID | Text | Yes | Permanent session ID, e.g. NBHAS-000001 |
| AssessmentID | Text | Yes | Assessment version used |
| CustomerID | Text | Yes | Internal NBHAS customer ID |
| ShopifyCustomerID | Text | No | Linked Shopify customer ID |
| CategoryID | Text | Yes | Selected category |
| CompletedAt | DateTime | Yes | Completion timestamp |
| OverallScore | Integer | Yes | Total severity score |
| EmotionalScore | Integer | No | Section score |
| PhysicalScore | Integer | No | Section score |
| SleepScore | Integer | No | Section score |
| MentalScore | Integer | No | Section score |
| MenstrualScore | Integer | No | Section score |
| SexualScore | Integer | No | Section score |
| RecommendationID | Text | Yes | Recommendation issued |
| PDFReportURL | URL | No | Generated PDF report |
| CustomerEmailSent | Boolean | Yes | Whether customer email was sent |
| AdminEmailSent | Boolean | Yes | Whether admin email was sent |
| Status | Enum | Yes | Completed / Voided / Archived |
| CreatedAt | DateTime | Yes | Created timestamp |
| Notes | Text | No | Internal notes |

---

# Category

## Description

Represents the customer’s hormone category selection.

Categories drive recommendation rules, product recommendations, application instructions, and symptom visibility.

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| CategoryID | Text | Yes | CAT-1-1, CAT-1-2, etc. |
| DisplayCode | Text | Yes | 1-1, 1-2, 2-1, etc. |
| Title | Text | Yes | Short customer-facing title |
| Description | Text | Yes | Full category description |
| RecommendedProductID | Text | Yes | Default recommended product |
| RecommendationID | Text | Yes | Recommendation rule |
| Active | Boolean | Yes | Whether category is available |
| SortOrder | Integer | Yes | Display order |
| CreatedAt | DateTime | Yes | Created timestamp |
| UpdatedAt | DateTime | Yes | Last updated timestamp |

