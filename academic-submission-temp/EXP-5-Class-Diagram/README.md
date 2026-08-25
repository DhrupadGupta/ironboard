# EXPERIMENT 5 — Class Diagram (IRONBOARD Gym Management System)

> **Temporary academic submission artifact.**
> This directory is a temporary academic submission artifact only. It is **NOT** part of the
> Ironboard production architecture, and it must **NOT** be treated as a source of truth for
> any future implementation, design decision, roadmap or development phase.

| Item | Value |
|---|---|
| Experiment number | **Experiment No. 5** |
| Experiment title | Class Diagram |
| Case study | **IRONBOARD — Gym Management System** |
| Academic source document | `reference/experiments/EXP-5-CLASS.docx` |
| Supporting reference documents | `reference/lab1/I025_Dhrupad Gupta_SE_LAB_1 (1).pdf` (functional user stories + acceptance criteria), `reference/lab2/I025_Dhrupad Gupta_SE_Lab2.pdf` (non-functional requirements), `reference/design/gym-management-homepage-2.html` (case-study framing, platform features), `reference/course-policy/Software-engg-Course Policy_version1-26=27.pdf` (CO-3: apply UML concepts for modeling software functionality) |
| Date of generation | **25 August 2026** |
| Status | **Temporary — academic submission only** |

---

## 1. Required output, as stated by the academic source

`reference/experiments/EXP-5-CLASS.docx` states verbatim:

- **Aim:** "To create a Class Diagram for `<case study name>`"
- **Outcome:** "Identify the various Classes and their association with each other." /
  "Identify the various attributes and functionality of individual classes."
- **Procedure:**
  1. "List down the various classes for the system according to the guidelines provided."
  2. "Decide the attributes for these Classes and the relationships between them."
  3. "Prepare the Class diagram."
- **Output:** "Class diagram for the system."

The document prescribes **six class-selection characteristics** — *retained information,
needed services, multiple attributes, common attributes, common operations, essential
requirements* — and **four categories of operations**: operations that change the state of an
object (add / delete / modify), operations that perform a computation, operations that inquire
about the state of an object, and operations that monitor an object for a controlling event.
It also instructs that attributes are the nouns from a grammatical parse that belong to a
class, and that operations come from circling the verbs of the problem domain.

## 2. How the classes were selected (the source's own method)

A grammatical parse of the 25 Lab 1 user stories and their acceptance criteria was used:
nouns became candidate classes/attributes, verbs became candidate operations, and each
candidate was tested against the six characteristics. Candidates that failed were rejected —
for example *"welcome e-mail"*, *"renewal reminder"* and *"payment notice"* were rejected as
separate classes (single-attribute, no independent services) and generalised into one
`Notification` class; *"peak busy hours"* and *"total visits"* were rejected as attributes and
kept as computed results of operations on `AttendanceRecord` / `Branch`.

**This is not the ER / data model converted into classes.** It is the conceptual software-class
view: it adds behaviour-bearing classes that no data model needs (`RevenueReport`,
`Notification`, `ActivityLog`, `UserAccount`), it adds a generalization hierarchy for the
actors (`Person → Member / Staff → the five departmental roles`), and every class carries the
operations taken from the verbs of the user stories.

## 3. What the diagram contains

**25 classes**, grouped by concern (grouping is a layout aid only and carries no UML meaning):

| Group | Classes |
|---|---|
| People and access | `Person` *(abstract)*, `Member`, `Staff` *(abstract)*, `Receptionist`, `Trainer`, `MembershipManager`, `AccountingExecutive`, `Administrator`, `UserAccount` |
| Membership lifecycle | `MembershipPlan`, `Membership`, `Notification` |
| Training and progress | `MedicalRecord`, `WorkoutPlan`, `Exercise`, `ProgressRecord`, `TrialSession`, `TrainingSession` |
| Billing and accounts | `Payment`, `Invoice`, `Receipt`, `Refund`, `RevenueReport` |
| Branch operations | `Branch`, `AttendanceRecord`, `Equipment`, `MaintenanceSchedule`, `ActivityLog` |

Every class has an attribute compartment and an operation compartment with visibility markers
(`-` private attributes, `+` public operations), parameter lists and return types.

### The four categories of operations are all represented

| Category (from EXP-5) | Examples in the diagram |
|---|---|
| Change the state of an object (add / delete / modify) | `Membership.renew()`, `Membership.cancel()`, `WorkoutPlan.addExercise()`, `WorkoutPlan.removeExercise()`, `Equipment.markInMaintenance()`, `UserAccount.approve()` |
| Perform a computation | `MembershipPlan.calculateExpiryDate()`, `RevenueReport.getNetRevenue()`, `AttendanceRecord.getVisitDuration()`, `Exercise.getVolume()`, `Branch.getDailyFootfall()` |
| Inquire about the state of an object | `Membership.getStatus()`, `Payment.isOverdue()`, `Member.hasMedicalRestriction()`, `MedicalRecord.hasRestriction()`, `ProgressRecord.isTargetAchieved()` |
| Monitor an object for a controlling event | `Membership.isExpiringWithin(days)`, `MaintenanceSchedule.isServiceDue()`, `MembershipManager.trackMembershipStatus()`, `AccountingExecutive.trackOverduePayments()`, `Administrator.monitorDepartmentActivity()` |

### Relationships

- **Generalization (inheritance):** `Person ◁— Member`, `Person ◁— Staff`, and
  `Staff ◁— Receptionist | Trainer | MembershipManager | AccountingExecutive | Administrator`.
  Justified by the source's *common attributes* and *common operations* characteristics —
  all people share identity/contact attributes, all staff share department/designation and
  account status.
- **Composition (filled diamond):** `Person ◆— UserAccount`, `Member ◆— MedicalRecord`,
  `WorkoutPlan ◆— Exercise`, `Equipment ◆— MaintenanceSchedule` (parts do not exist
  independently of the whole).
- **Associations with named roles and multiplicities**, e.g.
  `Member 1 — 1..* Membership`, `MembershipPlan 1 — 0..* Membership`,
  `Membership 1 — 1..* Payment`, `Payment 1 — 0..1 Invoice / Receipt / Refund`,
  `Branch 1 — 1..* Staff`, `Branch 1 — 0..* Member`, `Trainer 1 — 0..* WorkoutPlan`,
  `Receptionist 1 — 0..* TrialSession`, `Administrator 1 — 0..* UserAccount` (approves).
- **Multiplicities** are shown at both ends of every association.

### Traceability of a few representative classes

| Class | Origin in the reference material |
|---|---|
| `Member`, `UserAccount` | Reception Story 1 (Member ID, welcome e-mail); Administration Story 1 ("approve", "activate the account and send login details") |
| `MembershipPlan`, `Membership` | Membership Mgmt Stories 1–5 (price, duration, access rules, expiry, Active/Expired/Cancelled) |
| `Payment`, `Invoice`, `Receipt`, `Refund`, `RevenueReport` | Accounting Stories 1–5 (cash/card/online, PDF invoice, receipt printing, refund logging, income / refunds / pending) |
| `WorkoutPlan`, `Exercise`, `ProgressRecord` | Trainer Stories 1, 2, 4 (plan linked to profile, weight/measurements, sets and reps) |
| `MedicalRecord` | Trainer Story 5 (medical alert before workouts are set) |
| `TrialSession`, `TrainingSession` | Reception Story 3; Trainer Story 3 |
| `AttendanceRecord`, `Branch`, `Equipment`, `MaintenanceSchedule`, `ActivityLog` | Administration Stories 2–5 (branches, recurring service schedule, daily attendance, department summaries) |
| `Notification` | Reception Story 1, Membership Story 4, Accounting Story 5 (welcome e-mail, renewal reminder e-mail/SMS, payment notices) |

### UML elements used

Three-compartment class boxes (name / attributes / operations) · abstract classes in italics ·
visibility markers · typed attributes and typed operation signatures · generalization (hollow
triangle) · composition (filled diamond) · associations with reading-direction labels ·
multiplicities at both ends · notation legend.

## 4. Assumptions (reference material was silent on these)

1. **Attribute types.** `EXP-5-CLASS.docx` does not require data types, but conceptual types
   (`String`, `int`, `Date`, `DateTime`, `Decimal`, `boolean`) were added for readability.
   They are conceptual, not a database or Prisma schema.
2. **Status values as strings.** `status` / `role` / `mode` are typed `String` rather than as
   enumerations, because the source material never enumerates a fixed, complete set of values
   (Lab 1 mentions Active, Expired, Cancelled, Pending; cash, card, online).
3. **`UserAccount` as a separate class.** Lab 1's Administration Story 1 and Lab 2's
   security constraints imply authentication and authorisation, but no story describes login
   directly; `UserAccount` is modelled as a composition of `Person` for the "approve staff
   accounts" and "authorized personnel only" requirements.
4. **`Receipt` kept separate from `Invoice`.** Lab 1 treats "print payment receipts"
   (Reception) and "generate invoices" (Accounting) as two different stories owned by two
   different departments, so they are two classes.
5. **Departmental grouping.** The five groups mirror the five departments in Lab 1; they are
   drawn only as a `together` layout hint, not as UML packages, so no package semantics are
   implied.
6. **No implementation classes.** Controllers, services, repositories, DTOs, framework or
   database classes are deliberately excluded: EXP-5 asks for the conceptual classes,
   attributes and functionality of the system.

## 5. Files

| File | Description |
|---|---|
| `class-diagram.puml` | PlantUML source (UML class diagram) |
| `class-diagram.png` | Rendered diagram, 3793 × 1948 px |
| `README.md` | This file |

### Re-rendering

```bash
java -DPLANTUML_LIMIT_SIZE=20000 -jar plantuml.jar -tpng class-diagram.puml
```

Rendered with PlantUML 1.2025.4 and Graphviz 2.43.0. The PNG was visually inspected after
rendering (full view plus native-resolution crops) for overlapping elements, clipped labels,
unreadable text, broken relationships and excessive line crossings.

---

**Temporary academic submission artifact — Experiment 5. Generated 25 August 2026.
Not production documentation. Not an implementation source of truth.**
