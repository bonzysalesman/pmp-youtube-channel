# Technique: Interface Analysis (10.24)

10.24        Interface Analysis
   10.24.1   Purpose
             Interface analysis is used to identify where, what, why, when, how, and for whom
             information is exchanged between solution components or across solution
             boundaries.

   10.24.2   Description
             An interface is a connection between two components or solutions. Most
             solutions require one or more interfaces to exchange information with other
             solution components, organizational units, or business processes.


                                          287
                                                                   Interface Analysis                                                                            Techniques

                                                                                        Interface types include:
                                                                                           • user interfaces, including human users directly interacting with the solution
                                                                                             within the organization,
                                                                                           • people external to the solution such as stakeholders or regulators,
                                                                                           • business processes,
                                                                                           • data interfaces between systems,
                                                                                           • application programming interfaces (APIs), and
                                                                                           • any hardware devices.
                                                                                        Interface analysis defines and clarifies the following:
                                                                                           • who will use the interface,




Complimentary IIBA® Member Copy. Not for Distribution or Resale.
                                                                                           • what information is being exchanged through the interface, as well as the
                                                                                             volume of the data,
                                                                                           • when information will be exchanged and how frequently,
                                                                                           • where the information exchange will occur,
                                                                                           • why the interface is needed, and
                                                                                           • how the interface is or should be implemented.
                                                                                        The early identification of interfaces allows the business analyst to provide the
                                                                                        context for eliciting more detailed stakeholder requirements, thus determining
                                                                                        adequate functional coverage of the solution to meet stakeholder needs. Early
                                                                                        identification of interfaces reveals which stakeholders will benefit from or
                                                                                        depend on the various components of the solution, which can help the business
                                                                                        analyst determine which stakeholders should be present for other elicitation
                                                                                        techniques.

                                                                                        Figure 10.24.1: Interface Analysis

                                                                                                                              Interface


                                                                                                              Input                               Output
                                                                                                                              Validation
                                                                                             Solution                             or                        Solution
                                                                                                            Message         Transformation        Message




                                                                       10.24.3          Elements

                                                                                        .1 Preparing for Identification
                                                                                        The business analyst can leverage other techniques, such as document analysis,
                                                                                        observation, scope modelling, and interviews, in order to understand which
                                                                                        interfaces need to be identified. A context diagram can reveal high-level


                                                                                                                      288
Techniques                                                                      Interface Analysis

             interfaces between human actors, organizational units, business processes, or
             other solution components. The results of this analysis can reveal how frequently
             any existing interfaces are being used and any problems with them that may
             strengthen the case for change. The results may also help identify any key issues
             that need to be resolved in order for an interface solution to be created.

             .2 Conduct Interface Identification
             Business analysts identify what interfaces are needed in the future state for each
             stakeholder or system that interacts with the system. The relationship between
             stakeholders and interfaces can be many-to-many or, in some cases, one-to-one.
             Some interfaces may be less obvious or less frequent such as an interface used
             for regulatory functions or auditing, or for employee training. Identified
             interfaces can include interfaces from solutions other than the operational
             solution.




                                                                                                     Complimentary IIBA® Member Copy. Not for Distribution or Resale.
             For each interface, business analysts:
                • describe the function of the interface,
                • assess the frequency of the interface usage,
                • evaluate which type of interface may be appropriate, and
                • elicit initial details about the interface.

             .3 Define Interfaces
             Requirements for an interface are primarily focused on describing the inputs to
             and outputs from that interface, any validation rules that govern those inputs and
             outputs, and events that might trigger interactions. There may be a large number
             of possible interaction types, each of which needs to be specified. Interactions
             may be triggered by the typical or alternate flow of inputs and outputs in the
             business solution, or by exceptional events such as failures.
             Business analysts consider who will use the interface, what information is passed
             over the interface, and when and where the interface takes place. The interface
             defines user workflow between systems, user roles and privileges, and any
             management objectives for the interface. Interface definition is dependent upon
             usability guidelines, such as accessibility requirements or general workflow
             requirements.
             In order to identify any major design issues, interfaces between solution or
             process components and people require detailed analysis of the interface to be
             conducted upfront. Interface definition includes:
                • the name of the interface,
                • the coverage or span of the interface,
                • the exchange method between the two entities,
                • the message format, and
                • the exchange frequency.


                                           289
                                                                   Interviews                                                                               Techniques

                                                                       10.24.4   Usage Considerations

                                                                                 .1 Strengths
                                                                                 • By engaging in interface analysis early on, increased functional coverage is
                                                                                   provided.
                                                                                 • Clear specification of the interfaces provides a structured means of allocating
                                                                                   requirements, business rules, and constraints to the solution.
                                                                                 • Due to its broad application, it avoids over analysis of fine detail.

                                                                                 .2 Limitations
                                                                                 • Does not provide insight into other aspects of the solution since the analysis
                                                                                   does not assess the internal components.




Complimentary IIBA® Member Copy. Not for Distribution or Resale.