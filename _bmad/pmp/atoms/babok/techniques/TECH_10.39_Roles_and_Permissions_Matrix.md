# Technique: Roles and Permissions Matrix (10.39)

10.39        Roles and Permissions Matrix
   10.39.1   Purpose
             A roles and permissions matrix is used to ensure coverage of activities by denoting
             responsibility, to identify roles, to discover missing roles, and to communicate




                                                                                                                                               Complimentary IIBA® Member Copy. Not for Distribution or Resale.
             results of a planned change.

   10.39.2   Description
             Role and permission allocation involves identifying roles, associating these with
             solution activities, and then denoting authorities who can perform these
             activities. A role is a label for a group of individuals who share common functions.
             Each function is portrayed as one or more solution activities. A single activity can
             be associated with one or more roles by designating authorities. Each individual
             that is assigned this authority can perform the associated activity.
             The following is an example of a roles and permissions matrix for a software
             system.

             Figure 10.39.1: Roles and Permissions Matrix




                                                               Administrator
                  Roles and Permissions

                                                                                                                   Customer
                                                Role Group 1                             Role Group 2
                                                                               Manager
                         Matrix
                                                                                                        Sales

              Activity

                         Create new account                        X             X                                   X

                         Modify account                            X             X                                   X

                         Create order                              X             X                       X           X

                         View reports                              X             X                       X

                         Create reports                            X             X                       X




                                              333
                                                                   Roles and Permissions Matrix                                                                        Techniques

                                                                       10.39.3             Elements

                                                                                           .1 Identifying Roles
                                                                                           To identify roles for either internal or external stakeholders, business analysts:
                                                                                                  • review any organizational models, job descriptions, procedure manuals, and
                                                                                                    system user guides, and
                                                                                                  • meet with stakeholders to uncover additional roles.
                                                                                           Through this review and discussion, the business analyst considers both that
                                                                                           individuals with the same job title may have different roles and that individuals
                                                                                           with different job titles may have the same roles.
                                                                                           When identifying roles, business analysts look for common functions that are
                                                                                           performed by individuals with similar needs.




Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                                                                                           .2 Identifying Activities
                                                                                           Business analysts frequently use functional decomposition to break down each
                                                                                           function into sub-parts, process modelling to better understand the workflow
                                                                                           and division of work among users, and use cases to represent tasks. By
                                                                                           performing these techniques, the business analyst can ensure that all functions
                                                                                           are accounted for and their activities are identified among various use case
                                                                                           scenarios.
                                                                                           There may be different levels of abstraction for roles and permission matrices
                                                                                           based on the business analysis perspective. Initiative level roles and responsibilities
                                                                                           may be identified in a RACI (Responsible, Accountable, Consulted, Informed)
                                                                                           matrix. Specific information technology system roles and responsibilities may be
                                                                                           identified in a CRUD (Create, Read, Update, and Delete) matrix.

                                                                                           .3 Identifying Authorities
                                                                                           Authorities are actions that identified roles are permitted to perform. For each
                                                                                           activity, the business analyst identifies the authorities for each role. When
                                                                                           identifying authorities, business analysts consider the level of security needed and
                                                                                           how the work flows through the process. Business analysts collaborate with
                                                                                           stakeholders to validate identified authorities.

                                                                                           .4 Refinements

                                                                                           Delegations

                                                                                           The business analyst may also identify which authorities can be delegated by one
                                                                                           individual to another on a short-term or permanent basis.

                                                                                           Inheritances

                                                                                           Stakeholders may request that when an individual is assigned an authority at an
                                                                                           organizational hierarchy level that this assignment pertain to only that user’s
                                                                                           organizational level and any subsidiary organizational unit levels.


                                                                                                                         334
Techniques                                                                       Root Cause Analysis

   10.39.4   Usage Considerations

             .1 Strengths
             • Provides procedural checks and balances, as well as data security, by restricting
               individuals from performing certain actions.
             • Promotes improved review of transaction history, in that audit logs can capture
               details about any assigned authorities at the time.
             • Provides documented roles and responsibilities for activities.

             .2 Limitations
             • Need to recognize the required level of detail for a specific initiative or activity;
               too much detail can be time-consuming and not provide value, too little detail




                                                                                                       Complimentary IIBA® Member Copy. Not for Distribution or Resale.
               can exclude necessary roles or responsibilities.