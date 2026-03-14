# Technique: Business Rules Analysis (10.9)

10.9                      Business Rules Analysis
                                                                       10.9.1                Purpose
                                                                                             Business rules analysis is used to identify, express, validate, refine, and organize
                                                                                             the rules that shape day-to-day business behaviour and guide operational
                                                                                             business decision making.

                                                                       10.9.2                Description
                                                                                             Business policies and rules guide the day-to-day operation of the business and its
                                                                                             processes, and shape operational business decisions. A business policy is a
                                                                                             directive concerned with broadly controlling, influencing, or regulating the
                                                                                             actions of an enterprise and the people in it. A business rule is a specific, testable
                                                                                             directive that serves as a criterion for guiding behaviour, shaping judgments, or
                                                                                             making decisions. A business rule must be practicable (needing no further


                                                                                                                          240
Techniques                                                                  Business Rules Analysis

             interpretation for use by people in the business) and is always under the control
             of the business.
             Analysis of business rules involves capturing business rules from sources,
             expressing them clearly, validating them with stakeholders, refining them to best
             align with business goals, and organizing them so they can be effectively
             managed and reused. Sources of business rules may be explicit (for example,
             documented business policies, regulations, or contracts) or tacit (for example,
             undocumented stakeholder know-how, generally accepted business practices, or
             norms of the corporate culture). Business rules should be explicit, specific, clear,
             accessible, and single sourced. Basic principles for business rules include:
                • basing them on standard business vocabulary to enable domain subject
                  matter experts to validate them,
                • expressing them separately from how they will be enforced,




                                                                                                      Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                • defining them at the atomic level and in declarative format,
                • separating them from processes they support or constrain,
                • mapping them to decisions the rule supports or constrains, and
                • maintaining them in a manner such that they can be monitored and
                  adapted as business circumstances evolve over time.
             A set of rules for making an operational business decision may be expressed as a
             decision table or decision tree, as described in Decision Analysis (p. 261). The
             number of rules in such a set can be quite large, with a high level of complexity.

   10.9.3    Elements
             Business rules require consistent use of business terms, a glossary of definitions
             for the underlying business concepts, and an understanding of the structural
             connections among the concepts. Reuse of existing terminology from external
             industry associations or internal business glossaries is often advised. Sometimes
             definitions and structures from data dictionaries or data models can be helpful
             (see Data Dictionary (p. 247) and Data Modelling (p. 256)). Business rules should
             be expressed and managed independently of any implementation technology
             since they need to be available for reference by business people. In addition, they
             sometimes will be implemented in multiple platforms or software components.
             There are frequently exceptions to business rules; these should be treated simply
             as additional business rules. Existing business rules should be challenged to
             ensure they align with business goals and remain relevant, especially when new
             solutions emerge.

             .1 Definitional Rules
             Definitional rules shape concepts, or produce knowledge or information. They
             indicate something that is necessarily true (or untrue) about some concept,
             thereby supplementing its definition. In contrast to behavioural rules, which are
             about the behaviour of people, definitional rules represent operational
             knowledge of the organization. Definitional rules cannot be violated but they can


                                         241
                                                                   Business Rules Analysis                                                                              Techniques

                                                                                             be misapplied. An example of a definitional rule is:
                                                                                                A customer must be considered a Preferred Customer if they place more
                                                                                                than 10 orders per month.

                                                                                             Definitional rules often prescribe how information may be derived, inferred or
                                                                                             calculated based on information available to the business. An inference or
                                                                                             calculation may be the result of multiple rules, each building on something
                                                                                             inferred or calculated by some other(s). Sets of definitional rules are often used to
                                                                                             make operational business decisions during some process or upon some event.
                                                                                             An example of a calculation rule is:
                                                                                                An order's local jurisdiction tax amount must be calculated as (sum of the
                                                                                                prices of all the order's taxable ordered items) × local jurisdiction tax rate
                                                                                                amount.




Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                                                                                             .2 Behavioural Rules
                                                                                             Behavioural rules are people rules–even if the behaviour is automated.
                                                                                             Behavioural rules serve to shape (govern) day-to-day business activity. They do so
                                                                                             by placing some obligation or prohibition on conduct, action, practice, or
                                                                                             procedure.
                                                                                             Behavioural rules are rules the organization chooses to enforce as a matter of
                                                                                             policy, often to reduce risk or enhance productivity. They frequently make use of
                                                                                             the information or knowledge produced by definitional rules (which are about
                                                                                             shaping knowledge or information). Behavioural rules are intended to guide the
                                                                                             actions of people working within the organization, or people who interact with it.
                                                                                             They may oblige individuals to perform actions in a certain way, prevent them
                                                                                             from carrying out actions, or prescribe the conditions under which something can
                                                                                             be correctly done. An example of a behavioural rule is:
                                                                                                An order must not be placed when the billing address provided by the
                                                                                                customer does not match the address on file with the credit card provider.

                                                                                             In contrast to definitional rules, behavioural rules are rules that can be violated
                                                                                             directly. By definition, it is always possible to violate a behavioural rule—even if
                                                                                             there are no circumstances under which the organization would approve that,
                                                                                             and despite the fact that the organization takes extraordinary precautions in its
                                                                                             solution to prevent it. Because of this, further analysis should be conducted to
                                                                                             determine how strictly the rule needs to be enforced, what kinds of sanctions
                                                                                             should be imposed when it is violated, and what additional responses to a
                                                                                             violation might be appropriate. Such analysis often leads to specification of
                                                                                             additional rules.
                                                                                             Various levels of enforcement may be specified for a behavioural rule. For
                                                                                             example:
                                                                                                • Allow no violations (strictly enforced).
                                                                                                • Override by authorized actor.
                                                                                                • Override with explanation.


                                                                                                                          242
Techniques                                                                       Collaborative Games

                 • No active enforcement.
             A behavioural rule for which there is no active enforcement is simply a guideline
             that suggests preferred or optimal business behaviour.

   10.9.4    Usage Considerations

             .1 Strengths
             • When enforced and managed by a single enterprise-wide engine, changes to
               business rules can be implemented quickly.
             • A centralized repository creates the ability to reuse business rules across an
               organization.
             • Business rules provide structure to govern business behaviours.




                                                                                                       Complimentary IIBA® Member Copy. Not for Distribution or Resale.
             • Clearly defining and managing business rules allows organizations to make
               changes to policy without altering processes or systems.

             .2 Limitations
             • Organizations may produce lengthy lists of ambiguous business rules.
             • Business rules can contradict one another or produce unanticipated results
               when combined unless validated against one another.
             • If available vocabulary is insufficiently rich, not business-friendly, or poorly
               defined and organized, resulting business rules will be inaccurate or
               contradictory.