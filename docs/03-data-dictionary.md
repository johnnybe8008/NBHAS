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

---

# Section

## Description

Groups symptoms into customer-friendly areas such as Emotional, Physical, Sleep, Mental, Menstrual, and Sexual.

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| SectionID | Text | Yes | SEC-EMOTIONAL, SEC-PHYSICAL, etc. |
| Name | Text | Yes | Customer-facing section name |
| Description | Text | No | Internal or customer-facing explanation |
| SortOrder | Integer | Yes | Display order |
| Active | Boolean | Yes | Whether section is active |

---

# Symptom

## Description

Represents one master symptom in NBHAS.

Symptoms are static master records. Customer severity is not stored here; it is stored in Assessment Symptom.

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| SymptomID | Text | Yes | SYM-0001, SYM-0002, etc. |
| SectionID | Text | Yes | Section this symptom belongs to |
| DisplayName | Text | Yes | Customer-facing symptom name |
| OriginalPDFName | Text | No | Original wording from legacy PDF |
| NormalizedName | Text | No | Cleaned internal wording |
| Description | Text | No | Optional explanation |
| SortOrder | Integer | Yes | Alphabetical or manual section order |
| Active | Boolean | Yes | Whether symptom is active |

---

# Category Symptom

## Description

Links Categories to Symptoms.

This allows each category to show a different symptom subset without duplicating symptom records.

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| CategorySymptomID | Text | Yes | CSY-000001 |
| CategoryID | Text | Yes | Linked category |
| SymptomID | Text | Yes | Linked symptom |
| Required | Boolean | Yes | Whether symptom should always appear |
| SortOverride | Integer | No | Optional category-specific display order |
| Active | Boolean | Yes | Whether this link is active |

---

# Assessment Symptom

## Description

Stores a customer's severity response for one symptom within one Assessment Session.

This is where progress tracking is made possible.

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| AssessmentSymptomID | Text | Yes | ASY-000001 |
| AssessmentSessionID | Text | Yes | Linked assessment session |
| SymptomID | Text | Yes | Linked master symptom |
| Severity | Enum | Yes | None / Mild / Moderate / Severe |
| SeverityScore | Integer | Yes | None=0, Mild=1, Moderate=2, Severe=3 |
| CreatedAt | DateTime | Yes | Created timestamp |

# Recommendation

## Description

Represents the complete recommended treatment protocol generated from an Assessment Session.

A Recommendation may include one or more products, educational resources, application instructions, follow-up schedules, and communications.

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| RecommendationID | Text | Yes | REC-000001 |
| Name | Text | Yes | Recommendation name |
| Description | Text | Yes | Internal description |
| ApplicationInstructions | Long Text | Yes | Product application instructions |
| EmailTemplateID | Text | Yes | Customer email template |
| PDFTemplateID | Text | Yes | PDF template |
| Active | Boolean | Yes | Active recommendation |
| CreatedAt | DateTime | Yes | Created timestamp |
| UpdatedAt | DateTime | Yes | Last updated |

# Product

## Description

Represents a Shopify product referenced by NBHAS.

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| ProductID | Text | Yes | Shopify Product ID |
| SKU | Text | No | Product SKU |
| ProductName | Text | Yes | Display name |
| ProductURL | URL | Yes | Shopify product URL |
| Active | Boolean | Yes | Product available |

# Recommendation Product

## Description

Links Recommendations to Products.

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| RecommendationProductID | Text | Yes | RPD-000001 |
| RecommendationID | Text | Yes | Linked recommendation |
| ProductID | Text | Yes | Linked Shopify product |
| DisplayOrder | Integer | Yes | Display order |
| PrimaryProduct | Boolean | Yes | Main recommendation |

# Resource

## Description

Educational material available to customers.

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| ResourceID | Text | Yes | RES-000001 |
| Title | Text | Yes | Resource title |
| Type | Enum | Yes | Article, PDF, Video, Glossary, Library |
| URL | URL | Yes | Resource location |
| Description | Text | No | Summary |
| Active | Boolean | Yes | Resource available |

# Recommendation Resource

## Description

Links Recommendations to educational resources.

## Fields

| Field | Type | Required | Description |
|---|---|---|---|
| RecommendationResourceID | Text | Yes | RRS-000001 |
| RecommendationID | Text | Yes | Recommendation |
| ResourceID | Text | Yes | Resource |
| DisplayOrder | Integer | Yes | Display sequence |
| Required | Boolean | Yes | Always include |

