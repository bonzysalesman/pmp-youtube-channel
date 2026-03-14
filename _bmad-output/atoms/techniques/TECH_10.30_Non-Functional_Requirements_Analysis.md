# Technique: Non-Functional Requirements Analysis (10.30)

10.30                  Non-Functional Requirements Analysis
                                                                      10.30.1             Purpose
                                                                                          Non-functional requirements analysis examines the requirements for a solution
                                                                                          that define how well the functional requirements must perform. It specifies
                                                                                          criteria that can be used to judge the operation of a system rather than specific
                                                                                          behaviours (which are referred to as the functional requirements).

                                                                      10.30.2             Description
                                                                                          Non-functional requirements (also known as quality attributes or quality of service
                                                                                          requirements) are often associated with system solutions, but they also apply
                                                                                          more broadly to both process and people aspects of solutions. They augment the
                                                                                          functional requirements of a solution, identify constraints on those requirements,
                                                                                          or describe quality attributes a solution must exhibit when based on those
                                                                                          functional requirements.
                                                                                          Non-functional requirements are generally expressed in textual formats as
                                                                                          declarative statements or in matrices. Declarative non-functional requirements
                                                                                          statements will typically have a constraining factor to them. For example, errors
                                                                                          must not exceed X per use of the process, transactions must be at least X%
                                                                                          processed after S seconds, or the system must be available X% of the time.




                                                                                                                      302
Techniques                                                   Non-Functional Requirements Analysis

   10.30.3   Elements

             .1 Categories of Non-Functional Requirements
             Common categories of non-functional requirements include:
                • Availability: degree to which the solution is operable and accessible when
                  required for use, often expressed in terms of percent of time the solution is
                  available.
                • Compatibility: degree to which the solution operates effectively with other
                  components in its environment, such as one process with another.
                • Functionality: degree to which the solution functions meet user needs,
                  including aspects of suitability, accuracy, and interoperability.
                • Maintainability: ease with which a solution or component can be




                                                                                                    Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                  modified to correct faults, improve performance or other attributes, or
                  adapt to a changed environment.
                • Performance Efficiency: degree to which a solution or component
                  performs its designated functions with minimum consumption of resources.
                  Can be defined based on the context or period, such as high-peak, mid-
                  peak or off-peak usage.
                • Portability: ease with which a solution or component can be transferred
                  from one environment to another.
                • Reliability: ability of a solution or component to perform its required
                  functions under stated conditions for a specified period of time, such as
                  mean time to failure of a device.
                • Scalability: degree with which a solution is able to grow or evolve to
                  handle increased amounts of work.
                • Security: aspects of a solution that protect solution content or solution
                  components from accidental or malicious access, use, modification,
                  destruction, or disclosure.
                • Usability: ease with which a user can learn to use the solution.
                • Certification: constraints on the solution that are necessary to meet certain
                  standards or industry conventions.
                • Compliance: regulatory, financial, or legal constraints which can vary based
                  on the context or jurisdiction.
                • Localization: requirements dealing with local languages, laws, currencies,
                  cultures, spellings, and other characteristics of users, which requires
                  attention to the context.
                • Service Level Agreements: constraints of the organization being served
                  by the solution that are formally agreed to by both the provider and the
                  user of the solution.
                • Extensibility: the ability of a solution to incorporate new functionality.


                                         303
                                                                   Non-Functional Requirements Analysis                                                              Techniques

                                                                                          .2 Measurement of Non-Functional Requirements
                                                                                          Non-functional requirements often describe quality characteristics in vague terms,
                                                                                          such as “the process must be easy to learn", or “the system must respond
                                                                                          quickly”. To be useful to developers of a solution and to be verifiable, non-
                                                                                          functional requirements must be quantified whenever possible. Including an
                                                                                          appropriate measure of success provides the opportunity for verification.
                                                                                          For example:
                                                                                              • "The process must be easy to learn" can be expressed as "90% of
                                                                                                operators must be able to use the new process after no more than six hours
                                                                                                of training", and
                                                                                              • "The system must respond quickly" can be expressed as "The system must
                                                                                                provide 90% of responses in no more than two seconds".




Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                                                                                          Measurement of the other categories of non-functional requirements is guided by
                                                                                          the source of the requirement.
                                                                                          For example:
                                                                                              • certification requirements are generally specified in measurable detail by the
                                                                                                organization setting the standard or convention, such as ISO Certification
                                                                                                standards,
                                                                                              • compliance requirements and localization requirements are set in
                                                                                                measurable detail by their providers,
                                                                                              • effective service level agreements state clearly the measures of success
                                                                                                required, and
                                                                                              • an organization’s enterprise architecture generally defines the solution
                                                                                                environment requirements and specifies exactly which platform or other
                                                                                                attribute of the environment is required.

                                                                                          .3 Context of Non-Functional Requirements
                                                                                          Depending on the category of non-functional requirements, the context may
                                                                                          have to be considered. For example, a regulatory agency may impose context-
                                                                                          impacting compliance and security requirements, or an organization that is
                                                                                          expanding operations abroad may have to consider localization and scalability
                                                                                          requirements. Determining the optimal portfolio of non-functional requirements
                                                                                          in a given organizational context is central to delivering value to stakeholders.
                                                                                          The assessment of a non-functional requirement, such as localization or
                                                                                          maintainability, may impose contextual pressures on other non-functional
                                                                                          requirements. For instance, regulations or resources in one jurisdiction may affect
                                                                                          the maintainability of a solution in that region, and so it may justify a lower
                                                                                          performance efficiency or reliability measure of success than in another jurisdiction.
                                                                                          Context is dynamic by nature and non-functional requirements may need to be
                                                                                          adjusted or removed outright. Business analysts consider the relative stability of
                                                                                          the context when evaluating non-functional requirements.




                                                                                                                       304
Techniques                                                                            Observation

   10.30.4   Usage Considerations

             .1 Strengths
             • Clearly states the constraints that apply to a set of functional requirements.
             • Provides measurable expressions of how well the functional requirements must
               perform, leaving it to the functional requirements to express what the solution
               must do or how it must behave. This will also have a strong influence on
               whether the solution is accepted by the users.

             .2 Limitations
             • The clarity and usefulness of a non-functional requirement depends on what
               the stakeholders know about the needs for the solution and how well they can
               express those needs.




                                                                                                    Complimentary IIBA® Member Copy. Not for Distribution or Resale.
             • Expectations of multiple users may be quite different, and getting agreement
               on quality attributes may be difficult because of the users' subjective perception
               of quality. For example, what might be 'too fast' to one user might be 'too
               slow' to another.
             • A set of non-functional requirements may have inherent conflicts and require
               negotiation. For example, some security requirements may require
               compromises on performance requirements.
             • Overly strict requirements or constraints can add more time and cost to the
               solution, which may have negative impacts and weaken adoption by users.
             • Many non-functional requirements are qualitative and therefore may be
               difficult to be measured on a scale, and may garner a degree of subjectivity by
               the users as to how they believe the particular requirements ultimately meet
               their needs.